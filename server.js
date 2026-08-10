const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const rootDir = __dirname;
const port = Number(process.env.PORT || 3000);
const configuredSiteUrl = String(process.env.SITE_URL || "").replace(/\/+$/, "");
const profilePath = path.join(rootDir, "data", "profile.json");
const projectsPath = path.join(rootDir, "data", "projects.json");
const publicFiles = new Map([
  ["/styles.css", path.join(rootDir, "styles.css")],
  ["/polish.css", path.join(rootDir, "polish.css")],
  ["/script.js", path.join(rootDir, "script.js")],
  ["/assets/aden-profile.jpg", path.join(rootDir, "assets", "aden-profile.jpg")],
  ["/assets/aden-headshot.png", path.join(rootDir, "assets", "aden-headshot.png")],
  ["/assets/project-sentinel.png", path.join(rootDir, "assets", "project-sentinel.png")],
  ["/assets/project-cardforge.png", path.join(rootDir, "assets", "project-cardforge.png")],
  ["/assets/project-dominion.png", path.join(rootDir, "assets", "project-dominion.png")],
  ["/assets/resume-technical-preview.png", path.join(rootDir, "assets", "resume-technical-preview.png")],
  ["/assets/resume-general-preview.png", path.join(rootDir, "assets", "resume-general-preview.png")],
  ["/assets/profile.jpg", path.join(rootDir, "assets", "profile.jpg")],
  ["/assets/Aden_Ramirez_Resume.pdf", path.join(rootDir, "assets", "Aden_Ramirez_Resume.pdf")],
  ["/assets/Aden_Ramirez_Resume_General.pdf", path.join(rootDir, "assets", "Aden_Ramirez_Resume_General.pdf")]
]);
const mimeTypes = { ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf" };

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

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function displayName(value = "") {
  return String(value).replace(/^./, (letter) => letter.toUpperCase());
}

function metaForPath(pathname, projects) {
  const fallback = {
    title: "Aden Ramirez | Software Engineer",
    description: "Aden Ramirez is a computer science student and software engineer building careful backend, systems, and full-stack projects."
  };
  if (pathname === "/work") return { title: "Work | Aden Ramirez", description: "Projects, experiments, and systems built by Aden Ramirez." };
  if (pathname === "/jobs" || pathname === "/experience") return { title: "Jobs | Aden Ramirez", description: "The complete employment history of Aden Ramirez, including engineering, education, service, sales, and customer-support work." };
  if (pathname === "/education") return { title: "Education | Aden Ramirez", description: "Aden Ramirez's computer science education at UTEP, including mathematics, coursework, honors, and current studies." };
  if (pathname === "/about") return { title: "About | Aden Ramirez", description: "About Aden Ramirez, a UTEP computer science student and software engineer in El Paso." };
  if (pathname === "/contact") return { title: "Contact | Aden Ramirez", description: "Contact Aden Ramirez about software engineering internships, technical work, projects, referrals, and collaboration." };
  const match = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (!match) return fallback;
  const project = projects.repos.find((item) => item.slug === match[1]);
  if (!project) return fallback;
  return { title: `${displayName(project.name)} | Aden Ramirez`, description: project.description || `A project by Aden Ramirez: ${project.name}.` };
}

async function renderApp(pathname, origin) {
  const [template, projects] = await Promise.all([fs.readFile(path.join(rootDir, "index.html"), "utf8"), readJson(projectsPath)]);
  const meta = metaForPath(pathname, projects);
  return template
    .replaceAll("{{TITLE}}", escapeHtml(meta.title))
    .replaceAll("{{DESCRIPTION}}", escapeHtml(meta.description))
    .replaceAll("{{CANONICAL}}", escapeHtml(`${origin}${pathname === "/" ? "" : pathname}`))
    .replaceAll("{{SITE_URL}}", escapeHtml(origin));
}

async function sitemap(req) {
  const projects = await readJson(projectsPath);
  const origin = configuredSiteUrl || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host || "127.0.0.1"}`;
  const paths = ["/", "/work", "/jobs", "/education", "/about", "/contact", ...projects.repos.filter((project) => project.slug && project.slug !== "portfolio-site").map((project) => `/projects/${project.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((item) => `<url><loc>${origin}${item}</loc></url>`).join("")}</urlset>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/\/+$/, "") || "/";
    if (!["GET", "HEAD"].includes(req.method)) return sendJson(res, 405, { error: "Method not allowed." });
    if (pathname === "/api/health") return sendJson(res, 200, { ok: true });
    if (pathname === "/api/profile") return sendJson(res, 200, await readJson(profilePath));
    if (pathname === "/api/projects") return sendJson(res, 200, await readJson(projectsPath));
    if (pathname === "/robots.txt") return send(res, 200, "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n", "text/plain; charset=utf-8", "public, max-age=86400");
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
    if (["/", "/work", "/jobs", "/experience", "/education", "/about", "/contact"].includes(pathname)) {
      return send(res, 200, await renderApp(pathname, origin), "text/html; charset=utf-8");
    }
    if (/^\/projects\/[a-z0-9-]+$/i.test(pathname)) {
      const projects = await readJson(projectsPath);
      const slug = pathname.split("/")[2];
      if (!projects.repos.some((project) => project.slug === slug)) return send(res, 404, "Not found");
      return send(res, 200, await renderApp(pathname, origin), "text/html; charset=utf-8");
    }
    return send(res, 404, "Not found");
  } catch {
    return sendJson(res, 500, { error: "Internal server error." });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`Portfolio server running on port ${port}`));

module.exports = { server, escapeHtml, metaForPath };
