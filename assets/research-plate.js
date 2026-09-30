const SVG_NS = "http://www.w3.org/2000/svg";

// The update is separable: one function of u multiplied by one function of v.
// This is an illustration of a rank-one change, not measured model weights.
function point(u, v, adapted = false) {
  const fold =
    -95 *
    Math.sin(Math.PI * 0.92 * (u + 0.13)) *
    (0.64 + 0.36 * Math.cos(v * Math.PI * 0.65));
  const a = 58 * Math.exp(-(((u - 0.16) / 0.32) ** 2));
  const b = Math.cos((v * Math.PI) / 2);
  return [
    600 + 390 * u + 94 * v,
    205 + 58 * v - 14 * u + fold + 12 * v * v - (adapted ? a * b : 0),
  ];
}

function curve(fixed, transverse, adapted) {
  return Array.from({ length: 65 }, (_, index) => {
    const varying = -1 + (index / 64) * 2;
    const [x, y] = transverse
      ? point(fixed, varying, adapted)
      : point(varying, fixed, adapted);
    return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

function path(data, className) {
  const line = document.createElementNS(SVG_NS, "path");
  line.setAttribute("d", data);
  line.setAttribute("class", className);
  line.setAttribute("vector-effect", "non-scaling-stroke");
  return line;
}

function surface(adapted) {
  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute(
    "class",
    `research-surface research-surface--${adapted ? "adapted" : "base"}`,
  );
  for (let index = 0; index < 30; index += 1) {
    group.append(
      path(curve(-1 + (index / 29) * 2, false, adapted), "research-contour"),
    );
  }
  for (let index = 0; index < 12; index += 1) {
    group.append(
      path(curve(-1 + (index / 11) * 2, true, adapted), "research-crossline"),
    );
  }
  if (adapted) {
    for (let index = 0; index < 7; index += 1) {
      group.append(
        path(curve(-0.72 + index * 0.24, false, true), "research-intervention"),
      );
    }
  }
  group.append(path(curve(0.035, false, adapted), "research-trace"));
  return group;
}

/** Mount an original, bounded SVG study. The parent owns visibility and motion. */
export function mountResearchPlate(host) {
  if (!host) return { destroy() {} };
  host.classList.add("research-plate");
  host.dataset.plate = "adapted";
  host.innerHTML = `
    <div class="research-plate__topline" aria-hidden="true">
      <span>Weight-space study</span><span>01 / Adaptation</span>
    </div>
    <svg class="research-plate__drawing" viewBox="0 0 1200 380" role="img" aria-label="Folded line surface illustrating base weights and a separable low-rank update">
      <g class="research-plate__surface"></g>
    </svg>
    <div class="research-plate__controls">
      <div class="research-plate__switch" role="group" aria-label="Explore the weight-space illustration">
        <button type="button" data-plate-mode="base" aria-pressed="false">Base weights</button>
        <button type="button" data-plate-mode="adapted" aria-pressed="true">Low-rank update</button>
      </div>
      <p class="research-plate__formula" aria-hidden="true"><span>W</span><span class="research-plate__addition"> + <i>AB</i></span></p>
    </div>`;
  const field = host.querySelector(".research-plate__surface");
  field.append(surface(false), surface(true));
  const buttons = [...host.querySelectorAll("[data-plate-mode]")];
  function select(event) {
    host.dataset.plate = event.currentTarget.dataset.plateMode;
    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.plateMode === host.dataset.plate),
      );
    }
  }
  for (const button of buttons) button.addEventListener("click", select);
  return {
    destroy() {
      for (const button of buttons) button.removeEventListener("click", select);
    },
  };
}
