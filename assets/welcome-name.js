import {
  INITIAL_FIELD,
  getCharacterCadence,
  computeFaceState,
  measureSlots,
} from "./welcome-reel.js?v=cipher1";

// Cipher Reel: Each character spins independently in its fixed position,
// cycling through programming symbols and decelerating into Literata typography.
export function constructWelcomeName(name) {
  const visualEl = name.querySelector(".name-visual");
  const label = (visualEl ? visualEl.textContent : name.textContent).trim();
  const accessible = document.createElement("span");
  accessible.className = "sr-only";
  accessible.textContent = label;

  const visual = visualEl || document.createElement("span");
  visual.className = "name-visual";
  visual.setAttribute("aria-hidden", "true");
  visual.textContent = label;

  name.replaceChildren(accessible, visual);
  name.classList.add("name-pending");

  let stopped = false,
    frame = 0,
    timeout = 0,
    observer,
    overlay;
  let cards = [];

  const finish = (state = "complete") => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    observer?.disconnect();
    window.removeEventListener("resize", resized);
    name.classList.remove("name-pending", "name-constructing");
    name.dataset.construction = state;
    overlay?.remove();
    overlay = null;
    cards = [];
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

      const range = document.createRange();
      range.selectNodeContents(visual);
      if (range.getClientRects().length !== 1) return finish("fallback");

      const visualBounds = visual.getBoundingClientRect();
      const slots = measureSlots(visual, visual);
      if (!slots.length) return finish("fallback");

      // Measure exact baseline alignment between Literata and JetBrains Mono
      const marker = document.createElement("span");
      marker.style.cssText =
        "display:inline-block;width:1px;height:1px;vertical-align:baseline;";
      visual.appendChild(marker);
      const literataBaseline =
        marker.getBoundingClientRect().top - visualBounds.top;

      const monoProbe = document.createElement("span");
      monoProbe.style.cssText =
        "position:absolute;visibility:hidden;font-family:var(--mono);line-height:inherit;";
      monoProbe.textContent = "0";
      monoProbe.appendChild(marker);
      name.appendChild(monoProbe);
      const monoBaseline =
        marker.getBoundingClientRect().top - visualBounds.top;
      marker.remove();
      monoProbe.remove();

      const baselineOffset = Math.max(0, literataBaseline - monoBaseline);

      overlay = document.createElement("span");
      overlay.className = "name-reel";
      overlay.setAttribute("aria-hidden", "true");
      overlay.style.setProperty(
        "--reel-baseline-offset",
        `${baselineOffset.toFixed(2)}px`,
      );

      cards = slots.map((slotData, slotIndex) => {
        const cadence = getCharacterCadence(slotData.index, slotData.char);

        const slot = document.createElement("span");
        slot.className = "reel-slot";
        slot.style.left = `${slotData.left}px`;
        slot.style.width = `${slotData.width}px`;

        const card = document.createElement("span");
        card.className = "reel-card";

        const front = document.createElement("span");
        front.className = "reel-face front cipher";
        front.textContent = INITIAL_FIELD[slotIndex % INITIAL_FIELD.length];

        const back = document.createElement("span");
        back.className = "reel-face back cipher";
        back.textContent =
          INITIAL_FIELD[(slotIndex + 1) % INITIAL_FIELD.length];

        card.append(front, back);
        slot.append(card);
        overlay.append(slot);

        return {
          slot,
          card,
          front,
          back,
          cadence,
          settled: false,
          char: slotData.char,
        };
      });

      name.append(overlay);
      name.classList.remove("name-pending");
      name.classList.add("name-constructing");
      name.dataset.construction = "anticipation";

      const start = performance.now();
      const holdDuration = 3500;

      function draw(now) {
        if (stopped) return;
        try {
          if (window.nameProbe) {
            window.nameProbe.draws = (window.nameProbe.draws || 0) + 1;
          }
          const elapsed = now - start;
          let settledCount = 0;

          for (const cardSlot of cards) {
            const state = computeFaceState(cardSlot.cadence, elapsed);
            if (state.settled) {
              settledCount++;
              if (!cardSlot.settled) {
                cardSlot.settled = true;
                cardSlot.slot.classList.add("is-settled");
                cardSlot.front.className = "reel-face front target";
                cardSlot.front.textContent = state.front.text;
                cardSlot.card.style.transform = "rotateX(0deg)";
              }
            } else {
              cardSlot.card.style.transform = `rotateX(${state.angle}deg)`;

              cardSlot.front.className = `reel-face front ${state.front.isTarget ? "target" : "cipher"}`;
              cardSlot.front.textContent = state.front.text;
              cardSlot.back.className = `reel-face back ${state.back.isTarget ? "target" : "cipher"}`;
              cardSlot.back.textContent = state.back.text;
            }
          }

          name.dataset.letter = String(settledCount);

          if (settledCount === cards.length) {
            name.dataset.construction = "settling";
            if (elapsed >= holdDuration) {
              return finish("complete");
            }
          } else {
            name.dataset.construction =
              elapsed < 240 ? "anticipation" : "constructing";
          }

          frame = requestAnimationFrame(draw);
        } catch {
          finish("fallback");
        }
      }

      frame = requestAnimationFrame(draw);
      if (stopped) return;

      window.addEventListener("resize", resized, { passive: true });
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver(([entry]) => {
          if (
            Math.abs(entry.contentRect.width - visualBounds.width) > 1 ||
            Math.abs(entry.contentRect.height - visualBounds.height) > 1
          ) {
            resized();
          }
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
