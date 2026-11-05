// Runs in the head, before the homepage can paint. No model dependencies.
(() => {
  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reload =
    performance.getEntriesByType("navigation")[0]?.type === "reload";
  const connection = navigator.connection;
  function reduced() {
    let saved = false;
    try {
      saved = localStorage.getItem("portfolio-reduced-motion") === "true";
    } catch {
      /* Storage is optional. */
    }
    return (
      motion.matches ||
      connection?.saveData ||
      saved ||
      root.dataset.motion === "reduce" ||
      new URLSearchParams(location.search).get("motion") === "reduce"
    );
  }
  const eligible = () =>
    !reduced() &&
    !document.hidden &&
    (!location.hash || reload) &&
    typeof Element.prototype.animate === "function";
  let pending = eligible(),
    timer;
  const key = (event) => {
    if (event.key === "Escape" || event.key === "Tab") cancel();
  };
  const visibility = () => {
    if (document.hidden) cancel();
  };
  const preference = () => {
    if (reduced()) cancel();
  };
  function disarm() {
    clearTimeout(timer);
    document.removeEventListener("keydown", key);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("hashchange", cancel);
    window.removeEventListener("pagehide", cancel);
    motion.removeEventListener("change", preference);
    connection?.removeEventListener("change", preference);
  }
  function cancel() {
    if (!pending) return;
    pending = false;
    disarm();
    root.dataset.welcomeState = "bypassed";
    document.getElementById("welcome-paint")?.remove();
  }
  window.portfolioWelcome = {
    get pending() {
      return pending;
    },
    show(veil) {
      if (!pending || !eligible()) {
        cancel();
        return false;
      }
      // Append first, then remove the cover in the same task: no exposed frame.
      document.body.append(veil);
      pending = false;
      disarm();
      root.dataset.welcomeState = "running";
      document.getElementById("welcome-paint")?.remove();
      return true;
    },
    finish() {
      if (root.dataset.welcomeState === "running")
        root.dataset.welcomeState = "complete";
    },
  };
  root.dataset.welcomeState = pending ? "pending" : "bypassed";
  if (!pending) return;
  document.addEventListener("keydown", key);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("hashchange", cancel);
  window.addEventListener("pagehide", cancel);
  motion.addEventListener("change", preference);
  connection?.addEventListener("change", preference);
  // If a module fails or stalls, reveal the portfolio and suppress a late intro.
  timer = setTimeout(cancel, 4000);
})();
