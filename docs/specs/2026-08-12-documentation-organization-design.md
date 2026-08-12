# Documentation Organization Design

- Status: Approved design
- Date: 2026-08-12

## Goal

Keep `README.md` focused on what the project is, its current product boundary,
and where to find detailed documentation.

## Structure

Operational guidance moves into two flat documents under `docs/`:

- `docs/local-development.md` contains the repository layout, prerequisites,
  dependency installation, local application startup, endpoints, and local
  Supabase commands.
- `docs/deployment.md` contains direct Wrangler deployment, Cloudflare Workers
  Builds configuration, and production Supabase migration setup.

`README.md` retains the project introduction, initial agents, concise product
boundary, and a categorized documentation index linking to requirements,
architecture, decisions, research, local development, and deployment.

## Constraints

- Preserve the existing operational commands and configuration values.
- Do not duplicate detailed setup or deployment instructions in the README.
- Keep the new operational documents flat directly under `docs/`.
- Update all affected links and verify no stale README sections remain.
