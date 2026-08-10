# Aden Ramirez Portfolio

An editorial, route-based portfolio for Aden Ramirez. One dependency-free Node service delivers the public application, read-only content APIs, individual project case studies, route-specific metadata, and security headers.

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
- `/about` — background and working style
- `/contact` — email, phone, professional profiles, résumé, and downloadable vCard
- `/sitemap.xml` and `/robots.txt` — search discovery

## Content

- `data/profile.json` contains biography, experience, education, and contact content.
- `data/projects.json` is the normalized GitHub project feed.
- `data/highlights.json` contains curated project notes used by the sync script.
- `node scripts/sync-github.mjs` refreshes public GitHub project data.

The server exposes only an explicit set of public assets. Repository source, `.git`, environment files, and `data/*.json` are never served statically. Public content is available through narrow read-only API routes.

## Deployment

Deploy as one Node service with `npm start`. Set `PORT` only if the host does not provide it. Set `SITE_URL` to the final HTTPS origin, such as `https://portfolio.example.com`, so canonical URLs, social metadata, and the sitemap use the public domain. Set `NODE_ENV=production` to enable HSTS.

The repository includes:

- `render.yaml` for a Render Blueprint deployment
- `Dockerfile` with a production health check
- `.github/workflows/ci.yml` for syntax and regression checks on pushes and pull requests

This version needs no database, persistent disk, credentials, owner login, or public message storage.
