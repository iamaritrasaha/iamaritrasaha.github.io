import {
  resistorReadings,
  pwmTiming,
  protocolSignals,
  stepPath,
} from "./electronics-math.js";
const $ = (id) => document.getElementById(id);
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
const motionButtons = [...document.querySelectorAll("[data-lab-motion]")];
let frame = 0,
  last = 0,
  phase = 0,
  selectedProtocol = "uart";
const geometry = new Map();
function updateMotion() {
  root.dataset.motion = reduced() ? "reduce" : "full";
  for (const scene of scenes)
    scene.classList.toggle(
      "is-visible",
      visible.has(scene) && !reduced() && !document.hidden,
    );
  for (const button of motionButtons) {
    button.hidden = false;
    button.disabled =
      preference.matches || Boolean(navigator.connection?.saveData);
    button.textContent = reduced() ? "Motion reduced" : "Pause motion";
    button.setAttribute("aria-pressed", String(reduced()));
  }
  const running =
    !reduced() &&
    !document.hidden &&
    [".lab-hero", ".lab-timing", "#communication"].some((s) =>
      visible.has(document.querySelector(s)),
    );
  root.dataset.labRunning = String(running);
  if (running && !frame) frame = requestAnimationFrame(tick);
  if (!running) {
    cancelAnimationFrame(frame);
    frame = last = 0;
  }
}
function tick(now) {
  frame = 0;
  if (root.dataset.labRunning !== "true") return;
  if (last) phase = (phase + Math.min(now - last, 100) / 1000) % 12;
  last = now;
  if (visible.has(document.querySelector(".lab-hero"))) {
    const x = 385 + ((phase % 3) / 3) * 205;
    const high = (x >= 414 && x < 452) || (x >= 490 && x < 528) || x >= 565;
    const point = document.querySelector(".lab-cover-point");
    point.setAttribute("cx", x.toFixed(2));
    point.setAttribute("cy", high ? "349" : "387");
  }
  const svg = $("lab-pwm-svg"),
    g = geometry.get(svg);
  if (g && visible.has(document.querySelector(".lab-timing"))) {
    const time = ((phase % 4) / 4) * 0.002;
    const high = time % g.period < g.onTime;
    const dot = svg.querySelector(".lab-scan-dot");
    dot.setAttribute("cx", String(32 + (time / 0.002) * g.width));
    dot.setAttribute("cy", high ? "48" : "152");
  }
  if (visible.has($("communication"))) {
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
  $("lab-current").textContent = (current * 1000).toFixed(2);
  $("lab-power").textContent = (power * 1000).toFixed(2);
  document
    .querySelector(".lab-circuit")
    .style.setProperty("--current-period", `${Math.max(1, 5 - current * 25)}s`);
}
$("lab-voltage").addEventListener("input", renderCircuit);
$("lab-resistance").addEventListener("change", renderCircuit);
renderCircuit();
const number = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
function renderPwm() {
  const duty = Number($("lab-duty").value),
    frequency = Number($("lab-frequency").value);
  const { period, onTime } = pwmTiming(duty, frequency);
  const svg = $("lab-pwm-svg"),
    width = Math.max(200, svg.clientWidth),
    plot = width - 64;
  svg.setAttribute("viewBox", `0 0 ${width} 240`);
  const x = (time) => 32 + (time / 0.002) * plot;
  let path = "M32 152";
  for (let time = 0; time < 0.002 - 1e-9; time += period)
    path += `V48H${x(Math.min(time + onTime, 0.002))}V152H${x(Math.min(time + period, 0.002))}`;
  $("lab-pwm-path").setAttribute("d", path);
  svg
    .querySelector(".lab-scope-grid")
    .setAttribute(
      "d",
      `M32 48H${width - 32}M32 152H${width - 32}M32 200H${width - 32}M32 30V210M${width - 32} 30V210`,
    );
  $("lab-period-bracket").setAttribute("d", `M32 184V192H${x(period)}V184`);
  $("lab-on-bracket").setAttribute("d", `M32 30V22H${x(onTime)}V30`);
  $("lab-on-label").setAttribute("x", String((32 + x(onTime)) / 2));
  svg
    .querySelector("text:not(#lab-on-label)")
    .setAttribute("x", String((32 + x(period)) / 2));
  $("lab-duty-label").value = duty + "%";
  $("lab-pwm-summary").textContent =
    `${duty}% duty · T = ${number(period * 1e6)} µs · t_on = ${number(onTime * 1e6)} µs · f = ${number(frequency)} Hz`;
  $("pwm-svg-title").textContent =
    `PWM: ${duty}% duty at ${frequency} hertz. High for ${number(onTime * 1e6)} microseconds each ${number(period * 1e6)} microsecond period.`;
  geometry.set(svg, { width: plot, period, onTime });
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
