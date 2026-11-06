import { test } from "node:test";
import assert from "node:assert/strict";
import { radialProbability, radialCurve } from "../assets/quanta-feature.js";

test("hydrogen radial curves are normalized, with the correct nodes and peaks", () => {
  for (const n of [1, 2]) {
    const step = 0.002;
    let integral = 0;
    for (let r = step / 2; r < 80; r += step)
      integral += radialProbability(n, r) * step;
    assert.ok(Math.abs(integral - 1) < 1e-7);
    assert.equal(radialProbability(n, 0), 0);
    const peak = n === 1 ? 1 : 3 + Math.sqrt(5);
    assert.ok(radialProbability(n, peak) > radialProbability(n, peak - 0.01));
    assert.ok(radialProbability(n, peak) > radialProbability(n, peak + 0.01));
    assert.ok(!radialCurve(n).includes("NaN"));
  }
  assert.equal(radialProbability(2, 2), 0);
  assert.ok(radialProbability(2, 1.9) > 0 && radialProbability(2, 2.1) > 0);
});
