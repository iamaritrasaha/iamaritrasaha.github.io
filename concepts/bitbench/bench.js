import { DIGIT_SAMPLES } from "/assets/digit-model.js";
import { evaluateNetwork } from "/assets/neural-network.js";
import { enter } from "../entry.js";
let n = 0,
  input = [...DIGIT_SAMPLES[n].input],
  layer = 1;
const matrix = document.querySelector("#matrix"),
  units = document.querySelector("#units"),
  bars = document.querySelector("#bars");
for (let i = 0; i < 64; i++) {
  const b = document.createElement("button");
  b.title = "Row " + (1 + Math.floor(i / 8)) + ", column " + (1 + (i % 8));
  b.onclick = () => {
    input[i] = input[i] >= 0.5 ? 0 : 1;
    render();
  };
  matrix.append(b);
}
bars.innerHTML = "<i></i>".repeat(10);
function render() {
  const r = evaluateNetwork(input, DIGIT_SAMPLES[n].label);
  [...matrix.children].forEach((b, i) => {
    b.style.setProperty("--v", input[i]);
    b.setAttribute("aria-label", b.title + ", intensity " + input[i]);
  });
  document.querySelector("#digit").textContent = r.prediction;
  document.querySelector("#prob").value =
    (100 * r.probabilities[r.prediction]).toFixed(1) + "% probability";
  [...bars.children].forEach(
    (e, i) => (e.style.height = r.probabilities[i] * 100 + "%"),
  );
  const vals = layer === 1 ? r.h1 : r.h2;
  const max = Math.max(...vals.map(Math.abs), 0.001);
  if (units.children.length !== vals.length)
    units.innerHTML = "<i></i>".repeat(vals.length);
  [...units.children].forEach((e, i) => {
    e.className = vals[i] < 0 ? "neg" : "";
    e.style.height = (Math.abs(vals[i]) / max) * 95 + "%";
    e.title = vals[i].toFixed(3);
  });
}
document.querySelector("#sample").onclick = () => {
  n = (n + 1) % DIGIT_SAMPLES.length;
  input = [...DIGIT_SAMPLES[n].input];
  render();
};
document.querySelector("#layer").onclick = (e) => {
  layer = 3 - layer;
  e.target.textContent = "Inspect hidden layer " + (3 - layer) + " →";
  render();
};
render();
enter("8 × 8", [
  { clipPath: "circle(100%)" },
  { clipPath: "circle(100%)", offset: 0.35 },
  { clipPath: "circle(0%)" },
]);
