// Ideal teaching models. No hardware input or telemetry is consumed here.
export function resistorReadings(voltage, resistance) {
  if (
    !Number.isFinite(voltage) ||
    !Number.isFinite(resistance) ||
    voltage < 0 ||
    resistance <= 0
  )
    throw new RangeError("Use a nonnegative voltage and positive resistance.");
  const current = voltage / resistance;
  return { current, power: voltage * current };
}
export function pwmTiming(dutyPercent, frequency) {
  if (
    !Number.isFinite(dutyPercent) ||
    dutyPercent < 0 ||
    dutyPercent > 100 ||
    !Number.isFinite(frequency) ||
    frequency <= 0
  )
    throw new RangeError("Invalid PWM settings.");
  const period = 1 / frequency;
  return {
    period,
    onTime: (period * dutyPercent) / 100,
    duty: dutyPercent / 100,
  };
}
export function uartFrame(byte) {
  if (!Number.isInteger(byte) || byte < 0 || byte > 255)
    throw new RangeError("Expected a byte.");
  return [0, ...Array.from({ length: 8 }, (_, i) => (byte >> i) & 1), 1];
}
export function protocolSignals(protocol) {
  const msb = (byte) =>
    Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1);
  if (protocol === "uart")
    return [{ name: "TX · 8N1", values: [1, ...uartFrame(0x53), 1] }];
  if (protocol === "i2c") {
    const clock = [1, 1, 0],
      data = [1, 0, 0];
    for (const bit of [...msb(0x53), 0]) {
      clock.push(0, 1, 0);
      data.push(bit, bit, bit);
    }
    clock.push(1, 1, 1);
    data.push(0, 1, 1);
    return [
      { name: "SCL", values: clock },
      { name: "SDA · ACK = 0", values: data },
    ];
  }
  if (protocol === "spi") {
    const clock = [0],
      select = [1],
      mosi = [0],
      miso = [0];
    const send = msb(0xa5),
      receive = msb(0x3c);
    for (let i = 0; i < 8; i++) {
      clock.push(0, 1);
      select.push(0, 0);
      mosi.push(send[i], send[i]);
      miso.push(receive[i], receive[i]);
    }
    clock.push(0, 0);
    select.push(0, 1);
    mosi.push(send[7], send[7]);
    miso.push(receive[7], receive[7]);
    return [
      { name: "SCLK · MODE 0", values: clock },
      { name: "MOSI", values: mosi },
      { name: "MISO", values: miso },
      { name: "CS · ACTIVE LOW", values: select },
    ];
  }
  if (protocol === "can") {
    const dominant = [false, false, true, true, false, true, false, false];
    return [
      {
        name: "CAN_H · V",
        values: dominant.map((d) => (d ? 3.5 : 2.5)),
        domain: [1.5, 3.5],
      },
      {
        name: "CAN_L · V",
        values: dominant.map((d) => (d ? 1.5 : 2.5)),
        domain: [1.5, 3.5],
      },
    ];
  }
  throw new RangeError("Unknown protocol.");
}
export function stepPath(values, left, top, width, height, domain = [0, 1]) {
  const y = (value) =>
    top + height * (1 - (value - domain[0]) / (domain[1] - domain[0]));
  const unit = width / values.length;
  let path = `M${left} ${y(values[0])}`;
  values.forEach((value, i) => {
    if (i) path += `V${y(value)}`;
    path += `H${left + (i + 1) * unit}`;
  });
  return path;
}
