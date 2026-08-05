(() => {
  "use strict";

  const root = document.documentElement;
  const nav = document.getElementById("site-nav");
  const menuButton = document.getElementById("menu-toggle");
  const navPanel = document.getElementById("nav-panel");
  const themeButtons = [document.getElementById("theme-toggle"), document.getElementById("desktop-theme-toggle")].filter(Boolean);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionIsReduced = () => reducedMotion.matches || root.dataset.motion === "reduce";
  const finePointer = window.matchMedia("(pointer: fine)");
  const themeKey = "aritra-portal-theme";

  function updateThemeControls() {
    const light = root.dataset.theme === "light";
    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(light));
      button.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    });
    if (themeMeta) themeMeta.content = light ? "#f3efe6" : "#080b12";
  }

  function setTheme(theme, persist = true) {
    root.dataset.theme = theme;
    updateThemeControls();
    if (persist) {
      try { localStorage.setItem(themeKey, theme); } catch (_) { /* Storage may be unavailable. */ }
    }
  }

  updateThemeControls();
  themeButtons.forEach((button) => button.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light")));

  function closeMenu() {
    if (!nav || !menuButton) return;
    nav.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }

  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  navPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("pointerdown", (event) => { if (nav?.classList.contains("menu-open") && !nav.contains(event.target)) closeMenu(); });

  let scrollFrame = 0;
  function updateNavigation() {
    nav?.classList.toggle("scrolled", window.scrollY > 24);
    scrollFrame = 0;
  }
  updateNavigation();
  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNavigation);
  }, { passive: true });

  const revealItems = document.querySelectorAll(".reveal, .stagger-list");
  if (motionIsReduced() || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -5%" });
    revealItems.forEach((item) => observer.observe(item));
  }

  if (finePointer.matches && !motionIsReduced()) {
    let pointerFrame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight * 0.2;
    document.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${pointerX}px`);
        root.style.setProperty("--pointer-y", `${pointerY}px`);
        pointerFrame = 0;
      });
    }, { passive: true });

    document.querySelectorAll(".tilt-card").forEach((card) => {
      const limit = Number(card.dataset.tilt || 4);
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        card.style.transform = `perspective(1200px) rotateX(${-y * limit}deg) rotateY(${x * limit}deg) translateZ(0)`;
        if (card.classList.contains("support-panel")) {
          card.style.setProperty("--support-x", `${(x + 0.5) * 100}%`);
          card.style.setProperty("--support-y", `${(y + 0.5) * 100}%`);
        }
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const box = button.getBoundingClientRect();
        const x = event.clientX - box.left - box.width / 2;
        const y = event.clientY - box.top - box.height / 2;
        button.style.transform = `translate(${x * 0.1}px, ${y * 0.12}px)`;
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });

    const constellation = document.getElementById("constellation");
    const orbitLayers = constellation?.querySelectorAll(".product-orbit");
    let constellationFrame = 0;
    constellation?.addEventListener("pointermove", (event) => {
      if (constellationFrame) return;
      const box = constellation.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      constellationFrame = requestAnimationFrame(() => {
        orbitLayers?.forEach((layer) => {
          const depth = Number(layer.dataset.depth || 10);
          layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
        });
        constellationFrame = 0;
      });
    });
    constellation?.addEventListener("pointerleave", () => orbitLayers?.forEach((layer) => { layer.style.transform = ""; }));
  }

  const demoTasks = Array.from(document.querySelectorAll(".demo-task:not(.complete)"));
  let demoIndex = 0;
  let demoTimer = 0;
  function stopDemo() { if (demoTimer) window.clearInterval(demoTimer); demoTimer = 0; }
  function startDemo() {
    stopDemo();
    if (motionIsReduced() || document.hidden || !demoTasks.length) return;
    demoTimer = window.setInterval(() => {
      demoTasks.forEach((task) => task.classList.remove("complete"));
      demoTasks[demoIndex].classList.add("complete");
      demoIndex = (demoIndex + 1) % demoTasks.length;
    }, 4200);
  }
  document.addEventListener("visibilitychange", startDemo);
  reducedMotion.addEventListener?.("change", startDemo);
  startDemo();
})();
