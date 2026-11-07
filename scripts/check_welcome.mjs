import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CIPHER_SYMBOLS,
  INITIAL_FIELD,
  clamp,
  easeOutQuart,
  latchProgress,
  getCharacterCadence,
  computeFaceState,
} from "../assets/welcome-reel.js";

const TARGET = "Aritra Saha";
const PREFERRED_ALPHABET = new Set([
  "0",
  "1",
  "A",
  "F",
  "7",
  "X",
  "#",
  "/",
  "{",
  "}",
]);

test("cipher alphabet contains only the preferred programming symbol subset", () => {
  assert.equal(CIPHER_SYMBOLS.length, 10);
  assert.equal(INITIAL_FIELD.length, 10);
  for (const sym of CIPHER_SYMBOLS) {
    assert.ok(
      PREFERRED_ALPHABET.has(sym),
      `Unexpected symbol in CIPHER_SYMBOLS: ${sym}`,
    );
  }
  for (const sym of INITIAL_FIELD) {
    assert.ok(
      PREFERRED_ALPHABET.has(sym),
      `Unexpected symbol in INITIAL_FIELD: ${sym}`,
    );
  }
});

test("reel cadence decelerates monotonically with stretching flip intervals", () => {
  for (let i = 0; i < TARGET.length; i++) {
    if (TARGET[i] === " ") continue;
    const cadence = getCharacterCadence(i, TARGET[i]);
    const flips = cadence.flips;
    assert.ok(
      flips.length >= 12,
      "Minimum flips requirement for smooth motion",
    );
    const intervals = flips.map((f, idx) =>
      idx === 0 ? f : f - flips[idx - 1],
    );
    // Initial interval is smooth flutter (~35-50ms)
    assert.ok(
      intervals[0] <= 55,
      `Initial interval too slow: ${intervals[0]}ms`,
    );
    // Final interval before settling is a pronounced clack (~130-190ms)
    assert.ok(
      intervals[intervals.length - 1] >= 130,
      `Final interval too fast: ${intervals[intervals.length - 1]}ms`,
    );
    // Interval series is strictly non-decreasing (monotonic deceleration)
    for (let k = 1; k < intervals.length; k++) {
      assert.ok(
        intervals[k] >= intervals[k - 1],
        `Non-monotonic deceleration at index ${i}, flip ${k}: ${intervals[k]} < ${intervals[k - 1]}`,
      );
    }
  }
});

test("cadence executes an even number of half-turns ending precisely at 0 degrees", () => {
  for (let i = 0; i < TARGET.length; i++) {
    if (TARGET[i] === " ") continue;
    const cadence = getCharacterCadence(i, TARGET[i]);
    assert.equal(
      cadence.n % 2,
      0,
      `Character ${TARGET[i]} has odd flips: ${cadence.n}`,
    );
    assert.equal(cadence.flips.length, cadence.n);

    // Verify face state at settling time lands exactly at 0 degrees facing forward
    const settled = computeFaceState(cadence, cadence.settle);
    assert.equal(settled.settled, true);
    assert.equal(settled.angle, 0);
    assert.equal(settled.isFrontFacing, true);
    assert.equal(settled.front.text, TARGET[i]);
    assert.equal(settled.front.isTarget, true);
  }
});

test("choreography settles left to right with a natural inter-word pause between Aritra and Saha", () => {
  const settles = [];
  for (let i = 0; i < TARGET.length; i++) {
    if (TARGET[i] === " ") continue;
    const cadence = getCharacterCadence(i, TARGET[i]);
    settles.push({ char: TARGET[i], index: i, settle: cadence.settle });
  }

  // Left to right progression: each subsequent character settles strictly later
  for (let k = 1; k < settles.length; k++) {
    assert.ok(
      settles[k].settle > settles[k - 1].settle,
      `Settling order inverted at ${k}: ${settles[k].settle} <= ${settles[k - 1].settle}`,
    );
  }

  // First word settles progressively: 0 ('A') through 5 ('a')
  const aritraEnd = settles[5].settle; // 'a' of Aritra (2150ms)
  const sahaStart = settles[6].settle; // 'S' of Saha (2470ms)
  const pause = sahaStart - aritraEnd;

  assert.ok(
    pause >= 250,
    `Natural inter-word pause must be at least 250ms, got ${pause}ms`,
  );
  assert.ok(
    pause <= 400,
    `Natural inter-word pause must be at most 400ms, got ${pause}ms`,
  );
});

test("latchProgress reaches exact unity with bounded physical settle", () => {
  assert.equal(latchProgress(0), 0);
  assert.equal(latchProgress(1), 1);
  assert.equal(latchProgress(1.5), 1);

  // Intermediate values are bounded and smooth
  for (let p = 0; p <= 1; p += 0.05) {
    const v = latchProgress(p);
    assert.ok(v >= 0 && v <= 1.025, `Overshoot unbounded at ${p}: ${v}`);
  }
});
