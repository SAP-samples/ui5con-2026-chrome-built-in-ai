# AI-assistant track — add Chrome AI by prompting

This track adds Chrome's built-in AI APIs to the same base UI5 app as the
[manual track](../manual/README.md), but you drive an **AI coding assistant** (Claude Code,
Cursor, or Copilot) with UI5 MCP wired up. You prompt; the assistant emits code; you review
and correct.

> **The starter is a black box.** You clone a starter that already contains a runnable base
> UI5 app, the data service (a small CAP app serving 8 tickets), and all tooling. You never
> prompt the assistant to build or touch the data service or tooling — from Exercise 1 on you
> only ask it to add AI to the `webapp/` app.

> **The manual track is the source of truth.** Every exercise here ends by telling you to
> diff the assistant's output against the matching
> [`docs/manual/NN-*.md`](../manual/README.md) exercise, which prints the exact target code.
> When the assistant drifts (it will, occasionally), the manual exercise is the answer key.

## Why build it this way

Two skills, learned together:

1. **The Chrome built-in AI APIs** — Summarizer, LanguageDetector, Translator, Prompt (with
   Writer + fallback) — behind a single `ai.ts` seam.
2. **MCP-augmented UI5 development** — how a properly-wired assistant emits *current* UI5
   code (correct `sap.m.Table`, `this.byId`, formatter bindings) instead of hallucinated
   2018 patterns, and how to catch it when it doesn't.

## Steps

| Step | Ends with |
|------|-----------|
| [Setup: Prerequisites](00-prereqs.md) | toolchain + Chrome-AI decision |
| [Setup: MCP setup](01-mcp-setup.md) | assistant wired to UI5 MCP |
| [Setup: Clone the starter + run the base app](02-bootstrap.md) | base list/detail app running |
| [Exercise 1 — UI scaffold + the `ai.ts` seam](03-ui-scaffold.md) | AI columns/buttons + `ai.ts` + `?mock=1` |
| [Exercise 2 — Summarizer + LanguageDetector](04-summarizer.md) | Analyze fills language + summary |
| [Exercise 3 — Translator (English-pivot)](05-translator.md) | Detail page translates to English |
| [Exercise 4 — Prompt API + JSON-schema output](06-prompt-structured.md) | sentiment / category / priority |
| [Exercise 5 — Writer API + progress UX](07-writer-fallback.md) | drafted replies + download progress |

## Reference

- [../cheatsheet.md](../cheatsheet.md) — one-page Chrome AI API reference
- [../troubleshooting.md](../troubleshooting.md) — top blockers and fixes
- [../manual/README.md](../manual/README.md) — the exact-code answer key

## Ground rules for prompting

- **Make the assistant use MCP.** If it emits UI5 without checking the API reference,
  re-prompt: *"Use UI5 MCP `get_api_reference` before generating."*
- **Diff every exercise.** After the assistant finishes, compare against the manual exercise.
  Small stylistic differences are fine; structural ones (wrong control, missing model field)
  are not.
- **`ai.ts` ships complete at Exercise 1.** Exercises 2–5 wire controllers. Don't let the
  assistant rewrite `ai.ts` exercise by exercise.
- **Run the linter.** After any UI5 change, have the assistant run
  `mcp__ui5__run_ui5_linter` with `fix: true`.

Ready? → [Setup: Prerequisites](00-prereqs.md)
