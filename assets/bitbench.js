import { mountWelcomeMath } from "./welcome-math.js?v=3";
import { DIGIT_SAMPLES } from "./digit-model.js";
import { evaluateNetwork } from "./neural-network.js";
import { mountRelief } from "./pixel-relief.js";

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
const updateRelief = mountRelief(document.querySelector(".pixel-relief"));
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
  updateRelief(input);
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
    " GELU units. Bars show relative magnitude. Striped bars are negative.";
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
  if (!window.portfolioWelcome?.pending || document.querySelector(".bb-entry"))
    return;
  const veil = document.createElement("div");
  veil.className = "entry bb-entry";
  veil.setAttribute("role", "dialog");
  veil.tabIndex = -1;
  veil.setAttribute("aria-describedby", "welcome-keyboard-help");
  veil.setAttribute("aria-label", "Welcome to Aritra Saha's portfolio");
  veil.innerHTML =
    '<div class="boot-grid" aria-hidden="true"></div><strong>Aritra Saha</strong><small>AI/ML Engineer | Applied AI Developer</small><span id="welcome-keyboard-help" class="sr-only">Press Escape or Tab to continue to the portfolio.</span>';
  let returning = false;
  try {
    returning = sessionStorage.getItem("portfolio-welcomed") === "true";
  } catch {
    /* A fresh short welcome still works when storage is blocked. */
  }
  veil.classList.toggle("is-returning", returning);
  mountWelcomeMath(veil);
  if (!window.portfolioWelcome.show(veil)) return;
  try {
    sessionStorage.setItem("portfolio-welcomed", "true");
  } catch {
    /* Optional session preference. */
  }
  const glyph = veil.firstChild;
  for (const v of input) {
    const tile = document.createElement("i");
    tile.style.opacity = 0.14 + 0.86 * v;
    glyph.append(tile);
  }
  const key = (e) => {
    if (e.key === "Escape" || e.key === "Tab") dismiss();
  };
  let timer, alignmentTimer;
  dismiss = () => {
    const returnFocus = veil.contains(document.activeElement);
    veil.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    veil.remove();
    window.portfolioWelcome.finish();
    if (returnFocus) cells[focusIndex].focus({ preventScroll: true });
    clearTimeout(timer);
    clearTimeout(alignmentTimer);
    document.removeEventListener("keydown", key);
    dismiss = () => {};
  };
  document.addEventListener("keydown", key);
  veil.focus({ preventScroll: true });
  const duration = returning ? 4600 : 5600;
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
  const flight = glyph.animate(
    [
      {
        transform: "scale(.6) rotate(-6deg)",
        easing: "cubic-bezier(.4,0,.2,1)",
      },
      { transform: "none", offset: 0.22 },
      { transform: "none", offset: 0.86, easing: "cubic-bezier(.4,0,.2,1)" },
      { transform: move },
    ],
    { duration, easing: "linear", fill: "forwards" },
  );
  // Font settlement and the mounted hero can move the target after first paint.
  // Re-measure just before the retained grid begins its final handoff.
  alignmentTimer = setTimeout(() => {
    const source = glyph.getBoundingClientRect();
    const target = $("pixels").getBoundingClientRect();
    const frames = flight.effect.getKeyframes();
    frames[frames.length - 1].transform =
      `translate(${target.left - source.left}px, ${target.top - source.top}px) scale(${target.width / source.width})`;
    flight.effect.setKeyframes(frames);
  }, duration * 0.82);
  veil.animate(
    [{ opacity: 1 }, { opacity: 1, offset: 0.87 }, { opacity: 0 }],
    duration,
  ).onfinish = dismiss;
}
startup();
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  () => {
    if (reduce()) dismiss();
  },
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) dismiss();
});
new MutationObserver(() => {
  if (reduce()) {
    animations.forEach((a) => a.cancel());
    dismiss();
  }
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-motion"],
});
