import { DIGIT_MODEL, DIGIT_SAMPLES } from "./digit-model.js";
import { evaluateNetwork } from "./neural-network.js";

const PHASES = ["project", "transform", "classify", "loss", "backward"];
const LABELS = ["Project", "Transform", "Classify", "Loss", "Backward"];
const PHASE_MS = 5800;
const SIZES = [64, 16, 12, 10];
const decimal = (value, digits = 3) =>
  (value !== 0 && Math.abs(value) < 10 ** -digits
    ? value.toExponential(2)
    : value.toFixed(digits)
  ).replaceAll("-", "−");
const percent = (value) => `${(value * 100).toFixed(1)}%`;
const strongest = (values, count = 2) =>
  values
    .map((value, i) => ({ value, i }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, count);
const position = (layer, i, width = 480) => {
  const cell = Math.min(9, Math.max(6, width / 55));
  if (layer === 0)
    return {
      x: 10 + (i % 8) * cell,
      y: 140 + (Math.floor(i / 8) - 3.5) * cell,
    };
  if (layer === 1)
    return {
      x: width * 0.4 + (i % 2 ? 14 : -14),
      y: 42 + Math.floor(i / 2) * 28,
    };
  return {
    x: layer === 2 ? width * 0.68 : width - 28,
    y: layer === 2 ? 30 + i * 20 : 32 + i * 24,
  };
};

// Show two strongest learned weights per receiving unit. Every wire is real;
// thinning is only visual, while inference and gradients use all 1,336 weights.
const CONNECTIONS = DIGIT_MODEL.weights.flatMap((matrix, layer) =>
  matrix.flatMap((row, target) =>
    strongest(row).map(({ value, i: source }) => ({
      layer,
      source,
      target,
      weight: value,
    })),
  ),
);

function diagram() {
  const wires = CONNECTIONS.map(({ layer, source, target, weight }, i) => {
    const from = position(layer, source),
      to = position(layer + 1, target);
    const d = `M${from.x} ${from.y} C${from.x + 55} ${from.y},${to.x - 55} ${to.y},${to.x} ${to.y}`;
    return `<g class="neuron-connection${weight < 0 ? " is-negative" : ""}" data-edge="${i}" style="--signal-delay:${-(i % 9) * 0.21}s;--weight-width:${Math.min(1.8, 0.6 + Math.abs(weight) * 0.5)}"><path class="neuron-wire" d="${d}"/><path class="neuron-packet" d="${d}" pathLength="100"/></g>`;
  }).join("");
  const nodes = SIZES.flatMap((size, layer) =>
    Array.from({ length: size }, (_, i) => {
      const p = position(layer, i);
      if (layer === 0)
        return `<rect class="neuron-pixel" data-pixel="${i}" x="${p.x - 4}" y="${p.y - 4}" width="8" height="8"/>`;
      return `<g class="neuron-node" data-node="${layer}-${i}" transform="translate(${p.x} ${p.y})"><circle class="neuron-halo" r="${layer === 3 ? 10 : 7}"/><circle class="neuron-core" r="${layer === 3 ? 5 : 4}"/>${layer === 3 ? `<text x="17" y="4">${i}</text>` : ""}</g>`;
    }),
  ).join("");
  return `<div class="neuron-diagram"><div class="neuron-layer-labels"><span>Pixels <small>8 × 8</small></span><span>GELU <small>16 units</small></span><span>GELU <small>12 units</small></span><span>Digits <small>10 classes</small></span></div><div class="neuron-graph"><svg aria-hidden="true" class="neuron-network" viewBox="0 0 480 280" preserveAspectRatio="xMidYMid meet" focusable="false">${wires}${nodes}<text class="neuron-input-label" x="43" y="200" text-anchor="middle">label <tspan data-known-label></tspan></text></svg><div class="neuron-hit-targets" role="group" aria-label="Select a first-layer neuron">${Array.from({ length: 16 }, (_, i) => `<button class="neuron-select" type="button" data-unit="${i}" aria-label="First-layer neuron ${i + 1}" title="Inspect neuron ${i + 1}"></button>`).join("")}</div></div><p class="neuron-selection-hint"><span data-selected-unit></span> Click a first-layer neuron to inspect it; arrow keys move between units.</p><p class="neuron-legend">76 / 1,336 connections shown: strongest weights. Dashed = negative.<br><span data-signal-legend>Node fill = activation magnitude.</span></p><div class="neuron-readout-label">Top 3 of 10 predictions <span data-prediction-status></span></div><div class="neuron-probabilities"></div></div>`;
}

function equation(phase, v, unit) {
  const {
    x,
    z1,
    z2,
    h1,
    h2,
    logits,
    probabilities: p,
    loss,
    deltas: d,
    gradients: g,
    target,
  } = v;
  const contributions = DIGIT_MODEL.weights[0][unit].map((w, i) => w * x[i]);
  const terms = strongest(contributions, 3);
  const pixel = terms[0].i;
  const remaining =
    contributions.reduce((sum, value) => sum + value, 0) -
    terms.reduce((sum, { value }) => sum + value, 0);
  const second = strongest(h2, 1)[0].i;
  const winner = p.indexOf(Math.max(...p));
  const shownTerms = terms
    .map(
      ({ i }) =>
        `${decimal(DIGIT_MODEL.weights[0][unit][i], 2)}(${decimal(x[i], 2)})`,
    )
    .join(" + ")
    .replaceAll("+ −", "− ");
  const blocks = [
    [
      "Read the pixels",
      `z<sub>${unit + 1}</sub><sup>(1)</sup> = Σ<sub>j=1</sub><sup>64</sup> W<sub>${unit + 1},j</sub><sup>(1)</sup>x<sub>j</sub> + b<sub>${unit + 1}</sub><sup>(1)</sup>`,
      `${shownTerms}<br>+ ${decimal(remaining)} + ${decimal(DIGIT_MODEL.biases[0][unit])}<br>≈ <strong>${decimal(z1[unit], 4)}</strong>`,
      `Three largest terms + the other 61 + bias.<br>xⱼ = pixelⱼ / 16 · W⁽¹⁾ ∈ ℝ¹⁶×⁶⁴`,
      "A real held-out handwritten digit. Each unit weights the same 64 pixels differently, using parameters learned during training.",
    ],
    [
      "Let the layers disagree",
      "GELU(z) ≈ ½z[1 + tanh(√(2/π)<br>· (z + 0.044715z³))]",
      `h${unit + 1}⁽¹⁾ = GELU(${decimal(z1[unit])}) ≈ <strong>${decimal(h1[unit])}</strong><br>h${second + 1}⁽²⁾ = GELU(${decimal(z2[second])}) ≈ <strong>${decimal(h2[second])}</strong>`,
      "h⁽²⁾ = GELU(W⁽²⁾h⁽¹⁾ + b⁽²⁾)<br>W⁽²⁾ ∈ ℝ¹²×¹⁶",
      "Two nonlinear layers turn pixel combinations into features. No hand-written rule tells it what a digit should look like.",
    ],
    [
      "Make a prediction",
      "p<sub>k</sub> = exp(s<sub>k</sub> − m) / Σ<sub>j=0</sub><sup>9</sup> exp(s<sub>j</sub> − m)",
      `s = W⁽³⁾h⁽²⁾ + b⁽³⁾<br>p(${winner}) = exp(${decimal(logits[winner] - Math.max(...logits))}) / ${decimal(logits.reduce((sum, value) => sum + Math.exp(value - Math.max(...logits)), 0))}<br>≈ <strong>${percent(p[winner])}</strong>`,
      "m = max(s) · Σₖ pₖ = 1<br>W⁽³⁾ ∈ ℝ¹⁰×¹²",
      "All ten digits compete. Subtracting the largest score keeps the exponentials stable. Confidence is not a guarantee.",
    ],
    [
      winner === target ? "Measure the error" : "The loss function has notes",
      `ℒ = −Σ<sub>k=0</sub><sup>9</sup> y<sub>k</sub> log p<sub>k</sub> = −log p<sub>${target}</sub>`,
      `Known label: ${target} · predicted: ${winner}<br>ℒ = −log(${decimal(p[target], 9)})<br>≈ <strong>${decimal(loss, 5)}</strong>`,
      `yₖ = 1 if k = ${target}, otherwise 0`,
      "The label is used to measure the error, never as an input. The classifier can be confidently wrong. Try the next digit.",
    ],
    [
      "Follow the gradient home",
      "δ<sup>(l)</sup> = (W<sup>(l+1)ᵀ</sup>δ<sup>(l+1)</sup>) ⊙ GELU′(z<sup>(l)</sup>)",
      `δ⁽³⁾ = p − y<br>∂ℒ/∂W${unit + 1},${pixel + 1}⁽¹⁾ = δ${unit + 1}⁽¹⁾x${pixel + 1}<br>= ${decimal(d[0][unit], 5)} × ${decimal(x[pixel], 2)}<br>≈ <strong>${decimal(g.weights[0][unit][pixel], 6)}</strong>`,
      "∇W⁽ˡ⁾ℒ = δ⁽ˡ⁾(h⁽ˡ⁻¹⁾)ᵀ",
      "The chain rule runs through the actual prediction. Training used Adam offline. Here, the gradients are inspected and the learned weights stay fixed.",
    ],
  ];
  const [title, formula, working, result, explanation] = blocks[phase];
  return `<div class="neuron-equation-content"><span class="neuron-equation-title">0${phase + 1} / ${title}</span><p class="neuron-formula">${formula}</p><div class="neuron-working">${working.replaceAll("+ −", "− ")}</div><p class="neuron-result">${result}</p><p class="neuron-explanation">${explanation}</p></div>`;
}

/** The owner controls visibility, pause and reduced motion with this setter. */
export function mountNeuronDemo(host) {
  if (!host) return () => {};
  host.classList.add("neuron-demo");
  host.innerHTML = `<div class="neuron-demo-header"><div><span class="neuron-eyebrow">A trained digit classifier, running here</span><h2>Pixels in. A prediction out.</h2></div><div class="neuron-input-actions"><button class="neuron-input-button neuron-challenge-button" type="button">Try a miss</button><button class="neuron-input-button neuron-next-button" type="button">Next digit <span aria-hidden="true">↗</span></button></div></div><div class="neuron-study">${diagram()}<div class="neuron-equation" aria-live="off"></div></div><ol class="neuron-phases" aria-label="Neural computation stages">${LABELS.map((label, i) => `<li><button type="button" aria-label="Show ${label.toLowerCase()} stage"><span aria-hidden="true">0${i + 1}</span>${label}</button></li>`).join("")}</ol><p class="neuron-demo-caption">64 → 16 → 12 → 10 <span aria-hidden="true">/</span> 1,336 learned connections <span aria-hidden="true">/</span> 1,374 parameters</p><p class="neuron-demo-note">Data: <a href="https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits">UCI handwritten digits</a>, E. Alpaydin & C. Kaynak · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p><details class="neuron-provenance"><summary>About this model</summary><p>A small GELU network, trained offline with Adam on 1,437 examples. It classified 348 of 360 held-out examples correctly (96.7%) on a local stratified 80/20 split with seed 42, not the official UCI split. The samples here were not used for training.</p><p>The first held-out example of each digit is included, plus the first mistake. This is a small educational classifier, not a claim about real-world handwriting accuracy. Values displayed are rounded; computation uses full precision.</p></details><span class="neuron-announcement" role="status" aria-live="polite" aria-atomic="true"></span>`;
  let inputIndex = 0,
    phase = 0,
    unit = 0,
    enabled = false,
    timer = 0;
  let sample = DIGIT_SAMPLES[inputIndex];
  let values = evaluateNetwork(sample.input, sample.label);
  unit = strongest(values.h1, 1)[0].i;
  const math = host.querySelector(".neuron-equation");
  const steps = [...host.querySelectorAll(".neuron-phases button")];
  const nodes = [...host.querySelectorAll("[data-node]")];
  const pixels = [...host.querySelectorAll("[data-pixel]")];
  const edges = [...host.querySelectorAll(".neuron-connection")];
  const unitButtons = [...host.querySelectorAll(".neuron-select")];
  const graph = host.querySelector(".neuron-graph");
  let diagramWidth = 0;
  function layoutDiagram() {
    const width = graph.clientWidth || 480;
    if (width === diagramWidth) return;
    diagramWidth = width;
    host
      .querySelector(".neuron-network")
      .setAttribute("viewBox", `0 0 ${width} 280`);
    const cell = Math.min(9, Math.max(6, width / 55));
    pixels.forEach((pixel, i) => {
      const p = position(0, i, width);
      pixel.setAttribute("x", p.x - (cell - 1) / 2);
      pixel.setAttribute("y", p.y - (cell - 1) / 2);
      pixel.setAttribute("width", cell - 1);
      pixel.setAttribute("height", cell - 1);
    });
    nodes.forEach((node) => {
      const [layer, i] = node.dataset.node.split("-").map(Number);
      const p = position(layer, i, width);
      node.setAttribute("transform", `translate(${p.x} ${p.y})`);
    });
    edges.forEach((edge, i) => {
      const { layer, source, target } = CONNECTIONS[i];
      const from = position(layer, source, width),
        to = position(layer + 1, target, width);
      const curve = Math.max(12, (to.x - from.x) * 0.45);
      const path = `M${from.x} ${from.y} C${from.x + curve} ${from.y},${to.x - curve} ${to.y},${to.x} ${to.y}`;
      edge
        .querySelectorAll("path")
        .forEach((wire) => wire.setAttribute("d", path));
    });
    unitButtons.forEach((button, i) => {
      const p = position(1, i, width);
      button.style.left = `${p.x}px`;
      button.style.top = `${p.y}px`;
    });
    host
      .querySelector(".neuron-input-label")
      .setAttribute("x", 10 + 3.5 * cell);
  }
  layoutDiagram();
  if (typeof ResizeObserver === "function")
    new ResizeObserver(layoutDiagram).observe(graph);
  else window.addEventListener("resize", layoutDiagram);
  const announcement = host.querySelector(".neuron-announcement");
  function render(manual = false) {
    host.querySelector(".neuron-challenge-button").textContent =
      sample.challenge ? "Back to digits" : "Try a miss";
    host.dataset.phase = PHASES[phase];
    steps.forEach((step, i) => {
      if (i === phase) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    unitButtons.forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === unit));
      button.tabIndex = i === unit ? 0 : -1;
    });
    host.querySelector("[data-selected-unit]").textContent =
      `h${unit + 1} selected.`;
    const layerValues =
      phase === 4
        ? [values.gradients.input, ...values.deltas]
        : [
            values.x,
            phase === 0 ? values.z1 : values.h1,
            values.h2,
            values.probabilities,
          ];
    const maximum = layerValues.map((layer) =>
      Math.max(...layer.map(Math.abs), 0.000001),
    );
    pixels.forEach((pixel, i) => {
      pixel.style.setProperty("--pixel", values.x[i]);
    });
    host.querySelector("[data-known-label]").textContent = sample.label;
    nodes.forEach((node) => {
      const [layer, i] = node.dataset.node.split("-").map(Number);
      const value = layerValues[layer][i];
      node.style.setProperty("--activation", Math.abs(value) / maximum[layer]);
      node.classList.toggle("is-negative", value < 0);
      node.classList.toggle("is-selected", layer === 1 && i === unit);
      node.classList.toggle(
        "is-active",
        phase === 4 || layer === Math.min(phase + 1, 3),
      );
    });
    edges.forEach((edge, i) => {
      const { layer, source, target } = CONNECTIONS[i];
      const active = phase === 4 || (phase < 3 && layer === phase);
      edge.classList.toggle("is-active", active);
      edge.classList.toggle("is-inspected", layer === 0 && target === unit);
      const flow =
        phase === 4
          ? Math.abs(values.deltas[layer][target]) / maximum[layer + 1]
          : Math.abs(layerValues[layer][source]) / maximum[layer];
      edge.style.setProperty(
        "--signal",
        flow < 0.00001 ? 0 : 0.08 + 0.75 * Math.min(1, flow),
      );
    });
    const winner = values.probabilities.indexOf(
      Math.max(...values.probabilities),
    );
    host.querySelector("[data-prediction-status]").textContent =
      winner === sample.label
        ? `Label ${sample.label} · correct`
        : `Label ${sample.label} · missed`;
    host.querySelector("[data-signal-legend]").textContent =
      phase === 4
        ? "Node fill = gradient magnitude; outlined = negative."
        : phase === 0
          ? "First layer = pre-activation. Outline = negative."
          : "Node fill = activation magnitude; outlined = negative.";
    host.querySelector(".neuron-probabilities").innerHTML = strongest(
      values.probabilities,
      3,
    )
      .map(
        ({ value: probability, i }) =>
          `<span class="neuron-probability${i === sample.label ? " is-target" : ""}"><span>Digit ${i} <strong>${percent(probability)}</strong></span><i style="--probability:${probability}" aria-hidden="true"></i></span>`,
      )
      .join("");
    math.innerHTML = equation(phase, values, unit);
    if (manual)
      announcement.textContent = `Known digit ${sample.label}. Predicted digit ${winner}, ${percent(values.probabilities[winner])}. ${LABELS[phase]} stage. Inspecting first-layer unit ${unit + 1}.`;
  }
  function schedule(delay = PHASE_MS) {
    clearTimeout(timer);
    if (!enabled) return;
    timer = setTimeout(() => {
      phase = (phase + 1) % PHASES.length;
      render();
      schedule();
    }, delay);
  }
  steps.forEach((step, index) =>
    step.addEventListener("click", () => {
      phase = index;
      render(true);
      schedule(PHASE_MS * 3);
    }),
  );
  function chooseUnit(index, focus = false) {
    unit = Math.max(0, Math.min(15, index));
    if (phase === 2 || phase === 3) phase = 0;
    render(true);
    if (focus) unitButtons[unit].focus();
    schedule(PHASE_MS * 3);
  }
  unitButtons.forEach((button, index) => {
    button.addEventListener("click", () => chooseUnit(index));
    button.addEventListener("keydown", (event) => {
      const movements = {
        ArrowDown: 2,
        ArrowUp: -2,
        ArrowLeft: -1,
        ArrowRight: 1,
      };
      if (Object.hasOwn(movements, event.key)) {
        event.preventDefault();
        chooseUnit(index + movements[event.key], true);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        chooseUnit(event.key === "Home" ? 0 : 15, true);
      }
    });
  });
  host.querySelector(".neuron-next-button").addEventListener("click", () => {
    inputIndex = (inputIndex + 1) % DIGIT_SAMPLES.length;
    sample = DIGIT_SAMPLES[inputIndex];
    values = evaluateNetwork(sample.input, sample.label);
    render(true);
    schedule(PHASE_MS * 3);
  });
  host
    .querySelector(".neuron-challenge-button")
    .addEventListener("click", () => {
      inputIndex = sample.challenge
        ? 0
        : DIGIT_SAMPLES.findIndex((item) => item.challenge);
      if (inputIndex < 0) inputIndex = 0;
      sample = DIGIT_SAMPLES[inputIndex];
      values = evaluateNetwork(sample.input, sample.label);
      phase = 3;
      render(true);
      schedule(PHASE_MS * 3);
    });
  render();
  return (nextEnabled) => {
    if (enabled === Boolean(nextEnabled)) return;
    enabled = Boolean(nextEnabled);
    host.classList.toggle("is-playing", enabled);
    schedule();
  };
}
