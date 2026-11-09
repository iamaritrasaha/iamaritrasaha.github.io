# Welcome Screen — Plain-Name Flash Elimination

**Branch:** `fix/welcome-plain-name-flash`  
**Target:** `main`

## Executive Summary

On initial page load, the welcome screen previously displayed the complete, ordinary name **"Aritra Saha"** in plain text for a fraction of a second before the Cipher Reel animation began.

This investigation identified two distinct code paths responsible for this visual bug:

1. **Cause A (First-Paint Cover):** In `index.html`, `#welcome-paint` contained the literal text `"Aritra Saha"` styled with `font: clamp(38px, 9vw, 135px) / 1 var(--display)`. During HTML parsing before external ES modules loaded, `html[data-welcome-state="pending"]` made `#welcome-paint` visible immediately (`display: grid !important`), exposing the completed name during First Contentful Paint.
2. **Cause B (Non-Atomic Cipher Reel Initialization):** In `assets/bitbench.js`, the welcome overlay (`.bb-entry`) was constructed with plain `<strong>Aritra Saha</strong>` without the initial `.name-pending` state and without `.name-visual` child shielding. When `portfolioWelcome.show(veil)` appended the overlay to `document.body` and removed `#welcome-paint`, the raw wordmark was briefly attached in an unprotected state before `constructWelcomeName` transformed the DOM and initiated font loading.

Both causes have been completely resolved.

---

## Technical Solution

### 1. Neutral Cobalt Engineering-Grid First-Paint Cover (`index.html`)

- Eliminated literal plain text from `#welcome-paint`.
- Styled `#welcome-paint` with the existing cobalt engineering palette (`background-color: var(--deep, #172878)`) and matching engineering-grid gradient pattern (`linear-gradient(#e4f48907 1px, transparent 1px)` with `42px 42px` grid size).
- Added critical inline protection in `<head>`:
  ```css
  html[data-welcome-state="pending"] #welcome-paint {
    display: block !important;
  }
  .name-pending .name-visual,
  .name-constructing .name-visual {
    visibility: hidden !important;
  }
  ```
- Before any external stylesheets or scripts parse, `#welcome-paint` seamlessly covers the page with zero text exposure.

### 2. Pre-Protected Wordmark Overlay Structure (`assets/bitbench.js`)

- When creating the `.bb-entry` overlay in `startup()`, `<strong>` is created already wrapped in the protected structure:
  ```html
  <strong class="name-pending">
    <span class="sr-only">Aritra Saha</span>
    <span class="name-visual" aria-hidden="true">Aritra Saha</span>
  </strong>
  ```
- Screen readers have immediate access to `<span class="sr-only">Aritra Saha</span>`.
- Visually, `.name-visual` is hidden (`visibility: hidden !important`) from the exact moment of DOM instantiation.

### 3. Idempotent Wordmark Construction (`assets/welcome-name.js`)

- `constructWelcomeName(name)` inspects if `.name-visual` already exists.
- Extracts `label` without duplicating text nodes.
- Preserves layout measurements (`createRange()`, `measureSlots()`) on `.name-visual` while hidden.
- Keeps `.name-visual` hidden throughout character card rotation (`data-construction="anticipation"`, `"constructing"`, `"settling"`).
- Reveals `.name-visual` only upon completion (`finish("complete")` after hold duration) or intentional fallback (`finish("fallback")`).

### 4. Obsolete CSS Animation Cleanup (`assets/bitbench.css`)

- Removed legacy `animation: entry-type 0.76s 0.08s both;` on `.bb-entry strong`.

---

## Verification and Test Coverage

### Regression Tests Added

1. **First-Paint Cover Plain-Name Absence (`tests/welcome-paint.spec.mjs`):**
   - Holds model execution to inspect `#welcome-paint` during first paint.
   - Verifies `#welcome-paint` contains empty text (`innerText === ""`).
   - Verifies the cover element occludes the center of the viewport without exposing the wordmark.
2. **Atomic Initialization & Handoff Protection (`tests/welcome-name.spec.mjs`):**
   - Intercepts font loading to verify `.bb-entry > strong` mounts in `.name-pending` state with `.name-visual` hidden.
   - Verifies initial card faces display only programming symbols (`0`, `1`, `A`, `F`, `7`, `X`, `#`, `/`, `{`, `}`).
   - Verifies `.name-visual` remains hidden throughout spinning.
   - Verifies smooth handoff to native Literata text at `data-construction="complete"` with zero duplicate wordmarks.

### Full Test Suite Results

- `npm run lint`: **PASS** (Prettier format check, HTML-validate, JS syntax across 57 files).
- `npm test`: **PASS** (37/37 unit & property tests, resource budgets verified).
- `npm run build`: **PASS** (Static artifact verification in `dist/`).
- `npm run test:browser`: **PASS** (164/164 Playwright tests passed).
- Playwright video recordings and frame audit captured in `docs/welcome-construction/`.
