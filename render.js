const projectArtSlugs = new Set(["dwell-signal", "sentinel", "cardforge", "dominion", "demiurge", "meridian", "weather-compare", "atlas", "reel", "stockpilot", "storygen", "volley", "relay", "myreadlist", "aurora", "compass", "medelite-report-gen", "price-deal-watcher", "chessgen", "leximatch", "simple-chess-game", "miner-eats", "nebula-stat-proto", "shpe-utep-website"]);
const projectDisplayNames = { "dwell-signal": "DwellSignal" };

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function displayName(value = "") {
  if (projectDisplayNames[value]) return projectDisplayNames[value];
  if (/^[a-z0-9]+(?:[-_][a-z0-9]+)+$/.test(value)) return String(value).split(/[-_]+/).map((word) => word.replace(/^./, (letter) => letter.toUpperCase())).join(" ");
  return String(value).replace(/^./, (letter) => letter.toUpperCase());
}

function safeExternalUrl(value = "") {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function external(url, label, className = "text-link") {
  const safe = safeExternalUrl(url);
  return safe ? `<a class="${className}" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>` : "";
}

function plainText(value = "") {
  return String(value).replace(/\*\*|`/g, "").replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").trim();
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", timeZone: "UTC" }).format(new Date(value)) : "In progress";
}

function technologies(project, limit = 6) {
  return (project.tech || project.languages || []).filter(Boolean).slice(0, limit);
}

function projectHref(project) {
  return `/projects/${encodeURIComponent(project.slug)}`;
}

function projectStatus(project) {
  return project.is_private ? "Private work" : project.homepage ? "Live" : project.latest_release ? project.latest_release : "Repository";
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

function projectArt(project, featured = false) {
  if (projectArtSlugs.has(project.slug)) return `<img class="project-logo" src="/assets/project-${escapeHtml(project.slug)}.png" alt="Custom artwork for ${escapeHtml(displayName(project.name))}" loading="lazy">`;
  const screenshot = safeExternalUrl(project.screenshot);
  if (screenshot) return `<img src="${escapeHtml(screenshot)}" alt="Screenshot of ${escapeHtml(displayName(project.name))}" loading="lazy">`;
  const words = (project.readme_preview || []).filter((line) => line && !line.startsWith("#") && !line.startsWith("[")).slice(0, 4);
  return `<div class="project-art-fallback ${featured ? "is-featured" : ""}" aria-hidden="true"><span>${escapeHtml(displayName(project.name))}</span><pre>${escapeHtml(plainText(words.join("\n").slice(0, 280) || project.description || "A project still taking shape."))}</pre></div>`;
}

function projectActions(project) {
  return `<a class="text-link" href="${projectHref(project)}">Case study <span aria-hidden="true">→</span></a>${project.url ? external(project.url, "Code") : ""}${project.homepage ? external(project.homepage, "Live site") : ""}`;
}

function projectRow(project, showMedia = true) {
  const search = [project.name, project.description, ...technologies(project, 20), ...(project.topics || [])].join(" ").toLowerCase();
  return `<article class="project-row compact${showMedia ? " has-media" : ""}" data-project data-search="${escapeHtml(search)}" data-kinds="${escapeHtml(projectKinds(project).join(" "))}">
    ${showMedia ? `<a class="project-media" href="${projectHref(project)}" aria-label="Read ${escapeHtml(displayName(project.name))} case study">${projectArt(project)}</a>` : ""}
    <div class="project-copy-block"><div class="project-heading"><h2><a href="${projectHref(project)}">${escapeHtml(displayName(project.name))}</a></h2><span>${project.pushed_at ? new Date(project.pushed_at).getFullYear() : "Private"} · ${escapeHtml(projectStatus(project))}</span></div>
    <p>${escapeHtml(project.description || "A project, experiment, or learning build from my GitHub archive.")}</p>
    <div class="tech-line">${technologies(project).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
    <div class="project-actions">${projectActions(project)}</div></div>
  </article>`;
}

function homePage(profile, repos) {
  const projects = repos.filter((project) => project.slug !== "portfolio-site");
  const preferred = ["sentinel", "cardforge", "dominion", "storygen", "atlas"];
  const selected = preferred.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean).slice(0, 3);
  const google = profile.experience.find((role) => /google/i.test(role.company));
  return `<section class="hero">
    <div class="hero-copy"><h1>Aden<br>Ramirez</h1><p class="hero-role">Software engineer and computer science student.</p><p class="hero-line">I build careful software for real people.</p><div class="hero-actions"><a class="button" href="/work">See my work <span aria-hidden="true">→</span></a><a class="text-link" href="mailto:${escapeHtml(profile.email)}">Say hello</a></div></div>
    <figure class="portrait"><img src="${escapeHtml(profile.hero_image.replace(/^assets/, "/assets"))}" alt="Aden Ramirez outdoors in San Francisco"><figcaption>Curious. Pragmatic. Detail-oriented. Human.</figcaption></figure>
  </section>
  <section class="selected-work section-rule"><div class="section-intro"><h2>A few things I've built.</h2><p>Recent systems and products where the interesting work lives in the details.</p></div>${selected.map((project) => projectRow(project)).join("")}<a class="button secondary" href="/work">Browse all ${projects.length} projects</a></section>
  <section class="proof section-rule"><div><h2>Software should hold up after the demo.</h2><p>I care about readable systems, useful interfaces, and the rollout work between “it runs” and “it is ready.”</p><p>Before and alongside engineering, I have also worked in education, customer support, retail, and food service. Every one of those jobs shaped how I communicate and show up for a team.</p></div><div class="proof-story"><span>${escapeHtml(google?.dates || "May–Aug 2025")}</span><h3>${escapeHtml(google?.title || "STEP Intern, Software Engineering")}</h3><p>${escapeHtml(google?.company || "Google")} · ${escapeHtml(google?.context || "Google Cloud")}</p><ul>${(google?.bullets || []).slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><a class="text-link" href="/jobs">See every job <span aria-hidden="true">→</span></a></div></section>
  <section class="about-strip section-rule"><div><h2>About me.</h2>${profile.about.slice(0, 2).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}<a class="text-link" href="/about">More about me <span aria-hidden="true">→</span></a></div><blockquote>“The best part of engineering is turning a messy problem into something another person can trust.”</blockquote></section>
  <section class="contact-callout"><h2>Let's build something meaningful.</h2><p>I'm open to software engineering internships and thoughtful technical collaborations.</p><div><a class="button" href="/contact">Contact me <span aria-hidden="true">→</span></a><a class="text-link direct-email" href="mailto:${escapeHtml(profile.email)}">Email directly</a></div></section>`;
}

function workPage(repos) {
  const projects = repos.filter((project) => project.slug !== "portfolio-site");
  const featured = projects.filter((project) => ["sentinel", "cardforge", "dominion"].includes(project.slug));
  const archive = projects.filter((project) => !featured.includes(project));
  return `<header class="page-lead"><h1>Work</h1><p>Projects, experiments, and systems I've built while learning how software holds up in the real world.</p></header>
    <section class="project-tools" aria-label="Project filters"><div class="filters" role="group" aria-label="Filter projects">${["all", "featured", "live", "backend", "full-stack", "games"].map((filter) => `<button type="button" data-filter="${filter}" class="${filter === "all" ? "active" : ""}">${filter === "full-stack" ? "Full-stack" : filter[0].toUpperCase() + filter.slice(1)}</button>`).join("")}</div><label class="search"><span class="sr-only">Search projects</span><input type="search" id="project-search" placeholder="Search projects" autocomplete="off"></label></section>
    <div id="project-list" class="project-list"><div class="featured-list">${featured.map((project) => projectRow(project)).join("")}</div><div class="archive-list">${archive.map((project) => projectRow(project)).join("")}</div></div><p id="empty-projects" class="empty" hidden>No projects match that search yet.</p>`;
}

function jobsPage(profile) {
  const rank = { "Boys & Girls Club of El Paso": 1, "Education at Work x Intuit": 2, "Best Buy": 3, Google: 4, "Peter Piper Pizza": 5 };
  const jobs = [...profile.experience, ...(profile.additional_experience || [])].sort((a, b) => (rank[a.company] || 99) - (rank[b.company] || 99));
  const kind = (role) => /Google/i.test(role.company) ? "Software engineering" : /Education at Work|Intuit/i.test(role.company) ? "Customer and product support" : /Boys & Girls/i.test(role.company) ? "Education and youth programs" : /Best Buy/i.test(role.company) ? "Retail and sales" : "Food service and operations";
  return `<header class="page-lead jobs-lead"><div><h1>Jobs</h1><p>Every paid role—not only the technical ones.</p></div><aside><strong>${jobs.length} roles</strong><span>Engineering, education, support, retail, and service.</span></aside></header><section class="jobs-note"><p>I am proud of the full path. Each job taught me something different about reliability, patience, communication, customers, or the people depending on the work.</p></section><section class="timeline jobs-timeline">${jobs.map((role, index) => `<article><div class="timeline-meta"><span>${escapeHtml(role.dates)}</span><span>${escapeHtml(role.location || "El Paso, TX")}</span><span class="job-number">${String(index + 1).padStart(2, "0")}</span></div><div><p class="company">${escapeHtml(role.company)}</p><h2>${escapeHtml(role.title)}</h2><p class="job-kind">${escapeHtml(kind(role))}</p><p>${escapeHtml(role.context)}</p>${role.bullets?.length ? `<ul>${role.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}<div class="tech-line">${(role.tags || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></div></article>`).join("")}</section><section class="education section-rule"><h2>Education alongside work</h2><div><p><strong>${escapeHtml(profile.education.degree)}</strong></p><p>${escapeHtml(profile.education.school)}</p><p>${escapeHtml(profile.education.graduation)} · GPA ${escapeHtml(profile.education.gpa)}</p><a class="text-link" href="/education">See education details <span aria-hidden="true">→</span></a></div></section>`;
}

function educationPage(profile) {
  const education = profile.education;
  return `<header class="page-lead education-lead"><div><p class="company">Education</p><h1>UTEP</h1><p>Computer science, mathematics, and the systems work I am building toward.</p></div><aside><span>${escapeHtml(education.graduation)}</span><strong>${escapeHtml(education.gpa)} GPA</strong></aside></header>
  <section class="education-overview"><div><p class="company">${escapeHtml(education.college)}</p><h2>${escapeHtml(education.degree)}</h2><p>Minor in ${escapeHtml(education.minor)} at ${escapeHtml(education.school)}.</p></div><dl><div><dt>Progress</dt><dd>${escapeHtml(education.earned_hours)}</dd></div><div><dt>Honors</dt><dd>${education.honors.map(escapeHtml).join(" · ")}</dd></div><div><dt>Location</dt><dd>El Paso, Texas</dd></div></dl></section>
  <section class="coursework section-rule"><div><p class="company">Completed foundation</p><h2>Coursework</h2></div><div class="course-grid">${education.coursework.map((course) => `<span>${escapeHtml(course)}</span>`).join("")}</div></section>
  <section class="coursework current-courses section-rule"><div><p class="company">Fall 2026</p><h2>In progress</h2></div><div class="course-grid">${education.in_progress.map((course) => `<span>${escapeHtml(course)}</span>`).join("")}</div></section>
  <section class="education-note"><h2>What I am working toward</h2><p>My coursework is moving deeper into operating systems, databases, parallel computing, programming languages, and probability. I use projects outside class to connect that foundation to real APIs, product interfaces, testing, deployment, and machine learning systems.</p><a class="button secondary" href="/work">See the work</a></section>`;
}

function aboutPage(profile) {
  return `<header class="page-lead about-lead"><h1>About</h1><p>I'm Aden—a computer science student who likes the cleanup-heavy parts of engineering as much as the first build.</p></header><section class="about-layout"><figure><img src="${escapeHtml(profile.hero_image.replace(/^assets/, "/assets"))}" alt="Aden Ramirez in San Francisco"><figcaption>San Francisco, during my 2025 internship.</figcaption></figure><div class="prose">${profile.about.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}<h2>How I work</h2>${profile.focus_areas.map((item) => `<section><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.copy)}</p></section>`).join("")}</div></section><section class="personal-note section-rule"><h2>Outside the editor</h2><p>I teach STEAM, stay involved with UTEP's engineering community, and enjoy work that lets me explain complicated things plainly. This site is deliberately a little quieter than most developer portfolios: the work should do the talking.</p></section>`;
}

function contactPage(profile) {
  const subject = encodeURIComponent("Portfolio inquiry for Aden Ramirez");
  const method = (label, href, value) => `<article><span>${label}</span><a href="${escapeHtml(href)}"${href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(value)}</a><button type="button" data-copy="${escapeHtml(value)}">Copy</button></article>`;
  return `<header class="page-lead contact-lead"><h1>Contact</h1><p>If you have an internship, role, project, referral, or useful conversation in mind, I would like to hear from you.</p></header><section class="contact-grid"><article class="contact-primary"><p class="company">Best first step</p><h2>Email me</h2><p>${escapeHtml(profile.connect_note)}</p><a class="button" href="mailto:${escapeHtml(profile.email)}?subject=${subject}">Start an email <span aria-hidden="true">→</span></a><button class="copy-button" type="button" data-copy="${escapeHtml(profile.email)}">Copy email</button></article><div class="contact-methods">${method("Personal email", `mailto:${profile.email}`, profile.email)}${method("University email", `mailto:${profile.school_email}`, profile.school_email)}${method("Phone", profile.phone_href, profile.phone)}${method("LinkedIn", profile.linkedin, profile.linkedin)}${method("GitHub", profile.github, profile.github)}<article><span>Resume</span><button class="inline-resume" type="button" data-resume-open>View here</button></article></div></section><section class="contact-details section-rule"><div><h2>Good reasons to reach out</h2><ul><li>Software engineering internships and part-time technical work</li><li>Entry-level opportunities and early-career programs</li><li>Project collaboration, student organizations, and referrals</li><li>Backend, full-stack, systems, testing, or practical AI work</li></ul></div><aside><h2>Save my contact</h2><p>Download a standard contact card for your phone or address book.</p><a class="button secondary" href="/contact.vcf" download="Aden-Ramirez.vcf">Download vCard</a><p class="contact-location">Based in ${escapeHtml(profile.location)} · Open to relocating for the right opportunity.</p></aside></section><p id="copy-status" class="copy-status" role="status" aria-live="polite"></p>`;
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
    learned: plainText(highlights[1] || `Building ${displayName(project.name)} reinforced the value of keeping the implementation, documentation, tests, and user experience aligned.`)
  };
}

function projectPage(project, repos) {
  const story = narrative(project);
  const related = repos.filter((item) => item.slug !== project.slug && item.slug !== "portfolio-site").slice(0, 3);
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/work">Work</a><span>/</span><span aria-current="page">${escapeHtml(displayName(project.name))}</span></nav><header class="case-hero"><div><h1>${escapeHtml(displayName(project.name))}</h1><p>${escapeHtml(project.description || story.built)}</p><div class="project-actions">${project.url ? external(project.url, "View code") : ""}${project.homepage ? external(project.homepage, "Live site") : ""}<a class="text-link" href="/work">Back to all work <span aria-hidden="true">←</span></a></div></div><dl><div><dt>Status</dt><dd>${escapeHtml(projectStatus(project))}</dd></div><div><dt>Updated</dt><dd>${escapeHtml(formatDate(project.pushed_at))}</dd></div><div><dt>Tools</dt><dd>${escapeHtml(technologies(project).join(", ") || "See repository")}</dd></div></dl></header><div class="case-visual">${projectArt(project, true)}</div><section class="case-layout"><div class="case-story"><section><h2>The problem</h2><p>${escapeHtml(story.problem)}</p></section><section><h2>What I built</h2><p>${escapeHtml(story.built)}</p></section><section><h2>How it works</h2><ul>${story.works.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><section><h2>Tradeoffs and limits</h2><p>${escapeHtml(story.limits)}</p></section><section><h2>What I learned</h2><p>${escapeHtml(story.learned)}</p></section></div><aside><h2>Project details</h2><h3>Technologies</h3><p>${escapeHtml(technologies(project, 12).join(", ") || "See repository")}</p><h3>Links</h3>${project.url ? external(project.url, "Source code") : "<p>Private repository</p>"}${project.homepage ? external(project.homepage, "Live project") : ""}<h3>Repository notes</h3><p>${project.latest_release ? `Latest release: ${escapeHtml(project.latest_release)}.` : "No public release is listed."}</p></aside></section><section class="related section-rule"><h2>Keep exploring</h2>${related.map((item) => `<a href="${projectHref(item)}"><strong>${escapeHtml(displayName(item.name))}</strong><span>${escapeHtml(item.description || "View project")}</span></a>`).join("")}</section>`;
}

function notFoundPage(project = false) {
  return `<section class="not-found"><p>404</p><h1>${project ? "That project isn't here." : "That page isn't here."}</h1><p>The address may have changed, or the page may never have existed.</p><a class="button" href="${project ? "/work" : "/"}">${project ? "Back to work" : "Go home"}</a></section>`;
}

function renderPage(pathname, profile, repos) {
  if (pathname === "/") return homePage(profile, repos);
  if (pathname === "/work") return workPage(repos);
  if (pathname === "/jobs" || pathname === "/experience") return jobsPage(profile);
  if (pathname === "/education") return educationPage(profile);
  if (pathname === "/about") return aboutPage(profile);
  if (pathname === "/contact") return contactPage(profile);
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  if (match) {
    const project = repos.find((item) => item.slug === match[1]);
    return project ? projectPage(project, repos) : notFoundPage(true);
  }
  return notFoundPage(false);
}

function metaForPath(pathname, repos) {
  const routes = {
    "/": ["Aden Ramirez | Software Engineer", "Aden Ramirez is a computer science student and software engineer building careful backend, systems, and full-stack projects."],
    "/work": ["Work | Aden Ramirez", "Projects, experiments, and systems built by Aden Ramirez."],
    "/jobs": ["Jobs | Aden Ramirez", "The complete employment history of Aden Ramirez, including engineering, education, service, sales, and customer-support work."],
    "/experience": ["Jobs | Aden Ramirez", "The complete employment history of Aden Ramirez, including engineering, education, service, sales, and customer-support work."],
    "/education": ["Education | Aden Ramirez", "Aden Ramirez's computer science education at UTEP, including mathematics, coursework, honors, and current studies."],
    "/about": ["About | Aden Ramirez", "About Aden Ramirez, a UTEP computer science student and software engineer in El Paso."],
    "/contact": ["Contact | Aden Ramirez", "Contact Aden Ramirez about software engineering internships, technical work, projects, referrals, and collaboration."]
  };
  if (routes[pathname]) return { title: routes[pathname][0], description: routes[pathname][1], found: true };
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  const project = match ? repos.find((item) => item.slug === match[1]) : null;
  if (project) return { title: `${displayName(project.name)} | Aden Ramirez`, description: project.description || `A project by Aden Ramirez: ${displayName(project.name)}.`, found: true, project };
  return { title: "Page Not Found | Aden Ramirez", description: "The requested page could not be found on Aden Ramirez's portfolio.", found: false };
}

function structuredDataForPath(pathname, origin, profile, meta) {
  const person = {
    "@type": "Person",
    "@id": `${origin}/#aden-ramirez`,
    name: profile.name,
    url: `${origin}/`,
    image: `${origin}/assets/aden-headshot.png`,
    email: `mailto:${profile.email}`,
    jobTitle: "Software Engineer and Computer Science Student",
    alumniOf: { "@type": "CollegeOrUniversity", name: "The University of Texas at El Paso" },
    sameAs: [profile.github, profile.linkedin]
  };
  const page = {
    "@type": meta.project ? "SoftwareSourceCode" : pathname === "/work" ? "CollectionPage" : "WebPage",
    "@id": `${origin}${pathname === "/" ? "/" : pathname}#page`,
    url: `${origin}${pathname === "/" ? "/" : pathname}`,
    name: meta.title,
    description: meta.description,
    author: { "@id": person["@id"] }
  };
  if (meta.project) {
    page.codeRepository = meta.project.url || undefined;
    page.programmingLanguage = technologies(meta.project, 12);
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [person, page] }).replace(/</g, "\\u003c");
}

module.exports = { escapeHtml, metaForPath, renderPage, structuredDataForPath };
