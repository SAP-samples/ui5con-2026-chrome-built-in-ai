# Workshop repo instructions for AI assistants

You are helping someone build a UI5 app that uses Chrome's built-in AI APIs. The app is served an OData V4 model by a CAP service that ships **ready-made in the starter** — treat it as given infrastructure. This workshop focuses only on UI5 and the Chrome AI APIs; do not modify or explain the CAP layer.

## Working conventions

- Framework: **SAPUI5** (freestyle, not Fiori Elements)
- Views: **XML**
- Controllers: **TypeScript** (`.ts`), transpiled via `@ui5/ts-interface-generator` + `babel`
- Prefer `sap.m.*` for responsive controls; `sap.f.*` for Fiori shell layouts
- **Never** use `sap.ui.table.*` (desktop-only) — always `sap.m.Table`
- All AI calls go through `webapp/model/ai.ts`. Controllers must not touch `LanguageModel`/`Summarizer`/`Translator`/`LanguageDetector` directly.

## MCP usage — always

When available, prefer MCP-provided tools over your training memory:

- Before generating UI5 code: call `mcp__ui5__get_guidelines` once per session, then `mcp__ui5__get_api_reference` for any control you're about to emit
- After changing `manifest.json`: call `mcp__ui5__run_manifest_validation`
- After changing any UI5 code: call `mcp__ui5__run_ui5_linter` with `fix: true`

## Chrome AI APIs — house style

- Feature-detect with `('Summarizer' in self)` etc. and `await SomeAPI.availability()`
- Always wire a `monitor(m)` callback with `downloadprogress` on `create()` for first-run UX
- Use `session.contextUsage` / `session.contextWindow` (not the legacy `inputUsage`/`inputQuota`)
- Use `session.measureContextUsage(input)` before large prompts
- For Prompt API structured output: pass a JSON Schema via `responseConstraint` — never rely on prose-formatted output
- Streaming: consume `ReadableStream<string>` deltas via `for await`; chunks are deltas, not cumulative
- Language pairs are English-pivot on Translator — `de↔fr` won't work; go via English

## Never do these

- Do not add `sap.ui.getCore().byId(...)` — deprecated. Use `this.byId(...)` from controllers
- Do not use `jQuery.sap.*` — deprecated
- Do not import from `sap.ui.commons` or `sap.ui.table` — wrong control library
- Do not write `<TextField>` in XML views — use `sap.m.Input`
