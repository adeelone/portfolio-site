const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

const port = 3199;
const origin = `http://127.0.0.1:${port}`;
let child;

test.before(async () => {
  child = spawn(process.execPath, ["server.js"], { cwd: path.resolve(__dirname, ".."), env: { ...process.env, PORT: String(port), NODE_ENV: "production", SITE_URL: origin }, stdio: "ignore" });
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(`${origin}/api/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Test server did not start.");
});

test.after(() => child?.kill());

test("serves the app and project routes with route-specific metadata", async () => {
  const home = await fetch(`${origin}/`);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Aden Ramirez \| Software Engineer/);
  const project = await fetch(`${origin}/projects/sentinel`);
  assert.equal(project.status, 200);
  assert.match(await project.text(), /Sentinel \| Aden Ramirez/);
  const jobs = await fetch(`${origin}/jobs`);
  assert.equal(jobs.status, 200);
  assert.match(await jobs.text(), /Jobs \| Aden Ramirez/);
  const education = await fetch(`${origin}/education`);
  assert.equal(education.status, 200);
  assert.match(await education.text(), /Education \| Aden Ramirez/);
  const contact = await fetch(`${origin}/contact`);
  assert.equal(contact.status, 200);
  const contactHtml = await contact.text();
  assert.match(contactHtml, /Contact \| Aden Ramirez/);
  assert.match(contactHtml, /property="og:url" content="http:\/\/127\.0\.0\.1:3199\/contact"/);
  assert.equal((await fetch(`${origin}/projects/not-a-real-project`)).status, 404);
});

test("blocks repository and private data files", async () => {
  for (const pathname of ["/server.js", "/.git/config", "/.env.example", "/package.json", "/data/submissions.json", "/data/login-events.json", "/data/profile.json"]) {
    assert.equal((await fetch(`${origin}${pathname}`)).status, 404, pathname);
  }
});

test("sets production security headers", async () => {
  const response = await fetch(`${origin}/`);
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("permissions-policy"), /camera=\(\)/);
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000; includeSubDomains");
});

test("exposes only read-only public APIs", async () => {
  assert.equal((await fetch(`${origin}/api/profile`)).status, 200);
  assert.equal((await fetch(`${origin}/api/projects`)).status, 200);
  assert.equal((await fetch(`${origin}/api/submissions`, { method: "POST", body: "{}" })).status, 405);
});

test("serves the professional headshot as an explicit public asset", async () => {
  const response = await fetch(`${origin}/assets/aden-headshot.png`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.ok((await response.arrayBuffer()).byteLength > 100000);
});

test("serves artwork for every project and both resume versions", async () => {
  const projectData = await (await fetch(`${origin}/api/projects`)).json();
  const artworkPaths = projectData.repos.filter((project) => project.slug !== "portfolio-site").map((project) => `/assets/project-${project.slug}.png`);
  for (const pathname of [
    ...artworkPaths,
    "/assets/resume-technical-preview.png",
    "/assets/resume-general-preview.png"
  ]) {
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, 200, pathname);
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.ok((await response.arrayBuffer()).byteLength > 100000, pathname);
  }
  for (const pathname of ["/assets/Aden_Ramirez_Resume.pdf", "/assets/Aden_Ramirez_Resume_General.pdf"]) {
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, 200, pathname);
    assert.equal(response.headers.get("content-type"), "application/pdf");
  }
});

test("provides robots and a project sitemap", async () => {
  assert.match(await (await fetch(`${origin}/robots.txt`)).text(), /Sitemap:/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/projects\/sentinel/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/jobs/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/education/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/contact/);
});

test("provides a downloadable contact card", async () => {
  const response = await fetch(`${origin}/contact.vcf`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/vcard/);
  const card = await response.text();
  assert.match(card, /FN:Aden Ramirez/);
  assert.match(card, /EMAIL;TYPE=INTERNET:adeemra@gmail.com/);
  assert.match(card, /TEL;TYPE=CELL:\+19152407882/);
});
