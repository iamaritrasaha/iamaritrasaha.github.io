// Drawing units and camera angles shared by the sculpture and its derivation.
export const VIEW = Object.freeze({
  pitch: 23,
  radius: 140,
  theta: 4.1,
  tilt: 0.48,
  roll: 0.25,
  initial: 22,
  speed: 12,
});
const radians = (degrees) => (degrees * Math.PI) / 180;
export function surface(radius, theta) {
  return [
    radius * Math.cos(theta),
    radius * Math.sin(theta),
    VIEW.pitch * theta,
  ];
}
// Orthogonal camera basis. Positive depth is nearer the viewer; X and Y are
// drawing coordinates (Y increases downward). No perspective division occurs.
export function project([x, y, z], degrees) {
  const alpha = radians(degrees);
  const rotatedX = x * Math.cos(alpha) - y * Math.sin(alpha);
  const rotatedY = x * Math.sin(alpha) + y * Math.cos(alpha);
  const vertical = rotatedY * Math.sin(VIEW.tilt) - z * Math.cos(VIEW.tilt);
  return [
    rotatedX * Math.cos(VIEW.roll) - vertical * Math.sin(VIEW.roll),
    rotatedX * Math.sin(VIEW.roll) + vertical * Math.cos(VIEW.roll),
    rotatedY * Math.cos(VIEW.tilt) + z * Math.sin(VIEW.tilt),
  ];
}
export function normal(radius, theta) {
  // dS/dr × dS/dθ, normalized. Lighting never deforms the surface.
  const length = Math.hypot(VIEW.pitch, radius);
  return [
    (VIEW.pitch * Math.sin(theta)) / length,
    (-VIEW.pitch * Math.cos(theta)) / length,
    radius / length,
  ];
}

// Retained for the historical concept and its reproducibility checks.
// Orthographic projection of (r cos t, r sin t, pitch * t).
export function mesh(angle) {
  const azimuth = (angle * Math.PI) / 180;
  const point = (radius, theta) => {
    const x = radius * Math.cos(theta + azimuth),
      y = radius * Math.sin(theta + azimuth),
      z = 23 * theta;
    // Tilt onto the camera plane, then rotate the drawing in that plane.
    // Keep rounding at the final SVG coordinates, not intermediate geometry.
    const vertical = y * Math.sin(0.48) - z * Math.cos(0.48);
    return [
      (x * Math.cos(0.25) - vertical * Math.sin(0.25)).toFixed(1),
      (x * Math.sin(0.25) + vertical * Math.cos(0.25)).toFixed(1),
    ].join(" ");
  };
  const curve = (sampleCount, pointAt) =>
    Array.from(
      { length: sampleCount },
      (_, i) => (i ? "L" : "M") + pointAt(i / (sampleCount - 1)),
    ).join("");
  const lines = [];
  for (let i = 0; i <= 28; i++)
    lines.push(curve(76, (u) => point((i - 14) * 10, (u - 0.5) * 8.2)));
  for (let i = 0; i <= 52; i++)
    lines.push(curve(2, (u) => point((u - 0.5) * 280, (i / 52 - 0.5) * 8.2)));
  return lines.join("");
}
