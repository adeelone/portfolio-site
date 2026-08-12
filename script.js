const state = { profile: null, projects: [], query: "", filter: "all" };
const root = document.querySelector("#content");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const safeUrl = (value) => { try { const url = new URL(value, location.origin); return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } };
const external = (url, label, className = "text-link") => url ? `<a class="${className}" href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>` : "";
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" }).format(new Date(value)) : "In progress";
const projectYear = (project) => project.pushed_at ? new Date(project.pushed_at).getFullYear() : "Private";
const projectStatus = (project) => project.is_private ? "Private work" : project.homepage ? "Live" : project.latest_release ? project.latest_release : "Repository";
const technologies = (project, limit = 6) => (project.tech || project.languages || []).filter(Boolean).slice(0, limit);
const projectHref = (project) => `/projects/${encodeURIComponent(project.slug)}`;
const displayName = (value = "") => String(value).replace(/^./, (letter) => letter.toUpperCase());
const plainText = (value = "") => String(value).replace(/\*\*|`/g, "").replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").trim();
const projectArtSlugs = ["sentinel", "cardforge", "dominion", "demiurge", "meridian", "weather-compare", "atlas", "reel", "stockpilot", "storygen", "volley", "relay", "myreadlist", "aurora", "compass", "medelite-report-gen", "price-deal-watcher", "chessgen", "leximatch", "simple-chess-game", "miner-eats", "nebula-stat-proto", "shpe-utep-website"];
const projectArtwork = Object.fromEntries(projectArtSlugs.map((slug) => [slug, `/assets/project-${slug}.png`]));
const projectLessons = {
  sentinel: "I learned that an ML demo becomes believable only when model evaluation, serving, drift visibility, and explanations are designed as one system. Accuracy by itself is not enough if nobody can understand or operate the result.",
  cardforge: "I learned how quickly a visual editor becomes a state-management problem. Keeping canvas changes, print dimensions, previews, exports, and browser navigation consistent mattered more than adding another design control.",
  dominion: "I learned that simulation features need a stable event model before they need more AI. Separating player intent, world-state transitions, and generated narrative made the system easier to test and kept the model from owning core game rules.",
  demiurge: "I learned that one event log can support very different scales of play when the domain boundaries are clear. Chronicle and Godhand could share history and consequences without forcing their interfaces or decision loops to be identical.",
  meridian: "I learned to treat search quality as a product decision, not just an API response. Query modes, citations, caching, saved collections, and exports all shape whether a result is actually useful after it is retrieved.",
  "weather-compare": "I learned that comparison tools work best when every location uses the same visual hierarchy and units. The hard part was not fetching weather data; it was making five cities understandable at a glance without hiding uncertainty or edge cases.",
  atlas: "I learned that generated plans should stay editable. Modeling booked anchors, flexible day items, budgets, packing, and calendar export separately made the itinerary useful after the first AI response instead of turning it into a static answer.",
  reel: "I learned that a personal database needs strong defaults and quiet interaction design. Discovery, tracking, ratings, and the decision of what to watch tonight have different jobs, so combining them required restraint rather than more controls.",
  stockpilot: "I learned to keep market data separate from portfolio accounting. A deterministic order engine and local persistence made paper trades reproducible even when quote providers, refresh timing, or network access changed.",
  storygen: "I learned that generative storytelling needs continuity constraints. Streaming progress made the wait feel shorter, but consistent characters, safe prompts, and a predictable four-scene structure were what made the finished story feel coherent.",
  volley: "I learned that game feel comes from many small systems agreeing with each other. Ball physics, input timing, particles, sound, scoring, and reset behavior each needed tuning before a simple Pong loop felt polished.",
  relay: "I learned that long-running AI work should not block the request that starts it. Decoupling intake, workers, provider adapters, status events, and results made failures visible and let each part scale or retry independently.",
  myreadlist: "I learned that browser-side extraction has to be conservative around somebody else's page structure. Clear parsing rules, useful exports, and graceful handling of missing fields mattered more than pretending every library page would look identical.",
  aurora: "I learned how much performance depends on object lifecycles in animation-heavy interfaces. Pooling particles, separating composition from rendering, and coordinating audio and capture tools kept the canvas responsive as scenes became more complex.",
  compass: "I learned that job matching should explain itself. Transparent keyword evidence, document parsing, and a visible application workflow were more trustworthy than presenting one unexplained AI score as the answer.",
  "medelite-report-gen": "I learned to separate authoritative public facility data from user-entered operational context. That boundary made the assessment easier to verify and kept the exported report clear about what came from CMS and what came from the operator.",
  "price-deal-watcher": "I learned that monitoring is mostly about normalization and failure handling. Products, travel, tickets, and custom checks expose different signals, so the useful abstraction was a durable observation and alert pipeline rather than one universal scraper.",
  chessgen: "I learned how much search improves when the algorithm can discard work safely. Alpha-beta pruning, move ordering, and legal-state validation made the engine responsive while preserving the same minimax decision logic.",
  leximatch: "I learned that a clean MVC boundary makes game rules easier to test and reuse. Keeping dictionary lookup, guess evaluation, difficulty rules, and interface code separate let the Java and browser versions share the same mental model.",
  "simple-chess-game": "I learned the value of modeling domain rules before wiring the interface. Piece behavior, legal moves, turns, and end states needed clear ownership so the Swing board could remain a view instead of becoming the game engine.",
  "miner-eats": "I learned the fundamentals of turning a small classroom idea into cooperating Java classes. Even this early project showed me why data models, control flow, and user-facing choices should not all live in one place.",
  "nebula-stat-proto": "I learned how to choose a narrow end-to-end slice under hackathon pressure. Connecting the React interface, Supabase data, analytics, and AI-assisted steps for a working demonstration was more valuable than leaving several ambitious flows half built.",
  "shpe-utep-website": "I learned that practical frontend work is often editorial and operational. Compressing leadership photos, reorganizing content, and loading media intentionally improved the real experience more than a visual redesign would have on its own."
};

function projectArt(project, featured = false) {
  if (projectArtwork[project.slug]) return `<img class="project-logo" src="${projectArtwork[project.slug]}" alt="Custom artwork for ${escapeHtml(displayName(project.name))}" loading="lazy">`;
  if (project.screenshot && safeUrl(project.screenshot)) return `<img src="${escapeHtml(project.screenshot)}" alt="Screenshot of ${escapeHtml(project.name)}" loading="lazy">`;
  const words = (project.readme_preview || []).filter((line) => line && !line.startsWith("#") && !line.startsWith("[")).slice(0, 4);
  return `<div class="project-art-fallback ${featured ? "is-featured" : ""}" aria-hidden="true"><span>${escapeHtml(displayName(project.name))}</span><pre>${escapeHtml(plainText(words.join("\n").slice(0, 280) || project.description || "A project still taking shape."))}</pre></div>`;
}

function projectActions(project) {
  return `<a class="text-link" href="${projectHref(project)}" data-link>Case study <span aria-hidden="true">→</span></a>${project.url ? external(project.url, "Code") : ""}${project.homepage ? external(project.homepage, "Live site") : ""}`;
}

function projectRow(project, featured = false) {
  return `<article class="project-row ${featured ? "featured" : "compact"}" data-project data-search="${escapeHtml([project.name, project.description, ...technologies(project, 20), ...(project.topics || [])].join(" ").toLowerCase())}" data-kinds="${escapeHtml(projectKinds(project).join(" "))}">
    ${featured ? `<a class="project-media" href="${projectHref(project)}" data-link aria-label="Read ${escapeHtml(project.name)} case study">${projectArt(project, true)}</a>` : ""}
    <div class="project-copy-block"><div class="project-heading"><h2><a href="${projectHref(project)}" data-link>${escapeHtml(displayName(project.name))}</a></h2><span>${projectYear(project)} · ${escapeHtml(projectStatus(project))}</span></div>
    <p>${escapeHtml(project.description || "A project, experiment, or learning build from my GitHub archive.")}</p>
    <div class="tech-line">${technologies(project).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
    <div class="project-actions">${projectActions(project)}</div></div>
  </article>`;
}

function projectKinds(project) {
  const haystack = [...technologies(project, 30), ...(project.topics || [])].join(" ").toLowerCase();
  const kinds = ["all"];
  if (project.homepage) kinds.push("live");
  if ((project.highlights || []).length || project.is_pinned) kinds.push("featured");
  if (/python|fastapi|java|node|sql|redis|docker|backend|api/.test(haystack)) kinds.push("backend");
  if (/typescript|javascript|react|html|css|next|vite|full.?stack/.test(haystack)) kinds.push("full-stack");
  if (/game|chess|wordle|minimax/.test(`${haystack} ${project.name} ${project.description}`.toLowerCase())) kinds.push("games");
  return kinds;
}

function homePage() {
  const profile = state.profile;
  const projects = state.projects.filter((project) => project.slug !== "portfolio-site");
  const preferred = ["sentinel", "cardforge", "dominion", "storygen", "atlas"];
  const selected = preferred.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean).slice(0, 3);
  const google = profile.experience.find((role) => /google/i.test(role.company));
  return `<section class="hero">
    <div class="hero-copy"><h1>Aden<br>Ramirez</h1><p class="hero-role">Software engineer and computer science student.</p><p class="hero-line">I build careful software for real people.</p><div class="hero-actions"><a class="button" href="/work" data-link>See my work <span aria-hidden="true">→</span></a><a class="text-link" href="mailto:${escapeHtml(profile.email)}">Say hello</a></div></div>
    <figure class="portrait"><img src="${escapeHtml(profile.hero_image.replace(/^assets/, "/assets"))}" alt="Aden Ramirez outdoors in San Francisco"><figcaption>Curious. Pragmatic. Detail-oriented. Human.</figcaption></figure>
  </section>
  <section class="selected-work section-rule"><div class="section-intro"><h2>A few things I've built.</h2><p>Recent systems and products where the interesting work lives in the details.</p></div>${selected.map((project) => projectRow(project, true)).join("")}<a class="button secondary" href="/work" data-link>Browse all ${projects.length} projects</a></section>
  <section class="proof section-rule"><div><h2>Software should hold up after the demo.</h2><p>I care about readable systems, useful interfaces, and the rollout work between “it runs” and “it is ready.”</p><p>Before and alongside engineering, I have also worked in education, customer support, retail, and food service. Every one of those jobs shaped how I communicate and show up for a team.</p></div><div class="proof-story"><span>${escapeHtml(google?.dates || "May–Aug 2025")}</span><h3>${escapeHtml(google?.title || "STEP Intern, Software Engineering")}</h3><p>${escapeHtml(google?.company || "Google")} · ${escapeHtml(google?.context || "Google Cloud")}</p><ul>${(google?.bullets || []).slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><a class="text-link" href="/jobs" data-link>See every job <span aria-hidden="true">→</span></a></div></section>
  <section class="about-strip section-rule"><div><h2>About me.</h2>${profile.about.slice(0, 2).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}<a class="text-link" href="/about" data-link>More about me <span aria-hidden="true">→</span></a></div><blockquote>“The best part of engineering is turning a messy problem into something another person can trust.”</blockquote></section>
  <section class="contact-callout"><h2>Let's build something meaningful.</h2><p>I'm open to software engineering internships and thoughtful technical collaborations.</p><div><a class="button" href="/contact" data-link>Contact me <span aria-hidden="true">→</span></a><a class="text-link direct-email" href="mailto:${escapeHtml(profile.email)}">Email directly</a></div></section>`;
}

function workPage() {
  const projects = state.projects.filter((project) => project.slug !== "portfolio-site");
  const featured = projects.filter((project) => ["sentinel", "cardforge", "dominion"].includes(project.slug));
  const archive = projects.filter((project) => !featured.includes(project));
  return `<header class="page-lead"><h1>Work</h1><p>Projects, experiments, and systems I've built while learning how software holds up in the real world.</p></header>
    <section class="project-tools" aria-label="Project filters"><div class="filters" role="group" aria-label="Filter projects">${["all","featured","live","backend","full-stack","games"].map((filter) => `<button type="button" data-filter="${filter}" class="${filter === "all" ? "active" : ""}">${filter === "full-stack" ? "Full-stack" : filter[0].toUpperCase()+filter.slice(1)}</button>`).join("")}</div><label class="search"><span class="sr-only">Search projects</span><input type="search" id="project-search" placeholder="Search projects" autocomplete="off"></label></section>
    <div id="project-list" class="project-list"><div class="featured-list">${featured.map((project) => projectRow(project, true)).join("")}</div><div class="archive-list">${archive.map((project) => projectRow(project)).join("")}</div></div><p id="empty-projects" class="empty" hidden>No projects match that search yet.</p>`;
}

function jobKind(role) {
  if (/Google/i.test(role.company)) return "Software engineering";
  if (/Education at Work|Intuit/i.test(role.company)) return "Customer and product support";
  if (/Boys & Girls/i.test(role.company)) return "Education and youth programs";
  if (/Best Buy/i.test(role.company)) return "Retail and sales";
  return "Food service and operations";
}

function jobsPage() {
  const profile = state.profile;
  const rank = { "Boys & Girls Club of El Paso": 1, "Education at Work x Intuit": 2, "Best Buy": 3, "Google": 4, "Peter Piper Pizza": 5 };
  const jobs = [...profile.experience, ...(profile.additional_experience || [])].sort((a, b) => (rank[a.company] || 99) - (rank[b.company] || 99));
  return `<header class="page-lead jobs-lead"><div><h1>Jobs</h1><p>Every paid role—not only the technical ones.</p></div><aside><strong>${jobs.length} roles</strong><span>Engineering, education, support, retail, and service.</span></aside></header><section class="jobs-note"><p>I am proud of the full path. Each job taught me something different about reliability, patience, communication, customers, or the people depending on the work.</p></section><section class="timeline jobs-timeline">${jobs.map((role, index) => `<article><div class="timeline-meta"><span>${escapeHtml(role.dates)}</span><span>${escapeHtml(role.location || "El Paso, TX")}</span><span class="job-number">${String(index + 1).padStart(2, "0")}</span></div><div><p class="company">${escapeHtml(role.company)}</p><h2>${escapeHtml(role.title)}</h2><p class="job-kind">${escapeHtml(jobKind(role))}</p><p>${escapeHtml(role.context)}</p>${role.bullets?.length ? `<ul>${role.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}<div class="tech-line">${(role.tags || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></div></article>`).join("")}</section><section class="education section-rule"><h2>Education alongside work</h2><div><p><strong>${escapeHtml(profile.education.degree)}</strong></p><p>${escapeHtml(profile.education.school)}</p><p>${escapeHtml(profile.education.graduation)} · GPA ${escapeHtml(profile.education.gpa)}</p><a class="text-link" href="/education" data-link>See education details <span aria-hidden="true">→</span></a></div></section>`;
}

function educationPage() {
  const education = state.profile.education;
  return `<header class="page-lead education-lead"><div><p class="company">Education</p><h1>UTEP</h1><p>Computer science, mathematics, and the systems work I am building toward.</p></div><aside><span>${escapeHtml(education.graduation)}</span><strong>${escapeHtml(education.gpa)} GPA</strong></aside></header>
  <section class="education-overview"><div><p class="company">${escapeHtml(education.college)}</p><h2>${escapeHtml(education.degree)}</h2><p>Minor in ${escapeHtml(education.minor)} at ${escapeHtml(education.school)}.</p></div><dl><div><dt>Progress</dt><dd>${escapeHtml(education.earned_hours)}</dd></div><div><dt>Honors</dt><dd>${education.honors.map(escapeHtml).join(" · ")}</dd></div><div><dt>Location</dt><dd>El Paso, Texas</dd></div></dl></section>
  <section class="coursework section-rule"><div><p class="company">Completed foundation</p><h2>Coursework</h2></div><div class="course-grid">${education.coursework.map((course) => `<span>${escapeHtml(course)}</span>`).join("")}</div></section>
  <section class="coursework current-courses section-rule"><div><p class="company">Fall 2026</p><h2>In progress</h2></div><div class="course-grid">${education.in_progress.map((course) => `<span>${escapeHtml(course)}</span>`).join("")}</div></section>
  <section class="education-note"><h2>What I am working toward</h2><p>My coursework is moving deeper into operating systems, databases, parallel computing, programming languages, and probability. I use projects outside class to connect that foundation to real APIs, product interfaces, testing, deployment, and machine learning systems.</p><a class="button secondary" href="/work" data-link>See the work</a></section>`;
}

function aboutPage() {
  const profile = state.profile;
  return `<header class="page-lead about-lead"><h1>About</h1><p>I'm Aden—a computer science student who likes the cleanup-heavy parts of engineering as much as the first build.</p></header><section class="about-layout"><figure><img src="${escapeHtml(profile.hero_image.replace(/^assets/, "/assets"))}" alt="Aden Ramirez in San Francisco"><figcaption>San Francisco, during my 2025 internship.</figcaption></figure><div class="prose">${profile.about.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}<h2>How I work</h2>${profile.focus_areas.map((item) => `<section><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></section>`).join("")}</div></section><section class="personal-note section-rule"><h2>Outside the editor</h2><p>I teach STEAM, stay involved with UTEP's engineering community, and enjoy work that lets me explain complicated things plainly. This site is deliberately a little quieter than most developer portfolios: the work should do the talking.</p></section>`;
}

function contactPage() {
  const profile = state.profile;
  const subject = encodeURIComponent("Portfolio inquiry for Aden Ramirez");
  return `<header class="page-lead contact-lead"><h1>Contact</h1><p>If you have an internship, role, project, referral, or useful conversation in mind, I would like to hear from you.</p></header><section class="contact-grid"><article class="contact-primary"><p class="company">Best first step</p><h2>Email me</h2><p>${escapeHtml(profile.connect_note)}</p><a class="button" href="mailto:${escapeHtml(profile.email)}?subject=${subject}">Start an email <span aria-hidden="true">→</span></a><button class="copy-button" type="button" data-copy="${escapeHtml(profile.email)}">Copy email</button></article><div class="contact-methods"><article><span>Personal email</span><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><button type="button" data-copy="${escapeHtml(profile.email)}">Copy</button></article><article><span>University email</span><a href="mailto:${escapeHtml(profile.school_email)}">${escapeHtml(profile.school_email)}</a><button type="button" data-copy="${escapeHtml(profile.school_email)}">Copy</button></article><article><span>Phone</span><a href="${escapeHtml(profile.phone_href)}">${escapeHtml(profile.phone)}</a><button type="button" data-copy="${escapeHtml(profile.phone)}">Copy</button></article><article><span>LinkedIn</span><a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.linkedin)}</a><button type="button" data-copy="${escapeHtml(profile.linkedin)}">Copy</button></article><article><span>GitHub</span><a href="${escapeHtml(profile.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.github)}</a><button type="button" data-copy="${escapeHtml(profile.github)}">Copy</button></article><article><span>Resume</span><button class="inline-resume" type="button" data-resume-open>View here</button></article></div></section><section class="contact-details section-rule"><div><h2>Good reasons to reach out</h2><ul><li>Software engineering internships and part-time technical work</li><li>Entry-level opportunities and early-career programs</li><li>Project collaboration, student organizations, and referrals</li><li>Backend, full-stack, systems, testing, or practical AI work</li></ul></div><aside><h2>Save my contact</h2><p>Download a standard contact card for your phone or address book.</p><a class="button secondary" href="/contact.vcf" download="Aden-Ramirez.vcf">Download vCard</a><p class="contact-location">Based in ${escapeHtml(profile.location)} · Open to relocating for the right opportunity.</p></aside></section><p id="copy-status" class="copy-status" role="status" aria-live="polite"></p>`;
}

function narrative(project) {
  const preview = (project.readme_preview || []).filter((line) => line && !/^#|^```|^\[!|^\|/.test(line));
  const highlights = (project.highlights || []).length ? project.highlights : preview.filter((line) => !line.startsWith("-")).slice(0, 2);
  const bullets = preview.filter((line) => line.startsWith("-")).map((line) => line.replace(/^-\s*/, "")).slice(0, 5);
  return {
    problem: plainText(project.description || `I built ${project.name} to explore a concrete product and engineering problem.`),
    built: plainText(highlights[0] || `A working ${technologies(project, 3).join(" and ") || "software"} project with a focus on the complete user flow.`),
    works: (bullets.length ? bullets : ["The repository includes the implementation, setup notes, and the decisions that shaped the current version."]).map(plainText),
    limits: project.is_private ? "This work is private, so the public case study intentionally avoids implementation details and repository links." : project.homepage ? "The live build is a portfolio demonstration. Availability and external services can vary, and the repository remains the source of truth." : "This project does not currently have a hosted demo. Run and verification instructions live in the repository when available.",
    learned: projectLessons[project.slug] || plainText(highlights[1] || "Finishing the surrounding documentation, tests, and edge cases taught me more than the first working version did.")
  };
}

function projectPage(slug) {
  const project = state.projects.find((item) => item.slug === slug);
  if (!project) return `<section class="not-found"><p>404</p><h1>That project isn't here.</h1><a class="button" href="/work" data-link>Back to work</a></section>`;
  const story = narrative(project);
  const related = state.projects.filter((item) => item.slug !== project.slug && item.slug !== "portfolio-site").slice(0, 3);
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/work" data-link>Work</a><span>/</span><span aria-current="page">${escapeHtml(project.name)}</span></nav><header class="case-hero"><div><h1>${escapeHtml(project.name)}</h1><p>${escapeHtml(project.description || story.built)}</p><div class="project-actions">${project.url ? external(project.url, "View code") : ""}${project.homepage ? external(project.homepage, "Live site") : ""}<a class="text-link" href="/work" data-link>Back to all work <span aria-hidden="true">←</span></a></div></div><dl><div><dt>Status</dt><dd>${escapeHtml(projectStatus(project))}</dd></div><div><dt>Updated</dt><dd>${escapeHtml(formatDate(project.pushed_at))}</dd></div><div><dt>Tools</dt><dd>${escapeHtml(technologies(project).join(", ") || "See repository")}</dd></div></dl></header><div class="case-visual">${projectArt(project, true)}</div><section class="case-layout"><div class="case-story"><section><h2>The problem</h2><p>${escapeHtml(story.problem)}</p></section><section><h2>What I built</h2><p>${escapeHtml(story.built)}</p></section><section><h2>How it works</h2><ul>${story.works.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><section><h2>Tradeoffs and limits</h2><p>${escapeHtml(story.limits)}</p></section><section><h2>What I learned</h2><p>${escapeHtml(story.learned)}</p></section></div><aside><h2>Project details</h2><h3>Technologies</h3><p>${escapeHtml(technologies(project, 12).join(", ") || "See repository")}</p><h3>Links</h3>${project.url ? external(project.url, "Source code") : `<p>Private repository</p>`}${project.homepage ? external(project.homepage, "Live project") : ""}<h3>Repository notes</h3><p>${project.latest_release ? `Latest release: ${escapeHtml(project.latest_release)}.` : "No public release is listed."}</p></aside></section><section class="related section-rule"><h2>Keep exploring</h2>${related.map((item) => `<a href="${projectHref(item)}" data-link><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.description || "View project")}</span></a>`).join("")}</section>`;
}

function currentPath() { return location.pathname.replace(/\/+$/, "") || "/"; }
function render() {
  const path = currentPath();
  if (path === "/") root.innerHTML = homePage();
  else if (path === "/work") root.innerHTML = workPage();
  else if (path === "/jobs" || path === "/experience") root.innerHTML = jobsPage();
  else if (path === "/education") root.innerHTML = educationPage();
  else if (path === "/about") root.innerHTML = aboutPage();
  else if (path === "/contact") root.innerHTML = contactPage();
  else if (path.startsWith("/projects/")) root.innerHTML = projectPage(decodeURIComponent(path.split("/")[2] || ""));
  else root.innerHTML = `<section class="not-found"><p>404</p><h1>That page isn't here.</h1><a class="button" href="/" data-link>Go home</a></section>`;
  const project = path.startsWith("/projects/") ? state.projects.find((item) => item.slug === decodeURIComponent(path.split("/")[2] || "")) : null;
  document.title = project ? `${displayName(project.name)} | Aden Ramirez` : path === "/work" ? "Work | Aden Ramirez" : ["/jobs", "/experience"].includes(path) ? "Jobs | Aden Ramirez" : path === "/education" ? "Education | Aden Ramirez" : path === "/about" ? "About | Aden Ramirez" : path === "/contact" ? "Contact | Aden Ramirez" : "Aden Ramirez | Software Engineer";
  document.querySelector("#canonical-link").href = `${location.origin}${path}`;
  document.querySelectorAll("#nav a[data-link]").forEach((link) => link.toggleAttribute("aria-current", link.getAttribute("href") === path || (path.startsWith("/projects/") && link.getAttribute("href") === "/work")));
  bindPage(); root.focus({ preventScroll: true }); window.scrollTo(0, 0);
}

function bindPage() {
  document.querySelectorAll('img[src*="aden-headshot"]').forEach((image) => { image.alt = "Professional headshot of Aden Ramirez"; });
  const aboutCaption = document.querySelector(".about-layout figcaption");
  if (aboutCaption) aboutCaption.textContent = "Aden Ramirez, computer science student and software engineer.";
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => { state.filter = button.dataset.filter; document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button)); filterProjects(); }));
  document.querySelector("#project-search")?.addEventListener("input", (event) => { state.query = event.target.value.trim().toLowerCase(); filterProjects(); });
  document.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
    const status = document.querySelector("#copy-status");
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      if (status) status.textContent = `${button.dataset.copy} copied to your clipboard.`;
      button.textContent = "Copied";
    } catch {
      if (status) status.textContent = `Copy was unavailable. Select ${button.dataset.copy} manually.`;
    }
  }));
}
function filterProjects() {
  let visible = 0; document.querySelectorAll("[data-project]").forEach((item) => { const match = item.dataset.search.includes(state.query) && item.dataset.kinds.split(" ").includes(state.filter); item.hidden = !match; if (match) visible += 1; });
  const empty = document.querySelector("#empty-projects"); if (empty) empty.hidden = visible > 0;
}

