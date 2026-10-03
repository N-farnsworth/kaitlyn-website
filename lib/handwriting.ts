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
// ---------- Canvas helpers shared by HandwrittenList and HandwrittenNote ----------

/** Finished handwriting, ready to show at once or to write out with the pen. */
export type Ink = {
  glyph: HTMLCanvasElement; // the finished ink, in device pixels
  path: Point[];            // where the pen goes, in device pixels
  width: number;            // canvas size in CSS px (text box + pad on each side)
  height: number;
  pad: number;              // CSS px
};

type InkOptions = {
  lines: string[];
  font: string;       // CSS font, e.g. `${style.fontSize} ${style.fontFamily}`
  color: string;
  lineHeight: number; // CSS px per line
  pad: number;        // CSS px of room so loops and tails aren't cut off
  indent?: number;    // extra CSS px for each later line (line i starts at pad + i * indent)
  width?: number;     // text box width; default = widest line, including its indent
};

export const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

const makeCanvas = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

/** Draws the finished text and works out the pen path, one line at a time
 *  (so the pen finishes line 1 before starting line 2). */
export function inkText({ lines, font, color, lineHeight, pad, indent = 0, width }: InkOptions): Ink {
  const dpr = pixelRatio();
  const fontPx = parseFloat(font);

  // Measure first, so the canvas fits the widest line
  const measure = makeCanvas(1, 1).getContext("2d")!;
  measure.font = font;
  const boxW = width ?? Math.max(...lines.map((t, i) => measure.measureText(t).width + i * indent));
  const cssW = boxW + pad * 2;
  const cssH = lineHeight * lines.length + pad * 2;
  const w = Math.ceil(cssW * dpr);
  const h = Math.ceil(cssH * dpr);

  const glyph = makeCanvas(w, h);
  const g = glyph.getContext("2d")!;
  g.scale(dpr, dpr);
  g.font = font;
  g.fillStyle = color;

  // Each line is also drawn alone, to find just that line's pen path
  const scratch = makeCanvas(w, h);
  const s = scratch.getContext("2d", { willReadFrequently: true })!;
  s.scale(dpr, dpr);
  s.font = font;

  const path: Point[] = [];
  lines.forEach((text, i) => {
    const m = g.measureText(text);
    const ascent = m.fontBoundingBoxAscent ?? fontPx * 0.8;
    const descent = m.fontBoundingBoxDescent ?? fontPx * 0.25;
    const x = pad + i * indent;
    const y = pad + i * lineHeight + (lineHeight - (ascent + descent)) / 2 + ascent;
    g.fillText(text, x, y);

    s.clearRect(0, 0, cssW, cssH);
    s.fillText(text, x, y);
    const pixels = s.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) mask[p] = pixels[p * 4 + 3] > 90 ? 1 : 0;
    path.push(...penPath(mask, w, h));
  });

  return { glyph, path, width: cssW, height: cssH, pad };
}

/** Sizes a visible canvas to fit the ink (this also clears it). */
export function fitCanvas(view: HTMLCanvasElement, ink: Ink) {
  view.width = ink.glyph.width;
  view.height = ink.glyph.height;
  view.style.width = `${ink.width}px`;
  view.style.height = `${ink.height}px`;
}

export function clearInk(view: HTMLCanvasElement) {
  view.getContext("2d")!.clearRect(0, 0, view.width, view.height);
}

/** Shows the finished ink at once. */
export function drawInk(view: HTMLCanvasElement, ink: Ink) {
  const ctx = view.getContext("2d")!;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, view.width, view.height);
  ctx.drawImage(ink.glyph, 0, 0);
}

/** How long the pen takes to write it, in ms (speed in CSS px per ms). */
export function inkDuration(ink: Ink, speed: number) {
  return ink.path.length / (speed * pixelRatio());
}

type WriteOptions = {
  speed: number;  // CSS px of stroke per ms
  tip: number;    // pen tip radius in CSS px
  delay: number;  // ms before the pen starts
  onDone?: () => void;
};

/** Writes the ink out with the pen. Returns a function that stops it. */
export function writeInk(view: HTMLCanvasElement, ink: Ink, { speed, tip, delay, onDone }: WriteOptions) {
  const dpr = pixelRatio();
  const rate = speed * dpr;
  const radius = tip * dpr;
  const reveal = makeCanvas(view.width, view.height); // where the pen has been so far
  const r = reveal.getContext("2d")!;
  const v = view.getContext("2d")!;
  const start = performance.now() + delay;
  let drawn = 0;
  let frame = 0;
  let stopped = false;

  clearInk(view);

  const step = (now: number) => {
    if (stopped) return;
    const target = Math.min(ink.path.length, Math.max(0, Math.floor((now - start) * rate)));

    // Move the pen: stamp its tip along the path
    r.fillStyle = "#000";
    for (let i = drawn; i < target; i++) {
      const [x, y] = ink.path[i];
      r.beginPath();
      r.arc(x, y, radius, 0, Math.PI * 2);
      r.fill();
    }
    drawn = target;

    // Show only the parts of the letters the pen has passed over
    v.globalCompositeOperation = "source-over";
    v.clearRect(0, 0, view.width, view.height);
    v.drawImage(reveal, 0, 0);
    v.globalCompositeOperation = "source-in";
    v.drawImage(ink.glyph, 0, 0);
    v.globalCompositeOperation = "source-over";

    if (target >= ink.path.length) {
      drawInk(view, ink); // end crisp and complete
      onDone?.();
      return;
    }
    frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}
