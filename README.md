<img width="2968" height="841" alt="NetGoat" src="assets/netgoat-banner.png" />

# NetGoat CAS admin

The control panel for the NetGoat Central Administrative Service. It is an
internal operations UI: register instances, generate cluster join material,
edit UI-managed configuration, review queued deployments and read the audit
trail.

> **This panel is cluster-admin.** Reaching it at all is equivalent to holding
> the CAS API key, because the server-side proxy attaches that key to every
> request. It is protected by HTTP Basic auth and fails closed when no password
> is configured.

## Architecture

```text
browser ──Basic auth──► cass-admin (Next.js, :3200)
                              │  /api/cas/* server-side proxy
                              │  Authorization: Bearer $CAS_API_KEY
                              ▼
                        cass (Go, :8088)
```

The browser never sees `CAS_API_KEY`. `middleware.ts` guards every route except
Next's static assets, and `app/api/cas/[...path]/route.ts` is the only outbound
path to the API.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Overview counts and health |
| `/instances` | List, register and edit instances; join flow |
| `/config` | Read and replace UI-managed CAS configuration |
| `/deployments` | Queued deployment records |
| `/audit` | CAS audit entries |

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| UI | `@netgoat/ui`, vendored under `packages/design-system` |
| Package manager | Bun |

`packages/design-system` is a copy of the NetGoat design system so this
repository builds on its own. The canonical source lives in the NetGoat
workspace; changes here should be ported back.

## Prerequisites

- Bun 1.2 or newer
- A running [CAS API](https://github.com/netgoat-xyz/cass)

## Local development

```bash
cp .env.example .env    # set CAS_ADMIN_PASSWORD
bun install
bun run dev             # http://localhost:3200

# in another terminal, from a cass checkout
go run .
```

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Development server on port 3200 |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` |

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `CAS_ADMIN_USERNAME` | no | Basic auth user, defaults to `admin` |
| `CAS_ADMIN_PASSWORD` | **yes** | Basic auth password; unset ⇒ 503 |
| `CAS_URL` | no | CAS API base, defaults to `http://127.0.0.1:8088` |
| `CAS_API_KEY` | no | Bearer key sent to the CAS API server-side |

## Docker

```bash
docker build -t netgoat-cass-admin .
docker run --rm -p 3200:3200 --env-file .env netgoat-cass-admin
```

Published images: `ghcr.io/netgoat-xyz/cass-admin`. Distroless Node 22,
non-root, port 3200.

## Deployment

Run the panel next to the CAS API on a private network. Terminate TLS at a
reverse proxy and use a long random `CAS_ADMIN_PASSWORD`. Do not expose port
3200 directly to the internet. Because the panel is stateless, it can be
restarted freely; all state lives in the CAS API.

## Security

- Basic auth is compared in constant time; an unset password locks the panel.
- The CAS API key never reaches the browser.
- `bun.lock` is committed so images build reproducibly.
- Report vulnerabilities per [SECURITY.md](SECURITY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[GNU Affero General Public License v3.0](LICENSE).
