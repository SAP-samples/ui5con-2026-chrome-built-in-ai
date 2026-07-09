# Setup — Prerequisites (AI-assistant track)

**Time:** 5 minutes. Do this **before** the workshop starts.

## Goal

- Node 20+, git, and an AI coding assistant that supports MCP
- The UI5 CLI installed globally
- A clear answer to "does Chrome AI work on this laptop, or do I run `?mock=1`?"

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

### 2. Install an AI coding assistant with MCP support

Any of:

- **[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)** (recommended — MCP is native)
- **[Cursor](https://cursor.com)** (MCP via `~/.cursor/mcp.json`)
- **VS Code + GitHub Copilot** (MCP support depends on Copilot version)

You wire it up in [Setup: MCP setup](01-mcp-setup.md). This track leans on the assistant heavily,
so pick one you can get MCP working in — Claude Code or Cursor are the safe bets.

### 3. Pick a working folder

```bash
mkdir -p ~/dev && cd ~/dev     # the next setup step clones the starter here
```

### 4. Decide now: real Chrome AI, or `?mock=1`?

Open DevTools console on **any** Chrome tab and paste:

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

| Output | Meaning | Action |
|---|---|---|
| `available` on all | Chrome AI ready | Real mode |
| `downloadable` on some | Downloads on first `create()` | Real mode; expect a wait in Ch4 |
| `unavailable` + policy banner | Corporate-managed Chrome | **Use `?mock=1`** |
| `not exposed` on Writer/Rewriter | OT not enabled | Fine — Exercise 5 fallback covers it |

Managed machine? Use `?mock=1` (from Exercise 1 on) or a personal Chrome profile.

---

## Verify

- [ ] `ui5 --version` prints a version
- [ ] Your assistant is installed and open
- [ ] You know whether you're in **real mode** or **`?mock=1`**

---

Ready? → [Setup: MCP setup](01-mcp-setup.md)
