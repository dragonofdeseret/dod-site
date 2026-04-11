/* ======================
   DATA SAFETY
========================= */

if (typeof archive === "undefined") {
  console.error("archive.js not loaded or has syntax errors");
  window.archive = [];
}

if (typeof exhibits === "undefined") {
  window.exhibits = [];
}

if (typeof questions === "undefined") {
  window.questions = [];
}

if (typeof publicQuestions === "undefined") {
  window.publicQuestions = [];
}

/* ======================
   HELPERS
========================= */

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortByDateDesc(items) {
  return [...items].sort(
    (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
  );
}

function sortByDateDescWithIdTiebreak(items) {
  return [...items].sort((a, b) => {
    const dateDiff =
      (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0);

    if (dateDiff !== 0) return dateDiff;

    const getIndex = (value) => {
      const match = String(value || "").match(/_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    return getIndex(a.id) - getIndex(b.id);
  });
}

function normalizeToArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value == null || value === "") return [];
  return [value];
}

function groupItemsByYear(items, sortYearsDesc = true) {
  const grouped = {};

  items.forEach((item) => {
    const year = item.year || toDate(item.date)?.getFullYear();
    if (!year) return;
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(item);
  });

  return Object.keys(grouped)
    .map(Number)
    .sort((a, b) => (sortYearsDesc ? b - a : a - b))
    .map((year) => ({
      year: String(year),
      items: sortByDateDesc(grouped[year])
    }));
}

function buildYearNav(years, navEl = document.querySelector(".year-nav")) {
  if (!navEl) return;

  navEl.innerHTML = "";

  years.forEach((year) => {
    const link = document.createElement("a");
    link.href = `#year-${year}`;
    link.textContent = String(year);
    navEl.appendChild(link);
  });
}

function getThumbSrc(item) {
  return item.thumb || item.image || "";
}

function getThumbSrcset(item) {
  return item.thumbSrcset || "";
}

function getFullSrc(item) {
  return item.image || "";
}

function getFullSrcset(item) {
  return item.imageSrcset || "";
}

function applyGalleryImage(
  img,
  item,
  sizes = "(max-width: 900px) calc(100vw - 44px), 260px"
) {
  const src = getThumbSrc(item);
  const srcset = getThumbSrcset(item);

  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes;
  }

  img.src = src;
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = item.title || "";
}

function applyViewerImage(
  img,
  item,
  sizes = "(max-width: 700px) calc(100vw - 44px), (max-width: 1200px) calc(100vw - 120px), 900px"
) {
  const src = getFullSrc(item);
  const srcset = getFullSrcset(item);

  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes;
  }

  img.src = src;
  img.decoding = "async";
  img.alt = item.title || "";
}

function applyArchiveThumb(img, item) {
  const src = item.archiveThumb || item.thumb || item.image || "";
  const srcset = item.archiveThumbSrcset || "";

  if (srcset) {
    img.srcset = srcset;
    img.sizes = "60px";
  }

  img.src = src;
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = item.title || "";
}

function getItemUrl(item, from = "archive") {
  if (!item) return "#";

  if (item.type === "art") {
    return `artwork.html?id=${item.id}${from ? `&from=${from}` : ""}`;
  }

  if (item.type === "photo") {
    return `photography.html?id=${item.id}${from ? `&from=${from}` : ""}`;
  }

  if (item.type === "exhibit") {
    return `exhibit.html?id=${item.id}${from ? `&from=${from}` : ""}`;
  }

  if (item.type === "writing") {
    const isTrip =
      item.section === "trips" ||
      (Array.isArray(item.sections) && item.sections.includes("trips"));

    return isTrip
      ? `tripreports.html?id=${item.id}${from ? `&from=${from}` : ""}`
      : `writings.html?id=${item.id}${from ? `&from=${from}` : ""}`;
  }

  if (item.type === "margin" || item.type === "margins") {
    return `margins.html#${item.id}`;
  }

  if (item.type === "quote" || item.type === "quotes") {
    return `quotes.html#${item.id}`;
  }

  return item.link || "#";
}

function appendInlineTags(parent, values) {
  const tags = normalizeToArray(values);
  if (!tags.length) return;

  const wrap = document.createElement("div");
  wrap.className = "item-tags-inline";

  tags.forEach((tag) => {
    const pill = document.createElement("span");
    pill.className = "item-tag-inline";
    pill.textContent = tag;
    wrap.appendChild(pill);
  });

  parent.appendChild(wrap);
}

