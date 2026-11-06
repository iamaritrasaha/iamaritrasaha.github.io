import { test } from "node:test";
import assert from "node:assert/strict";
import { penOrder, flight, sampleGlyph } from "../assets/welcome-strokes.js";

test("A follows its diagonals, crossbar, then terminal details", () => {
  const bounds = { left: 0, top: 0, width: 100, height: 100 };
  const points = [
    [10, 96],
    [40, 23],
    [65, 44],
    [87, 96],
    [30, 64],
    [65, 64],
    [100, 100],
  ];
  const orders = points.map(([x, y]) => penOrder("A", { x, y }, bounds).order);
  for (let i = 1; i < orders.length; i++) assert.ok(orders[i] > orders[i - 1]);
});

test("curved flights settle exactly on ink and remain deterministic", () => {
  const point = { x: 40, y: 50, tx: 0, ty: 1 };
  const start = flight(point, 0, 100, 2);
  const middle = flight(point, 0.5, 100, 2);
  assert.deepEqual(flight(point, 1, 100, 2), { x: 40, y: 50 });
  assert.deepEqual(flight(point, 0.5, 100, 2), middle);
  // A curved approach does not pass through the linear segment midpoint.
  assert.ok(
    Math.abs(
      (middle.x - start.x) * (point.y - start.y) -
        (middle.y - start.y) * (point.x - start.x),
    ) > 1,
  );
});

test("raster fragments preserve every antialiased ink pixel exactly once", () => {
  const width = 36,
    height = 42;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 2; y < 40; y++)
    for (let x = 2; x < 34; x++) {
      // Thin diagonal plus disconnected serif and a counter: retain faint edges too.
      if (Math.abs(x - y * 0.7) < 2 || (y === 39 && x > 19))
        data[(y * width + x) * 4 + 3] = x % 2 ? 255 : 12;
    }
  const points = sampleGlyph(data, width, height, 0, width, 4, "A", 2);
  assert.ok(points.length > 5 && points.length < 180);
  const coverage = new Uint8Array(width * height);
  for (const p of points) {
    assert.ok(
      data[(Math.floor(p.y * 2) * width + Math.floor(p.x * 2)) * 4 + 3] > 0,
    );
    for (let y = p.sy; y < p.sy + p.h; y++)
      for (let x = p.sx; x < p.sx + p.w; x++) coverage[y * width + x]++;
  }
  for (let i = 0; i < coverage.length; i++)
    if (data[i * 4 + 3]) assert.equal(coverage[i], 1);
});
