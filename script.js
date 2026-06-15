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
  arrow:
    "M5.25 12h13.5m0 0-4.5-4.5m4.5 4.5-4.5 4.5",
  star:
    "m12 3.75 2.62 5.3 5.85.85-4.24 4.13 1 5.84L12 17.1l-5.23 2.77 1-5.84-4.24-4.13 5.85-.85L12 3.75Z"
};

const socialItems = [
  { key: "phone", label: "Phone", icon: "phone", external: false },
  { key: "email", label: "Email", icon: "mail", external: false },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin", external: true },
  { key: "github", label: "GitHub", icon: "github", external: true },
  { key: "resume", label: "Resume", icon: "file", external: true }
];

const paletteByTech = {
  Java: ["#2952a3", "#0d1b39"],
  Python: ["#2f8f6b", "#10291f"],
  TypeScript: ["#2563eb", "#0b1d4a"],
  React: ["#0f7c93", "#09212a"],
  HTML: ["#b95d2c", "#2d1309"],
  default: ["#3f6ff0", "#10192d"]
};

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

function projectPalette(project) {
  const primary = project.tech?.[0] ?? project.languages?.[0] ?? "default";
  return paletteByTech[primary] ?? paletteByTech.default;
}

function makeCoverData(project) {
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
      <rect width="640" height="400" rx="32" fill="url(#g)" />
      <circle cx="510" cy="88" r="74" fill="rgba(255,255,255,0.08)" />
      <circle cx="130" cy="330" r="96" fill="rgba(255,255,255,0.05)" />
      <text x="48" y="120" fill="rgba(255,255,255,0.94)" font-family="Inter, sans-serif" font-size="96" font-weight="800">${label}</text>
      <text x="50" y="312" fill="rgba(255,255,255,0.8)" font-family="IBM Plex Mono, monospace" font-size="24">${subtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function createButton(label, href, primary = false) {
  const external = href.startsWith("http");
  return `
    <a class="button ${primary ? "button-primary" : ""}" href="${href}" ${external ? 'target="_blank" rel="noopener"' : ""}>
      ${label}
    </a>
  `;
}

function renderProfile(profile) {
  document.querySelector(".hero-name").textContent = profile.name;
  document.querySelector("#hero-pitch").textContent = profile.title;
  document.querySelector("#hero-pitch-secondary").textContent = profile.subtitle;
  document.querySelector("#status-line").textContent = profile.current_status;
  document.querySelector("#hero-actions").innerHTML = [
    createButton("View resume", profile.resume, true),
    createButton("GitHub", profile.github)
  ].join("");

  const contactBar = document.querySelector("#contact-items");
  contactBar.innerHTML = socialItems
    .map((item) => {
      const hrefKey = item.external || item.key === "resume" ? item.key : `${item.key}_href`;
      const href = profile[hrefKey] ?? profile[item.key];
      const text = profile[item.key] ?? item.label;
      const attrs = item.external ? 'target="_blank" rel="noopener" aria-label="' : 'aria-label="';
      const label = `${item.label}: ${text}"`;
      return `<a class="contact-link" href="${href}" ${attrs}${label}>${icon(item.icon)}<span>${text}</span></a>`;
    })
    .join("");

  const aboutRoot = document.querySelector("#about-copy");
  aboutRoot.innerHTML = profile.about.map((paragraph) => `<p>${paragraph}</p>`).join("");

  document.querySelector("#education-summary").innerHTML = `
    <h3>${profile.education.school}</h3>
    <p>${profile.education.degree}</p>
    <p>${profile.education.graduation}</p>
    <p>GPA: ${profile.education.gpa}</p>
    ${profile.education.honors.map((item) => `<p>${item}</p>`).join("")}
  `;

  document.querySelector("#coursework-chips").innerHTML = profile.education.coursework
    .map((course) => `<span class="chip">${course}</span>`)
    .join("");
  document.querySelector("#semester-focus").textContent = profile.semester_focus;

  document.querySelector("#experience-cards").innerHTML = profile.experience
    .map(
      (role) => `
        <article class="experience-card">
          <div class="experience-card-head">
            <div>
              <h3>${role.company}</h3>
              <p class="role-meta">${role.title}</p>
            </div>
            <p class="role-meta">${role.dates}</p>
          </div>
          <p class="role-meta">${role.location}</p>
          <p class="experience-context">${role.context}</p>
          <ul>${role.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
          <div class="tag-list">${role.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </article>
      `
    )
    .join("");

  document.querySelector("#additional-grid").innerHTML = profile.additional_experience
    .map(
      (role) => `
        <article class="additional-card${role.title === "Details coming" ? " additional-card-pending" : ""}">
          <div class="additional-card-head">
            <div>
              <h3>${role.company}</h3>
              <p class="role-meta">${role.title}</p>
            </div>
            <p class="role-meta">${role.dates}</p>
          </div>
          <p class="additional-context">${role.context}</p>
        </article>
      `
    )
    .join("");
}

function projectCard(project) {
  const cover = project.screenshot
    ? `<img src="${project.screenshot}" alt="${project.name} project cover" loading="lazy" />`
    : `<img src="${makeCoverData(project)}" alt="${project.name} generated project cover" loading="lazy" />`;

  const chips = (project.tech ?? []).slice(0, 5).map((tag) => `<span class="project-chip">${tag}</span>`).join("");
  const highlights =
    project.highlights?.length > 0
      ? `<ul class="project-highlights">${project.highlights.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul>`
      : "";

  const stars = project.stars > 0 ? `<span class="project-meta">${icon("star")} ${project.stars}</span>` : "";
  const codeAction = project.url
    ? `<a class="project-link project-link-primary" href="${project.url}" target="_blank" rel="noopener">Code ${icon("arrow")}</a>`
    : `<span class="private-pill">Private repo</span>`;
  const liveAction = project.homepage
    ? `<a class="project-link" href="${project.homepage}" target="_blank" rel="noopener">Live ${icon("arrow")}</a>`
    : project.is_private
      ? `<span class="private-pill">Private repo</span>`
      : "";

  return `
    <article class="project-card">
      <div class="project-cover">${cover}</div>
      <div class="project-body">
        <div class="project-topline">
          <h3 class="project-name">${project.name}</h3>
          ${stars}
        </div>
        <p class="project-description">${project.description || "No description yet."}</p>
        ${highlights}
        <div class="project-foot">
          <div class="project-tech">${chips}</div>
          <span class="project-meta">${project.pushed_at ? `Updated ${formatDate(project.pushed_at)}` : "Private repo"}</span>
        </div>
        <div class="project-actions">
          ${codeAction}
          ${liveAction}
        </div>
      </div>
    </article>
  `;
}

function renderProjects(projects) {
  const sorted = [...projects.repos]
    .filter((project) => project.slug !== "portfolio-site")
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      const aDate = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
      const bDate = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
      return bDate - aDate;
    });

  document.querySelector("#projects-grid").innerHTML = sorted.slice(0, 6).map(projectCard).join("");
}

