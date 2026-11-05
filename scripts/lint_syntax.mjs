import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Check every active module instead of maintaining a partial list in package.json.
const files = ["script.js", "playwright.config.mjs"];
for (const directory of ["assets", "scripts", "tests"]) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isFile() && /\.(m?js)$/.test(entry.name))
      files.push(`${directory}/${entry.name}`);
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(
  `PASS: JavaScript syntax in ${files.length} source and test files.`,
);
