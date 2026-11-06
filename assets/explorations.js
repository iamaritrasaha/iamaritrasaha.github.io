// Scoped folio motion: all content and drawings remain available without JS.
const root = document.documentElement;
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const queryReduced =
  new URLSearchParams(location.search).get("motion") === "reduce";
let userReduced = false;
try {
  userReduced = localStorage.getItem("portfolio-reduced-motion") === "true";
} catch {
  /* Optional preference. */
}
const scenes = [...document.querySelectorAll(".exploration-scene")];
const visible = new Set();
const buttons = [...document.querySelectorAll("[data-exploration-motion]")];
document.addEventListener("portfolio:chapter", sync);
function sync() {
  const forced = preference.matches || Boolean(navigator.connection?.saveData);
  const reduced = forced || queryReduced || userReduced;
  root.dataset.motion = reduced ? "reduce" : "full";
  for (const scene of scenes)
    scene.classList.toggle(
      "scene-active",
      !reduced &&
        !["pending", "running"].includes(root.dataset.chapterState) &&
        !document.hidden &&
        visible.has(scene),
    );
  for (const button of buttons) {
    button.hidden = false;
    button.disabled = forced || queryReduced;
    button.textContent = reduced ? "Motion reduced" : "Pause motion";
    button.setAttribute("aria-pressed", String(reduced));
  }
}
for (const button of buttons)
  button.addEventListener("click", () => {
    userReduced = !userReduced;
    try {
      localStorage.setItem("portfolio-reduced-motion", String(userReduced));
    } catch {
      /* Optional preference. */
    }
    sync();
  });
preference.addEventListener("change", sync);
navigator.connection?.addEventListener("change", sync);
document.addEventListener("visibilitychange", sync);
window.addEventListener("pageshow", sync);
window.addEventListener("storage", (event) => {
  try {
    if (event.storageArea !== localStorage) return;
  } catch {
    return;
  }
  if (event.key !== "portfolio-reduced-motion" && event.key !== null) return;
  userReduced = event.newValue === "true";
  sync();
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  });
  scenes.forEach((scene) => observer.observe(scene));
} else scenes.forEach((scene) => visible.add(scene));
sync();
