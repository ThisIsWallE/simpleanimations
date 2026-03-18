import { AbsoluteFill, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { generateAnimatedBlobPath, generateBlobPath } from "../../animations/blob-generator";
import { flashPath } from "../../icons/flash";
import { logoPaths } from "../../icons/logo";
import type { IconName } from "../../icons";
import { iconStaticPaths, iconOrder, iconTypes } from "../../icons";
import { interpolate as flubberInterpolate } from "flubber";

interface Props {
  color: string;
  secondaryColor?: string;
  bgColor: string;
  icon: IconName;
  speed?: number;
  blobPoints?: number;
  mode?: "morph" | "wobble" | "cycle" | "fast-cycle";
  blobStyle?: "bubble" | "flash";
  cycleIcons?: IconName[];
  pauseDuration?: number;
}

// --- Helpers ---

/** Get the resting shape: animated blob or static flash */
function getRestingPath(
  time: number,
  blobStyle: "bubble" | "flash",
  blobPoints: number,
): string {
  if (blobStyle === "flash") return flashPath;
  return generateAnimatedBlobPath(time, {
    points: blobPoints,
    amplitude: 0.25,
    speed: 1.2,
  });
}

/** Get a frozen resting shape at a specific time */
function getFrozenRestingPath(
  atTime: number,
  blobStyle: "bubble" | "flash",
  blobPoints: number,
): string {
  if (blobStyle === "flash") return flashPath;
  return generateAnimatedBlobPath(atTime, {
    points: blobPoints,
    amplitude: 0.25,
    speed: 1.2,
  });
}

/** Safe flubber interpolate that handles identical paths */
function morphBetween(from: string, to: string, t: number): string {
  if (t <= 0) return from;
  if (t >= 1) return to;
  const interpolator = flubberInterpolate(from, to, { maxSegmentLength: 2 });
  return interpolator(t);
}

// --- Phase types ---

type PhaseInfo = {
  path: string;
  scale: number;
  /** Which icon is currently being shown (null during blob/resting phases) */
  currentIcon: IconName | null;
  /** 0 = fully blob, 1 = fully icon (for overlay fade) */
  iconVisibility: number;
};

// --- Mode renderers ---

function renderMorphCycle(
  frame: number,
  fps: number,
  time: number,
  icons: IconName[],
  speed: number,
  pauseDur: number,
  blobStyle: "bubble" | "flash",
  blobPoints: number,
): PhaseInfo {
  const expandDur = 0.8;
  const morphDur = speed;
  const shrinkDur = Math.max(speed * 0.7, 0.8);
  const cycleDur = expandDur + morphDur + pauseDur + shrinkDur;

  const totalTime = time;
  const cycleIndex = Math.floor(totalTime / cycleDur);
  const cycleTime = totalTime - cycleIndex * cycleDur;
  const iconIdx = cycleIndex % icons.length;
  const iconName = icons[iconIdx];
  const targetPath = iconStaticPaths[iconName];

  const expandEnd = expandDur;
  const morphEnd = expandEnd + morphDur;
  const holdEnd = morphEnd + pauseDur;

  const cycleStartTime = cycleIndex * cycleDur;
  const blobAtMorphStart = getFrozenRestingPath(cycleStartTime + expandEnd, blobStyle, blobPoints);
  const blobAtShrinkEnd = getFrozenRestingPath(cycleStartTime + cycleDur, blobStyle, blobPoints);

  let path: string;
  let scale: number;
  let iconVisibility = 0;

  if (cycleTime < expandEnd) {
    path = getRestingPath(time, blobStyle, blobPoints);
    const t = cycleTime / expandEnd;
    scale = 0.08 + (1 - 0.08) * Easing.out(Easing.sin)(t);
  } else if (cycleTime < morphEnd) {
    const t = (cycleTime - expandEnd) / morphDur;
    const eased = Easing.inOut(Easing.quad)(t);
    path = morphBetween(blobAtMorphStart, targetPath, eased);
    scale = 1;
    iconVisibility = eased;
  } else if (cycleTime < holdEnd) {
    path = targetPath;
    scale = 1;
    iconVisibility = 1;
  } else {
    const t = (cycleTime - holdEnd) / shrinkDur;
    const eased = Easing.inOut(Easing.quad)(t);
    path = morphBetween(targetPath, blobAtShrinkEnd, eased);
    scale = 1 + (0.08 - 1) * Easing.in(Easing.sin)(t);
    iconVisibility = 1 - eased;
  }

  return { path, scale, currentIcon: iconName, iconVisibility };
}

function renderFastCycle(
  frame: number,
  fps: number,
  time: number,
  icons: IconName[],
  speed: number,
  blobStyle: "bubble" | "flash",
  blobPoints: number,
): PhaseInfo {
  const shrinkDur = speed * 0.3;
  const expandDur = speed * 0.3;
  const holdDur = Math.max(speed * 0.15, 0.1);
  const cycleDur = shrinkDur + expandDur + holdDur;

  const minScale = 0.12;

  const intermediary = blobStyle === "flash"
    ? flashPath
    : generateBlobPath({ points: blobPoints, randomness: 0.3, seed: 42 });

  if (time < holdDur) {
    return { path: iconStaticPaths[icons[0]], scale: 1, currentIcon: icons[0], iconVisibility: 1 };
  }

  const cycleTime = time - holdDur;
  const cycleIndex = Math.floor(cycleTime / cycleDur);
  const t = cycleTime - cycleIndex * cycleDur;

  const currentIcon = icons[cycleIndex % icons.length];
  const nextIcon = icons[(cycleIndex + 1) % icons.length];
  const currentPath = iconStaticPaths[currentIcon];
  const nextPath = iconStaticPaths[nextIcon];

  const shrinkEnd = shrinkDur;
  const expandEnd = shrinkEnd + expandDur;

  let path: string;
  let scale: number;
  let shownIcon: IconName;
  let iconVisibility: number;

  if (t < shrinkEnd) {
    const p = t / shrinkDur;
    const eased = Easing.inOut(Easing.quad)(p);
    path = morphBetween(currentPath, intermediary, eased);
    scale = 1 + (minScale - 1) * Easing.in(Easing.sin)(p);
    shownIcon = currentIcon;
    iconVisibility = 1 - eased;
  } else if (t < expandEnd) {
    const p = (t - shrinkEnd) / expandDur;
    const eased = Easing.inOut(Easing.quad)(p);
    path = morphBetween(intermediary, nextPath, eased);
    scale = minScale + (1 - minScale) * Easing.out(Easing.sin)(p);
    shownIcon = nextIcon;
    iconVisibility = eased;
  } else {
    path = nextPath;
    scale = 1;
    shownIcon = nextIcon;
    iconVisibility = 1;
  }

  return { path, scale, currentIcon: shownIcon, iconVisibility };
}

// --- Main component ---

export const IconMorph: React.FC<Props> = ({
  color,
  secondaryColor = "#FFFFFF",
  bgColor,
  icon,
  speed = 2,
  blobPoints = 8,
  mode = "morph",
  blobStyle = "bubble",
  cycleIcons = [],
  pauseDuration = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  let result: PhaseInfo;

  if (mode === "wobble") {
    result = {
      path: getRestingPath(time, blobStyle, blobPoints),
      scale: 1,
      currentIcon: null,
      iconVisibility: 0,
    };
  } else if (mode === "fast-cycle") {
    const icons = cycleIcons.length > 0 ? cycleIcons : iconOrder;
    result = renderFastCycle(frame, fps, time, icons, speed, blobStyle, blobPoints);
  } else {
    const icons = mode === "cycle"
      ? (cycleIcons.length > 0 ? cycleIcons : iconOrder)
      : [icon];
    result = renderMorphCycle(frame, fps, time, icons, speed, pauseDuration, blobStyle, blobPoints);
  }

  const { path: currentPath, scale, currentIcon, iconVisibility } = result;

  // Determine render mode: stroke icons use stroke, fill icons use fill
  // During morphing (partial visibility), use fill since the morph shape is a filled blob
  const isStrokeIcon = currentIcon && iconTypes[currentIcon] === "stroke" && iconVisibility > 0.8;

  // Logo overlay: lightning bolt with secondary color
  const showLogoOverlay = currentIcon === "logo" && iconVisibility > 0;
  const overlayOpacity = Math.max(0, (iconVisibility - 0.6) / 0.4); // fade in during last 40% of morph

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 100 100" width="50%" height="50%">
        <g transform={`translate(50, 50) scale(${scale}) translate(-50, -50)`}>
          {isStrokeIcon ? (
            <path
              d={currentPath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path d={currentPath} fill={color} />
          )}

          {/* Logo lightning bolt overlay */}
          {showLogoOverlay && (
            <path
              d={logoPaths.lightning}
              fill={secondaryColor}
              opacity={overlayOpacity}
              transform={`translate(${50 * (1 - overlayOpacity)}, ${50 * (1 - overlayOpacity)}) scale(${overlayOpacity})`}
              style={{ transformOrigin: "50px 55px" }}
            />
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
