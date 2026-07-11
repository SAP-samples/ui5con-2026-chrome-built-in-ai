# Setup — MCP setup (AI-assistant track)

**Time:** 5 minutes. **Ends at:** your assistant can query the UI5 API reference for the
version you're on. **This exercise is required** for the AI track — the whole point is that
the assistant emits current UI5 code because it can look things up.

## Why this matters

Most LLMs were trained on UI5 from 2020–2023 — before `sap.m.Table` swallowed most of
`sap.ui.table`'s use cases, before TypeScript was first-class, before half of
`sap.ui.commons` was deprecated. Ask a naked LLM for a UI5 table and there's a real chance
it emits `sap.ui.table.Table` (desktop-only, wrong) with `jQuery.sap.declare(...)`
(deprecated in 2016). MCP gives the assistant a live tool to look up the **actual** API for
**your** framework version before it generates.

## The server

- **UI5 MCP** (`@ui5/mcp-server`) — UI5 API reference, guidelines, linter, manifest validation

> This workshop is UI5 + the Chrome AI APIs. The data service is a black box shipped in the
> starter, so there's no CAP/OData MCP server here — you never prompt the assistant to build
> or query it.

## Wire it up

The starter (which you clone during setup) ships a `.mcp.json` at its root:

> **File:** `.mcp.json` (already in the starter — shown for reference)

```json
{
  "mcpServers": {
    "ui5": {
      "command": "npx",
      "args": ["-y", "@ui5/mcp-server@latest"]
    }
  }
}
```

`npx -y` pulls the server on first use.

**Claude Code:** open the project directory; `.mcp.json` is auto-detected. Confirm the
server in `/mcp`.

**Cursor:** put the same `mcpServers` block in `~/.cursor/mcp.json`, restart.

**VS Code + Copilot:** add it under `"github.copilot.mcp.servers"` in settings JSON, reload.
If your Copilot version lacks MCP, switch to Claude Code or Cursor for this workshop.

> Not cloned the starter yet? You can add this `.mcp.json` to any folder now to test the
> connection, then clone the starter (which already includes it).

## Prove it's wired (assistants lie)

Ask, verbatim:

> Using UI5 MCP, what UI5 version is this project on and what's the current API for `sap.m.Table`? Give me the version number and a two-line summary.

A **working** setup answers with the framework version (SAPUI5 1.140.0, from the starter's
`webapp/ui5.yaml`) and a real API description. A **broken** setup waffles ("I don't have
access to your files") or invents a version. If broken: restart the assistant, re-check
`.mcp.json`, re-ask.

## The `CLAUDE.md` primer

The starter ships a `CLAUDE.md` at the repo root that tells the assistant *when* to reach
for each MCP tool and lists the house conventions (SAPUI5 freestyle, XML views, TS
controllers, all AI calls through `ai.ts`, never `sap.ui.table`, treat the data service as
given). It loads automatically in Claude Code.

## Two prompts to try before you start

**1. UI5 API lookup**

> Using UI5 MCP, show me the current signature of `sap.ui.model.json.JSONModel#setProperty`. What's the recommended way to fire a binding refresh on nested objects?

It should mention that mutating a nested object doesn't fire — you reassign the parent. That
is exactly the `_setResult` pattern you'll use in Exercise 2.

**2. Ask it to lint fresh code**

> Write a tiny UI5 controller method, then run the UI5 linter on it and fix any deprecated API.

The linter catches `sap.ui.getCore().byId(...)`, `jQuery.sap.*`, `sap.ui.commons.*`, and
other training-data hazards.

---

## Verify

- [ ] The `ui5` server shows as connected
- [ ] The "UI5 version" prompt returns a real version + API summary

---

Ready? → [Setup: Clone the starter + run the base app](02-bootstrap.md)
