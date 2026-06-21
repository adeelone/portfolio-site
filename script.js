const iconPaths = {
  phone:
    "M3.75 5.25a1.5 1.5 0 0 1 1.5-1.5h2.11a1.5 1.5 0 0 1 1.47 1.19l.44 2.03a1.5 1.5 0 0 1-.8 1.66l-1.47.74a12.1 12.1 0 0 0 5.76 5.76l.74-1.47a1.5 1.5 0 0 1 1.66-.8l2.03.44a1.5 1.5 0 0 1 1.19 1.47v2.11a1.5 1.5 0 0 1-1.5 1.5h-.75C9.75 20.25 3.75 14.25 3.75 6v-.75Z",
  mail:
    "M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12A2.25 2.25 0 0 1 20.25 6.75v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75Zm2.37-.75 5.95 4.46a1.5 1.5 0 0 0 1.86 0L19.88 6",
  github:
    "M12 2.85c-5.05 0-9.15 4.1-9.15 9.16 0 4.05 2.63 7.48 6.28 8.69.46.09.63-.2.63-.45 0-.22-.01-.95-.01-1.72-2.56.56-3.1-1.08-3.1-1.08-.42-1.07-1.03-1.35-1.03-1.35-.84-.58.06-.57.06-.57.93.07 1.42.95 1.42.95.82 1.41 2.16 1 2.68.77.08-.6.32-1 .59-1.23-2.05-.24-4.2-1.03-4.2-4.57 0-1.01.36-1.83.95-2.48-.1-.23-.41-1.17.09-2.43 0 0 .77-.25 2.52.95a8.8 8.8 0 0 1 4.58 0c1.75-1.2 2.52-.95 2.52-.95.5 1.26.19 2.2.09 2.43.59.65.95 1.47.95 2.48 0 3.55-2.15 4.33-4.21 4.56.33.28.63.84.63 1.7 0 1.22-.01 2.21-.01 2.51 0 .25.17.55.64.45a9.17 9.17 0 0 0 6.27-8.69c0-5.06-4.1-9.16-9.15-9.16Z",
  linkedin:
    "M5.25 8.25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm-1.12 2.25h2.25v8.25H4.13V10.5Zm5.25 0h2.16v1.13h.03c.3-.57 1.03-1.19 2.13-1.19 2.28 0 2.7 1.5 2.7 3.45v4.86h-2.25v-4.31c0-1.03-.02-2.35-1.43-2.35-1.43 0-1.65 1.12-1.65 2.28v4.38H9.38V10.5Z",
  file:
    "M7.5 3.75h6l4.5 4.5v10.5A2.25 2.25 0 0 1 15.75 21h-8.25a2.25 2.25 0 0 1-2.25-2.25V6A2.25 2.25 0 0 1 7.5 3.75Zm5.25 1.5v3h3",
  calendar:
    "M6.75 2.25v2.25m10.5-2.25v2.25M4.5 8.25h15m-13.5 12h9a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 15 4.5H9A2.25 2.25 0 0 0 6.75 6.75V18A2.25 2.25 0 0 0 9 20.25Z",
  arrow:
    "M5.25 12h13.5m0 0-4.5-4.5m4.5 4.5-4.5 4.5",
  star:
    "m12 3.75 2.62 5.3 5.85.85-4.24 4.13 1 5.84L12 17.1l-5.23 2.77 1-5.84-4.24-4.13 5.85-.85L12 3.75Z",
  marker:
    "M12 21s-6-4.35-6-10.5a6 6 0 1 1 12 0C18 16.65 12 21 12 21Zm0-8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z",
  handshake:
    "M5.57 13.5 8.4 10.67a2.25 2.25 0 0 1 3.18 0l.84.84a2.25 2.25 0 0 0 3.18 0l2.83-2.83m-9.86 7.64L4.5 20.25m15-15L15.43 9.32m-10.86.01L2.25 7.01 7 2.26l2.32 2.32m5.36 0L17 2.26l4.75 4.75-2.32 2.32",
  briefcase:
    "M8.25 7.5V6A2.25 2.25 0 0 1 10.5 3.75h3A2.25 2.25 0 0 1 15.75 6v1.5m-10.5 0h13.5A2.25 2.25 0 0 1 21 9.75v6A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75v-6A2.25 2.25 0 0 1 5.25 7.5Z"
};

