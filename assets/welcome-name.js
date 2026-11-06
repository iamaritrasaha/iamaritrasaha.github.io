// Canvas supplies stroke targets; an SVG mask reveals the original DOM text.
// No per-letter replacement, fixed-width cells, or competing opacity animation.
const SVG = "http://www.w3.org/2000/svg";
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => v * v * (3 - 2 * v);
function svg(tag, attributes = {}) {
  const node = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes))
    node.setAttribute(key, value);
  return node;
}

export function constructWelcomeName(name) {
  const label = name.textContent;
  const accessible = document.createElement("span");
  accessible.className = "sr-only";
  accessible.textContent = label;
  const visual = document.createElement("span");
  visual.className = "name-visual";
  visual.setAttribute("aria-hidden", "true");
  visual.textContent = label;
  name.replaceChildren(accessible, visual);
  name.classList.add("name-pending");
  let stopped = false,
    frame = 0,
    timeout = 0,
    observer;
  let canvas, definitions;
  let glyphs = [];
  const finish = (state = "complete") => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    observer?.disconnect();
    window.removeEventListener("resize", resized);
    visual.style.removeProperty("mask");
    name.classList.remove("name-pending");
    name.dataset.construction = state;
    canvas?.remove();
    definitions?.remove();
    // Release masks/targets even if the caller retains the cleanup function.
    glyphs = [];
    canvas = definitions = null;
  };
  const resized = () => finish("resized");

  async function prepare() {
    try {
      if (!document.fonts?.load || !CSS.supports("mask-image", "url(#mask)"))
        return finish("fallback");
      const style = getComputedStyle(name);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      // A stalled font cannot hold the intro or start a late construction.
      const loaded = await Promise.race([
        document.fonts.load(font, label).catch(() => []),
        new Promise((resolve) => {
          timeout = setTimeout(() => resolve([]), 350);
        }),
      ]);
      if (stopped) return;
      clearTimeout(timeout);
      if (!loaded.length) {
        name.style.fontFamily = "Georgia, serif";
        return finish("fallback");
      }
      const size = parseFloat(style.fontSize);
      const bounds = visual.getBoundingClientRect();
      const text = visual.firstChild;
      const range = document.createRange();
      range.selectNodeContents(visual);
      // Wrapped/enlarged text keeps its readable native layout instead.
      if (range.getClientRects().length !== 1) return finish("fallback");
      const marker = document.createElement("i");
      marker.style.cssText = "display:inline-block;width:0;height:0";
      visual.append(marker);
      const baseline = marker.getBoundingClientRect().top - bounds.top;
      marker.remove();
      const width = Math.ceil(bounds.width),
        height = Math.ceil(bounds.height);
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      const ink = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!ink) return finish("fallback");
      ink.font = font;
      ink.textBaseline = "alphabetic";
      ink.fontKerning = style.fontKerning;
      ink.letterSpacing =
        style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
      ink.fillText(label, 0, baseline);
      const pixels = ink.getImageData(0, 0, width, height).data;
      // One alpha-weighted target per occupied tile captures even thin serifs.
      // The responsive pitch bounds this to <180 targets for the active glyph.
      const pitch = Math.max(3, size / 21);
      let at = 80;
      for (let index = 0; index < label.length; index++) {
        if (label[index] === " ") {
          at += 80;
          continue;
        }
        range.setStart(text, index);
        range.setEnd(text, index + 1);
        const box = range.getBoundingClientRect();
        const left = box.left - bounds.left,
          right = box.right - bounds.left;
        const points = [];
        // Bottom-to-top rows give each letter a legible, accumulating foundation.
        for (let bottom = height; bottom > 0; bottom -= pitch) {
          for (let x = Math.max(0, left); x < right; x += pitch) {
            let weight = 0,
              sx = 0,
              sy = 0;
            const samples = [];
            for (
              let py = Math.max(0, Math.floor(bottom - pitch));
              py < bottom;
              py++
            ) {
              for (
                let px = Math.floor(x);
                px < Math.min(width, x + pitch, right);
                px++
              ) {
                const alpha = pixels[(py * width + px) * 4 + 3];
                if (alpha < 48) continue;
                weight += alpha;
                sx += (px + 0.5) * alpha;
                sy += (py + 0.5) * alpha;
                samples.push({ x: px + 0.5, y: py + 0.5 });
              }
            }
            if (weight) {
              // Snap the centroid onto real ink, including curved/counter edges.
              const distance = (p) =>
                (p.x - sx / weight) ** 2 + (p.y - sy / weight) ** 2;
              points.push(
                samples.reduce((a, b) => (distance(a) < distance(b) ? a : b)),
              );
            }
          }
        }
        if (!points.length || points.length > 180) return finish("fallback");
        const duration = index === 0 ? 440 : 290;
        glyphs.push({
          letter: label[index],
          left,
          right,
          points,
          at,
          duration,
        });
        at += duration;
      }
      canvas = document.createElement("canvas");
      canvas.className = "name-bits";
      canvas.setAttribute("aria-hidden", "true");
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return finish("fallback");
      ctx.scale(dpr, dpr);
      ctx.fillStyle = style.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${pitch * 1.45}px monospace`;

      definitions = svg("svg", { class: "name-mask", "aria-hidden": "true" });
      const mask = svg("mask", {
        id: "welcome-name-strokes",
        maskUnits: "userSpaceOnUse",
        x: 0,
        y: 0,
        width,
        height,
        "mask-type": "alpha",
      });
      const completed = svg("rect", {
        x: 0,
        y: 0,
        width: 0,
        height,
        fill: "white",
      });
      const clip = svg("clipPath", { id: "welcome-name-cell" });
      const cell = svg("rect", { y: 0, height });
      clip.append(cell);
      const seeds = svg("g", {
        fill: "white",
        "clip-path": "url(#welcome-name-cell)",
      });
      mask.append(completed, seeds);
      definitions.append(clip, mask);
      name.append(definitions, canvas);
      visual.style.mask = "url(#welcome-name-strokes)";
      name.classList.remove("name-pending");
      name.dataset.construction = "running";
      let active = -1,
        circles = [];
      const start = performance.now();
      function draw(now) {
        if (stopped) return;
        try {
          const elapsed = now - start;
          ctx.clearRect(0, 0, width, height);
          const next = glyphs.findIndex((g) => elapsed < g.at + g.duration);
          if (next < 0) return finish();
          const g = glyphs[next];
          if (next !== active) {
            completed.setAttribute("width", g.left);
            cell.setAttribute("x", g.left);
            cell.setAttribute("width", g.right - g.left);
            circles = g.points.map((p) =>
              svg("circle", { cx: p.x, cy: p.y, r: 0 }),
            );
            seeds.replaceChildren(...circles);
            active = next;
            name.dataset.letter = String(next);
          }
          const progress = (elapsed - g.at) / g.duration;
          const resolve = smooth(clamp((progress - 0.79) / 0.21));
          g.points.forEach((p, i) => {
            const delay = (i / g.points.length) * 0.33;
            const travel = smooth(clamp((progress - delay) / 0.32));
            circles[i].setAttribute("r", resolve * pitch * 1.15);
            if (progress < delay - 0.14 || resolve === 1) return;
            const spread = 0.12 + (i % 7) * 0.035;
            const originX =
              (g.left + g.right) / 2 + Math.sin(i * 2.4) * size * spread;
            const originY =
              baseline - size * 0.3 + Math.cos(i * 2.4) * size * spread;
            const x = originX + (p.x - originX) * travel;
            const y = originY + (p.y - originY) * travel;
            ctx.save();
            ctx.translate(x, y);
            // Contract the settled symbols into the ink growing at their targets.
            ctx.scale(1 - resolve, 1 - resolve);
            ctx.fillText(i % 2 ? "1" : "0", 0, 0);
            ctx.restore();
          });
          frame = requestAnimationFrame(draw);
        } catch {
          finish("fallback");
        }
      }
      draw(start);
      if (stopped) return;
      // A resize ends the temporary overlay; native text responds normally.
      // No frame performs a DOM measurement, and no loop survives completion.
      window.addEventListener("resize", resized, { passive: true });
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver(([entry]) => {
          if (
            Math.abs(entry.contentRect.width - bounds.width) > 1 ||
            Math.abs(entry.contentRect.height - bounds.height) > 1
          )
            resized();
        });
        observer.observe(visual);
      }
    } catch {
      finish("fallback");
    }
  }
  void prepare();
  return () => finish("cancelled");
}
