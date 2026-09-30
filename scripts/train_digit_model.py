"""Train and export the portfolio's small, reproducible digit study.

Use the pinned environment in docs/digit-model.md. No dataset download or
Python dependency is needed to run the resulting portfolio in a browser.
"""

from pathlib import Path
import json
import math
import numpy as np
import sklearn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
SEED = 17
SPLIT_SEED = 42
SIZES = [64, 16, 12, 10]
EPOCHS = 180
BATCH_SIZE = 64
LEARNING_RATE = 0.005
WEIGHT_DECAY = 0.0001
C = math.sqrt(2 / math.pi)


def gelu(x):
    return 0.5 * x * (1 + np.tanh(C * (x + 0.044715 * x**3)))


def derivative(x):
    t = np.tanh(C * (x + 0.044715 * x**3))
    return 0.5 * (1 + t) + 0.5 * x * (1 - t*t) * C * (1 + 3*0.044715*x*x)


def forward(x, weights, biases):
    z1 = x @ weights[0].T + biases[0]
    h1 = gelu(z1)
    z2 = h1 @ weights[1].T + biases[1]
    h2 = gelu(z2)
    logits = h2 @ weights[2].T + biases[2]
    shifted = logits - logits.max(axis=1, keepdims=True)
    exps = np.exp(shifted)
    p = exps / exps.sum(axis=1, keepdims=True)
    return z1, h1, z2, h2, logits, p


def scalar_reference(x, target, weights, biases):
    """Independent scalar loops, rather than the NumPy training operations."""
    def gate(v):
        if abs(v) > 10:
            return max(v, 0)
        return .5 * v * (1 + math.tanh(C * (v + .044715 * v**3)))

    def gate_derivative(v):
        if abs(v) > 10:
            return float(v > 0)
        t = math.tanh(C * (v + .044715 * v**3))
        return .5*(1+t) + .5*v*(1-t*t)*C*(1+3*.044715*v*v)

    def dense(matrix, values, bias):
        return [sum(a*b for a, b in zip(row, values)) + b for row, b in zip(matrix, bias)]

    def transpose(matrix, delta):
        return [sum(row[i]*d for row, d in zip(matrix, delta)) for i in range(len(matrix[0]))]

    z1 = dense(weights[0], x, biases[0])
    h1 = [gate(v) for v in z1]
    z2 = dense(weights[1], h1, biases[1])
    h2 = [gate(v) for v in z2]
    logits = dense(weights[2], h2, biases[2])
    maximum = max(logits)
    exps = [math.exp(v-maximum) for v in logits]
    total = sum(exps)
    probabilities = [v/total for v in exps]
    loss = maximum-logits[target]+math.log(total)
    d3 = [p - int(i == target) for i, p in enumerate(probabilities)]
    d2 = [v*gate_derivative(z) for v, z in zip(transpose(weights[2], d3), z2)]
    d1 = [v*gate_derivative(z) for v, z in zip(transpose(weights[1], d2), z1)]
    deltas = [d1, d2, d3]
    inputs = [x, h1, h2]
    indices = [(0, 0, 0), (0, 0, 27), (0, 7, 35), (0, 15, 63),
               (1, 0, 0), (1, 5, 8), (1, 11, 15),
               (2, 0, 0), (2, target, 6), (2, 9, 11)]
    return dict(target=target, z1=z1, h1=h1, z2=z2, h2=h2,
                logits=logits, probabilities=probabilities, loss=loss,
                deltas=deltas, inputGradient=transpose(weights[0], d1),
                weightGradients=[dict(layer=l, row=r, col=c,
                                      value=deltas[l][r]*inputs[l][c]) for l, r, c in indices])