const socialItems = [
  { key: "email", label: "Email", icon: "mail", hrefKey: "email_href" },
  { key: "phone", label: "Phone", icon: "phone", hrefKey: "phone_href" }
];

const actionItems = [
  { key: "resume", label: "Resume", icon: "file" },
  { key: "github", label: "GitHub", icon: "github" },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin" }
];

const careerItems = [
  { key: "linkedin", label: "LinkedIn", icon: "linkedin", note: "Primary profile" },
  { key: "handshake", label: "Handshake", icon: "handshake", note: "Campus applications" },
  { key: "indeed", label: "Indeed", icon: "briefcase", note: "General search" },
  { key: "ziprecruiter", label: "ZipRecruiter", icon: "briefcase", note: "Application profile" }
];

const paletteByTech = {
  Java: ["#b8c7de", "#f3ebe0"],
  Python: ["#a8c6bc", "#edf4ee"],
  TypeScript: ["#a9bedb", "#eef4fb"],
  React: ["#a7c9d1", "#edf7f8"],
  HTML: ["#d8b1a4", "#fbf1ec"],
  CSS: ["#c1c7e2", "#f5f5fe"],
  default: ["#b9c3d3", "#f5efe5"]
};

let baseProfile = null;
let currentProfile = null;
let projectsData = null;
let ownerAuthenticated = false;

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPaths[name]}"></path></svg>`;
}

function formatDate(value) {
  if (!value) return "Private repo";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? payload.error
        : typeof payload === "string"
          ? payload
          : `Request failed for ${url}`;
    throw new Error(message);
  }

  return payload;
}

async function loadProfile() {
  try {
    return await requestJson("/api/profile");
  } catch {
    return requestJson("data/profile.json");
  }
}

async function loadProjects() {
  try {
    return await requestJson("/api/projects");
  } catch {
    return requestJson("data/projects.json");
  }
}

function projectPalette(project) {
  const primary = project.tech?.[0] ?? project.languages?.[0] ?? "default";
  return paletteByTech[primary] ?? paletteByTech.default;
}

