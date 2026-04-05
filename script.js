/* ==========
   UTIL
========== */

function $(sel, root = document) {
  return root.querySelector(sel);
}

function toDate(str) {
  return new Date(str);
}

function sortByDateDesc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

function groupByYear(items) {
  const map = {};
  items.forEach(item => {
    const year = item.year || new Date(item.date).getFullYear();
    if (!map[year]) map[year] = [];
    map[year].push(item);
  });
  return map;
}

/* ==========
   DATA
========== */

const artItems = window.artItems || [];
const photoItems = window.photoItems || [];
const writingItems = window.writingItems || [];
const exhibits = window.exhibits || [];

/* ==========
   IMAGE
========== */

function applyImage(img, item, thumb = true) {
  const src = thumb ? (item.thumb || item.image) : item.image;
  img.src = src;

  if (thumb && item.thumbSrcset) {
    img.srcset = item.thumbSrcset;
    img.sizes = "(max-width: 700px) 100vw, 300px";
  } else if (!thumb && item.imageSrcset) {
    img.srcset = item.imageSrcset;
  }
}

/* ==========
   ART PAGE
========== */

function buildArtPage() {
  const container = document.querySelector(".gallery");
  if (!container) return;

  const items = [...artItems].sort(sortByDateDesc);
  const grouped = groupByYear(items);

  container.innerHTML = "";

  Object.keys(grouped)
    .sort((a, b) => b - a)
    .forEach(year => {
      const section = document.createElement("section");
      section.className = "gallery-year";

      const title = document.createElement("h2");
      title.textContent = year;
      section.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      grouped[year].forEach(item => {
        const link = document.createElement("a");
        link.href = `artwork.html?id=${item.id}`;

        const img = document.createElement("img");
        applyImage(img, item, true);

        link.appendChild(img);
        grid.appendChild(link);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
}

/* ==========
   PHOTO INDEX
========== */

function buildPhotoIndex() {
  const container = document.querySelector("#photo-archive");
  if (!container) return;

  const items = [...photoItems].sort(sortByDateDesc);
  const grouped = groupByYear(items);

  container.innerHTML = "";

  Object.keys(grouped)
    .sort((a, b) => b - a)
    .forEach(year => {
      const section = document.createElement("section");
      section.className = "gallery-year";

      const title = document.createElement("h2");
      title.textContent = year;
      section.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      grouped[year].forEach(item => {
        const link = document.createElement("a");
        link.href = `photo.html?id=${item.id}`;

        const img = document.createElement("img");
        applyImage(img, item, true);

        link.appendChild(img);
        grid.appendChild(link);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
}

/* ==========
   ARTWORK PAGE
========== */

function buildArtworkPage() {
  const container = document.querySelector(".art-image");
  if (!container) return;

  const id = new URLSearchParams(location.search).get("id");
  const item = artItems.find(i => i.id === id);
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
  const container = document.querySelector("#photo-layout");
  if (!container) return;

  const id = new URLSearchParams(location.search).get("id");
  const item = photoItems.find(i => i.id === id);
  if (!item) return;

  container.innerHTML = "";

  const img = document.createElement("img");
  applyImage(img, item, false);

  container.appendChild(img);
}

/* ==========
   EXHIBITS
========== */

function getExhibitWorks(id) {
  return artItems
    .filter(i => i.exhibit === id)
    .sort((a, b) => {
      const ao = Number(a.exhibitOrder ?? 9999);
      const bo = Number(b.exhibitOrder ?? 9999);
      if (ao !== bo) return ao - bo;
      return new Date(a.date) - new Date(b.date);
    });
}

function buildExhibitsPage() {
  const container = document.querySelector("#exhibits-archive");
  if (!container) return;

  container.innerHTML = "";

  exhibits.forEach(ex => {
    const div = document.createElement("div");
    div.className = "exhibit-card";
    div.textContent = ex.title || ex.id;

    div.onclick = () => {
      location.href = `exhibit.html?id=${ex.id}`;
    };

    container.appendChild(div);
  });
}

function buildExhibitPage() {
  const container = document.querySelector(".exhibit-gallery");
  if (!container) return;

  const id = new URLSearchParams(location.search).get("id");
  const works = getExhibitWorks(id);

  container.innerHTML = "";

  works.forEach(item => {
    const img = document.createElement("img");
    applyImage(img, item, false);
    container.appendChild(img);
  });
}

/* ==========
   INIT
========== */

document.addEventListener("DOMContentLoaded", () => {
  buildArtPage();
  buildPhotoIndex();
  buildArtworkPage();
  buildPhotoPage();
  buildExhibitsPage();
  buildExhibitPage();
});