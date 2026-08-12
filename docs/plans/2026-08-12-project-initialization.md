# Project Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a locally runnable monorepo with a placeholder Client-side, a placeholder Backend, local Database scaffolding, and production deployment configuration that becomes automatic after the required external accounts are connected.

**Architecture:** Client-side and Backend remain independently buildable and deployable under `apps/`. Client-side calls one public Backend health endpoint so local and deployed connectivity can be verified without implementing agent or session behavior. The root `supabase/` directory contains local Database configuration, while a deployment-only GitHub Actions workflow applies production migrations after relevant changes merge to `main`.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, TanStack Query, Redux Toolkit, pnpm, Python 3.12, FastAPI, Pydantic, uv, Cloudflare Python Workers, pywrangler, Supabase CLI, GitHub Actions.

## Global Constraints

- Use the monorepo layout `apps/client`, `apps/backend`, and `supabase`.
- Deploy Client-side with Cloudflare Workers Static Assets.
- Deploy Backend with Cloudflare Python Workers and FastAPI through the ASGI adapter.
- Keep Client-side and Backend deployment triggers independent and path-aware.
- Use only local development and production; do not add staging or custom domains.
- Do not add agent catalog, session admission, ElevenLabs, tools, transcripts, authentication, or business-domain behavior.
- Do not add automated tests to deployment automation; local tests and build verification remain required.
- Do not initialize shadcn/ui until the user supplies the preset.
- Do not create or connect external Cloudflare, Supabase, GitHub, or ElevenLabs resources without the user's account choices and authorization.
- Use `docs/plans`, not the Superpowers default `docs/superpowers/plans`.

---

## File map

```text
.
├── .github/workflows/deploy-database.yml  # Production migration automation only
├── .gitignore                             # Generated files, local secrets, tool state
├── .node-version                          # Client-side Node runtime
├── package.json                           # Root development commands and CLI dependencies
├── pnpm-lock.yaml                         # Reproducible JavaScript dependency graph
├── pnpm-workspace.yaml                    # Monorepo package boundaries
├── README.md                              # Local setup and external deployment checklist
├── apps/
│   ├── client/
│   │   ├── .env.example                   # Local Backend URL contract
│   │   ├── package.json                   # Client commands and dependencies
│   │   ├── vite.config.ts                 # React, Tailwind, test environment
│   │   ├── wrangler.jsonc                 # Static Assets deployment
│   │   └── src/
│   │       ├── app/App.tsx                # Placeholder system-status screen
│   │       ├── app/App.test.tsx           # Observable Client-side behavior
│   │       ├── app/providers.tsx           # Query and Redux providers
│   │       ├── lib/backend.ts             # Typed Backend health request
│   │       ├── store/index.ts              # Empty Redux store foundation
│   │       ├── main.tsx                    # Browser entrypoint
│   │       └── styles.css                  # Tailwind import and placeholder theme
│   └── backend/
│       ├── .python-version                # Python 3.12 runtime
│       ├── package.json                   # Wrangler CLI for Worker tooling
│       ├── pyproject.toml                  # Runtime and local verification dependencies
│       ├── uv.lock                         # Reproducible Python dependency graph
│       ├── wrangler.jsonc                 # Python Worker deployment
│       ├── src/app.py                      # FastAPI application and health contract
│       ├── src/worker.py                   # Cloudflare ASGI adapter only
│       └── tests/test_health.py            # Backend health behavior
└── supabase/
    ├── config.toml                         # Local Supabase services
    ├── migrations/README.md                # Migration ownership, no schema yet
    └── seed.sql                            # Empty local seed entrypoint
```

### Task 1: Establish the monorepo toolchain

**Files:**
- Create: `.gitignore`
- Create: `.node-version`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Generate: `pnpm-lock.yaml`
- Generate: `apps/client/package.json` and the standard Vite TypeScript scaffold
- Create: `apps/backend/.python-version`
- Create: `apps/backend/package.json`
- Create: `apps/backend/pyproject.toml`
- Generate: `apps/backend/uv.lock`

