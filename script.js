/* ======================
   DATA SAFETY
========================= */

if (typeof archive === "undefined") {
  console.error("archive.js not loaded or has syntax errors");
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

/* ==================
   HELPERS
===================== */

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));
}

function sortByDateDescWithIdTiebreak(items) {
  return [...items].sort((a, b) => {
    const dateDiff = (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0);
    if (dateDiff !== 0) return dateDiff;

    const getIndex = (value) => {
      const match = String(value || "").match(/_(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    return getIndex(a.id) - getIndex(b.id);
  });
}

function groupByYear(items) {
  const years = {};

  items.forEach((item) => {
    const year = item.year || toDate(item.date).getFullYear();
    if (!years[year]) years[year] = [];
    years[year].push(item);
  });

  return Object.keys(years)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      year,
      items: sortByDateDesc(years[year])
    }));
}

function buildYearNav(years, navEl = document.querySelector(".year-nav")) {
  if (!navEl) return;

  navEl.innerHTML = "";

  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  const topOffset = isMobile ? 24 : 70;

  years.forEach((year, index) => {
    const link = document.createElement("a");
    link.href = `#year-${year}`;
    link.textContent = year;

    link.addEventListener("click", (event) => {
      event.preventDefault();

      const target = document.getElementById(`year-${year}`);
      if (!target) return;

      const targetTop =
        target.getBoundingClientRect().top + window.pageYOffset - topOffset;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: isMobile ? "auto" : "smooth"
      });

      history.replaceState(null, "", `#year-${year}`);
    });

    navEl.appendChild(link);

    if (index < years.length - 1) {
      navEl.appendChild(document.createTextNode(" "));
    }
  });
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeToArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value) return [value];
  return [];
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
  const srcset = getThumbSrcset(item);

  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes;
    img.src = getThumbSrc(item);
  } else {
    img.src = getThumbSrc(item);
  }

  img.loading = "lazy";
  img.decoding = "async";
  img.alt = item.title || "";
}

function applyViewerImage(
  img,
  item,
  sizes = "(max-width: 1200px) calc(100vw - 44px), 1100px"
) {
  const srcset = getFullSrcset(item);

  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes;
    img.src = getFullSrc(item);
  } else {
    img.src = getFullSrc(item);
  }

  img.decoding = "async";
  img.alt = item.title || "";
}

function applyViewerImage(
  img,
  item,
  sizes = "(max-width: 1200px) calc(100vw - 44px), 1100px"
) {
  const srcset = getFullSrcset(item);

  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes;
    img.src = getFullSrc(item); // set last
  } else {
    img.src = getFullSrc(item);
  }

  img.decoding = "async";
  img.alt = item.title || "";
}

function applyArchiveThumb(img, item) {
  const src = item.archiveThumb || item.thumb || item.image || "";
  const srcset = item.archiveThumbSrcset || "";

  if (srcset) {
    img.srcset = srcset;
    img.sizes = "60px";
    img.src = src;
  } else {
    img.src = src;
  }

  img.loading = "lazy";
  img.decoding = "async";
  img.alt = item.title || "";
}