function toggleSetValue(set, value) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function renderMultiSelectFilter(
  container,
  values,
  selectedValues,
  onToggle,
  allLabel = "All"
) {
  if (!container) return;

  container.innerHTML = "";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = `tag-pill tag-pill-clear${
    selectedValues.size === 0 ? " active" : ""
  }`;
  clearButton.textContent = allLabel;
  clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle(null, true);
  });
  container.appendChild(clearButton);

  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tag-pill${selectedValues.has(value) ? " active" : ""}`;
    button.textContent = value;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onToggle(value, false);
    });
    container.appendChild(button);
  });
}

function setNavigation(navEl, prev, next, backHref, backText, makeUrl) {
  if (!navEl) return;

  navEl.innerHTML = `
    <div class="nav-left">
      ${prev ? `<a href="${makeUrl(prev)}">← Previous</a>` : ""}
    </div>
    <div class="nav-center">
      <a href="${backHref}">${backText}</a>
    </div>
    <div class="nav-right">
      ${next ? `<a href="${makeUrl(next)}">Next →</a>` : ""}
    </div>
  `;
}

function bindArrowNavigation(prevUrl, nextUrl) {
  document.addEventListener("keydown", (event) => {
    const lightboxOpen = document.querySelector(".image-viewer");

    if (event.key === "Escape" && lightboxOpen) {
      closeLightbox();
      return;
    }

    if (lightboxOpen) return;

    if (event.key === "ArrowLeft" && prevUrl) {
      window.location.href = prevUrl;
    }

    if (event.key === "ArrowRight" && nextUrl) {
      window.location.href = nextUrl;
    }
  });
}

/* ======================
   COLLAPSIBLE YEARS
========================= */

function getYearStorageKey(key) {
  return `year-collapse:${key || window.location.pathname}`;
}

function loadYearCollapseState(storageKey) {
  try {
    const raw = window.localStorage.getItem(getYearStorageKey(storageKey));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveYearCollapseState(storageKey, state) {
  try {
    window.localStorage.setItem(
      getYearStorageKey(storageKey),
      JSON.stringify(state || {})
    );
  } catch (error) {}
}

function getYearSectionYear(section) {
  if (!section) return "";
  return (
    section.dataset.year ||
    section.id.replace(/^year-/, "") ||
    section.querySelector("h2, .year-heading-label")?.textContent?.trim() ||
    ""
  );
}

function getYearSections(container) {
  if (!container) return [];
  return [
    ...container.querySelectorAll(
      ".gallery-year, .archive-year, .writing-year, .margins-year, .quotes-year"
    )
  ];
}

function getScrollOffset() {
  return window.matchMedia("(max-width: 700px)").matches ? 24 : 70;
}

function scrollToElementTop(element) {
  if (!element) return;

  const targetTop =
    element.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: window.matchMedia("(max-width: 700px)").matches ? "auto" : "smooth"
  });
}

function setYearCollapsed(section, collapsed) {
  if (!section) return;

  const toggle = section.querySelector(".year-toggle");
  const content = section.querySelector(".year-content");

  section.dataset.collapsed = collapsed ? "true" : "false";
  section.classList.toggle("is-collapsed", collapsed);
  section.classList.toggle("is-expanded", !collapsed);

  if (toggle) {
    toggle.textContent = collapsed ? "Expand" : "Collapse";
    toggle.setAttribute("aria-expanded", String(!collapsed));
  }

  if (content) {
    content.hidden = collapsed;
  }
}

function saveCurrentYearState(container, storageKey) {
  const state = {};

  getYearSections(container).forEach((section) => {
    state[getYearSectionYear(section)] = section.dataset.collapsed === "true";
  });

  saveYearCollapseState(storageKey, state);
}

function updateExpandAllButton(container, navEl) {
  if (!container || !navEl) return;

  const button = navEl.querySelector(".expand-all-button");
  if (!button) return;

  const sections = getYearSections(container);
  const hasCollapsed = sections.some(
    (section) => section.dataset.collapsed === "true"
  );

  button.textContent = hasCollapsed ? "Expand All" : "Collapse All";
  button.setAttribute("aria-expanded", String(!hasCollapsed));
}

function expandYearFromHash(hash) {
  if (!hash || !hash.startsWith("#year-")) return;

  const target = document.querySelector(hash);
  if (!target) return;

  setYearCollapsed(target, false);
}

function bindYearNavLinks(navEl, container, storageKey) {
  if (!navEl) return;

  [...navEl.querySelectorAll('a[href^="#year-"]')].forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = href ? document.querySelector(href) : null;
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();

      setYearCollapsed(target, false);
      saveCurrentYearState(container, storageKey);
      updateExpandAllButton(container, navEl);
      scrollToElementTop(target);

      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    });
  });
}

function ensureExpandAllButton(navEl, container, storageKey) {
  if (!navEl || !container) return;

  let button = navEl.querySelector(".expand-all-button");

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "expand-all-button";
    navEl.prepend(button);
  }

  button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const sections = getYearSections(container);
    const shouldExpand = sections.some(
      (section) => section.dataset.collapsed === "true"
    );

    sections.forEach((section) => {
      setYearCollapsed(section, shouldExpand ? false : true);
    });

    saveCurrentYearState(container, storageKey);
    updateExpandAllButton(container, navEl);
  };

  updateExpandAllButton(container, navEl);
}

function buildYearHeader(section, heading, storageKey, container, navEl) {
  if (!section || !heading) return;

  section.dataset.year = getYearSectionYear(section);

  const labelText = section.dataset.year || heading.textContent.trim();
  heading.classList.add("year-heading");

  const inner = document.createElement("div");
  inner.className = "year-heading-inner";

  const label = document.createElement("span");
  label.className = "year-heading-label";
  label.textContent = labelText;

  const controls = document.createElement("div");
  controls.className = "year-heading-controls";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "year-toggle";

  const topButton = document.createElement("button");
  topButton.type = "button";
  topButton.className = "year-scroll-top";
  topButton.textContent = "Scroll to Top";

  controls.appendChild(toggle);
  controls.appendChild(topButton);
  inner.appendChild(label);
  inner.appendChild(controls);

  heading.textContent = "";
  heading.appendChild(inner);

  let content = section.querySelector(":scope > .year-content");

  if (!content) {
    content = document.createElement("div");
    content.className = "year-content";

    const nodesToMove = [...section.children].filter((node) => node !== heading);
    nodesToMove.forEach((node) => content.appendChild(node));
    section.appendChild(content);
  }

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const collapsed = section.dataset.collapsed === "true";
    setYearCollapsed(section, !collapsed);
    saveCurrentYearState(container, storageKey);
    updateExpandAllButton(container, navEl);
  });

  heading.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;

    event.preventDefault();
    event.stopPropagation();

    const collapsed = section.dataset.collapsed === "true";
    setYearCollapsed(section, !collapsed);
    saveCurrentYearState(container, storageKey);
    updateExpandAllButton(container, navEl);
  });

  topButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupCollapsibleYearSections(container, navEl, storageKey) {
  if (!container) return;

  const state = loadYearCollapseState(storageKey);
  const sections = getYearSections(container);

  sections.forEach((section) => {
    const heading = section.querySelector(":scope > h2");
    if (!heading) return;

    buildYearHeader(section, heading, storageKey, container, navEl);

    const year = getYearSectionYear(section);
    const collapsed = year in state ? Boolean(state[year]) : false;
    setYearCollapsed(section, collapsed);
  });

  ensureExpandAllButton(navEl, container, storageKey);
  bindYearNavLinks(navEl, container, storageKey);
  expandYearFromHash(window.location.hash);
  saveCurrentYearState(container, storageKey);
  updateExpandAllButton(container, navEl);
}

/* ======================
   FILTER ENGINE
========================= */

function createFilterEngine(config) {
  const {
    items = [],
    groups = [],
    sortYearsDesc = true
  } = config || {};

  const groupedByYear = {};

  items.forEach((item) => {
    const year = item.year || toDate(item.date)?.getFullYear();
    if (!year) return;
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(item);
  });

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => (sortYearsDesc ? b - a : a - b));

  const state = {};
  groups.forEach((group) => {
    state[group.name] = new Set();
  });

  function getValuesForGroup(group) {
    return [
      ...new Set(items.flatMap((item) => normalizeToArray(item[group.key])))
    ].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function matchesGroup(item, group) {
    const selected = state[group.name];
    if (!selected || selected.size === 0) return true;

    const itemValues = normalizeToArray(item[group.key]);

    if (group.mode === "and") {
      return [...selected].every((value) => itemValues.includes(value));
    }

    return itemValues.some((value) => selected.has(value));
  }

  function matchesAll(item) {
    return groups.every((group) => matchesGroup(item, group));
  }

  function getItemsForYear(year) {
    return (groupedByYear[year] || []).filter(matchesAll);
  }

  function renderFilters() {
    groups.forEach((group) => {
      if (!group.container) return;

      renderMultiSelectFilter(
        group.container,
        getValuesForGroup(group),
        state[group.name],
        (value, clearAll) => {
          state[group.name] = clearAll
            ? new Set()
            : toggleSetValue(state[group.name], value);

          if (typeof group.onChange === "function") {
            group.onChange(state[group.name]);
          }

          renderFilters();

          if (typeof config.onUpdate === "function") {
            config.onUpdate();
          }
        },
        group.allLabel || "All"
      );
    });
  }

  function renderYearNav(navEl) {
    if (!navEl) return;

    navEl.innerHTML = "";

    years.forEach((year) => {
      const itemsForYear = getItemsForYear(year);
      if (!itemsForYear.length) return;

      const link = document.createElement("a");
      link.href = `#year-${year}`;
      link.textContent = String(year);
      navEl.appendChild(link);
    });
  }

  return {
    years,
    state,
    groups,
    renderFilters,
    renderYearNav,
    getItemsForYear,
    matchesAll
  };
}

