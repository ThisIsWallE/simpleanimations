/**
 * Generate organic blob SVG paths.
 * Supports both static (seeded) and time-animated (fluid) modes.
 */

/**
 * Generate a fluid, continuously animated blob path.
 * Each vertex oscillates independently using layered sine waves
 * for a living liquid-drop effect.
 */
export function generateAnimatedBlobPath(
  time: number,
  options: {
    cx?: number;
    cy?: number;
    radius?: number;
    points?: number;
    amplitude?: number;
    speed?: number;
  } = {}
): string {
  const {
    cx = 50,
    cy = 50,
    radius = 35,
    points = 8,
    amplitude = 0.25,
    speed = 1,
  } = options;

  const angleStep = (Math.PI * 2) / points;
  const coords: { x: number; y: number }[] = [];
  const t = time * speed;

  for (let i = 0; i < points; i++) {
    const angle = angleStep * i - Math.PI / 2;

    // Layered sine waves for organic motion — each vertex gets unique phase
    const phase = i * 1.7;
    const noise =
      Math.sin(t * 0.8 + phase) * 0.4 +
      Math.sin(t * 1.3 + phase * 2.1) * 0.3 +
      Math.sin(t * 2.1 + phase * 0.7) * 0.2 +
      Math.sin(t * 0.5 + phase * 3.3) * 0.1;

    const r = radius * (1 + noise * amplitude);
    coords.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  return smoothBlobPath(coords);
}

/**
 * Generate a static blob path (seeded random, reproducible).
 */
export function generateBlobPath(options: {
  cx?: number;
  cy?: number;
  radius?: number;
  points?: number;
  randomness?: number;
  seed?: number;
}): string {
  const {
    cx = 50,
    cy = 50,
    radius = 35,
    points = 8,
    randomness = 0.4,
    seed = 0,
  } = options;

  const random = seededRandom(seed);
  const angleStep = (Math.PI * 2) / points;
  const coords: { x: number; y: number }[] = [];

  for (let i = 0; i < points; i++) {
    const angle = angleStep * i - Math.PI / 2;
    const r = radius * (1 + (random() - 0.5) * randomness * 2);
    coords.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  return smoothBlobPath(coords);
}

function smoothBlobPath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n < 3) return "";

  const parts: string[] = [];
  parts.push(`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`);

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    parts.push(
      `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    );
  }

  parts.push("Z");
  return parts.join(" ");
}

function seededRandom(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}
