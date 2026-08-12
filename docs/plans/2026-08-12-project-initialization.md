# Project Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a locally runnable monorepo with placeholder Client-side and Backend applications, local Database scaffolding, and deployment configuration ready to connect to production accounts.

**Architecture:** Client-side and Backend live under `apps/` and remain independently deployable. Client-side calls a public Backend health endpoint only to prove end-to-end connectivity. The Database has local Supabase configuration and a deployment-only migration workflow, but no application schema.

**Tech Stack:** React, Vite, TypeScript, shadcn/ui, Tailwind CSS, TanStack Query, Redux Toolkit, pnpm, Python 3.12, FastAPI, Pydantic, uv, Cloudflare Python Workers, pywrangler, Supabase CLI, GitHub Actions.

## Global constraints

- Use `apps/client`, `apps/backend`, and `supabase`.
- Do not implement agents, sessions, ElevenLabs, tools, authentication, transcripts, or domain behavior.
- Do not add tests for placeholder logic. Business behavior introduced later will use TDD.
- Do not run tests in deployment automation.
- Apply the supplied shadcn preset with `pnpm dlx shadcn@latest apply --preset b7C9wSzj6`.
- Do not create a custom global stylesheet; keep the stylesheet produced and managed by the Tailwind/shadcn setup.
- Deploy Client-side and Backend independently to Cloudflare Workers.
- Use only local development and production.
- The user creates the GitHub repository and Supabase project.
- External production resources are not created until the user supplies the account connection.

---

## Target file structure

```text
.
├── .github/workflows/deploy-database.yml
├── .gitignore
├── .node-version
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── apps/
│   ├── client/
│   │   ├── .env.example
│   │   ├── components.json
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── wrangler.jsonc
│   │   └── src/
│   │       ├── app/App.tsx
│   │       ├── app/providers.tsx
│   │       ├── lib/backend.ts
│   │       ├── store/index.ts
│   │       ├── main.tsx
│   │       └── index.css
│   └── backend/
│       ├── .python-version
│       ├── package.json
│       ├── pyproject.toml
│       ├── uv.lock
│       ├── wrangler.jsonc
│       └── src/
│           ├── __init__.py
│           ├── app.py
│           └── worker.py
├── supabase/
│   ├── config.toml
│   ├── migrations/README.md
│   └── seed.sql
└── README.md
```

### Task 1: Initialize the monorepo toolchains

**Files:** root workspace files, generated Vite application, Backend package manifests.

**Produces:** root commands for local development and independently installable application packages.

- [ ] **Step 1: Verify the starting state**

```bash
git status --short
node --version
pnpm --version
uv --version
```

Expected versions currently available: Node 26.1.0, pnpm 11.8.0, and uv 0.11.14.

- [ ] **Step 2: Generate the Client-side application**

```bash
pnpm create vite apps/client --template react-ts
```

- [ ] **Step 3: Create the root workspace**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/client
  - apps/backend
```

Create root `package.json` with these scripts:

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
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:status": "supabase status"
  },
  "devDependencies": {
    "concurrently": "latest",
    "supabase": "latest",
    "wrangler": "latest"
  }
}
```

Create `.node-version` containing `26.1.0`.

- [ ] **Step 4: Create Backend package manifests**

