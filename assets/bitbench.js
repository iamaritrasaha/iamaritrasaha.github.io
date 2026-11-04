import { DIGIT_SAMPLES } from "./digit-model.js";
import { evaluateNetwork } from "./neural-network.js";

const $ = (id) => document.getElementById(id);
const reduce = () =>
  document.documentElement.dataset.motion === "reduce" ||
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  navigator.connection?.saveData ||
  new URLSearchParams(location.search).get("motion") === "reduce";
const animations = new Set();
function animate(el, frames, duration = 320, delay = 0) {
  if (reduce() || !el.animate || document.hidden) return;
  const a = el.animate(frames, {
    duration,
    delay,
    easing: "cubic-bezier(.2,.8,.2,1)",
  });
  animations.add(a);
  a.onfinish = a.oncancel = () => animations.delete(a);
  return a;
}
let specimen = 0,
  layer = 1,
  input = [...DIGIT_SAMPLES[0].input],
  focusIndex = 0,
  previous = -1;
const cells = Array.from({ length: 64 }, (_, i) => {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.tabIndex = i === 0 ? 0 : -1;
  cell.onclick = () => {
    input[i] = input[i] >= 0.5 ? 0 : 1;
    paint(true);
    animate(
      cell,
      [{ transform: "scale(.76)" }, { transform: "scale(1)" }],
      240,
    );
  };
  cell.onfocus = () => {
    cells[focusIndex].tabIndex = -1;
    focusIndex = i;
    cell.tabIndex = 0;
  };
  cell.onkeydown = (e) => {
    const dest = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i + 8,
      ArrowUp: i - 8,
      Home: 0,
      End: 63,
    }[e.key];
    if (dest === undefined) return;
    e.preventDefault();
    cells[Math.max(0, Math.min(63, dest))].focus();
  };
  $("pixels").append(cell);
  return cell;
});
const bins = Array.from({ length: 10 }, (_, i) => {
  const bin = document.createElement("span");
  bin.innerHTML = "<i></i><b>" + i + "</b>";
  $("distribution").append(bin);
  return bin;
});
const unit = document.createElement("select");
unit.setAttribute("aria-label", "Inspect activation of unit");
$("layer-note").before(unit);
unit.onchange = () => paint();
const stamp = Array.from({ length: 64 }, () => {
  const dot = document.createElement("i");
  $("end-pixels").append(dot);
  return dot;
});
$("end-pixels").parentElement.hidden = false;
const field = Array.from({ length: 16 }, () => {
  const bar = document.createElement("i");
  $("trace-field").append(bar);
  return bar;
});
function paint(manual = false) {
  const r = evaluateNetwork(input, DIGIT_SAMPLES[specimen].label);
  cells.forEach((c, i) => {
    c.style.setProperty("--intensity", input[i]);
    c.setAttribute(
      "aria-label",
      "Row " +
        (1 + Math.floor(i / 8)) +
        ", column " +
        (1 + (i % 8)) +
        ", intensity " +
        input[i],
    );
  });
  stamp.forEach((dot, i) => (dot.style.opacity = 0.08 + input[i] * 0.92));
  const scale = Math.max(0.001, ...r.h1.map(Math.abs));
  field.forEach(
    (bar, i) =>
      (bar.style.transform =
        "scaleY(" + Math.max(0.03, Math.abs(r.h1[i]) / scale) + ")"),
  );
  const confidence =
    (100 * r.probabilities[r.prediction]).toFixed(1) + "% probability";
  $("winner").textContent = r.prediction;
  $("confidence").textContent = confidence;
  if (manual && previous !== r.prediction)
    animate($("winner"), [
      { transform: "translateY(.14em) rotate(-4deg)", opacity: 0.5 },
      { transform: "none", opacity: 1 },
    ]);
  previous = r.prediction;
  bins.forEach((b, i) => {
    b.firstChild.style.transform =
      "scaleY(" + Math.max(0.035, r.probabilities[i]) + ")";
    b.title = "Digit " + i + ": " + (100 * r.probabilities[i]).toFixed(2) + "%";
  });
  const values = layer === 1 ? r.h1 : r.h2,
    max = Math.max(0.001, ...values.map(Math.abs));
  const bars = $("activations");
  if (values.length !== bars.children.length)
    bars.replaceChildren(...values.map(() => document.createElement("span")));
  values.forEach((v, i) => {
    const u = bars.children[i];
    u.style.setProperty("--mag", Math.max(0.02, Math.abs(v) / max));
    u.classList.toggle("negative", v < 0);
    u.title = "Unit " + (i + 1) + ": " + v.toFixed(3);
  });
  if (unit.options.length !== values.length) {
    unit.replaceChildren(
      ...values.map((v, i) => new Option("Unit " + (i + 1), i)),
    );
  }
  $("layer-note").textContent =
    "Activation " +
    values[Number(unit.value)].toFixed(4) +
    ". Layer " +
    layer +
    " · " +
    values.length +
    " GELU units. Bars show relative magnitude. Pink marks negative values.";
  $("inspect").textContent = "Inspect hidden layer " + (3 - layer) + " →";
  if (manual)
    $("bench-status").textContent =
      "Predicted " +
      r.prediction +
      ", " +
      confidence +
      ". Hidden layer " +
      layer +
      ".";
}
$("specimen").hidden = $("inspect").hidden = false;
$("specimen").onclick = () => {
  specimen = (specimen + 1) % DIGIT_SAMPLES.length;
  input = [...DIGIT_SAMPLES[specimen].input];
  paint(true);
  animate($("pixels"), [
    { clipPath: "inset(0 0 80%)" },
    { clipPath: "inset(0)" },
  ]);
};
$("inspect").onclick = () => {
  layer = 3 - layer;
  paint(true);
  animate($("activations"), [
    { transform: "scaleY(.35)" },
    { transform: "scaleY(1)" },
  ]);
};
paint();
let dismiss = () => {};
function startup() {
  try {
    if (
      reduce() ||
      location.hash ||
      (localStorage.getItem("bitbench-entry") &&
        new URLSearchParams(location.search).get("intro") !== "replay") ||
      localStorage.getItem("portfolio-reduced-motion") === "true"
    )
      return;
    localStorage.setItem("bitbench-entry", "seen");
  } catch {
    return;
  }
  if (!Element.prototype.animate) return;
  const veil = document.createElement("div");
  veil.className = "entry bb-entry";
  veil.innerHTML =
    '<div class="boot-grid" aria-hidden="true"></div><strong>Aritra Saha</strong><small>AI/ML Engineer | Applied AI Developer</small><div class="epoch-meter" aria-hidden="true"><div class="epoch-label"><span>INTRO EPOCH</span><span class="epoch-count"><i>01 / 03</i><i>02 / 03</i><i>03 / 03</i></span></div><div class="epoch-track"><i></i></div></div><button type="button">Skip intro ↗</button>';
  document.body.append(veil);
  const glyph = veil.firstChild;
  for (const v of input) {
    const tile = document.createElement("i");
    tile.style.opacity = 0.14 + 0.86 * v;
    glyph.append(tile);
  }
  const key = (e) => {
    if (e.key === "Escape" || e.key === "Tab") dismiss();
  };
  let timer;
  dismiss = () => {
    veil.remove();
    clearTimeout(timer);
    document.removeEventListener("keydown", key);
    dismiss = () => {};
  };
  document.addEventListener("keydown", key);
  veil.lastChild.onclick = dismiss;
  const duration = 2800;
  veil.style.setProperty("--entry-duration", duration + "ms");
  timer = setTimeout(dismiss, duration + 200);
  const from = glyph.getBoundingClientRect(),
    to = $("pixels").getBoundingClientRect();
  const move =
    "translate(" +
    (to.left - from.left) +
    "px," +
    (to.top - from.top) +
    "px) scale(" +
    to.width / from.width +
    ")";
  glyph.animate(
    [
      { transform: "scale(.6) rotate(-6deg)" },
      { transform: "none", offset: 0.22 },
      { transform: "none", offset: 0.78 },
      { transform: move },
    ],
    { duration, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
  );
  veil.animate(
    [{ opacity: 1 }, { opacity: 1, offset: 0.87 }, { opacity: 0 }],
    duration,
  ).onfinish = dismiss;
}
startup();
new MutationObserver(() => {
  if (reduce()) {
    animations.forEach((a) => a.cancel());
    dismiss();
  }
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-motion"],
});
