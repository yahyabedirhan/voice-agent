# Voice Agent Platform

A demo platform for browser-based, task-oriented voice agents. Users choose an
agent from a small catalog and have an anonymous, voice-first conversation.

The project is inspired by the operating model of vertical AI-agent companies.
Its initial scope is intentionally narrow: learn how managed voice agents fit
into a product architecture and validate the platform with two substantially
different agents.

Unless a document says otherwise, the requirements and architecture in this
repository describe Version 1.

## Initial agents

- Drive-through ordering agent
- House-painting service agent

These are independent agents. The platform does not introduce shared agent
types, inheritance, or a generic agent builder.

## Product boundary

- Users do not sign in.
- Client-side retrieves enabled agent metadata from Backend.
- A session starts after the user selects an agent and grants microphone access.
- Users and agents can both end a conversation.
- The post-call screen only reports that the session ended.
- ElevenLabs owns realtime voice transport and provider-side transcripts.
- Backend controls which private ElevenLabs agents may start new sessions.
- Database stores session metadata and business events, not audio or
  transcripts.
- No custom administrator interface is included.

## Accepted decisions

- [ADR 0001: Use ElevenLabs as the managed voice runtime](docs/decisions/0001-use-elevenlabs-managed-voice-runtime.md)
- [ADR 0002: Gate private ElevenLabs sessions through Backend](docs/decisions/0002-gate-private-elevenlabs-sessions-through-backend.md)

## Design checkpoint

- [Product requirements](docs/requirements/product-requirements.md)
- [Platform architecture and session lifecycle](docs/architecture/platform-foundation.md)
- [Deployment and operations](docs/architecture/deployment-and-operations.md)
- [Technology stack](docs/technology/stack.md)
- [Approved platform design](docs/specs/2026-08-12-voice-agent-platform-design.md)

## Active research

- [ElevenLabs agent configuration and ownership boundary](docs/research/elevenlabs-agent-configuration-boundary.md)

## Repository layout

```text
apps/client/   React and Vite Client-side
apps/backend/  FastAPI Cloudflare Python Worker
supabase/      Local Database configuration and SQL migrations
```

The current applications are intentionally placeholders. Client-side displays
the Backend health state; agent and session behavior will be added separately.

## Local development

Prerequisites:

- Node.js 24.19.0, recorded in `.node-version`. Node 26 is currently
  incompatible with pywrangler's Pyodide launcher.
- pnpm 11.8.0
- uv
- Docker Desktop or another Docker runtime when using the local Database

Install and start Client-side and Backend:

```bash
pnpm install --frozen-lockfile
uv sync --directory apps/backend --locked
cp apps/client/.env.example apps/client/.env.local
pnpm dev
```

- Client-side: `http://localhost:5173`
- Backend health: `http://localhost:8787/health`

The page reports `Backend connected` when both processes are running.

Start and stop the local Database separately:

```bash
pnpm db:start
pnpm db:status
pnpm db:stop
```

These commands target only the local Supabase stack.

## Cloudflare deployment with Wrangler

Authenticate once in a browser and verify the selected account:

```bash
npx wrangler login
npx wrangler whoami
```

Deploy Backend first:

```bash
uv run --directory apps/backend pywrangler deploy
```

Copy the generated Backend `workers.dev` URL. Build Client-side against it and
deploy the Static Assets Worker:

```bash
VITE_API_BASE_URL=https://voice-agent-backend.<account-subdomain>.workers.dev \
  pnpm --dir apps/client build
pnpm --dir apps/client exec wrangler deploy
```

Both first deployments create their named Workers in the authorized Cloudflare
account. Later deployments update those Workers.

## Automatic Cloudflare deployment

After the GitHub repository is created and `main` is pushed, connect the same
repository to both Workers using Cloudflare Workers Builds.

| Setting | Client-side | Backend |
| --- | --- | --- |
| Production branch | `main` | `main` |
| Root directory | `/` | `/` |
| Build command | `pnpm install --frozen-lockfile && pnpm --dir apps/client build` | `pnpm install --frozen-lockfile && uv sync --directory apps/backend --locked` |
| Deploy command | `pnpm --dir apps/client exec wrangler deploy` | `uv run --directory apps/backend pywrangler deploy` |
| Watch paths | `apps/client/**`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `apps/backend/**` |

Set `VITE_API_BASE_URL` in the Client-side build variables to the generated
Backend Worker URL. Both builds start at the repository root so the shared
lockfile is available; separate watch paths prevent a change in one application
from redeploying the other.

## Production Database migrations

After creating the Supabase project, add these GitHub Actions repository
secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

[The migration workflow](.github/workflows/deploy-database.yml) runs only when
files under `supabase/migrations` change on `main`. Local Supabase CLI commands
remain unlinked to the production project.
