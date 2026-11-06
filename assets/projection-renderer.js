import { VIEW, surface, normal, project } from "./projection.js?v=s1";

// A small software rasterizer: each triangle writes only its nearest pixels.
// Contours are shaded within those pixels, so hidden lines cannot bleed through.
// Native Canvas keeps this study available without a GPU or a runtime dependency.
const RADIAL_STEPS = 32;
const ANGULAR_STEPS = 128;
const vertices = [];
for (let row = 0; row <= ANGULAR_STEPS; row++) {
  const theta = -VIEW.theta + (2 * VIEW.theta * row) / ANGULAR_STEPS;
  for (let column = 0; column <= RADIAL_STEPS; column++) {
    const radius = -VIEW.radius + (2 * VIEW.radius * column) / RADIAL_STEPS;
    vertices.push({
      point: surface(radius, theta),
      normal: normal(radius, theta),
      radius,
    });
  }
}
const triangles = [];
for (let row = 0; row < ANGULAR_STEPS; row++)
  for (let column = 0; column < RADIAL_STEPS; column++) {
    const a = row * (RADIAL_STEPS + 1) + column,
      b = a + RADIAL_STEPS + 1;
    triangles.push([a, a + 1, b], [a + 1, b + 1, b]);
  }

export function createSculpture(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  let image, depth;
  return function render(angle) {
    const width = canvas.width,
      height = canvas.height;
    if (!image || image.width !== width || image.height !== height) {
      image = context.createImageData(width, height);
      depth = new Float32Array(width * height);
    }
    image.data.fill(0);
    depth.fill(-Infinity);
    const pixels = image.data,
      scale = Math.min(width, height) / 360;
    const toScreen = (point) => {
      const [x, y, z] = project(point, angle);
      return [width / 2 + x * scale, height / 2 + y * scale, z];
    };
    const projected = vertices.map((vertex) => {
      const point = toScreen(vertex.point),
        n = project(vertex.normal, angle);
      // A fixed soft light above-left; use both sides of the thin surface.
      const light =
        0.64 + 0.36 * Math.abs(-0.36 * n[0] - 0.48 * n[1] + 0.8 * n[2]);
      // [screen X, screen Y, camera depth, brightness, surface radius]
      return [...point, light, vertex.radius];
    });
    for (const triangle of triangles) {
      const [a, b, c] = triangle.map((index) => projected[index]);
      const denominator =
        (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(denominator) < 1e-8) continue;
      // Screen-space width of a constant-r contour. Interpolating the parameter
      // inside the winning triangle makes the line share its exact visibility.
      const radialDx =
        ((b[1] - c[1]) * (a[4] - c[4]) + (c[1] - a[1]) * (b[4] - c[4])) /
        denominator;
      const radialDy =
        ((c[0] - b[0]) * (a[4] - c[4]) + (a[0] - c[0]) * (b[4] - c[4])) /
        denominator;
      const contourWidth = Math.hypot(radialDx, radialDy) * 0.8;
      // The signed projected area identifies which oriented side is visible.
      const front = denominator >= 0;
      const color = front ? [228, 244, 137] : [104, 143, 225];
      const left = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
      const right = Math.min(width - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
      const top = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
      const bottom = Math.min(
        height - 1,
        Math.ceil(Math.max(a[1], b[1], c[1])),
      );
      for (let y = top; y <= bottom; y++)
        for (let x = left; x <= right; x++) {
          const u =
            ((b[1] - c[1]) * (x + 0.5 - c[0]) +
              (c[0] - b[0]) * (y + 0.5 - c[1])) /
            denominator;
          const v =
            ((c[1] - a[1]) * (x + 0.5 - c[0]) +
              (a[0] - c[0]) * (y + 0.5 - c[1])) /
            denominator;
          const w = 1 - u - v;
          if (u < -1e-6 || v < -1e-6 || w < -1e-6) continue;
          const z = u * a[2] + v * b[2] + w * c[2],
            index = y * width + x;
          if (z <= depth[index]) continue;
          depth[index] = z;
          const light = u * a[3] + v * b[3] + w * c[3];
          const radius = u * a[4] + v * b[4] + w * c[4];
          const distance = Math.abs(radius - Math.round(radius / 70) * 70);
          const contour =
            Math.abs(radius) < 139 && contourWidth > 0
              ? Math.max(0, 1 - distance / contourWidth) * 0.22
              : 0;
          const brightness = light * (1 - contour);
          pixels[index * 4] = color[0] * brightness;
          pixels[index * 4 + 1] = color[1] * brightness;
          pixels[index * 4 + 2] = color[2] * brightness;
          pixels[index * 4 + 3] = 255;
        }
    }
    context.putImageData(image, 0, 0);
  };
}
