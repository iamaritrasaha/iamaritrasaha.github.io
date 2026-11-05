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
    mobile.addEventListener("change", () => closeMenu());
  }
})();
