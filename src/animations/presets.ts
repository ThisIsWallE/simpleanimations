import type { MorphParams } from "./blob-morph";
import { iconPaths } from "../icons";

export interface AnimationPreset {
  name: string;
  params: Partial<MorphParams>;
}

export const presets: AnimationPreset[] = [
  {
    name: "Logo Reveal",
    params: {
      iconPath: iconPaths.logo || undefined,
      speed: 2,
      blobPoints: 8,
      ease: "power2.inOut",
      pauseDuration: 1,
    },
  },
  {
    name: "Quick Flash",
    params: {
      iconPath: iconPaths.flash || undefined,
      speed: 1,
      blobPoints: 6,
      ease: "elastic.out(1, 0.5)",
      pauseDuration: 0.3,
    },
  },
];
