// An orthographic drawing of the editable raster. This renderer animates only
// the camera and height scale; the hero controller supplies sample changes.
export function mountRelief(figure) {
  const canvas = figure.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  figure.hidden = false;
  let pixels,
    frame = 0,
    last = 0,
    phase = 2.6;
  const running = () =>
    figure.classList.contains("scene-active") && !document.hidden;
  function draw() {
    if (!pixels) return;
    const t = (1 - Math.cos((phase * Math.PI) / 4)) / 2;
    const angle = t * 0.83,
      c = Math.cos(angle),
      s = Math.sin(angle);
    const project = (x, y, h = 0) => [
      210 + 26 * (c * x - s * y),
      122 + 24 * t + 26 * ((s * x + c * y) * (1 - 0.52 * t) - h * t),
    ];
    const face = (points, color) => {
      ctx.beginPath();
      for (const [i, p] of points.entries()) {
        if (i === 0) ctx.moveTo(...p);
        else ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    ctx.clearRect(0, 0, 420, 244);
    // Registration marks anchor the changing projection in a fixed frame.
    ctx.strokeStyle = "#8397d5";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (const x of [10, 410])
      for (const y of [10, 234]) {
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);
      }
    ctx.stroke();
    for (let i = 0; i < 64; i++) {
      const v = pixels[i],
        x = (i % 8) - 4,
        y = Math.floor(i / 8) - 4,
        h = 0.08 + 2.45 * v;
      const a = project(x, y, h),
        b = project(x + 0.94, y, h),
        d = project(x, y + 0.94, h),
        e = project(x + 0.94, y + 0.94, h);
      const floor = project(x + 0.94, y + 0.94);
      face([b, project(x + 0.94, y), floor, e], "#788c67");
      face([d, e, floor, project(x, y + 0.94)], "#506681");
      face(
        [a, b, e, d],
        `rgb(${64 + 164 * v} ${85 + 159 * v} ${159 - 22 * v})`,
      );
    }
  }
  function tick(now) {
    frame = 0;
    if (!running()) {
      last = 0;
      return;
    }
    if (!last || now - last >= 1000 / 30) {
      if (last) phase = (phase + Math.min(100, now - last) / 1000) % 8;
      draw();
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (running() && !frame) frame = requestAnimationFrame(tick);
    if (!running()) {
      cancelAnimationFrame(frame);
      frame = last = 0;
    }
  }
  new MutationObserver(sync).observe(figure, {
    attributes: true,
    attributeFilter: ["class"],
  });
  document.addEventListener("visibilitychange", sync);
  new ResizeObserver(() => {
    const width = Math.max(
      1,
      Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2)),
    );
    canvas.width = width;
    canvas.height = Math.round((width * 244) / 420);
    ctx.setTransform(width / 420, 0, 0, canvas.height / 244, 0, 0);
    draw();
  }).observe(canvas);
  sync();
  return (values) => {
    pixels = values;
    draw();
  };
}