/* ======================
   LIGHTBOX
========================= */

function closeLightbox() {
  const viewer = document.querySelector(".image-viewer");
  if (!viewer) return;

  document.body.style.overflow = "";
  viewer.remove();
}

function openLightbox(src, alt = "") {
  if (!src) return;

  closeLightbox();

  const viewer = document.createElement("div");
  viewer.className = "image-viewer";

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.decoding = "async";

  viewer.appendChild(img);

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target === img) {
      closeLightbox();
    }
  });

  document.body.appendChild(viewer);
  document.body.style.overflow = "hidden";
}

/* ======================
   ARCHIVE
========================= */

function createArchiveBadge(item) {
  const badge = document.createElement("div");
  badge.className = "archive-badge";

  if (item.type === "writing") {
    badge.classList.add("archive-badge--wide");
    badge.textContent = item.format ? String(item.format).toUpperCase() : "PDF";
    return badge;
  }

  if (item.type === "margin" || item.type === "margins") {
    badge.classList.add("archive-badge--wide");
    badge.textContent = "Margins";
    return badge;
  }

  if (item.type === "quote" || item.type === "quotes") {
    badge.classList.add("archive-badge--wide");
    badge.textContent = "Quotes";
    return badge;
  }

  badge.textContent = "•";
  return badge;
}