**Interfaces:**
- Consumes: the repository layout approved in the platform design.
- Produces: root commands `pnpm dev`, `pnpm dev:client`, `pnpm dev:backend`, `pnpm build`, and `pnpm test`; independently installable Client-side and Backend packages.

- [ ] **Step 1: Confirm the workspace is clean and record tool versions**

Run:

```bash
git status --short
node --version
pnpm --version
uv --version
```

Expected: clean status; Node 26.x, pnpm 11.x, and uv 0.11.x are available.

- [ ] **Step 2: Generate the React TypeScript scaffold**

Run:

```bash
pnpm create vite apps/client --template react-ts
```

Expected: Vite creates only `apps/client`; remove its generated demo assets when Task 3 replaces the page.

- [ ] **Step 3: Add root workspace configuration**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/client
  - apps/backend
```

Create root `package.json`:

```json
{
  "name": "voice-agent-platform",
  "private": true,
  "packageManager": "pnpm@11.8.0",
  "scripts": {
    "dev": "concurrently -n client,backend -c cyan,magenta \"pnpm dev:client\" \"pnpm dev:backend\"",
    "dev:client": "pnpm --dir apps/client dev",
    "dev:backend": "uv run --directory apps/backend pywrangler dev",
    "build": "pnpm --dir apps/client build",
    "test": "pnpm --dir apps/client test && uv run --directory apps/backend pytest"
  },
  "devDependencies": {
    "concurrently": "latest",
    "supabase": "latest",
    "wrangler": "latest"
  }
}
```

Create `.node-version` containing `26.1.0` and `apps/backend/.python-version` containing `3.12`.

Create `apps/backend/package.json`:

```json
{
  "name": "@voice-agent/backend-worker",
  "private": true,
  "scripts": {
    "dev": "uv run pywrangler dev",
    "deploy": "uv run pywrangler deploy"
  },
  "devDependencies": {
    "wrangler": "latest"
  }
}
```

- [ ] **Step 4: Add repository ignore rules**

Create `.gitignore` covering:

```gitignore
node_modules/
dist/
.vite/
coverage/
.env
.env.*
!.env.example
.wrangler/
.dev.vars
.venv/
__pycache__/
.pytest_cache/
.ruff_cache/
*.pyc
supabase/.branches/
supabase/.temp/
```

- [ ] **Step 5: Declare Backend dependencies**

Create `apps/backend/pyproject.toml`:

```toml
[project]
name = "voice-agent-backend"
version = "0.1.0"
description = "Backend foundation for the voice agent platform"
requires-python = ">=3.12"
dependencies = [
  "fastapi",
  "pydantic",
]

[dependency-groups]
dev = [
  "httpx",
  "pytest",
  "workers-py",
  "workers-runtime-sdk",
]

