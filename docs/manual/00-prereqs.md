# Setup — Prerequisites (manual track)

**Time:** 5 minutes. Do this **before** the workshop starts.

## Goal

You leave this exercise with:

- Node 20+ and git installed
- The UI5 CLI installed globally
- A clear answer to "does Chrome AI work on this laptop, or do I run `?mock=1`?"

## Why this matters

This track builds the UI5 app on top of a ready-made starter you clone during setup. If
your toolchain isn't ready, the clone-and-run step stalls on the first command. Five minutes now saves
you the scramble later.

---

## Steps

### 1. Install the toolchain

```bash
node --version     # want v20.x or v22.x
git --version      # want 2.40+

npm i -g @ui5/cli
```

Confirm:

```bash
ui5 --version      # UI5 CLI 4.x
```

> **Node 18 or older won't work** — the starter's data service needs Node 20+.
> Everything else the starter needs is installed by `npm install` during setup.

### 2. (Optional) An AI coding assistant with MCP

This manual track doesn't require one — you copy/paste every file. But if you want to
compare the manual flow with an assistant-driven one, install
[Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com),
or VS Code + Copilot, and see [Setup: MCP setup](01-mcp-setup.md).

### 3. Pick a working folder

You'll clone the starter next. Just pick where it goes:

```bash
mkdir -p ~/dev && cd ~/dev
# the next setup step clones the starter project here
```

### 4. Decide now: real Chrome AI, or `?mock=1`?

You can't run this test until the app exists (Exercise 1), but you can pre-check the APIs
today in any Chrome tab. Open DevTools console on **any page** and paste:

```js
for (const api of ['LanguageModel', 'Summarizer', 'Writer', 'Rewriter', 'LanguageDetector']) {
  if (api in self) {
    self[api].availability().then(a => console.log(api, '→', a));
  } else {
    console.log(api, '→ not exposed');
  }
}
self.Translator?.availability({sourceLanguage:'de', targetLanguage:'en'})
  .then(a => console.log('Translator de→en →', a));
```

**Read the results:**

| Output | Meaning | Action |
|---|---|---|
| `available` on all | Chrome AI ready | Do the workshop in real mode |
| `downloadable` on some | Chrome downloads the model on first `create()` | Real mode; expect a wait in Exercise 2 |
| `unavailable` + enterprise-policy banner | Your Chrome is corporate-managed | **Use `?mock=1`** |
| `not exposed` on Writer/Rewriter | Origin trial not enabled | Fine — Exercise 5 covers the fallback |

If you're on a managed machine, don't fight it — either use `?mock=1` (Exercise 1 onward)
or create a personal Chrome profile not signed into your work account. Enterprise policies
typically don't apply cross-profile.

---

## Verify

- [ ] `ui5 --version` prints a version
- [ ] `node --version` is 20 or 22
- [ ] The DevTools smoke test returned a status for each API
- [ ] You know whether you're doing **real mode** or **`?mock=1`**

---

## Gotchas

- **Ports 4004 or 8080 already in use** later → `lsof -ti:4004,8080 | xargs kill -9`.
  (The starter's data service listens on 4004; the UI5 dev server on 8080.)
- **`chrome://policy`** — if any `GenAI*` entries are set, you're on `?mock=1`.
- **Writer / Rewriter are Origin Trial** as of Chrome 148 (July 2026). Not having them is
  normal; Exercise 5 handles it with a fallback.

---

Ready? → [Setup: MCP setup](01-mcp-setup.md)