function buildArchive() {
  const container = document.getElementById("archive");
  if (!container) return;

  const yearNav = document.querySelector(".year-nav");

  const allowedTypes = new Set(["art", "photo", "writing", "margin", "margins", "quote", "quotes"]);

  const archiveItems = sortByDateDescWithIdTiebreak(
    archive.filter((item) => {
      if (!item || !allowedTypes.has(item.type)) return false;
      if (item.showOnArchive === false) return false;
      if (!item.date || !String(item.date).trim()) return false;
      return !Number.isNaN(new Date(item.date).getTime());
    })
  );

  const grouped = groupItemsByYear(archiveItems);

  container.innerHTML = "";
  buildYearNav(grouped.map((group) => group.year), yearNav);

  grouped.forEach((group) => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${group.year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = group.year;

    const list = document.createElement("div");
    list.className = "archive-list";

    group.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "archive-row";

      const title = document.createElement("div");
      title.className = "archive-title";

      const mainLink = document.createElement("a");
      mainLink.href = getItemUrl(item, "archive");
      mainLink.textContent = item.title || item.date || "";
      title.appendChild(mainLink);

      if (item.isBook) {
        const buy = document.createElement("a");
        buy.href = "https://a.co/d/04zcw8xP";
        buy.target = "_blank";
        buy.rel = "noopener";
        buy.className = "buy-link-inline";
        buy.textContent = "Buy ↗";
        title.appendChild(document.createTextNode(" "));
        title.appendChild(buy);
      }

      const metaWrap = document.createElement("div");
      metaWrap.className = "archive-meta-wrap";

      const meta = document.createElement("div");
      meta.className = "archive-meta";
      meta.textContent = item.date || item.year || "";
      metaWrap.appendChild(meta);

      if (item.thumb || item.image) {
        const thumbLink = document.createElement("a");
        thumbLink.href = getItemUrl(item, "archive");

        const thumb = document.createElement("img");
        thumb.className = "archive-thumb";
        applyArchiveThumb(thumb, item);

        thumbLink.appendChild(thumb);
        metaWrap.appendChild(thumbLink);
      } else {
        const badge = createArchiveBadge(item);
        const badgeLink = document.createElement("a");
        badgeLink.href = getItemUrl(item, "archive");
        badgeLink.appendChild(badge);
        metaWrap.appendChild(badgeLink);
      }

      row.appendChild(title);
      row.appendChild(metaWrap);
      list.appendChild(row);
    });

    yearBlock.appendChild(yearTitle);
    yearBlock.appendChild(list);
    container.appendChild(yearBlock);
  });

  setupCollapsibleYearSections(container, yearNav, "archive");
}

/* ======================
   WRITING INDEX
========================= */

