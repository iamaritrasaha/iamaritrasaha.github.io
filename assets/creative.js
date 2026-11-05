import { mesh } from "./projection.js?v=m1";

function mountProjectionControl() {
  const instrument = document.querySelector(".instrument");
  const svg = instrument.querySelector("svg");
  const angleControl = document.querySelector("#angle");

  const wireframe = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  wireframe.setAttribute("fill", "none");
  wireframe.setAttribute("stroke", "currentColor");
  wireframe.setAttribute("stroke-width", ".85");
  svg.replaceChildren(wireframe);
  function renderProjection() {
    wireframe.setAttribute("d", mesh(Number(angleControl.value)));
    instrument.querySelector("output").value = angleControl.value + "°";
  }
  renderProjection();
  angleControl.parentElement.hidden = false;
  angleControl.addEventListener("input", renderProjection);
}

function mountTraceControl() {
  const trace = document.querySelector(".trace-control");
  trace.hidden = false;
  trace.querySelector("button").onclick = (event) => {
    const isolated = document
      .querySelector("#seedl")
      .classList.toggle("isolated");
    event.currentTarget.setAttribute("aria-pressed", String(isolated));
  };
}

function mountRegressionExample() {
  const pipeline = document.querySelector(".infera-pipeline");
  const controls = document.createElement("div");
  controls.className = "pipeline-switch";
  pipeline.prepend(controls);
  const example = document.createElement("div");
  example.className = "data-example";
  // Fixed illustrative data: y = 2x + 1, with a held-out residual of +1.
  const trainingPoints = [0, 1, 2, 3]
    .map(
      (index) =>
        `<circle cx="${24 + index * 50}" cy="${95 - index * 18}" r="4"/>`,
    )
    .join("");
  example.innerHTML =
    '<svg viewBox="0 0 260 118" role="img" aria-label="Four training observations lie on a line. A fifth held-out observation is one unit above the prediction."><path d="M18 8V104H246" fill="none" stroke="currentColor"/><path class="fit-line" d="M24 95L224 23" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor">' +
    trainingPoints +
    '</g><path class="residual" d="M224 23V14" stroke="#9d331f" stroke-width="4"/><circle class="residual" cx="224" cy="14" r="4" fill="#9d331f"/></svg><p aria-live="polite"></p>';
  controls.after(example);
  const readings = [
    "Illustrative dataset. Four training pairs: (0,1), (1,3), (2,5), (3,7).",
    "Fit: y = 2x + 1 passes through all four training observations.",
    "Holdout: x = 4. Predicted 9, observed 10. Residual +1.",
  ];
  for (const [index, label] of ["Profile", "Fit", "Report"].entries()) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    controls.append(button);
    button.onclick = () => {
      example.dataset.stage = String(index);
      example.querySelector("p").textContent = readings[index];
      Array.from(pipeline.querySelectorAll("li")).forEach((row, i) =>
        row.classList.toggle("examined", i === index),
      );
      Array.from(controls.children).forEach((el) =>
        el.setAttribute("aria-pressed", String(el === button)),
      );
    };
  }
  controls.firstChild.click();
}

mountProjectionControl();
mountTraceControl();
mountRegressionExample();
