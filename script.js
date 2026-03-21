/* =========================
   DATA SAFETY
========================= */

if (typeof archive === "undefined") {
  console.error("archive.js not loaded or has syntax errors");
}

/* =========================
   HELPERS
========================= */

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
   GALLERY (art.html)
========================= */

function buildGallery() {
  const gallery = document.querySelector("section.gallery");
  if (!gallery) return;

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

/* =========================
   ARCHIVE (archive.html)
========================= */

function buildArchive() {
  const container = document.getElementById("archive");
  if (!container || typeof archive === "undefined") return;

  const yearNav = document.querySelector(".year-nav");
  const isWritingPage = window.location.pathname.includes("writing.html");
  const items = isWritingPage
    ? archive.filter(item => item.type === "writing")
    : archive;

  const grouped = groupByYear(items);

  container.innerHTML = "";
  if (yearNav) yearNav.innerHTML = "";

  grouped.forEach(group => {
    const section = document.createElement("div");
    section.className = "archive-year";
    section.id = `year-${group.year}`;

    const header = document.createElement("h2");
    header.textContent = group.year;
    section.appendChild(header);

    const list = document.createElement("div");
    list.className = "archive-list";

    group.items.forEach(item => {
      const row = document.createElement("a");
      row.className = "archive-row";

      if (item.type === "art") {
        row.href = `artwork.html?id=${item.id}`;
      } else if (item.type === "writing") {
        row.href = `writings.html?id=${item.id}`;
      } else {
        row.href = "#";
      }

      const title = document.createElement("div");
      title.className = "archive-title";
      title.textContent = item.title;
      row.appendChild(title);

      if (item.type === "writing") {
        const meta = document.createElement("div");
        meta.className = "archive-meta";
        meta.textContent = "PDF";
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

    section.appendChild(list);
    container.appendChild(section);

    if (yearNav) {
      const navLink = document.createElement("a");
      navLink.href = `#year-${group.year}`;
      navLink.textContent = group.year;
      yearNav.appendChild(navLink);
    }
  });
}

<!--
/* =========================
   RANDOM BUTTON
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
-->

/* =========================
   LIGHTBOX
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

/* =========================
   ARTWORK PAGE FEATURES
========================= */

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

<!--
/* ===============================
   WRITING PAGE (writings.html)
================================== */

function buildWritingPage() {
  if (!window.location.pathname.includes("writings.html")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const items = archive.filter(x => x.type === "writing");
  const index = items.findIndex(x => x.id === id);
  if (index === -1) return;

  const item = items[index];

  const frame = document.getElementById("pdf-frame");

  document.getElementById("writing-title").textContent = item.title;
  document.getElementById("writing-description").textContent = item.description || "";
  frame.src = item.file;

  // analytics
  if (window.plausible) {
    plausible("PDF View", {
      props: { title: item.title, id: item.id }
    });
  }

  frame.onload = () => {
    if (window.plausible) {
      plausible("PDF View Loaded", {
        props: { title: item.title, id: item.id }
      });
    }
  };

  const prev = items[index - 1];
  const next = items[index + 1];

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && prev) {
      window.location.href = `writings.html?id=${prev.id}`;
    }
    if (e.key === "ArrowRight" && next) {
      window.location.href = `writings.html?id=${next.id}`;
    }
  });

  const downloadLink = document.getElementById("download-link");
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

  let start = Date.now();

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
-->

// ===== DETECT PAGE =====

const isWritingPage =
  document.title.toLowerCase().includes("writing");

// choose dataset
const data = isWritingPage ? writingData : archive;

// ===== GROUP BY YEAR =====

const grouped = {};

data.forEach(item => {
  if (!grouped[item.year]) {
    grouped[item.year] = [];
  }
  grouped[item.year].push(item);
});

// sort years DESC
const years = Object.keys(grouped).sort((a, b) => b - a);

// ===== RENDER =====

const container = document.getElementById("archive");
const yearNav = document.querySelector(".year-nav");

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

  grouped[year].forEach(item => {
    const row = document.createElement("a");
    row.href = item.link;
    row.className = "archive-row";
    list.appendChild(row);
  });

  yearBlock.appendChild(yearTitle);
  yearBlock.appendChild(list);
  container.appendChild(yearBlock);
});


/* =========================
   FOOTER
========================= */

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

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  buildGallery();
  buildArchive();

  if (window.location.pathname.includes("artwork.html")) {
    enhanceArtworkPage();
  }

  buildWritingPage();
  buildFooter();
});


