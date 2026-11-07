import { mountProjection } from "./assets/projection-motion.js?v=s1";
import { mountResearchPlate } from "./assets/research-plate.js?v=20260930.1";
import { mountNeuronDemo } from "./assets/neuron-demo.js?v=r1";
import { createSurfacePhysics } from "./assets/surface-physics.js?v=20260930.1";

// Homepage scene lifecycles and progressive enhancements. The independent
// navigation.js controller is ready before these heavier modules load.
const root = document.documentElement;
const disclosureAnimations = new Map();
function settleDisclosure(details, entry) {
  // Detach callbacks before cancelling: settling must commit the requested
  // native state rather than run the interrupted animation's cleanup twice.
  entry.animation.onfinish = null;
  entry.animation.oncancel = null;
  entry.animation.cancel();
  details.open = entry.opening;
  details.style.height = "";
  details.style.overflow = "";
  disclosureAnimations.delete(details);
}
const media = matchMedia("(prefers-reduced-motion: reduce)");
const saveData = () => Boolean(navigator.connection?.saveData);
let userReduced =
  new URLSearchParams(location.search).get("motion") === "reduce";
try {
  userReduced ||= localStorage.getItem("portfolio-reduced-motion") === "true";
} catch {
  /* Optional local preference. */
}
const reduced = () => media.matches || userReduced || saveData();
mountResearchPlate(document.getElementById("research-plate"));
const playNetwork = mountNeuronDemo(document.getElementById("neuron-demo"));
const setSurfaceMotion = createSurfacePhysics(
  document.querySelectorAll(".project-art"),
);
const projection = document.querySelector(".instrument");
const playProjection = mountProjection(projection);
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
  playProjection(allowed && visible.has(projection));
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
    motionButton.disabled = media.matches || saveData();
    motionButton.textContent = reduced() ? "Motion reduced" : "Pause motion";
    motionButton.setAttribute("aria-pressed", String(reduced()));
  });
  updateScenes();
}
media.addEventListener("change", syncMotion);
navigator.connection?.addEventListener("change", syncMotion);
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
window.addEventListener("storage", (event) => {
  try {
    if (event.storageArea !== localStorage) return;
  } catch {
    return;
  }
  if (event.key !== "portfolio-reduced-motion" && event.key !== null) return;
  userReduced =
    event.newValue === "true" ||
    new URLSearchParams(location.search).get("motion") === "reduce";
  syncMotion();
});
document.addEventListener("visibilitychange", updateScenes);
window.addEventListener("pagehide", () => playProjection(false));
window.addEventListener("pageshow", updateScenes);
syncMotion();

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
} else {
  scenes.forEach((scene) => visible.add(scene));
  updateScenes();
}

// Animate the disclosure as a single measured block; cancellation preserves native state.
function mountDisclosure(details) {
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
}
document.querySelectorAll("details").forEach(mountDisclosure);
const copyEmail = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");
if (copyEmail && copyStatus && navigator.clipboard?.writeText) {
  copyEmail.closest(".contact-copy").hidden = false;
  copyEmail.hidden = false;
  copyEmail.addEventListener("click", async () => {
    copyEmail.disabled = true;
    copyStatus.textContent = "";
    try {
      const address = document.querySelector(".contact-email").href.slice(7);
      await navigator.clipboard.writeText(address);
      copyStatus.textContent = "Email address copied.";
    } catch {
      copyStatus.textContent =
        "Couldn’t copy. Select the email address above, or open the email link.";
    } finally {
      copyEmail.disabled = false;
    }
  });
}
