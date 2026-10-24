import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

// Windows often supplies a python3 Store alias instead of an interpreter.
// Probe candidates without changing PATH or installing another Python.
const candidates = [
  process.env.PYTHON,
  "python3",
  "python",
  "py",
  join(
    homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  ),
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
    "Python 3 is required for integrity checks and builds. Install Python 3 or set PYTHON to its executable path. npm start only requires Node.js.",
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