document.addEventListener("click", (event) => { const link = event.target.closest("a[data-link]"); if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); history.pushState({}, "", link.href); render(); document.querySelector("#nav").classList.remove("open"); document.querySelector(".menu-button").setAttribute("aria-expanded", "false"); });
window.addEventListener("popstate", render);
document.querySelector(".menu-button").addEventListener("click", (event) => { const open = document.querySelector("#nav").classList.toggle("open"); event.currentTarget.setAttribute("aria-expanded", String(open)); });
const resumeDialog = document.querySelector("#resume-dialog");
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-resume-open]")) resumeDialog.showModal();
  if (event.target.closest("[data-resume-close]")) resumeDialog.close();
  const choice = event.target.closest("[data-resume-src]");
  if (choice) {
    document.querySelectorAll("[data-resume-src]").forEach((button) => button.classList.toggle("active", button === choice));
    document.querySelector("#resume-frame").src = choice.dataset.resumePreview;
    document.querySelector("#resume-frame").alt = `Preview of Aden Ramirez's ${choice.textContent.trim().toLowerCase()} resume`;
    document.querySelector("#resume-download").href = choice.dataset.resumeSrc;
  }
});
resumeDialog.addEventListener("click", (event) => { if (event.target === resumeDialog) resumeDialog.close(); });
document.querySelector("#year").textContent = new Date().getFullYear();

Promise.all([fetch("/api/profile").then((response) => response.json()), fetch("/api/projects").then((response) => response.json())]).then(([profile, projects]) => { state.profile = profile; state.projects = projects.repos || []; render(); }).catch(() => { root.innerHTML = `<section class="not-found"><h1>The portfolio could not load.</h1><p>Please try again in a moment.</p></section>`; });
