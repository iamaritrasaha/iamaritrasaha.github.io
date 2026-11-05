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
