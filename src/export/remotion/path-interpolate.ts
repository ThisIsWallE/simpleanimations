/**
 * Simple SVG path interpolation for Remotion.
 *
 * For complex morphing (different number of points), GSAP MorphSVGPlugin
 * is used in the live preview. For Remotion export, we use a simpler
 * point-by-point interpolation that works well for paths with similar structure.
 *
 * For production quality, consider integrating flubber for better interpolation
 * between dissimilar shapes.
 */

interface Point {
  x: number;
  y: number;
}

export function interpolatePath(
  pathA: string,
  pathB: string,
  t: number
): string {
  const pointsA = parsePath(pathA);
  const pointsB = parsePath(pathB);

  // Normalize point counts by resampling the shorter path
  const maxLen = Math.max(pointsA.length, pointsB.length);
  const normalizedA = resamplePoints(pointsA, maxLen);
  const normalizedB = resamplePoints(pointsB, maxLen);

  // Ease the t value for smoother morphing
  const easedT = easeInOutCubic(t);

  // Interpolate each point
  const result = normalizedA.map((pA, i) => {
    const pB = normalizedB[i];
    return {
      x: pA.x + (pB.x - pA.x) * easedT,
      y: pA.y + (pB.y - pA.y) * easedT,
    };
  });

  return pointsToSmoothPath(result);
}

function parsePath(d: string): Point[] {
  const points: Point[] = [];
  // Extract all number pairs from the path
  const numbers = d.match(/-?\d+\.?\d*/g);
  if (!numbers) return [{ x: 50, y: 50 }];

  for (let i = 0; i < numbers.length - 1; i += 2) {
    points.push({
      x: parseFloat(numbers[i]),
      y: parseFloat(numbers[i + 1]),
    });
  }

  return points.length > 0 ? points : [{ x: 50, y: 50 }];
}

function resamplePoints(points: Point[], targetCount: number): Point[] {
  if (points.length === targetCount) return points;
  if (points.length === 0) return Array(targetCount).fill({ x: 50, y: 50 });

  const result: Point[] = [];
  for (let i = 0; i < targetCount; i++) {
    const t = i / (targetCount - 1);
    const idx = t * (points.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, points.length - 1);
    const frac = idx - lo;
    result.push({
      x: points[lo].x + (points[hi].x - points[lo].x) * frac,
      y: points[lo].y + (points[hi].y - points[lo].y) * frac,
    });
  }
  return result;
}

function pointsToSmoothPath(points: Point[]): string {
  if (points.length < 3) {
    return `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")} Z`;
  }

  const parts: string[] = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  const n = points.length;

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

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