function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.src = src;
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

    if (isTrip) {
      return `tripreports.html?id=${item.id}${from ? `&from=${from}` : ""}`;
    }

    return `writings.html?id=${item.id}${from ? `&from=${from}` : ""}`;
  }

  if (item.type === "margin" || item.type === "margins") {
    return `margins.html#${item.id}`;
  }

  if (item.type === "quote" || item.type === "quotes") {
    return `quotes.html#${item.id}`;
  }

  return item.link || "#";
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
  document.addEventListener("keydown", (e) => {
    const lightboxOpen = document.querySelector(".image-viewer");

    if (e.key === "Escape" && lightboxOpen) {
      closeLightbox();
      return;
    }

    if (lightboxOpen) return;

    if (e.key === "ArrowLeft" && prevUrl) {
      window.location.href = prevUrl;
    }

    if (e.key === "ArrowRight" && nextUrl) {
      window.location.href = nextUrl;
    }
  });
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
  clearButton.addEventListener("click", () => onToggle(null, true));
  container.appendChild(clearButton);

  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tag-pill${selectedValues.has(value) ? " active" : ""}`;
    button.textContent = value;
    button.addEventListener("click", () => onToggle(value, false));
    container.appendChild(button);
  });
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

/* ======================
   FILTER ENGINE
======================== */

function createFilterEngine(config) {
  const {
    items = [],
    groups = [],
    sortYearsDesc = true
  } = config || {};

  const groupedByYear = {};

  items.forEach((item) => {
    const year = item.year || toDate(item.date).getFullYear();
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
    return [...new Set(
      items.flatMap((item) => normalizeToArray(item[group.key]))
    )].sort((a, b) => String(a).localeCompare(String(b)));
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
      link.textContent = year;
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
   LIGHTBOX VIEWER
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

  viewer.addEventListener("click", (e) => {
    if (e.target === viewer || e.target === img) {
      closeLightbox();
    }
  });

  document.body.appendChild(viewer);
  document.body.style.overflow = "hidden";
}

/* =========================
   ARCHIVE (archive.html)
============================ */

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
  if (!container || typeof archive === "undefined") return;

const allowedTypes = new Set([
  "art",
  "photo",
  "writing",
  "margin",
  "margins"
]);

const archiveItems = sortByDateDescWithIdTiebreak(
  archive.filter((item) => {
    if (!item || !allowedTypes.has(item.type)) return false;
    if (item.showOnArchive === false) return false;

    if (!item.date || !String(item.date).trim()) return false;

    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) return false;

    return true;
  })
);

  const groupedMap = {};

  archiveItems.forEach((item) => {
    const year = item.year || toDate(item.date).getFullYear();
    if (!groupedMap[year]) groupedMap[year] = [];
    groupedMap[year].push(item);
  });

  const grouped = Object.keys(groupedMap)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      year,
      items: groupedMap[year]
    }));

  container.innerHTML = "";
  buildYearNav(grouped.map((group) => group.year));

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
        thumb.alt = item.title || "";

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
}

/* ==============================
   WRITING INDEX (writing.html)
================================= */

function buildWritingIndex() {
  const container = document.getElementById("writing");
  if (!container || typeof archive === "undefined") return;

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
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

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
   GALLERY (art.html)
========================= */

function buildRandomButton(artItems) {
  const container = document.getElementById("random-container");
  if (!container || !artItems.length) return;

  container.innerHTML = "";

  const button = document.createElement("button");
  button.className = "random-button";
  button.textContent = "Surprise Me";

  button.addEventListener("click", () => {
    const random = artItems[Math.floor(Math.random() * artItems.length)];
    window.location.href = `artwork.html?id=${random.id}`;
  });

  container.appendChild(button);
}

function buildGallery() {
  const gallery = document.querySelector(".gallery");
  if (!gallery || typeof archive === "undefined") return;

  const yearNav = document.querySelector(".year-nav");
  const mediaFilter = document.querySelector(".tag-filter-media");
  const tagFilter = document.querySelector(".tag-filter-art-tags");

  const artItems = archive
    .filter((item) => item.type === "art" && item.showOnArt !== false)
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

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

/* ========================
   ARTWORK DETAIL PAGE
=========================== */

function buildArtworkPage() {
  const layout = document.getElementById("art-layout");
  if (!layout || typeof archive === "undefined") return;

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
   EXHIBITS
========================= */

function getExhibitWorks(exhibitId) {
  return archive
    .filter((item) => item.type === "art" && item.exhibit === exhibitId)
    .sort((a, b) => {
      const orderA = typeof a.exhibitOrder === "number" ? a.exhibitOrder : 9999;
      const orderB = typeof b.exhibitOrder === "number" ? b.exhibitOrder : 9999;

      if (orderA !== orderB) return orderA - orderB;

      const dateDiff = toDate(a.date) - toDate(b.date);
      if (dateDiff !== 0) return dateDiff;

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
  applyViewerImage(
    img,
    item,
    "(max-width: 700px) 86vw, (max-width: 1100px) 72vw, 48vw"
  );
  img.alt = item.title || "";

  img.addEventListener("click", (e) => {
    e.preventDefault();
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
  if (!container || typeof exhibits === "undefined") return;

  const grouped = {};

  exhibits.forEach((exhibit) => {
    const year = exhibit.year || toDate(exhibit.date).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(exhibit);
  });

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  container.innerHTML = "";
  buildYearNav(years);

  years.forEach((year) => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = year;

    const list = document.createElement("div");
    list.className = "archive-list";

    grouped[year]
      .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0))
      .forEach((exhibit) => {
        const row = document.createElement("a");
        row.className = "archive-row";
        row.href = `exhibit.html?id=${exhibit.id}&from=exhibits`;

        const title = document.createElement("div");
        title.className = "archive-title";
        title.textContent = exhibit.title || "";

        const meta = document.createElement("div");
        meta.className = "archive-meta";
        meta.textContent = exhibit.year || "";

        row.appendChild(title);
        row.appendChild(meta);
        list.appendChild(row);
      });

    yearBlock.appendChild(yearTitle);
    yearBlock.appendChild(list);
    container.appendChild(yearBlock);
  });
}

function buildExhibitPage() {
  if (!window.location.pathname.includes("exhibit.html")) return;
  if (typeof exhibits === "undefined" || typeof archive === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from") || "exhibits";
  if (!id) return;

  const exhibitItems = sortByDateDesc(exhibits);
  const index = exhibitItems.findIndex((item) => item.id === id);

  if (index === -1) return;

  const exhibit = exhibitItems[index];
  const prev = exhibitItems[index - 1] || null;
  const next = exhibitItems[index + 1] || null;

  const titleEl = document.getElementById("exhibit-title");
  const descEl = document.getElementById("exhibit-description");
  const gallery = document.querySelector(".exhibit-gallery");
  const navEl = document.getElementById("exhibit-nav");

  if (titleEl) titleEl.textContent = exhibit.title || "";
  if (descEl) descEl.textContent = exhibit.description || "";
  if (!gallery) return;

  const works = getExhibitWorks(id);
  gallery.innerHTML = "";

  if (!works.length) {
    const empty = document.createElement("p");
    empty.textContent = "No works found for this exhibit.";
    gallery.appendChild(empty);
  } else {
    const rail = document.createElement("div");
    rail.className = "exhibit-rail";

    works.forEach((item) => {
      rail.appendChild(createExhibitCard(item));
    });

    gallery.appendChild(rail);
  }

  let backHref = "exhibits.html";
  let backText = "Back to Exhibits";

  if (from === "archive") {
    backHref = "archive.html";
    backText = "Back to Archive";
  } else if (from === "art") {
    backHref = "art.html";
    backText = "Back to Artwork";
  }

  setNavigation(
    navEl,
    prev,
    next,
    backHref,
    backText,
    (entry) => `exhibit.html?id=${entry.id}&from=${from}`
  );

  bindArrowNavigation(
    prev ? `exhibit.html?id=${prev.id}&from=${from}` : "",
    next ? `exhibit.html?id=${next.id}&from=${from}` : ""
  );
}

/* ======================
   PHOTOGRAPHY
========================= */

function buildPhotoArchive() {
  const container = document.getElementById("photo-archive");
  if (!container || typeof archive === "undefined") return;

  const yearNav = document.querySelector(".year-nav");
  const tagFilter = document.querySelector(".tag-filter-photo-tags");

  const photoItems = archive
    .filter((item) => item.type === "photo" && item.showOnPhoto !== false)
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

  let engine;

  function renderPhotos() {
    container.innerHTML = "";

    engine.years.forEach((year) => {
      const itemsForYear = engine.getItemsForYear(year);
      if (!itemsForYear.length) return;

      const yearBlock = document.createElement("section");
      yearBlock.className = "gallery-year";
      yearBlock.id = `year-${year}`;

      const yearTitle = document.createElement("h2");
      yearTitle.textContent = year;

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      itemsForYear.forEach((item) => {
        const link = document.createElement("a");
        link.href = `photography.html?id=${item.id}&from=photo`;
        link.className = "gallery-item";

        const img = document.createElement("img");
        applyGalleryImage(
          img,
          item,
          "(max-width: 900px) calc(100vw - 44px), (max-width: 1400px) 33vw, 320px"
        );

        const altParts = [];
        if (item.title) altParts.push(item.title);
        if (Array.isArray(item.tags) && item.tags.length) {
          altParts.push(item.tags.join(", "));
        }
        img.alt = altParts.length ? altParts.join(" — ") : "Photograph";

        link.appendChild(img);
        grid.appendChild(link);
      });

      yearBlock.appendChild(yearTitle);
      yearBlock.appendChild(grid);
      container.appendChild(yearBlock);
    });

    engine.renderYearNav(yearNav);
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
    onUpdate: renderPhotos
  });

  engine.renderFilters();
  renderPhotos();
}

function buildPhotographyPage() {
  const layout = document.getElementById("photo-layout");
  if (!layout || typeof archive === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from") || "photo";

  if (!id) {
    window.location.href = "photography.html";
    return;
  }

  const items = sortByDateDescWithIdTiebreak(
    archive.filter((item) => item.type === "photo" && item.showOnPhoto !== false)
  );

  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    window.location.href = "photography.html";
    return;
  }

  const item = items[index];
  const prev = items[index - 1] || null;
  const next = items[index + 1] || null;

  const titleEl = document.getElementById("photo-title");
  if (titleEl) titleEl.textContent = item.title || "";

  if (item.sideNote) {
    layout.innerHTML = `
      <div class="media-row">
        <div class="media-image">
          <img id="photo-image" alt="">
        </div>
        <aside class="media-note">
          <h3>${item.sideNoteTitle || "Details"}</h3>
          ${item.sideNote}
        </aside>
      </div>
    `;
  } else {
    layout.innerHTML = `
      <div class="photo-viewer">
        <img id="photo-image" alt="">
      </div>
    `;
  }

  const imgEl = document.getElementById("photo-image");
  if (!imgEl) return;

  applyViewerImage(
    imgEl,
    item,
    "(max-width: 1200px) calc(100vw - 44px), 900px"
  );

  imgEl.addEventListener("click", () => {
    openLightbox(item.image, item.title || "");
  });

  let backHref = "photography.html";
  let backText = "Back to Photography";

  if (from === "archive") {
    backHref = "archive.html";
    backText = "Back to Archive";
  } else if (from === "art") {
    backHref = "art.html";
    backText = "Back to Artwork";
  }

  const navEl = document.getElementById("photo-nav");
  setNavigation(
    navEl,
    prev,
    next,
    backHref,
    backText,
    (entry) => `photography.html?id=${entry.id}&from=${from}`
  );

  preloadImage(prev && prev.thumb);
  preloadImage(next && next.thumb);

  bindArrowNavigation(
    prev ? `photography.html?id=${prev.id}&from=${from}` : "",
    next ? `photography.html?id=${next.id}&from=${from}` : ""
  );
}

/* ==========================================
   INDIVIDUAL WRITING PAGES (writings.html)
============================================= */

function buildWritingPage() {
  if (typeof archive === "undefined") return;

  const isWritingViewer = window.location.pathname.includes("writings.html");
  const isTripViewer = window.location.pathname.includes("tripreports.html");

  if (!isWritingViewer && !isTripViewer) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from");
  if (!id) return;

  const items = archive.filter((item) => {
    if (item.type !== "writing") return false;

    if (isTripViewer) {
      return (
        item.section === "trips" ||
        (Array.isArray(item.sections) && item.sections.includes("trips"))
      );
    }

    const isTrip =
      item.section === "trips" ||
      (Array.isArray(item.sections) && item.sections.includes("trips"));

    if (isTrip) return false;

    return (
      item.showOnWriting === true ||
      !item.sections ||
      item.sections.includes("writing")
    );
  });

  const sortedItems = sortByDateDescWithIdTiebreak(items);
  const index = sortedItems.findIndex((item) => item.id === id);
  if (index === -1) return;

  const item = sortedItems[index];

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

/* ==============================================
   TRIP REPORTS INDEX / VIEWER
================================================= */

function buildTripReportsPage() {
  const container = document.getElementById("trip-reports");
  if (!container || typeof archive === "undefined") return;

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
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

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

/* ====================
   MARGINS / QUOTES
======================= */

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

    return wrapper;
  }

  return wrapper;
}

function buildMarginsPage(items = archive) {
  const container = document.querySelector(".margins-list");
  const yearNav = document.querySelector(".year-nav");
  const tagFilter = document.querySelector(".tag-filter-margins");

  if (!container || !Array.isArray(items)) return;

  const margins = items
    .filter((item) => item.type === "margins" || item.type === "margin")
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0));

  let engine;

  function renderMargins() {
    container.innerHTML = "";

    engine.years.forEach((year) => {
      const itemsForYear = engine.getItemsForYear(year);
      if (!itemsForYear.length) return;

      const yearSection = document.createElement("section");
      yearSection.className = "margins-year";
      yearSection.id = `year-${year}`;

      const yearHeading = document.createElement("h2");
      yearHeading.textContent = year;
      yearSection.appendChild(yearHeading);

      itemsForYear.forEach((item) => {
        const entry = document.createElement("article");
        entry.className = "quote-entry";
        entry.id = item.id;

        const meta = document.createElement("div");
        meta.className = "quote-meta";
        meta.textContent = formatQuoteDate(item.date);

        const text = renderQuoteText(item);

        entry.appendChild(meta);
        entry.appendChild(text);

        if (typeof item.detail === "string" && item.detail.trim()) {
          const detail = document.createElement("div");
          detail.className = "quote-detail";
          detail.textContent = item.detail.trim();
          entry.appendChild(detail);
        }

        appendInlineTags(entry, item.marginsTags);

        yearSection.appendChild(entry);
      });

      container.appendChild(yearSection);
    });

    engine.renderYearNav(yearNav);
  }

  engine = createFilterEngine({
    items: margins,
    groups: [
      {
        name: "marginsTags",
        key: "marginsTags",
        container: tagFilter,
        allLabel: "All",
        mode: "or"
      }
    ],
    onUpdate: renderMargins
  });

  engine.renderFilters();
  renderMargins();
}

function buildQuotesPage(items = archive) {
  const container = document.querySelector(".quotes-list");
  if (!container || !Array.isArray(items)) return;

  container.innerHTML = "";

  items
    .filter((item) => item.type === "quotes" || item.type === "quote")
    .sort((a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0))
    .forEach((item) => {
      const entry = document.createElement("article");
      entry.className = "quote-entry";
      entry.id = item.id || "";

      const meta = document.createElement("div");
      meta.className = "quote-meta";
      meta.textContent = formatQuoteDate(item.date);

      const text = renderQuoteText(item);
      entry.appendChild(meta);
      entry.appendChild(text);

      if (item.author || item.source) {
        const attribution = document.createElement("div");
        attribution.className = "quote-attribution";
        attribution.textContent = [item.author, item.source]
          .filter(Boolean)
          .join(", ");

        if (attribution.textContent) {
          attribution.textContent = "— " + attribution.textContent;
          entry.appendChild(attribution);
        }
      }

      if (typeof item.detail === "string" && item.detail.trim()) {
        const detail = document.createElement("div");
        detail.className = "quote-detail";
        detail.textContent = item.detail.trim();
        entry.appendChild(detail);
      }

      container.appendChild(entry);
    });
}

/* ====================
   QUESTIONS
======================= */

const QUESTIONS_API_URL =
  "https://script.google.com/macros/s/AKfycbzxbY8YjtcawHMJpzdV4sc4slmI8-eqfv75MArLHGDiFRUx6TqVlbGLONh2UcVTm_Q7TQ/exec";

function formatQuestionDate(dateString) {
  const date = new Date(dateString);

  return date
    .toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit"
    })
    .replace(",", "  ");
}

async function fetchPublicQuestions() {
  if (!window.location.pathname.includes("questions.html")) return;

  try {
    const res = await fetch(QUESTIONS_API_URL);
    if (!res.ok) throw new Error("Failed to fetch questions");

    const data = await res.json();
    window.publicQuestions = Array.isArray(data.questions) ? data.questions : [];
    buildQuestionsPage();
  } catch (err) {
    console.error("Error fetching public questions:", err);
    buildQuestionsPage();
  }
}

function buildQuestionsPage() {
  if (!window.location.pathname.includes("questions.html")) return;

  const container = document.getElementById("questions-list");
  if (!container) return;

  const merged = [...publicQuestions, ...questions].sort(
    (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
  );

  const seen = new Set();
  const allQuestions = merged.filter((item) => {
    if (!item || !item.question) return false;
    const key = item.id || `${item.date}_${item.question}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  container.innerHTML = "";

  allQuestions.forEach((item) => {
    const entry = document.createElement("article");
    entry.className = "question-entry";

    const meta = document.createElement("h3");
    meta.className = "question-meta";
    meta.textContent = formatQuestionDate(item.date);

    const question = document.createElement("div");
    question.className = "question-text";
    question.textContent = item.question;

    entry.appendChild(meta);
    entry.appendChild(question);

    if (item.answer) {
      const answer = document.createElement("div");
      answer.className = "question-answer";
      answer.textContent = item.answer;
      entry.appendChild(answer);
    }

    container.appendChild(entry);
  });

  setupQuestionForm();
}

