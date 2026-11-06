import { mountRadialStudy } from "./quanta-feature.js?v=q1";
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

mountTraceControl();
mountRadialStudy();
