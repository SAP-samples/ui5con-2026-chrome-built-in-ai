# UI5 Chrome AI Workshop — Hands-On

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

Both tracks start from an empty folder and end at the identical finished app. Every step
gives you the exact code (or the exact prompt) to reach the next — no step is left implicit.

### 🅐 [Manual track](docs/manual/README.md) — copy/paste, no assistant

Every file is printed in full. When a chapter changes a file, it prints the **entire new
file** and you replace it wholesale. Best if you want to understand every line, or you don't
have an MCP-capable assistant.

→ **[Start the manual track](docs/manual/README.md)**

### 🅑 [AI-assistant track](docs/ai/README.md) — prompt-driven with MCP

You drive Claude Code / Cursor / Copilot with UI5 MCP wired up. Each chapter gives you a
precise prompt, then points you at the matching manual chapter as the **answer key** to diff
against. Best if you want to learn MCP-augmented UI5 development.

→ **[Start the AI-assistant track](docs/ai/README.md)**

Both tracks share the same chapters:

| # | Chapter | Chrome AI API | Ends at |
|---|---------|---------------|---------|
| 0 | Prerequisites | — | environment ready |
| 1 | MCP setup | — | assistant wired to UI5 MCP |
| 2 | Clone the starter + build the UI5 app | — | `cp0` |
| 3 | UI scaffold + the `ai.ts` seam | (all, behind one seam) | `cp1` |
| 4 | Summarizer + LanguageDetector | Summarizer, LanguageDetector | `cp2` |
| 5 | Translator (English-pivot) | Translator | `cp3` |
| 6 | Prompt API + JSON-schema output | LanguageModel (Prompt) | `cp4` |
| 7 | Writer API + progress UX | Writer (+ fallback) | `cp5` |

## Reference (open in a second tab while you work)

- [docs/cheatsheet.md](docs/cheatsheet.md) — one-page Chrome AI API reference
- [docs/troubleshooting.md](docs/troubleshooting.md) — top blockers and fixes

## No Chrome AI on your machine? Add `?mock=1`

If your Chrome is corporate-managed (or you haven't downloaded the on-device model yet), the
AI APIs return `unavailable`. **The workshop still works** — from Chapter 3 on, append
`?mock=1` to the URL:

```
http://localhost:8080/index.html?mock=1
```

Every AI call is routed through `webapp/model/ai.ts`, which swaps in
`webapp/model/ai.mock.ts` — deterministic canned output. Every chapter, including the JSON
Schema classifier and the drafted reply, produces a plausible result. You learn the same API
patterns; the model just doesn't actually run. See
[troubleshooting.md](docs/troubleshooting.md) for why this happens on managed profiles.

## The `starter` branch and checkpoints

The `starter` branch is the granted baseline you clone: the OData V4 data service (a small
CAP app) plus all project tooling, with no UI5 app yet. Branches `cp0`…`cp5` build the
`webapp/` UI5 app on top of it, one chapter at a time:

| Branch | End of chapter | State |
|---|---|---|
| `starter` | — | data service + tooling only (the given baseline) |
| `cp0` | Chapter 2 | UI5 list/detail app, no AI |
| `cp1` | Chapter 3 | AI scaffold + complete `ai.ts` + mock |
| `cp2` | Chapter 4 | Summarizer + LanguageDetector wired |
| `cp3` | Chapter 5 | Translator wired |
| `cp4` | Chapter 6 | Prompt-API classification wired |
| `cp5` | Chapter 7 | Writer + progress UX (= finished app) |

`main` carries `cp5`'s code plus these docs. If you fall behind, jump to a checkpoint:

```bash
git stash            # save your in-progress work
git checkout cp3     # jump to the state at the end of Chapter 5
npm install
npm start
```

`git checkout main` puts you back.

## The `ai.ts` seam

All Chrome AI calls go through `webapp/model/ai.ts`. Controllers call `ai.summarize(...)`,
`ai.translate(...)`, `ai.classify(...)`, `ai.draftReply(...)` — never a Chrome global
directly. That single seam is what makes `?mock=1` work and what you'd steal for your own
app. The shim ships **complete at Chapter 3** (`cp1`); Chapters 4–7 wire controllers to it.

Ready? Pick a track above and start with **Chapter 0: Prerequisites**
([manual](docs/manual/00-prereqs.md) · [AI](docs/ai/00-prereqs.md)).
