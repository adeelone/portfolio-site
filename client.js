const nav = document.querySelector("#nav");
const menuButton = document.querySelector(".menu-button");
const resumeDialog = document.querySelector("#resume-dialog");

function normalizeSearch(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function filterProjects() {
  const searchInput = document.querySelector("#project-search");
  const activeFilter = document.querySelector("[data-filter].active")?.dataset.filter || "all";
  const query = normalizeSearch(searchInput?.value);
  const compactQuery = query.replaceAll(" ", "");
  let visible = 0;
  document.querySelectorAll("[data-project]").forEach((item) => {
    const search = normalizeSearch(item.dataset.search);
    const textMatch = search.includes(query) || search.replaceAll(" ", "").includes(compactQuery);
    const match = textMatch && item.dataset.kinds.split(" ").includes(activeFilter);
    item.hidden = !match;
    if (match) visible += 1;
  });
  const empty = document.querySelector("#empty-projects");
  if (empty) empty.hidden = visible > 0;
}

document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
  filterProjects();
}));

document.querySelector("#project-search")?.addEventListener("input", filterProjects);

menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    const status = document.querySelector("#copy-status");
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      if (status) status.textContent = `${copyButton.dataset.copy} copied to your clipboard.`;
      copyButton.textContent = "Copied";
    } catch {
      if (status) status.textContent = `Copy was unavailable. Select ${copyButton.dataset.copy} manually.`;
    }
  }

  if (event.target.closest("[data-resume-open]")) {
    const frame = document.querySelector("#resume-frame");
    if (!frame.src) frame.src = document.querySelector("[data-resume-src].active").dataset.resumePreview;
    resumeDialog?.showModal();
  }
  if (event.target.closest("[data-resume-close]")) resumeDialog?.close();

  const choice = event.target.closest("[data-resume-src]");
  if (choice) {
    document.querySelectorAll("[data-resume-src]").forEach((button) => button.classList.toggle("active", button === choice));
    const frame = document.querySelector("#resume-frame");
    frame.src = choice.dataset.resumePreview;
    frame.alt = `Preview of Aden Ramirez's ${choice.textContent.trim().toLowerCase()} resume`;
    document.querySelector("#resume-download").href = choice.dataset.resumeSrc;
  }
});

resumeDialog?.addEventListener("click", (event) => {
  if (event.target === resumeDialog) resumeDialog.close();
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
