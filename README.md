# @keenagents/keen-site

The **Keen site pre-process** — it runs in front of a Next.js partner site and puts the site under **Keen's site
control**. It holds the public port and proxies every request to Next on an internal port, keeps **one signed
WebSocket to Keen** (`<KEEN_HOST>/keen-site/link`), and starts, stops and restarts Next on Keen's signed word — on
every instance of the API key at once — with the values Keen hands over (the site's origin, the webhook secret, the
certificate, the API key's Secrets) in Next's environment. While Next is not serving, it answers with its own
maintenance / starting / unavailable pages.

Version `15.3.0` speaks the **Keen 15.3** site protocol (protocol 2: the API key's Secrets in the launch set).

- Plain Node ESM, **no runtime dependencies**, Node **22.9 or newer** (Node's built-in WebSocket client).
- It connects **out** to Keen; it needs no inbound route of its own.
- Values travel only in Next's environment — never on argv, never on disk, never in a log line (names only).

## Install

```sh
npm install @keenagents/keen-site
```

Then let the site's scripts start Next through it:

```json
{
    "scripts": {
        "dev:managed": "KEEN_SITE_CHILD=dev keen-site --dotenv .env.local",
        "start": "keen-site",
        "start:next": "next start",
        "dev": "next dev"
    }
}
```

| Script | What runs | Site control |
|---|---|---|
| `npm run dev:managed` | the pre-process, `.env.local` loaded; Next as `next dev` behind it | yes |
| `npm run build`, then `npm start` | the pre-process; Next as `next start` (or the standalone `server.js` in an image) | yes |
| `npm run dev` / `npm run start:next` | Next alone | no — no Start / Stop, no Secrets from Keen |

`npm start` loads no file: the environment must already hold the values (a service's environment file, the
container's env).

## The command

```
keen-site [--dotenv <path>]
```

| Option | Effect |
|---|---|
| `--dotenv <path>` (or `--dotenv=<path>`) | load this environment file **before anything else, if it exists** — a missing file is skipped; a value already in the environment wins over the file's; nothing of the file is printed (one line says it was loaded). Relative to the site's folder. Node's own parser (`process.loadEnvFile`). |
| `KEEN_SITE_ENV_FILE=<path>` | the same, from the environment; `--dotenv` wins when both are given |
| `-h`, `--help` · `-v`, `--version` | the usage · the package version |

**Why not `--env-file`.** Node (22 and 24) reads `--env-file` and `--env-file-if-exists` anywhere on its command line —
also after the script — and exits 9 (`node: <path>: not found`) before the bin's code runs when the file is missing.
`keen-site` therefore refuses both spellings with that reason and takes `--dotenv`.

An unknown argument exits 2 with the usage. A start that cannot happen (a bad setting, no Next to run) exits 1 with
`[keen-site] Could not start: <reason>`.

## Paths — always the site's folder

`keen-site` treats **the folder it is started in** (`process.cwd()`) as the site's root. npm runs a script in the
folder of the site's `package.json`, so `"start": "keen-site"` does the right thing. Nothing is resolved against this
package's own folder inside `node_modules`:

| What | Where it is looked for |
|---|---|
| the site's version (sent to Keen, shown on the Application card) | `<site>/package.json` → `version` |
| the standalone output (`KEEN_SITE_CHILD=auto`) | `<site>/server.js` |
| `next start` / `next dev` | `next` resolved from the site's own `node_modules`, like `require` from `<site>/package.json` |
| the folder Next runs in | `<site>` |
| the site's own pages | `<site>/keen-site/pages/{maintenance,starting,unavailable}.html` |

Started from a folder with neither `next` nor `server.js`, it stops with
`Next is not installed in <folder> and there is no server.js there — run keen-site from the site's folder …`.

## Docker

In the runner stage of a multi-stage image (Next's standalone output), copy the package next to `server.js` and run
its entry with `node`:

```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# The pre-process: Next's standalone trace leaves it out (nothing in the app imports it).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@keenagents/keen-site ./node_modules/@keenagents/keen-site
# Only if the site ships its own pages:
# COPY --from=builder --chown=nextjs:nodejs /app/keen-site/pages ./keen-site/pages

CMD ["node", "node_modules/@keenagents/keen-site/bin/keen-site.mjs"]
```

Why `node <path>` and not `npx keen-site`: the standalone output has no `node_modules/.bin`, and `npx` resolves a
command it cannot find locally by fetching a package **of that name** from the registry at container start — a network
call on every cold start, and not the code you built. `node` as the container's command also gets the platform's
SIGTERM directly (the pre-process then closes the link, stops Next and exits 0). The `WORKDIR` (where `server.js` is)
is the site's folder.

Install the package from the registry or from a `.tgz` — a `file:` link to a folder leaves a symlink in
`node_modules` that the `COPY` above would carry as a broken link.

## Modes

The first log line names it: `[keen-site] Mode <mode> — <why>. Instance <id> (<runtime>, site <version>, Node <v>).`

| Mode | When | What runs |
|---|---|---|
| **managed** | `KEEN_HOST` (a full `http(s)` URL), `KEEN_API_KEY_ID` and `KEEN_API_KEY_SECRET` all set | Keen decides when Next runs and with which values |
| **legacy** | one of the three missing; or, before any welcome, Keen closes **4405** (no site control for the key) | Next on the container's own environment, proxy only, no link |
| **off** | `KEEN_SITE_MODE=off` | no proxy: Next binds `PORT` itself; signals are forwarded |

## Settings it reads

All from the environment. Names only — no value belongs in this file or any other you commit.

| Name | Effect |
|---|---|
| `PORT` | the public port it listens on (all interfaces); default `3000` |
| `KEEN_HOST` | Keen's address, a full `https://` URL; the link goes to `<KEEN_HOST>/keen-site/link` |
| `KEEN_API_KEY_ID`, `KEEN_API_KEY_SECRET` | the API key; every signing and encryption key derives from the secret — **the secret never crosses the link** |
| `KEEN_WS` | passed to Next; when unset it is derived as `wss://<KEEN_HOST host>/ws-keen` |
| `KEEN_SITE_MODE` | `off` turns the pre-process into a plain launcher (see Modes) |
| `KEEN_SITE_CHILD` | what runs: `auto` (default — `node server.js` when the standalone output is in the folder, else `next start`), `standalone`, `next-start`, `dev` |
| `KEEN_SITE_CHILD_PORT` | Next's internal port; default `PORT + 1`; must differ from `PORT` or the start fails |
| `KEEN_SITE_CHILD_NODE_OPTIONS` | `NODE_OPTIONS` for Next only |
| `KEEN_SITE_PROTOCOL` | `2` (default) applies the API key's Secrets; `1` ignores them — only for a Keen without the Secret Manager. Any other value stops the start |
| `KEEN_SITE_ENV_FILE` | the environment file to load first (see The command) |
| `HOSTNAME` | off mode only: the address Next binds (default all interfaces) |
| `K_REVISION`, `K_SERVICE` | set by Cloud Run: the instance id starts with the revision; the runtime shows as Cloud Run |

Next always listens on **the loopback address** at `KEEN_SITE_CHILD_PORT`; the pre-process holds `PORT`.

**The site's address must be public.** The site's origin — the bound webhook's origin, the relay's allow-list entry,
the base of every e-mailed link — is a public `https://` address (a tunnel to `PORT` on a machine, the service's own
address on a container platform). A local address is not acceptable.

## What Keen's words do to Next

| Keen says | Next |
|---|---|
| the same state hash as the one applied, Next up | nothing — a reconnect never restarts the site |
| Start / Restart, a rotated key started again, Enable, a re-binding, a Secrets publish | the launch set is asked, then Next starts / restarts with it |
| Refresh data, a new certificate, a contract change | the launch set is asked, then Next's loopback route `POST /api/keen-site` is called — no restart |
| Stop — also the hold after a Create / Rotate until a person presses Start | Next stopped, the **maintenance** page, still connected |
| Disabled, or a binding missing | Next stopped, the **unavailable** page, still connected |

Before the first welcome the **starting** page is served for 15 s, then the **unavailable** page while the link keeps
trying. While Next starts, a request is held up to 15 s. The pages answer `503` with `Retry-After` (60 / 5 / 60 s) and
JSON under `/api/*`; the public page never says why — the log does.

**Next's environment**, a later one winning: the pre-process's own; Keen's `launch.env` (`KEEN_ORIGIN`,
`KEEN_WEBHOOK_SECRET` — a protected name is ignored with a WARN); the API key's Secrets (each name checked against the
shape `^[A-Z][A-Z0-9_]{0,127}$` and a denylist — `KEEN_`, `NEXT_`, `NODE_`, `NPM_`, `LD_` … prefixes, `PATH`, `PORT`,
`HOSTNAME`, the proxy and trust-store names; a refused one is not applied, with a WARN); the certificate
(`KEEN_CERTIFICATE_PEM`, `KEEN_CERTIFICATE_SECRET`); its own words (`KEEN_SITE_MANAGED`, `KEEN_SITE_TOKEN` new per
start, `KEEN_SITE_HASH`, `KEEN_SITE_SECRETS_VERSION`, `PORT` = the child port, `HOSTNAME` = the loopback address).
A Keen value that replaces a different container value logs a WARN naming it; the log names Secrets, never values.

**Supervising Next.** Ready = its port accepts TCP (every 100 ms, up to 30 s, else it is killed). Stop = SIGTERM, 10 s,
SIGKILL. An exit nobody asked for restarts it after 1, 2, 5, 10, 30, 60 s; the 5th exit within 5 minutes gives up
until Keen's next state. SIGTERM / SIGINT to the pre-process closes the link, stops Next and exits 0.

## The site's side

- **The reserved route `/api/keen-site`** belongs to the site's Next app (the loopback nudge: it checks
  `X-Keen-Site-Token` against `KEEN_SITE_TOKEN`, stores the certificate, re-reads Keen's data). From outside it answers
  404 — the proxy never forwards it.
- **The proxy** passes requests and upgrades through unbuffered (streams, long polls, `next dev`'s hot reload). A body
  on GET / HEAD / OPTIONS / TRACE is refused `400`: a site route that needs a body uses POST.
- **A correct clock.** Keen refuses a hello more than 60 s off its own clock (close 4406).

## Close codes, in short

| Close | The pre-process |
|---|---|
| 4403 key rotated · 4404 key deleted · 4406 invalid signature | Next stopped, unavailable page; no reconnect until the process restarts with new values |
| 4405 site control not set up | before any welcome: legacy mode; later: retry |
| 4402 key disabled | Next stopped, unavailable page; it reconnects about every minute and starts again by itself after Enable |
| 4413 too many instances · 4429 too many attempts (`retry=<s>`) | keep the current state; retry after about a minute / after the named wait |
| 1012 Keen's worker restarts | reconnect within 10 s |
| 4410 idle, 1013, 4401, 4407, 4409, a dropped network | keep the current state; backoff with jitter, up to 60 s |

After more than 35 s without a frame from Keen (a platform that gives an idle instance no CPU), the next request first
pings Keen and waits up to 2 s, so a command that waited in the socket is applied before that request is answered.

## Programmatic use

The bin is the main surface. The package also exports its pure pieces — nothing here starts a process or opens a
socket:

```js
import { readConfig, classifyClose, secretNameRefusal, loadPages, sitePagesDir } from '@keenagents/keen-site';

const config = readConfig(process.env, process.cwd()); // { mode, why, port, childPort, childKind, … }
```

Exports: `readConfig`, `protocolOf`, `protocolNote`, `siteVersion`, `PROTOCOL_1_FORCED`, `CLOSE_CODES`,
`classifyClose`, `DENYLIST`, `SECRET_NAME`, `secretNameRefusal`, `PAGES`, `SITE_PAGES_DIR`, `sitePagesDir`,
`loadPages`; types `SiteConfig`, `CloseKind`, `PagePhase`.

## License

UNLICENSED.
