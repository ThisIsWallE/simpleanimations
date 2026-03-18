/**
 * Normalize an SVG path to fit within a given size centered at origin.
 * GSAP MorphSVGPlugin handles most of this, but we need path strings.
 */
export function extractPathData(svgString: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const paths = doc.querySelectorAll("path");
  return Array.from(paths).map((p) => p.getAttribute("d") || "");
}

/**
 * Create an SVG path element string from a d attribute
 */
export function pathFromD(d: string): string {
  return d;
}
