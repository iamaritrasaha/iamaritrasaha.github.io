import { mesh } from "./projection.js?v=m1";

// A viewing rotation, not a deformation of the helicoid. Time advances only
// while this panel is visible and the shared/local motion controls allow it.
export function mountProjection(instrument) {
  if (!instrument) return () => {};
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", ".85");
  instrument.querySelector("svg").replaceChildren(path);
  const output = instrument.querySelector("output");
  const button = instrument.querySelector("button");
  button.hidden = false;
  let allowed = false,
    paused = false,
    frame = 0,
    previous = null,
    painted = 0,
    elapsed = 0;
  function render() {
    const angle = (22 + 12 * elapsed) % 360;
    path.setAttribute("d", mesh(angle));
    output.value = `α = ${angle.toFixed(1)}°`;
  }
  function tick(now) {
    frame = 0;
    if (!allowed || paused) return;
    if (previous !== null) elapsed += Math.min(100, now - previous) / 1000;
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
  button.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  render();
  return (playing) => {
    allowed = playing;
    sync();
  };
}
