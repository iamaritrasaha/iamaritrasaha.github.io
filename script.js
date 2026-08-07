(() => {
  "use strict";

  const root = document.documentElement;
  const nav = document.getElementById("site-nav");
  const menuButton = document.getElementById("menu-toggle");
  const navPanel = document.getElementById("nav-panel");
  const themeButton = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const signalCanvas = document.getElementById("signal-canvas");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const themeKey = "aritra-portal-theme";

  const motionReduced = () => reducedMotion.matches || root.dataset.motion === "reduce";

  function syncThemeControl() {
    const light = root.dataset.theme === "light";
    if (themeButton) {
      themeButton.setAttribute("aria-pressed", String(light));
      themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    }
    if (themeMeta) themeMeta.content = light ? "#eeece8" : "#07070b";
  }

  function setTheme(theme, save = true) {
    root.dataset.theme = theme;
    syncThemeControl();
    if (save) {
      try { localStorage.setItem(themeKey, theme); } catch (_) { /* Storage is optional. */ }
    }
    window.dispatchEvent(new Event("aritra-theme-change"));
  }

  syncThemeControl();
  themeButton?.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light"));

  function closeMenu() {
    if (!nav || !menuButton) return;
    nav.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  navPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("pointerdown", (event) => {
    if (nav?.classList.contains("menu-open") && !nav.contains(event.target)) closeMenu();
  });

  let scrollFrame = 0;
  function updateNav() {
    nav?.classList.toggle("is-scrolled", window.scrollY > 18);
    scrollFrame = 0;
  }
  updateNav();
  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNav);
  }, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  function revealAll() { revealItems.forEach((item) => item.classList.add("is-visible")); }
  if (motionReduced() || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -6%" });
    revealItems.forEach((item) => observer.observe(item));
  }

  if (finePointer.matches && !motionReduced()) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let currentX = cursorX;
    let currentY = cursorY;
    let pointerFrame = 0;

    document.addEventListener("pointermove", (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      root.classList.add("cursor-ready");
      if (!pointerFrame) pointerFrame = requestAnimationFrame(animateCursor);
    }, { passive: true });

    function animateCursor() {
      currentX += (cursorX - currentX) * .13;
      currentY += (cursorY - currentY) * .13;
      root.style.setProperty("--cursor-x", currentX + "px");
      root.style.setProperty("--cursor-y", currentY + "px");
      if (Math.abs(cursorX - currentX) + Math.abs(cursorY - currentY) > .3) pointerFrame = requestAnimationFrame(animateCursor);
      else pointerFrame = 0;
    }

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const limit = Number(card.dataset.tilt || 4);
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.transform = "perspective(1300px) rotateX(" + (-y * limit) + "deg) rotateY(" + (x * limit) + "deg) translateZ(0)";
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });

    const heroSystem = document.getElementById("hero-system");
    const orbitNodes = heroSystem?.querySelectorAll(".orbit, .data-card");
    let systemFrame = 0;
    heroSystem?.addEventListener("pointermove", (event) => {
      if (systemFrame) return;
      const bounds = heroSystem.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      systemFrame = requestAnimationFrame(() => {
        orbitNodes?.forEach((node, index) => {
          const depth = 10 + index * 5;
          node.style.transform = "translate3d(" + (x * depth) + "px, " + (y * depth) + "px, 0)";
        });
        systemFrame = 0;
      });
    });
    heroSystem?.addEventListener("pointerleave", () => orbitNodes?.forEach((node) => { node.style.transform = ""; }));

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const bounds = button.getBoundingClientRect();
        const x = event.clientX - bounds.left - bounds.width / 2;
        const y = event.clientY - bounds.top - bounds.height / 2;
        button.style.transform = "translate(" + (x * .09) + "px, " + (y * .1) + "px)";
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });
  }

  const signalData = {
    clarity: {
      label: "CLARITY / 01",
      title: "Less interface. More understanding.",
      copy: "The best interaction is often the one that leaves the user with more attention than it took."
    },
    privacy: {
      label: "PRIVACY / 02",
      title: "The personal should stay personal.",
      copy: "Trust is built into the decisions behind a product, especially when someone is sharing their time, context and attention."
    },
    purpose: {
      label: "PURPOSE / 03",
      title: "Every action should earn its place.",
      copy: "Useful products do not ask for more. They make a meaningful next step feel obvious, timely and human."
    }
  };
  const signalButtons = Array.from(document.querySelectorAll(".signal-option"));
  const output = document.querySelector(".signal-output");
  const label = document.getElementById("signal-label");
  const title = document.getElementById("signal-title");
  const copy = document.getElementById("signal-copy");

  function selectSignal(signal) {
    const data = signalData[signal];
    if (!data || !label || !title || !copy || !output) return;
    signalButtons.forEach((button) => {
      const active = button.dataset.signal === signal;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    output.style.opacity = "0";
    output.style.transform = "translateY(5px)";
    window.setTimeout(() => {
      label.textContent = data.label;
      title.textContent = data.title;
      copy.textContent = data.copy;
      output.dataset.active = signal;
      output.style.opacity = "";
      output.style.transform = "";
    }, 145);
  }
  signalButtons.forEach((button) => button.addEventListener("click", () => selectSignal(button.dataset.signal)));

  if (signalCanvas && !motionReduced()) {
    const context = signalCanvas.getContext("2d");
    let nodes = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let drawFrame = 0;
    let activeCanvas = true;

    function palette() {
      return root.dataset.theme === "light"
        ? { dot: "rgba(67, 46, 146, .34)", line: "rgba(41, 35, 62, .095)", accent: "rgba(19, 141, 185, .24)" }
        : { dot: "rgba(170, 145, 255, .38)", line: "rgba(180, 176, 235, .105)", accent: "rgba(112, 215, 255, .29)" };
    }

    function resizeCanvas() {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      signalCanvas.width = Math.floor(canvasWidth * scale);
      signalCanvas.height = Math.floor(canvasHeight * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const count = Math.min(66, Math.max(26, Math.round(canvasWidth / 29)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - .5) * .16,
        vy: (Math.random() - .5) * .16,
        r: Math.random() * 1.35 + .35
      }));
    }

    function drawNetwork() {
      if (!activeCanvas) { drawFrame = 0; return; }
      const colors = palette();
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10 || node.x > canvasWidth + 10) node.vx *= -1;
        if (node.y < -10 || node.y > canvasHeight + 10) node.vy *= -1;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const near = nodes[j];
          const dx = node.x - near.x;
          const dy = node.y - near.y;
          const distance = dx * dx + dy * dy;
          if (distance < 12500) {
            context.globalAlpha = 1 - distance / 12500;
            context.strokeStyle = colors.line;
            context.lineWidth = .65;
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(near.x, near.y);
            context.stroke();
          }
        }
      }
      context.globalAlpha = 1;
      nodes.forEach((node, index) => {
        context.fillStyle = index % 9 === 0 ? colors.accent : colors.dot;
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fill();
      });
      drawFrame = requestAnimationFrame(drawNetwork);
    }

    resizeCanvas();
    drawNetwork();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("aritra-theme-change", () => { /* Palette is read on the next frame. */ });
    document.addEventListener("visibilitychange", () => {
      activeCanvas = !document.hidden;
      if (activeCanvas && !drawFrame) drawNetwork();
    });
  }

  reducedMotion.addEventListener?.("change", () => {
    if (motionReduced()) revealAll();
  });
})();
