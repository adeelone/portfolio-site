const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const { projectArtSlugs } = require("../render");

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
  const homeHtml = await home.text();
  assert.match(homeHtml, /Aden Ramirez \| Software Engineer/);
  assert.match(homeHtml, /<main[^>]*>[\s\S]*<h1>Aden<br>Ramirez<\/h1>/);
  assert.doesNotMatch(homeHtml, /Loading the work/);
  assert.equal((homeHtml.match(/<h1[ >]/g) || []).length, 1);
  const project = await fetch(`${origin}/projects/sentinel`);
  assert.equal(project.status, 200);
  const projectHtml = await project.text();
  assert.match(projectHtml, /Sentinel \| Aden Ramirez/);
  assert.equal((projectHtml.match(/<h1[ >]/g) || []).length, 1);
  const dwellSignal = await fetch(`${origin}/projects/dwell-signal`);
  assert.equal(dwellSignal.status, 200);
  assert.match(await dwellSignal.text(), /DwellSignal \| Aden Ramirez/);
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
  const play = await fetch(`${origin}/play`);
  assert.equal(play.status, 200);
  const playHtml = await play.text();
  assert.match(playHtml, /Play \| Aden Ramirez/);
  assert.match(playHtml, /<canvas id="play-canvas"/);
  assert.match(playHtml, /<script src="\/snake\.js\?v=1" defer><\/script><script src="\/play\.js\?v=1" defer><\/script>/);
  assert.equal((playHtml.match(/<h1[ >]/g) || []).length, 1);
  const home2 = await fetch(`${origin}/`);
  assert.doesNotMatch(await home2.text(), /snake\.js|play\.js/, "the game scripts must not load on unrelated pages");
  const missing = await fetch(`${origin}/projects/not-a-real-project`);
  assert.equal(missing.status, 404);
  const missingHtml = await missing.text();
  assert.match(missingHtml, /Page Not Found \| Aden Ramirez/);
  assert.match(missingHtml, /name="robots" content="noindex, follow"/);
  assert.match(missingHtml, /<h1>That project isn't here\.<\/h1>/);
  assert.equal((missingHtml.match(/<h1[ >]/g) || []).length, 1);
});

test("provides complete route metadata and structured data in source HTML", async () => {
  const projectData = await (await fetch(`${origin}/api/projects`)).json();
  const pages = ["/", "/work", "/jobs", "/education", "/about", "/contact", "/play", ...projectData.repos.filter((project) => project.slug !== "portfolio-site").map((project) => `/projects/${project.slug}`)];
  const titles = new Set();
  for (const pathname of pages) {
    const html = await (await fetch(`${origin}${pathname}`)).text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title, `${pathname} title`);
    assert.ok(!titles.has(title), `${pathname} title must be unique`);
    titles.add(title);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /<meta property="og:image" content="http:\/\/127\.0\.0\.1:3199\/assets\/aden-headshot\.png"/);
    assert.match(html, /<link rel="canonical"[^>]+href="http:\/\/127\.0\.0\.1:3199/);
    assert.match(html, /<link rel="icon" href="\/favicon\.svg"/);
    assert.match(html, /<script type="application\/ld\+json"[^>]*>\{"@context":"https:\/\/schema\.org"/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${pathname} h1 count`);
    for (const image of html.matchAll(/<img\b[^>]*>/g)) assert.match(image[0], /\balt="[^"]*"/, `${pathname} image alt`);
  }
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
  const health = await fetch(`${origin}/api/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("cache-control"), "no-store");
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

test("serves artwork for every curated project and both resume versions", async () => {
  const projectData = await (await fetch(`${origin}/api/projects`)).json();
  const currentSlugs = new Set(projectData.repos.map((project) => project.slug));
  const artworkPaths = [...projectArtSlugs].filter((slug) => currentSlugs.has(slug)).map((slug) => `/assets/project-${slug}.png`);
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
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /User-agent: GPTBot\nAllow: \//);
  assert.match(robots, /User-agent: ClaudeBot\nAllow: \//);
  assert.match(robots, /Sitemap: http:\/\/127\.0\.0\.1:3199\/sitemap\.xml/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/projects\/sentinel/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/jobs/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/education/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /\/contact/);
});

test("serves favicon and llms discovery while refusing source maps", async () => {
  const favicon = await fetch(`${origin}/favicon.svg`);
  assert.equal(favicon.status, 200);
  assert.match(favicon.headers.get("content-type"), /image\/svg\+xml/);
  const llms = await fetch(`${origin}/llms.txt`);
  assert.equal(llms.status, 200);
  assert.match(await llms.text(), /# Aden Ramirez Portfolio/);
  assert.equal((await fetch(`${origin}/client.js.map`)).status, 404);
  const client = await (await fetch(`${origin}/client.js`)).text();
  assert.ok(Buffer.byteLength(client) < 10000, "browser JavaScript should stay under 10 KB uncompressed");
  assert.doesNotMatch(client, /sourceMappingURL|\bReact\b|\bVite\b/);
});

test("serves the game scripts as small, dependency-free browser JavaScript", async () => {
  for (const pathname of ["/snake.js", "/play.js"]) {
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type"), /application\/javascript/, pathname);
    const body = await response.text();
    assert.ok(Buffer.byteLength(body) < 8000, `${pathname} should stay under 8 KB uncompressed`);
    assert.doesNotMatch(body, /sourceMappingURL|\bReact\b|\bVite\b/, pathname);
  }
});

test("redirects alternate public hostnames to the configured production origin", async () => {
  for (const host of ["portfolio-preview.vercel.app", "mysite-bold-aurora-9442.fly.dev", "www.127.0.0.1"]) {
    const response = await fetch(`${origin}/work?filter=live`, { headers: { "x-forwarded-host": host }, redirect: "manual" });
    assert.equal(response.status, 308, host);
    assert.equal(response.headers.get("location"), `${origin}/work?filter=live`, host);
  }
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
