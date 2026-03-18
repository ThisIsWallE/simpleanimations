import { useState } from "react";
import type { AnimationParams, BlobStyle } from "./AnimationCanvas";
import type { IconName } from "../icons";
import { iconLabels, iconOrder } from "../icons";
import { brandColors } from "../lib/colors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const easeOptions = [
  { label: "Power 2 InOut", value: "power2.inOut" },
  { label: "Elastic Out", value: "elastic.out(1, 0.5)" },
  { label: "Sine InOut", value: "sine.inOut" },
  { label: "Back InOut", value: "back.inOut(1.5)" },
  { label: "Bounce Out", value: "bounce.out" },
  { label: "Linear", value: "none" },
];

const defaultParams: AnimationParams = {
  icon: "logo",
  cycleIcons: [...iconOrder],
  blobStyle: "bubble",
  speed: 2,
  color: brandColors.primary,
  secondaryColor: "#FFFFFF",
  bgColor: "#fafafa",
  strokeWidth: 0,
  blobPoints: 8,
  ease: "power2.inOut",
  pauseDuration: 0.5,
  size: 250,
  mode: "morph",
};

export function useSidebarControls() {
  const [params, setParams] = useState<AnimationParams>(defaultParams);

  const update = <K extends keyof AnimationParams>(
    key: K,
    value: AnimationParams[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return { params, update };
}

interface Props {
  params: AnimationParams;
  onUpdate: <K extends keyof AnimationParams>(key: K, value: AnimationParams[K]) => void;
}

export function Sidebar({ params, onUpdate }: Props) {
  const isCycle = params.mode === "cycle" || params.mode === "fast-cycle";
  const isWobble = params.mode === "wobble";

  const handleIconClick = (name: IconName) => {
    if (isWobble) return;
    if (isCycle) {
      const current = params.cycleIcons;
      if (current.includes(name)) {
        if (current.length > 1) {
          onUpdate("cycleIcons", current.filter((n) => n !== name));
        }
      } else {
        onUpdate("cycleIcons", [...current, name]);
      }
    } else {
      onUpdate("icon", name);
    }
  };

  return (
    <aside className="w-80 h-screen overflow-y-auto border-r border-gray-200 bg-[#fafafa] flex-shrink-0">
      <div className="px-5 py-4 border-b border-gray-200">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Simplestrom / Animations
        </h1>
      </div>

      <div className="p-5 space-y-6">
        <Section title="Animation">
          <Field label="Mode">
            <Select
              value={params.mode}
              onValueChange={(val) => onUpdate("mode", val as AnimationParams["mode"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morph">Blob → Icon Morph</SelectItem>
                <SelectItem value="cycle">Cycle Selected</SelectItem>
                <SelectItem value="fast-cycle">Fast Cycle</SelectItem>
                <SelectItem value="wobble">Idle Wobble</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Blob Style">
            <Select
              value={params.blobStyle}
              onValueChange={(val) => onUpdate("blobStyle", val as BlobStyle)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bubble">Bubble</SelectItem>
                <SelectItem value="flash">Flash</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Easing">
            <Select
              value={params.ease}
              onValueChange={(val) => onUpdate("ease", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {easeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Icon grid — 2 columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-600">
                {isCycle ? "Icons to cycle" : "Icon"}
              </label>
              {isCycle && (
                <span className="text-[10px] text-gray-400">
                  {params.cycleIcons.length} selected
                </span>
              )}
            </div>
            <div
              className="grid grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden"
              style={isWobble ? { opacity: 0.4, pointerEvents: "none" } : undefined}
            >
              {iconOrder.map((name, idx) => {
                const isActive = isCycle
                  ? params.cycleIcons.includes(name)
                  : params.icon === name;
                return (
                  <button
                    key={name}
                    onClick={() => handleIconClick(name)}
                    className={`px-3 py-2.5 text-xs text-center transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white font-medium"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    } ${idx % 2 === 0 ? "border-r border-gray-200" : ""} ${
                      idx < iconOrder.length - 2 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    {iconLabels[name].replace("Simplestrom ", "")}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Speed" valueDisplay={params.speed.toFixed(1)}>
            <input
              type="range"
              min={0.3}
              max={8}
              step={0.1}
              value={params.speed}
              onChange={(e) => onUpdate("speed", parseFloat(e.target.value))}
              className="slider-input"
            />
          </Field>

          {params.mode !== "fast-cycle" && (
            <Field label="Pause" valueDisplay={params.pauseDuration.toFixed(1) + "s"}>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={params.pauseDuration}
                onChange={(e) => onUpdate("pauseDuration", parseFloat(e.target.value))}
                className="slider-input"
              />
            </Field>
          )}
        </Section>

        <Section title="Blob">
          <Field label="Complexity" valueDisplay={params.blobPoints.toString()}>
            <input
              type="range"
              min={4}
              max={16}
              step={1}
              value={params.blobPoints}
              onChange={(e) => onUpdate("blobPoints", parseInt(e.target.value))}
              className="slider-input"
            />
          </Field>
        </Section>

        <Section title="Appearance">
          <Field label="Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={params.color}
                onChange={(e) => onUpdate("color", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500 font-mono">{params.color}</span>
            </div>
          </Field>

          <Field label="Secondary">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={params.secondaryColor}
                onChange={(e) => onUpdate("secondaryColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500 font-mono">{params.secondaryColor}</span>
            </div>
          </Field>

          <Field label="Background">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={params.bgColor}
                onChange={(e) => onUpdate("bgColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500 font-mono">{params.bgColor}</span>
            </div>
          </Field>

          <Field label="Stroke" valueDisplay={params.strokeWidth.toFixed(1)}>
            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={params.strokeWidth}
              onChange={(e) => onUpdate("strokeWidth", parseFloat(e.target.value))}
              className="slider-input"
            />
          </Field>

          <Field label="Size" valueDisplay={params.size.toString()}>
            <input
              type="range"
              min={50}
              max={600}
              step={10}
              value={params.size}
              onChange={(e) => onUpdate("size", parseInt(e.target.value))}
              className="slider-input"
            />
          </Field>
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {title}
        </span>
        <span className="text-gray-400 text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

function Field({
  label,
  valueDisplay,
  children,
}: {
  label: string;
  valueDisplay?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{label}</label>
        {valueDisplay && (
          <span className="text-xs text-gray-400 font-mono">{valueDisplay}</span>
        )}
      </div>
      {children}
    </div>
  );
}
