import { useState } from "react";
import type { AnimationParams } from "./AnimationCanvas";

interface Props {
  params: AnimationParams;
}

export function ExportPanel({ params }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const embedCode = generateEmbedCode(params);
  const reactCode = generateReactCode(params);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">HTML Embed</span>
          <button
            onClick={() => copyToClipboard(embedCode, "html")}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            {copied === "html" ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-32 border">
          {embedCode}
        </pre>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">React Component</span>
          <button
            onClick={() => copyToClipboard(reactCode, "react")}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            {copied === "react" ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-32 border">
          {reactCode}
        </pre>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-400">
          For MP4 export, run:{" "}
          <code className="bg-gray-100 px-1 rounded">npm run remotion:render</code>
        </p>
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
