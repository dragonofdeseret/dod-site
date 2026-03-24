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
  if (!window.location.pathname.includes("archive.html")) return;

  const container = document.getElementById("archive");
  if (!container) return;

  const items = archive
    .filter(item => item.type === "writing" || (item.type === "art" && item.showOnArt !== false))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = groupByYear(items);

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

      if (item.type === "writing") {
        if (item.sections && item.sections.includes("trips")) {
          row.href = `writings.html?id=${item.id}&from=archive`;
        } else {
          row.href = `writings.html?id=${item.id}&from=archive`;
        }
      } else if (item.type === "art") {
        row.href = `artwork.html?id=${item.id}&from=archive`;
      } else {
        return;
      }

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
  if (!window.location.pathname.includes("tripreports.html") && !window.location.pathname.includes("trips.html")) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const items = archive
    .filter(item => item.type === "writing" && item.sections && item.sections.includes("trips"))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // INDEX PAGE (trips.html)
  const indexContainer = document.getElementById("trip-reports");
  if (indexContainer && !id) {
    const grouped = groupByYear(items);

    indexContainer.innerHTML = "";
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
        row.href = `writings.html?id=${item.id}&from=trips`;

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
      indexContainer.appendChild(yearBlock);
    });

    return;
  }

  // VIEWER PAGE (tripreports.html?id=...)
  if (!window.location.pathname.includes("tripreports.html")) return;
  if (!id) return;

  const from = params.get("from");
  const index = items.findIndex(x => x.id === id);
  if (index === -1) return;

  const item = items[index];

  const frame = document.getElementById("pdf-frame");
  const titleEl = document.getElementById("writing-title");
  const descEl = document.getElementById("writing-description");
  const downloadLink = document.getElementById("download-link");
  const backLink = document.getElementById("back-link") || document.querySelector(".writing-actions a:first-child");

  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.description || "";
  if (frame) frame.src = item.file;

  if (backLink) {
    if (from === "archive") {
      backLink.href = "archive.html";
      backLink.textContent = "← Back to Archive";
    } else {
      backLink.href = "trips.html";
      backLink.textContent = "← Back to Trip Reports";
    }
  }

  if (window.plausible) {
    plausible("PDF View", {
      props: { title: item.title, id: item.id }
    });
  }

  if (frame) {
    frame.onload = () => {
      if (window.plausible) {
        plausible("PDF View Loaded", {
          props: { title: item.title, id: item.id }
        });
      }
    };
  }

  const prev = items[index - 1];
  const next = items[index + 1];

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && prev) {
      window.location.href = `writings.html?id=${prev.id}&from=trips`;
    }
    if (e.key === "ArrowRight" && next) {
      window.location.href = `writings.html?id=${next.id}&from=trips`;
    }
  });

  if (downloadLink) {
    downloadLink.href = item.file;

    downloadLink.addEventListener("click", () => {
      if (window.plausible) {
        plausible("PDF Download", {
          props: { title: item.title }
        });
      }
    });
  }

  const start = Date.now();

  window.addEventListener("beforeunload", () => {
    const duration = Math.round((Date.now() - start) / 1000);

    if (window.plausible) {
      plausible("PDF Time", {
        props: {
          title: item.title,
          seconds: duration
        }
      });
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
  buildWritingIndex();
  buildTripReportsPage();
  buildExhibitsArchive();
  buildExhibitPage();

  if (window.location.pathname.includes("artwork.html")) {
    enhanceArtworkPage();
  }

  buildWritingPage();
  buildFooter();
});
