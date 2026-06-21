const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const uploadsDir = path.join(rootDir, "assets", "uploads");
const profilePath = path.join(dataDir, "profile.json");
const projectsPath = path.join(dataDir, "projects.json");
const submissionsPath = path.join(dataDir, "submissions.json");
const loginEventsPath = path.join(dataDir, "login-events.json");
const port = Number(process.env.PORT || 3000);
const alertWebhookUrl = process.env.OWNER_LOGIN_ALERT_WEBHOOK_URL || "";

const sessionCookieName = "aden_session";
const sessionStore = new Map();
const sessionTtlMs = 1000 * 60 * 60 * 12;

const allowedEmailHashes = new Set([
  "59795ed154274b4e3b71016ed8a5546f981d03b321269f4d506644b449f58b0c"
]);

const allowedCodeHashes = new Set([
  "5dab66f7acd97a490f29037436f6a973c9c7178103914f2c8c7447e37db716f0"
]);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function ensureWithinRoot(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(path.resolve(rootDir))) {
    throw new Error("Path escapes workspace root.");
  }
  return resolved;
}

async function ensureDataFiles() {
  await fsp.mkdir(uploadsDir, { recursive: true });
  if (!fs.existsSync(submissionsPath)) {
    await fsp.writeFile(submissionsPath, JSON.stringify({ submissions: [] }, null, 2) + "\n", "utf8");
  }
  if (!fs.existsSync(loginEventsPath)) {
    await fsp.writeFile(loginEventsPath, JSON.stringify({ events: [] }, null, 2) + "\n", "utf8");
  }
}

function parseCookies(header = "") {
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const index = cookie.indexOf("=");
      if (index === -1) return acc;
      const key = cookie.slice(0, index).trim();
      const value = cookie.slice(index + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

async function readJsonFile(filePath) {
  return JSON.parse(await fsp.readFile(filePath, "utf8"));
}

async function writeJsonFile(filePath, payload) {
  await fsp.writeFile(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

async function recordLoginEvent(email, req) {
  const file = await readJsonFile(loginEventsPath);
  const event = {
    id: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString(),
    ip: req.socket?.remoteAddress || "",
    userAgent: req.headers["user-agent"] || ""
  };
  file.events = [event, ...(file.events || [])].slice(0, 200);
  await writeJsonFile(loginEventsPath, file);

  if (alertWebhookUrl) {
    try {
      await fetch(alertWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "owner_login",
          event
        })
      });
    } catch {
      // Best-effort alert hook only.
    }
  }
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[sessionCookieName];
  if (!token) return null;
  const session = sessionStore.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return null;
  }
  return { token, ...session };
}

function requireAuth(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, { error: "Owner authentication required." });
    return null;
  }
  return session;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/profile") {
    sendJson(res, 200, await readJsonFile(profilePath));
    return true;
  }

  if (req.method === "GET" && pathname === "/api/projects") {
    sendJson(res, 200, await readJsonFile(projectsPath));
    return true;
  }

  if (req.method === "GET" && pathname === "/api/auth/session") {
    sendJson(res, 200, { authenticated: Boolean(getSession(req)) });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readJsonBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();

    const emailValid = allowedEmailHashes.has(sha256(email));
    const codeValid = allowedCodeHashes.has(sha256(code));

    if (!emailValid || !codeValid) {
      sendJson(res, 401, { error: "That email and code combination did not match." });
      return true;
    }

    const token = crypto.randomBytes(24).toString("hex");
    sessionStore.set(token, {
      email,
      expiresAt: Date.now() + sessionTtlMs
    });
    await recordLoginEvent(email, req);

    sendJson(
      res,
      200,
      { authenticated: true },
      {
        "Set-Cookie": `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionTtlMs / 1000}`
      }
    );
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    const session = getSession(req);
    if (session) sessionStore.delete(session.token);
    sendJson(
      res,
      200,
      { authenticated: false },
      {
        "Set-Cookie": `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
      }
    );
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/profile") {
    if (!requireAuth(req, res)) return true;
    const body = await readJsonBody(req);
    await writeJsonFile(profilePath, body);
    sendJson(res, 200, body);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/upload/resume") {
    if (!requireAuth(req, res)) return true;
    const body = await readJsonBody(req);
    const filename = String(body.filename || "resume.pdf");
    const contentBase64 = String(body.contentBase64 || "");

    if (!contentBase64) {
      sendJson(res, 400, { error: "Missing file content." });
      return true;
    }

    const ext = path.extname(filename).toLowerCase() || ".pdf";
    if (ext !== ".pdf") {
      sendJson(res, 400, { error: "Only PDF resumes are supported." });
      return true;
    }

    const safeBase = path.basename(filename, ext).replace(/[^a-z0-9-_]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "resume";
    const stampedName = `${safeBase}-${Date.now()}.pdf`;
    const targetPath = ensureWithinRoot(path.join(uploadsDir, stampedName));
    const bytes = Buffer.from(contentBase64, "base64");

    await fsp.writeFile(targetPath, bytes);

    const profile = await readJsonFile(profilePath);
    profile.resume = `assets/uploads/${stampedName}`;
    await writeJsonFile(profilePath, profile);

    sendJson(res, 200, { resume: profile.resume });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/submissions") {
    if (!requireAuth(req, res)) return true;
    sendJson(res, 200, await readJsonFile(submissionsPath));
    return true;
  }

  if (req.method === "GET" && pathname === "/api/login-events") {
    if (!requireAuth(req, res)) return true;
    sendJson(res, 200, await readJsonFile(loginEventsPath));
    return true;
  }

  if (req.method === "POST" && pathname === "/api/submissions") {
    const body = await readJsonBody(req);
    if (!body.name || !body.email || !body.message || !body.topic) {
      sendJson(res, 400, { error: "Name, email, topic, and message are required." });
      return true;
    }

    const file = await readJsonFile(submissionsPath);
    const next = {
      id: crypto.randomUUID(),
      name: String(body.name).trim(),
      company: String(body.company || "").trim(),
      email: String(body.email).trim(),
      link: String(body.link || "").trim(),
      topic: String(body.topic).trim(),
      timeline: String(body.timeline || "").trim(),
      message: String(body.message).trim(),
      createdAt: new Date().toISOString()
    };

    file.submissions = [next, ...(file.submissions || [])].slice(0, 200);
    await writeJsonFile(submissionsPath, file);
    sendJson(res, 201, { ok: true, submission: next });
    return true;
  }

  return false;
}

async function serveStatic(res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const targetPath = ensureWithinRoot(path.join(rootDir, requestedPath));
  let stats;

  try {
    stats = await fsp.stat(targetPath);
  } catch {
    sendText(res, 404, "Not found");
    return;
  }

  const filePath = stats.isDirectory() ? path.join(targetPath, "index.html") : targetPath;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  try {
    const content = await fsp.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    sendText(res, 404, "Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    await ensureDataFiles();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, pathname);
      if (!handled) sendJson(res, 404, { error: "API route not found." });
      return;
    }

    await serveStatic(res, pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error." });
  }
});

server.listen(port, () => {
  console.log(`Portfolio server running at http://127.0.0.1:${port}`);
});
