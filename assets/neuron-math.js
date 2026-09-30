import { DIGIT_MODEL } from "./digit-model.js";

// Native MathML keeps the mathematics selectable, semantic and dependency-free.
const tag = (name, body) => `<${name}>${body}</${name}>`;
const row = (...items) => tag("mrow", items.join(""));
const id = (text) => tag("mi", text);
const op = (text) => tag("mo", text);
const num = (value, digits = 3) => {
  const text =
    typeof value === "number"
      ? value !== 0 && Math.abs(value) < 10 ** -digits
        ? value.toExponential(2)
        : value.toFixed(digits)
      : String(value);
  if (text.includes("e")) {
    const [coefficient, exponent] = text.split("e");
    return row(
      num(coefficient),
      op("×"),
      tag("msup", num("10") + num(String(Number(exponent)))),
    );
  }
  return text.startsWith("-")
    ? row(op("−"), tag("mn", text.slice(1)))
    : tag("mn", text);
};
const sub = (base, index) => tag("msub", base + row(index));
const sup = (base, power) => tag("msup", base + row(power));
const indexed = (name, index, layer) =>
  tag("msubsup", id(name) + row(index) + par(num(String(layer))));
const par = (value) => row(op("("), value, op(")"));
const frac = (a, b) => tag("mfrac", row(a) + row(b));
const fn = (name, value) =>
  row(`<mi mathvariant="normal">${name}</mi>`, op("⁡"), par(value));
const sum = (variable, from, to) =>
  tag(
    "munderover",
    op("∑") + row(id(variable), op("="), num(String(from))) + num(String(to)),
  );
const math = (body) =>
  `<div class="neuron-math-line"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${body}</math></div>`;
const lines = (...rows) =>
  math(
    `<mtable displaystyle="true" columnalign="left" rowspacing="0.55em">${rows.map((r) => tag("mtr", tag("mtd", row(r)))).join("")}</mtable>`,
  );
const layer = (name, n) =>
  sup(
    id(name),
    par(
      typeof n === "number"
        ? num(String(n))
        : row(
            ...String(n)
              .split(/([+−])/)
              .map((t) =>
                /^[+−]$/.test(t) ? op(t) : /^\d+$/.test(t) ? num(t) : id(t),
              ),
          ),
    ),
  );
