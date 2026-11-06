import {
  clamp,
  smooth,
  flight,
  sampleGlyph,
} from "./welcome-strokes.js?v=pen1";

// Each bit carries a real fragment of rasterized Literata ink. The fragments
// physically expand into their neighbours; no hidden glyph or reveal mask exists.
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
    observer,
    canvas;
  let glyphs = [];
  const finish = (state = "complete") => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    observer?.disconnect();
    window.removeEventListener("resize", resized);
    name.classList.remove("name-pending", "name-constructing");
    name.dataset.construction = state;
    canvas?.remove();
    glyphs = [];
    canvas = null;
  };
  const resized = () => finish("resized");
  async function prepare() {
    try {
      if (!document.fonts?.load) return finish("fallback");
      const style = getComputedStyle(name);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const loaded = await Promise.race([
        document.fonts.load(font, label).catch(() => []),
        new Promise((resolve) => {
          timeout = setTimeout(() => resolve([]), 300);
        }),
      ]);
      if (stopped) return;
      clearTimeout(timeout);
      if (!loaded.length) {
        name.style.fontFamily = "Georgia, serif";
        return finish("fallback");
      }
      const size = parseFloat(style.fontSize);
      // At compact widths a still, properly sized wordmark is the composed fallback.
      if (size < 40) return finish("compact");
      const bounds = visual.getBoundingClientRect();
      const text = visual.firstChild;
      const range = document.createRange();
      range.selectNodeContents(visual);
      if (range.getClientRects().length !== 1) return finish("fallback");
      const marker = document.createElement("i");
      marker.style.cssText = "display:inline-block;width:0;height:0";
      visual.append(marker);
      const baseline = marker.getBoundingClientRect().top - bounds.top;
      marker.remove();
      const scale = Math.min(devicePixelRatio || 1, 2);
      const width = Math.ceil(bounds.width * scale),
        height = Math.ceil(bounds.height * scale);
      const raster = document.createElement("canvas");
      raster.width = width;
      raster.height = height;
      const ink = raster.getContext("2d", { willReadFrequently: true });
      if (!ink) return finish("fallback");
      ink.scale(scale, scale);
      ink.font = font;
      ink.fontKerning = style.fontKerning;
      ink.letterSpacing =
        style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
      ink.fillStyle = style.color;
      ink.fillText(label, 0, baseline);
      const pixels = ink.getImageData(0, 0, width, height).data;
      const pitch = Math.ceil(Math.max(3.5, size / 22) * scale);
      let at = 180;
      for (let i = 0; i < label.length; i++) {
        if (label[i] === " ") {
          at += 70;
          continue;
        }
        range.setStart(text, i);
        range.setEnd(text, i + 1);
        const box = range.getBoundingClientRect();
        const left = Math.max(0, Math.round((box.left - bounds.left) * scale));
        const right = Math.min(
          width,
          Math.round((box.right - bounds.left) * scale),
        );
        const points = sampleGlyph(
          pixels,
          width,
          height,
          left,
          right,
          pitch,
          label[i],
          scale,
        );
        if (!points.length || points.length > 180) return finish("fallback");
        const duration = i === 0 ? 420 : 260;
        glyphs.push({ points, at, duration });
        at += duration;
      }
      canvas = document.createElement("canvas");
      const pad = Math.ceil(size * 0.35);
      canvas.className = "name-bits";
      canvas.setAttribute("aria-hidden", "true");
      canvas.width = width + pad * 2 * scale;
      canvas.height = height + pad * 2 * scale;
      canvas.style.cssText = `left:${-pad}px;top:${-pad}px;width:${canvas.width / scale}px;height:${canvas.height / scale}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return finish("fallback");
      ctx.scale(scale, scale);
      ctx.translate(pad, pad);
      ctx.fillStyle = style.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${Math.max(5.5, (pitch / scale) * 1.3)}px monospace`;
      name.append(canvas);
      name.classList.remove("name-pending");
      name.classList.add("name-constructing");
      name.dataset.construction = "anticipation";
      const settled = document.createElement("canvas");
      settled.width = width;
      settled.height = height;
      const solid = settled.getContext("2d");
      if (!solid) return finish("fallback");
      const start = performance.now();
      let committed = 0;
      function fragment(context, p, growth, nativeScale = scale) {
        const x = p.x + (p.sx / scale - p.x) * growth;
        const y = p.y + (p.sy / scale - p.y) * growth;
        context.drawImage(
          raster,
          p.sx,
          p.sy,
          p.w,
          p.h,
          x * nativeScale,
          y * nativeScale,
          (p.w / scale) * growth * nativeScale,
          (p.h / scale) * growth * nativeScale,
        );
      }
      function bit(p, travel, material, i) {
        const position = flight(p, travel, size, i);
        ctx.save();
        ctx.translate(position.x, position.y);
        const shrink = 1 - material;
        ctx.scale(shrink, shrink);
        ctx.fillText(i % 2 ? "1" : "0", 0, 0);
        ctx.restore();
        if (material > 0) fragment(ctx, p, material, 1);
      }
      function draw(now) {
        if (stopped) return;
        try {
          const elapsed = now - start;
          // Completed ink is assembled from the same fragments at their endpoints.
          while (
            committed < glyphs.length &&
            elapsed >= glyphs[committed].at + glyphs[committed].duration
          ) {
            for (const p of glyphs[committed].points) fragment(solid, p, 1);
            committed++;
          }
          ctx.clearRect(
            -pad,
            -pad,
            canvas.width / scale,
            canvas.height / scale,
          );
          ctx.drawImage(settled, 0, 0, width / scale, height / scale);
          if (committed === glyphs.length) {
            name.dataset.construction = "settling";
            if (elapsed >= at + 240) return finish();
          } else {
            const g = glyphs[committed];
            const progress = (elapsed - g.at) / g.duration;
            name.dataset.letter = String(committed);
            name.dataset.construction =
              elapsed < 180 ? "anticipation" : "constructing";
            g.points.forEach((p, i) => {
              const delay = p.order * 0.39;
              const travel = clamp((progress - delay) / 0.3);
              // Hold a complete binary letter before its pieces join into ink.
              const material = smooth(
                (progress - 0.72 - p.order * 0.04) / 0.24,
              );
              if (progress < delay - 0.12) return;
              bit(p, travel, material, i);
            });
            // A quiet, bounded anticipation field spans the future wordmark.
            // Three fragments per future letter become its first pen movements.
            for (
              let j = committed + (progress < 0 ? 0 : 1);
              j < glyphs.length;
              j++
            ) {
              for (const i of [
                0,
                Math.floor(glyphs[j].points.length / 2),
                glyphs[j].points.length - 1,
              ]) {
                ctx.globalAlpha = 0.38;
                bit(glyphs[j].points[i], 0, 0, i);
              }
            }
            ctx.globalAlpha = 1;
          }
          frame = requestAnimationFrame(draw);
        } catch {
          finish("fallback");
        }
      }
      draw(start);
      if (stopped) return;
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
