/* ==========
   UTILITIES
========== */

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function toDate(str) {
  return new Date(str);
}

function groupByYear(items) {
  const groups = {};
  items.forEach(item => {
    const year = item.year || (item.date ? new Date(item.date).getFullYear() : "Unknown");
    if (!groups[year]) groups[year] = [];
    groups[year].push(item);
  });
  return groups;
}

function sortByDateDesc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

/* ==========
   DATA ACCESS
========== */

function getArtItems() {
  return window.artItems || [];
}

function getPhotoItems() {
  return window.photoItems || [];
}

function getWritingItems() {
  return window.writingItems || [];
}

function getMarginsItems() {
  return window.marginsItems || [];
}

function getQuotesItems() {
  return window.quotesItems || [];
}

function getExhibits() {
  return window.exhibits || [];
}

function getAllArchiveItems() {
  return [
    ...getArtItems(),
    ...getPhotoItems(),
    ...getWritingItems(),
    ...getMarginsItems(),
    ...getQuotesItems()
  ];
}

/* ==========
   IMAGE HELPERS
========== */

function applyImage(img, item, useThumb = true) {
  if (!img || !item) return;

  const src = useThumb ? (item.thumb || item.image) : item.image;

  img.src = src;

  if (useThumb && item.thumbSrcset) {
    img.srcset = item.thumbSrcset;
    img.sizes = "(max-width: 600px) 100vw, 300px";
  } else if (!useThumb && item.imageSrcset) {
    img.srcset = item.imageSrcset;
  }
}

/* ==========
   ART GRID
========== */

function buildArtGrid() {
  const container = $("#art-archive");
  if (!container) return;

  const items = getArtItems().slice().sort(sortByDateDesc);
  const groups = groupByYear(items);

  container.innerHTML = "";

  Object.keys(groups).sort((a,b)=>b-a).forEach(year => {
    const section = document.createElement("section");
    section.className = "archive-year";

    const h2 = document.createElement("h2");
    h2.textContent = year;
    section.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    groups[year].forEach(item => {
      const card = document.createElement("div");
      card.className = "gallery-item";

      const img = document.createElement("img");
      applyImage(img, item, true);

      card.appendChild(img);

      card.addEventListener("click", () => {
        window.location.href = `artwork.html?id=${item.id}`;
      });

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/* ==========
   PHOTO GRID
========== */

function buildPhotoArchive() {
  const container = $("#photo-archive");
  if (!container) return;

  const items = getPhotoItems().slice().sort(sortByDateDesc);
  const groups = groupByYear(items);

  container.innerHTML = "";

  Object.keys(groups).sort((a,b)=>b-a).forEach(year => {
    const section = document.createElement("section");
    section.className = "archive-year";

    const h2 = document.createElement("h2");
    h2.textContent = year;
    section.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    groups[year].forEach(item => {
      const card = document.createElement("div");
      card.className = "gallery-item";

      const img = document.createElement("img");
      applyImage(img, item, true);

      card.appendChild(img);

      card.addEventListener("click", () => {
        window.location.href = `photo.html?id=${item.id}`;
      });

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/* ==========
   ARTWORK PAGE
========== */

function buildArtworkPage() {
  const container = $("#artwork-layout");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const item = getArtItems().find(i => i.id === id);
  if (!item) return;

  container.innerHTML = "";

  const img = document.createElement("img");
  applyImage(img, item, false);

  container.appendChild(img);
}

/* ==========
   PHOTO PAGE
========== */

function buildPhotoPage() {
  const container = $("#photo-layout");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const item = getPhotoItems().find(i => i.id === id);
  if (!item) return;

  container.innerHTML = "";

  const img = document.createElement("img");
  applyImage(img, item, false);

  container.appendChild(img);
}

/* ==========
   EXHIBITS
========== */

function getExhibitWorks(exhibitId) {
  return getArtItems()
    .filter(i => i.exhibit === exhibitId)
    .sort((a, b) => {
      const ao = Number(a.exhibitOrder ?? 9999);
      const bo = Number(b.exhibitOrder ?? 9999);
      if (ao !== bo) return ao - bo;
      return new Date(a.date) - new Date(b.date);
    });
}

function buildExhibitsArchive() {
  const container = $("#exhibits-archive");
  if (!container) return;

  const exhibits = getExhibits();
  container.innerHTML = "";

  exhibits.forEach(exhibit => {
    const div = document.createElement("div");
    div.className = "exhibit-card";

    div.textContent = exhibit.title || exhibit.id;

    div.addEventListener("click", () => {
      window.location.href = `exhibit.html?id=${exhibit.id}`;
    });

    container.appendChild(div);
  });
}

function buildExhibitPage() {
  const container = $("#exhibit-layout");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const works = getExhibitWorks(id);

  container.innerHTML = "";

  works.forEach(item => {
    const img = document.createElement("img");
    applyImage(img, item, false);
    container.appendChild(img);
  });
}

/* ==========
   WRITING
========== */

function buildWritingIndex() {
  const container = $("#writing-archive");
  if (!container) return;

  const items = getWritingItems().slice().sort(sortByDateDesc);

  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "writing-item";
    div.textContent = item.title || item.date;

    container.appendChild(div);
  });
}

/* ==========
   ARCHIVE PAGE
========== */

function buildArchivePage() {
  const container = $("#archive");
  if (!container) return;

  const items = getAllArchiveItems().slice().sort(sortByDateDesc);

  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "archive-item";
    div.textContent = item.title || item.date;
    container.appendChild(div);
  });
}

/* ==========
   INIT
========== */

document.addEventListener("DOMContentLoaded", () => {
  buildArtGrid();
  buildPhotoArchive();
  buildArtworkPage();
  buildPhotoPage();
  buildExhibitsArchive();
  buildExhibitPage();
  buildWritingIndex();
  buildArchivePage();
});