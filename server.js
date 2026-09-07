const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { escapeHtml, metaForPath, renderPage, structuredDataForPath, publicRepos, projectArtSlugs } = require("./render");

const rootDir = __dirname;
const port = Number(process.env.PORT) || 3000;
const configuredSiteUrl = String(process.env.SITE_URL || "").replace(/\/+$/, "");
const profilePath = path.join(rootDir, "data", "profile.json");
const projectsPath = path.join(rootDir, "data", "projects.json");
const publicFiles = new Map([
  ["/styles.css", path.join(rootDir, "styles.css")],
  ["/polish.css", path.join(rootDir, "polish.css")],
  ["/client.js", path.join(rootDir, "client.js")],
  ["/snake.js", path.join(rootDir, "snake.js")],
  ["/play.js", path.join(rootDir, "play.js")],
  ["/favicon.svg", path.join(rootDir, "favicon.svg")],
  ["/llms.txt", path.join(rootDir, "llms.txt")],
  ["/assets/aden-headshot.png", path.join(rootDir, "assets", "aden-headshot.png")],
  ["/assets/project-sentinel.png", path.join(rootDir, "assets", "project-sentinel.png")],
  ["/assets/project-cardforge.png", path.join(rootDir, "assets", "project-cardforge.png")],
  ["/assets/project-dominion.png", path.join(rootDir, "assets", "project-dominion.png")],
  ["/assets/resume-technical-preview.png", path.join(rootDir, "assets", "resume-technical-preview.png")],
  ["/assets/resume-general-preview.png", path.join(rootDir, "assets", "resume-general-preview.png")],
  ["/assets/Aden_Ramirez_Resume.pdf", path.join(rootDir, "assets", "Aden_Ramirez_Resume.pdf")],
  ["/assets/Aden_Ramirez_Resume_General.pdf", path.join(rootDir, "assets", "Aden_Ramirez_Resume_General.pdf")]
]);
for (const slug of projectArtSlugs) publicFiles.set(`/assets/project-${slug}.png`, path.join(rootDir, "assets", `project-${slug}.png`));
const mimeTypes = { ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf" };

function securityHeaders(type, cache = "no-cache") {
  const headers = {
    "Content-Type": type,
    "Cache-Control": cache,
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin"
  };
  if (process.env.NODE_ENV === "production") headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  return headers;
}

function send(res, status, body, type = "text/plain; charset=utf-8", cache) {
  res.writeHead(status, securityHeaders(type, cache));
  if (res.req?.method === "HEAD") return res.end();
  res.end(body);
}

function sendJson(res, status, value) {
  send(res, status, JSON.stringify(value), "application/json; charset=utf-8", "public, max-age=300");
}

function redirect(res, status, location) {
  res.writeHead(status, { ...securityHeaders("text/plain; charset=utf-8"), Location: location });
  res.end();
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function renderApp(pathname, origin, preloaded = {}) {
  const [template, profile, projects] = await Promise.all([fs.readFile(path.join(rootDir, "index.html"), "utf8"), preloaded.profile || readJson(profilePath), preloaded.projects || readJson(projectsPath)]);
  const meta = metaForPath(pathname, projects.repos);
  const canonicalPath = pathname === "/experience" ? "/jobs" : pathname;
  const canonical = `${origin}${canonicalPath === "/" ? "" : canonicalPath}`;
  return template
    .replaceAll("{{TITLE}}", escapeHtml(meta.title))
    .replaceAll("{{DESCRIPTION}}", escapeHtml(meta.description))
    .replaceAll("{{ROBOTS_META}}", meta.found ? "index, follow" : "noindex, follow")
    .replaceAll("{{CANONICAL}}", escapeHtml(canonical))
    .replaceAll("{{SITE_URL}}", escapeHtml(origin))
    .replace("{{STRUCTURED_DATA}}", structuredDataForPath(canonicalPath, origin, profile, meta))
    .replace("{{PAGE_SCRIPT}}", pathname === "/play" ? '<script src="/snake.js?v=1" defer></script><script src="/play.js?v=1" defer></script>' : "")
    .replace("{{CONTENT}}", renderPage(pathname, profile, projects.repos));
}

async function sitemap(req) {
  const projects = await readJson(projectsPath);
  const origin = configuredSiteUrl || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || "127.0.0.1"}`;
  const paths = ["/", "/work", "/jobs", "/education", "/about", "/contact", ...publicRepos(projects.repos).filter((project) => project.slug).map((project) => `/projects/${project.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((item) => `<url><loc>${origin}${item}</loc></url>`).join("")}</urlset>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/\/+$/, "") || "/";
    if (!["GET", "HEAD"].includes(req.method)) return sendJson(res, 405, { error: "Method not allowed." });
    const requestHost = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
    if (configuredSiteUrl && process.env.NODE_ENV === "production" && /\.vercel\.app(?::\d+)?$/i.test(requestHost) && !configuredSiteUrl.includes(requestHost)) {
      return redirect(res, 308, `${configuredSiteUrl}${pathname === "/" ? "" : pathname}`);
    }
    if (pathname === "/api/health") return sendJson(res, 200, { ok: true });
    if (pathname === "/api/profile") return sendJson(res, 200, await readJson(profilePath));
    if (pathname === "/api/projects") return sendJson(res, 200, await readJson(projectsPath));
    if (pathname === "/robots.txt") {
      const origin = configuredSiteUrl || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || "127.0.0.1"}`;
      const agents = ["*", "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
      const body = `${agents.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n")}\n\nSitemap: ${origin}/sitemap.xml\n`;
      return send(res, 200, body, "text/plain; charset=utf-8", "public, max-age=86400");
    }
    if (pathname === "/sitemap.xml") return send(res, 200, await sitemap(req), "application/xml; charset=utf-8", "public, max-age=3600");
    if (pathname === "/contact.vcf") {
      const profile = await readJson(profilePath);
      const card = ["BEGIN:VCARD", "VERSION:3.0", `FN:${profile.name}`, `EMAIL;TYPE=INTERNET:${profile.email}`, `EMAIL;TYPE=INTERNET:${profile.school_email}`, `TEL;TYPE=CELL:${profile.phone_href.replace("tel:", "")}`, `URL:${profile.linkedin}`, `NOTE:Portfolio ${configuredSiteUrl || ""}`, "END:VCARD"].join("\r\n");
      return send(res, 200, card, "text/vcard; charset=utf-8", "public, max-age=3600");
    }
    if (publicFiles.has(pathname)) {
      const file = publicFiles.get(pathname);
      const cache = [".js", ".css"].includes(path.extname(file)) ? "no-cache" : "public, max-age=86400";
      return send(res, 200, await fs.readFile(file), mimeTypes[path.extname(file)] || "application/octet-stream", cache);
    }
    if (pathname.startsWith("/assets/") || pathname.startsWith("/data/") || pathname.startsWith("/.git") || pathname.includes(".")) return send(res, 404, "Not found");
    const origin = configuredSiteUrl || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || "127.0.0.1"}`;
    if (pathname === "/experience") return redirect(res, 308, `${origin}/jobs`);
    if (["/", "/work", "/jobs", "/experience", "/education", "/about", "/contact", "/play"].includes(pathname)) {
      return send(res, 200, await renderApp(pathname, origin), "text/html; charset=utf-8");
    }
    if (/^\/projects\/[a-z0-9-]+$/i.test(pathname)) {
      const projects = await readJson(projectsPath);
      const slug = pathname.split("/")[2];
      const status = projects.repos.some((project) => project.slug === slug) ? 200 : 404;
      return send(res, status, await renderApp(pathname, origin, { projects }), "text/html; charset=utf-8");
    }
    return send(res, 404, await renderApp(pathname, origin), "text/html; charset=utf-8");
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "Internal server error." });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`Portfolio server running on port ${port}`));

function shutdown(signal) {
  console.log(`${signal} received, closing server.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