function buildWritingIndex() {
  const container = document.getElementById("writing");
  if (!container) return;

  const yearNav = document.querySelector(".year-nav");
  const tagFilter = document.querySelector(".tag-filter-writing");

  const writingItems = archive
    .filter((item) => {
      if (item.type !== "writing") return false;
      if (item.showOnWriting === false) return false;

      const isTrip =
        item.section === "trips" ||
        (Array.isArray(item.sections) && item.sections.includes("trips"));

      if (isTrip) return false;

      return (
        item.showOnWriting === true ||
        !item.sections ||
        item.sections.includes("writing")
      );
    })
    .sort(
      (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
    );

  let engine;

  function renderWriting() {
    container.innerHTML = "";

    engine.years.forEach((year) => {
      const itemsForYear = engine.getItemsForYear(year);
      if (!itemsForYear.length) return;

      const yearBlock = document.createElement("div");
      yearBlock.className = "archive-year";
      yearBlock.id = `year-${year}`;

      const yearTitle = document.createElement("h2");
      yearTitle.textContent = year;

      const list = document.createElement("div");
      list.className = "archive-list";

      itemsForYear.forEach((item) => {
        const row = document.createElement("a");
        row.className = "archive-row";
        row.href = `writings.html?id=${item.id}`;

        const title = document.createElement("div");
        title.className = "archive-title";
        title.textContent = item.title || "";
        appendInlineTags(title, item.tags);

        const meta = document.createElement("div");
        meta.className = "archive-meta";
        meta.textContent = item.date || item.year || "";

        row.appendChild(title);
        row.appendChild(meta);
        list.appendChild(row);
      });

      yearBlock.appendChild(yearTitle);
      yearBlock.appendChild(list);
      container.appendChild(yearBlock);
    });

    engine.renderYearNav(yearNav);
    setupCollapsibleYearSections(container, yearNav, "writing");
  }

  engine = createFilterEngine({
    items: writingItems,
    groups: [
      {
        name: "writingTags",
        key: "tags",
        container: tagFilter,
        allLabel: "All",
        mode: "or"
      }
    ],
    onUpdate: renderWriting
  });

  engine.renderFilters();
  renderWriting();
}

/* ======================
   TRIP REPORTS INDEX
========================= */

function buildTripReportsPage() {
  const container = document.getElementById("trip-reports");
  if (!container) return;

  const yearNav = document.querySelector(".year-nav");
  const substanceFilter = document.querySelector(".tag-filter-substances");
  const tagFilter = document.querySelector(".tag-filter-tags");

  const tripItems = archive
    .filter((item) => {
      if (item.type !== "writing") return false;
      if (item.showOnWriting === false) return false;

      return (
        item.section === "trips" ||
        (Array.isArray(item.sections) && item.sections.includes("trips"))
      );
    })
    .sort(
      (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
    );

  let engine;

  function buildMetaText(item) {
    return item.date || "";
  }

  function renderTrips() {
    container.innerHTML = "";

    engine.years.forEach((year) => {
      const itemsForYear = engine.getItemsForYear(year);
      if (!itemsForYear.length) return;

      const block = document.createElement("div");
      block.className = "archive-year";
      block.id = `year-${year}`;

      const heading = document.createElement("h2");
      heading.textContent = year;

      const list = document.createElement("div");
      list.className = "archive-list";

      itemsForYear.forEach((item) => {
        const row = document.createElement("a");
        row.className = "archive-row";
        row.href = `tripreports.html?id=${item.id}&from=trips`;

        const title = document.createElement("div");
        title.className = "archive-title";
        title.textContent = item.title || "";

        const combinedInlineTags = [
          ...normalizeToArray(item.substance),
          ...normalizeToArray(item.tags)
        ];
        appendInlineTags(title, combinedInlineTags);

        const meta = document.createElement("div");
        meta.className = "archive-meta";
        meta.textContent = buildMetaText(item);

        row.appendChild(title);
        row.appendChild(meta);
        list.appendChild(row);
      });

      block.appendChild(heading);
      block.appendChild(list);
      container.appendChild(block);
    });

    engine.renderYearNav(yearNav);
    setupCollapsibleYearSections(container, yearNav, "trips");
  }

  engine = createFilterEngine({
    items: tripItems,
    groups: [
      {
        name: "tripSubstances",
        key: "substance",
        container: substanceFilter,
        allLabel: "All",
        mode: "or"
      },
      {
        name: "tripTags",
        key: "tags",
        container: tagFilter,
        allLabel: "All",
        mode: "or"
      }
    ],
    onUpdate: renderTrips
  });

  engine.renderFilters();
  renderTrips();
}

/* ======================
   GALLERY (ART ARCHIVE)
========================= */

function buildRandomButton(artItems) {
  const container = document.getElementById("random-container");
  if (!container || !artItems.length) return;

  container.innerHTML = "";

  const button = document.createElement("button");
  button.className = "random-button";
  button.textContent = "Surprise Me";

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const random = artItems[Math.floor(Math.random() * artItems.length)];
    window.location.href = `artwork.html?id=${random.id}`;
  });

  container.appendChild(button);
}

function buildGallery() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const yearNav = document.querySelector(".year-nav");
  const mediaFilter = document.querySelector(".tag-filter-media");
  const tagFilter = document.querySelector(".tag-filter-art-tags");

  const artItems = archive
    .filter((item) => item.type === "art" && item.showOnArt !== false)
    .sort(
      (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
    );

  let engine;

  function renderGalleryItems() {
    gallery.innerHTML = "";

    engine.years.forEach((year) => {
      const itemsForYear = engine.getItemsForYear(year);
      if (!itemsForYear.length) return;

      const yearSection = document.createElement("section");
      yearSection.className = "gallery-year";
      yearSection.id = `year-${year}`;

      const heading = document.createElement("h2");
      heading.textContent = year;

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      itemsForYear.forEach((item) => {
        const link = document.createElement("a");
        link.href = `artwork.html?id=${item.id}`;

        const img = document.createElement("img");
        applyGalleryImage(img, item);

        const meta = [];
        if (item.title) meta.push(item.title);
        if (item.medium) meta.push(item.medium);

        img.alt = meta.length ? meta.join(" — ") : "Artwork";

        link.appendChild(img);
        grid.appendChild(link);
      });

      yearSection.appendChild(heading);
      yearSection.appendChild(grid);
      gallery.appendChild(yearSection);
    });

    engine.renderYearNav(yearNav);
    setupCollapsibleYearSections(gallery, yearNav, "art");
  }

  engine = createFilterEngine({
    items: artItems,
    groups: [
      {
        name: "artMedia",
        key: "medium",
        container: mediaFilter,
        allLabel: "All",
        mode: "or"
      },
      {
        name: "artTags",
        key: "tags",
        container: tagFilter,
        allLabel: "All",
        mode: "or"
      }
    ],
    onUpdate: renderGalleryItems
  });

  engine.renderFilters();
  renderGalleryItems();
  buildRandomButton(artItems);
}

/* ======================
   PHOTO ARCHIVE
========================= */

