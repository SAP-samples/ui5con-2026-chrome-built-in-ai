# Setup — MCP setup (optional for the manual track)

**Time:** 5 minutes. **Ends at:** your AI assistant can query the UI5 API reference for the
version you're on. **You can skip this exercise** if you're building purely by copy/paste —
nothing in Exercises 1–5 of the manual track requires MCP.

## Why it's here anyway

Even on the manual track, an MCP-wired assistant is useful as a **second opinion**: "is this
the current `sap.m.Table` API?", "is `this.byId` the right accessor here?". And if you ever
repeat this workflow at your desk, MCP is what keeps generated UI5 code from drifting back
to 2018 patterns.

## The server

- **UI5 MCP** (`@ui5/mcp-server`) — UI5 API reference, guidelines, linter, manifest validation

> This workshop is about UI5 + the Chrome AI APIs. The data service is a black box shipped in
> the starter, so there's no CAP/OData MCP server to wire up — just UI5.

## Wire it up

The starter already ships a `.mcp.json` at its root:

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

**Claude Code:** open the project directory; it auto-detects `.mcp.json`. Confirm the server
appears in `/mcp`.

**Cursor:** put the same `mcpServers` block in `~/.cursor/mcp.json` and restart.

**VS Code + Copilot:** add it under `"github.copilot.mcp.servers"` in settings JSON and
reload. If your Copilot version doesn't support MCP, use Claude Code or Cursor.

## Prove it's wired (assistants lie)

Ask, verbatim:

> Using UI5 MCP, what UI5 version is this project on and what's the current API for `sap.m.Table`?

A **working** setup names your framework version (SAPUI5 1.140.0) and describes the real
API. A **broken** setup waffles ("I don't have access to your files") or invents a version.

---

## Verify

- [ ] The `ui5` server shows as connected in your assistant
- [ ] The test prompt returned a real version number and API summary

*(Skipping MCP? Just tick these mentally and move on.)*

---

Ready? → [Setup: Clone the starter + run the base app](02-bootstrap.md)
