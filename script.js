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
  if (!container) return;

  const yearNav = document.getElementById("year-nav");

  const grouped = groupByYear(archive);

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
  row.href = `writing.html?id=${item.id}`;

} else {
  row.href = "#";
}

      const title = document.createElement("div");
      title.className = "archive-title";
      title.textContent = item.title;

      row.appendChild(title);

      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
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

    if (item.type === "writing") {
      const tag = document.createElement("span");
      tag.textContent = "PDF";
      tag.className = "archive-tag";
      row.appendChild(tag);
}

}

/* =========================
   RANDOM BUTTON
========================= */

function buildRandomButton(artItems) {
  const gallery = document.querySelector(".gallery");
  if (!gallery || !artItems.length) return;

  const button = document.createElement("button");
  button.className = "random-button";
  button.textContent = "Random Artwork";

  button.addEventListener("click", () => {
    const random = artItems[Math.floor(Math.random() * artItems.length)];
    window.location.href = `artwork.html?id=${random.id}`;
  });

  gallery.appendChild(button);
}

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
    // sort by date first
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;

    // then sort by suffix (_1, _2, etc.)
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

  // PRELOAD
  [prev, next].forEach(item => {
    if (item && item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });

  // KEYBOARD NAV
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

/* =========================
   WRITING PAGE
========================= */ 

function buildWritingPage() {
  if (!window.location.pathname.includes("writing.html")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const items = archive.filter(x => x.type === "writing");

  const index = items.findIndex(x => x.id === id);
  if (index === -1) return;

  const item = items[index];

  // SET CONTENT
  const title = document.getElementById("writing-title");
  const desc = document.getElementById("writing-description");
  const frame = document.getElementById("pdf-frame");

  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.description || "";
  if (frame) frame.src = item.file;

  // PRELOAD NEXT / PREV
  const prev = items[index - 1];
  const next = items[index + 1];

  [prev, next].forEach(x => {
    if (x && x.file) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = x.file;
      document.head.appendChild(link);
    }
  });

  // KEYBOARD NAV
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && prev) {
      window.location.href = `writing.html?id=${prev.id}`;
    }

    if (e.key === "ArrowRight" && next) {
      window.location.href = `writing.html?id=${next.id}`;
    }
  });
}

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
    <p>artwork and writing © their respective years
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
