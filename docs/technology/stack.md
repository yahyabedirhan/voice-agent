# Technology Stack

- Status: Current decision
- Date: 2026-08-12
- Scope: Version 1

This document maps the logical components in the requirements and architecture
documents to their selected implementation technologies. Architectural
documents use logical names so their responsibilities do not depend on a
particular framework.

| Logical component | Selected technology | Purpose |
| --- | --- | --- |
| Client-side | React with Vite | Browser UI, microphone permission, call controls, and ElevenLabs client integration |
| Backend | Python with FastAPI on Cloudflare Python Workers | Agent catalog, session admission, provider credentials, lifecycle handling, and future business-tool boundaries |
| Database | Supabase-hosted PostgreSQL with its HTTPS Data API | Application session metadata and business events |
| ElevenLabs | ElevenLabs Agents | Realtime voice transport, speech recognition, agent runtime, speech synthesis, transcripts, and provider history |

## Terminology rule

Requirements, platform diagrams, lifecycle descriptions, and component
responsibilities use logical component names:

- Client-side
- Backend
- Database
- ElevenLabs

Technology names appear when a statement is specifically about implementation,
configuration, SDK behavior, deployment, or a technology decision. ADRs and
technology research may therefore mention both the logical role and the chosen
technology.

## Current implementation choices

### Client-side: React with Vite

React is the selected UI library and Vite is the application build and
development tool. The application will use the ElevenLabs React client library
for browser voice sessions.

The UI stack also includes:

- shadcn/ui initialized with a preset supplied before project initialization;
- Tailwind CSS for styling;
- TanStack Query for data fetched from Backend;
- Redux Toolkit for shared client state that is not server state.

The JavaScript package manager is pnpm.

### Backend: Python with FastAPI on Cloudflare Workers

Python matches the learning goals for this project. FastAPI provides the HTTP
API boundary for the catalog, session admission, lifecycle reconciliation, and
future business integrations. Cloudflare's ASGI integration runs FastAPI inside
a Python Worker.

Backend dependencies are declared in `pyproject.toml` and managed with uv.
Pywrangler runs Backend locally and deploys it to Cloudflare. Pydantic models
validate HTTP and domain data.

SQLModel, direct PostgreSQL drivers, and Docker are not part of the selected
stack. Python Workers run through Pyodide, so dependencies must be compatible
with the Cloudflare runtime.

### Database: Supabase-hosted PostgreSQL

PostgreSQL stores application-owned records. Supabase provides the hosted
database and its administration surface. Supabase is not the source of truth
for the code-defined agent catalog or ElevenLabs transcripts.

Backend accesses private application tables through Supabase's HTTPS Data API.
A Supabase server secret is stored only in Cloudflare and never exposed to
Client-side. SQL migration files and Supabase CLI manage the schema.

### ElevenLabs: ElevenLabs Agents

ElevenLabs is both a selected technology and an external system boundary. It is
named directly in architecture documents where the design relies on its
provider-specific responsibilities, identifiers, tokens, dashboards, or
webhooks.

## Deployment choices

- Client-side deploys to Cloudflare Workers using Static Assets.
- Backend deploys to Cloudflare Python Workers.
- Database runs on Supabase-hosted PostgreSQL.
- Local development and production are the only environments.
- Cloudflare and Supabase generated domains are sufficient; custom domains are
  not required.

The monorepo, deployment triggers, and migration process are defined in
[Deployment and Operations](../architecture/deployment-and-operations.md).
