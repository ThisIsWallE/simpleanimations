import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { generateBlobPath } from "../../animations/blob-generator";
import { logoPaths } from "../../icons/logo";
import { interpolatePath } from "./path-interpolate";

interface Props {
  color: string;
  bgColor: string;
}

export const LogoIntro: React.FC<Props> = ({ color, bgColor }) => {
  const frame = useCurrentFrame();

  const blobPath = generateBlobPath({
    cx: 50,
    cy: 50,
    radius: 35,
    points: 8,
    randomness: 0.4,
    seed: 1,
  });

  const hexPath = logoPaths.hexagon;
  const lightningPath = logoPaths.lightning;

  // Phase 1: Blob wobble (frames 0-30)
  // Phase 2: Blob -> Hexagon morph (frames 30-75)
  // Phase 3: Lightning appears (frames 75-105)
  // Phase 4: Hold (frames 105-150)

  const morphProgress = interpolate(frame, [30, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lightningOpacity = interpolate(frame, [75, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lightningScale = interpolate(frame, [75, 100], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blob wobble in early frames
  const wobblePhase = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blobPath2 = generateBlobPath({
    cx: 50,
    cy: 50,
    radius: 35,
    points: 8,
    randomness: 0.4,
    seed: 42,
  });

  // Determine which path to show
  let currentPath: string;
  if (frame < 30) {
    // Wobble between two blobs
    currentPath = interpolatePath(blobPath, blobPath2, wobblePhase);
  } else {
    // Morph blob -> hexagon
    currentPath = interpolatePath(blobPath2, hexPath, morphProgress);
  }

  // Overall scale-in
  const scale = interpolate(frame, [0, 15], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={500}
        height={500}
        style={{ transform: `scale(${scale})` }}
      >
        <path d={currentPath} fill={color} />
        <path
          d={lightningPath}
          fill="white"
          opacity={lightningOpacity}
          transform={`translate(${50 * (1 - lightningScale)}, ${50 * (1 - lightningScale)}) scale(${lightningScale})`}
          style={{ transformOrigin: "50px 50px" }}
        />
      </svg>
    </AbsoluteFill>
  );
};