[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
```

- [ ] **Step 6: Install and lock dependencies**

Run:

```bash
pnpm add -Dw concurrently supabase wrangler
pnpm --dir apps/backend add -D wrangler
pnpm install
uv lock --directory apps/backend
uv sync --directory apps/backend
```

Expected: `pnpm-lock.yaml`, `apps/backend/uv.lock`, and a local Backend environment are created without dependency resolution errors.

- [ ] **Step 7: Commit the toolchain foundation**

```bash
git add .gitignore .node-version package.json pnpm-workspace.yaml pnpm-lock.yaml apps/client apps/backend/.python-version apps/backend/package.json apps/backend/pyproject.toml apps/backend/uv.lock
git commit -m "chore: initialize monorepo toolchains"
```

### Task 2: Add the placeholder Backend with TDD

**Files:**
- Create: `apps/backend/tests/test_health.py`
- Create: `apps/backend/src/__init__.py`
- Create: `apps/backend/src/app.py`
- Create: `apps/backend/src/worker.py`
- Create: `apps/backend/wrangler.jsonc`

**Interfaces:**
- Consumes: FastAPI and Pydantic from Task 1.
- Produces: `GET /health -> 200 {"status":"ok","service":"backend"}` and Cloudflare's `Default.fetch(request)` entrypoint.

- [ ] **Step 1: Write the failing health contract test**

Create `apps/backend/tests/test_health.py`:

```python
from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_health_reports_backend_is_ready() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend"}
```

This test catches a missing route, wrong status code, or broken response contract.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
uv run --directory apps/backend pytest tests/test_health.py -v
```

Expected: collection fails because `src.app` does not exist.

- [ ] **Step 3: Implement the minimal FastAPI application**

Create `apps/backend/src/__init__.py` as an empty package marker.

Create `apps/backend/src/app.py`:

```python
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: Literal["backend"]


app = FastAPI(title="Voice Agent Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="backend")
```

The wildcard origin is acceptable only for this public placeholder endpoint. Replace it before adding credential-bearing session endpoints.

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
uv run --directory apps/backend pytest tests/test_health.py -v
```

Expected: one test passes.

- [ ] **Step 5: Add the Cloudflare ASGI adapter and deployment config**

Create `apps/backend/src/worker.py`:

```python
from workers import WorkerEntrypoint

from src.app import app


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        import asgi

        return await asgi.fetch(app, request.js_object, self.env)
```

Create `apps/backend/wrangler.jsonc`:

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "voice-agent-backend",
  "main": "src/worker.py",
  "compatibility_date": "2026-08-12",
  "compatibility_flags": [
    "python_workers",
    "python_dedicated_snapshot"
  ],
  "observability": {
    "enabled": true
  }
}
```

- [ ] **Step 6: Start Backend and check the real HTTP boundary**

Run `pnpm dev:backend`, then from another shell run:

```bash
curl --fail --silent http://localhost:8787/health
```

Expected:

```json
{"status":"ok","service":"backend"}
```

- [ ] **Step 7: Commit Backend foundation**

```bash
git add apps/backend
git commit -m "feat: add placeholder backend worker"
```

### Task 3: Add the placeholder Client-side with TDD

**Files:**
- Modify: `apps/client/package.json`
- Modify: `apps/client/vite.config.ts`
- Create: `apps/client/.env.example`
- Create: `apps/client/src/app/App.test.tsx`
- Create: `apps/client/src/app/App.tsx`
- Create: `apps/client/src/app/providers.tsx`
- Create: `apps/client/src/lib/backend.ts`
- Create: `apps/client/src/store/index.ts`
- Modify: `apps/client/src/main.tsx`
- Replace: `apps/client/src/index.css` with `apps/client/src/styles.css`
- Create: `apps/client/src/test/setup.ts`
- Create: `apps/client/wrangler.jsonc`
- Delete: generated Vite demo assets and styles that are no longer imported

**Interfaces:**
- Consumes: `GET /health` from Task 2 and `VITE_API_BASE_URL`.
- Produces: an accessible placeholder status screen that reports Backend connectivity; a static-assets deployment artifact in `apps/client/dist`.

- [ ] **Step 1: Install Client-side runtime and local test dependencies**

Run:

```bash
pnpm --dir apps/client add @reduxjs/toolkit @tanstack/react-query react-redux
pnpm --dir apps/client add -D @tailwindcss/vite tailwindcss vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add scripts to `apps/client/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "deploy": "wrangler deploy"
  }
}
```

- [ ] **Step 2: Write the failing connectivity behavior test**

Create `apps/client/src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Create `apps/client/src/app/App.test.tsx` using the real providers and a boundary-level `fetch` stub:

```tsx
import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { AppProviders } from "./providers";
import { App } from "./App";

afterEach(() => vi.unstubAllGlobals());

test("reports when Backend is connected", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", service: "backend" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  );

  expect(await screen.findByRole("status")).toHaveTextContent("Backend connected");
});
```

This catches a missing health request, a broken provider tree, or failure to expose the successful connection state.

- [ ] **Step 3: Run the Client-side test and verify RED**

Run:

```bash
pnpm --dir apps/client test
```

Expected: the test fails because `App` and `AppProviders` do not yet implement the contract.

- [ ] **Step 4: Implement typed Backend access and providers**

Create `apps/client/src/lib/backend.ts`:

```typescript
export type BackendHealth = {
  status: "ok";
  service: "backend";
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${apiBaseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Backend health request failed with ${response.status}`);
  }
  return response.json() as Promise<BackendHealth>;
}
```

Create `apps/client/src/store/index.ts`:

```typescript
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = (state: Record<string, never> = {}) => state;

