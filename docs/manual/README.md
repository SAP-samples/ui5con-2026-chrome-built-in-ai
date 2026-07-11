# Manual track — add Chrome AI to a UI5 app, step by step

This track takes a ready-made base UI5 app and adds Chrome's built-in AI APIs to it — **no
backend LLM, no API key, no cost**. Each AI feature is added as a small **diff** you apply
to a file; every changed file also has its full version in a collapsed section for recovery.

> Prefer to drive an AI coding assistant instead? Use the [AI-assistant track](../ai/README.md).
> The two tracks reach the exact same app.

## What's given, what you build

The workshop ships a **starter** you clone. It already contains everything that isn't the
point of this workshop:

- A **base UI5 app** in `webapp/` — a runnable list/detail app (freestyle TypeScript) bound
  to the data service, with the shared `ai` JSONModel already wired in `Component.ts`. This
  is your starting canvas; you don't build it from scratch.
- An **OData V4 data service** (a small CAP app) that serves 8 support tickets. A black box —
  you never edit it, and this track doesn't explain it. It just answers `/ticket/Tickets`.
- All **project tooling**: `package.json`, `tsconfig.json`, `babel.config.cjs`,
  `webapp/ui5.yaml` (data-service proxy already wired), `.mcp.json`.

**You add the AI**: from Exercise 1 on you edit `webapp/` views and controllers and create the
`webapp/model/` AI seam. That's the workshop: wiring the Chrome AI APIs into a UI5 app.


## How this track works

- **Setup** clones the starter — which already includes a runnable base UI5 app (list +
  detail showing real ticket data) plus the data service and all tooling. You install, run,
  and tour it. Nothing to paste.
- **Exercises 1–5** bolt on the AI, one Chrome API per exercise. Each change is shown as a
  **diff** — exactly what to add or change, and where:

  > **File:** `webapp/controller/List.controller.ts` — _apply this change_
  >
  > ```diff
  > @@ ... @@
  > -    old line
  > +    new line
  > ```

  Apply the `+`/`-` edits to that file. **If you get lost**, every changed file also has a
  collapsed **"Full file after this change"** section right below the diff — expand it and
  copy the whole file to get back on track.
- **Brand-new files** (like `webapp/model/ai.ts`) have no diff — they're printed in full,
  labelled _new file, shown in full_.

## Steps

| Step | Ends with |
|------|-----------|
| [Setup: Prerequisites](00-prereqs.md) | toolchain + Chrome-AI decision |
| [Setup: MCP setup (optional for this track)](01-mcp-setup.md) | assistant wired to UI5 docs |
| [Setup: Clone the starter + run the base app](02-bootstrap.md) | base list/detail app running, no AI |
| [Exercise 1 — UI scaffold + the `ai.ts` seam](03-ui-scaffold.md) | AI columns/buttons + complete `ai.ts` + `?mock=1` |
| [Exercise 2 — Summarizer + LanguageDetector](04-summarizer.md) | Analyze fills language + summary |
| [Exercise 3 — Translator (English-pivot)](05-translator.md) | Detail page translates to English |
| [Exercise 4 — Prompt API + JSON-schema output](06-prompt-structured.md) | sentiment / category / priority chips |
| [Exercise 5 — Writer API + progress UX](07-writer-fallback.md) | drafted replies + download progress |

## Reference (keep open in a second tab)

- [../cheatsheet.md](../cheatsheet.md) — one-page Chrome AI API reference
- [../troubleshooting.md](../troubleshooting.md) — top blockers and fixes

## No Chrome AI on your machine? Add `?mock=1`

From Exercise 1 on, every AI call is routed through `webapp/model/ai.ts`. Append `?mock=1`
to the URL and the seam swaps in `webapp/model/ai.mock.ts`, which returns deterministic
canned output. Every feature — summary, translation, classification, drafted reply — still
produces a plausible result. You learn the same API patterns; the model just doesn't
actually run.

```
http://localhost:8080/index.html?mock=1
```

Ready? → [Setup: Prerequisites](00-prereqs.md)
