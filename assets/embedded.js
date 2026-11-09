import { mountRpmPreview } from "./pulse-rpm.js?v=2";
import {
  resistorReadings,
  pwmTiming,
  protocolSignals,
  stepPath,
} from "./electronics-math.js";
const $ = (id) => document.getElementById(id);
// The scope displays two milliseconds; its scan takes four animation seconds.
const PWM_WINDOW_SECONDS = 0.002;
const PWM_SCAN_SECONDS = 4;
const root = document.documentElement;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
let userReduced =
  new URLSearchParams(location.search).get("motion") === "reduce";
try {
  userReduced ||= localStorage.getItem("portfolio-reduced-motion") === "true";
} catch {
  /* Storage is optional. */
}
const reduced = () =>
  preference.matches || userReduced || Boolean(navigator.connection?.saveData);
const scenes = [...document.querySelectorAll(".lab-scene")];
const visible = new Set();
const pulse = document.querySelector(".pulse-study");
const playPulse = mountRpmPreview(pulse);
const motionButtons = [...document.querySelectorAll("[data-lab-motion]")];
let frame = 0,
  last = 0,
  phase = 0,
  selectedProtocol = "uart";
const geometry = new Map();
const heroScene = document.querySelector(".lab-hero");
const timingScene = document.querySelector(".lab-timing");
const signalScene = $("communication");
const coverPoint = document.querySelector(".lab-cover-point");
const pwmSvg = $("lab-pwm-svg");
function renderPwmMarker(timing) {
  const time =
    ((phase % PWM_SCAN_SECONDS) / PWM_SCAN_SECONDS) * PWM_WINDOW_SECONDS;
  const dot = pwmSvg.querySelector(".lab-scan-dot");
  dot.setAttribute(
    "cx",
    String(32 + (time / PWM_WINDOW_SECONDS) * timing.width),
  );
  dot.setAttribute("cy", time % timing.period < timing.onTime ? "48" : "152");
}
const entering = () =>
  ["pending", "running"].includes(root.dataset.chapterState);
document.addEventListener("portfolio:chapter", updateMotion);
function updateMotion() {
  const canAnimate = !reduced() && !entering() && !document.hidden;
  playPulse(canAnimate && visible.has(pulse), reduced());
  root.dataset.motion = reduced() ? "reduce" : "full";

  for (const scene of scenes) {
    scene.classList.toggle("is-visible", canAnimate && visible.has(scene));
  }

  for (const button of motionButtons) {
    button.hidden = false;
    button.disabled =
      preference.matches || Boolean(navigator.connection?.saveData);
    button.textContent = reduced() ? "Motion reduced" : "Pause motion";
    button.setAttribute("aria-pressed", String(reduced()));
  }

  const running =
    canAnimate &&
    [heroScene, timingScene, signalScene].some((scene) => visible.has(scene));
  root.dataset.labRunning = String(running);

  if (running && !frame) {
    frame = requestAnimationFrame(tick);
  } else if (!running) {
    cancelAnimationFrame(frame);
    // Preserve current phase while paused; discard elapsed wall time before resuming.
    frame = last = 0;
  }
}
function tick(now) {
  frame = 0;
  if (root.dataset.labRunning !== "true") return;
  // Cap a delayed frame at 100 ms; all three scans share this 12-second phase.
  if (last) phase = (phase + Math.min(now - last, 100) / 1000) % 12;
  last = now;
  if (visible.has(heroScene)) {
    const x = 385 + ((phase % 3) / 3) * 205;
    const high = (x >= 414 && x < 452) || (x >= 490 && x < 528) || x >= 565;
    coverPoint.setAttribute("cx", x.toFixed(2));
    coverPoint.setAttribute("cy", high ? "349" : "387");
  }
  const timing = geometry.get(pwmSvg);
  if (timing && visible.has(timingScene)) renderPwmMarker(timing);
  if (visible.has(signalScene)) {
    const active = document.querySelector(
      `[data-waveform="${selectedProtocol}"]`,
    );
    const cursor = active.querySelector(".lab-protocol-cursor"),
      box = geometry.get(active);
    if (cursor && box)
      cursor.setAttribute(
        "transform",
        `translate(${32 + ((phase % 6) / 6) * box.width} 0)`,
      );
  }
  frame = requestAnimationFrame(tick);
}
for (const button of motionButtons)
  button.addEventListener("click", () => {
    userReduced = !userReduced;
    try {
      localStorage.setItem("portfolio-reduced-motion", String(userReduced));
    } catch {
      /* Optional preference. */
    }
    updateMotion();
  });
