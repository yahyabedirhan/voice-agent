# Deployment Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align Worker configuration with the deployed `app` and `api` services and move production deployment guidance from the README into `docs/deployment.md`.

**Architecture:** The README retains project context and local development. A single flat deployment guide records the Git-connected Cloudflare Workers Builds configuration and Supabase migration automation; direct CLI deployment is secondary.

**Tech Stack:** Cloudflare Workers Builds, Wrangler, pywrangler, pnpm, uv, GitHub, Supabase CLI.

## Global Constraints

- Account Workers subdomain: `voice-agent-demo`.
- Client-side Worker name: `app`.
- Backend Worker name: `api`.
- Client-side URL: `https://app.voice-agent-demo.workers.dev`.
- Backend URL: `https://api.voice-agent-demo.workers.dev`.
- Keep local development instructions in `README.md`.
- Put production deployment guidance in `docs/deployment.md`.
- Present Git-connected Workers Builds as the normal deployment workflow.
- Do not include dependency installation in the configured build commands because Workers Builds installs dependencies automatically.

---

### Task 1: Align configuration and deployment documentation

**Files:**
- Modify: `apps/client/wrangler.jsonc`
- Modify: `apps/backend/wrangler.jsonc`
- Create: `docs/deployment.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the two existing Cloudflare Git connections and the production Supabase migration workflow.
- Produces: Worker names matching the connected Cloudflare projects and one authoritative deployment guide.

- [ ] **Step 1: Change Worker names**

Set Client-side `name` to `app` and Backend `name` to `api` in their respective Wrangler configurations.

- [ ] **Step 2: Create the deployment guide**

Document these Workers Builds settings:

| Setting | Client-side | Backend |
| --- | --- | --- |
| Worker name | `app` | `api` |
| Root directory | `/apps/client` | `/apps/backend` |
| Build command | `pnpm run build` | `uv sync --locked` |
| Deploy command | `npx wrangler deploy` | `uv run pywrangler deploy` |

Record `VITE_API_BASE_URL=https://api.voice-agent-demo.workers.dev` without a trailing slash, independent build watch paths, optional CLI commands, and the three Supabase GitHub Actions secrets.

- [ ] **Step 3: Slim the README**

Remove Cloudflare and production Database deployment sections. Add `docs/deployment.md` to the documentation index while retaining repository layout and local development.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --dir apps/client build
pnpm --dir apps/client exec wrangler deploy --dry-run
git diff --check
```

Check that detailed production deployment commands appear only in `docs/deployment.md`, both Wrangler names match the deployed projects, and all relative links resolve.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/deployment.md apps/client/wrangler.jsonc apps/backend/wrangler.jsonc
git commit -m "docs: centralize production deployment guidance"
```
