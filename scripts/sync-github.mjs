import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "data");
const OWNER = "adeelone";
const NON_DISPLAY_LANGUAGES = new Set(["Makefile", "Dockerfile", "HCL", "PowerShell"]);

function gh(args) {
  return execFileSync("gh", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
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

function repoDescription(repo, highlights) {
  if (repo.description?.trim()) return repo.description.trim();
  if (highlights?.length) return highlights[0];
  const readme = previewReadme(OWNER, repo.name).find((line) => line.trim() && !line.startsWith("#"));
  return readme?.trim() ?? "";
}

function main() {
  ensureDir(DATA_DIR);

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
      screenshot: null,
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

  const projectsPath = join(DATA_DIR, "projects.json");
  const currentProjects = readJson(projectsPath, {});
  const reposChanged = JSON.stringify(currentProjects.repos) !== JSON.stringify(repos);
  if (!reposChanged && currentProjects.generated_at) return;
  writeJson(projectsPath, {
    generated_at: new Date().toISOString(),
    repos
  });
}

main();