Create `apps/backend/.python-version` containing `3.12`.

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
  "workers-py",
  "workers-runtime-sdk",
]
```

- [ ] **Step 5: Add ignore rules and install dependencies**

Ignore Node, Vite, Wrangler, uv, Python cache, local environment, and Supabase temporary files. Preserve `.env.example` files.

```bash
pnpm add -Dw concurrently supabase wrangler
pnpm --dir apps/backend add -D wrangler
pnpm install
uv lock --directory apps/backend
uv sync --directory apps/backend
```

- [ ] **Step 6: Commit the toolchain foundation**

```bash
git add .gitignore .node-version package.json pnpm-workspace.yaml pnpm-lock.yaml apps/client apps/backend
git commit -m "chore: initialize monorepo toolchains"
```

### Task 2: Add the placeholder Backend

**Files:** `apps/backend/src/*`, `apps/backend/wrangler.jsonc`.

**Produces:** `GET /health -> 200 {"status":"ok","service":"backend"}` and a Cloudflare Python Worker entrypoint.

- [ ] **Step 1: Create the FastAPI application**

Create an empty `apps/backend/src/__init__.py` and `apps/backend/src/app.py`:

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

The wildcard CORS policy is limited to this public placeholder. Revisit it before credential-bearing endpoints are introduced.

- [ ] **Step 2: Create the Cloudflare ASGI adapter**

Create `apps/backend/src/worker.py`:

```python
from workers import WorkerEntrypoint

from src.app import app


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        import asgi

        return await asgi.fetch(app, request.js_object, self.env)
```

- [ ] **Step 3: Configure the Python Worker**

Create `apps/backend/wrangler.jsonc`:

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "voice-agent-backend",
  "main": "src/worker.py",
  "compatibility_date": "2026-08-12",
  "compatibility_flags": ["python_workers", "python_dedicated_snapshot"],
  "observability": { "enabled": true }
}
```

- [ ] **Step 4: Verify the Backend over HTTP**

Start `pnpm dev:backend`, then run:

```bash
curl --fail --silent http://localhost:8787/health
```

Expected:

```json
{"status":"ok","service":"backend"}
```

- [ ] **Step 5: Commit the Backend**

```bash
git add apps/backend
git commit -m "feat: add placeholder backend worker"
```

### Task 3: Configure shadcn and add the placeholder Client-side

**Files:** generated shadcn/Tailwind files, Client-side providers, Backend health client, placeholder application, Static Assets configuration.

**Consumes:** `GET /health` and `VITE_API_BASE_URL`.

- [ ] **Step 1: Apply the supplied shadcn preset**

Run from `apps/client`:

```bash
pnpm dlx shadcn@latest apply --preset b7C9wSzj6
```

Keep the Tailwind and global stylesheet output generated by this command. Do not replace it with a custom `styles.css`.

- [ ] **Step 2: Install the remaining application dependencies**

```bash
pnpm --dir apps/client add @reduxjs/toolkit @tanstack/react-query react-redux
```

Add `"deploy": "wrangler deploy"` to the existing Client-side scripts.

- [ ] **Step 3: Add typed Backend connectivity**

Create `apps/client/src/lib/backend.ts`:

```typescript
export type BackendHealth = {
  status: "ok";
  service: "backend";
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${apiBaseUrl}/health`);
  if (!response.ok) throw new Error(`Backend health request failed with ${response.status}`);
  return response.json() as Promise<BackendHealth>;
}
```

Create `apps/client/.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:8787
```

- [ ] **Step 4: Add Query and Redux providers**

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

Do not create placeholder slices or fetched-data state in Redux.

- [ ] **Step 5: Replace the Vite demo with one status screen**

Create `apps/client/src/app/App.tsx`:

```tsx
import { useQuery } from "@tanstack/react-query";

import { getBackendHealth } from "../lib/backend";

export function App() {
  const health = useQuery({ queryKey: ["backend-health"], queryFn: getBackendHealth });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Voice Agent Platform</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Platform foundation</h1>
        <p className="mt-3 text-muted-foreground">
          Client-side and Backend are running. Agent experiences will be added separately.
        </p>
        <p className="mt-6 text-sm" role="status">
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
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
```

Delete unused Vite demo assets only.

- [ ] **Step 6: Configure Static Assets deployment**

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

- [ ] **Step 7: Verify Client-side and end-to-end local operation**

```bash
pnpm --dir apps/client build
pnpm dev
```

Verify `http://localhost:5173`, `http://localhost:8787/health`, and that the page reaches `Backend connected`.

- [ ] **Step 8: Commit Client-side**

```bash
git add apps/client package.json pnpm-lock.yaml
git commit -m "feat: add placeholder client application"
```

### Task 4: Add local Database scaffolding and migration automation

**Files:** `supabase/*`, `.github/workflows/deploy-database.yml`, root package scripts.

- [ ] **Step 1: Initialize local Supabase without linking production**

```bash
pnpm exec supabase init
```

Keep the generated `supabase/config.toml` and `supabase/seed.sql`. Add `supabase/migrations/README.md` explaining migration ownership; do not add an application schema.

- [ ] **Step 2: Add serialized production migration automation**

Create `.github/workflows/deploy-database.yml` triggered on `main` changes under `supabase/migrations/**` or to the workflow itself. It must:

1. use `actions/checkout@v4`;
2. use `supabase/setup-cli@v1`;
3. run `supabase link --project-ref "$SUPABASE_PROJECT_ID"`;
4. run `supabase db push --linked`;
5. read `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_PROJECT_ID` from GitHub Actions secrets;
6. use concurrency group `production-database-migrations` with cancellation disabled.

Use this workflow:

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

- [ ] **Step 3: Verify only the local Database**

```bash
pnpm exec supabase --version
pnpm db:start
pnpm db:status
pnpm db:stop
```

If Docker is unavailable, report it as a local prerequisite. Do not connect local CLI commands to production.

- [ ] **Step 4: Commit Database scaffolding**

```bash
git add package.json pnpm-lock.yaml supabase .github/workflows/deploy-database.yml
git commit -m "chore: add database migration foundation"
```

### Task 5: Document deployment and perform final local verification

**Files:** `README.md`; architecture documentation only if implementation discovery changes an approved detail.

- [ ] **Step 1: Document local setup**

Document:

```bash
pnpm install
uv sync --directory apps/backend
cp apps/client/.env.example apps/client/.env.local
pnpm dev
```

- [ ] **Step 2: Document direct Wrangler deployment**

After the user authenticates:

```bash
npx wrangler login
npx wrangler whoami
pnpm --dir apps/client build
pnpm --dir apps/client exec wrangler deploy
uv run --directory apps/backend pywrangler deploy
```

The first deploy creates `voice-agent-client` and `voice-agent-backend` and returns their generated `workers.dev` URLs. Set Client-side production build variable `VITE_API_BASE_URL` to the Backend URL, then redeploy Client-side.

- [ ] **Step 3: Document automatic Cloudflare deployment**

After the user creates and pushes the GitHub repository, connect it to each Worker in Cloudflare Workers Builds:

| Setting | Client-side | Backend |
| --- | --- | --- |
| Production branch | `main` | `main` |
| Root directory | `apps/client` | `apps/backend` |
| Build command | `pnpm install --frozen-lockfile && pnpm build` | `pnpm install --frozen-lockfile && uv sync --locked` |
| Deploy command | `pnpm exec wrangler deploy` | `uv run pywrangler deploy` |
| Watch paths | `apps/client/**`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `apps/backend/**` |

- [ ] **Step 4: Document production Supabase activation**

After the user creates the Supabase project, add these GitHub Actions secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

- [ ] **Step 5: Run final local verification**

```bash
pnpm build
pnpm --dir apps/client exec wrangler deploy --dry-run
git diff --check
```

Start `pnpm dev`, then verify both HTTP endpoints with `curl` and inspect the Client-side page in a browser. No automated tests are required for this placeholder foundation.

- [ ] **Step 6: Commit the setup documentation**

```bash
git add README.md docs/architecture/deployment-and-operations.md
git commit -m "docs: add project setup and deployment handoff"
```

## External completion boundary

Codex can complete and verify the local scaffold without external accounts. Production deployment requires the user to:

1. create the GitHub repository, add it as the Git remote, and push `main`;
2. create the Supabase project and add its three GitHub Actions secrets;
3. run `npx wrangler login` and authorize the intended Cloudflare account;
4. either allow Codex to run the direct deploy commands or run them manually;
5. connect both Workers to the GitHub repository in Cloudflare Workers Builds;
6. provide the generated Backend URL for `VITE_API_BASE_URL` and verify the automatic deployments.

ElevenLabs setup remains deferred until session admission work begins.
