// Turns a picture of handwritten text into the path a pen would follow.
// 1. thin(): shrink each filled letter down to a 1px center line
// 2. strokeOrder(): walk those lines left to right, the way you'd write

type Point = [number, number];

const NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

// Zhang–Suen thinning
function thin(mask: Uint8Array, w: number, h: number): Uint8Array {
  const img = mask.slice();
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : img[y * w + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const remove: number[] = [];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          if (!img[y * w + x]) continue;
          const p2 = at(x, y - 1), p3 = at(x + 1, y - 1), p4 = at(x + 1, y), p5 = at(x + 1, y + 1);
          const p6 = at(x, y + 1), p7 = at(x - 1, y + 1), p8 = at(x - 1, y), p9 = at(x - 1, y - 1);
          const neighbors = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (neighbors < 2 || neighbors > 6) continue;
          const ring = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
          let transitions = 0;
          for (let i = 0; i < 8; i++) if (!ring[i] && ring[i + 1]) transitions++;
          if (transitions !== 1) continue;
          if (pass === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue;
          remove.push(y * w + x);
        }
      }
      if (remove.length) {
        changed = true;
        for (const i of remove) img[i] = 0;
      }
    }
  }
  return img;
}

type Stroke = { pts: number[]; minX: number; small: boolean; placed?: boolean };

function strokeOrder(skel: Uint8Array, w: number, h: number): Point[] {
  // Group the center lines into separate strokes
  const seen = new Uint8Array(w * h);
  const strokes: Stroke[] = [];
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const start = y * w + x;
      if (!skel[start] || seen[start]) continue;
      const pts: number[] = [];
      const stack = [start];
      seen[start] = 1;
      let minX = x;
      while (stack.length) {
        const p = stack.pop()!;
        pts.push(p);
        const px = p % w, py = (p / w) | 0;
        minX = Math.min(minX, px);
        for (const [dx, dy] of NEIGHBORS) {
          const nx = px + dx, ny = py + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const k = ny * w + nx;
          if (skel[k] && !seen[k]) {
            seen[k] = 1;
            stack.push(k);
          }
        }
      }
      strokes.push({ pts, minX, small: false });
    }
  }

  // Big strokes go left to right; small ones (i-dots, periods) go right after
  // the stroke they sit over
  const total = strokes.reduce((sum, s) => sum + s.pts.length, 0);
  for (const s of strokes) s.small = s.pts.length < total * 0.02;
  const big = strokes.filter((s) => !s.small).sort((a, b) => a.minX - b.minX);
  const small = strokes.filter((s) => s.small).sort((a, b) => a.minX - b.minX);
  const ordered: Stroke[] = [];
  big.forEach((stroke, i) => {
    ordered.push(stroke);
    const nextX = i + 1 < big.length ? big[i + 1].minX : Infinity;
    for (const s of small) {
      if (!s.placed && s.minX < nextX) {
        ordered.push(s);
        s.placed = true;
      }
    }
  });
  for (const s of small) if (!s.placed) ordered.push(s);

  // Walk each stroke from its leftmost end, preferring to keep going straight
  const active = new Uint8Array(w * h);
  const out: Point[] = [];
  for (const stroke of ordered) {
    for (const p of stroke.pts) active[p] = 1;
    const degree = (p: number) => {
      let d = 0;
      const px = p % w, py = (p / w) | 0;
      for (const [dx, dy] of NEIGHBORS) if (active[(py + dy) * w + (px + dx)]) d++;
      return d;
    };
    let start = stroke.pts[0];
    let best = Infinity;
    for (const p of stroke.pts) {
      const score = (p % w) + (degree(p) === 1 ? 0 : 1000);
      if (score < best) {
        best = score;
        start = p;
      }
    }
    const visited = new Set<number>();
    const stack: Array<[number, number, number]> = [[start, 0, 0]];
    while (stack.length) {
      const [p, dirX, dirY] = stack.pop()!;
      if (visited.has(p)) continue;
      visited.add(p);
      out.push([p % w, (p / w) | 0]);
      const px = p % w, py = (p / w) | 0;
      const next: Array<[number, number, number, number]> = [];
      for (const [dx, dy] of NEIGHBORS) {
        const k = (py + dy) * w + (px + dx);
        if (active[k] && !visited.has(k)) next.push([k, dx, dy, dx * dirX + dy * dirY]);
      }
      next.sort((a, b) => a[3] - b[3]);
      for (const [k, dx, dy] of next) stack.push([k, dx, dy]);
    }
    for (const p of stroke.pts) active[p] = 0;
  }
  return out;
}

export function penPath(mask: Uint8Array, w: number, h: number): Point[] {
  return strokeOrder(thin(mask, w, h), w, h);
}