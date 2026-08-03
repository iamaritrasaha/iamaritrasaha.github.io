(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const storageKey = "aritra-portal-theme";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  const menu = document.getElementById("primary-menu");

  const applyTheme = (theme, persist = true) => {
    const isLight = theme === "light";
    root.classList.toggle("light", isLight);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.setAttribute("aria-label", isLight ? "Activate dark theme" : "Activate light theme");
    }
    if (persist) {
      localStorage.setItem(storageKey, theme);
    }
  };

  const initializeTheme = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "dark" || stored === "light") {
      applyTheme(stored, false);
      return;
    }
    applyTheme("dark", false);
  };

  initializeTheme();

  themeToggle?.addEventListener("click", () => {
    const next = root.classList.contains("light") ? "dark" : "light";
    applyTheme(next);
  });

  if (menuToggle && menu && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        nav.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const syncScrolledNav = () => {
    if (!nav) {
      return;
    }
    nav.classList.toggle("is-scrolled", window.scrollY > 14);
  };

  syncScrolledNav();
  window.addEventListener("scroll", syncScrolledNav, { passive: true });

  const revealNodes = Array.from(document.querySelectorAll(".reveal, .stagger-list, .closing-panel"));

  if (prefersReducedMotion.matches) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const target = entry.target;
          target.classList.add("is-visible");
          obs.unobserve(target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    revealNodes.forEach((node) => observer.observe(node));
  }

  const setRevealDelays = () => {
    document.querySelectorAll(".reveal").forEach((node, index) => {
      const order = Math.min(index % 8, 7);
      node.style.setProperty("--delay", `${order * 35}ms`);
    });
  };
  setRevealDelays();

  const heroArt = document.getElementById("hero-art");
  const parallaxLayers = heroArt ? Array.from(heroArt.querySelectorAll(".parallax-layer")) : [];

  if (heroArt && parallaxLayers.length && !prefersReducedMotion.matches) {
    let rafId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const onPointerMove = (event) => {
      const bounds = heroArt.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      pointerX = Math.max(-0.5, Math.min(0.5, px));
      pointerY = Math.max(-0.5, Math.min(0.5, py));

      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        parallaxLayers.forEach((layer) => {
          const depth = Number(layer.getAttribute("data-depth") || "6");
          const tx = pointerX * depth;
          const ty = pointerY * depth;
          layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
        rafId = 0;
      });
    };

    const resetLayers = () => {
      parallaxLayers.forEach((layer) => {
        layer.style.transform = "";
      });
    };

    heroArt.addEventListener("pointermove", onPointerMove);
    heroArt.addEventListener("pointerleave", resetLayers);
  }
})();
