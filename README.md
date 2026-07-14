# UI5 Chrome AI Workshop — Hands-On

[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/ui5con-2026-chrome-built-in-ai)](https://api.reuse.software/info/github.com/SAP-samples/ui5con-2026-chrome-built-in-ai)

Build a multilingual customer-feedback triage app in UI5 that uses Chrome's built-in AI
APIs — **no backend LLM, no API key, no cost**. Every model runs on-device. Ticket data is
served by a small OData V4 service that ships ready-made in the starter — the workshop
focuses on **UI5 + the Chrome AI APIs**.

## What you'll build

A UI5 List/Detail app where support tickets in mixed languages (DE / ES / FR / EN) get:

- Auto-detected language (LanguageDetector API)
- One-line TL;DR summary (Summarizer API)
- Structured metadata: sentiment, category, priority (Prompt API + JSON Schema)
- On-demand translation to English (Translator API)
- A drafted reply in the customer's language (Writer API + Prompt-API fallback)

## Two ways to build it — pick your track

Both tracks clone the same starter (a runnable base UI5 app + data service) and end at the
identical finished app. Every step gives you the exact change (or the exact prompt) to reach
the next — no step is left implicit.

### 🅐 [Manual track](docs/manual/README.md) — apply diffs, no assistant

Each AI feature is a small **diff** you apply to a file, with the full file one click away in
a collapsed section for recovery. Best if you want to understand every line, or you don't
have an MCP-capable assistant.

→ **[Start the manual track](docs/manual/README.md)**

### 🅑 [AI-assistant track](docs/ai/README.md) — prompt-driven with MCP

You drive Claude Code / Cursor / Copilot with UI5 MCP wired up. Each exercise gives you a
precise prompt, then points you at the matching manual exercise as the **answer key** to diff
against. Best if you want to learn MCP-augmented UI5 development.

→ **[Start the AI-assistant track](docs/ai/README.md)**

Both tracks share the same steps:

| Step | Chrome AI API | Ends at |
|------|---------------|---------|
| Setup: Prerequisites | — | environment ready |
| Setup: MCP setup | — | assistant wired to UI5 MCP |
| Setup: Clone the starter + run the base app | — | `starter` |
| Exercise 1 — UI scaffold + the `ai.ts` seam | (all, behind one seam) | `exercise-1` |
| Exercise 2 — Summarizer + LanguageDetector | Summarizer, LanguageDetector | `exercise-2` |
| Exercise 3 — Translator (English-pivot) | Translator | `exercise-3` |
| Exercise 4 — Prompt API + JSON-schema output | LanguageModel (Prompt) | `exercise-4` |
| Exercise 5 — Writer API + progress UX | Writer (+ fallback) | `exercise-5` |

## Reference (open in a second tab while you work)

- [docs/cheatsheet.md](docs/cheatsheet.md) — one-page Chrome AI API reference
- [docs/troubleshooting.md](docs/troubleshooting.md) — top blockers and fixes

### Chrome built-in AI API documentation

Official docs for every Chrome built-in AI API used in this project (all called through
`webapp/model/ai.ts`):

- [Built-in AI overview](https://developer.chrome.com/docs/ai/built-in) — capabilities, hardware requirements, and how the on-device model is shared across APIs
- [Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api) — TL;DR summaries (`ai.summarize`)
- [Language Detector API](https://developer.chrome.com/docs/ai/language-detection) — detect the language of ticket text (`ai.detectLanguage`)
- [Translator API](https://developer.chrome.com/docs/ai/translator-api) — English-pivot translation (`ai.translate`)
- [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) — `LanguageModel` with JSON-Schema structured output (`ai.classify`)
- [Writer API](https://developer.chrome.com/docs/ai/writer-api) — draft support replies (`ai.draftReply`)
- [Rewriter API](https://developer.chrome.com/docs/ai/rewriter-api) — companion to Writer for revising existing text

## No Chrome AI on your machine? Add `?mock=1`

If your Chrome is corporate-managed (or you haven't downloaded the on-device model yet), the
AI APIs return `unavailable`. **The workshop still works** — from Exercise 1 on, append
`?mock=1` to the URL:

```
http://localhost:8080/index.html?mock=1
```

Every AI call is routed through `webapp/model/ai.ts`, which swaps in
`webapp/model/ai.mock.ts` — deterministic canned output. Every exercise, including the JSON
Schema classifier and the drafted reply, produces a plausible result. You learn the same API
patterns; the model just doesn't actually run. See
[troubleshooting.md](docs/troubleshooting.md) for why this happens on managed profiles.

## The `starter` branch and exercise branches

The `starter` branch is the granted baseline you clone during setup: a **runnable base UI5
app** (list/detail, no AI) plus the OData V4 data service (a small CAP app) and all project
tooling. Each exercise has a branch holding its finished state:

| Branch | Completes | State |
|---|---|---|
| `starter` | Setup | base UI5 list/detail app + data service + tooling (no AI) |
| `exercise-1` | Exercise 1 | AI scaffold + complete `ai.ts` + mock |
| `exercise-2` | Exercise 2 | Summarizer + LanguageDetector wired |
| `exercise-3` | Exercise 3 | Translator wired |
| `exercise-4` | Exercise 4 | Prompt-API classification wired |
| `exercise-5` | Exercise 5 | Writer + progress UX (= finished app) |

`main` carries `exercise-5`'s code plus these docs. If you fall behind, jump to an exercise
branch:

```bash
git stash                 # save your in-progress work
git checkout exercise-3   # jump to the finished state of Exercise 3
npm install
npm start
```

`git checkout starter` returns to the base app; `git checkout main` gives you the finished
app plus docs.

## The `ai.ts` seam

All Chrome AI calls go through `webapp/model/ai.ts`. Controllers call `ai.summarize(...)`,
`ai.translate(...)`, `ai.classify(...)`, `ai.draftReply(...)` — never a Chrome global
directly. That single seam is what makes `?mock=1` work and what you'd steal for your own
app. The shim ships **complete at Exercise 1** (`exercise-1`); Exercises 2–5 wire controllers to it.

Ready? Pick a track above and start with **Setup: Prerequisites**
([manual](docs/manual/00-prereqs.md) · [AI](docs/ai/00-prereqs.md)).

## Requirements

- **Node.js** `^20.17.0` or `>=22.9.0`, and **npm** `>=8` — to run the UI5 dev server and the data service
- **Git** — to clone this repository
- A modern **Chromium browser (Chrome 148+ / Edge)** — for the on-device Chrome built-in AI APIs (or use `?mock=1` on any browser)
- Optionally, an **MCP-capable AI assistant** (Claude Code, Cursor, or GitHub Copilot) — for the AI-assistant track

Full step-by-step setup instructions are in the Setup steps of each track
([manual](docs/manual/00-prereqs.md) · [AI](docs/ai/00-prereqs.md)).

## How to obtain support

[Create an issue](https://github.com/SAP-samples/ui5con-2026-chrome-built-in-ai/issues) in this repository if you find a bug or have questions about the content.

For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Code of Conduct

This project follows the [SAP Open Source Code of Conduct](CODE_OF_CONDUCT.md), adapted from the [Contributor Covenant](https://www.contributor-covenant.org) v2.1. By participating, you agree to abide by its terms. Report unacceptable behavior to ospo@sap.com.

## Contributing

If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

Copyright 2026 SAP SE or an SAP affiliate company and ui5con-2026-chrome-built-in-ai contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP-samples/ui5con-2026-chrome-built-in-ai).
