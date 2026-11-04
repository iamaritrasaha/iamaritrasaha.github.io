import { mesh } from "./projection.js";
const plate = document.querySelector(".instrument"),
  svg = plate.querySelector("svg"),
  slider = document.querySelector("#angle");

const wire = document.createElementNS("http://www.w3.org/2000/svg", "path");
wire.setAttribute("fill", "none");
wire.setAttribute("stroke", "currentColor");
wire.setAttribute("stroke-width", ".85");
svg.replaceChildren(wire);
function rotate() {
  wire.setAttribute("d", mesh(Number(slider.value)));
  plate.querySelector("output").value = slider.value + "°";
}
rotate();
slider.parentElement.hidden = false;
slider.addEventListener("input", rotate);
const trace = document.querySelector(".trace-control");
trace.hidden = false;
trace.querySelector("button").onclick = (e) => {
  const active = document.querySelector("#seedl").classList.toggle("isolated");
  e.currentTarget.setAttribute("aria-pressed", String(active));
};
const pipe = document.querySelector(".infera-pipeline");
const tabs = document.createElement("div");
tabs.className = "pipeline-switch";
pipe.prepend(tabs);
const example = document.createElement("div");
example.className = "data-example";
example.innerHTML =
  '<svg viewBox="0 0 260 118" role="img" aria-label="Four training observations lie on a line. A fifth held-out observation is one unit above the prediction."><path d="M18 8V104H246" fill="none" stroke="currentColor"/><path class="fit-line" d="M24 95L224 23" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor">' +
  [0, 1, 2, 3]
    .map(
      (i) =>
        '<circle cx="' + (24 + i * 50) + '" cy="' + (95 - i * 18) + '" r="4"/>',
    )
    .join("") +
  '</g><path class="residual" d="M224 23V14" stroke="#9d331f" stroke-width="4"/><circle class="residual" cx="224" cy="14" r="4" fill="#9d331f"/></svg><p aria-live="polite"></p>';
tabs.after(example);
const readings = [
  "Illustrative dataset. Four training pairs: (0,1), (1,3), (2,5), (3,7).",
  "Fit: y = 2x + 1 passes through all four training observations.",
  "Holdout: x = 4. Predicted 9, observed 10. Residual +1.",
];
for (const [index, label] of ["Profile", "Fit", "Report"].entries()) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  tabs.append(button);
  button.onclick = () => {
    example.dataset.stage = String(index);
    example.querySelector("p").textContent = readings[index];
    Array.from(pipe.querySelectorAll("li")).forEach((row, i) =>
      row.classList.toggle("examined", i === index),
    );
    Array.from(tabs.children).forEach((el) =>
      el.setAttribute("aria-pressed", String(el === button)),
    );
  };
}
tabs.firstChild.click();
