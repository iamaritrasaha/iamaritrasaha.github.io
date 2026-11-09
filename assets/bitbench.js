import { mountWelcomeMath } from "./welcome-math.js?v=pen1";
import { constructWelcomeName } from "./welcome-name.js?v=cipher1";
import { DIGIT_SAMPLES } from "./digit-model.js";
import { evaluateNetwork } from "./neural-network.js";
import { mountRelief } from "./pixel-relief.js?v=morph1";

const $ = (id) => document.getElementById(id);
const DIGIT_COUNT = 10;
const CYCLE_DELAY = 4800;
const SAMPLE_TRANSITION_MS = 700;
const specimenKey = "portfolio-hero-digit";
function randomSpecimen() {
  let previous = NaN;
  try {
    previous = Number.parseInt(sessionStorage.getItem(specimenKey), 10);
  } catch {
    /* Random selection still works without storage. */
  }
  const choices = Array.from(
    { length: DIGIT_COUNT },
    (_, digit) => digit,
  ).filter((digit) => digit !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}
function reduce() {
  try {
    if (localStorage.getItem("portfolio-reduced-motion") === "true")
      return true;
  } catch {
    /* Storage is restricted or disabled. */
  }
  return (
    document.documentElement.dataset.motion === "reduce" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    Boolean(navigator.connection?.saveData) ||
    new URLSearchParams(location.search).get("motion") === "reduce"
  );
}
const animations = new Set();
function animate(element, frames, duration = 320, delay = 0) {
  if (reduce() || !element.animate || document.hidden) return;
  const animation = element.animate(frames, {
    duration,
    delay,
    easing: "cubic-bezier(.2,.8,.2,1)",
  });
  animations.add(animation);
  animation.onfinish = animation.oncancel = () => animations.delete(animation);
  return animation;
}
let specimen = randomSpecimen(),
  layer = 1,
  input = [...DIGIT_SAMPLES[specimen].input],
  focusIndex = 0,
  previousPrediction = -1;
let cycleTimer = 0,
  heroVisible = false,
  editing = false;
function holdSpecimen() {
  editing = true;
  clearTimeout(cycleTimer);
}
const cells = Array.from({ length: 64 }, (_, i) => {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "pixel";
  cell.tabIndex = i === 0 ? 0 : -1;
  cell.onclick = () => {
    holdSpecimen();
    input[i] = input[i] >= 0.5 ? 0 : 1;
    paint({ manual: true });
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
  cell.onkeydown = (event) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const destinations = {
      ArrowRight: col < 7 ? i + 1 : i,
      ArrowLeft: col > 0 ? i - 1 : i,
      ArrowDown: row < 7 ? i + 8 : i,
      ArrowUp: row > 0 ? i - 8 : i,
      Home: event.ctrlKey ? 0 : row * 8,
      End: event.ctrlKey ? 63 : row * 8 + 7,
    };
    if (!Object.hasOwn(destinations, event.key)) return;
    holdSpecimen();
    event.preventDefault();
    cells[destinations[event.key]].focus();
  };
  $("pixels").append(cell);
  return cell;
});
const bins = Array.from({ length: 10 }, (_, i) => {
  const bin = document.createElement("span");
  bin.innerHTML = `<i></i><b>${i}</b>`;
  $("distribution").append(bin);
  return bin;
});
const unit = document.createElement("select");
unit.setAttribute("aria-label", "Inspect activation of unit");
$("layer-note").before(unit);
unit.onchange = () => {
  holdSpecimen();
  paint();
};
const stamp = Array.from({ length: 64 }, () => {
  const dot = document.createElement("i");
  $("end-pixels").append(dot);
  return dot;
});
$("end-pixels").parentElement.hidden = false;
const updateRelief = mountRelief(document.querySelector(".pixel-relief"));
function paint({ manual = false, transition = false } = {}) {
  const result = evaluateNetwork(input, DIGIT_SAMPLES[specimen].label);
  const duration = transition && !reduce() ? SAMPLE_TRANSITION_MS : 0;
  $("pixels").style.setProperty(
    "--pixel-duration",
    duration ? `${duration}ms` : "var(--fast)",
  );
  $("pixels").style.setProperty(
    "--pixel-easing",
    duration ? "cubic-bezier(.45,0,.55,1)" : "ease",
  );
  cells.forEach((cell, i) => {
    cell.style.setProperty("--intensity", input[i]);
    cell.setAttribute(
      "aria-label",
      `Row ${1 + Math.floor(i / 8)}, column ${1 + (i % 8)}, intensity ${input[i]}`,
    );
  });
  stamp.forEach((dot, i) => (dot.style.opacity = 0.08 + input[i] * 0.92));
  updateRelief(input, duration);
  const confidence = `${(100 * result.probabilities[result.prediction]).toFixed(1)}% probability`;
  $("winner").textContent = result.prediction;
  $("confidence").textContent = confidence;
  if ((manual || transition) && previousPrediction !== result.prediction)
    animate(
      $("winner"),
      [{ opacity: 0.65 }, { opacity: 1 }],
      SAMPLE_TRANSITION_MS,
    );
  previousPrediction = result.prediction;
  bins.forEach((bin, i) => {
    bin.firstChild.style.transform = `scaleY(${Math.max(0.035, result.probabilities[i])})`;
    bin.title = `Digit ${i}: ${(100 * result.probabilities[i]).toFixed(2)}%`;
  });
  renderActivations(layer === 1 ? result.h1 : result.h2);
  if (manual)
    $("bench-status").textContent =
      `Predicted ${result.prediction}, ${confidence}. Hidden layer ${layer}.`;
}

function renderActivations(values) {
  // Normalize only the bars. Inspection still reports the signed GELU value.
  const maximumMagnitude = Math.max(0.001, ...values.map(Math.abs));
  const bars = $("activations");
  if (values.length !== bars.children.length)
    bars.replaceChildren(...values.map(() => document.createElement("span")));
  values.forEach((value, i) => {
    const bar = bars.children[i];
    bar.style.setProperty(
      "--mag",
      Math.max(0.02, Math.abs(value) / maximumMagnitude),
    );
    bar.classList.toggle("negative", value < 0);
    bar.title = `Unit ${i + 1}: ${value.toFixed(3)}`;
  });
  if (unit.options.length !== values.length) {
    unit.replaceChildren(
      ...values.map((_, i) => new Option(`Unit ${i + 1}`, i)),
    );
  }
  $("layer-note").textContent =
    `Activation ${values[Number(unit.value)].toFixed(4)}. Layer ${layer} · ${values.length} GELU units. Bars show relative magnitude. Striped bars are negative.`;
  $("inspect").textContent = `Inspect hidden layer ${3 - layer} →`;
}
$("specimen").hidden = $("inspect").hidden = false;
function rememberSpecimen() {
  try {
    sessionStorage.setItem(specimenKey, String(DIGIT_SAMPLES[specimen].label));
  } catch {
    /* Optional no-repeat memory for the next page load. */
  }
}
function changeSpecimen(next, manual = false) {
  specimen = next;
  input = [...DIGIT_SAMPLES[specimen].input];
  rememberSpecimen();
  // Inference uses the complete new sample. Only its presentation morphs;
  // automatic changes stay out of the manual-control live announcement.
  paint({ manual, transition: true });
  syncCycle();
}
function syncCycle() {
  clearTimeout(cycleTimer);
  const welcome = document.documentElement.dataset.welcomeState;
  if (
    !heroVisible ||
    editing ||
    reduce() ||
    document.hidden ||
    welcome === "pending" ||
    welcome === "running"
  )
    return;
  // Fresh dwell after resuming avoids catch-up jumps; samples cycle in digit order.
  cycleTimer = setTimeout(() => {
    // Preferences can change before their event reaches this controller.
    if (reduce() || document.hidden) return;
    changeSpecimen((DIGIT_SAMPLES[specimen].label + 1) % DIGIT_COUNT);
  }, CYCLE_DELAY);
}
$("specimen").onclick = () => {
  editing = false;
  changeSpecimen((specimen + 1) % DIGIT_SAMPLES.length, true);
};
$("inspect").onclick = () => {
  holdSpecimen();
  layer = 3 - layer;
  paint({ manual: true });
  animate($("activations"), [
    { transform: "scaleY(.35)" },
    { transform: "scaleY(1)" },
  ]);
};
paint();
rememberSpecimen();
let dismiss = () => {};

function createWelcomeVeil(isReturning) {
  const veil = document.createElement("div");
  veil.className = "entry bb-entry";
  veil.role = "dialog";
  veil.tabIndex = -1;
  veil.setAttribute("aria-describedby", "welcome-keyboard-help");
  veil.setAttribute("aria-label", "Welcome to Aritra Saha's portfolio");
  veil.innerHTML =
    '<div class="boot-grid" aria-hidden="true"></div><strong class="name-pending"><span class="sr-only">Aritra Saha</span><span class="name-visual" aria-hidden="true">Aritra Saha</span></strong><small>AI/ML Engineer | Applied AI Developer</small><span id="welcome-keyboard-help" class="sr-only">Press Escape or Tab to continue to the portfolio.</span>';
  veil.classList.toggle("is-returning", isReturning);
  return veil;
}

function populateWelcomeGlyph(glyph, intensities) {
  for (const val of intensities) {
    const tile = document.createElement("i");
    tile.style.opacity = 0.14 + 0.86 * val;
    glyph.append(tile);
  }
}

function calculateTransform(src, dst) {
  const dx = dst.left - src.left;
  const dy = dst.top - src.top;
  const scale = dst.width / src.width;
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}

function startup() {
  if (!window.portfolioWelcome?.pending || document.querySelector(".bb-entry"))
    return;
  let returning = false;
  try {
    returning = sessionStorage.getItem("portfolio-welcomed") === "true";
  } catch {
    /* A fresh short welcome still works when storage is blocked. */
  }

  const veil = createWelcomeVeil(returning);
  mountWelcomeMath(veil);
  if (!window.portfolioWelcome.show(veil)) return;
  try {
    sessionStorage.setItem("portfolio-welcomed", "true");
  } catch {
    /* Optional session preference. */
  }

  const glyph = veil.firstChild;
  populateWelcomeGlyph(glyph, input);

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
    } else if (event.key === "Tab") {
      dismiss();
    }
  };
  const onNavigate = () => dismiss();
  let timer, alignmentTimer;
  const stopName = constructWelcomeName(veil.querySelector("strong"));

  // Shared cleanup: delayed timers cannot reopen cover or steal focus.
  dismiss = () => {
    const returnFocus = veil.contains(document.activeElement);
    stopName();
    veil.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    veil.remove();
    window.portfolioWelcome.finish();
    if (returnFocus) cells[focusIndex].focus({ preventScroll: true });
    clearTimeout(timer);
    clearTimeout(alignmentTimer);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("hashchange", onNavigate);
    window.removeEventListener("pagehide", onNavigate);
    dismiss = () => {};
  };

  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("hashchange", onNavigate);
  window.addEventListener("pagehide", onNavigate);
  veil.focus({ preventScroll: true });

  const duration = returning ? 4600 : 5600;
  veil.style.setProperty("--entry-duration", `${duration}ms`);
  timer = setTimeout(dismiss, duration + 200);

  const initialMove = calculateTransform(
    glyph.getBoundingClientRect(),
    $("pixels").getBoundingClientRect(),
  );

  const flight = glyph.animate(
    [
      {
        transform: "scale(.6) rotate(-6deg)",
        easing: "cubic-bezier(.4,0,.2,1)",
      },
      { transform: "none", offset: 0.22 },
      { transform: "none", offset: 0.86, easing: "cubic-bezier(.4,0,.2,1)" },
      { transform: initialMove },
    ],
    { duration, easing: "linear", fill: "forwards" },
  );

  // Re-measure target before handoff in case font settlement moved pixels.
  alignmentTimer = setTimeout(() => {
    const targetMove = calculateTransform(
      glyph.getBoundingClientRect(),
      $("pixels").getBoundingClientRect(),
    );
    const frames = flight.effect.getKeyframes();
    frames[frames.length - 1].transform = targetMove;
    flight.effect.setKeyframes(frames);
  }, duration * 0.82);

  veil.animate(
    [{ opacity: 1 }, { opacity: 1, offset: 0.87 }, { opacity: 0 }],
    duration,
  ).onfinish = dismiss;
}

startup();
const onPreferenceChange = () => {
  if (reduce()) {
    animations.forEach((a) => a.cancel());
    dismiss();
  }
  syncCycle();
};
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  onPreferenceChange,
);
navigator.connection?.addEventListener("change", onPreferenceChange);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) dismiss();
  syncCycle();
});
new MutationObserver(onPreferenceChange).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-motion", "data-welcome-state"],
});
window.addEventListener("pagehide", () => clearTimeout(cycleTimer));
window.addEventListener("pageshow", syncCycle);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    syncCycle();
  }).observe(document.querySelector(".bench-hero"));
} else {
  heroVisible = true;
  syncCycle();
}
