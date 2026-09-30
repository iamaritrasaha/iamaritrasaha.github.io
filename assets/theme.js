(() => {
  const root = document.documentElement;
  const key = "portfolio-theme";
  const system = window.matchMedia?.("(prefers-color-scheme: dark)");
  let preference = "system";
  let paletteRevision = 0;

  try {
    const saved = localStorage.getItem(key);
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {
    // The system preference still works when browser storage is unavailable.
  }

  function apply() {
    const revision = ++paletteRevision;
    // Commit foreground and background colors together, without mixed palettes.
    root.dataset.themeChanging = "";
    const theme =
      preference === "system"
        ? system?.matches
          ? "dark"
          : "light"
        : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#211f24" : "#f4efe7");
    document.dispatchEvent(
      new CustomEvent("portfolio:themechange", {
        detail: { theme, preference },
      }),
    );
    const finish = () => {
      if (revision === paletteRevision) delete root.dataset.themeChanging;
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => window.requestAnimationFrame(finish));
    } else finish();
  }

  function followSystem() {
    if (preference === "system") apply();
  }

  if (system?.addEventListener) system.addEventListener("change", followSystem);
  else system?.addListener(followSystem);

  // Run synchronously in the head so the first styled frame has the right theme.
  apply();

  function connectControl() {
    const select = document.getElementById("theme-select");
    if (!select) return;
    select.value = preference;
    select.addEventListener("change", () => {
      preference = ["light", "dark"].includes(select.value)
        ? select.value
        : "system";
      try {
        if (preference === "system") localStorage.removeItem(key);
        else localStorage.setItem(key, preference);
      } catch {
        // Keep the selected appearance for this page even without persistence.
      }
      apply();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connectControl, {
      once: true,
    });
  } else connectControl();
})();