function buildPhotoArchive() {
  const gallery = document.getElementById("photo-archive");
  if (!gallery) return;

  const yearNav = document.querySelector(".year-nav");
  const tagFilter = document.querySelector(".tag-filter-photo-tags");

  const photoItems = archive
    .filter((item) => item.type === "photo" && item.showOnPhoto !== false)
    .sort(
      (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
    );

  let engine;

  function renderPhotoItems() {
    gallery.innerHTML = "";

    engine.years.forEach((year) => {
      const itemsForYear = engine.getItemsForYear(year);
      if (!itemsForYear.length) return;

      const yearSection = document.createElement("section");
      yearSection.className = "gallery-year";
      yearSection.id = `year-${year}`;

      const heading = document.createElement("h2");
      heading.textContent = year;

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      itemsForYear.forEach((item) => {
        const link = document.createElement("a");
        link.href = `photography.html?id=${item.id}`;

        const img = document.createElement("img");
        applyGalleryImage(img, item);
        img.alt = item.title || "Photograph";

        link.appendChild(img);
        grid.appendChild(link);
      });

      yearSection.appendChild(heading);
      yearSection.appendChild(grid);
      gallery.appendChild(yearSection);
    });

    engine.renderYearNav(yearNav);
    setupCollapsibleYearSections(gallery, yearNav, "photo");
  }

  engine = createFilterEngine({
    items: photoItems,
    groups: [
      {
        name: "photoTags",
        key: "tags",
        container: tagFilter,
        allLabel: "All",
        mode: "or"
      }
    ],
    onUpdate: renderPhotoItems
  });

  engine.renderFilters();
  renderPhotoItems();
}

/* ======================
   ARTWORK DETAIL
========================= */

function buildArtworkPage() {
  const layout = document.getElementById("art-layout");
  if (!layout) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from") || "art";

  const allArtItems = sortByDateDescWithIdTiebreak(
    archive.filter((item) => item.type === "art")
  );

  const visibleArtItems = sortByDateDescWithIdTiebreak(
    archive.filter((item) => item.type === "art" && item.showOnArt !== false)
  );

  const item = allArtItems.find((entry) => entry.id === id);

  if (!item) {
    window.location.href = "art.html";
    return;
  }

  const navPool = item.showOnArt === false ? [item] : visibleArtItems;
  const index = navPool.findIndex((entry) => entry.id === item.id);

  const prev = navPool[index - 1] || null;
  const next = navPool[index + 1] || null;

  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = item.title || "";

  if (item.sideNote) {
    layout.innerHTML = `
      <div class="media-row">
        <div class="media-image">
          <img id="art-image" alt="">
        </div>
        <aside class="media-note">
          <h3>${item.sideNoteTitle || "Details"}</h3>
          ${item.sideNote}
        </aside>
      </div>
    `;
  } else {
    layout.innerHTML = `
      <div class="art-image">
        <img id="art-image" alt="">
      </div>
    `;
  }

  const imageEl = document.getElementById("art-image");
  if (!imageEl) return;

  applyViewerImage(imageEl, item);
  imageEl.addEventListener("click", () => openLightbox(item.image, item.title || ""));

  let backHref = "art.html";
  let backText = "Back to Artwork";

  if (from === "archive") {
    backHref = "archive.html";
    backText = "Back to Archive";
  } else if (from === "exhibit") {
    backHref = "exhibits.html";
    backText = "Back to Exhibits";
  }

  const navEl = document.getElementById("nav");
  setNavigation(
    navEl,
    prev,
    next,
    backHref,
    backText,
    (entry) => `artwork.html?id=${entry.id}&from=${from}`
  );

  bindArrowNavigation(
    prev ? `artwork.html?id=${prev.id}&from=${from}` : "",
    next ? `artwork.html?id=${next.id}&from=${from}` : ""
  );
}

/* ======================
   PHOTOGRAPHY DETAIL
========================= */

function buildPhotographyPage() {
  const layout = document.getElementById("photo-layout");
  if (!layout) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from") || "photo";

  const photoItems = sortByDateDescWithIdTiebreak(
    archive.filter((item) => item.type === "photo")
  );

  const visiblePhotoItems = sortByDateDescWithIdTiebreak(
    archive.filter((item) => item.type === "photo" && item.showOnPhoto !== false)
  );

  const item = photoItems.find((entry) => entry.id === id);

  if (!item) {
    window.location.href = "photo.html";
    return;
  }

  const navPool = item.showOnPhoto === false ? [item] : visiblePhotoItems;
  const index = navPool.findIndex((entry) => entry.id === item.id);

  const prev = navPool[index - 1] || null;
  const next = navPool[index + 1] || null;

  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = item.title || "";

  layout.innerHTML = `
    <div class="photo-viewer">
      <img id="photo-image" alt="">
    </div>
  `;

  const imageEl = document.getElementById("photo-image");
  if (!imageEl) return;

  applyViewerImage(imageEl, item);
  imageEl.addEventListener("click", () => openLightbox(item.image, item.title || ""));

  let backHref = "photo.html";
  let backText = "Back to Photography";

  if (from === "archive") {
    backHref = "archive.html";
    backText = "Back to Archive";
  }

  const navEl = document.getElementById("nav");
  setNavigation(
    navEl,
    prev,
    next,
    backHref,
    backText,
    (entry) => `photography.html?id=${entry.id}&from=${from}`
  );

  bindArrowNavigation(
    prev ? `photography.html?id=${prev.id}&from=${from}` : "",
    next ? `photography.html?id=${next.id}&from=${from}` : ""
  );
}

/* ======================
   WRITING VIEWER
========================= */

function buildWritingViewer() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const item = archive.find((entry) => entry.type === "writing" && entry.id === id);
  if (!item) return;

  const from = params.get("from") || "";
  const isTripViewer =
    item.section === "trips" ||
    (Array.isArray(item.sections) && item.sections.includes("trips"));

  const frame = document.getElementById("pdf-frame");
  const titleEl = document.getElementById("writing-title");
  const descEl = document.getElementById("writing-description");
  const downloadLink = document.getElementById("download-link");
  const backLink = document.getElementById("back-link");
  const mobilePdfLink = document.querySelector(".pdf-mobile-link a");

  if (titleEl) titleEl.textContent = item.title || "";
  if (descEl) descEl.textContent = item.description || "";

  if (frame) frame.src = item.file || "";
  if (downloadLink) downloadLink.href = item.file || "";
  if (mobilePdfLink) mobilePdfLink.href = item.file || "";

  if (backLink) {
    if (from === "archive") {
      backLink.href = "archive.html";
      backLink.textContent = "← Back to Archive";
    } else if (from === "trips") {
      backLink.href = "trips.html";
      backLink.textContent = "← Back to Trip Reports";
    } else {
      backLink.href = isTripViewer ? "trips.html" : "writing.html";
      backLink.textContent = isTripViewer
        ? "← Back to Trip Reports"
        : "← Back to Writing";
    }
  }
}