preference.addEventListener("change", updateMotion);
navigator.connection?.addEventListener("change", updateMotion);
window.addEventListener("storage", (event) => {
  try {
    if (event.storageArea !== localStorage) return;
  } catch {
    return;
  }
  if (event.key !== "portfolio-reduced-motion" && event.key !== null) return;
  userReduced =
    event.newValue === "true" ||
    new URLSearchParams(location.search).get("motion") === "reduce";
  updateMotion();
});
document.addEventListener("visibilitychange", updateMotion);
window.addEventListener("pageshow", updateMotion);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      updateMotion();
    },
    { threshold: 0 },
  );
  scenes.forEach((scene) => observer.observe(scene));
}
updateMotion();
function renderCircuit() {
  const voltage = Number($("lab-voltage").value),
    resistance = Number($("lab-resistance").value);
  const { current, power } = resistorReadings(voltage, resistance);
  $("lab-voltage-label").value = voltage.toFixed(1) + " V";
  $("lab-voltage").setAttribute(
    "aria-valuetext",
    `${voltage.toFixed(1)} volts`,
  );
  $("lab-current").textContent = (current * 1000).toFixed(2);
  $("lab-power").textContent = (power * 1000).toFixed(2);
  document
    .querySelector(".lab-circuit")
    .style.setProperty("--current-period", `${Math.max(1, 5 - current * 25)}s`);
}
$("lab-voltage").addEventListener("input", renderCircuit);
$("lab-resistance").addEventListener("change", renderCircuit);
renderCircuit();
const formatReading = (value) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 1 });
function pwmWaveformPath(period, onTime, timeToX) {
  let path = "M32 152";
  // The epsilon excludes an extra cycle from floating-point accumulation.
  for (let time = 0; time < PWM_WINDOW_SECONDS - 1e-9; time += period)
    path += `V48H${timeToX(Math.min(time + onTime, PWM_WINDOW_SECONDS))}V152H${timeToX(Math.min(time + period, PWM_WINDOW_SECONDS))}`;
  return path;
}

