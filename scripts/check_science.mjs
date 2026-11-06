import { test } from "node:test";
import assert from "node:assert/strict";
import { radialProbability, radialCurve } from "../assets/quanta-feature.js";
import { mesh } from "../assets/projection.js";

test("helicoid projection matches the displayed rotation and orthographic equations", () => {
  for (const degrees of [22, 34, 180, 382]) {
    const theta = -4.1,
      radius = -140,
      alpha = (degrees * Math.PI) / 180;
    const x = radius * Math.cos(theta + alpha),
      y = radius * Math.sin(theta + alpha),
      z = 23 * theta;
    const v = y * Math.sin(0.48) - z * Math.cos(0.48);
    const expected = [
      (x * Math.cos(0.25) - v * Math.sin(0.25)).toFixed(1),
      (x * Math.sin(0.25) + v * Math.cos(0.25)).toFixed(1),
    ];
    assert.ok(mesh(degrees).startsWith(`M${expected.join(" ")}L`));
  }
  assert.equal(mesh(22), mesh(382));
});

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

const { VIEW, surface, normal, project } = await import(
  "../assets/projection.js"
);
const { createSculpture } = await import("../assets/projection-renderer.js");
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
test("sculpture camera matches the documented equations and preserves 3D lengths", () => {
  for (const degrees of [0, 22, 52, 180, 359, 382])
    for (const r of [-140, -30, 0, 70, 140])
      for (const theta of [-4.1, 0, 1.3, 4.1]) {
        const original = surface(r, theta),
          [X, Y, depth] = project(original, degrees);
        const alpha = (degrees * Math.PI) / 180,
          x = r * Math.cos(theta + alpha),
          y = r * Math.sin(theta + alpha),
          z = 23 * theta;
        const v = y * Math.sin(0.48) - z * Math.cos(0.48);
        close(X, x * Math.cos(0.25) - v * Math.sin(0.25));
        close(Y, x * Math.sin(0.25) + v * Math.cos(0.25));
        close(depth, y * Math.cos(0.48) + z * Math.sin(0.48));
        close(Math.hypot(X, Y, depth), Math.hypot(...original));
        assert.ok(
          Math.hypot(X, Y) < 180,
          "Every camera angle fits within the drawing radius",
        );
        const n = normal(r, theta);
        close(Math.hypot(...n), 1);
        close(n[0] * Math.cos(theta) + n[1] * Math.sin(theta), 0);
        close(
          n[0] * (-r * Math.sin(theta)) +
            n[1] * r * Math.cos(theta) +
            n[2] * 23,
          0,
        );
      }
  assert.equal(VIEW.initial, 22);
  assert.equal(VIEW.speed, 12);
});
test("the rasterized sculpture stays bounded and repeats after a full revolution", () => {
  let image;
  const canvas = {
    width: 320,
    height: 240,
    getContext: () => ({
      createImageData: (width, height) => ({
        width,
        height,
        data: new Uint8ClampedArray(width * height * 4),
      }),
      putImageData: (value) => {
        image = value;
      },
    }),
  };
  const draw = createSculpture(canvas);
  draw(22);
  const original = image.data.slice();
  draw(382);
  assert.deepEqual(image.data, original);
  for (const angle of [0, 22, 90, 180, 270]) {
    draw(angle);
    let lit = 0;
    for (let y = 0; y < 240; y++)
      for (let x = 0; x < 320; x++) {
        const alpha = image.data[(y * 320 + x) * 4 + 3];
        if (alpha) {
          lit++;
          assert.ok(
            x > 5 && x < 315 && y > 5 && y < 235,
            "No silhouette clipping",
          );
        }
      }
    assert.ok(
      lit > 8000,
      "The sculpture occupies the drawing rather than collapsing to a line",
    );
  }
});

test("depth testing selects the nearer of two sheets on the central camera ray", () => {
  let image;
  const canvas = {
    width: 321,
    height: 241,
    getContext: () => ({
      createImageData: (width, height) => ({
        width,
        height,
        data: new Uint8ClampedArray(width * height * 4),
      }),
      putImageData: (value) => {
        image = value;
      },
    }),
  };
  createSculpture(canvas)(22);
  // X=Y=0 implies xα=v=0. Therefore θ=π/2−α+kπ and
  // r=23θ cot(β)/sin(θ+α). Find every sheet crossing this ray independently.
  const alpha = (22 * Math.PI) / 180,
    crossings = [];
  for (let k = -3; k <= 3; k++) {
    const theta = Math.PI / 2 - alpha + k * Math.PI;
    const radius = (23 * theta) / Math.tan(0.48) / Math.sin(theta + alpha);
    if (Math.abs(theta) <= 4.1 && Math.abs(radius) <= 140)
      crossings.push({ theta, radius, depth: (23 * theta) / Math.sin(0.48) });
  }
  assert.equal(crossings.length, 2);
  const nearest = crossings.sort((a, b) => b.depth - a.depth)[0];
  const n = project(normal(nearest.radius, nearest.theta), 22);
  const light = 0.64 + 0.36 * Math.abs(-0.36 * n[0] - 0.48 * n[1] + 0.8 * n[2]);
  const color = n[2] >= 0 ? [228, 244, 137] : [104, 143, 225];
  const pixel = (120 * 321 + 160) * 4;
  for (let channel = 0; channel < 3; channel++)
    assert.ok(
      Math.abs(image.data[pixel + channel] - color[channel] * light) < 2,
      "Nearest-sheet shading agrees within tessellation error",
    );
  assert.equal(image.data[pixel + 3], 255);
});
