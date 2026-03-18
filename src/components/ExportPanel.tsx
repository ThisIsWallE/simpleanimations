import { useState } from "react";
import type { AnimationParams } from "./AnimationCanvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  params: AnimationParams;
  dark?: boolean;
}

const resolutionPresets = [
  { label: "1080\u00d71080", w: 1080, h: 1080 },
  { label: "1920\u00d71080", w: 1920, h: 1080 },
  { label: "720\u00d7720", w: 720, h: 720 },
];

export function ExportPanel({ params, dark = false }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);

  // Video export state
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState(30);
  const [outputDir, setOutputDir] = useState("out/");
  const [filename, setFilename] = useState("export.mp4");

  const embedCode = generateEmbedCode(params);
  const reactCode = generateReactCode(params);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const frames = Math.round(duration * fps);
  const dir = outputDir.endsWith("/") ? outputDir.slice(0, -1) : outputDir;
  const paramsJson = JSON.stringify({
    color: params.color,
    secondaryColor: params.secondaryColor,
    bgColor: params.bgColor,
    icon: params.icon,
    speed: params.speed,
    blobPoints: params.blobPoints,
    mode: params.mode,
    blobStyle: params.blobStyle,
    cycleIcons: params.cycleIcons,
    pauseDuration: params.pauseDuration,
    ease: params.ease,
    strokeWidth: params.strokeWidth,
    size: params.size,
  });
  const exportCommand = `node scripts/capture-video.mjs --width ${width} --height ${height} --fps ${fps} --duration ${duration} --output ${dir}/${filename} --params '${paramsJson}'`;

  // Dark-aware style tokens
  const label = dark ? "text-gray-400" : "text-gray-500";
  const sublabel = dark ? "text-gray-500" : "text-gray-400";
  const inputCls = `w-full text-xs px-2 py-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
    dark
      ? "bg-white/10 border-white/15 text-white placeholder-gray-500"
      : "bg-white border-gray-200 text-gray-900"
  }`;
  const numberCls = `w-20 text-xs px-2 py-1.5 rounded border text-center focus:outline-none focus:ring-1 focus:ring-blue-400 ${
    dark
      ? "bg-white/10 border-white/15 text-white"
      : "bg-white border-gray-200 text-gray-900"
  }`;
  const preCls = `text-xs p-2 rounded overflow-x-auto border ${
    dark
      ? "bg-white/5 border-white/10 text-gray-300"
      : "bg-gray-50 border-gray-200 text-gray-800"
  }`;
  const copyBtnCls = dark
    ? "text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
    : "text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100";
  const dividerCls = dark ? "border-white/10" : "border-gray-200";

  return (
    <div className="space-y-4">
      {/* Collapsible Embed Code Section */}
      <div>
        <button
          onClick={() => setShowEmbed(!showEmbed)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className={`text-xs ${label}`}>Embed Code</span>
          <span className={`text-xs ${sublabel}`}>{showEmbed ? "−" : "+"}</span>
        </button>
        {showEmbed && (
          <div className="mt-2 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${sublabel}`}>HTML</span>
                <button onClick={() => copyToClipboard(embedCode, "html")} className={copyBtnCls}>
                  {copied === "html" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className={`${preCls} max-h-32`}>{embedCode}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${sublabel}`}>React</span>
                <button onClick={() => copyToClipboard(reactCode, "react")} className={copyBtnCls}>
                  {copied === "react" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className={`${preCls} max-h-32`}>{reactCode}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Video Export Section */}
      <div className={`pt-3 border-t ${dividerCls} space-y-3`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${label}`}>
          Video Export
        </span>

        {/* Resolution */}
        <div>
          <label className={`text-xs ${label} mb-1 block`}>Resolution</label>
          <div className="flex gap-1 mb-2">
            {resolutionPresets.map((p) => {
              const active = width === p.w && height === p.h;
              return (
                <button
                  key={p.label}
                  onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    active
                      ? dark
                        ? "bg-white text-gray-900 border-white"
                        : "bg-gray-900 text-white border-gray-900"
                      : dark
                        ? "bg-white/10 text-gray-300 border-white/15 hover:bg-white/15"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
              className={numberCls}
            />
            <span className={`text-xs ${sublabel}`}>&times;</span>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
              className={numberCls}
            />
            <span className={`text-[10px] ${sublabel}`}>px</span>
          </div>
        </div>

        {/* Duration & FPS */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={`text-xs ${label} mb-1 block`}>Duration (s)</label>
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className={inputCls}
            />
            <span className={`text-[10px] ${sublabel} mt-0.5 block`}>
              {frames} frames
            </span>
          </div>
          <div className="flex-1">
            <label className={`text-xs ${label} mb-1 block`}>FPS</label>
            <Select value={String(fps)} onValueChange={(v) => setFps(Number(v))}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Output */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={`text-xs ${label} mb-1 block`}>Directory</label>
            <input
              type="text"
              value={outputDir}
              onChange={(e) => setOutputDir(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className={`text-xs ${label} mb-1 block`}>Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Generated Command */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${label}`}>Command</span>
            <button onClick={() => copyToClipboard(exportCommand, "cmd")} className={copyBtnCls}>
              {copied === "cmd" ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className={`${preCls} whitespace-pre-wrap break-all`}>
            {exportCommand}
          </pre>
        </div>
      </div>
    </div>
  );
}

function generateEmbedCode(params: AnimationParams): string {
  return `<iframe
  src="${window.location.origin}?icon=${params.icon}&color=${encodeURIComponent(params.color)}&speed=${params.speed}&mode=${params.mode}"
  width="${params.size}"
  height="${params.size}"
  frameborder="0"
  style="border:none;"
></iframe>`;
}

function generateReactCode(params: AnimationParams): string {
  return `// npm install gsap @gsap/react
import { SimplestromAnimation } from "simpleanimations";

<SimplestromAnimation
  icon="${params.icon}"
  color="${params.color}"
  speed={${params.speed}}
  size={${params.size}}
  mode="${params.mode}"
/>`;
}
