# Troubleshooting

## Top 5 blockers and fixes

### 1. `LanguageModel is not defined` (or `Summarizer`, `Translator`, `LanguageDetector`)

**Cause:** Wrong Chrome version or the API isn't available on this profile.

**Fix:**
1. Confirm `chrome://version` shows Chrome 148 or newer.
2. If Chrome is managed by IT, use a **personal profile** (`chrome://policy` should not list `GenAILocalFoundationalModelSettings` or `TranslatorAPIAllowed`).
3. Fastest workaround for the workshop: append `?mock=1` to the URL and keep coding.

### 2. `availability()` returns `"downloadable"` mid-session

**Cause:** The model needs to download and no user gesture triggered it yet.

**Fix:** Call `Summarizer.create()` (or any `create()`) from a button press — that's the user gesture. Wire the `monitor` callback for progress UX. If this happens on stage, use `?mock=1`.

### 3. UI5 tooling won't serve the app

**Cause:** Port 8080 in use by another process, or `ui5` command not found.

**Fix:**
```bash
lsof -i :8080     # find and kill the process, or:
PORT=8081 ui5 serve
```

### 4. AI assistant generates React / Vue code instead of UI5

**Cause:** The MCP servers aren't loaded, or the assistant is falling back to training data.

**Fix:** In the assistant, run this test prompt: *"Using UI5 MCP, what UI5 version am I on?"* — a real answer means MCP is wired. If it says something wrong or gives a training-data guess, restart the assistant, verify `.mcp.json` is loaded, and re-prompt with "Use UI5 MCP to fetch the API reference first."

### 5. `session.prompt(text)` returns empty string

**Cause:** Input exceeds the model's context window, or content triggered a safety filter.

**Fix:**
```js
const need = await session.measureContextUsage(text);
if (need > session.contextWindow - 100) {
  // chunk the input, or truncate
}
```

## Diagnostic pages

### `chrome://on-device-internals`

If enabled (some Chrome builds hide this — launch Chrome with `--enable-features=OnDeviceModelService`):

- **Model Status** tab: shows the foundational model, its version, backend, folder size, and VRAM check
- **Event Log** tab: dumps all API-call events to JSON, useful for bug reports
- **Tools** tab: interactive prompt harness with Top K / temperature sliders

### `chrome://components`

Find "Optimization Guide On Device Model". Version `0.0.0.0` means not yet downloaded — click **Check for update**.

## Mock mode

Append `?mock=1` to any URL to swap `ai.ts` for `ai.mock.ts`. Same interface, canned responses. The workshop app is fully functional in mock mode.

## Enterprise policy check

Run `chrome://policy` and search for:
- `GenAILocalFoundationalModelSettings` — if `1`, foundation-model APIs are disabled and any downloaded model is deleted
- `TranslatorAPIAllowed` — if `false`, Translator is off

**Both mean the profile is corporate-managed. Use a personal profile.**

## The AI shim (`webapp/model/ai.ts`)

All AI calls go through this file — that's the seam that makes `?mock=1` work. If a controller starts calling `LanguageModel` / `Summarizer` / `Translator` / `LanguageDetector` directly, mock mode won't intercept it. Add new APIs to `ai.ts` first, then call the shim from controllers.

## `ai.mock.js: exports is not defined`

If the app loads but the console shows `ReferenceError: exports is not defined at ai.mock.js`, the UI5 Babel transpile hit a known heuristic: a `.ts` file with only `import type` + a single `export const` can get treated as a script and emit a broken CJS shim.

The workshop's `ai.mock.ts` has real runtime logic, so you normally won't hit this. If you do (e.g. after stripping the file down), add any runtime side-effect import — for example `import "sap/base/Log";` right below the `import type ...` line. That forces the transpiler to classify the file as a proper ES module.

## `npm install` peer-dependency errors

The starter's `package.json` pins a known-good set (the data-service deps plus the UI5
tooling and Babel presets pulled transitively by `ui5-tooling-transpile`). The same pins are
used on `starter` and every exercise branch, so `npm install` works whether you're on
`main`, `starter`, or any `exercise-*` branch. You don't hand-edit `package.json` in either track — it's
part of the granted starter. If you see `ERESOLVE`, make sure you cloned the starter and ran
`npm install` at its root rather than copying files piecemeal.

