// Orthographic projection of (r cos t, r sin t, pitch * t).
export function mesh(angle) {
  const az = (angle * Math.PI) / 180;
  const point = (r, t) => {
    const x = r * Math.cos(t + az),
      y = r * Math.sin(t + az),
      z = 23 * t;
    const vertical = y * Math.sin(0.48) - z * Math.cos(0.48);
    return [
      (x * Math.cos(0.25) - vertical * Math.sin(0.25)).toFixed(1),
      (x * Math.sin(0.25) + vertical * Math.cos(0.25)).toFixed(1),
    ].join(" ");
  };
  const curve = (n, f) =>
    Array.from({ length: n }, (_, i) => (i ? "L" : "M") + f(i / (n - 1))).join(
      "",
    );
  const lines = [];
  for (let i = 0; i <= 28; i++)
    lines.push(curve(76, (u) => point((i - 14) * 10, (u - 0.5) * 8.2)));
  for (let i = 0; i <= 52; i++)
    lines.push(curve(2, (u) => point((u - 0.5) * 280, (i / 52 - 0.5) * 8.2)));
  return lines.join("");
}
