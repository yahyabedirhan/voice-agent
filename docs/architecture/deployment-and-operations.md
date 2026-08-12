# Deployment and Operations

- Status: Approved
- Date: 2026-08-12
- Scope: Version 1

This document defines the repository layout, runtime environments, and
production deployment behavior. It uses technology names because it describes
implementation and operations rather than logical system responsibilities.

## Monorepo layout

```text
apps/
  client/
  backend/
supabase/
  config.toml
  migrations/
  seed.sql
docs/
```

- `apps/client` is independently buildable and deployable.
- `apps/backend` is independently runnable and deployable.
- `supabase` contains local Database configuration and versioned SQL migrations.
- Client-side and Backend do not share an application build pipeline merely
  because they live in one repository.

Exact generated files may vary when the Cloudflare and shadcn initialization
tools run. The top-level ownership boundaries remain stable.

## Environments

There are two environments:

1. Local development
2. Production

There is no staging environment. Platform-generated domains are used, and no
custom domains are required.

Secret names are selected during initialization when the exact Cloudflare,
Supabase, and ElevenLabs integrations are configured. Production secrets live
in their deployment platforms and are not committed to Git.

## Client-side deployment

- Runtime: Cloudflare Workers Static Assets
- Source: `apps/client`
- Build: React and Vite using pnpm
- Trigger: relevant changes merged to `main`

Client-side-only changes must not redeploy Backend. Cloudflare's native Git
integration, a generated workflow, or a small custom workflow may provide the
trigger. The repository does not require a handwritten workflow when the
platform provides the required path-aware behavior.

## Backend deployment

- Runtime: Cloudflare Python Workers
- Source: `apps/backend`
- Framework: FastAPI through Cloudflare's ASGI integration
- Dependencies: uv and `pyproject.toml`
- Local and deployment tool: pywrangler
- Trigger: relevant changes merged to `main`

Backend-only changes must not redeploy Client-side. Backend is serverless and
does not use Docker, Render, Fly.io, or a conventional always-on Python process.

## Database development and deployment

Local development uses Supabase CLI against the local Supabase stack. Local
development commands must not be the mechanism for changing the production
schema.

Schema changes are SQL migration files committed under
`supabase/migrations`. After migration changes merge to `main`, a deployment
job runs Supabase CLI and applies outstanding migrations to production with
`supabase db push`.

Production Database credentials used by Supabase CLI are available only to that
deployment job. Backend separately receives its Supabase Data API secret through
Cloudflare's secret storage. Migration jobs are serialized so two schema changes
do not run concurrently.

There is no staging migration, manual approval gate, coordinated Backend and
Database release order, backward-compatibility policy, or automated migration
recovery system. Those operational safeguards are intentionally outside the
scope of this demo.

## Deployment automation boundary

Automation exists to deploy changes merged to `main`; it is not a general CI
quality gate.

- No automated test suite runs in CI.
- No real ElevenLabs session is started by automation.
- Client-side, Backend, and Database migrations use independent deployment
  triggers.
- A change isolated to one area should trigger only that area's deployment.
- Changes to shared deployment configuration may intentionally trigger more
  than one deployment.
- The precise workflow files and names are selected by the deployment tooling
  during initialization. They may be native, generated, or handwritten.

## Package tooling

- pnpm manages Client-side dependencies and repository-level JavaScript tools.
- uv manages Backend Python dependencies.
- pywrangler runs and deploys the Python Worker.
- Supabase CLI runs the local Database and applies production migrations from
  the deployment job.

## Operational visibility

- Cloudflare provides Client-side and Backend deployment status and runtime
  logs.
- Supabase provides Database administration and migration visibility.
- ElevenLabs provides voice-agent configuration, conversations, transcripts,
  and provider history.

No additional observability platform is required before project initialization.
