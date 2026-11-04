// Browser illustration only. These are not firmware or motorcycle thresholds.
export const LED_THRESHOLDS = [2000, 3000, 4000, 5000, 6000, 7000];
export const CYCLE_MS = 12000;
const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;
export function ledIntensity(rpm, threshold) {
  return ease(Math.max(0, Math.min(1, (rpm - threshold + 600) / 600)));
}
export function rpmSample(elapsed) {
  const t = ((elapsed % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  const rpm = Math.round(
    t < 5000
      ? 1200 + 6400 * ease(t / 5000)
      : t < 5700
        ? 7600
        : t < 11000
          ? 7600 - 6400 * ease((t - 5700) / 5300)
          : 1200,
  );
  return {
    rpm,
    count: LED_THRESHOLDS.filter((threshold) => rpm >= threshold).length,
    state: rpm >= 7300 ? "shift" : rpm >= 6000 ? "approach" : "normal",
    direction: t < 5700 ? "ACCELERATING" : "DECELERATING",
  };
}
export function mountRpmPreview(figure) {
  if (!figure) return () => {};
  const output = figure.querySelector("#pulse-rpm");
  const status = figure.querySelector(".pulse-state");
  const leds = [...figure.querySelectorAll(".pulse-led")];
  let frame = 0,
    elapsed = 0,
    previous = null;
  const format = new Intl.NumberFormat("en-US");
  function render(sample) {
    const reading = format.format(sample.rpm);
    if (output.textContent !== reading) {
      output.textContent = reading;
    }
    if (figure.dataset.rpm !== String(sample.rpm))
      figure.dataset.rpm = String(sample.rpm);
    if (figure.dataset.state !== sample.state)
      figure.dataset.state = sample.state;
    leds.forEach((led, i) => {
      led.classList.toggle("is-lit", i < sample.count);
      const level = ledIntensity(sample.rpm, LED_THRESHOLDS[i]).toFixed(3);
      if (led.style.getPropertyValue("--led-level") !== level)
        led.style.setProperty("--led-level", level);
    });
    const shift = ease(
      Math.max(0, Math.min(1, (sample.rpm - 6800) / 800)),
    ).toFixed(3);
    if (figure.style.getPropertyValue("--shift-glow") !== shift)
      figure.style.setProperty("--shift-glow", shift);
    const label = `${sample.state === "shift" ? "SHIFT INDICATION" : sample.state === "approach" ? "APPROACHING SHIFT" : sample.direction} · ${sample.count} / 6`;
    if (status.textContent !== label) status.textContent = label;
  }
  function tick(now) {
    if (previous !== null) elapsed += now - previous;
    previous = now;
    render(rpmSample(elapsed));
    frame = requestAnimationFrame(tick);
  }
  return (running, staticMode = false) => {
    figure.dataset.running = String(running);
    if (running && !frame) {
      previous = null;
      frame = requestAnimationFrame(tick);
    } else if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
      if (staticMode) {
        elapsed = 0;
        render({
          rpm: 4250,
          count: 3,
          state: "normal",
          direction: "STATIC PREVIEW",
        });
      }
    }
  };
}
