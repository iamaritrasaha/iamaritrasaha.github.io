import assert from "node:assert/strict";
import test from "node:test";
import { stepSpring } from "../assets/surface-physics.js";

const REFRESH_RATES = [30, 60, 120, 144, 240];
const resting = () => ({ position: 0, velocity: 0 });

// Sample at equal wall-clock times, including partial frames at boundaries.
function advance(initial, target, seconds, frameTimes) {
  let state = { ...initial };
  let elapsed = 0;
  let frame = 0;
  let peak = Math.abs(state.position);
  while (elapsed < seconds - 1e-12) {
    const dt = Math.min(
      frameTimes[frame++ % frameTimes.length],
      seconds - elapsed,
    );
    state = stepSpring(state.position, state.velocity, target, dt);
    assert.ok(Number.isFinite(state.position), "Position remains finite");
    assert.ok(Number.isFinite(state.velocity), "Velocity remains finite");
    peak = Math.max(peak, Math.abs(state.position));
    elapsed += dt;
  }
  return { ...state, peak };
}

function stateOf({ position, velocity }) {
  return { position, velocity };
}

test("response stays consistent across 30 to 240 Hz at equal elapsed times", () => {
  for (const seconds of [0.1, 0.2, 0.5, 1]) {
    const reference = advance(resting(), 4, seconds, [1 / 120]);
    for (const hz of REFRESH_RATES) {
      const actual = advance(resting(), 4, seconds, [1 / hz]);
      assert.ok(
        Math.abs(actual.position - reference.position) < 0.08,
        `${hz} Hz position differs by less than 0.08 degrees at ${seconds}s`,
      );
      assert.ok(
        Math.abs(actual.velocity - reference.velocity) < 0.35,
        `${hz} Hz velocity remains close to the reference at ${seconds}s`,
      );
    }
  }
});

test("irregular frame intervals preserve the same physical response", () => {
  const jitter = [1 / 120, 1 / 50, 1 / 90, 1 / 60, 1 / 144];
  for (const seconds of [0.1, 0.2, 0.5, 1]) {
    const reference = advance(resting(), 4, seconds, [1 / 120]);
    const actual = advance(resting(), 4, seconds, jitter);
    assert.ok(Math.abs(actual.position - reference.position) < 0.08);
  }
});

test("a full pointer deflection settles without perceptible overshoot", () => {
  for (const hz of REFRESH_RATES) {
    for (const target of [-4, 4]) {
      const actual = advance(resting(), target, 2, [1 / hz]);
      assert.ok(actual.peak <= 4.01, `${hz} Hz stays within 0.01 degrees`);
      assert.deepEqual(stateOf(actual), { position: target, velocity: 0 });
    }
  }
});

test("direction reversal stays bounded and pointer exit reaches exact rest", () => {
  for (const hz of REFRESH_RATES) {
    const outward = advance(resting(), 4, 0.15, [1 / hz]);
    assert.ok(outward.velocity > 0, "Reverse while the surface still moves");
    const reversed = advance(outward, -4, 2, [1 / hz]);
    assert.ok(reversed.peak <= 4.01, "Reversal has no visible overshoot");
    assert.deepEqual(stateOf(reversed), { position: -4, velocity: 0 });
    const returned = advance(reversed, 0, 2, [1 / hz]);
    assert.deepEqual(stateOf(returned), resting());
    // Exact rest lets the DOM controller stop requesting animation frames.
    assert.deepEqual(stepSpring(0, 0, 0, 1 / hz), resting());
  }
});

test("a delayed frame cannot inject a large time jump", () => {
  const bounded = stepSpring(1, 6, 4, 0.05);
  for (const stalledSeconds of [0.1, 1, 10, 1000]) {
    assert.deepEqual(stepSpring(1, 6, 4, stalledSeconds), bounded);
  }
  assert.ok(bounded.position > 1 && bounded.position < 4);
});

test("zero or reversed clock deltas do not advance an active spring", () => {
  for (const elapsed of [0, -0.01, -1]) {
    assert.deepEqual(stepSpring(1, 6, 4, elapsed), {
      position: 1,
      velocity: 6,
    });
  }
});
