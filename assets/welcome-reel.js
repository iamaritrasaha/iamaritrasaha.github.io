// Choreography and mathematical foundations for the Cipher Reel animation.
export const CIPHER_SYMBOLS = [
  "0",
  "1",
  "A",
  "F",
  "7",
  "X",
  "#",
  "/",
  "{",
  "}",
];
export const INITIAL_FIELD = ["0", "1", "A", "F", "7", "X", "#", "/", "{", "}"];

export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export const easeOutQuart = (t) => 1 - Math.pow(1 - clamp(t), 4);

// Velvety smooth deceleration with a gentle mechanical settle before locking.
export function latchProgress(p) {
  const t = clamp(p);
  const quart = 1 - Math.pow(1 - t, 4);
  const overshoot = Math.sin(t * Math.PI) * (1 - t) * 0.008;
  return t >= 1 ? 1 : quart + overshoot;
}

// Compute deterministic, rhythmic flip schedule:
// Decelerates gracefully from ~40-65ms flutters to ~150-180ms clacks.
// Guarantees an even number of half-turns so the front face always lands at 0deg.
export function getCharacterCadence(index, char) {
  let settle;
  let n;
  if (index <= 5) {
    settle = 1250 + index * 180;
    n = 12 + Math.floor(index / 2) * 2;
  } else {
    const s = index - 7;
    settle = 2470 + s * 210;
    n = 18 + s * 2;
  }
  const flips = [];
  const a = 0.72;
  for (let k = 1; k <= n; k++) {
    flips.push(Math.round(settle * Math.pow(k / n, 1 / a)));
  }
  return { index, char, settle, n, flips };
}

// Evaluate card rotation angle, face visibility, and glyph content at timestamp.
export function computeFaceState(cadence, elapsed) {
  if (elapsed >= cadence.settle) {
    return {
      settled: true,
      angle: 0,
      isFrontFacing: true,
      front: { text: cadence.char, isTarget: true },
      back: { text: "", isTarget: false },
      light: 1,
    };
  }

  const flips = cadence.flips;
  let f = 0;
  while (f < flips.length && elapsed >= flips[f]) f++;
  const prevTime = f === 0 ? 0 : flips[f - 1];
  const nextTime = flips[Math.min(f, flips.length - 1)];
  const span = Math.max(nextTime - prevTime, 1);
  const progress = clamp((elapsed - prevTime) / span);
  const isFinalFlip = f === flips.length - 1;

  const eased = isFinalFlip ? latchProgress(progress) : easeOutQuart(progress);
  const baseAngle = f * 180;
  const angle = baseAngle + eased * 180;

  const turn = Math.floor(angle / 180);
  const isFrontFacing = turn % 2 === 0;

  const angleInTurn = angle % 180;
  const rad =
    (angleInTurn > 90 ? 180 - angleInTurn : angleInTurn) * (Math.PI / 180);
  const light = Math.max(0.42, Math.cos(rad));

  let frontText, frontTarget, backText, backTarget;

  if (isFinalFlip && progress > 0.45) {
    if (isFrontFacing) {
      frontText = cadence.char;
      frontTarget = true;
      backText =
        CIPHER_SYMBOLS[(cadence.index + turn - 1) % CIPHER_SYMBOLS.length];
      backTarget = false;
    } else {
      backText = cadence.char;
      backTarget = true;
      frontText =
        CIPHER_SYMBOLS[(cadence.index + turn - 1) % CIPHER_SYMBOLS.length];
      frontTarget = false;
    }
  } else {
    frontText = CIPHER_SYMBOLS[(cadence.index + turn) % CIPHER_SYMBOLS.length];
    frontTarget = false;
    backText =
      CIPHER_SYMBOLS[(cadence.index + turn + 1) % CIPHER_SYMBOLS.length];
    backTarget = false;
  }

  return {
    settled: false,
    angle,
    isFrontFacing,
    front: { text: frontText, isTarget: frontTarget },
    back: { text: backText, isTarget: backTarget },
    light,
  };
}

// Measure each character's exact subpixel bounds using DOM Text Ranges.
export function measureSlots(visual, container) {
  const containerRect = container.getBoundingClientRect();
  const textNode = visual.firstChild;
  if (!textNode || !textNode.length) return [];

  const range = document.createRange();
  const slots = [];
  const text = textNode.textContent;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") continue;
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    const rect = range.getBoundingClientRect();

    slots.push({
      char: text[i],
      index: i,
      left: rect.left - containerRect.left,
      width: rect.width,
    });
  }

  return slots;
}
