# Aden Ramirez Portfolio

This is Aden Ramirez's portfolio site. It is a single-page front end backed by a lightweight Node server that handles profile edits, owner login, resume uploads, and recruiter/community submissions.

## What the backend covers

- Owner login with persistent session cookie
- Live profile editing and JSON import/export through owner mode
- Resume PDF upload and profile update
- Recruiter/community submissions saved on disk
- Owner login event logging
- Optional webhook hook for owner-login alerts
- Health endpoint at `/api/health`

## Run locally

```bash
npm start
```

Open `http://127.0.0.1:3000`.

If you want the optional login alert hook, create `.env` from `.env.example` and set `OWNER_LOGIN_ALERT_WEBHOOK_URL` to a webhook from Zapier, Make, Resend, Twilio, or another service.

## Update content

- Edit `data/profile.json` for copy, contact info, booking placeholder text, education, and experience.
- Edit `data/highlights.json` for hand-picked project bullets.
- Run `node scripts/sync-github.mjs` to refresh `data/projects.json` from GitHub.
- Start the backend and use the hidden owner mode in the live page to update profile data without editing JSON by hand.
- Recruiter/community form messages are stored in `data/submissions.json`.
- Owner login events are stored in `data/login-events.json`.
- Uploaded resumes are stored in `assets/uploads/`.

## Deploy

This version is meant to run on a Node host because the owner editor and outreach inbox need server-side routes.

Static GitHub Pages can still serve the public page, but the owner login, save flow, resume upload, and message capture will not work there unless you replace the backend with another hosted API.

## Hosting

The simplest real host options are:

- Render: create a new Web Service from the repo, runtime `Node`, build command blank, start command `npm start`
- Railway: deploy the repo and set the start command to `npm start`
- VPS: install Node, clone the repo, run `npm start`, and put Nginx/Caddy in front of it

## What You Still Need To Add

- A real calendar booking link if you want scheduling to work
- `Handshake`, `Indeed`, and `ZipRecruiter` profile links if you want the career section fully filled in
- A real webhook/service if you want owner login alerts to send email or text messages
- Better screenshots or sharper summaries for your top projects if you want the projects section to read stronger
