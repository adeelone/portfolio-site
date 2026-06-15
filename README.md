# Aden Ramirez Portfolio

This is a static portfolio site for Aden Ramirez. It pulls public GitHub project data into local JSON files, then renders a single-page portfolio with no build step.

## Run locally

```bash
python -m http.server 8000
```

Open `http://127.0.0.1:8000`.

## Update content

- Edit `data/profile.json` for hero copy, status, contact info, education, and experience.
- Edit `data/highlights.json` for hand-picked project bullets.
- Run `node scripts/sync-github.mjs` to refresh `data/projects.json` from GitHub.

## Deploy

Push `main`, then enable GitHub Pages for the repository and set the source to deploy from the root of the `main` branch.
