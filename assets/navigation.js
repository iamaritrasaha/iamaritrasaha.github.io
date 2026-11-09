(() => {
  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu-toggle");
  const panel = document.getElementById("nav-panel");
  const mobile = matchMedia("(max-width: 650px)");
  function closeMenu(returnFocus = false) {
    const wasOpen = menu?.getAttribute("aria-expanded") === "true";
    menu?.setAttribute("aria-expanded", "false");
    panel?.classList.remove("is-open");
    if (wasOpen && returnFocus) menu.focus();
  }
  if (menu && panel && nav) {
    menu.hidden = false;
    nav.classList.add("nav-ready");
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
    });
    panel
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", () => closeMenu()));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu(true);
    });
    document.addEventListener("pointerdown", (e) => {
      if (!nav.contains(e.target)) closeMenu();
    });
    nav.addEventListener("focusout", (event) => {
      if (!nav.contains(event.relatedTarget)) closeMenu();
    });
    mobile.addEventListener("change", () => closeMenu());
  }
  // Keep reading order at fragment destinations, including cross-page arrivals.
  // Native anchors continue to own scrolling and work without JavaScript.
  function focusFragment(shouldScroll = false) {
    let target;
    try {
      target = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
    } catch {
      return;
    }
    if (!target) return;
    const details = target.closest("details");
    if (details && !details.open) {
      details.open = true;
      target.scrollIntoView({ behavior: "instant", block: "start" });
    } else if (shouldScroll) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (!target.matches("a, button, input, select, textarea, [tabindex]"))
      target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
  addEventListener("hashchange", () => focusFragment(false));
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (
      link?.hash &&
      link.origin === location.origin &&
      link.pathname === location.pathname &&
      link.hash === location.hash
    )
      requestAnimationFrame(() => focusFragment(true));
  });
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", focusFragment, {
      once: true,
    });
  else focusFragment();
})();