/* ======================
   EXHIBITS
========================= */

function getExhibitWorks(exhibitId) {
  return archive
    .filter((item) => item.type === "art" && item.exhibit === exhibitId)
    .sort((a, b) => {
      const orderA = typeof a.exhibitOrder === "number" ? a.exhibitOrder : 9999;
      const orderB = typeof b.exhibitOrder === "number" ? b.exhibitOrder : 9999;

      if (orderA !== orderB) return orderA - orderB;

      const dateA = toDate(a.date)?.getTime() || 0;
      const dateB = toDate(b.date)?.getTime() || 0;

      if (dateA !== dateB) return dateA - dateB;

      return (a.title || "").localeCompare(b.title || "");
    });
}

function createExhibitCard(item) {
  const card = document.createElement("article");
  card.className = "exhibit-card";

  const link = document.createElement("a");
  link.className = "exhibit-lightbox";
  link.href = `artwork.html?id=${item.id}&from=exhibit`;

  const figure = document.createElement("figure");

  const img = document.createElement("img");
  applyGalleryImage(
    img,
    item,
    "(max-width: 700px) 86vw, (max-width: 1100px) 72vw, 48vw"
  );
  img.alt = item.title || "";

  img.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openLightbox(item.image, item.title || "");
  });

  const caption = document.createElement("figcaption");
  caption.className = "exhibit-caption";

  const title = document.createElement("span");
  title.className = "exhibit-caption-title";
  title.textContent = item.exhibitCaptionTitle || item.title || "";

  const meta = document.createElement("span");
  meta.className = "exhibit-caption-meta";
  meta.textContent = item.exhibitCaptionMeta || "";

  caption.appendChild(title);
  caption.appendChild(meta);

  figure.appendChild(img);
  figure.appendChild(caption);
  link.appendChild(figure);
  card.appendChild(link);

  return card;
}

