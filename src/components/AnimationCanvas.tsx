import { useRef, useEffect, useCallback, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import {
  createDotScaleMorphAnimation,
  createIdleWobble,
  type IconConfig,
  type AnimationController,
} from "../animations/blob-morph";
import { generateAnimatedBlobPath } from "../animations/blob-generator";
import type { IconName } from "../icons";
import { iconPaths, iconTypes, iconOrder } from "../icons";
import { logoPaths } from "../icons/logo";

gsap.registerPlugin(MorphSVGPlugin);

export type BlobStyle = "bubble" | "flash";

export interface AnimationParams {
  icon: IconName;
  cycleIcons: IconName[];
  blobStyle: BlobStyle;
  speed: number;
  color: string;
  secondaryColor: string;
  bgColor: string;
  strokeWidth: number;
  blobPoints: number;
  ease: string;
  pauseDuration: number;
  size: number;
  mode: "morph" | "wobble" | "cycle";
}

interface Props {
  params: AnimationParams;
}

function isDark(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// Heatpump BODY only — fan blades removed (they exist as spinning overlay)
const HEATPUMP_SVG_MARKUP = `
<g transform="translate(8, 15) scale(0.7, 0.875)">
  <rect x="5" y="5" width="110" height="70" rx="5" ry="5"/>
  <path d="M 10 25 L 10 10 L 25 10"/>
  <line x1="75" y1="5" x2="75" y2="75"/>
  <rect x="85" y="15" width="20" height="18" rx="3" ry="3"/>
  <line x1="85" y1="45" x2="105" y2="45"/>
  <line x1="85" y1="52" x2="105" y2="52"/>
  <line x1="85" y1="59" x2="105" y2="59"/>
  <line x1="85" y1="66" x2="105" y2="66"/>
  <line x1="85" y1="73" x2="105" y2="73"/>
  <rect x="25" y="75" width="10" height="3" rx="1" ry="1"/>
  <rect x="75" y="75" width="10" height="3" rx="1" ry="1"/>
  <circle cx="40" cy="40" r="28"/>
</g>
`;

const PV_SVG_MARKUP = `
<path d="M30 35H70L80 65H20L30 35Z"/>
<line x1="43.3" y1="35" x2="40" y2="65"/>
<line x1="56.7" y1="35" x2="60" y2="65"/>
<line x1="26.6" y1="45" x2="73.4" y2="45"/>
<line x1="23.3" y1="55" x2="76.7" y2="55"/>
`;

// Fan center in transformed coordinates: (40*0.7+8, 40*0.875+15) = (36, 50)
const FAN_CX = 36;
const FAN_CY = 50;
// Scale factors for blade geometry: x*0.7, y*0.875
// Original blade: "M 0 0 C 6 -10, 10 -15, 0 -24 C -10 -15, -6 -10, 0 0 Z"
// Scaled blade offsets:
const BX = 0.7;  // x scale
const BY = 0.875; // y scale

function fanBlade(angle: number): string {
  // Original blade path relative to center, then rotate
  // We compute the 4 rotations manually for 0, 90, 180, 270 degrees
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);

  // Original control points (relative to center):
  // C 6,-10  10,-15  0,-24  C -10,-15  -6,-10  0,0
  const pts = [
    [6 * BX, -10 * BY],
    [10 * BX, -15 * BY],
    [0, -24 * BY],
    [-10 * BX, -15 * BY],
    [-6 * BX, -10 * BY],
    [0, 0],
  ];

  const rot = (x: number, y: number) => [
    FAN_CX + x * cos - y * sin,
    FAN_CY + x * sin + y * cos,
  ];

  const [c1x, c1y] = rot(pts[0][0], pts[0][1]);
  const [c2x, c2y] = rot(pts[1][0], pts[1][1]);
  const [p1x, p1y] = rot(pts[2][0], pts[2][1]);
  const [c3x, c3y] = rot(pts[3][0], pts[3][1]);
  const [c4x, c4y] = rot(pts[4][0], pts[4][1]);

  return `M ${FAN_CX} ${FAN_CY} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p1x.toFixed(1)} ${p1y.toFixed(1)} C ${c3x.toFixed(1)} ${c3y.toFixed(1)}, ${c4x.toFixed(1)} ${c4y.toFixed(1)}, ${FAN_CX} ${FAN_CY} Z`;
}

function convertSvgElementsToCompoundPath(containerEl: SVGElement): string {
  try {
    MorphSVGPlugin.convertToPath(
      containerEl.querySelectorAll("rect, line, circle, polyline, polygon, ellipse")
    );
    const paths = containerEl.querySelectorAll("path");
    return Array.from(paths)
      .map((p) => p.getAttribute("d"))
      .filter(Boolean)
      .join(" ");
  } catch (e) {
    console.warn("Path conversion failed:", e);
    return "M50 15 A35 35 0 1 1 49.99 15 Z";
  }
}

export function AnimationCanvas({ params }: Props) {
  const mainPathRef = useRef<SVGPathElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const overlayPathRef = useRef<SVGPathElement>(null);
  const heatpumpFanRef = useRef<SVGGElement>(null);
  const animationRef = useRef<AnimationController | null>(null);
  const heatpumpContainerRef = useRef<SVGGElement>(null);
  const pvContainerRef = useRef<SVGGElement>(null);
  const [convertedPaths, setConvertedPaths] = useState<Record<string, string>>({});
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      const result: Record<string, string> = {};
      if (heatpumpContainerRef.current) {
        result.heatpump = convertSvgElementsToCompoundPath(heatpumpContainerRef.current);
      }
      if (pvContainerRef.current) {
        result.pv = convertSvgElementsToCompoundPath(pvContainerRef.current);
      }
      setConvertedPaths(result);
    });
  }, []);

  const getIconPath = useCallback(
    (icon: IconName): string => {
      const staticPath = iconPaths[icon];
      if (staticPath) return staticPath;
      return convertedPaths[icon] || "M50 15 A35 35 0 1 1 49.99 15 Z";
    },
    [convertedPaths]
  );

  const buildIconConfigs = useCallback(
    (icons: IconName[]): IconConfig[] => {
      return icons.map((name) => ({
        path: getIconPath(name),
        name,
        type: iconTypes[name],
        hasOverlay: name === "logo",
        hasFan: name === "heatpump",
      }));
    },
    [getIconPath]
  );

  const startAnimation = useCallback(() => {
    if (!mainPathRef.current || !groupRef.current) return;

    animationRef.current?.destroy();
    setPaused(false);

    const mainPath = mainPathRef.current;
    const groupEl = groupRef.current;
    const overlayPath = overlayPathRef.current ?? undefined;
    const heatpumpFanEl = heatpumpFanRef.current ?? undefined;

    if (params.mode === "wobble") {
      animationRef.current = createIdleWobble(mainPath, groupEl, {
        speed: params.speed,
        points: params.blobPoints,
      });
    } else {
      const iconList = params.mode === "cycle"
        ? (params.cycleIcons.length > 0 ? params.cycleIcons : iconOrder)
        : [params.icon];
      const iconConfigs = buildIconConfigs(iconList);
      animationRef.current = createDotScaleMorphAnimation(
        { mainPath, groupEl, overlayPath, heatpumpFanEl },
        iconConfigs,
        {
          speed: params.speed,
          blobPoints: params.blobPoints,
          ease: params.ease,
          pauseDuration: params.pauseDuration,
          color: params.color,
          blobStyle: params.blobStyle,
        }
      );
    }
  }, [params, getIconPath, buildIconConfigs]);

  useEffect(() => {
    startAnimation();
    return () => {
      animationRef.current?.destroy();
    };
  }, [startAnimation]);

  // Auto-pause when tab is hidden to prevent position drift
  useEffect(() => {
    const handleVisibility = () => {
      const ctrl = animationRef.current;
      if (!ctrl) return;
      if (document.hidden) {
        if (!ctrl.isPaused()) {
          ctrl.pause();
          // Mark as auto-paused (not user-paused) so we auto-resume
          (ctrl as Record<string, unknown>)._autoPaused = true;
        }
      } else {
        if ((ctrl as Record<string, unknown>)._autoPaused) {
          ctrl.resume();
          (ctrl as Record<string, unknown>)._autoPaused = false;
          setPaused(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const togglePause = () => {
    if (!animationRef.current) return;
    if (paused) {
      animationRef.current.resume();
      setPaused(false);
    } else {
      animationRef.current.pause();
      setPaused(true);
    }
  };

  const initialBlob = generateAnimatedBlobPath(0, { points: params.blobPoints });
  const dark = isDark(params.bgColor);

  return (
    <div
      className="relative flex items-center justify-center w-full h-full min-h-[400px] transition-colors duration-300"
      style={{ backgroundColor: params.bgColor }}
    >
      <DotGrid dark={dark} />

      {/* Pause/Resume button */}
      <button
        onClick={togglePause}
        className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        style={{
          backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          color: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
        }}
      >
        {paused ? "Resume" : "Pause"}
      </button>

      {/* Hidden SVGs for runtime path conversion */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <g ref={heatpumpContainerRef} dangerouslySetInnerHTML={{ __html: HEATPUMP_SVG_MARKUP }} />
        <g ref={pvContainerRef} dangerouslySetInnerHTML={{ __html: PV_SVG_MARKUP }} />
      </svg>

      {/* Main animation SVG */}
      <svg
        viewBox="0 0 100 100"
        width={params.size}
        height={params.size}
        className="relative z-10"
        overflow="visible"
      >
        <g ref={groupRef}>
          <path
            ref={mainPathRef}
            d={initialBlob}
            fill={params.color}
            stroke="none"
            strokeWidth={0}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Logo lightning bolt overlay — scales in with the icon */}
          <path
            ref={overlayPathRef}
            d={logoPaths.lightning}
            fill={params.secondaryColor}
            opacity={0}
          />

          {/* Heatpump spinning fan overlay — blades only */}
          <g ref={heatpumpFanRef} opacity={0}>
            <g
              className="fan-spin"
              style={{ transformOrigin: `${FAN_CX}px ${FAN_CY}px` }}
            >
              <path d={fanBlade(0)} fill={params.color} />
              <path d={fanBlade(90)} fill={params.color} />
              <path d={fanBlade(180)} fill={params.color} />
              <path d={fanBlade(270)} fill={params.color} />
            </g>
            <circle cx={FAN_CX} cy={FAN_CY} r={2} fill={params.color} />
          </g>
        </g>
      </svg>
    </div>
  );
}

function DotGrid({ dark }: { dark: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle, ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    />
  );
}
