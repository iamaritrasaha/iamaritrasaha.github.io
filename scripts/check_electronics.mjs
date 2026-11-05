import test from "node:test";
import assert from "node:assert/strict";
import {
  resistorReadings,
  pwmTiming,
  uartFrame,
  protocolSignals,
} from "../assets/electronics-math.js";

test("ideal resistor conserves power across all three forms", () => {
  for (const v of [0, 1, 5, 12])
    for (const r of [100, 220, 470, 1000]) {
      const { current: i, power: p } = resistorReadings(v, r);
      assert.ok(Math.abs(i * r - v) < 1e-12);
      assert.ok(Math.abs(p - i * i * r) < 1e-12);
      assert.ok(Math.abs(p - (v * v) / r) < 1e-12);
    }
  for (const args of [
    [1, 0],
    [-1, 100],
    [NaN, 100],
    [5, Infinity],
  ])
    assert.throws(() => resistorReadings(...args), RangeError);
});
test("PWM duty and frequency define on-time and period independently", () => {
  for (const f of [500, 1000, 2000])
    for (const d of [0, 10, 35, 90, 100]) {
      const { period, onTime, duty } = pwmTiming(d, f);
      assert.equal(period * f, 1);
      assert.ok(Math.abs(onTime / period - d / 100) < 1e-12);
      assert.equal(duty, d / 100);
    }
  assert.throws(() => pwmTiming(101, 1000));
  assert.throws(() => pwmTiming(50, 0));
});
test("UART is a complete 8N1 frame with least significant bit first", () => {
  assert.deepEqual(uartFrame(0x53), [0, 1, 1, 0, 0, 1, 0, 1, 0, 1]);
  for (let byte = 0; byte < 256; byte++) {
    const frame = uartFrame(byte);
    assert.equal(frame[0], 0);
    assert.equal(frame[9], 1);
    assert.equal(
      frame.slice(1, 9).reduce((n, b, i) => n | (b << i), 0),
      byte,
    );
  }
  assert.throws(() => uartFrame(256));
});
test("I2C has start, eight MSB-first data clocks, acknowledge and stop", () => {
  const [clock, data] = protocolSignals("i2c").map((r) => r.values);
  const sampled = [],
    highChanges = [];
  for (let i = 1; i < clock.length; i++) {
    if (!clock[i - 1] && clock[i]) sampled.push(data[i]);
    if (clock[i - 1] && clock[i] && data[i - 1] !== data[i])
      highChanges.push([data[i - 1], data[i]]);
  }
  assert.deepEqual(sampled.slice(0, 9), [0, 1, 0, 1, 0, 0, 1, 1, 0]);
  assert.deepEqual(highChanges, [
    [1, 0],
    [0, 1],
  ]);
});
test("SPI mode 0 samples two independent bytes on rising edges while selected", () => {
  const [clock, mosi, miso, cs] = protocolSignals("spi").map((r) => r.values);
  const outgoing = [],
    incoming = [];
  for (let i = 1; i < clock.length; i++)
    if (!clock[i - 1] && clock[i]) {
      assert.equal(cs[i], 0);
      assert.equal(mosi[i], mosi[i - 1]);
      assert.equal(miso[i], miso[i - 1]);
      outgoing.push(mosi[i]);
      incoming.push(miso[i]);
    }
  assert.equal(parseInt(outgoing.join(""), 2), 0xa5);
  assert.equal(parseInt(incoming.join(""), 2), 0x3c);
  assert.equal(clock.at(-1), 0);
  assert.equal(cs.at(-1), 1);
});
test("CAN teaching waveforms preserve nominal common mode and differential states", () => {
  const [h, l] = protocolSignals("can").map((r) => r.values);
  h.forEach((v, i) => {
    assert.equal((v + l[i]) / 2, 2.5);
    assert.ok([0, 2].includes(v - l[i]));
  });
  assert.throws(() => protocolSignals("unknown"));
});
