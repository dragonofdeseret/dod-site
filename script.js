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
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => toDate(b.date) - toDate(a.date));
}

function sortByDateDescWithIdTiebreak(items) {
  return [...items].sort((a, b) => {
    const dateDiff = toDate(b.date) - toDate(a.date);
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

function buildYearNav(years) {
  const nav = document.querySelector(".year-nav");
  if (!nav) return;

  nav.innerHTML = "";

  years.forEach((year, index) => {
    const link = document.createElement("a");
    link.href = `#year-${year}`;
    link.textContent = year;
    nav.appendChild(link);

    if (index < years.length - 1) {
      nav.appendChild(document.createTextNode(" "));
    }
  });
}

function buildSubstanceNav(substances) {
  const nav = document.querySelector(".year-nav");
  if (!nav) return;

  nav.innerHTML = "";

  substances.forEach((substance, index) => {
    const link = document.createElement("a");
    link.href = `#substance-${slugify(substance)}`;
    link.textContent = substance;
    nav.appendChild(link);

    if (index < substances.length - 1) {
      nav.appendChild(document.createTextNode(" "));
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
  img.src = getThumbSrc(item);

  const srcset = getThumbSrcset(item);
  if (srcset) img.srcset = srcset;

  img.sizes = sizes;
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = item.title || "";
}

function applyViewerImage(
  img,
  item,
  sizes = "(max-width: 1200px) calc(100vw - 44px), 1100px"
) {
  img.src = getFullSrc(item);

  const srcset = getFullSrcset(item);
  if (srcset) img.srcset = srcset;

  img.sizes = sizes;
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

function makeLightboxButton(item, className = "exhibit-lightbox") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", item.title || "Open image");

  const img = document.createElement("img");
  applyGalleryImage(img, item, "(max-width: 980px) calc(100vw - 44px), 960px");

  button.appendChild(img);
  button.addEventListener("click", () => openLightbox(item.image, item.title || ""));

  return button;
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

function buildArchive() {
  const container = document.getElementById("archive");
  if (!container || typeof archive === "undefined") return;

  const grouped = groupByYear(
    archive.filter((item) => item.showOnArchive !== false)
  );

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
      const row = document.createElement("a");
      row.className = "archive-row";
      row.href = getItemUrl(item, "archive");

      const title = document.createElement("div");
      title.className = "archive-title";
      title.textContent = item.title || "";

      const metaWrap = document.createElement("div");
      metaWrap.className = "archive-meta-wrap";

      const meta = document.createElement("div");
      meta.className = "archive-meta";
      meta.textContent = item.date || item.year || "";

      let preview = null;

      if (item.type === "writing") {
        preview = document.createElement("div");
        preview.className = "archive-badge";
        preview.textContent = "PDF";
      } else if (item.image) {
        preview = document.createElement("img");
        preview.className = "archive-thumb";
        preview.src = item.image;
        preview.alt = item.title || "";
        preview.loading = "lazy";
        preview.decoding = "async";
      }

      metaWrap.appendChild(meta);
      if (preview) metaWrap.appendChild(preview);

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

  const writingItems = archive
    .filter((item) => {
      if (item.type !== "writing") return false;
      if (item.showOnWriting === false) return false;

      return (
        item.showOnWriting === true ||
        !item.sections ||
        item.sections.includes("writing")
      );
    });

  const grouped = groupByYear(sortByDateDesc(writingItems));

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
      const row = document.createElement("a");
      row.className = "archive-row";
      row.href = `writings.html?id=${item.id}`;

      const title = document.createElement("div");
      title.className = "archive-title";
      title.textContent = item.title || "";

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

  const artItems = sortByDateDesc(
    archive.filter((item) => item.type === "art" && item.showOnArt !== false)
  );

  const grouped = groupByYear(artItems);

  gallery.innerHTML = "";
  buildYearNav(grouped.map((group) => group.year));

  grouped.forEach((group) => {
    const yearSection = document.createElement("section");
    yearSection.className = "gallery-year";
    yearSection.id = `year-${group.year}`;

    const heading = document.createElement("h2");
    heading.textContent = group.year;

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    group.items.forEach((item) => {
      const link = document.createElement("a");
      link.href = `artwork.html?id=${item.id}`;

      const img = document.createElement("img");
      applyGalleryImage(img, item);

      link.appendChild(img);
      grid.appendChild(link);
    });

    yearSection.appendChild(heading);
    yearSection.appendChild(grid);
    gallery.appendChild(yearSection);
  });

  buildRandomButton(artItems);
}

function buildPhotoArchive() {
  const container = document.getElementById("photo-archive");
  if (!container || typeof archive === "undefined") return;

  const photoItems = sortByDateDesc(
    archive.filter((item) => item.type === "photo" && item.showOnPhoto !== false)
  );

  const grouped = groupByYear(photoItems);

  container.innerHTML = "";
  buildYearNav(grouped.map((group) => group.year));

  grouped.forEach((group) => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${group.year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = group.year;

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    group.items.forEach((item) => {
      const link = document.createElement("a");
      link.href = `photography.html?id=${item.id}&from=photo`;
      link.className = "gallery-item";

      const img = document.createElement("img");
      applyGalleryImage(img, item);

      link.appendChild(img);
      grid.appendChild(link);
    });

    yearBlock.appendChild(yearTitle);
    yearBlock.appendChild(grid);
    container.appendChild(yearBlock);
  });
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

  const item = allArtItems.find((item) => item.id === id);

  if (!item) {
    window.location.href = "art.html";
    return;
  }

  const navPool = item.showOnArt === false ? [item] : visibleArtItems;
  const index = navPool.findIndex((entry) => entry.id === item.id);

  const prev = navPool[index - 1];
  const next = navPool[index + 1];

  document.getElementById("title").textContent = item.title || "";

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
  applyViewerImage(imageEl, item);
  imageEl.addEventListener("click", () => openLightbox(item.image, item.title || ""));

  let backHref = "art.html";
  let backText = "Back";

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

  preloadImage(prev && prev.image);
  preloadImage(next && next.image);

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
      .sort((a, b) => toDate(b.date) - toDate(a.date))
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
  const prev = exhibitItems[index - 1];
  const next = exhibitItems[index + 1];

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
    gallery.innerHTML = "<p>No works found for this exhibit.</p>";
  } else {
    const [featured, ...rest] = works;

    if (featured) {
      const featuredButton = makeLightboxButton(featured, "exhibit-featured");
      gallery.appendChild(featuredButton);
    }

    if (rest.length) {
      const grid = document.createElement("div");
      grid.className = "exhibit-grid";

      rest.forEach((item) => {
        const button = makeLightboxButton(item);
        grid.appendChild(button);
      });

      gallery.appendChild(grid);
    }
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

function buildPhotographyPage() {
  const layout = document.getElementById("photo-layout");
  if (!layout || typeof archive === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from") || "photo";

  if (!id) {
    window.location.href = "photo.html";
    return;
  }

  const items = sortByDateDescWithIdTiebreak(
    archive.filter((item) => item.type === "photo" && item.showOnPhoto !== false)
  );

  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    window.location.href = "photo.html";
    return;
  }

  const item = items[index];
  const prev = items[index - 1];
  const next = items[index + 1];

  document.getElementById("photo-title").textContent = item.title || "";

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
  applyViewerImage(imgEl, item, "(max-width: 1200px) calc(100vw - 44px), 900px");
  imgEl.addEventListener("click", () => openLightbox(item.image, item.title || ""));

  let backHref = "photo.html";
  let backText = "Back";

  if (from === "archive") {
    backHref = "archive.html";
    backText = "Back to Archive";
  } else if (from === "art") {
    backHref = "art.html";
    backText = "Back to Artwork";
  } else {
    backText = "Back";
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

  preloadImage(prev && prev.image);
  preloadImage(next && next.image);

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
      return item.sections && item.sections.includes("trips");
    }

    return !item.sections || item.sections.includes("writing");
  });

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const item = items[index];

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

  const tripItems = archive
    .filter((item) => {
      if (item.type !== "writing") return false;

      const inTrips =
        item.section === "trips" ||
        (Array.isArray(item.sections) && item.sections.includes("trips"));

      if (!inTrips) return false;
      if (item.showOnWriting === false) return false;

      return true;
    })
    .sort((a, b) => toDate(b.date) - toDate(a.date));

  const grouped = {};

  tripItems.forEach((item) => {
    const substances = Array.isArray(item.substance)
      ? item.substance
      : [item.substance || "Other"];

    substances.forEach((substance) => {
      if (!grouped[substance]) grouped[substance] = [];
      grouped[substance].push(item);
    });
  });

  const substances = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  container.innerHTML = "";
  buildSubstanceNav(substances);

  substances.forEach((substance) => {
    const block = document.createElement("div");
    block.className = "archive-year";
    block.id = `substance-${slugify(substance)}`;

    const heading = document.createElement("h2");
    heading.textContent = substance;

    const list = document.createElement("div");
    list.className = "archive-list";

    grouped[substance].forEach((item) => {
      const row = document.createElement("a");
      row.className = "archive-row";
      row.href = `tripreports.html?id=${item.id}&from=trips`;

      const title = document.createElement("div");
      title.className = "archive-title";
      title.textContent = item.title || "";

      const meta = document.createElement("div");
      meta.className = "archive-meta";
      meta.textContent = item.date || "";

      row.appendChild(title);
      row.appendChild(meta);
      list.appendChild(row);
    });

    block.appendChild(heading);
    block.appendChild(list);
    container.appendChild(block);
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
    publicQuestions = Array.isArray(data.questions) ? data.questions : [];
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
    (a, b) => toDate(b.date) - toDate(a.date)
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
  buildGallery();
  buildArchive();
  buildPhotoArchive();
  buildWritingIndex();
  buildTripReportsPage();
  buildExhibitsArchive();
  buildExhibitPage();
  buildArtworkPage();
  buildPhotographyPage();
  buildWritingPage();
  buildQuestionsPage();
  fetchPublicQuestions();
  buildFooter();
});