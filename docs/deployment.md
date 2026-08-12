# Deployment

Production deployments use Cloudflare Workers Builds connected directly to the
GitHub repository. A push to `main` builds and deploys each affected Worker from
the committed source and Wrangler configuration.

## Production URLs

Cloudflare Workers URLs follow this structure:

```text
https://<worker-name>.<account-subdomain>.workers.dev
```

This project uses the account-wide Workers subdomain `voice-agent-demo`:

- Client-side: `https://app.voice-agent-demo.workers.dev`
- Backend: `https://api.voice-agent-demo.workers.dev`

The account subdomain is configured from the Workers & Pages overview in the
Cloudflare dashboard. Changing it changes the generated `workers.dev` URL for
every Worker in the account.

## Cloudflare Git connections

Connect the GitHub repository to two separate Cloudflare Workers. Both use
`main` as the production branch.

| Setting | Client-side | Backend |
| --- | --- | --- |
| Worker name | `app` | `api` |
| Root directory | `/apps/client` | `/apps/backend` |
| Build command | `pnpm run build` | `uv sync --locked` |
| Deploy command | `npx wrangler deploy` | `uv run pywrangler deploy` |

Cloudflare Workers Builds installs project dependencies before running the
configured build command. The build commands therefore contain only the work
specific to each application.

The Worker names must agree with the `name` fields in their respective
Wrangler configurations:

- `apps/client/wrangler.jsonc`
- `apps/backend/wrangler.jsonc`

## Client-side build variable

Configure this build variable on the `app` Worker:

```text
VITE_API_BASE_URL=https://api.voice-agent-demo.workers.dev
```

Do not include a trailing slash. Vite embeds this value into the production
bundle during the build, so changing it requires a new Client-side deployment.

When changing the account Workers subdomain or Backend Worker name:

1. Deploy Backend and verify its new URL.
2. Update `VITE_API_BASE_URL` on the Client-side Worker.
3. Redeploy Client-side.

## Build watch paths

Configure independent watch paths so an isolated change deploys only its
application:

| Worker | Watch paths |
| --- | --- |
| `app` | `apps/client/**`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` |
| `api` | `apps/backend/**` |

Changes to shared package-management files may intentionally rebuild
Client-side. Add a shared path to both Workers later if both applications begin
to depend on it.

## Verification

After deployment, verify:

```bash
curl --fail https://api.voice-agent-demo.workers.dev/health
```

Expected response:

```json
{"status":"ok","service":"backend"}
```

Then open `https://app.voice-agent-demo.workers.dev` and confirm the page shows
`Backend connected`.

## Optional manual deployment

Git-connected Workers Builds is the normal production workflow. Wrangler can
still deploy manually for troubleshooting or to demonstrate the underlying
deployment commands:

```bash
uv run --directory apps/backend pywrangler deploy
VITE_API_BASE_URL=https://api.voice-agent-demo.workers.dev \
  pnpm --dir apps/client build
pnpm --dir apps/client exec wrangler deploy
```

Manual deployment requires prior Wrangler authentication and should not replace
the Git-connected workflow.

## Production Database migrations

Database migrations use the separate GitHub Actions workflow at
`.github/workflows/deploy-database.yml`. It runs after migration changes are
merged to `main` and requires these GitHub Actions repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

Local Supabase CLI commands remain unlinked to the production project.