export const store = configureStore({ reducer: rootReducer });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Create `apps/client/src/app/providers.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { Provider } from "react-redux";

import { store } from "../store";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
```

- [ ] **Step 5: Implement the placeholder status screen**

Create `apps/client/src/app/App.tsx`:

```tsx
import { useQuery } from "@tanstack/react-query";

import { getBackendHealth } from "../lib/backend";

export function App() {
  const health = useQuery({ queryKey: ["backend-health"], queryFn: getBackendHealth });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Voice Agent Platform</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Platform foundation</h1>
        <p className="mt-4 max-w-xl text-slate-300">
          The Client-side and Backend are running. Agent experiences will be added in focused implementation phases.
        </p>
        <p className="mt-8 text-sm text-slate-200" role="status">
          {health.isPending && "Checking Backend…"}
          {health.isSuccess && "Backend connected"}
          {health.isError && "Backend unavailable"}
        </p>
      </section>
    </main>
  );
}
```

Update `apps/client/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { AppProviders } from "./app/providers";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
```

- [ ] **Step 6: Configure Tailwind, Vitest, and browser styles**

Update `apps/client/vite.config.ts`:

```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `apps/client/src/styles.css`:

```css
@import "tailwindcss";

:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #e2e8f0;
  background: #020617;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

Create `apps/client/.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:8787
```

- [ ] **Step 7: Configure Static Assets deployment**

Create `apps/client/wrangler.jsonc`:

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "voice-agent-client",
  "compatibility_date": "2026-08-12",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

- [ ] **Step 8: Verify GREEN and build output**

Run:

```bash
pnpm --dir apps/client test
pnpm --dir apps/client build
```

Expected: the connectivity test passes and Vite creates `apps/client/dist` without TypeScript errors.

- [ ] **Step 9: Run Client-side and Backend together**

Run `pnpm dev`, open `http://localhost:5173`, and verify that the page reaches the `Backend connected` state.

- [ ] **Step 10: Commit Client-side foundation**

```bash
git add apps/client package.json pnpm-lock.yaml
git commit -m "feat: add placeholder client application"
```

### Task 4: Add local Database scaffolding and production migration automation

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/seed.sql`
- Create: `supabase/migrations/README.md`
- Create: `.github/workflows/deploy-database.yml`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Supabase CLI through the root pnpm dependency.
- Produces: root commands `db:start`, `db:stop`, `db:status`, and a serialized production migration job triggered only by migration or workflow changes on `main`.

- [ ] **Step 1: Initialize local Supabase configuration**

Run:

```bash
pnpm exec supabase init
```

Expected: `supabase/config.toml` is created without starting or linking a production project.

- [ ] **Step 2: Add local Database scripts**

Add to the root `package.json` scripts:

```json
{
  "db:start": "supabase start",
  "db:stop": "supabase stop",
  "db:status": "supabase status"
}
```

Create an empty `supabase/seed.sql` with a comment explaining that domain seed data is added with the agent designs. Create `supabase/migrations/README.md` explaining that timestamped SQL migrations live in this directory and are applied automatically after merge.

- [ ] **Step 3: Add the deployment-only production migration workflow**

Create `.github/workflows/deploy-database.yml`:

```yaml
name: Deploy database

on:
  push:
    branches: [main]
    paths:
      - "supabase/migrations/**"
      - ".github/workflows/deploy-database.yml"

concurrency:
  group: production-database-migrations
  cancel-in-progress: false

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - name: Link production project
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: supabase link --project-ref "$SUPABASE_PROJECT_ID"
      - name: Apply migrations
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: supabase db push --linked
```

- [ ] **Step 4: Validate configuration without touching production**

Run:

```bash
pnpm exec supabase --version
pnpm exec supabase start
pnpm exec supabase status
pnpm exec supabase stop
```

Expected: the local stack starts and stops if Docker is available. If Docker is absent or stopped, report that prerequisite; do not substitute a production project.

- [ ] **Step 5: Commit Database foundation**

```bash
git add package.json pnpm-lock.yaml supabase .github/workflows/deploy-database.yml
git commit -m "chore: add database migration foundation"
```

### Task 5: Document and configure external deployment handoff

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture/deployment-and-operations.md` only if an initialization discovery changes an approved operational detail.

