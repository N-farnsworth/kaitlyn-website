// Section edges traced from her mockup.
// Each point is [x, depth]: x runs 0 → 1 across the screen,
// depth 0 is the lowest point of the edge and 1 is the highest.
export type EdgePoint = readonly [x: number, depth: number];

export const heroEdge: readonly EdgePoint[] = [
  [0, 0], [0.1, 0.16], [0.2, 0.27], [0.3, 0.35], [0.4, 0.43], [0.5, 0.51],
  [0.6, 0.69], [0.66, 0.76], [0.72, 0.73], [0.8, 0.8], [0.86, 0.88],
  [0.93, 0.95], [1, 1],
];

// Turns the few traced points into a smooth curve with many points
function smooth(points: readonly EdgePoint[], count = 72): EdgePoint[] {
  const slope = (j: number) => {
    const a = points[Math.max(j - 1, 0)];
    const b = points[Math.min(j + 1, points.length - 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  };
  const out: EdgePoint[] = [];
  for (let s = 0; s <= count; s++) {
    const x = s / count;
    let i = 0;
    while (i < points.length - 2 && x > points[i + 1][0]) i++;
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const dx = x1 - x0;
    const t = (x - x0) / dx;
    const t2 = t * t;
    const t3 = t2 * t;
    const y =
      (2 * t3 - 3 * t2 + 1) * y0 +
      (t3 - 2 * t2 + t) * dx * slope(i) +
      (-2 * t3 + 3 * t2) * y1 +
      (t3 - t2) * dx * slope(i + 1);
    out.push([x, y]);
  }
  return out;
}

// A CSS clip-path that cuts a section's bottom along the edge.
// sizeVar is the CSS variable that sets how tall the edge's slant is.
export function bottomEdgeClipPath(points: readonly EdgePoint[], sizeVar: string): string {
  const curve = smooth(points)
    .reverse()
    .map(([x, d]) => `${(x * 100).toFixed(2)}% calc(100% - ${d.toFixed(4)} * var(${sizeVar}))`);
  return `polygon(0% 0%, 100% 0%, ${curve.join(", ")})`;
}