const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const { projectArtSlugs, eventBanner, renderPage } = require("../render");
const { loadPosts, markdownToHtml } = require("../writing");

const port = 3199;
const origin = `http://127.0.0.1:${port}`;
let child;

test.before(async () => {
  child = spawn(process.execPath, ["server.js"], { cwd: path.resolve(__dirname, ".."), env: { ...process.env, PORT: String(port), NODE_ENV: "production", SITE_URL: origin, POSTS_DIR: path.join(__dirname, "fixtures", "posts") }, stdio: "ignore" });
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
  const jobsHtml = await jobs.text();
  assert.match(jobsHtml, /Jobs \| Aden Ramirez/);
  assert.match(jobsHtml, /<details class="job-group" open>/);
  assert.match(jobsHtml, /<details class="job-group"><summary>/);
  assert.match(jobsHtml, /Technical experience/);
  assert.match(jobsHtml, /General experience/);
  assert.match(jobsHtml, /id="jobs-view-toggle"[^>]+>Merge chronologically/);
  assert.match(jobsHtml, /class="timeline jobs-timeline jobs-chronological"[^>]+hidden/);
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
  assert.match(playHtml, /id="play-pause" disabled>Pause/);
  assert.match(playHtml, /<script src="\/snake\.js\?v=1" defer><\/script><script src="\/play\.js\?v=2" defer><\/script>/);
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
  const pages = ["/", "/shpe", "/work", "/jobs", "/education", "/about", "/contact", "/play", ...projectData.repos.filter((project) => project.slug !== "portfolio-site").map((project) => `/projects/${project.slug}`)];
  const titles = new Set();
  for (const pathname of pages) {
    const html = await (await fetch(`${origin}${pathname}`)).text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title, `${pathname} title`);
    assert.ok(!titles.has(title), `${pathname} title must be unique`);
    titles.add(title);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /<meta property="og:image" content="http:\/\/127\.0\.0\.1:3199\/assets\/og-image\.jpg"/);
    assert.match(html, /<meta property="og:image:width" content="1200"/);
    assert.match(html, /<link rel="canonical"[^>]+href="http:\/\/127\.0\.0\.1:3199/);
    assert.match(html, /<link rel="icon" href="\/favicon\.svg"/);
    assert.match(html, /<script type="application\/ld\+json"[^>]*>\{"@context":"https:\/\/schema\.org"/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${pathname} h1 count`);
    for (const image of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(image[0], /\balt="[^"]*"/, `${pathname} image alt`);
      assert.match(image[0], /\bsrc="[^"]+"/, `${pathname} image must have a src`);
    }
    assert.match(html, /<a class="nav-resume" href="\/assets\/Aden_Ramirez_Resume\.pdf" data-resume-open>Resume<\/a>/, `${pathname} resume link works without JavaScript`);
    assert.match(html, /<footer[\s\S]*href="tel:\+19152407882"[\s\S]*<\/footer>/, `${pathname} footer phone`);
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
  const response = await fetch(`${origin}/assets/aden-headshot.jpg`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  const bytes = (await response.arrayBuffer()).byteLength;
  assert.ok(bytes > 50000 && bytes < 400000, `headshot should stay light for phones (${bytes} bytes)`);
  const icon = await fetch(`${origin}/assets/apple-touch-icon.png`);
  assert.equal(icon.status, 200);
  assert.equal(icon.headers.get("content-type"), "image/png");
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
  const llmsText = await llms.text();
  assert.match(llmsText, /^# Aden Ramirez\n/);
  assert.match(llmsText, /\[Relay\]\(http:\/\/127\.0\.0\.1:3199\/projects\/relay\)/);
  assert.match(llmsText, /First-generation college student/);
  assert.match(llmsText, /\[Hello, world\]\(http:\/\/127\.0\.0\.1:3199\/writing\/hello-world\)/);
  assert.doesNotMatch(llmsText, /Secret draft/);
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
  assert.match(card, /TEL;TYPE=CELL:\+19152407882/);  assert.match(card, /^N:Ramirez;Aden;;;\r?$/m);
  assert.match(card, /ORG:The University of Texas at El Paso/);
  assert.match(card, /X-SOCIALPROFILE;TYPE=linkedin:https:\/\/www\.linkedin\.com\/in\/aden-ramirez-cs\//);
});

test("serves a phone-first convention card with one-tap actions", async () => {
  const response = await fetch(`${origin}/shpe`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>SHPE 2026 Quick Card \| Aden Ramirez<\/title>/);
  assert.match(html, /href="\/assets\/Aden_Ramirez_Resume\.pdf" download/);
  assert.match(html, /href="\/contact\.vcf" download/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/aden-ramirez-cs\/"/);
  assert.match(html, /href="mailto:adeemra@gmail\.com\?subject=Great%20meeting%20you%20at%20SHPE%202026"/);
  assert.match(html, /href="sms:\+19152407882"/);
  assert.match(html, /href="tel:\+19152407882"/);
  for (const slug of ["relay", "cohortcove", "sentinel"]) assert.match(html, new RegExp(`href="/projects/${slug}"`));
  const { repos } = await (await fetch(`${origin}/api/projects`)).json();
  for (const slug of ["relay", "cohortcove", "sentinel"]) {
    const project = repos.find((item) => item.slug === slug);
    const codeLink = new RegExp(`<a class="text-link" href="https://github\\.com/adeelone/${slug}"[^>]*>Code`);
    if (project.url) assert.match(html, codeLink, `${slug} code link`); else assert.doesNotMatch(html, codeLink, `${slug} is private`);
  }
  assert.match(html, /First-generation college student/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /<loc>http:\/\/127\.0\.0\.1:3199\/shpe<\/loc>/);
});

test("shows the convention banner only until the event ends", () => {
  const profile = { event: { short_name: "SHPE 2026", place: "Indianapolis", banner_until: "2026-11-01T05:00:00Z" } };
  assert.match(eventBanner(profile, new Date("2026-10-29T15:00:00Z")), /href="\/shpe"/);
  assert.match(eventBanner(profile, new Date("2026-10-29T15:00:00Z")), /href="\/assets\/Aden_Ramirez_Resume\.pdf" download[\s\S]*href="\/contact\.vcf" download/);
  assert.equal(eventBanner(profile, new Date("2026-11-01T05:00:00Z")), "");
  assert.equal(eventBanner({}, new Date("2026-10-29T15:00:00Z")), "");
});

test("surfaces SHPE, ColorStack, and first-gen on home and about", async () => {
  for (const pathname of ["/", "/about"]) {
    const html = await (await fetch(`${origin}${pathname}`)).text();
    assert.match(html, /<p class="affiliations">SHPE Research Technical Specialist · ColorStack Technical Officer · Hispanic Scholarship Fund Scholar · First-generation college student<\/p>/, pathname);
  }
  assert.match(await (await fetch(`${origin}/`)).text(), /<section class="contact-callout">[\s\S]*href="tel:\+19152407882"/);
});

test("project data has one entry per slug", async () => {
  const { repos } = await (await fetch(`${origin}/api/projects`)).json();
  const slugs = repos.map((project) => project.slug);
  assert.deepEqual(slugs.filter((slug, index) => slugs.indexOf(slug) !== index), []);
});

test("publishes posts but never drafts, with feed, sitemap, nav, and structured data", async () => {
  const index = await fetch(`${origin}/writing`);
  assert.equal(index.status, 200);
  const indexHtml = await index.text();
  assert.match(indexHtml, /href="\/writing\/hello-world"/);
  assert.doesNotMatch(indexHtml, /Secret draft/);
  assert.match(indexHtml, /<nav id="nav"[\s\S]*<a href="\/writing">Writing<\/a>[\s\S]*<\/nav>/);
  assert.match(indexHtml, /<link rel="alternate" type="application\/rss\+xml"/);
  const post = await fetch(`${origin}/writing/hello-world`);
  assert.equal(post.status, 200);
  const postHtml = await post.text();
  assert.match(postHtml, /<title>Hello, world \| Aden Ramirez<\/title>/);
  assert.match(postHtml, /<meta property="og:type" content="article"/);
  const article = JSON.parse(postHtml.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/)[1])["@graph"].find((node) => node["@type"] === "BlogPosting");
  assert.equal(article.headline, "Hello, world");
  assert.equal(article.datePublished, "2026-11-02");
  assert.match(postHtml, /<h2>Why it exists<\/h2>/);
  assert.doesNotMatch(postHtml, /<script>alert/);
  assert.equal((await fetch(`${origin}/writing/secret-draft`)).status, 404);
  assert.equal((await fetch(`${origin}/writing/not-a-post`)).status, 404);
  const feed = await fetch(`${origin}/feed.xml`);
  assert.match(feed.headers.get("content-type"), /application\/rss\+xml/);
  const feedText = await feed.text();
  assert.match(feedText, /<link>http:\/\/127\.0\.0\.1:3199\/writing\/hello-world<\/link>/);
  assert.doesNotMatch(feedText, /secret-draft/);
  const sitemapText = await (await fetch(`${origin}/sitemap.xml`)).text();
  assert.match(sitemapText, /<loc>http:\/\/127\.0\.0\.1:3199\/writing\/hello-world<\/loc><lastmod>2026-11-02<\/lastmod>/);
  assert.match(sitemapText, /<loc>http:\/\/127\.0\.0\.1:3199\/projects\/relay<\/loc><lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.doesNotMatch(sitemapText, /secret-draft/);
});

test("renders a safe Markdown subset", () => {
  const html = markdownToHtml("Hi `<b>` **x** [ok](https://a.dev) [no](javascript:alert(1)) [rel](/work)\n\n<script>alert(1)</script>\n\n```\n<i>\n```");
  assert.match(html, /<code>&lt;b&gt;<\/code>/);
  assert.match(html, /<strong>x<\/strong>/);
  assert.match(html, /<a href="https:\/\/a\.dev" target="_blank" rel="noopener noreferrer">ok<\/a>/);
  assert.match(html, /<a href="\/work">rel<\/a>/);
  assert.doesNotMatch(html, /href="javascript/i);
  assert.doesNotMatch(html, /<script|<i>/);
  assert.match(html, /<pre><code>&lt;i&gt;<\/code><\/pre>/);
});

test("hides /writing entirely until a post is published", async () => {
  const posts = await loadPosts(path.join(__dirname, "..", "posts"));
  assert.deepEqual(posts.filter((post) => post.draft), []);
  if (!posts.length) assert.match(renderPage("/writing", { }, [], posts), /That page isn't here/);
});

test("home page targets the name keyword and Person schema", async () => {
  const html = await (await fetch(`${origin}/`)).text();
  assert.match(html, /<title>Aden Ramirez \| Software Engineer, UTEP CS, ex-Google STEP<\/title>/);
  const data = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/)[1]);
  const types = data["@graph"].map((node) => node["@type"]);
  assert.deepEqual(types, ["Person", "WebSite", "ProfilePage"]);
  assert.equal(data["@graph"][2].mainEntity["@id"], data["@graph"][0]["@id"]);
  assert.ok(data["@graph"][0].sameAs.includes("https://www.linkedin.com/in/aden-ramirez-cs/"));
  assert.doesNotMatch(html, /google-site-verification/, "no empty verification tag");
  const image = await fetch(`${origin}/assets/og-image.jpg`);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/jpeg");
});
