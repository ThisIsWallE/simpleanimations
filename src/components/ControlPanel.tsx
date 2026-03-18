import { useControls, folder, button } from "leva";
import { brandColors, presetColors } from "../lib/colors";
import type { AnimationParams } from "./AnimationCanvas";
import type { IconName } from "../icons";
import { iconLabels } from "../icons";

const iconOptions = Object.fromEntries(
  Object.entries(iconLabels).map(([key, label]) => [label, key])
) as Record<string, IconName>;

export function useAnimationControls(): AnimationParams {
  const values = useControls({
    Animation: folder({
      mode: {
        value: "morph" as "morph" | "wobble",
        options: { "Blob → Icon Morph": "morph", "Idle Wobble": "wobble" },
      },
      icon: {
        value: "logo" as IconName,
        options: iconOptions,
      },
      speed: { value: 2, min: 0.3, max: 8, step: 0.1 },
      ease: {
        value: "power2.inOut",
        options: {
          "Power 2 InOut": "power2.inOut",
          "Elastic Out": "elastic.out(1, 0.5)",
          "Sine InOut": "sine.inOut",
          "Back InOut": "back.inOut(1.5)",
          "Bounce Out": "bounce.out",
          Linear: "none",
        },
      },
      pauseDuration: { value: 0.5, min: 0, max: 3, step: 0.1, label: "Pause" },
    }),
    Blob: folder({
      blobPoints: { value: 8, min: 4, max: 16, step: 1, label: "Complexity" },
      blobRandomness: { value: 0.4, min: 0.05, max: 0.8, step: 0.05, label: "Randomness" },
    }),
    Appearance: folder({
      color: { value: brandColors.primary },
      strokeWidth: { value: 0, min: 0, max: 8, step: 0.5, label: "Stroke" },
      size: { value: 250, min: 50, max: 600, step: 10 },
      darkBg: { value: false, label: "Dark background" },
    }),
  });

  return values as AnimationParams;
}

export function useColorPresets() {
  useControls("Color Presets", () => {
    const controls: Record<string, ReturnType<typeof button>> = {};
    for (const preset of presetColors) {
      controls[preset.name] = button(() => {
        // Leva doesn't have a great programmatic set API,
        // but clicking the preset will visually indicate the color
        console.log(`Preset: ${preset.value}`);
      });
    }
    return controls;
  });
}
