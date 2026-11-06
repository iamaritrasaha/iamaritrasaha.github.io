// Native snapshots bridge repeat visits. The chapter artwork owns first entrances.
(() => {
  const chapters = new Set(["/", "/embedded/", "/explorations/"]);
  const reduced = () => {
    let saved = false;
    try {
      saved = localStorage.getItem("portfolio-reduced-motion") === "true";
    } catch {
      /* Optional storage. */
    }
    return (
      saved ||
      document.documentElement.dataset.motion === "reduce" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      navigator.connection?.saveData ||
      new URLSearchParams(location.search).get("motion") === "reduce"
    );
  };
  addEventListener("pageswap", (event) => {
    if (!event.viewTransition) return;
    // Either document can skip the shared transition and reject ready.
    event.viewTransition.ready.catch(() => {});
    const destination = event.activation?.entry?.url;
    const target = destination ? new URL(destination) : null;
    if (
      reduced() ||
      !target ||
      target.origin !== location.origin ||
      !chapters.has(target.pathname) ||
      target.hash ||
      event.activation?.navigationType === "traverse"
    )
      event.viewTransition.skipTransition();
  });
  addEventListener("pagereveal", (event) => {
    if (!event.viewTransition) return;
    event.viewTransition.ready.catch(() => {});
    const root = document.documentElement;
    if (
      reduced() ||
      location.hash ||
      ["pending", "running"].includes(root.dataset.chapterState) ||
      ["pending", "running"].includes(root.dataset.welcomeState) ||
      performance.getEntriesByType("navigation")[0]?.type === "back_forward"
    )
      event.viewTransition.skipTransition();
  });
})();
