# Documentation Organization Design

- Status: Approved design
- Date: 2026-08-12

## Goal

Keep `README.md` focused on what the project is, its current product boundary,
and where to find detailed documentation.

## Structure

Deployment guidance moves into one flat document under `docs/`:

- `docs/deployment.md` contains Cloudflare Workers Builds configuration for the
  independently deployed Backend and Client-side projects, the relationship
  between their generated URLs, optional direct Wrangler deployment examples,
  and production Supabase migration setup.

`README.md` retains the project introduction, initial agents, concise product
boundary, repository layout, straightforward local development instructions,
and a categorized documentation index linking to requirements, architecture,
decisions, research, and deployment.

## Deployment direction

Git-connected Cloudflare Workers Builds is the supported production deployment
path. Direct deployment through Wrangler may be shown as an optional capability
or troubleshooting tool, but it must not be presented as the normal workflow.

The same GitHub monorepo is connected to two Cloudflare projects:

| Setting | Backend | Client-side |
| --- | --- | --- |
| Root directory | `apps/backend` | `apps/client` |
| Build command | `pnpm install --frozen-lockfile && uv sync --locked` | `pnpm install --frozen-lockfile && pnpm run build` |
| Deploy command | `uv run pywrangler deploy` | `pnpm exec wrangler deploy` |

Each project has its own watch paths. The Client-side build variable
`VITE_API_BASE_URL` points to the deployed Backend Worker URL.

## Constraints

- Preserve the existing operational commands and configuration values.
- Keep local setup in the README and remove deployment instructions from it.
- Keep `docs/deployment.md` directly under `docs/`.
- Make Git integration primary and direct CLI deployment secondary.
- Update all affected links and verify no stale README sections remain.
