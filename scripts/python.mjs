import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Windows often supplies a python3 Store alias instead of an interpreter.
// Probe candidates without changing PATH or installing another Python.
let localPython;
try {
  localPython = readFileSync(
    new URL("../.python-path", import.meta.url),
    "utf8",
  ).trim();
} catch {
  // Optional machine-local interpreter configuration.
}
const candidates = [
  process.env.PYTHON,
  localPython,
  "python3",
  "python",
  "py",
].filter(Boolean);
const python = candidates.find((candidate) => {
  const result = spawnSync(candidate, ["--version"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return (
    result.status === 0 && /Python 3\./.test(result.stdout + result.stderr)
  );
});
if (!python) {
  console.error(
    "Python 3 is required for integrity checks and builds. Install Python 3, set PYTHON to its executable path, or save that path in .python-path. npm start only requires Node.js.",
  );
  process.exit(1);
}
const result = spawnSync(python, process.argv.slice(2), {
  stdio: "inherit",
  windowsHide: true,
  env: { ...process.env, PYTHONUTF8: "1" },
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