**Interfaces:**
- Consumes: the runnable applications and deployment files from Tasks 1–4.
- Produces: exact manual account and dashboard steps required to activate automatic production deployment.

- [ ] **Step 1: Document local startup**

Add commands and prerequisites to README:

```bash
pnpm install
uv sync --directory apps/backend
cp apps/client/.env.example apps/client/.env.local
pnpm dev
```

Document Client-side at `http://localhost:5173`, Backend at `http://localhost:8787`, and Backend health at `http://localhost:8787/health`.

- [ ] **Step 2: Document the GitHub prerequisite**

Record that the user must choose a repository owner/name and visibility, create or authorize the remote repository, and push `main`. The current local repository has no Git remote, although GitHub CLI is authenticated.

- [ ] **Step 3: Document the two Cloudflare Workers Builds connections**

After the user runs `npx wrangler login` and authorizes the account, connect the same GitHub repository to two Workers Builds projects:

| Setting | Client-side | Backend |
| --- | --- | --- |
| Worker name | `voice-agent-client` | `voice-agent-backend` |
| Production branch | `main` | `main` |
| Root directory | `apps/client` | `apps/backend` |
| Build command | `pnpm install --frozen-lockfile && pnpm build` | `pnpm install --frozen-lockfile && uv sync --locked` |
| Deploy command | `pnpm exec wrangler deploy` | `uv run pywrangler deploy` |
| Watch paths | `apps/client/**`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `apps/backend/**` |

Configure Client-side build variable `VITE_API_BASE_URL` to the generated Backend Worker URL. The two watch-path sets enforce independent deployment.

- [ ] **Step 4: Document Supabase production activation**

The user creates a Supabase project and adds these GitHub Actions secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

The local CLI remains unlinked to production. Migrations run only in GitHub Actions after relevant files merge to `main`.

- [ ] **Step 5: Document deferred inputs**

Record that shadcn/ui initialization waits for the user's preset. ElevenLabs account configuration and secrets wait for the session-admission implementation phase; neither is needed for the placeholder deployment.

- [ ] **Step 6: Run the full local verification suite**

Run:

```bash
pnpm test
pnpm build
pnpm --dir apps/client exec wrangler deploy --dry-run
uv run --directory apps/backend pytest
```

Start `pnpm dev`, then verify:

```bash
curl --fail --silent http://localhost:8787/health
curl --fail --silent http://localhost:5173
```

Expected: tests pass, the production Client-side bundle builds, Wrangler accepts the Static Assets project, both local HTTP endpoints respond, and the browser status reaches `Backend connected`.

- [ ] **Step 7: Verify repository scope and commit documentation**

Run:

```bash
git status --short
git diff --check
rg -n "TODO|TBD" apps supabase .github README.md
```

Expected: only intended initialization files are changed, patch formatting is clean, and no hidden implementation placeholders remain.

Commit:

```bash
git add README.md docs/architecture/deployment-and-operations.md
git commit -m "docs: add project setup and deployment handoff"
```

## External completion boundary

Local initialization is complete when Client-side and Backend run together, local tests pass, Client-side builds, the local Database configuration exists, and deployment configuration validates without production credentials.

Production deployment is complete only after the user provides or performs these external actions:

1. Provide the shadcn preset, or explicitly defer shadcn initialization beyond this foundation.
2. Choose the GitHub repository owner/name and public/private visibility, then authorize creation or add a remote.
3. Run `npx wrangler login` and select the intended Cloudflare account.
4. Connect both Workers Builds projects to the GitHub repository with the documented roots, commands, branches, and watch paths.
5. Create the Supabase production project and add the three GitHub Actions secrets.
6. Push or merge the initialized repository to `main` and verify both Cloudflare deployments and the Database workflow.

No ElevenLabs account action is required until agent and session work begins.