function renderPwm() {
  const duty = Number($("lab-duty").value),
    frequency = Number($("lab-frequency").value);
  const { period, onTime } = pwmTiming(duty, frequency);
  const svg = $("lab-pwm-svg"),
    width = Math.max(200, svg.clientWidth),
    plotWidth = width - 64;
  svg.setAttribute("viewBox", `0 0 ${width} 240`);
  const timeToX = (time) => 32 + (time / PWM_WINDOW_SECONDS) * plotWidth;
  $("lab-pwm-path").setAttribute("d", pwmWaveformPath(period, onTime, timeToX));
  svg
    .querySelector(".lab-scope-grid")
    .setAttribute(
      "d",
      `M32 48H${width - 32}M32 152H${width - 32}M32 200H${width - 32}M32 30V210M${width - 32} 30V210`,
    );
  $("lab-period-bracket").setAttribute(
    "d",
    `M32 184V192H${timeToX(period)}V184`,
  );
  $("lab-on-bracket").setAttribute("d", `M32 30V22H${timeToX(onTime)}V30`);
  $("lab-on-label").setAttribute("x", String((32 + timeToX(onTime)) / 2));
  svg
    .querySelector("text:not(#lab-on-label)")
    .setAttribute("x", String((32 + timeToX(period)) / 2));
  $("lab-duty-label").value = duty + "%";
  $("lab-duty").setAttribute("aria-valuetext", `${duty} percent duty cycle`);
  $("lab-pwm-summary").textContent =
    `${duty}% duty · T = ${formatReading(period * 1e6)} µs · t_on = ${formatReading(onTime * 1e6)} µs · f = ${formatReading(frequency)} Hz`;
  $("pwm-svg-title").textContent =
    `PWM: ${duty}% duty at ${frequency} hertz. High for ${formatReading(onTime * 1e6)} microseconds each ${formatReading(period * 1e6)} microsecond period.`;
  const timing = { width: plotWidth, period, onTime };
  geometry.set(svg, timing);
  // Input and resize events must also update the marker while motion is paused.
  renderPwmMarker(timing);
}
$("lab-duty").addEventListener("input", renderPwm);
$("lab-frequency").addEventListener("change", renderPwm);
const ns = "http://www.w3.org/2000/svg";
function node(name, attrs, text) {
  const el = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attrs))
    el.setAttribute(key, String(value));
  if (text) el.textContent = text;
  return el;
}
function drawProtocol(svg) {
  if (!svg.clientWidth) return;
  const rows = protocolSignals(svg.dataset.waveform),
    width = Math.max(220, svg.clientWidth),
    plot = width - 64;
  const height = rows.length * 100 + 45;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const content = [];
  rows.forEach((row, i) => {
    const y = 35 + i * 100;
    content.push(node("text", { x: 32, y: y - 12, "font-size": 13 }, row.name));
    content.push(
      node("path", {
        d: `M32 ${y + 50}H${width - 32}`,
        fill: "none",
        stroke: "currentColor",
        opacity: 0.2,
      }),
    );
    content.push(
      node("path", {
        d: stepPath(row.values, 32, y, plot, 50, row.domain),
        fill: "none",
        stroke: i % 2 ? "var(--muted)" : "var(--accent)",
        "stroke-width": 2,
      }),
    );
  });
  content.push(
    node("path", {
      class: "lab-protocol-cursor",
      d: `M0 20V${height - 20}`,
      stroke: "currentColor",
      "stroke-width": 1,
      "stroke-dasharray": "3 5",
      opacity: 0.4,
      "aria-hidden": "true",
      transform: "translate(32 0)",
    }),
  );
  svg.replaceChildren(...content);
  geometry.set(svg, { width: plot });
}
const protocolSvgs = [...document.querySelectorAll(".lab-protocol-svg")];
function selectGroup(attribute, prefix, value) {
  const controls = [...document.querySelectorAll(`[data-${attribute}]`)];
  for (const button of controls) {
    const active = button.dataset[attribute] === value;
    button.setAttribute("aria-pressed", String(active));
    $(prefix + button.dataset[attribute]).hidden = !active;
  }
}
for (const button of document.querySelectorAll("[data-protocol]"))
  button.addEventListener("click", () => {
    selectedProtocol = button.dataset.protocol;
    selectGroup("protocol", "protocol-", selectedProtocol);
    drawProtocol(
      document.querySelector(`[data-waveform="${selectedProtocol}"]`),
    );
  });
for (const button of document.querySelectorAll("[data-code]"))
  button.addEventListener("click", () =>
    selectGroup("code", "code-", button.dataset.code),
  );
selectGroup("protocol", "protocol-", "uart");
selectGroup("code", "code-", "loop");
document
  .querySelectorAll("[data-lab-enhance]")
  .forEach((el) => (el.hidden = false));
if ("ResizeObserver" in window) {
  new ResizeObserver(renderPwm).observe($("lab-pwm-svg"));
  const observer = new ResizeObserver((entries) =>
    entries.forEach(({ target }) => drawProtocol(target)),
  );
  protocolSvgs.forEach((svg) => observer.observe(svg));
}
renderPwm();
protocolSvgs.forEach(drawProtocol);
