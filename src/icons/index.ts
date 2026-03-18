export { LogoIcon, logoPaths } from "./logo";
export { FlashIcon, flashPath } from "./flash";
export { HeatpumpIcon } from "./heatpump";
export { PvIcon } from "./pv";
export { WallboxIcon, wallboxPath } from "./wallbox";

import { logoPaths } from "./logo";
import { flashPath } from "./flash";
import { wallboxPath } from "./wallbox";
import { heatpumpStaticPath } from "./heatpump";
import { pvStaticPath } from "./pv";

export type IconName = "logo" | "flash" | "heatpump" | "pv" | "wallbox";

export type IconType = "fill" | "stroke";

/**
 * Static path strings for icons that are single-path.
 * heatpump and pv are `null` — they need runtime conversion via MorphSVGPlugin.
 */
export const iconPaths: Record<IconName, string | null> = {
  logo: logoPaths.hexagon,
  flash: flashPath,
  heatpump: null,
  pv: null,
  wallbox: wallboxPath,
};

/** Whether the icon should render with stroke or fill */
export const iconTypes: Record<IconName, IconType> = {
  logo: "fill",
  flash: "fill",
  heatpump: "stroke",
  pv: "stroke",
  wallbox: "stroke",
};

export const iconLabels: Record<IconName, string> = {
  logo: "Simplestrom Logo",
  flash: "Flash / Lightning",
  heatpump: "Heat Pump",
  pv: "Solar PV",
  wallbox: "Wallbox / EV Charger",
};

export const iconOrder: IconName[] = ["logo", "heatpump", "pv", "wallbox", "flash"];

/**
 * Static path strings for ALL icons (never null).
 * For heatpump/pv these are pre-baked compound paths.
 * Used by Remotion export where runtime MorphSVGPlugin conversion isn't available.
 */
export const iconStaticPaths: Record<IconName, string> = {
  logo: logoPaths.hexagon,
  flash: flashPath,
  heatpump: heatpumpStaticPath,
  pv: pvStaticPath,
  wallbox: wallboxPath,
};
