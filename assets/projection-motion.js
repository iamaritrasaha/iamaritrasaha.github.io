import { VIEW } from "./projection.js?v=s1";
import { createSculpture } from "./projection-renderer.js?v=s1";

// Lifecycle manages rotation and visibility; drag pauses time.
export function mountProjection(instrument) {
  if (!instrument) return () => {};
  const canvas = instrument.querySelector("canvas");
  const draw = createSculpture(canvas);
  if (!draw) return () => {};
  const output = instrument.querySelector("output");
  const button = instrument.querySelector("[data-projection-pause]");
  const reset = instrument.querySelector("[data-projection-reset]");
  let allowed = false,
    paused = false,
    frame = 0,
    previous = null,
    painted = 0,
    angle = VIEW.initial;
  function render() {
    const degrees = Number(((angle + 360) % 360).toFixed(1)) % 360;
    draw(degrees);
    canvas.dataset.angle = String(degrees);
    output.value = `${degrees.toFixed(1)}°`;
  }
  function resize() {
    const dpr = Math.min(Math.max(devicePixelRatio, 1.5), 2);
    const width = Math.min(960, Math.round(canvas.clientWidth * dpr));
    if (!width) return;
    const height = Math.round(width * 0.75);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    render();
  }
  function tick(now) {
    frame = 0;
    if (!allowed || paused) return;
    if (previous !== null)
      angle =
        (angle + (VIEW.speed * Math.min(100, now - previous)) / 1000) % 360;
    previous = now;
    if (now - painted >= 1000 / 30) {
      render();
      painted = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const reduced = document.documentElement.dataset.motion === "reduce";
    button.disabled = reduced;
    button.textContent = reduced
      ? "Motion off"
      : paused
        ? "Resume rotation"
        : "Pause rotation";
    button.setAttribute("aria-pressed", String(paused));
    if (allowed && !paused) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    }
  }
  function inspect(degrees) {
    angle = ((degrees % 360) + 360) % 360;
    paused = true;
    sync();
    render();
  }
  button.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  reset.addEventListener("click", () => inspect(VIEW.initial));
  canvas.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 15 : 5;
    inspect(
      event.key === "Home"
        ? VIEW.initial
        : angle + (event.key === "ArrowRight" ? step : -step),
    );
  });
  let drag = null,
    dragRaf = 0,
    targetAngle = null;
  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { x: event.clientX, angle };
    canvas.setPointerCapture(event.pointerId);
    inspect(angle);
  });
  const flushDrag = () => {
    if (targetAngle !== null) {
      inspect(targetAngle);
      targetAngle = null;
    }
  };
  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;
    targetAngle = drag.angle + (event.clientX - drag.x) * 0.4;
    if (!dragRaf) {
      dragRaf = requestAnimationFrame(() => {
        dragRaf = 0;
        flushDrag();
      });
    }
  });
  const endDrag = () => {
    if (!drag) return;
    cancelAnimationFrame(dragRaf);
    dragRaf = 0;
    flushDrag();
    drag = null;
  };
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    canvas.addEventListener(name, endDrag);
  canvas.hidden = false;
  canvas.tabIndex = 0;
  resize();
  render();
  instrument.querySelector(".projection-fallback").hidden = true;
  for (const control of instrument.querySelectorAll(
    "[data-projection-control]",
  ))
    control.hidden = false;
  new ResizeObserver(resize).observe(canvas);
  return (playing) => {
    allowed = playing;
    sync();
  };
}
