const fs = require("fs/promises");
const path = require("path");

function escape(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function inline(text) {
  const codes = [];
  let out = escape(text).replace(/`([^`]+)`/g, (_, code) => `\u0000${codes.push(code) - 1}\u0000`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) return label;
    return /^https?:\/\//i.test(href) ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>` : `<a href="${href}">${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, index) => `<code>${codes[Number(index)]}</code>`);
}

function markdownToHtml(markdown = "") {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      flush();
      const code = [];
      for (i += 1; i < lines.length && !/^```\s*$/.test(lines[i]); i += 1) code.push(lines[i]);
      html.push(`<pre><code${fence[1] ? ` class="language-${fence[1]}"` : ""}>${escape(code.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flush();
      const level = heading[1].length === 3 ? 3 : 2;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const list = line.match(/^(\s*)([-*]|\d+\.)\s+/);
    if (list) {
      flush();
      const ordered = /\d/.test(list[2]);
      const items = [];
      for (; i < lines.length && (ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/).test(lines[i]); i += 1) items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
      i -= 1;
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</${tag}>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      const quote = [];
      for (; i < lines.length && /^>\s?/.test(lines[i]); i += 1) quote.push(lines[i].replace(/^>\s?/, ""));
      i -= 1;
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }
    if (!line.trim()) flush();
    else paragraph.push(line.trim());
  }
  flush();
  return html.join("\n");
}

function parsePost(source, fileName) {
  const match = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${fileName}: missing front matter`);
  const meta = Object.fromEntries(match[1].split("\n").filter((line) => line.includes(":")).map((line) => {
    const index = line.indexOf(":");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
  }));
  const slug = meta.slug || fileName.replace(/\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${fileName}: slug must be lowercase words joined by hyphens`);
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date || "")) throw new Error(`${fileName}: title and date (YYYY-MM-DD) are required`);
  const body = match[2].trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title,
    date: meta.date,
    summary: meta.summary || "",
    draft: meta.draft === "true",
    readingMinutes: Math.max(1, Math.round(words / 230)),
    body,
    html: markdownToHtml(body)
  };
}

async function loadPosts(directory) {
  let files;
  try {
    files = (await fs.readdir(directory)).filter((file) => file.endsWith(".md") && file !== "README.md");
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const posts = await Promise.all(files.map(async (file) => parsePost(await fs.readFile(path.join(directory, file), "utf8"), file)));
  return posts.filter((post) => !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function feedXml(posts, origin, profile) {
  const items = posts.map((post) => `<item><title>${escape(post.title)}</title><link>${origin}/writing/${post.slug}</link><guid isPermaLink="true">${origin}/writing/${post.slug}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escape(post.summary)}</description></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escape(profile.name)}: Writing</title><link>${origin}/writing</link><description>Notes from ${escape(profile.name)} on building and shipping software.</description><language>en-us</language>${items}</channel></rss>`;
}

module.exports = { feedXml, loadPosts, markdownToHtml, parsePost };
