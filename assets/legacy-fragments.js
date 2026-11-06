// Published homepage bookmarks, relocated without a router or a welcome replay.
(() => {
  if (!["/", "/index.html"].includes(location.pathname)) return;
  const destinations = {
    pulseshift: "/embedded/#pulseshift",
    "pulseshift-title": "/embedded/#pulseshift",
    "pulse-rpm": "/embedded/#pulseshift",
    vyren: "/explorations/#vyren",
    "vyren-title": "/explorations/#vyren",
    relay: "/explorations/#relay",
    "relay-title": "/explorations/#relay",
    index: "/explorations/#index",
    aether: "/explorations/#aether",
    orbis: "/explorations/#orbis",
    arthrekha: "/explorations/#arthrekha",
    vector: "/explorations/#vector",
    quanta: "/explorations/#quanta",
    veyra: "/explorations/#veyra",
    serein: "/explorations/#serein",
    aura: "/explorations/#aura",
    lumina: "/explorations/#lumina",
    foresight: "/explorations/#foresight",
    novarx: "/explorations/#novarx",
  };
  function relocate() {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    if (!Object.hasOwn(destinations, id)) return;
    const target = new URL(destinations[id], location.origin);
    target.search = location.search;
    location.replace(target.href);
  }
  relocate();
  addEventListener("hashchange", relocate);
})();
