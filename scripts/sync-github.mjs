import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data");
const ASSET_DIR = join(ROOT, "assets", "projects");
const OWNER = "adeelone";
const NON_DISPLAY_LANGUAGES = new Set(["Makefile", "Dockerfile", "HCL", "PowerShell"]);

function gh(args) {
  return execFileSync("gh", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function ghBuffer(args) {
  return execFileSync("gh", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
}

function safeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseTopics(repositoryTopics) {
  return (repositoryTopics ?? []).map((topic) => topic.name).filter(Boolean);
}

function parseLanguages(languages) {
  return (languages ?? []).map((entry) => entry?.node?.name).filter(Boolean);
}

function topTags(repo) {
  const languageTags = parseLanguages(repo.languages).filter((name) => !NON_DISPLAY_LANGUAGES.has(name));
  const tags = [...languageTags, ...parseTopics(repo.repositoryTopics)];
  return [...new Set(tags)].slice(0, 5);
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findHighlights(repoName, highlightsByName) {
  const exact = highlightsByName[repoName];
  if (exact) return exact;

  const normalized = normalizeName(repoName);
  for (const [key, value] of Object.entries(highlightsByName)) {
    if (normalizeName(key) === normalized) return value;
  }
  return [];
}

function previewReadme(owner, repo) {
  try {
    const content = gh(["api", `/repos/${owner}/${repo}/readme`, "--jq", ".content"]);
    const decoded = Buffer.from(content.trim(), "base64").toString("utf8");
    return decoded.split(/\r?\n/).slice(0, 60);
  } catch {
    return [];
  }
}

function graphqlPinned() {
  const query = [
    "query($owner:String!) {",
    "  user(login:$owner) {",
    "    pinnedItems(first: 6, types: REPOSITORY) {",
    "      nodes {",
    "        ... on Repository { name }",
    "      }",
    "    }",
    "  }",
    "}"
  ].join("\n");

  try {
    const raw = gh(["api", "graphql", "-f", `query=${query}`, "-F", `owner=${OWNER}`]);
    const json = JSON.parse(raw);
    return new Set((json.data?.user?.pinnedItems?.nodes ?? []).map((node) => node.name));
  } catch {
    return new Set();
  }
}

function repoContents(path) {
  try {
    const raw = gh(["api", path]);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function downloadFile(apiPath, outPath) {
  ensureDir(dirname(outPath));
  const data = ghBuffer(["api", apiPath]);
  writeFileSync(outPath, data);
  return outPath;
}

function pickReadmeScreenshot(readmeLines) {
  for (const line of readmeLines) {
    const markdownImage = line.match(/!\[[^\]]*]\(([^)]+)\)/);
    if (!markdownImage) continue;
    const url = markdownImage[1];
    if (/badge|shields\.io|actions\/workflows/i.test(url)) continue;
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(url)) {
      return url.replace(/^<|>$/g, "");
    }
  }
  return null;
}

async function maybeDownloadScreenshot(repo, readmeLines) {
  const repoDir = join(ASSET_DIR, safeSlug(repo.name));
  ensureDir(repoDir);
  const directReadmeImage = pickReadmeScreenshot(readmeLines);

  if (directReadmeImage) {
    if (/^https?:\/\//i.test(directReadmeImage)) {
      if (!/raw\.githubusercontent\.com|githubusercontent\.com/i.test(directReadmeImage)) {
        return null;
      }
      const ext = extname(new URL(directReadmeImage).pathname) || ".png";
      const outPath = join(repoDir, `cover${ext}`);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(directReadmeImage, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${directReadmeImage}`);
        }
        const data = Buffer.from(await response.arrayBuffer());
        writeFileSync(outPath, data);
        return `assets/projects/${safeSlug(repo.name)}/${basename(outPath)}`;
      } catch {
        return null;
      }
    }

    const cleanPath = directReadmeImage.replace(/^\.\//, "");
    const apiPath = `/repos/${OWNER}/${repo.name}/contents/${cleanPath}?ref=${repo.defaultBranchRef?.name ?? "main"}`;
    const ext = extname(cleanPath) || ".png";
    const outPath = join(repoDir, `cover${ext}`);
    try {
      downloadFile(apiPath, outPath);
      return `assets/projects/${safeSlug(repo.name)}/${basename(outPath)}`;
    } catch {
      // fall through
    }
  }

  for (const dirName of ["docs", "assets", "screenshots"]) {
    const listing = repoContents(`/repos/${OWNER}/${repo.name}/contents/${dirName}?ref=${repo.defaultBranchRef?.name ?? "main"}`);
    if (!Array.isArray(listing)) continue;
    const file = listing.find((entry) => entry.type === "file" && /\.(png|jpe?g|webp|gif|svg)$/i.test(entry.name));
    if (!file) continue;
    const outPath = join(repoDir, file.name);
    try {
      downloadFile(`/repos/${OWNER}/${repo.name}/contents/${dirName}/${file.name}?ref=${repo.defaultBranchRef?.name ?? "main"}`, outPath);
      return `assets/projects/${safeSlug(repo.name)}/${file.name}`;
    } catch {
      // try next directory
    }
  }

  return null;
}

function repoDescription(repo, highlights) {
  if (repo.description?.trim()) return repo.description.trim();
  if (highlights?.length) return highlights[0];
  const readme = previewReadme(OWNER, repo.name).find((line) => line.trim() && !line.startsWith("#"));
  return readme?.trim() ?? "";
}

async function main() {
  ensureDir(DATA_DIR);
  ensureDir(ASSET_DIR);

  const highlightsByName = readJson(join(DATA_DIR, "highlights.json"), {});
  const privateProjects = readJson(join(DATA_DIR, "private-projects.json"), []);
  const repoList = JSON.parse(
    gh([
      "repo",
      "list",
      OWNER,
      "--limit",
      "100",
      "--json",
      "name,description,url,homepageUrl,stargazerCount,forkCount,primaryLanguage,languages,repositoryTopics,pushedAt,updatedAt,isFork,isArchived,isPrivate,visibility,defaultBranchRef,latestRelease"
    ])
  );
  const pinned = graphqlPinned();

  const repos = [];
  const filteredRepos = repoList.filter((repo) => !repo.isFork && !repo.isArchived && !repo.isPrivate && repo.visibility === "PUBLIC");

  for (const repo of filteredRepos) {
      const readmeLines = previewReadme(OWNER, repo.name);
      const curatedHighlights = findHighlights(repo.name, highlightsByName);
      const screenshot = await maybeDownloadScreenshot(repo, readmeLines);

      repos.push({
        name: repo.name,
        slug: safeSlug(repo.name),
        url: repo.url,
        homepage: repo.homepageUrl || null,
        description: repoDescription(repo, curatedHighlights),
        languages: parseLanguages(repo.languages),
        topics: parseTopics(repo.repositoryTopics),
        tech: topTags(repo),
        stars: repo.stargazerCount,
        pushed_at: repo.pushedAt,
        updated_at: repo.updatedAt,
        is_pinned: pinned.has(repo.name),
        is_private: false,
        is_archived: false,
        latest_release: repo.latestRelease?.tagName ?? null,
        screenshot,
        highlights: curatedHighlights,
        readme_preview: readmeLines
      });
  }

  repos.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });

  for (const project of privateProjects) {
    repos.push({
      slug: safeSlug(project.name),
      homepage: null,
      stars: 0,
      pushed_at: null,
      updated_at: null,
      is_pinned: false,
      is_archived: false,
      latest_release: null,
      screenshot: null,
      readme_preview: [],
      ...project
    });
  }

  writeJson(join(DATA_DIR, "projects.json"), {
    generated_at: new Date().toISOString(),
    repos
  });
}

await main();
