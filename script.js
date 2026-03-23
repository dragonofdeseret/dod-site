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
    if (!years[item.year]) years[item.year] = [];
    years[item.year].push(item);
  });

  return Object.keys(years)
    .sort((a, b) => b - a)
    .map(year => ({
      year,
      items: years[year].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )
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

/* =========================
   ARCHIVE (archive.html)
============================ */

function buildArchive() {
  const container = document.getElementById("archive");
  if (!container || typeof archive === "undefined" || !Array.isArray(archive)) return;

  const yearNav = document.querySelector(".year-nav");
  const path = window.location.pathname;

  const isArchivePage = path.includes("archive.html");
  const isWritingPage = path.includes("writing.html");
  const isTripsPage = path.includes("trips.html");

  let items = archive;

  if (isWritingPage) {
    items = archive.filter(item =>
      item.type === "writing" &&
      (
        !item.sections ||
        item.sections.includes("writing")
      )
    );
  } else if (isTripsPage) {
    items = archive.filter(item =>
      item.type === "writing" &&
      item.sections &&
      item.sections.includes("trips")
    );
  }

  const grouped = {};

  items.forEach(item => {
    const year = item.year || new Date(item.date).getFullYear();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(item);
  });

  const years = Object.keys(grouped).sort((a, b) => b - a);

  container.innerHTML = "";
  if (yearNav) yearNav.innerHTML = "";

  years.forEach(year => {
    if (yearNav) {
      const navLink = document.createElement("a");
      navLink.href = `#year-${year}`;
      navLink.textContent = year;
      yearNav.appendChild(navLink);
    }

    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";
    yearBlock.id = `year-${year}`;

    const yearTitle = document.createElement("h2");
    yearTitle.textContent = year;

    const list = document.createElement("div");
    list.className = "archive-list";

    grouped[year]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(item => {
        const row = document.createElement("a");
        row.className = "archive-row";

        if (item.type === "art") {
          row.href = isArchivePage
            ? `artwork.html?id=${item.id}&from=archive`
            : `artwork.html?id=${item.id}`;
        } else if (item.type === "writing") {
          if (isTripsPage) {
            row.href = `tripreports.html?id=${item.id}&from=trips`;
          } else if (isArchivePage) {
            row.href = `writings.html?id=${item.id}&from=archive`;
          } else {
            row.href = `writings.html?id=${item.id}`;
          }
        } else {
          row.href = item.link || "#";
        }

        const title = document.createElement("div");
        title.className = "archive-title";
        title.textContent = item.title;
        row.appendChild(title);

        if (item.type === "writing") {
          const meta = document.createElement("div");
          meta.className = "archive-meta";
          meta.textContent = item.meta || "PDF";
          row.appendChild(meta);
        }

        if (item.type === "art" && item.image) {
          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.title || "";
          row.appendChild(img);
        }

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
  if (!gallery || typeof archive === "undefined") return;

  const yearNav = document.querySelector(".year-nav");

  const artItems = archive.filter(item => item.type === "art");
  const groupedYears = groupByYear(artItems);

  gallery.innerHTML = "";
  if (yearNav) yearNav.innerHTML = "";

  groupedYears.forEach(group => {
    const section = document.createElement("div");
    section.className = "gallery-year";
    section.id = `year-${group.year}`;

    const header = document.createElement("h2");
    header.textContent = group.year;
    section.appendChild(header);

    const collections = groupByCollection(group.items);

    Object.keys(collections).forEach(name => {
      const items = collections[name];

      if (name !== "__default") {
        const title = document.createElement("h3");
        title.textContent = name;
        title.className = "collection-title";
        section.appendChild(title);
      }

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      items.forEach(item => {
        const link = document.createElement("a");
        link.href = `artwork.html?id=${item.id}`;

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

      section.appendChild(grid);
    });

    gallery.appendChild(section);

    if (yearNav) {
      const navLink = document.createElement("a");
      navLink.href = `#year-${group.year}`;
      navLink.textContent = group.year;
      yearNav.appendChild(navLink);
    }
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
    .filter(x => x.type === "art")
    .sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;

      const getIndex = id => {
        const match = id.match(/_(\d+)$/);
        return match ? parseInt(match[1]) : 0;
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

  const years = Object.keys(grouped).sort((a, b) => b - a);

  container.innerHTML = "";

  years.forEach(year => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "archive-year";

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

 const works = archive
  .filter(item => item.type === "art" && item.exhibit === id)
  .sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    return (a.title || "").localeCompare(b.title || "");
  });

  if (!gallery) return;
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
    INDIVIDUAL WRITING PAGES (tripreports.html)
================================================= */

function buildTripReportsPage() {
  if (!window.location.pathname.includes("tripreports.html")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const from = params.get("from");
  if (!id) return;

  const items = archive.filter(x => x.type === "trips");
  const index = items.findIndex(x => x.id === id);
  if (index === -1) return;

  const item = items[index];

  const frame = document.getElementById("pdf-frame");
  const titleEl = document.getElementById("writing-title");
  const descEl = document.getElementById("writing-description");
  const downloadLink = document.getElementById("download-link");
  const backLink = document.querySelector(".writing-actions a:first-child");

  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.description || "";
  if (frame) frame.src = item.file;

  // dynamic back link
  if (backLink) {
    if (from === "archive") {
      backLink.href = "archive.html";
      backLink.textContent = "← Back to Archive";
    } else {
      backLink.href = "writing.html";
      backLink.textContent = "← Back to Writing";
    }
  }

  // analytics
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
      window.location.href = `writings.html?id=${prev.id}${from ? `&from=${from}` : ""}`;
    }
    if (e.key === "ArrowRight" && next) {
      window.location.href = `writings.html?id=${next.id}${from ? `&from=${from}` : ""}`;
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
  buildExhibitsArchive();
  buildExhibitPage();

  if (window.location.pathname.includes("artwork.html")) {
    enhanceArtworkPage();
  }

  buildWritingPage();
  buildFooter();
});