function coverData(project) {
  const [start, end] = projectPalette(project);
  const label = project.name.slice(0, 2).toUpperCase();
  const subtitle = (project.tech?.[0] ?? project.languages?.[0] ?? "Project").slice(0, 18);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="${project.name}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" rx="36" fill="url(#g)" />
      <circle cx="530" cy="88" r="88" fill="rgba(255,255,255,0.42)" />
      <circle cx="112" cy="310" r="104" fill="rgba(255,255,255,0.28)" />
      <text x="48" y="122" fill="#26313a" font-family="Inter, sans-serif" font-size="96" font-weight="800">${label}</text>
      <text x="52" y="316" fill="#4d5b68" font-family="IBM Plex Mono, monospace" font-size="24">${subtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function anchor(href, label, className, iconName, extraText) {
  const external = href.startsWith("http");
  const target = external ? ' target="_blank" rel="noopener"' : "";
  return `<a class="${className}" href="${href}"${target}>${icon(iconName)}<span>${label}</span>${extraText ? `<strong>${extraText}</strong>` : ""}</a>`;
}

function placeholderLink(label, iconName, note, className = "contact-link contact-link-muted") {
  return `<span class="${className}" aria-label="${label}: ${note}">${icon(iconName)}<span>${label}</span><strong>${note}</strong></span>`;
}

function renderHero(profile) {
  document.querySelector("#hero-heading").textContent = profile.name;
  document.querySelector("#hero-pitch").textContent = profile.title;
  document.querySelector("#hero-pitch-secondary").textContent = profile.subtitle;
  document.querySelector("#status-line").textContent = profile.current_status;
  document.querySelector("#availability-line").textContent = profile.availability;
  const heroPhoto = document.querySelector("#hero-photo-image");
  if (heroPhoto && profile.hero_image) heroPhoto.src = profile.hero_image;

  document.querySelector("#hero-actions").innerHTML = actionItems
    .map((item) => anchor(profile[item.key], item.label, "action-banner", item.icon))
    .join("");

  document.querySelector("#hero-facts").innerHTML = profile.hero_facts
    .map(
      (fact) => `
        <article class="fact-card">
          <p class="fact-label">${fact.label}</p>
          <p class="fact-value">${fact.value}</p>
        </article>
      `
    )
    .join("");

  document.querySelector("#current-focus-title").textContent = profile.current_focus.title;
  document.querySelector("#current-focus-copy").textContent = profile.current_focus.copy;
  document.querySelector("#hero-highlights").innerHTML = profile.current_focus.points
    .map((point) => `<div class="hero-highlight">${point}</div>`)
    .join("");
}

function renderContact(profile) {
  const contactItems = socialItems
    .map((item) => {
      const href = profile[item.hrefKey ?? item.key];
      const text = profile[item.key];
      return anchor(href, item.label, "contact-link", item.icon, text);
    })
    .join("");

  const calendar = profile.calendar?.href
    ? anchor(profile.calendar.href, profile.calendar.label, "contact-link contact-link-accent", "calendar", "Book time")
    : placeholderLink("Calendar", "calendar", profile.calendar.note, "contact-link contact-link-accent");

  document.querySelector("#contact-items").innerHTML = `${contactItems}${calendar}`;
}

function renderAbout(profile) {
  document.querySelector("#about-copy").innerHTML = profile.about.map((item) => `<p>${item}</p>`).join("");
  document.querySelector("#snapshot-grid").innerHTML = profile.snapshot
    .map(
      (item) => `
        <article class="snapshot-item">
          <p class="snapshot-label">${item.label}</p>
          <p class="snapshot-value">${item.value}</p>
        </article>
      `
    )
    .join("");

  document.querySelector("#focus-pillars").innerHTML = profile.focus_areas
    .map(
      (item) => `
        <article class="pillar-card">
          <p class="eyebrow">Focus</p>
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderEducation(profile) {
  const honors = profile.education.honors.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#education-summary").innerHTML = `
    <p class="eyebrow">School</p>
    <h3>${profile.education.school}</h3>
    <p class="detail-copy">${profile.education.degree}</p>
    <div class="detail-meta">
      <span>${profile.education.graduation}</span>
      <span>GPA ${profile.education.gpa}</span>
      <span>${profile.location}</span>
    </div>
    <ul class="detail-list">${honors}</ul>
  `;

  document.querySelector("#semester-focus").innerHTML = `
    <p class="eyebrow">This season</p>
    <p>${profile.semester_focus}</p>
  `;

  document.querySelector("#coursework-chips").innerHTML = profile.education.coursework
    .map((course) => `<span class="chip">${course}</span>`)
    .join("");
}

function renderExperience(profile) {
  const [featuredRole, ...relevantRoles] = profile.experience;

  document.querySelector("#experience-featured").innerHTML = featuredRole
    ? `
        <article class="experience-card">
          <div class="role-topline">
            <p class="eyebrow">${featuredRole.company}</p>
            <span class="role-dates">${featuredRole.dates}</span>
          </div>
          <h3>${featuredRole.title}</h3>
          <p class="role-meta">${icon("marker")}<span>${featuredRole.location}</span></p>
          <p class="experience-context">${featuredRole.context}</p>
          <ul class="detail-list">${featuredRole.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
          <div class="tag-list">${featuredRole.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </article>
      `
    : "";

  document.querySelector("#experience-cards").innerHTML = relevantRoles
    .map(
      (role) => `
        <article class="experience-card">
          <div class="role-topline">
            <p class="eyebrow">${role.company}</p>
            <span class="role-dates">${role.dates}</span>
          </div>
          <h3>${role.title}</h3>
          <p class="role-meta">${icon("marker")}<span>${role.location}</span></p>
          <p class="experience-context">${role.context}</p>
          <ul class="detail-list">${role.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
          <div class="tag-list">${role.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </article>
      `
    )
    .join("");

  document.querySelector("#additional-grid").innerHTML = profile.additional_experience
    .map(
      (role) => `
        <article class="additional-card">
          <div class="role-topline">
            <p class="eyebrow">${role.company}</p>
            <span class="role-dates">${role.dates}</span>
          </div>
          <h3>${role.title}</h3>
          <p class="additional-context">${role.context}</p>
        </article>
      `
    )
    .join("");
}

function renderProfilePreviews(profile, projects) {
  const repos = projects.repos.filter((project) => project.slug !== "portfolio-site");
  const pinned = repos.filter((project) => project.is_pinned);
  const latest = repos.find((project) => project.pushed_at);
  const githubPreview = document.querySelector("#github-preview");
  const linkedinPreview = document.querySelector("#linkedin-preview");

  githubPreview.innerHTML = `
    <div class="profile-preview-head">
      <div>
        <p class="eyebrow">GitHub preview</p>
        <h3 class="profile-preview-title">A look at my actual code profile</h3>
      </div>
      <span class="profile-preview-handle">@adeelone</span>
    </div>
    <p class="profile-preview-copy">Recent repos, pinned work, and the projects that usually matter most when someone wants to check how I build.</p>
    <div class="profile-preview-stats">
      <div class="profile-preview-stat">
        <span class="profile-preview-stat-label">Repos</span>
        <strong>${repos.length}</strong>
      </div>
      <div class="profile-preview-stat">
        <span class="profile-preview-stat-label">Pinned</span>
        <strong>${pinned.length || "0"}</strong>
      </div>
      <div class="profile-preview-stat">
        <span class="profile-preview-stat-label">Latest</span>
        <strong>${latest ? latest.name : "Active"}</strong>
      </div>
    </div>
    <div class="tag-list">${repos.slice(0, 4).map((repo) => `<span class="tag">${repo.name}</span>`).join("")}</div>
    <div class="profile-preview-actions">
      ${anchor(profile.github, "Open GitHub", "action-banner", "github")}
    </div>
  `;

  linkedinPreview.innerHTML = `
    <div class="profile-preview-head">
      <div>
        <p class="eyebrow">LinkedIn preview</p>
        <h3 class="profile-preview-title">The professional profile I keep most current</h3>
      </div>
      <span class="profile-preview-handle">Aden Ramirez</span>
    </div>
    <p class="profile-preview-copy">${profile.subtitle}</p>
    <div class="profile-preview-meta">
      <span>${profile.location}</span>
      <span>${profile.education.school}</span>
      <span>${profile.education.graduation}</span>
    </div>
    <div class="tag-list">
      <span class="tag">Backend</span>
      <span class="tag">Full-stack</span>
      <span class="tag">Testing</span>
      <span class="tag">Student Engineer</span>
    </div>
    <div class="profile-preview-actions">
      ${anchor(profile.linkedin, "Open LinkedIn", "action-banner", "linkedin")}
    </div>
  `;
}

function projectCard(project) {
  const cover = project.screenshot
    ? `<img src="${project.screenshot}" alt="${project.name} project cover" loading="lazy" />`
    : `<img src="${coverData(project)}" alt="${project.name} generated project cover" loading="lazy" />`;
  const chips = (project.tech ?? []).slice(0, 5).map((tag) => `<span class="project-chip">${tag}</span>`).join("");
  const highlights = project.highlights?.length
    ? `<ul class="detail-list project-list">${project.highlights.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul>`
    : `<p class="project-copy">${project.description || "No description yet."}</p>`;
  const stars = project.stars > 0 ? `<span class="project-mini">${icon("star")} ${project.stars}</span>` : "";
  const live = project.homepage
    ? anchor(project.homepage, "Live", "project-link", "arrow")
    : project.is_private
      ? `<span class="private-pill">Private repo</span>`
      : "";
  const code = project.url
    ? anchor(project.url, "Code", "project-link project-link-primary", "arrow")
    : `<span class="private-pill">Private repo</span>`;

  return `
    <article class="project-card">
      <div class="project-cover">${cover}</div>
      <div class="project-body">
        <div class="project-topline">
          <div>
            <h3 class="project-name">${project.name}</h3>
            <p class="project-copy">${project.description || "No description yet."}</p>
          </div>
          ${stars}
        </div>
        ${highlights}
        <div class="project-tech">${chips}</div>
        <div class="project-footer">
          <span class="project-mini">${project.pushed_at ? `Updated ${formatDate(project.pushed_at)}` : "Private repo"}</span>
          <div class="project-actions">${code}${live}</div>
        </div>
      </div>
    </article>
  `;
}

function renderProjects(projects, profile) {
  const sorted = [...projects.repos]
    .filter((project) => project.slug !== "portfolio-site")
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      const aDate = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
      const bDate = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
      return bDate - aDate;
    });

  const featured = sorted.slice(0, 6);
  const pinned = sorted.filter((project) => project.is_pinned).map((project) => project.name);
  const generated = projects.generated_at
    ? new Date(projects.generated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "unknown";

  document.querySelector("#projects-grid").innerHTML = featured.map(projectCard).join("");
  document.querySelector("#projects-profile-link").href = profile.github;
  document.querySelector("#project-summary-banner").innerHTML = `
    <div class="summary-pill">
      <span class="summary-label">Repos in feed</span>
      <strong>${sorted.length}</strong>
    </div>
    <div class="summary-pill">
      <span class="summary-label">Pinned on GitHub</span>
      <strong>${pinned.length ? pinned.join(", ") : "None right now"}</strong>
    </div>
    <div class="summary-pill">
      <span class="summary-label">Last sync</span>
      <strong>${generated}</strong>
    </div>
  `;
}

function renderCareer(profile) {
  document.querySelector("#career-note-title").textContent = profile.career_note.title;
  document.querySelector("#career-note-copy").textContent = profile.career_note.copy;

  document.querySelector("#career-links").innerHTML = careerItems
    .map((item) => {
      const href = profile.career_links?.[item.key];
      if (href) return anchor(href, item.label, "stack-link", item.icon, item.note);
      return placeholderLink(item.label, item.icon, "Add link in owner mode", "stack-link contact-link-muted");
    })
    .join("");
}

function renderCommunity(profile) {
  document.querySelector("#community-banner").textContent = profile.community.banner;
  document.querySelector("#community-copy").textContent = profile.community.copy;
  document.querySelector("#community-links").innerHTML = [
    placeholderLink("Internships", "briefcase", "Recruiting, referrals, part-time tech roles", "stack-link contact-link-muted"),
    placeholderLink("Projects", "github", "Build conversations, collaboration, student work", "stack-link contact-link-muted"),
    placeholderLink("Scheduling", "calendar", profile.calendar?.href ? "Use the calendar link in the contact bar" : "Add a booking link in owner mode", "stack-link contact-link-muted")
  ].join("");
}

function renderFooter(projects) {
  const generated = projects.generated_at
    ? new Date(projects.generated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "unknown";
  document.querySelector("#footer-built").innerHTML =
    `Built with HTML, CSS, JavaScript, and a small Node backend for owner edits and outreach capture. Project data last synced ${generated}. <a class="section-link" href="https://github.com/adeelone/portfolio-site" target="_blank" rel="noopener">Source</a>`;
}

function renderAll() {
  renderHero(currentProfile);
  renderContact(currentProfile);
  renderAbout(currentProfile);
  renderEducation(currentProfile);
  renderExperience(currentProfile);
  renderProjects(projectsData, currentProfile);
  renderCareer(currentProfile);
  renderProfilePreviews(currentProfile, projectsData);
  renderCommunity(currentProfile);
  renderFooter(projectsData);
}

function enableStickyContact() {
  if (getComputedStyle(document.querySelector(".contact-bar")).position !== "sticky") return;
  const hero = document.querySelector(".hero");
  const bar = document.querySelector(".contact-bar");
  const observer = new IntersectionObserver(
    ([entry]) => {
      bar.classList.toggle("is-condensed", !entry.isIntersecting);
    },
    { threshold: 0.18 }
  );
  observer.observe(hero);
}

function enableScrollspy() {
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const href = `#${entry.target.id}`;
        links.forEach((link) => link.removeAttribute("aria-current"));
        links.find((link) => link.getAttribute("href") === href)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));
}

function enableMenu() {
  const header = document.querySelector(".site-header");
  const button = document.querySelector(".menu-toggle");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  button.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    })
  );
}

function enableReveals() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );
  elements.forEach((element) => observer.observe(element));
}

function ownerElements() {
  return {
    trigger: document.querySelector("#owner-trigger"),
    modal: document.querySelector("#owner-modal"),
    modalBackdrop: document.querySelector("#owner-modal-backdrop"),
    loginForm: document.querySelector("#owner-login-form"),
    email: document.querySelector("#owner-email"),
    code: document.querySelector("#owner-code"),
    error: document.querySelector("#owner-error"),
    cancel: document.querySelector("#owner-cancel"),
    drawer: document.querySelector("#owner-drawer"),
    close: document.querySelector("#owner-close"),
    editor: document.querySelector("#owner-editor"),
    status: document.querySelector("#editor-status"),
    resume: document.querySelector("#editor-resume"),
    linkedin: document.querySelector("#editor-linkedin"),
    github: document.querySelector("#editor-github"),
    calendar: document.querySelector("#editor-calendar"),
    handshake: document.querySelector("#editor-handshake"),
    indeed: document.querySelector("#editor-indeed"),
    ziprecruiter: document.querySelector("#editor-ziprecruiter"),
    about0: document.querySelector("#editor-about-0"),
    experience: document.querySelector("#editor-experience"),
    additional: document.querySelector("#editor-additional"),
    json: document.querySelector("#editor-json"),
    exportButton: document.querySelector("#owner-export"),
    importInput: document.querySelector("#owner-import"),
    resetButton: document.querySelector("#owner-reset"),
    logoutButton: document.querySelector("#owner-logout"),
    saveNote: document.querySelector("#owner-save-note"),
    uploadFile: document.querySelector("#owner-resume-file"),
    uploadButton: document.querySelector("#owner-upload-resume"),
    refreshSubmissions: document.querySelector("#owner-refresh-submissions"),
    submissionsList: document.querySelector("#owner-submissions-list"),
    refreshLogins: document.querySelector("#owner-refresh-logins"),
    loginsList: document.querySelector("#owner-logins-list")
  };
}

function openOwnerModal() {
  const ui = ownerElements();
  ui.modal.hidden = false;
  ui.error.hidden = true;
  ui.email.focus();
}

function closeOwnerModal() {
  ownerElements().modal.hidden = true;
}

function openOwnerDrawer() {
  const ui = ownerElements();
  ui.drawer.hidden = false;
  ui.trigger.classList.add("is-active");
}

function closeOwnerDrawer() {
  const ui = ownerElements();
  ui.drawer.hidden = true;
  ui.trigger.classList.remove("is-active");
}

function syncOwnerEditor() {
  const ui = ownerElements();
  if (!ui.editor || !currentProfile) return;
  ui.status.value = currentProfile.current_status;
  ui.resume.value = currentProfile.resume;
  ui.linkedin.value = currentProfile.linkedin;
  ui.github.value = currentProfile.github;
  ui.calendar.value = currentProfile.calendar?.href ?? "";
  ui.handshake.value = currentProfile.career_links?.handshake ?? "";
  ui.indeed.value = currentProfile.career_links?.indeed ?? "";
  ui.ziprecruiter.value = currentProfile.career_links?.ziprecruiter ?? "";
  ui.about0.value = currentProfile.about?.[0] ?? "";
  ui.experience.value = JSON.stringify(currentProfile.experience, null, 2);
  ui.additional.value = JSON.stringify(currentProfile.additional_experience, null, 2);
  ui.json.value = JSON.stringify(currentProfile, null, 2);
}

function exportProfileJson() {
  const blob = new Blob([`${JSON.stringify(currentProfile, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "profile.json";
  link.click();
  URL.revokeObjectURL(url);
}

function applyQuickForm(profile, ui) {
  const next = structuredClone(profile);
  next.current_status = ui.status.value.trim() || next.current_status;
  next.resume = ui.resume.value.trim() || next.resume;
  next.linkedin = ui.linkedin.value.trim() || next.linkedin;
  next.github = ui.github.value.trim() || next.github;
  next.calendar.href = ui.calendar.value.trim();
  next.career_links.handshake = ui.handshake.value.trim();
  next.career_links.indeed = ui.indeed.value.trim();
  next.career_links.ziprecruiter = ui.ziprecruiter.value.trim();
  if (next.about?.length) next.about[0] = ui.about0.value.trim() || next.about[0];
  next.experience = JSON.parse(ui.experience.value);
  next.additional_experience = JSON.parse(ui.additional.value);
  return next;
}

function currentProfileJson() {
  return JSON.stringify(currentProfile, null, 2);
}

async function saveProfileToBackend(profile) {
  const saved = await requestJson("/api/profile", {
    method: "PUT",
    body: JSON.stringify(profile)
  });
  baseProfile = structuredClone(saved);
  currentProfile = structuredClone(saved);
  renderAll();
  syncOwnerEditor();
  return saved;
}

async function uploadResume(file) {
  const bytes = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const response = await requestJson("/api/upload/resume", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentBase64: base64
    })
  });
  currentProfile.resume = response.resume;
  baseProfile.resume = response.resume;
  renderAll();
  syncOwnerEditor();
  return response.resume;
}

function submissionCard(submission) {
  const when = submission.createdAt
    ? new Date(submission.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Unknown time";

  return `
    <article class="submission-card">
      <div class="role-topline">
        <p class="eyebrow">${submission.topic || "General outreach"}</p>
        <span class="role-dates">${when}</span>
      </div>
      <h3>${submission.name || "Anonymous"}${submission.company ? ` · ${submission.company}` : ""}</h3>
      <p class="detail-copy">${submission.email || "No email provided"}${submission.timeline ? ` · ${submission.timeline}` : ""}</p>
      ${submission.link ? `<p class="detail-copy"><a class="section-link" href="${submission.link}" target="_blank" rel="noopener">${submission.link}</a></p>` : ""}
      <p class="additional-context">${submission.message || ""}</p>
    </article>
  `;
}

async function loadSubmissions() {
  const ui = ownerElements();
  if (!ownerAuthenticated) {
    ui.submissionsList.innerHTML = `<p class="owner-copy">Unlock owner mode to view outreach.</p>`;
    return;
  }

  ui.submissionsList.innerHTML = `<p class="owner-copy">Loading outreach...</p>`;
  try {
    const payload = await requestJson("/api/submissions");
    const submissions = payload.submissions ?? [];
    ui.submissionsList.innerHTML = submissions.length
      ? submissions.map(submissionCard).join("")
      : `<p class="owner-copy">No recruiter or community submissions yet.</p>`;
  } catch (error) {
    ui.submissionsList.innerHTML = `<p class="owner-error">${error.message}</p>`;
  }
}

function loginEventCard(event) {
  const when = event.createdAt
    ? new Date(event.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Unknown time";

  return `
    <article class="submission-card">
      <div class="role-topline">
        <p class="eyebrow">Owner login</p>
        <span class="role-dates">${when}</span>
      </div>
      <h3>${event.email || "Unknown email"}</h3>
      <p class="detail-copy">${event.ip || "Unknown IP"}</p>
      <p class="additional-context">${event.userAgent || "No user agent recorded."}</p>
    </article>
  `;
}

async function loadLoginEvents() {
  const ui = ownerElements();
  if (!ownerAuthenticated) {
    ui.loginsList.innerHTML = `<p class="owner-copy">Unlock owner mode to view login history.</p>`;
    return;
  }

  ui.loginsList.innerHTML = `<p class="owner-copy">Loading login history...</p>`;
  try {
    const payload = await requestJson("/api/login-events");
    const events = payload.events ?? [];
    ui.loginsList.innerHTML = events.length
      ? events.map(loginEventCard).join("")
      : `<p class="owner-copy">No owner login events recorded yet.</p>`;
  } catch (error) {
    ui.loginsList.innerHTML = `<p class="owner-error">${error.message}</p>`;
  }
}

async function restoreSession() {
  try {
    const session = await requestJson("/api/auth/session");
    ownerAuthenticated = Boolean(session.authenticated);
    if (ownerAuthenticated) {
      openOwnerDrawer();
      syncOwnerEditor();
      await loadSubmissions();
      await loadLoginEvents();
    }
  } catch {
    ownerAuthenticated = false;
  }
}

function setOwnerMessage(message, isError = false) {
  const ui = ownerElements();
  ui.saveNote.textContent = message;
  ui.saveNote.classList.toggle("owner-error", isError);
}

function setLoginError(message = "That combination did not match.") {
  const ui = ownerElements();
  ui.error.textContent = message;
  ui.error.hidden = false;
}

function enableOwnerMode() {
  const ui = ownerElements();
  let triggerCount = 0;
  let triggerTimer = null;

  ui.trigger.addEventListener("click", () => {
    if (ownerAuthenticated) {
      if (ui.drawer.hidden) openOwnerDrawer();
      else closeOwnerDrawer();
      return;
    }
    triggerCount += 1;
    clearTimeout(triggerTimer);
    triggerTimer = setTimeout(() => {
      triggerCount = 0;
    }, 1200);
    if (triggerCount >= 4) {
      triggerCount = 0;
      openOwnerModal();
    }
  });

  ui.cancel.addEventListener("click", closeOwnerModal);
  ui.modalBackdrop.addEventListener("click", closeOwnerModal);
  ui.close.addEventListener("click", closeOwnerDrawer);

  window.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      if (ownerAuthenticated) openOwnerDrawer();
      else openOwnerModal();
    }
  });

  ui.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    ui.error.hidden = true;
    try {
      const session = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: ui.email.value.trim(),
          code: ui.code.value.trim()
        })
      });
      ownerAuthenticated = Boolean(session.authenticated);
      ui.code.value = "";
      closeOwnerModal();
      openOwnerDrawer();
      syncOwnerEditor();
      setOwnerMessage("Owner mode unlocked. Changes now save to the backend profile file.");
      await loadSubmissions();
      await loadLoginEvents();
    } catch (error) {
      setLoginError(error.message);
    }
  });

  ui.editor.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const jsonChanged = ui.json.value.trim() !== currentProfileJson().trim();
      const next = jsonChanged ? JSON.parse(ui.json.value.trim()) : applyQuickForm(currentProfile, ui);
      await saveProfileToBackend(next);
      setOwnerMessage("Profile saved to the backend. Reloading this site will keep the update.");
    } catch (error) {
      setOwnerMessage(`Could not save changes: ${error.message}`, true);
    }
  });

  ui.exportButton.addEventListener("click", exportProfileJson);

  ui.resetButton.addEventListener("click", async () => {
    try {
      const profile = await loadProfile();
      baseProfile = structuredClone(profile);
      currentProfile = structuredClone(profile);
      renderAll();
      syncOwnerEditor();
      setOwnerMessage("Reloaded the saved backend profile.");
    } catch (error) {
      setOwnerMessage(`Could not reload profile: ${error.message}`, true);
    }
  });

  ui.logoutButton.addEventListener("click", async () => {
    try {
      await requestJson("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
    } catch {}
    ownerAuthenticated = false;
    closeOwnerDrawer();
    setOwnerMessage("Owner mode locked.");
  });

  ui.importInput.addEventListener("change", async () => {
    const file = ui.importInput.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      await saveProfileToBackend(parsed);
      setOwnerMessage("Imported JSON and saved it to the backend.");
    } catch (error) {
      setOwnerMessage(`Import failed: ${error.message}`, true);
    } finally {
      ui.importInput.value = "";
    }
  });

  ui.uploadButton.addEventListener("click", async () => {
    const file = ui.uploadFile.files?.[0];
    if (!file) {
      setOwnerMessage("Choose a PDF first.", true);
      return;
    }
    try {
      const resumePath = await uploadResume(file);
      ui.resume.value = resumePath;
      setOwnerMessage(`Resume uploaded to ${resumePath}.`);
    } catch (error) {
      setOwnerMessage(`Resume upload failed: ${error.message}`, true);
    } finally {
      ui.uploadFile.value = "";
    }
  });

  ui.refreshSubmissions.addEventListener("click", () => {
    void loadSubmissions();
  });

  ui.refreshLogins.addEventListener("click", () => {
    void loadLoginEvents();
  });
}

function enableCommunityForm() {
  const form = document.querySelector("#community-form");
  const result = document.querySelector("#community-result");
  const copyEmail = document.querySelector("#community-copy-email");
  const copyPhone = document.querySelector("#community-copy-phone");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      link: String(data.get("link") ?? "").trim(),
      topic: String(data.get("topic") ?? "").trim(),
      timeline: String(data.get("timeline") ?? "").trim(),
      message: String(data.get("message") ?? "").trim()
    };

    try {
      await requestJson("/api/submissions", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      form.reset();
      result.textContent = "Message sent. Aden can now see it in the owner panel.";
      if (ownerAuthenticated) void loadSubmissions();
    } catch (error) {
      result.textContent = `Could not send message: ${error.message}`;
    }
  });

  copyEmail.addEventListener("click", async () => {
    await navigator.clipboard.writeText(currentProfile.email);
    result.textContent = "Email copied.";
  });

  copyPhone.addEventListener("click", async () => {
    await navigator.clipboard.writeText(currentProfile.phone);
    result.textContent = "Phone number copied.";
  });
}

async function init() {
  try {
    const [profile, projects] = await Promise.all([loadProfile(), loadProjects()]);
    baseProfile = structuredClone(profile);
    currentProfile = structuredClone(profile);
    projectsData = projects;
    renderAll();
    enableScrollspy();
    enableMenu();
    enableReveals();
    enableOwnerMode();
    enableCommunityForm();
    syncOwnerEditor();
    await restoreSession();
  } catch (error) {
    console.error(error);
  }
}

init();
