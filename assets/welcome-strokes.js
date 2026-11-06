// Pen guides order sampled Literata ink; they never substitute for its outline.
// Coordinates are relative to each glyph's measured ink bounds, not a type cell.
const guides = {
  A: [
    [
      [0.1, 0.96],
      [0.48, 0.03],
    ],
    [
      [0.48, 0.03],
      [0.87, 0.96],
    ],
    [
      [0.25, 0.64],
      [0.72, 0.64],
    ],
  ],
  r: [
    [
      [0.16, 0.16],
      [0.16, 0.95],
    ],
    [
      [0.18, 0.35],
      [0.37, 0.08],
      [0.69, 0.06],
      [0.85, 0.2],
    ],
  ],
  i: [
    [
      [0.48, 0.4],
      [0.48, 0.95],
    ],
    [
      [0.47, 0.05],
      [0.5, 0.1],
    ],
  ],
  t: [
    [
      [0.44, 0.03],
      [0.44, 0.78],
      [0.55, 0.93],
      [0.83, 0.9],
    ],
    [
      [0.06, 0.3],
      [0.86, 0.3],
    ],
  ],
  a: [
    [
      [0.14, 0.21],
      [0.29, 0.06],
      [0.61, 0.06],
      [0.77, 0.27],
      [0.77, 0.93],
    ],
    [
      [0.75, 0.49],
      [0.4, 0.5],
      [0.12, 0.67],
      [0.16, 0.89],
      [0.47, 0.96],
      [0.73, 0.77],
    ],
  ],
  S: [
    [
      [0.86, 0.16],
      [0.62, 0.04],
      [0.27, 0.07],
      [0.12, 0.27],
      [0.27, 0.43],
      [0.65, 0.57],
      [0.86, 0.73],
      [0.76, 0.93],
      [0.36, 0.97],
      [0.1, 0.83],
    ],
  ],
  h: [
    [
      [0.15, 0.03],
      [0.15, 0.96],
    ],
    [
      [0.17, 0.56],
      [0.37, 0.38],
      [0.65, 0.4],
      [0.79, 0.56],
      [0.79, 0.96],
    ],
  ],
};
export const clamp = (v) => Math.max(0, Math.min(1, v));
export const smooth = (v) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

export function penOrder(letter, point, bounds) {
  const x = (point.x - bounds.left) / bounds.width;
  const y = (point.y - bounds.top) / bounds.height;
  let best;
  const strokes = guides[letter];
  strokes.forEach((stroke, group) => {
    for (let i = 1; i < stroke.length; i++) {
      const [ax, ay] = stroke[i - 1],
        [bx, by] = stroke[i];
      const dx = bx - ax,
        dy = by - ay;
      const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy));
      const distance = Math.hypot(x - ax - dx * t, y - ay - dy * t);
      if (!best || distance < best.distance) {
        const length = Math.hypot(dx * bounds.width, dy * bounds.height);
        best = {
          distance,
          stroke: group,
          order: (group + (i - 1 + t) / (stroke.length - 1)) / strokes.length,
          tx: (dx * bounds.width) / length,
          ty: (dy * bounds.height) / length,
        };
      }
    }
  });
  // Thin terminal extensions and serifs arrive after the structural strokes.
  const detail = best.distance > 0.14 || (y > 0.92 && best.distance > 0.055);
  return {
    ...best,
    detail,
    order: detail ? 0.84 + best.order * 0.16 : best.order * 0.84,
  };
}

export function flight(point, progress, size, index) {
  const t = smooth(progress),
    u = 1 - t;
  const side = index % 2 ? 1 : -1;
  const reach = size * (0.18 + (index % 5) * 0.018);
  const nx = -point.ty * side,
    ny = point.tx * side;
  // Cubic approach turns into the stroke tangent instead of falling radially in.
  const sx = point.x - point.tx * reach + nx * reach * 0.8;
  const sy = point.y - point.ty * reach + ny * reach * 0.8;
  const c1x = sx + point.tx * reach * 0.3,
    c1y = sy + point.ty * reach * 0.3;
  const c2x = point.x - point.tx * reach * 0.45,
    c2y = point.y - point.ty * reach * 0.45;
  return {
    x:
      u ** 3 * sx +
      3 * u * u * t * c1x +
      3 * u * t * t * c2x +
      t ** 3 * point.x,
    y:
      u ** 3 * sy +
      3 * u * u * t * c1y +
      3 * u * t * t * c2y +
      t ** 3 * point.y,
  };
}

export function sampleGlyph(
  data,
  width,
  height,
  left,
  right,
  pitch,
  letter,
  scale,
) {
  const pixels = [];
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < height; y++)
    for (let x = left; x < right; x++) {
      if (!data[(y * width + x) * 4 + 3]) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  const bounds = {
    left: minX / scale,
    top: minY / scale,
    width: (maxX - minX + 1) / scale,
    height: (maxY - minY + 1) / scale,
  };
  for (let y = minY; y <= maxY; y += pitch)
    for (let x = left; x < right; x += pitch) {
      let weight = 0,
        sx = 0,
        sy = 0;
      const samples = [],
        w = Math.min(pitch, right - x),
        h = Math.min(pitch, height - y);
      for (let py = y; py < y + h; py++)
        for (let px = x; px < x + w; px++) {
          const alpha = data[(py * width + px) * 4 + 3];
          if (!alpha) continue;
          weight += alpha;
          sx += (px + 0.5) * alpha;
          sy += (py + 0.5) * alpha;
          samples.push({ x: px + 0.5, y: py + 0.5 });
        }
      if (!weight) continue;
      const distance = (p) =>
        (p.x - sx / weight) ** 2 + (p.y - sy / weight) ** 2;
      const center = samples.reduce((a, b) =>
        distance(a) < distance(b) ? a : b,
      );
      const point = {
        x: center.x / scale,
        y: center.y / scale,
        sx: x,
        sy: y,
        w,
        h,
      };
      pixels.push({ ...point, ...penOrder(letter, point, bounds) });
    }
  return pixels.sort((a, b) => a.order - b.order);
}
