import { mountRadialStudy } from "./quanta-feature.js?v=q1";
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

mountProjectionControl();
mountTraceControl();
mountRadialStudy();