def main():
    digits = load_digits()
    x = digits.data.astype(np.float64) / 16
    y = digits.target
    train, test = train_test_split(np.arange(len(y)), test_size=.2,
                                  random_state=SPLIT_SEED, stratify=y)
    rng = np.random.default_rng(SEED)
    weights = [rng.normal(0, math.sqrt(2 / fan_in), (fan_out, fan_in))
               for fan_in, fan_out in zip(SIZES[:-1], SIZES[1:])]
    biases = [np.zeros(n) for n in SIZES[1:]]
    parameters = weights + biases
    first = [np.zeros_like(p) for p in parameters]
    second = [np.zeros_like(p) for p in parameters]
    step = 0
    # Configuration is fixed in advance. No validation/test-driven selection.
    for epoch in range(EPOCHS):
        order = rng.permutation(train)
        for start in range(0, len(order), BATCH_SIZE):
            batch = order[start:start+BATCH_SIZE]
            z1, h1, z2, h2, _, p = forward(x[batch], weights, biases)
            d3 = p.copy()
            d3[np.arange(len(batch)), y[batch]] -= 1
            d3 /= len(batch)
            d2 = (d3 @ weights[2]) * derivative(z2)
            d1 = (d2 @ weights[1]) * derivative(z1)
            gradients = [d1.T @ x[batch] + WEIGHT_DECAY*weights[0],
                         d2.T @ h1 + WEIGHT_DECAY*weights[1],
                         d3.T @ h2 + WEIGHT_DECAY*weights[2],
                         d1.sum(axis=0), d2.sum(axis=0), d3.sum(axis=0)]
            step += 1
            for i, (parameter, gradient) in enumerate(zip(parameters, gradients)):
                first[i] = .9*first[i] + .1*gradient
                second[i] = .999*second[i] + .001*gradient**2
                m = first[i] / (1-.9**step)
                v = second[i] / (1-.999**step)
                parameter -= LEARNING_RATE*m / (np.sqrt(v)+1e-8)
    # Evaluate the shipped, rounded weights, once on the held-out partition.
    weights = [np.round(w, 8) for w in weights]
    biases = [np.round(b, 8) for b in biases]
    *_, probabilities = forward(x[test], weights, biases)
    predicted = probabilities.argmax(axis=1)
    correct = int((predicted == y[test]).sum())
    mistakes = np.flatnonzero(predicted != y[test])
    meta = dict(architecture=SIZES, connectionCount=1336, parameterCount=1374,
                activation="tanh-approximate GELU", trainCount=len(train),
                testCount=len(test), testCorrect=correct, seed=SEED,
                splitSeed=SPLIT_SEED, epochs=EPOCHS, batchSize=BATCH_SIZE,
                learningRate=LEARNING_RATE, weightDecay=WEIGHT_DECAY,
                optimizer="Adam", numpyVersion=np.__version__,
                sklearnVersion=sklearn.__version__,
                dataset="scikit-learn load_digits (UCI handwritten digits subset)",
                datasetDOI="10.24432/C50P49", datasetLicense="CC BY 4.0",
                split="Local stratified 80/20 split, not the official UCI split")
    samples = []
    for label in range(10):
        index = int(test[np.flatnonzero(y[test] == label)[0]])
        samples.append(dict(id=f"digit-{label}", label=label,
                            input=x[index].tolist(), split="test", datasetIndex=index,
                            selection="First test example of this class"))
    if len(mistakes):
        at = int(mistakes[0])
        index = int(test[at])
        samples.append(dict(id=f"challenge-{index}", label=int(y[index]),
                            input=x[index].tolist(), split="test", datasetIndex=index,
                            selection="First misclassified test example", challenge=True))
    model = dict(weights=[w.tolist() for w in weights],
                 biases=[b.tolist() for b in biases], meta=meta)
    references = []
    for sample in [samples[0], samples[-1]]:
        references.append(dict(id=sample["id"], **scalar_reference(sample["input"], sample["label"],
                                                                  model["weights"], model["biases"])))
    # Compact generated literals keep the shipped dataset subset small.
    encode = lambda value: json.dumps(value, separators=(",", ":"), allow_nan=False)
    exports = ["// Generated by scripts/train_digit_model.py; see docs/digit-model.md.",
               "// Dataset: E. Alpaydin / C. Kaynak, UCI, CC BY 4.0, doi:10.24432/C50P49.",
               "// prettier-ignore", f"export const DIGIT_MODEL = {encode(model)};",
               "// prettier-ignore", f"export const DIGIT_SAMPLES = {encode(samples)};",
               "", "function freezeTree(value) {",
               "  if (value && typeof value === \"object\") {",
               "    Object.values(value).forEach(freezeTree);", "    Object.freeze(value);",
               "  }", "  return value;", "}",
               "freezeTree(DIGIT_MODEL);", "freezeTree(DIGIT_SAMPLES);", ""]
    output = ROOT / "assets/digit-model.js"
    output.write_text("\n".join(exports))
    fixture = ROOT / "scripts/fixtures/digit-reference.json"
    fixture.parent.mkdir(exist_ok=True)
    fixture.write_text(json.dumps(references, indent=2, allow_nan=False) + "\n")
    print(json.dumps(meta, indent=2))
    print(f"Exported {len(samples)} samples and {len(references)} scalar fixtures; {output.stat().st_size} bytes")
    for sample in samples:
        p = scalar_reference(sample["input"], sample["label"], model["weights"], model["biases"])["probabilities"]
        print(f'{sample["id"]}: label={sample["label"]}, prediction={int(np.argmax(p))}, confidence={max(p):.4f}')


if __name__ == "__main__":
    main()