function renderFooter(projects) {
  const generated = projects.generated_at ? new Date(projects.generated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "unknown";
  document.querySelector("#footer-built").innerHTML =
    `Built with HTML, CSS, and JavaScript. Hosted on GitHub Pages. Last project sync ${generated}. <a class="inline-link" href="https://github.com/adeelone/portfolio-site" target="_blank" rel="noopener">Source</a>`;
}

function enableStickyContact() {
  const hero = document.querySelector(".hero");
  const contactBar = document.querySelector(".contact-bar");
  const observer = new IntersectionObserver(
    ([entry]) => {
      contactBar.classList.toggle("is-condensed", !entry.isIntersecting);
    },
    { threshold: 0.15 }
  );
  observer.observe(hero);
}

function enableScrollspy() {
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = `#${entry.target.id}`;
        const link = links.find((candidate) => candidate.getAttribute("href") === id);
        if (link && entry.isIntersecting) {
          links.forEach((candidate) => candidate.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
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
  const revealed = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealed.forEach((element) => observer.observe(element));
}

async function init() {
  try {
    const [profile, projects] = await Promise.all([loadJson("data/profile.json"), loadJson("data/projects.json")]);
    renderProfile(profile);
    renderProjects(projects);
    renderFooter(projects);
    document.querySelector("#projects-profile-link").href = profile.github;
    enableStickyContact();
    enableScrollspy();
    enableMenu();
    enableReveals();
  } catch (error) {
    console.error(error);
  }
}

init();
