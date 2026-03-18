import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { generateBlobPath } from "../../animations/blob-generator";
import type { IconName } from "../../icons";
import { iconPaths } from "../../icons";
import { interpolatePath } from "./path-interpolate";

interface Props {
  color: string;
  bgColor: string;
  icon: IconName;
}

export const IconMorph: React.FC<Props> = ({ color, bgColor, icon }) => {
  const frame = useCurrentFrame();

  const blobPath = generateBlobPath({
    cx: 50,
    cy: 50,
    radius: 35,
    points: 8,
    randomness: 0.4,
    seed: 1,
  });

  const targetPath = iconPaths[icon];

  // Timeline: blob -> icon -> hold -> icon -> blob (loop-friendly)
  // Frames 0-60: blob wobble
  // Frames 60-120: morph to icon
  // Frames 120-180: hold on icon
  // Frames 180-240: morph back to blob
  // Frames 240-300: blob wobble

  const toIconProgress = interpolate(frame, [60, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const toBlobProgress = interpolate(frame, [180, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let currentPath: string;
  if (frame < 60) {
    // Blob wobble
    const blobPath2 = generateBlobPath({
      cx: 50, cy: 50, radius: 35, points: 8, randomness: 0.4, seed: 42,
    });
    const t = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
    currentPath = interpolatePath(blobPath, blobPath2, t);
  } else if (frame < 120) {
    // Morph to icon
    currentPath = interpolatePath(blobPath, targetPath, toIconProgress);
  } else if (frame < 180) {
    // Hold on icon
    currentPath = targetPath;
  } else if (frame < 240) {
    // Morph back to blob
    currentPath = interpolatePath(targetPath, blobPath, toBlobProgress);
  } else {
    // Blob wobble
    const blobPath2 = generateBlobPath({
      cx: 50, cy: 50, radius: 35, points: 8, randomness: 0.4, seed: 7,
    });
    const t = interpolate(frame, [240, 300], [0, 1], { extrapolateRight: "clamp" });
    currentPath = interpolatePath(blobPath, blobPath2, t);
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 100 100" width={500} height={500}>
        <path d={currentPath} fill={color} />
      </svg>
    </AbsoluteFill>
  );
};
