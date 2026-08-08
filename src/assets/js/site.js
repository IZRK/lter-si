const body = document.body;

const normalizeText = (value = "") => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

// Mobile navigation
const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.querySelector("[data-primary-nav]");

const closeNavigation = ({ restoreFocus = false } = {}) => {
  if (!navToggle || !primaryNav) return;
  const wasOpen = primaryNav.classList.contains("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  primaryNav.classList.remove("is-open");
  body.classList.remove("nav-open");
  if (restoreFocus && wasOpen) navToggle.focus();
};

navToggle?.addEventListener("click", () => {
  const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(willOpen));
  primaryNav?.classList.toggle("is-open", willOpen);
  body.classList.toggle("nav-open", willOpen);
});

const navGroups = [...document.querySelectorAll(".nav-group")];
navGroups.forEach((group) => {
  if (group.querySelector('[aria-current="page"]')) group.classList.add("has-current");
  group.addEventListener("toggle", () => {
    if (!group.open || window.matchMedia("(max-width: 59rem)").matches) return;
    navGroups.filter((candidate) => candidate !== group).forEach((candidate) => candidate.removeAttribute("open"));
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".nav-group")) navGroups.forEach((group) => group.removeAttribute("open"));
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 944) closeNavigation();
});

// Search dialog and keyboard shortcut
const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = searchDialog?.querySelector("[data-site-search]");
const searchItems = [...(searchDialog?.querySelectorAll("[data-search-item]") || [])];
const searchStatus = searchDialog?.querySelector("[data-search-status]");
const searchEmpty = searchDialog?.querySelector("[data-search-empty]");
const activeLanguage = body.dataset.lang || "en";
const pluralRules = new Intl.PluralRules(activeLanguage === "sl" ? "sl" : "en");
const searchBrowseLabel = searchStatus?.textContent || "";
let searchReturnFocus = null;

const pluralLabel = (element, count) => {
  const category = pluralRules.select(count);
  const key = `results${category[0].toUpperCase()}${category.slice(1)}`;
  return element?.dataset[key] || element?.dataset.resultsOther || "";
};

const filterSearch = () => {
  const query = normalizeText(searchInput?.value);
  let visible = 0;
  searchItems.forEach((item) => {
    const matches = !query || normalizeText(item.dataset.searchText).includes(query);
    item.hidden = !matches;
    if (matches) visible += 1;
  });
  if (searchStatus) searchStatus.textContent = query ? `${visible} ${pluralLabel(searchDialog, visible)}` : searchBrowseLabel;
  if (searchEmpty) searchEmpty.hidden = visible !== 0;
};

const openSearch = () => {
  const openedFromMobileNav = primaryNav?.classList.contains("is-open");
  const activeElement = document.activeElement;
  searchReturnFocus = openedFromMobileNav
    ? navToggle
    : activeElement instanceof HTMLElement && activeElement !== body
      ? activeElement
      : window.matchMedia("(max-width: 59rem)").matches
        ? navToggle
        : document.querySelector("[data-search-open]");
  closeNavigation();
  navGroups.forEach((group) => group.removeAttribute("open"));
  if (!searchDialog) return;
  if (typeof searchDialog.showModal === "function") searchDialog.showModal();
  else searchDialog.setAttribute("open", "");
  window.setTimeout(() => searchInput?.focus(), 30);
};

const closeSearch = () => {
  if (!searchDialog?.open) return;
  searchDialog.close();
  const returnTarget = searchReturnFocus;
  searchReturnFocus = null;
  returnTarget?.focus();
};

document.querySelectorAll("[data-search-open]").forEach((button) => button.addEventListener("click", openSearch));
searchDialog?.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
searchInput?.addEventListener("input", filterSearch);

searchDialog?.addEventListener("click", (event) => {
  if (event.target === searchDialog) closeSearch();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
  if (event.key === "Escape" && searchDialog?.open) {
    event.preventDefault();
    closeSearch();
    return;
  }
  if (event.key === "/" && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    openSearch();
  }
  if (event.key === "Escape") {
    const focusedGroup = navGroups.find((group) => group.open && group.contains(document.activeElement));
    const mobileNavOpen = primaryNav?.classList.contains("is-open");
    closeNavigation({ restoreFocus: mobileNavOpen });
    navGroups.forEach((group) => group.removeAttribute("open"));
    if (!mobileNavOpen && focusedGroup) focusedGroup.querySelector("summary")?.focus();
  }
});

// Research-site filters
const siteCards = [...document.querySelectorAll("[data-site-card]")];
document.querySelectorAll("[data-site-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.siteFilter;
    document.querySelectorAll("[data-site-filter]").forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    siteCards.forEach((card) => {
      card.hidden = filter !== "all" && !card.dataset.ecosystem.includes(filter);
    });
  });
});

// Turn the imported WordPress publication/event paragraphs into a filterable archive.
const archiveTools = document.querySelector("[data-archive-tools]");
if (archiveTools) {
  const type = archiveTools.dataset.archiveType;
  const entryContent = document.querySelector("[data-entry-content]");
  const paragraphs = [...(entryContent?.querySelectorAll(":scope > p") || [])];
  const yearHeadings = [];
  const entries = [];
  let currentYear = "";

  paragraphs.forEach((paragraph) => {
    const text = paragraph.textContent.trim();
    if (type === "publications" && /^(?:19|20)\d{2}$/.test(text)) {
      currentYear = text;
      paragraph.classList.add("archive-year");
      paragraph.dataset.year = currentYear;
      yearHeadings.push(paragraph);
      return;
    }
    paragraph.classList.add("archive-entry");
    paragraph.dataset.year = currentYear;
    paragraph.dataset.searchText = normalizeText(text);
    entries.push(paragraph);
  });

  const input = archiveTools.querySelector("[data-archive-search]");
  const yearSelect = archiveTools.querySelector("[data-archive-year]");
  const status = archiveTools.querySelector("[data-archive-status]");

  const filterArchive = () => {
    const query = normalizeText(input?.value);
    const selectedYear = yearSelect?.value || "all";
    let visible = 0;
    const visibleYears = new Set();

    entries.forEach((entry) => {
      const matchesText = !query || entry.dataset.searchText.includes(query);
      const matchesYear = selectedYear === "all" || entry.dataset.year === selectedYear;
      const matches = matchesText && matchesYear;
      entry.hidden = !matches;
      if (matches) {
        visible += 1;
        if (entry.dataset.year) visibleYears.add(entry.dataset.year);
      }
    });

    yearHeadings.forEach((heading) => {
      heading.hidden = !visibleYears.has(heading.dataset.year);
    });

    if (status) status.textContent = `${visible} ${pluralLabel(archiveTools, visible)}`;
  };

  input?.addEventListener("input", filterArchive);
  yearSelect?.addEventListener("change", filterArchive);
  filterArchive();
}

// Harden imported external links without changing their visible source content.
document.querySelectorAll(".entry-content a[href^='http']").forEach((link) => {
  try {
    const target = new URL(link.href);
    if (target.origin !== window.location.origin) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  } catch {
    // Leave malformed legacy links untouched so their text remains available.
  }
});

document.documentElement.classList.add("js-ready");
