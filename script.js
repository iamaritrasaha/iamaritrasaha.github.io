import { mountResearchPlate } from "./assets/research-plate.js?v=20260930.1";
import { mountNeuronDemo } from "./assets/neuron-demo.js?v=20260930.8";
import { createSurfacePhysics } from "./assets/surface-physics.js?v=20260930.1";

// Native navigation and progressive enhancements. All content exists without JS.
const root = document.documentElement;
const disclosureAnimations = new Map();
function settleDisclosure(details, entry) {
  entry.animation.onfinish = null;
  entry.animation.oncancel = null;
  entry.animation.cancel();
  details.open = entry.opening;
  details.style.height = "";
  details.style.overflow = "";
  disclosureAnimations.delete(details);
}
const media = matchMedia("(prefers-reduced-motion: reduce)");
const saveData = Boolean(navigator.connection?.saveData);
let userReduced =
  new URLSearchParams(location.search).get("motion") === "reduce";
try {
  userReduced ||= localStorage.getItem("portfolio-reduced-motion") === "true";
} catch {
  /* Optional local preference. */
}
const reduced = () => media.matches || userReduced || saveData;
mountResearchPlate(document.getElementById("research-plate"));
const playNetwork = mountNeuronDemo(document.getElementById("neuron-demo"));
const setSurfaceMotion = createSurfacePhysics(
  document.querySelectorAll(".project-art"),
);
const scenes = [...document.querySelectorAll(".motion-scene")];
const visible = new Set();
const network = document.querySelector(".neural-study");
const networkButton = document.getElementById("sequence-toggle");
const motionButtons = [...document.querySelectorAll("[data-motion-toggle]")];
let networkPaused = false;
function updateScenes() {
  const allowed = !reduced() && !document.hidden;
  scenes.forEach((scene) =>
    scene.classList.toggle("scene-active", allowed && visible.has(scene)),
  );
  playNetwork(allowed && visible.has(network) && !networkPaused);
  if (networkButton) {
    networkButton.hidden = false;
    networkButton.disabled = reduced();
    networkButton.textContent = reduced()
      ? "Motion off"
      : networkPaused
        ? "Play"
        : "Pause";
    networkButton.setAttribute(
      "aria-label",
      networkPaused ? "Play neural animation" : "Pause neural animation",
    );
    networkButton.setAttribute(
      "aria-pressed",
      String(allowed && !networkPaused),
    );
  }
}
function syncMotion() {
  if (reduced())
    disclosureAnimations.forEach((entry, details) =>
      settleDisclosure(details, entry),
    );
  root.dataset.motion = reduced() ? "reduce" : "full";
  setSurfaceMotion(!reduced());
  if (reduced())
    document
      .querySelectorAll(".is-entering")
      .forEach((el) => el.classList.remove("is-entering"));
  motionButtons.forEach((motionButton) => {
    motionButton.hidden = false;
    motionButton.disabled = media.matches || saveData;
    motionButton.textContent = reduced() ? "Motion reduced" : "Pause motion";
    motionButton.setAttribute("aria-pressed", String(reduced()));
  });
  updateScenes();
}
media.addEventListener("change", syncMotion);
motionButtons.forEach((motionButton) =>
  motionButton.addEventListener("click", () => {
    userReduced = !userReduced;
    try {
      localStorage.setItem("portfolio-reduced-motion", String(userReduced));
    } catch {
      /* Optional. */
    }
    syncMotion();
  }),
);
networkButton?.addEventListener("click", () => {
  networkPaused = !networkPaused;
  updateScenes();
});
document.addEventListener("visibilitychange", updateScenes);
syncMotion();

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

if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      updateScenes();
    },
    { threshold: 0 },
  );
  scenes.forEach((scene) => sceneObserver.observe(scene));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!reduced()) {
          entry.target.classList.add("is-entering");
          entry.target.addEventListener(
            "animationend",
            () => entry.target.classList.remove("is-entering"),
            { once: true },
          );
        }
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const siblings = [
      ...el.parentElement.querySelectorAll(":scope > [data-reveal]"),
    ];
    el.style.setProperty(
      "--stagger",
      `${Math.min(siblings.indexOf(el), 2) * 70}ms`,
    );
    revealObserver.observe(el);
  });
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-panel a[href^="#"]').forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-10% 0px -70% 0px" },
  );
  document
    .querySelectorAll("main > section[id]")
    .forEach((section) => navObserver.observe(section));
} else {
  scenes.forEach((scene) => visible.add(scene));
  updateScenes();
}

// Animate the disclosure as a single measured block; cancellation preserves native state.
document.querySelectorAll("details").forEach((details) => {
  const summary = details.querySelector("summary");
  summary.addEventListener("click", (event) => {
    if (reduced() || typeof details.animate !== "function") return;
    event.preventDefault();
    const previous = disclosureAnimations.get(details);
    const opening = previous ? !previous.opening : !details.open;
    const start = details.getBoundingClientRect().height;
    if (previous) {
      previous.animation.onfinish = null;
      previous.animation.oncancel = null;
      previous.animation.cancel();
    }
    details.style.height = "";
    details.style.overflow = "hidden";
    if (opening) details.open = true;
    const end = opening
      ? details.getBoundingClientRect().height
      : summary.getBoundingClientRect().height + 2;
    const animation = details.animate(
      { height: [`${start}px`, `${end}px`] },
      { duration: 340, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    const entry = { animation, opening };
    disclosureAnimations.set(details, entry);
    const finish = () => {
      if (disclosureAnimations.get(details) !== entry) return;
      details.open = opening;
      details.style.height = "";
      details.style.overflow = "";
      disclosureAnimations.delete(details);
      updateScenes();
    };
    animation.onfinish = finish;
    animation.oncancel = () => {
      if (disclosureAnimations.get(details) !== entry) return;
      details.style.height = "";
      details.style.overflow = "";
      disclosureAnimations.delete(details);
    };
  });
});
function revealHashTarget() {
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
  }
}
window.addEventListener("hashchange", revealHashTarget);
revealHashTarget();
