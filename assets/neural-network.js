import { DIGIT_MODEL } from "./digit-model.js";

/** Tanh approximation used both by the trainer and the browser. */
export function gelu(x) {
  if (Math.abs(x) > 10) return x > 0 ? x : 0;
  return (
    0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)))
  );
}

export function geluDerivative(x) {
  if (Math.abs(x) > 10) return x > 0 ? 1 : 0;
  const c = Math.sqrt(2 / Math.PI);
  const t = Math.tanh(c * (x + 0.044715 * x ** 3));
  return 0.5 * (1 + t) + 0.5 * x * (1 - t * t) * c * (1 + 3 * 0.044715 * x * x);
}

const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const dense = (w, x, b) => w.map((row, i) => dot(row, x) + b[i]);
const transposeProduct = (w, d) =>
  w[0].map((_, i) => w.reduce((sum, row, j) => sum + row[i] * d[j], 0));

/** One real forward/backward pass. Parameters remain frozen; this does not train. */
export function evaluateNetwork(input, target = 0, parameters = DIGIT_MODEL) {
  if (
    !Array.isArray(input) ||
    input.length !== 64 ||
    !input.every(Number.isFinite)
  ) {
    throw new TypeError("The network expects 64 finite pixel values.");
  }
  if (!Number.isInteger(target) || target < 0 || target > 9) {
    throw new RangeError("The target digit must be an integer from 0 to 9.");
  }
  const x = [...input];
  const { weights: w, biases: b } = parameters;
  const z1 = dense(w[0], x, b[0]);
  const h1 = z1.map(gelu);
  const z2 = dense(w[1], h1, b[1]);
  const h2 = z2.map(gelu);
  const logits = dense(w[2], h2, b[2]);
  if (![...z1, ...z2, ...logits].every(Number.isFinite)) {
    throw new RangeError(
      "Input magnitude exceeds this model's numerical range.",
    );
  }
  const maximum = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - maximum));
  const total = exps.reduce((sum, value) => sum + value, 0);
  const probabilities = exps.map((value) => value / total);
  const loss = maximum - logits[target] + Math.log(total);
  const dLogits = probabilities.map((value, i) => value - Number(i === target));
  const d2 = transposeProduct(w[2], dLogits).map(
    (value, i) => value * geluDerivative(z2[i]),
  );
  const d1 = transposeProduct(w[1], d2).map(
    (value, i) => value * geluDerivative(z1[i]),
  );
  const deltas = [d1, d2, dLogits];
  const inputs = [x, h1, h2];
  const gradients = {
    weights: deltas.map((layer, l) =>
      layer.map((d) => inputs[l].map((value) => d * value)),
    ),
    biases: deltas.map((layer) => [...layer]),
    input: transposeProduct(w[0], d1),
  };
  return {
    x,
    z1,
    h1,
    z2,
    h2,
    logits,
    probabilities,
    loss,
    target,
    prediction: logits.indexOf(maximum),
    deltas,
    gradients,
  };
}