const largest = (values, count = 1) =>
  values
    .map((value, i) => ({ value, i }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, count);
const plusTerm = (value) =>
  row(op(value < 0 ? "−" : "+"), num(Math.abs(value)));

export function renderNeuronEquation(phase, v, unit) {
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
  const u = num(String(unit + 1));
  const contributions = DIGIT_MODEL.weights[0][unit].map((w, i) => w * x[i]);
  const terms = largest(contributions, 3);
  const pixel = terms[0].i;
  const rest =
    contributions.reduce((a, b) => a + b, 0) -
    terms.reduce((a, b) => a + b.value, 0);
  const second = largest(h2)[0].i;
  const winner = p.indexOf(Math.max(...p));
  const z = id("z"),
    L = id("ℒ"),
    eq = op("="),
    approx = op("≈");
  const weightedTerms = terms
    .map(({ i }, index) =>
      row(
        index ? op(DIGIT_MODEL.weights[0][unit][i] < 0 ? "−" : "+") : "",
        num(
          index
            ? Math.abs(DIGIT_MODEL.weights[0][unit][i])
            : DIGIT_MODEL.weights[0][unit][i],
          2,
        ),
        op("·"),
        num(x[i], 2),
      ),
    )
    .join("");
  const wSelected = indexed("W", row(u, op(","), num(String(pixel + 1))), 1);
  const derivative = frac(row(op("∂"), L), row(op("∂"), wSelected));
  const stages = [
    {
      title: "Read the pixels",
      formula: lines(
        row(
          indexed("z", u, 1),
          eq,
          sum("j", 1, 64),
          indexed("W", row(u, op(","), id("j")), 1),
          sub(id("x"), id("j")),
          op("+"),
          indexed("b", u, 1),
        ),
      ),
      working: lines(
        row(indexed("z", u, 1), approx),
        weightedTerms,
        row(plusTerm(rest), plusTerm(DIGIT_MODEL.biases[0][unit])),
        row(approx, num(z1[unit], 4)),
      ),
      result: `Three largest terms + the other 61 + bias.${math(row(sub(id("x"), id("j")), eq, frac(sub(id("pixel"), id("j")), num("16"))))}`,
      explanation:
        "A real held-out handwritten digit. Each unit weights the same 64 pixels differently, using parameters learned during training.",
    },
    {
      title: "Let the layers disagree",
      formula: lines(
        row(
          fn("GELU", z),
          approx,
          frac(z, num("2")),
          row(op("["), num("1"), op("+"), fn("tanh", id("u")), op("]")),
        ),
        row(
          id("u"),
          eq,
          tag("msqrt", frac(num("2"), id("π"))),
          par(row(z, op("+"), num("0.044715"), sup(z, num("3")))),
        ),
      ),
      working: lines(
        row(
          indexed("h", u, 1),
          eq,
          fn("GELU", num(z1[unit])),
          approx,
          num(h1[unit]),
        ),
        row(
          indexed("h", num(String(second + 1)), 2),
          eq,
          fn("GELU", num(z2[second])),
          approx,
          num(h2[second]),
        ),
      ),
      result: math(
        row(
          layer("h", 2),
          eq,
          fn("GELU", row(layer("W", 2), layer("h", 1), op("+"), layer("b", 2))),
        ),
      ),
      explanation:
        "Two nonlinear layers turn pixel combinations into features. No hand-written rule tells it what a digit should look like.",
    },
    {
      title: "Make a prediction",
      formula: lines(
        row(
          sub(id("p"), id("k")),
          eq,
          frac(
            sup(id("e"), row(sub(id("s"), id("k")), op("−"), id("m"))),
            row(
              sum("j", 0, 9),
              sup(id("e"), row(sub(id("s"), id("j")), op("−"), id("m"))),
            ),
          ),
        ),
        row(id("m"), eq, fn("max", id("s"))),
      ),
      working: lines(
        row(id("s"), eq, layer("W", 3), layer("h", 2), op("+"), layer("b", 3)),
        row(
          sub(id("p"), num(String(winner))),
          approx,
          frac(
            num("1"),
            num(
              logits.reduce((a, b) => a + Math.exp(b - Math.max(...logits)), 0),
            ),
          ),
        ),
        row(approx, num(p[winner] * 100, 1), op("%")),
      ),
      result: math(row(sum("k", 0, 9), sub(id("p"), id("k")), eq, num("1"))),
      explanation:
        "All ten digits compete. Subtracting the largest score keeps the exponentials stable. Confidence is not a guarantee.",
    },
    {
      title:
        winner === target ? "Measure the error" : "The loss function has notes",
      formula: lines(
        row(
          L,
          eq,
          op("−"),
          sum("k", 0, 9),
          sub(id("y"), id("k")),
          fn("log", sub(id("p"), id("k"))),
        ),
        row(eq, op("−"), fn("log", sub(id("p"), num(String(target))))),
      ),
      working: `<span class="neuron-known-label">Known label: ${target} · predicted: ${winner}</span>${lines(row(L, approx, op("−"), fn("log", num(p[target], 9))), row(approx, num(loss, 5)))}`,
      result: math(
        row(
          sub(id("y"), id("k")),
          eq,
          op("{"),
          `<mtable columnalign="left left"><mtr><mtd>${num("1")}</mtd><mtd><mtext>if </mtext>${id("k")}${eq}${num(String(target))}</mtd></mtr><mtr><mtd>${num("0")}</mtd><mtd><mtext>otherwise</mtext></mtd></mtr></mtable>`,
        ),
      ),
      explanation:
        "The label is used to measure the error, never as an input. The classifier can be confidently wrong. Try the next digit.",
    },
    {
      title: "Follow the gradient home",
      formula: lines(
        row(
          layer("δ", "l"),
          eq,
          sup(par(layer("W", "l+1")), id("T")),
          layer("δ", "l+1"),
        ),
        row(op("⊙"), fn("GELU′", layer("z", "l"))),
      ),
      working: lines(
        row(layer("δ", 3), eq, id("p"), op("−"), id("y")),
        row(
          derivative,
          eq,
          indexed("δ", u, 1),
          sub(id("x"), num(String(pixel + 1))),
        ),
        row(approx, num(d[0][unit], 5), op("×"), num(x[pixel], 2)),
        row(approx, num(g.weights[0][unit][pixel], 6)),
      ),
      result: math(
        row(
          sub(op("∇"), layer("W", "l")),
          L,
          eq,
          layer("δ", "l"),
          sup(par(layer("h", "l−1")), id("T")),
        ),
      ),
      explanation:
        "The chain rule runs through the actual prediction. Training used Adam offline. Here, the gradients are inspected and the learned weights stay fixed.",
    },
  ];
  const block = stages[phase];
  return `<div class="neuron-equation-content"><span class="neuron-equation-title">0${phase + 1} / ${block.title}</span><div class="neuron-formula">${block.formula}</div><div class="neuron-working">${block.working}</div><div class="neuron-result">${block.result}</div><p class="neuron-explanation">${block.explanation}</p></div>`;
}
