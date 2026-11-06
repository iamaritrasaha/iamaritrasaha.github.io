// Dimensionless a₀ P(r), rho = r/a₀, normalized hydrogen radial convention.
export function radialProbability(n, rho) {
  return n === 1
    ? 4 * rho ** 2 * Math.exp(-2 * rho)
    : (rho ** 2 * (2 - rho) ** 2 * Math.exp(-rho)) / 8;
}

export function radialCurve(n) {
  return Array.from({ length: 161 }, (_, i) => {
    const rho = i / 20;
    return `${i ? "L" : "M"}${(45 + 37.5 * rho).toFixed(2)} ${(280 - (160 / 0.6) * radialProbability(n, rho)).toFixed(2)}`;
  }).join(" ");
}

export function mountRadialStudy() {
  const study = document.querySelector(".quanta-study");
  if (!study) return;
  const controls = study.querySelector(".quanta-controls");
  controls.hidden = false;
  controls.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-radial]");
    if (!button) return;
    const n = Number(button.dataset.radial);
    study.querySelector(".quanta-density").setAttribute("d", radialCurve(n));
    study
      .querySelector(".quanta-node")
      .setAttribute("d", n === 1 ? "M82.5 280V136" : "M120 280V110");
    const label = study.querySelector(".quanta-node-label");
    label.setAttribute("x", n === 1 ? "66" : "104");
    label.textContent = n === 1 ? "a₀" : "2a₀";
    study.querySelector(".quanta-state-label").textContent =
      n === 1 ? "1s / peak at r = a₀" : "2s / radial node at r = 2a₀";
    study.querySelector(".quanta-formula").textContent =
      n === 1 ? "a₀ P(r) = 4ρ² e⁻²ρ" : "a₀ P(r) = ρ²(2−ρ)² e⁻ρ / 8";
    const reading =
      n === 1
        ? "1s: no radial nodes; most probable radius a₀."
        : "2s: one radial node at 2a₀; outer peak at (3 + √5)a₀.";
    study.querySelector(".quanta-reading").textContent = reading;
    study.querySelector("desc").textContent =
      `${reading} The separate energy ladder shows ideal hydrogen levels and emission from n equals three to two.`;
    controls
      .querySelectorAll("button")
      .forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
  });
}
