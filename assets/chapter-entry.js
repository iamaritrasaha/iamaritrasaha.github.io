// Early, independent chapter entrance. No model, framework or navigation interception.
(() => {
  const root = document.documentElement;
  const chapter = location.pathname.startsWith("/embedded")
    ? "embedded"
    : "explorations";
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection;
  const navType = performance.getEntriesByType("navigation")[0]?.type;
  const key = "portfolio-chapter-" + chapter;
  let seen = false;
  try {
    seen = sessionStorage.getItem(key) === "seen";
  } catch {
    /* Optional storage. */
  }
  function reduced() {
    let saved = false;
    try {
      saved = localStorage.getItem("portfolio-reduced-motion") === "true";
    } catch {
      /* Optional storage. */
    }
    return (
      preference.matches ||
      connection?.saveData ||
      saved ||
      root.dataset.motion === "reduce" ||
      new URLSearchParams(location.search).get("motion") === "reduce"
    );
  }
  let pending =
    !seen &&
    !location.hash &&
    !reduced() &&
    navType !== "reload" &&
    navType !== "back_forward" &&
    typeof Element.prototype.animate === "function";
  let veil,
    target,
    handoffTimer,
    watchdog,
    finished = false;
  const animations = [];
  root.dataset.chapterState = pending ? "pending" : "bypassed";
  if (!pending) return;
  function signal() {
    document.dispatchEvent(new Event("portfolio:chapter"));
  }
  function finish(reason = "complete") {
    if (finished) return;
    finished = true;
    pending = false;
    clearTimeout(handoffTimer);
    clearTimeout(watchdog);
    const ownedFocus = veil?.contains(document.activeElement);
    if (reason === "complete")
      target?.closest(".lab-hero")?.setAttribute("data-chapter-landed", "");
    animations.forEach((animation) => animation.cancel());
    veil?.remove();
    document.getElementById("chapter-paint")?.remove();
    root.dataset.chapterState = reason === "complete" ? "complete" : "bypassed";
    root.dataset.chapterExit = reason;
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisibility);
    document.removeEventListener("readystatechange", onReady);
    document.removeEventListener("wheel", onScroll);
    document.removeEventListener("touchmove", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("hashchange", onHash);
    window.removeEventListener("pagehide", onHide);
    window.removeEventListener("storage", onPreference);
    window.removeEventListener("pageshow", onReady);
    window.removeEventListener("pagereveal", onReady);
    preference.removeEventListener("change", onPreference);
    connection?.removeEventListener("change", onPreference);
    if (ownedFocus && !["navigation", "hidden", "hash"].includes(reason)) {
      const heading = document.querySelector("main h1");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    }
    signal();
  }
  const onKey = (event) => {
    if (event.key === "Escape" || event.key === "Tab") finish("keyboard");
  };
  const onVisibility = () => {
    if (document.hidden && veil) finish("hidden");
    else if (!document.hidden) onReady();
  };
  const onPreference = () => {
    if (reduced()) finish("preference");
  };
  const onResize = () => finish("resize");
  const onHash = () => finish("hash");
  const onHide = () => finish("navigation");
  const onScroll = () => finish("scroll");
  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("wheel", onScroll, { passive: true });
  document.addEventListener("touchmove", onScroll, { passive: true });
  window.addEventListener("hashchange", onHash);
  window.addEventListener("pagehide", onHide);
  window.addEventListener("storage", onPreference);
  window.addEventListener("pageshow", onReady);
  window.addEventListener("pagereveal", onReady);
  preference.addEventListener("change", onPreference);
  connection?.addEventListener("change", onPreference);
  watchdog = setTimeout(() => finish("timeout"), 1400);
  function animate(element, frames, duration, delay = 0) {
    const animation = element.animate(frames, {
      duration,
      delay,
      fill: "both",
      easing: "cubic-bezier(.2,.75,.2,1)",
    });
    animations.push(animation);
    return animation;
  }
  function handoff() {
    if (finished || !veil || reduced()) {
      finish("preference");
      return;
    }
    const art = veil.querySelector(".chapter-art");
    const from = art.getBoundingClientRect(),
      to = target.getBoundingClientRect();
    veil.classList.add("is-leaving");
    // The same SVG moves into its authored hero position. No cloned application runtime.
    art.style.left = from.x + "px";
    art.style.top = from.y + "px";
    art.style.width = from.width + "px";
    art.style.height = from.height + "px";
    art.style.transform = "none";
    animate(
      art,
      [
        { transform: "translate(0,0) scale(1)" },
        {
          transform: `translate(${to.x - from.x}px,${to.y - from.y}px) scale(${to.width / from.width},${to.height / from.height})`,
        },
      ],
      600,
    ).onfinish = () => finish();
    animate(
      veil.querySelector(".chapter-paper"),
      [{ opacity: 1 }, { opacity: 0 }],
      600,
    );
    for (const el of veil.querySelectorAll(
      ".chapter-caption,.chapter-title,.chapter-extra",
    ))
      animate(el, [{ opacity: 1 }, { opacity: 0 }], 240);
  }
  function mount() {
    if (!pending || finished) return;
    if (document.hidden) return;
    if (reduced() || location.hash) {
      finish("preference");
      return;
    }
    target = document.querySelector(
      chapter === "embedded"
        ? ".lab-cover-art svg"
        : ".exploration-cover figure svg",
    );
    if (!target || innerHeight < 420) {
      finish("layout");
      return;
    }
    try {
      const title =
        chapter === "embedded" ? "EMBEDDED SYSTEMS LAB" : "EXPLORATIONS";
      veil = document.createElement("section");
      veil.className = "chapter-entry";
      veil.dataset.chapter = chapter;
      veil.setAttribute("role", "region");
      veil.tabIndex = -1;
      veil.setAttribute(
        "aria-label",
        title + " introduction. Press Escape or Tab to continue.",
      );
      veil.innerHTML = `<div class="chapter-paper"></div><div class="chapter-caption" aria-hidden="true"><span>ARITRA SAHA / ENGINEERING NOTEBOOK</span><span>${chapter === "embedded" ? "CHAPTER 02 / SIGNAL" : "CHAPTER 03 / DISCOVERY"}</span></div><div class="chapter-art" aria-hidden="true"></div><p class="chapter-title" aria-hidden="true">${title}<small>${chapter === "embedded" ? "state → timing → signal" : "observe → model → question"}</small></p><div class="chapter-progress" aria-hidden="true"><i></i></div>`;
      const svg = target.cloneNode(true);
      svg.removeAttribute("role");
      svg.removeAttribute("aria-labelledby");
      svg.removeAttribute("aria-label");
      svg.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      svg
        .querySelectorAll("[pathLength]")
        .forEach((el) => el.removeAttribute("pathLength"));
      svg.querySelectorAll("title,desc").forEach((el) => el.remove());
      const extra = document.createElementNS("http://www.w3.org/2000/svg", "g");
      extra.setAttribute("class", "chapter-extra");
      extra.innerHTML =
        chapter === "embedded"
          ? `<path class="chapter-bus" d="M354 205H375V126H578"/><text x="389" y="300">f = 1/T</text>${Array.from({ length: 6 }, (_, i) => `<rect class="chapter-led" x="${389 + i * 32}" y="115" width="17" height="22" rx="2"/>`).join("")}`
          : `<text x="40" y="260">x = r cos θ</text><text x="390" y="365">p = |ψ|²</text>`;
      svg.append(extra);
      veil.querySelector(".chapter-art").append(svg);
      document.body.append(veil);
      if (getComputedStyle(veil).position !== "fixed") {
        finish("failure");
        return;
      }
      if (
        veil.querySelector(".chapter-title").getBoundingClientRect().bottom >
        innerHeight - 80
      ) {
        finish("layout");
        return;
      }
      clearTimeout(watchdog);
      watchdog = setTimeout(() => finish("timeout"), 2800);
      pending = false;
      root.dataset.chapterState = "running";
      document.getElementById("chapter-paint")?.remove();
      try {
        sessionStorage.setItem(key, "seen");
      } catch {
        /* Animation is still skippable when storage is unavailable. */
      }
      veil.addEventListener("click", () => finish("skip"));
      veil.focus({ preventScroll: true });
      window.addEventListener("resize", onResize);
      signal();
      for (const [index, line] of [
        ...svg.querySelectorAll("path,ellipse,rect,circle"),
      ].entries()) {
        if (line.classList.contains("chapter-led")) continue;
        const length = line.getTotalLength();
        line.style.strokeDasharray = String(length);
        animate(
          line,
          [
            { strokeDashoffset: length, opacity: 0 },
            { strokeDashoffset: 0, opacity: 1 },
          ],
          720,
          Math.min(index * 18, 500),
        );
      }
      for (const [index, led] of [
        ...svg.querySelectorAll(".chapter-led"),
      ].entries())
        animate(
          led,
          [{ opacity: 0.12 }, { opacity: 1 }],
          180,
          760 + index * 95,
        );
      svg.querySelectorAll("text").forEach((text, index) =>
        animate(
          text,
          [
            { opacity: 0, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          360,
          500 + Math.min(index * 65, 400),
        ),
      );
      const bus = svg.querySelector(".chapter-bus");
      if (bus) {
        const pulse = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        pulse.setAttribute("r", "4");
        pulse.setAttribute("fill", "currentColor");
        extra.append(pulse);
        const points = Array.from({ length: 25 }, (_, i) => {
          const p = bus.getPointAtLength((bus.getTotalLength() * i) / 24);
          return {
            transform: `translate(${p.x}px,${p.y}px)`,
            opacity: i === 0 || i === 24 ? 0 : 1,
          };
        });
        animate(pulse, points, 700, 650);
      }
      animate(
        veil.querySelector(".chapter-title"),
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        400,
        850,
      );
      handoffTimer = setTimeout(handoff, 1600);
    } catch {
      finish("failure");
    }
  }
  function onReady() {
    if (document.readyState !== "loading") mount();
  }
  document.addEventListener("readystatechange", onReady);
  onReady();
})();
