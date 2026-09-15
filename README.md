# Aden Ramirez Portfolio

An editorial, route-based portfolio for Aden Ramirez. One dependency-free Node service delivers server-rendered public pages, read-only content APIs, individual project case studies, route-specific metadata, and security headers. JavaScript is progressively added only for filtering, copying contact details, the mobile menu, and the resume dialog.

**Live portfolio:** [https://adenramirez.dev](https://adenramirez.dev)

## Run and verify

```powershell
npm.cmd start
npm.cmd run check
```

Open `http://127.0.0.1:3000`. Checks cover syntax, routing, security headers, API behavior, and private-file isolation.

## Public routes

- `/` — concise home page
- `/work` — searchable, filterable archive of every synced project
- `/projects/:slug` — a case study for every project record
- `/jobs` — the complete employment history, including technical and non-technical work
- `/education` — verified UTEP degree progress, honors, coursework, and current classes
- `/about` — background and working style
- `/contact` — email, phone, professional profiles, résumé, and downloadable vCard
- `/play` — a small, dependency-free Snake game (keyboard or touch controls, best score kept in `localStorage` only)
- `/sitemap.xml`, `/robots.txt`, and `/llms.txt` — search and AI discovery

## Content

- `data/profile.json` contains biography, experience, education, and contact content.
- `data/projects.json` is the normalized GitHub project feed.
- `data/highlights.json` contains curated project notes used by the sync script.
- `node scripts/sync-github.mjs` refreshes public GitHub project data.

The server exposes only an explicit set of public assets. Repository source, `.git`, environment files, and `data/*.json` are never served statically. Public content is available through narrow read-only API routes.

## Deployment

The production site runs on Fly.io at [https://adenramirez.dev](https://adenramirez.dev), deployed from the included `Dockerfile` as a single Node service. The Fly Machine may stop while idle and automatically starts for the next request. Deploy with `fly deploy`; pushes to `main` also deploy after the repository checks pass. `fly.toml` sets the canonical `SITE_URL`, production health check, and graceful-shutdown window. HTTPS for both `adenramirez.dev` and `www.adenramirez.dev` is managed through Fly certificates.

The repository includes:

- `Dockerfile` with a production health check, used directly by `fly deploy`
- `.github/workflows/ci.yml` for syntax and regression checks on pushes and pull requests
- `.github/workflows/fly-deploy.yml` for production deployment after changes reach `main`
- `fly.toml` for Fly.io app, region, service, and machine configuration

The primary production origin is the Fly.io domain above. Requests reaching a production deployment through an alternate `*.vercel.app` hostname are redirected to `SITE_URL`, preventing duplicate indexing under a platform subdomain.

This version needs no frontend framework, bundler, source maps, database, persistent disk, credentials, owner login, or public message storage.
