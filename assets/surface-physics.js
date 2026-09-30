// Small, local spring responses. Layout and focus remain under native control.
const STIFFNESS = 160;
const DAMPING = 24;
const MAX_STEP = 1 / 120;
const MAX_ELAPSED = 0.05;
const LIMIT = 4;

// Unit mass, damping ratio 0.949: a quick response with very little overshoot.
export function stepSpring(position, velocity, target, elapsed) {
  let remaining = Math.min(Math.max(elapsed, 0), MAX_ELAPSED);
  while (remaining > 0) {
    const dt = Math.min(remaining, MAX_STEP);
    velocity += (STIFFNESS * (target - position) - DAMPING * velocity) * dt;
    position += velocity * dt;
    remaining -= dt;
  }
  if (Math.abs(target - position) < 0.002 && Math.abs(velocity) < 0.02) {
    return { position: target, velocity: 0 };
  }
  return { position, velocity };
}

export function createSurfacePhysics(elements) {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const states = [...elements].map((element) => ({
    element,
    visible: false,
    bounds: null,
    targets: [0, 0, 0],
    axes: [0, 0, 0].map(() => ({ position: 0, velocity: 0 })),
  }));
  const byElement = new Map(states.map((state) => [state.element, state]));
  const moving = new Set();
  let enabled = false;
  let frame = 0;
  let previous = 0;
  const allowed = () => enabled && finePointer.matches && !document.hidden;

  function paint(state) {
    const [x, y, lift] = state.axes;
    state.element.style.setProperty("--tilt-x", `${x.position.toFixed(3)}deg`);
    state.element.style.setProperty("--tilt-y", `${y.position.toFixed(3)}deg`);
    state.element.style.setProperty("--lift", `${lift.position.toFixed(3)}px`);
  }

  function reset(state) {
    state.targets.fill(0);
    state.axes.forEach((axis) => {
      axis.position = 0;
      axis.velocity = 0;
    });
    state.bounds = null;
    moving.delete(state);
    paint(state);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  }

  function tick(stamp) {
    frame = 0;
    if (!allowed()) {
      states.forEach(reset);
      previous = 0;
      return;
    }
    const elapsed = previous ? (stamp - previous) / 1000 : 1 / 60;
    previous = stamp;
    moving.forEach((state) => {
      if (!state.visible) {
        reset(state);
        return;
      }
      let settled = true;
      state.axes.forEach((axis, index) => {
        const next = stepSpring(
          axis.position,
          axis.velocity,
          state.targets[index],
          elapsed,
        );
        axis.position = Math.max(-LIMIT, Math.min(LIMIT, next.position));
        axis.velocity = next.velocity;
        if (axis.position !== state.targets[index] || axis.velocity !== 0)
          settled = false;
      });
      paint(state);
      if (settled) moving.delete(state);
    });
    if (moving.size) frame = requestAnimationFrame(tick);
    else previous = 0;
  }

  function wake(state) {
    if (!allowed() || !state.visible) return;
    moving.add(state);
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function point(state, event) {
    if (!allowed() || !state.visible || event.pointerType === "touch") return;
    if (!state.bounds) state.bounds = state.element.getBoundingClientRect();
    const bounds = state.bounds;
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
    );
    const y = Math.max(
      -1,
      Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
    );
    state.targets = [-y * LIMIT, x * LIMIT, -LIMIT];
    wake(state);
  }

  states.forEach((state) => {
    const { element } = state;
    element.addEventListener(
      "pointerenter",
      (event) => {
        if (!allowed() || event.pointerType === "touch") return;
        state.bounds = element.getBoundingClientRect();
        point(state, event);
      },
      { passive: true },
    );
    element.addEventListener("pointermove", (event) => point(state, event), {
      passive: true,
    });
    element.addEventListener(
      "pointerleave",
      () => {
        state.bounds = null;
        state.targets.fill(0);
        wake(state);
      },
      { passive: true },
    );
    element.addEventListener(
      "pointercancel",
      () => {
        reset(state);
        if (!moving.size) stop();
      },
      { passive: true },
    );
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = byElement.get(entry.target);
        state.visible = entry.isIntersecting;
        if (!state.visible) reset(state);
      });
      if (!moving.size) stop();
    });
    states.forEach(({ element }) => observer.observe(element));
  } else {
    // Progressive fallback: static surfaces need no scroll polling.
    states.forEach(reset);
  }

  window.addEventListener("resize", () => states.forEach(reset), {
    passive: true,
  });

  const reconcile = () => {
    if (allowed()) return;
    stop();
    states.forEach(reset);
  };
  finePointer.addEventListener("change", reconcile);
  document.addEventListener("visibilitychange", reconcile);

  return (value) => {
    enabled = Boolean(value);
    reconcile();
  };
}
