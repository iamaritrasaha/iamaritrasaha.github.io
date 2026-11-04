import assert from "node:assert/strict";
import test from "node:test";
import { rpmSample, LED_THRESHOLDS, CYCLE_MS } from "../assets/pulse-rpm.js";

test("RPM is smooth, periodic and rises then falls with synchronized thresholds", () => {
  let last = rpmSample(0).rpm;
  for (let t = 16; t <= CYCLE_MS; t += 16) {
    const { rpm, count, state } = rpmSample(t);
    assert.ok(rpm >= 1200 && rpm <= 7600);
    assert.ok(Math.abs(rpm - last) < 35, "No frame-sized RPM jumps at 60 Hz");
    assert.equal(count, LED_THRESHOLDS.filter((v) => rpm >= v).length);
    assert.equal(
      state,
      rpm >= 7300 ? "shift" : rpm >= 6000 ? "approach" : "normal",
    );
    if (t <= 5000) assert.ok(rpm >= last);
    if (t > 5716) assert.ok(rpm <= last);
    last = rpm;
  }
  assert.deepEqual(rpmSample(0), rpmSample(CYCLE_MS));
  assert.equal(rpmSample(5300).count, 6);
  assert.equal(rpmSample(5300).state, "shift");
  assert.equal(rpmSample(11500).count, 0);
});

test("equal elapsed times give the same RPM across refresh rates", () => {
  for (const hz of [30, 60, 120, 144]) {
    let elapsed = 0;
    for (let i = 0; i < hz * 4; i++) elapsed += 1000 / hz;
    assert.deepEqual(rpmSample(elapsed), rpmSample(4000));
  }
});
