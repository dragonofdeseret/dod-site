/* ======================
       DATA SAFETY
========================= */

if (typeof archive === "undefined") {
  console.error("archive.js not loaded or has syntax errors");
}

/* ==================
       HELPERS
===================== */

function groupByYear(items) {
  const years = {};

  items.forEach(item => {
    const year = item.year || new Date(item.date).getFullYear();
    if (!years[year]) years[year] = [];
    years[year].push(item);
  });

  return Object.keys(years)
    .sort((a, b) => Number(b) - Number(a))
    .map(year => ({
      year,
      items: years[year].sort((a, b) => new Date(b.date) - new Date(a.date))
    }));
}

function groupByCollection(items) {
  const collections = {};

  items.forEach(item => {
    const key = item.collection || "__default";

    if (!collections[key]) collections[key] = [];
    collections[key].push(item);
  });

  return collections;
}

function buildYearNav(years) {
  const nav = document.querySelector(".year-nav");
  if (!nav) return;

  nav.innerHTML = "";

  years.forEach(year => {
    const link = document.createElement("a");
    link.href = `#year-${year}`;
    link.textContent = year;
    nav.appendChild(link);
  });
}

/* =========================
    ARCHIVE (archive.html)
============================ */

function buildArchive() {
  const container = document.getElementById("archive");
  if (!container || typeof archive === "undefined") return;

  const grouped = groupByYear(
    archive.filter(item => item.showOnArchive !== false)
  );

  container.innerHTML = "";
  buildYearNav(grouped.map(group => group.year));

  grouped.forEach(group => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${group.year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = group.year;

    const list = document.createElement("div");
    list.className = "archive-list";

    group.items.forEach(item => {
      const row = document.createElement("a");
      row.className = "archive-row";

      if (item.type === "art") {
        row.href = `artwork.html?id=${item.id}&from=archive`;
      } else if (item.type === "photo") {
        row.href = `photography.html?id=${item.id}&from=archive`;
      } else if (item.type === "exhibit") {
        row.href = `exhibit.html?id=${item.id}&from=archive`;
      } else if (item.type === "writing") {
        if (item.sections && item.sections.includes("trips")) {
          row.href = `tripreports.html?id=${item.id}&from=archive`;
        } else {
          row.href = `writings.html?id=${item.id}&from=archive`;
        }
      } else {
        row.href = item.link || "#";
      }

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
  if (!container) return;

  const writingItems = archive
    .filter(item => {
      if (item.type !== "writing") return false;
      if (item.showOnWriting === false) return false;
      return item.showOnWriting === true ||
        !item.sections ||
        item.sections.includes("writing");
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = groupByYear(writingItems);

  container.innerHTML = "";

  buildYearNav(grouped.map(group => group.year));

  grouped.forEach(group => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${group.year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = group.year;

    const list = document.createElement("div");
    list.className = "archive-list";

    group.items.forEach(item => {
      const row = document.createElement("a");
      row.className = "archive-row";
      row.href = `writings.html?id=${item.id}`;

      const title = document.createElement("div");
      title.className = "archive-title";
      title.textContent = item.title;

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

function buildGallery() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const artItems = archive
    .filter(x => x.type === "art" && x.showOnArt !== false)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = groupByYear(artItems);

  gallery.innerHTML = "";

  buildYearNav(grouped.map(group => group.year));

  grouped.forEach(group => {
    const yearSection = document.createElement("section");
    yearSection.className = "gallery-year";
    yearSection.id = `year-${group.year}`;

    const heading = document.createElement("h2");
    heading.textContent = group.year;

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    group.items.forEach(item => {
      const link = document.createElement("a");
      link.href = `artwork.html?id=${item.id}`;

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title || "";

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

  const photoItems = archive
    .filter(item => item.type === "photo" && item.showOnPhoto !== false)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = groupByYear(photoItems);

  container.innerHTML = "";
  buildYearNav(grouped.map(group => group.year));

  grouped.forEach(group => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${group.year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = group.year;

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    group.items.forEach(item => {
      const link = document.createElement("a");
      link.href = `photography.html?id=${item.id}`;
      link.className = "gallery-item";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title || "";

      link.appendChild(img);
      grid.appendChild(link);
    });

    yearBlock.appendChild(yearTitle);
    yearBlock.appendChild(grid);
    container.appendChild(yearBlock);
  });
}

/* ======================
       PHOTOGRAPHY
========================= */

function buildPhotographyPage() {
  if (!window.location.pathname.includes("photography.html")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from");

  if (!id || typeof archive === "undefined") return;

  const items = archive
    .filter(item => item.type === "photo")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const index = items.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = items[index];

  const titleEl = document.getElementById("photo-title");
  const descEl = document.getElementById("photo-description");
  const imgEl = document.getElementById("photo-image");
  const backLink = document.getElementById("back-link");

  if (titleEl) titleEl.textContent = item.title || "";
  if (descEl) descEl.textContent = item.description || "";
  if (imgEl) {
    imgEl.src = item.image;
    imgEl.alt = item.title || "";

    imgEl.addEventListener("click", () => {
      openLightbox(item.image);
    });
  }

  if (backLink) {
    if (from === "archive") {
      backLink.href = "archive.html";
      backLink.textContent = "← Back to Archive";
    } else {
      backLink.href = "photo.html";
      backLink.textContent = "← Back to Photography";
    }
  }

  const prev = items[index - 1];
  const next = items[index + 1];

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && prev) {
      window.location.href = `photography.html?id=${prev.id}`;
    }
    if (e.key === "ArrowRight" && next) {
      window.location.href = `photography.html?id=${next.id}`;
    }
  });
}

/* ========================
    ARTWORK PAGE FEATURES
=========================== */

function enhanceArtworkPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const artItems = archive
    .filter(x => x.type === "art" && x.showOnArt !== false)
    .sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;

      const getIndex = value => {
        const match = value.match(/_(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      };

      return getIndex(a.id) - getIndex(b.id);
    });

  const index = artItems.findIndex(x => x.id === id);
  if (index === -1) return;

  const prev = artItems[index - 1];
  const next = artItems[index + 1];

  [prev, next].forEach(item => {
    if (item && item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && prev) {
      window.location.href = `artwork.html?id=${prev.id}`;
    }
    if (e.key === "ArrowRight" && next) {
      window.location.href = `artwork.html?id=${next.id}`;
    }
    if (e.key === "Escape") {
      const viewer = document.querySelector(".image-viewer");
      if (viewer) viewer.remove();
    }
  });
}

/* ======================
    SURPRISE ME BUTTON
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

/* ======================
    LIGHTBOX VIEWER
========================= */

function openLightbox(src) {
  const viewer = document.createElement("div");
  viewer.className = "image-viewer";

  const img = document.createElement("img");
  img.src = src;

  viewer.appendChild(img);
  viewer.addEventListener("click", () => viewer.remove());

  document.body.appendChild(viewer);
}

/* ======================
        EXHIBITS
========================= */

function buildExhibitsArchive() {
  const container = document.getElementById("exhibits-archive");
  if (!container || typeof exhibits === "undefined") return;

  const grouped = {};

  exhibits.forEach(exhibit => {
    const year = exhibit.year || new Date(exhibit.date).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(exhibit);
  });

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  container.innerHTML = "";
  buildYearNav(years);

  years.forEach(year => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = year;

    const list = document.createElement("div");
    list.className = "archive-list";

    grouped[year]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(exhibit => {
        const row = document.createElement("a");
        row.className = "archive-row";
        row.href = `exhibit.html?id=${exhibit.id}`;

        const title = document.createElement("div");
        title.className = "archive-title";
        title.textContent = exhibit.title;

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

function getExhibitWorks(exhibitId) {
  return archive
    .filter(item => item.type === "art" && item.exhibit === exhibitId)
    .sort((a, b) => {
      const orderA = typeof a.exhibitOrder === "number" ? a.exhibitOrder : 9999;
      const orderB = typeof b.exhibitOrder === "number" ? b.exhibitOrder : 9999;

      if (orderA !== orderB) return orderA - orderB;

      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;

      return (a.title || "").localeCompare(b.title || "");
    });
}

function getImageOrientation(src) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth > img.naturalHeight) {
        resolve("landscape");
      } else if (img.naturalWidth < img.naturalHeight) {
        resolve("portrait");
      } else {
        resolve("square");
      }
    };

    img.onerror = () => resolve("unknown");
    img.src = src;
  });
}

function createExhibitLink(item) {
  const link = document.createElement("a");
  link.href = `artwork.html?id=${item.id}&from=exhibit`;

  if (item.exhibitSpan === "full") {
    link.classList.add("span-full");
  }

  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.title || "";

  img.addEventListener("click", e => {
    e.preventDefault();
    openLightbox(item.image);
  });

  link.appendChild(img);
  return link;
}

function buildExhibitPage() {
  if (!window.location.pathname.includes("exhibit.html")) return;
  if (typeof exhibits === "undefined" || typeof archive === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const exhibit = exhibits.find(x => x.id === id);
  if (!exhibit) return;

  const titleEl = document.getElementById("exhibit-title");
  const descEl = document.getElementById("exhibit-description");
  const gallery = document.querySelector(".exhibit-gallery");

  if (titleEl) titleEl.textContent = exhibit.title;
  if (descEl) descEl.textContent = exhibit.description || "";
  if (!gallery) return;

  const works = archive
    .filter(item => item.type === "art" && item.exhibit === id)
    .sort((a, b) => {
      const orderA = typeof a.exhibitOrder === "number" ? a.exhibitOrder : 9999;
      const orderB = typeof b.exhibitOrder === "number" ? b.exhibitOrder : 9999;

      if (orderA !== orderB) return orderA - orderB;

      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;

      return (a.title || "").localeCompare(b.title || "");
    });

  gallery.innerHTML = "";

  if (!works.length) {
    gallery.innerHTML = "<p>No works found for this exhibit.</p>";
    return;
  }

  const featured = works[0];
  const rest = works.slice(1);

  const featuredWrap = document.createElement("a");
  featuredWrap.className = "exhibit-featured";
  featuredWrap.href = `artwork.html?id=${featured.id}&from=exhibit`;

  const featuredImg = document.createElement("img");
  featuredImg.src = featured.image;
  featuredImg.alt = featured.title || "";

  featuredImg.addEventListener("click", e => {
    e.preventDefault();
    openLightbox(featured.image);
  });

  featuredWrap.appendChild(featuredImg);
  gallery.appendChild(featuredWrap);

  const grid = document.createElement("div");
  grid.className = "exhibit-grid";

  rest.forEach(item => {
    const link = document.createElement("a");
    link.href = `artwork.html?id=${item.id}&from=exhibit`;

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title || "";

    img.addEventListener("click", e => {
      e.preventDefault();
      openLightbox(item.image);
    });

    link.appendChild(img);
    grid.appendChild(link);
  });

  gallery.appendChild(grid);
}

/* ==========================================
   INDIVIDUAL WRITING PAGES (writings.html)
============================================= */

function buildWritingPage() {
  const isWritingViewer = window.location.pathname.includes("writings.html");
  const isTripViewer = window.location.pathname.includes("tripreports.html");

  if (!isWritingViewer && !isTripViewer) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from");
  if (!id) return;

  const items = archive.filter(item => {
    if (item.type !== "writing") return false;

    if (isTripViewer) {
      return item.sections && item.sections.includes("trips");
    }

    return !item.sections || item.sections.includes("writing");
  });

  const index = items.findIndex(x => x.id === id);
  if (index === -1) return;

  const item = items[index];

  const frame = document.getElementById("pdf-frame");
  const titleEl = document.getElementById("writing-title");
  const descEl = document.getElementById("writing-description");
  const downloadLink = document.getElementById("download-link");
  const backLink = document.getElementById("back-link");

  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.description || "";
  if (frame) frame.src = item.file;

  if (backLink) {
    if (from === "archive") {
      backLink.href = "archive.html";
      backLink.textContent = "← Back to Archive";
    } else if (from === "trips") {
      backLink.href = "trips.html";
      backLink.textContent = "← Back to Trip Reports";
    } else {
      backLink.href = "writing.html";
      backLink.textContent = "← Back to Writing";
    }
  }

  if (downloadLink) {
    downloadLink.href = item.file;
  }
}

/* ==============================================
         TRIP REPORTS INDEX / VIEWER
================================================= */

function buildTripReportsPage() {
  const container = document.getElementById("trip-reports");
  if (!container || typeof archive === "undefined") return;
  if (!window.location.pathname.includes("trips.html")) return;

  const tripItems = archive
    .filter(item =>
      item.type === "writing" &&
      item.sections &&
      item.sections.includes("trips") &&
      item.showOnWriting !== false
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = {};

  tripItems.forEach(item => {
    const substance = item.substance || "Other";
    if (!grouped[substance]) grouped[substance] = [];
    grouped[substance].push(item);
  });

  const substances = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  container.innerHTML = "";
  buildSubstanceNav(substances);

  substances.forEach(substance => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "writing-year";
    yearBlock.id = `substance-${slugify(substance)}`;

    const heading = document.createElement("h2");
    heading.textContent = substance;

    const list = document.createElement("div");
    list.className = "writing-list";

    grouped[substance].forEach(item => {
      const entry = document.createElement("div");
      entry.className = "writing-entry";

      const meta = document.createElement("div");
      meta.className = "writing-meta";
      meta.textContent = item.date || "";

      const title = document.createElement("div");
      title.className = "writing-title";

      const link = document.createElement("a");
      link.href = `tripreports.html?id=${item.id}`;
      link.textContent = item.title || "";
      title.appendChild(link);

      const format = document.createElement("div");
      format.className = "writing-format";
      format.textContent = "PDF";

      entry.appendChild(meta);
      entry.appendChild(title);
      entry.appendChild(format);

      list.appendChild(entry);
    });

    yearBlock.appendChild(heading);
    yearBlock.appendChild(list);
    container.appendChild(yearBlock);
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

/* ====================
       QUESTIONS
======================= */

const QUESTIONS_API_URL = "https://script.google.com/macros/s/AKfycbzxbY8YjtcawHMJpzdV4sc4slmI8-eqfv75MArLHGDiFRUx6TqVlbGLONh2UcVTm_Q7TQ/exec";

function formatQuestionDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit"
  }).replace(",", "  ");
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
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const seen = new Set();
  const allQuestions = merged.filter(item => {
    if (!item || !item.question) return false;
    const key = item.id || `${item.date}_${item.question}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  container.innerHTML = "";

  allQuestions.forEach(item => {
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
    <p>© ${new Date().getFullYear()} Christopher Shenefelt | The Dragon of Deseret</p>
    <p>artwork and writing © their respective years</p>
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
  buildQuestionsPage();
  fetchPublicQuestions();

  if (window.location.pathname.includes("artwork.html")) {
    enhanceArtworkPage();
  }

  buildPhotographyPage();
  buildWritingPage();
  buildFooter();
});