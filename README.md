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

## Operations

- [Production deployment](docs/deployment.md)

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