function buildExhibitsArchive() {
  const container = document.getElementById("exhibits-archive");
  if (!container) return;

  const grouped = {};

  exhibits.forEach((exhibit) => {
    const year = exhibit.year || toDate(exhibit.date)?.getFullYear();
    if (!year) return;
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(exhibit);
  });

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  container.innerHTML = "";

  years.forEach((year) => {
    const yearBlock = document.createElement("section");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${year}`;

    const heading = document.createElement("h2");
    heading.textContent = String(year);

    const content = document.createElement("div");
    content.className = "year-content";

    grouped[year].forEach((exhibit) => {
      const wrap = document.createElement("article");
      wrap.className = "exhibit-gallery";

      const title = document.createElement("h3");
      title.textContent = exhibit.title || "";

      const statement = document.createElement("div");
      statement.className = "exhibit-statement";
      if (exhibit.statementHtml) {
        statement.innerHTML = exhibit.statementHtml;
      } else {
        statement.textContent = exhibit.statement || "";
      }

      const rail = document.createElement("div");
      rail.className = "exhibit-rail";

      const works = getExhibitWorks(exhibit.id);
      works.forEach((item) => {
        rail.appendChild(createExhibitCard(item));
      });

      wrap.appendChild(title);

      if (
        (exhibit.statement && String(exhibit.statement).trim()) ||
        (exhibit.statementHtml && String(exhibit.statementHtml).trim())
      ) {
        wrap.appendChild(statement);
      }

      wrap.appendChild(rail);
      content.appendChild(wrap);
    });

    yearBlock.appendChild(heading);
    yearBlock.appendChild(content);
    container.appendChild(yearBlock);
  });

  const yearNav = document.querySelector(".year-nav");
  buildYearNav(years.map(String), yearNav);
  setupCollapsibleYearSections(container, yearNav, "exhibits");
}

/* ======================
   MARGINS / QUOTES
========================= */

function formatQuoteDate(dateString) {
  if (!dateString) return "";

  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12
  ) {
    return dateString;
  }

  return `${monthNames[month - 1]} ${day}, ${year}`;
}

function renderQuoteText(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "quote-text";

  if (Array.isArray(item.lines) && item.lines.length) {
    wrapper.classList.add("quote-text-lines");

    item.lines.forEach((line) => {
      const lineEl = document.createElement("div");
      lineEl.className = "quote-line";
      lineEl.textContent = line;
      wrapper.appendChild(lineEl);
    });

    return wrapper;
  }

  if (typeof item.text === "string" && item.text.trim()) {
    wrapper.classList.add("quote-text-block");

    if (item.allowHtml === true) {
      wrapper.innerHTML = item.text.trim();
    } else {
      wrapper.textContent = item.text.trim();
    }
  }

  return wrapper;
}

function buildMarginsPage() {
  const container = document.getElementById("margins-list");
  if (!container) return;

  const items = archive
    .filter((item) => item.type === "margin" || item.type === "margins")
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

  const grouped = groupItemsByYear(items);
  const yearNav = document.querySelector(".year-nav");

  container.innerHTML = "";
  buildYearNav(grouped.map((group) => group.year), yearNav);

  grouped.forEach((group) => {
    const block = document.createElement("section");
    block.className = "margins-year";
    block.id = `year-${group.year}`;

    const heading = document.createElement("h2");
    heading.textContent = group.year;

    const list = document.createElement("div");
    list.className = "margins-list";

    group.items.forEach((item) => {
      const entry = document.createElement("article");
      entry.className = "writing-entry";
      entry.id = item.id || "";

      const meta = document.createElement("div");
      meta.className = "writing-meta";
      meta.textContent = item.date || "";

      const title = document.createElement("div");
      title.className = "writing-title";

      if (item.allowHtml) {
        title.innerHTML = item.text || item.title || "";
      } else {
        title.textContent = item.text || item.title || "";
      }

      entry.appendChild(meta);
      entry.appendChild(title);
      list.appendChild(entry);
    });

    block.appendChild(heading);
    block.appendChild(list);
    container.appendChild(block);
  });

  setupCollapsibleYearSections(container, yearNav, "margins");
}

function buildQuotesPage() {
  const container = document.getElementById("quotes-list");
  if (!container) return;

  const items = archive
    .filter((item) => item.type === "quote" || item.type === "quotes")
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

  const grouped = groupItemsByYear(items);
  const yearNav = document.querySelector(".year-nav");

  container.innerHTML = "";
  buildYearNav(grouped.map((group) => group.year), yearNav);

  grouped.forEach((group) => {
    const block = document.createElement("section");
    block.className = "quotes-year";
    block.id = `year-${group.year}`;

    const heading = document.createElement("h2");
    heading.textContent = group.year;

    const list = document.createElement("div");
    list.className = "quotes-list";

    group.items.forEach((item) => {
      const entry = document.createElement("article");
      entry.className = "writing-entry";
      entry.id = item.id || "";

      const meta = document.createElement("div");
      meta.className = "writing-meta";
      meta.textContent = formatQuoteDate(item.date || "");

      const title = document.createElement("div");
      title.className = "writing-title";
      title.appendChild(renderQuoteText(item));

      entry.appendChild(meta);
      entry.appendChild(title);
      list.appendChild(entry);
    });

    block.appendChild(heading);
    block.appendChild(list);
    container.appendChild(block);
  });

  setupCollapsibleYearSections(container, yearNav, "quotes");
}

/* ======================
   QUESTIONS
========================= */

function buildQuestionsPage() {
  const list = document.querySelector(".questions-list");
  if (!list) return;

  const source = [...publicQuestions, ...questions];
  if (!source.length) return;

  list.innerHTML = "";

  sortByDateDesc(source).forEach((item) => {
    const entry = document.createElement("article");
    entry.className = "question-entry";

    const title = document.createElement("h3");
    title.textContent = item.question || item.title || "";

    const body = document.createElement("div");
    body.className = "question-body";

    if (item.allowHtml === true) {
      body.innerHTML = item.answer || "";
    } else {
      body.textContent = item.answer || "";
    }

    entry.appendChild(title);
    entry.appendChild(body);
    list.appendChild(entry);
  });
}

/* ======================
   PAGE BOOTSTRAP
========================= */

function initPage() {
  if (document.getElementById("archive")) {
    buildArchive();
  }

  if (document.querySelector(".gallery")) {
    buildGallery();
  }

  if (document.getElementById("photo-archive")) {
    buildPhotoArchive();
  }

  if (document.getElementById("writing")) {
    buildWritingIndex();
  }

  if (document.getElementById("trip-reports")) {
    buildTripReportsPage();
  }

  if (document.getElementById("art-layout")) {
    buildArtworkPage();
  }

  if (document.getElementById("photo-layout")) {
    buildPhotographyPage();
  }

  if (document.getElementById("exhibits-archive")) {
    buildExhibitsArchive();
  }

  if (document.getElementById("margins-list")) {
    buildMarginsPage();
  }

  if (document.getElementById("quotes-list")) {
    buildQuotesPage();
  }

  if (
    document.getElementById("pdf-frame") ||
    document.getElementById("writing-title") ||
    document.getElementById("download-link")
  ) {
    buildWritingViewer();
  }

  if (document.querySelector(".questions-list")) {
    buildQuestionsPage();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}