function setupQuestionForm() {
  const form = document.getElementById("question-form");
  const input = document.getElementById("question-input");
  const honeypot = document.getElementById("website-field");
  const status = document.getElementById("question-status");

  if (!form || !input || !status) return;
  if (form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = input.value.trim();
    const website = honeypot ? honeypot.value.trim() : "";

    if (!question) return;

    status.textContent = "submitting...";

    try {
      const res = await fetch(QUESTIONS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          question,
          website
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed");
      }

      input.value = "";
      if (honeypot) honeypot.value = "";
      status.textContent = "submitted";

      await fetchPublicQuestions();
    } catch (err) {
      console.error("Error submitting question:", err);
      status.textContent = "something went wrong";
    }
  });
}

/* ====================
   FOOTER
======================= */

function buildFooter() {
  const content = document.querySelector(".content");
  if (!content) return;

  if (document.querySelector(".site-footer")) return;

  const footer = document.createElement("div");
  footer.className = "site-footer";

  footer.innerHTML = `
    <p>© ${new Date().getFullYear()} Christopher Shenefelt | The Dragon of Deseret | artwork and writing © their respective years</p>
  `;

  content.appendChild(footer);
}

/* ====================
   INIT
======================= */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof buildGallery === "function") buildGallery();
  if (typeof buildArchive === "function") buildArchive();
  if (typeof buildPhotoArchive === "function") buildPhotoArchive();
  if (typeof buildWritingIndex === "function") buildWritingIndex();
  if (typeof buildTripReportsPage === "function") buildTripReportsPage();
  if (typeof buildExhibitsArchive === "function") buildExhibitsArchive();
  if (typeof buildExhibitPage === "function") buildExhibitPage();
  if (typeof buildQuestionsPage === "function") buildQuestionsPage();
  if (typeof fetchPublicQuestions === "function") fetchPublicQuestions();

  if (typeof archive !== "undefined") {
    if (typeof buildMarginsPage === "function") buildMarginsPage(archive);
    if (typeof buildQuotesPage === "function") buildQuotesPage(archive);
  }

  if (
    window.location.pathname.includes("artwork.html") &&
    typeof buildArtworkPage === "function"
  ) {
    buildArtworkPage();
  }

  if (typeof buildPhotographyPage === "function") buildPhotographyPage();
  if (typeof buildWritingPage === "function") buildWritingPage();
  if (typeof buildFooter === "function") buildFooter();
});