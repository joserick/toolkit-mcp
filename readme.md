# toolkit-mcp

> MCP (Model Context Protocol) server for the [Packages Toolkit for Laravel](https://github.com/orchestral/toolkit-docs) — documentation of **Canvas**, **Testbench**, and **Workbench** by [Orchestral](https://github.com/orchestral).

Exposes the full toolkit documentation as an MCP-compatible endpoint so AI assistants can query and navigate it at runtime.

### Packages covered

| Package | Description |
| --- | --- |
| **Canvas** | Replicates all of the `make` artisan commands available in a standard Laravel app to speed up Laravel package development. |
| **Testbench** | Simplifies creating feature and integration tests for Laravel packages without massive configuration and build steps. |
| **Testbench Dusk** | Built on top of Testbench to provide browser-based testing for Laravel packages using Laravel Dusk. |
| **Workbench** | Provides configurable actions and commands to preview, interact with, and serve your Laravel packages during development. |

> Created by [Mior Muhammad Zaki (crynobone)](https://github.com/crynobone).

---

## How it works

```
Browser / AI Client
        │
        ▼
┌────────────────────────────────────────┐
│  VitePress (PORT)                      │
│                                        │
│  GET  /         → 302 → packages.tools │
│  POST /mcp      ──┐                    │
│  GET  /mcp/__sse  ─┤ proxy             │
│  POST /messages   ─┘                   │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  MCP Plugin Express (PORT + 1)      │
│  • SSE transport                    │
│  • Tool listing                     │
│  • Resource / prompt handlers       │
└─────────────────────────────────────┘
```

- **VitePress** serves the documentation UI (`toolkit-docs`).
- **vitepress-plugin-mcp** adds an Express server with MCP endpoints.
- A **custom Vite plugin** proxies MCP routes from the VitePress port to the internal MCP server so both share the same origin.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Installation

```bash
git clone <repo-url> toolkit-mcp
cd toolkit-mcp
npm install
```

The `toolkit-docs` package is pulled directly from GitHub:

```json
"toolkit-docs": "https://github.com/orchestral/toolkit-docs"
```

---

## Usage

### Development

```bash
npm run docs:dev
```

Starts VitePress with hot-reload on `http://localhost:5173`.  
The MCP plugin runs alongside it — check the terminal output for the exact MCP port.

### Production

```bash
npm start
# or
PORT=8080 npm start
```

Starts the server on the configured port (default **4000**). The MCP endpoint becomes available at:

| What                 | URL                               |
| -------------------- | --------------------------------- |
| Docs UI (redirect)   | `http://localhost:4000`           |
| MCP endpoint         | `http://localhost:4000/mcp`       |
| MCP SSE              | `http://localhost:4000/mcp/__sse` |
| MCP messages         | `http://localhost:4000/messages`  |
| MCP internal (direct)| `http://localhost:4001/mcp`       |

---

## Keeping docs up to date

`toolkit-docs` is pulled from GitHub as a tarball. Once in `node_modules`, npm won't update it unless explicitly told to.

### Update manually

```bash
npm run update-docs
```

This forces npm to re-download the latest tarball from `orchestral/toolkit-docs`, replacing the cached version.

### Update + start

```bash
npm run update-docs && npm start
```

### On deploy (Docker / hosting)

Run `update-docs` during the **build step**, not at runtime:

```dockerfile
RUN npm run update-docs
CMD ["npm", "start"]
```

This keeps startup fast and reliable — no network calls when the server boots.

---

## Configuration

All configuration lives in `.vitepress/config.mjs`:

| Setting           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `srcDir`          | Documentation source → `node_modules/toolkit-docs` |
| `PORT` env var    | Server port (default `4000`; MCP uses `PORT + 1`)  |
| `search.options`  | **Required** by `vitepress-plugin-mcp`             |

---

## Project structure

```
toolkit-mcp/
├── .vitepress/
│   └── config.mjs        # VitePress + MCP plugin config
├── node_modules/
│   └── toolkit-docs/     # Documentation content (external)
├── server.mjs            # Production entry point
├── package.json
└── readme.md
```

---

## License

MIT — Jose Erick Carreon Gomez <support@joserick.com>
