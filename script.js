/* =========================
   DATA SAFETY
========================= */

if (typeof archive === "undefined") {
  console.error("archive.js not loaded");
}

/* =========================
   BUILD ART PAGE GALLERY
========================= */

function buildGallery() {

  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  gallery.innerHTML = "";

  const artItems = archive.filter(item => item.type === "art");

  const years = {};

  artItems.forEach(art => {
    if (!years[art.year]) years[art.year] = [];
    years[art.year].push(art);
  });

  Object.keys(years)
    .sort((a,b) => b - a)
    .forEach(year => {

      const section = document.createElement("div");
      section.className = "gallery-year";
      section.id = "year-" + year;

      const heading = document.createElement("h2");
      heading.textContent = year;

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      years[year].forEach(art => {

        const link = document.createElement("a");
        link.href = `artwork.html?id=${art.id}`;

        const img = document.createElement("img");
        img.src = art.image;
        img.alt = art.title;

        link.appendChild(img);
        grid.appendChild(link);

      });

      section.appendChild(heading);
      section.appendChild(grid);
      gallery.appendChild(section);

    });

}

/* =========================
   BUILD ARCHIVE PAGE
========================= */

function buildArchive() {

  const container = document.querySelector("#archive");
  if (!container) return;

  container.innerHTML = "";

  const years = {};

  archive.forEach(item => {

    if (!item || !item.year) return;

    if (!years[item.year]) years[item.year] = [];
    years[item.year].push(item);

  });

  Object.keys(years)
    .sort((a,b) => b - a)
    .forEach(year => {

      const section = document.createElement("div");
      section.className = "archive-year";
      section.id = "year-" + year;

      const heading = document.createElement("h2");
      heading.textContent = year;

      const list = document.createElement("div");
      list.className = "archive-list";

      years[year].forEach(item => {

        const row = document.createElement("a");
        row.className = "archive-row";

        row.href = item.type === "art"
          ? `artwork.html?id=${item.id}`
          : item.page;

        let thumbnail = "";

        if (item.type === "art" && item.image) {
          thumbnail = `<img src="${item.image}" alt="${item.title}">`;
        }

        row.innerHTML = `
          <span class="archive-title">${item.title || "Untitled"}</span>
          ${thumbnail}
        `;

        list.appendChild(row);

      });

      section.appendChild(heading);
      section.appendChild(list);
      container.appendChild(section);

    });

}

/* =========================
   YEAR NAV (TOP LINKS)
========================= */

function buildYearNav(){

  const container = document.querySelector(".year-nav");
  if (!container) return;

  const years = [...new Set(
    archive.map(item => item.year)
  )].sort((a,b) => b - a);

  container.innerHTML = years.map(year =>
    `<a href="#year-${year}">${year}</a>`
  ).join(" ");

}

/* =========================
   ARTWORK PAGE (NEW SYSTEM)
========================= */

function buildArtworkPage(){

  const title = document.getElementById("title");
  const image = document.getElementById("image");
  const description = document.getElementById("description");
  const nav = document.getElementById("nav");

  if (!title || !image) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const item = archive.find(x => x.id === id && x.type === "art");
  if (!item) return;

  title.textContent = item.title;
  image.src = item.image;
  description.textContent = item.description || "";

  /* navigation */

  const artItems = archive
    .filter(x => x.type === "art")
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  const index = artItems.findIndex(x => x.id === id);

  const prev = artItems[index - 1];
  const next = artItems[index + 1];

  nav.innerHTML = `
    ${prev ? `<a href="artwork.html?id=${prev.id}">← Previous</a>` : ""}
    <a href="art.html">Back to Art</a>
    ${next ? `<a href="artwork.html?id=${next.id}">Next →</a>` : ""}
  `;

  /* arrow keys */

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && prev){
      window.location.href = `artwork.html?id=${prev.id}`;
    }
    if (e.key === "ArrowRight" && next){
      window.location.href = `artwork.html?id=${next.id}`;
    }
  });

}

/* =========================
   IMAGE VIEWER
========================= */

function openViewer(src){

  const viewer = document.createElement("div");
  viewer.className = "image-viewer";

  viewer.innerHTML = `
    <div class="viewer-inner">
      <img src="${src}">
    </div>
  `;

  document.body.appendChild(viewer);

  viewer.addEventListener("click", () => {
    viewer.classList.toggle("zoomed");
  });

  document.addEventListener("keydown", function esc(e){
    if (e.key === "Escape"){
      viewer.remove();
      document.removeEventListener("keydown", esc);
    }
  });

}

document.addEventListener("click", e => {
  if (e.target.matches(".art-image img")) {
    openViewer(e.target.src);
  }
});

/* =========================
   COLLECTIONS
========================= */

function buildCollections(){

  const container = document.querySelector("#collections");
  if (!container) return;

  const collections = {};

  archive
    .filter(item => item.type === "art" && item.collection)
    .forEach(item => {

      if (!collections[item.collection]) {
        collections[item.collection] = [];
      }

      collections[item.collection].push(item);

    });

  Object.keys(collections).forEach(name => {

    const section = document.createElement("div");
    section.className = "collection";

    section.innerHTML = `<h2>${name}</h2>`;

    const grid = document.createElement("div");
    grid.className = "collection-grid";

    collections[name].forEach(item => {

      const link = document.createElement("a");
      link.href = `artwork.html?id=${item.id}`;

      link.innerHTML = `<img src="${item.image}">`;

      grid.appendChild(link);

    });

    section.appendChild(grid);
    container.appendChild(section);

  });

}

/* =========================
   RANDOM ARTWORK
========================= */

function randomArtwork() {
  const artItems = archive.filter(item => item.type === "art");
  const random = artItems[Math.floor(Math.random() * artItems.length)];
  window.location.href = `artwork.html?id=${random.id}`;
}

/* =========================
   FOOTER
========================= */

function insertFooter() {

  const footer = document.createElement("footer");
  footer.className = "site-footer";

  footer.innerHTML = `
    <p>© ${new Date().getFullYear()} Christopher Shenefelt | The Dragon of Deseret</p>
    <p>artworks and writings © their respective years</p>
  `;

  document.querySelector("main")?.appendChild(footer);

}

/* =========================
   RUN
========================= */

document.addEventListener("DOMContentLoaded", () => {

  buildGallery();
  buildArchive();
  buildYearNav();
  buildArtworkPage();
  buildCollections();
  insertFooter();

});
