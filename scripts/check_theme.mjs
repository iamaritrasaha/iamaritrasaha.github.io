import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../assets/theme.js", import.meta.url),
  "utf8",
);

function page({ dark = false, saved, blocked = false, control = true } = {}) {
  const listeners = {};
  const events = [];
  const root = { dataset: {}, style: {} };
  const storage = new Map(saved ? [["portfolio-theme", saved]] : []);
  const select = {
    value: "system",
    addEventListener: (_, handler) => (select.change = handler),
  };
  const media = {
    matches: dark,
    addEventListener: (_, handler) => (media.change = handler),
  };
  let themeColor;
  const document = {
    documentElement: root,
    readyState: "loading",
    querySelector: () => ({
      setAttribute: (_, color) => (themeColor = color),
    }),
    getElementById: () => (control ? select : null),
    addEventListener: (name, handler) => (listeners[name] = handler),
    dispatchEvent: (event) => events.push(event),
  };
  function checkStorage() {
    if (blocked) throw new Error("Storage unavailable");
  }
  runInNewContext(source, {
    document,
    window: { matchMedia: () => media },
    localStorage: {
      getItem(key) {
        checkStorage();
        return storage.get(key);
      },
      setItem(key, value) {
        checkStorage();
        storage.set(key, value);
      },
      removeItem(key) {
        checkStorage();
        storage.delete(key);
      },
    },
    CustomEvent: class {
      constructor(type, { detail }) {
        this.type = type;
        this.detail = detail;
      }
    },
  });
  return {
    root,
    storage,
    events,
    get color() {
      return themeColor;
    },
    load: () => listeners.DOMContentLoaded(),
    system(value) {
      media.matches = value;
      media.change();
    },
    choose(value) {
      select.value = value;
      select.change();
    },
    select,
  };
}

test("the first frame follows the system before controls are connected", () => {
  const dark = page({ dark: true });
  assert.equal(dark.root.dataset.theme, "dark");
  assert.equal(dark.root.dataset.themePreference, "system");
  assert.equal(dark.color, "#211f24");
  dark.system(false);
  assert.equal(dark.root.dataset.theme, "light");
  assert.equal(dark.color, "#f4efe7");
});

test("an explicit choice persists and ignores system changes until reset", () => {
  const p = page({ saved: "light", dark: true });
  assert.equal(p.root.dataset.theme, "light");
  p.load();
  assert.equal(p.select.value, "light");
  p.choose("dark");
  assert.equal(p.storage.get("portfolio-theme"), "dark");
  p.system(false);
  assert.equal(p.root.dataset.theme, "dark");
  p.choose("system");
  assert.equal(p.storage.has("portfolio-theme"), false);
  assert.equal(p.root.dataset.theme, "light");
  p.system(true);
  assert.equal(p.root.dataset.theme, "dark");
  assert.equal(p.events.at(-1).type, "portfolio:themechange");
  assert.equal(p.events.at(-1).detail.preference, "system");
});

test("blocked storage and invalid saved values preserve usable controls", () => {
  const p = page({ blocked: true, dark: true });
  p.load();
  p.choose("light");
  assert.equal(p.root.dataset.theme, "light");
  p.choose("system");
  assert.equal(p.root.dataset.theme, "dark");
  assert.equal(
    page({ saved: "invalid" }).root.dataset.themePreference,
    "system",
  );
});

test("pages without a theme selector still follow the system", () => {
  const p = page({ control: false });
  p.load();
  p.system(true);
  assert.equal(p.root.dataset.theme, "dark");
});
