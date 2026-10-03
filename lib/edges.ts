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

// Editorials → About boundary. The lowest point is the right end,
// where the bottom-right peel will start.
export const editorialsEdge: readonly EdgePoint[] = [
  [0, 0.816], [0.1, 0.92], [0.2, 1], [0.3, 0.895], [0.4, 0.63], [0.51, 0.368],
  [0.6, 0.5], [0.7, 0.684], [0.79, 0.842], [0.9, 0.29], [1, 0],
];

// About → Gallery boundary. Lowest just right of center, highest at the right end.
export const aboutEdge: readonly EdgePoint[] = [
  [0, 0.265], [0.143, 0.206], [0.286, 0.176], [0.429, 0.118], [0.571, 0], [0.629, 0.029],
  [0.686, 0.206], [0.743, 0.412], [0.8, 0.618], [0.857, 0.794], [0.914, 0.912], [1, 1],
];

// The About photo's curved right side. Here each point is
// [y, x]: y runs 0 → 1 down the section, x is how far across the photo reaches.
export const aboutPhotoEdge: readonly EdgePoint[] = [
  [0, 0.516], [0.077, 0.507], [0.138, 0.504], [0.2, 0.501], [0.322, 0.503], [0.444, 0.507],
  [0.628, 0.513], [0.69, 0.516], [0.751, 0.517], [0.812, 0.521], [0.874, 0.53], [0.935, 0.541],
  [1, 0.551],
];

// A clip-path that keeps everything left of a curved vertical edge.
export function rightEdgeClipPath(points: readonly EdgePoint[]): string {
  const curve = smooth(points).map(([y, x]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`);
  return `polygon(0% 0%, ${curve.join(", ")}, 0% 100%)`;
}

// The same kind of clip, but cutting a section's TOP along the edge.
// Used by the footer so its top fits the hero's bottom like two torn halves.
export function topEdgeClipPath(points: readonly EdgePoint[], sizeVar: string): string {
  const curve = smooth(points).map(
    ([x, d]) => `${(x * 100).toFixed(2)}% calc((1 - ${d.toFixed(4)}) * var(${sizeVar}))`
  );
  return `polygon(${curve.join(", ")}, 100% 100%, 0% 100%)`;
}

// Editorials → About seam, in mockup units (x 0–700 across, y grows downward).
// Follows the traced wave on the left, then the hand-drawn squiggle exactly,
// including its hook. 38 units = one --editorials-edge.
export const editorialsSeam: ReadonlyArray<readonly [number, number]> = [
  [0, 846], [8, 845.5], [16, 845.1], [24, 844.6], [32, 844.1], [40, 843.7], [48, 843.2],
  [56, 842.8], [64, 842.3], [72, 841.9], [80, 841.5], [88, 841], [96, 840.5], [104, 840.1],
  [112, 839.7], [120, 839.3], [128, 839.1], [136, 839], [144, 839], [152, 839.2], [160, 839.5],
  [168, 839.8], [176, 840.2], [184, 840.8], [192, 841.4], [200, 842], [208, 842.8], [216, 843.6],
  [224, 844.6], [232, 845.7], [240, 846.9], [248, 848.2], [256, 849.5], [264, 850.7], [272, 851.9],
  [280, 853.1], [288, 854.2], [296, 855.4], [304, 856.7], [312, 858], [320, 859.2], [328, 860.4],
  [336, 861.4], [344, 862.2], [352, 862.8], [360, 862.5], [365.4, 862.4], [373.1, 862.4],
  [381.8, 862.2], [390, 862], [397.5, 861.6], [405, 861.2], [412.5, 860.6], [420, 860],
  [427.5, 859.3], [435, 858.6], [442.5, 857.8], [450, 857], [457.5, 856.1], [465, 855],
  [472.5, 854], [480, 853], [487.5, 852.1], [495, 851.2], [502.5, 850.3], [510, 849.5],
  [517.8, 848.6], [525.8, 847.7], [533.4, 846.9], [540, 846.2], [545.3, 845.9], [549.5, 845.6],
  [553.4, 845.5], [557.5, 845.5], [562, 845.5], [566.6, 845.6], [571.1, 845.8], [575, 846.2],
  [578.5, 846.9], [581.6, 847.7], [584.2, 848.7], [586.2, 850], [587, 850.7], [587.6, 851.6],
  [588.1, 852.4], [588.4, 853.4], [588.7, 854.3], [588.8, 855.4], [588.8, 856.4], [588.8, 857.5],
  [588.6, 858.6], [588.3, 859.8], [588, 861], [587.5, 862.3], [587, 863.5], [586.3, 864.9],
  [585.7, 866.2], [585, 867.5], [584.3, 868.8], [583.4, 870.2], [582.5, 871.6], [581.6, 873],
  [580.6, 874.5], [579.6, 875.9], [578.5, 877.3], [577.5, 878.8], [576.4, 880.2], [575.3, 881.6],
  [574, 883.1], [572.8, 884.5], [571.6, 886], [570.5, 887.4], [569.6, 888.7], [568.8, 890],
  [568.1, 891.2], [567.5, 892.4], [567, 893.6], [566.6, 894.7], [566.4, 895.8], [566.2, 896.8],
  [566.2, 897.8], [566.2, 898.8], [566.5, 899.7], [566.8, 900.6], [567.3, 901.5], [567.9, 902.3],
  [568.6, 903.1], [569.4, 903.8], [570.3, 904.5], [571.2, 905], [572.3, 905.4], [573.4, 905.8],
  [574.6, 906.1], [575.9, 906.3], [577.4, 906.4], [578.9, 906.4], [580.6, 906.4], [582.5, 906.2],
  [584.5, 906], [586.8, 905.6], [589.1, 905.2], [591.6, 904.6], [594.2, 904], [596.9, 903.4],
  [599.7, 902.7], [602.5, 902], [605.4, 901.3], [608.4, 900.5], [611.5, 899.6], [614.7, 898.7],
  [617.9, 897.8], [621.1, 896.8], [624.3, 895.9], [627.5, 895], [633.8, 893.1], [640, 891.2],
  [646.2, 889.3], [652.5, 887.5], [658.9, 885.8], [665.3, 884.2], [671.6, 882.6], [677.5, 881.2],
  [683.3, 880], [688.9, 878.8], [693.8, 877.8], [697.5, 877], [699.4, 876.6], [700, 876.5]
];

// Cuts a section's bottom along a seam given in mockup units.
// bottomY is the mockup y that lines up with the section's bottom.
export function seamClipPath(
  points: ReadonlyArray<readonly [number, number]>,
  sizeVar: string,
  bottomY: number,
  unitsPerEdge: number
): string {
  const curve = points
    .slice()
    .reverse()
    .map(([x, y]) => `${((x / 700) * 100).toFixed(2)}% calc(100% - ${((bottomY - y) / unitsPerEdge).toFixed(4)} * var(${sizeVar}))`);
  return `polygon(0% 0%, 100% 0%, ${curve.join(", ")})`;
}