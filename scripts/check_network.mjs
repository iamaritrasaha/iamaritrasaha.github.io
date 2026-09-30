import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  evaluateNetwork,
  gelu,
  geluDerivative,
} from "../assets/neural-network.js";
import { DIGIT_MODEL, DIGIT_SAMPLES } from "../assets/digit-model.js";

const DIGIT_REFERENCE = JSON.parse(
  readFileSync(
    new URL("./fixtures/digit-reference.json", import.meta.url),
    "utf8",
  ),
);

function close(actual, expected, tolerance = 2e-11) {
  assert.ok(Number.isFinite(actual), `Non-finite result: ${actual}`);
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} differs from ${expected} by ${Math.abs(actual - expected)}`,
  );
}
function closeVector(actual, expected) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => close(value, expected[i]));
}

for (const reference of DIGIT_REFERENCE) {
  test(`trained 64→16→12→10 model matches independent Python scalar forward/backward fixture: ${reference.id}`, () => {
    const sample = DIGIT_SAMPLES.find(({ id }) => id === reference.id);
    const actual = evaluateNetwork(sample.input, sample.label);
    for (const key of ["z1", "h1", "z2", "h2", "logits", "probabilities"])
      closeVector(actual[key], reference[key]);
    close(actual.loss, reference.loss);
    actual.deltas.forEach((layer, i) =>
      closeVector(layer, reference.deltas[i]),
    );
    closeVector(actual.gradients.input, reference.inputGradient);
    reference.weightGradients.forEach(({ layer, row, col, value }) => {
      close(actual.gradients.weights[layer][row][col], value);
    });
  });
}

test("GELU derivative agrees with finite differences across negative and positive gates", () => {
  for (const x of [-12, -5, -2, -0.7, 0, 0.4, 1.5, 4, 12]) {
    const epsilon = 1e-5;
    close(
      geluDerivative(x),
      (gelu(x + epsilon) - gelu(x - epsilon)) / (2 * epsilon),
      2e-9,
    );
  }
});

test("all 1336 weight, 38 bias and 64 input gradients match finite differences on a real misclassified sample", () => {
  const sample =
    DIGIT_SAMPLES.find(({ challenge }) => challenge) ?? DIGIT_SAMPLES[0];
  const parameters = structuredClone(DIGIT_MODEL);
  const epsilon = 1e-5;
  const actual = evaluateNetwork(sample.input, sample.label, parameters);
  let weightCount = 0,
    biasCount = 0;
  function centralDifference(array, index) {
    const original = array[index];
    array[index] = original + epsilon;
    const above = evaluateNetwork(sample.input, sample.label, parameters).loss;
    array[index] = original - epsilon;
    const below = evaluateNetwork(sample.input, sample.label, parameters).loss;
    array[index] = original;
    return (above - below) / (2 * epsilon);
  }
  for (let layer = 0; layer < 3; layer++) {
    for (let row = 0; row < parameters.weights[layer].length; row++) {
      for (let col = 0; col < parameters.weights[layer][row].length; col++) {
        close(
          actual.gradients.weights[layer][row][col],
          centralDifference(parameters.weights[layer][row], col),
          8e-8,
        );
        weightCount++;
      }
      close(
        actual.gradients.biases[layer][row],
        centralDifference(parameters.biases[layer], row),
        8e-8,
      );
      biasCount++;
    }
  }
  assert.equal(weightCount, 1336);
  assert.equal(biasCount, 38);
  for (let i = 0; i < 64; i++) {
    const above = [...sample.input],
      below = [...sample.input];
    above[i] += epsilon;
    below[i] -= epsilon;
    close(
      actual.gradients.input[i],
      (evaluateNetwork(above, sample.label).loss -
        evaluateNetwork(below, sample.label).loss) /
        (2 * epsilon),
      8e-8,
    );
  }
});

test("shipped examples have genuine pixel intensities, normalized distributions and a disclosed failure", () => {
  assert.deepEqual(
    DIGIT_SAMPLES.slice(0, 10).map(({ label }) => label),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
  for (const sample of DIGIT_SAMPLES) {
    assert.equal(sample.split, "test");
    assert.equal(sample.input.length, 64);
    assert.ok(
      sample.input.every(
        (pixel) => pixel >= 0 && pixel <= 1 && Number.isInteger(pixel * 16),
      ),
    );
    const result = evaluateNetwork(sample.input, sample.label);
    close(
      result.probabilities.reduce((sum, value) => sum + value),
      1,
    );
    close(
      result.deltas[2].reduce((sum, value) => sum + value),
      0,
    );
    assert.equal(
      result.prediction,
      result.logits.indexOf(Math.max(...result.logits)),
    );
    assert.ok(result.loss >= 0);
    if (sample.challenge) assert.notEqual(result.prediction, sample.label);
  }
  assert.ok(DIGIT_SAMPLES.some(({ challenge }) => challenge));
  assert.equal(DIGIT_MODEL.meta.trainCount + DIGIT_MODEL.meta.testCount, 1797);
  assert.equal(DIGIT_MODEL.meta.testCount, 360);
  assert.ok(
    DIGIT_MODEL.meta.testCorrect > 0 && DIGIT_MODEL.meta.testCorrect < 360,
  );
});

test("log-sum-exp cross-entropy stays finite even when the target probability underflows", () => {
  const parameters = structuredClone(DIGIT_MODEL);
  parameters.weights[2].forEach((row) => row.fill(0));
  parameters.biases[2] = [1000, -1000, 0, -100, 1, 2, 3, 4, 5, 6];
  const result = evaluateNetwork(DIGIT_SAMPLES[0].input, 1, parameters);
  assert.equal(result.probabilities[1], 0);
  close(result.loss, 2000);
  close(
    result.probabilities.reduce((sum, value) => sum + value),
    1,
  );
  assert.ok(result.gradients.input.every(Number.isFinite));
});

test("inference is immutable and rejects invalid inputs, targets and overflow", () => {
  const sample = DIGIT_SAMPLES[0];
  const before = JSON.stringify(DIGIT_MODEL);
  evaluateNetwork(sample.input, sample.label);
  assert.equal(JSON.stringify(DIGIT_MODEL), before);
  assert.throws(() => {
    DIGIT_MODEL.weights[0][0][0] = 5;
  }, TypeError);
  assert.throws(() => {
    sample.input[0] = 5;
  }, TypeError);
  for (const invalid of [
    [],
    [1],
    Array(63).fill(0),
    Array(65).fill(0),
    [...Array(63).fill(0), NaN],
    [...Array(63).fill(0), Infinity],
    null,
  ])
    assert.throws(() => evaluateNetwork(invalid), TypeError);
  for (const target of [-1, 10, 0.5, NaN])
    assert.throws(() => evaluateNetwork(sample.input, target), RangeError);
  assert.throws(
    () => evaluateNetwork(Array(64).fill(Number.MAX_VALUE)),
    RangeError,
  );
});
