/* =========================
   BUILD ART PAGE GALLERY
========================= */

function buildGallery() {

const gallery = document.querySelector(".gallery");
if (!gallery) return;

gallery.innerHTML = "";

const years = {};

archive.forEach(art => {
if (!years[art.year]) {
years[art.year] = [];
}
years[art.year].push(art);
});

Object.keys(years)
.sort((a,b) => b - a)
.forEach(year => {

const section = document.createElement("div");
section.className = "gallery-year";

const heading = document.createElement("h2");
heading.textContent = year;

const grid = document.createElement("div");
grid.className = "gallery-grid";

years[year].forEach(art => {

const link = document.createElement("a");
link.href = art.page;

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
   IMAGE VIEWER
========================= */

document.addEventListener("click", e => {

if (e.target.matches(".series-gallery img, .art-image img")) {

const viewer = document.createElement("div");

viewer.className = "image-viewer";

viewer.innerHTML = `<img src="${e.target.src}">`;

viewer.onclick = () => viewer.remove();

document.body.appendChild(viewer);

}

});


/* =========================
   BUILD ARCHIVE PAGE
========================= */

function buildArchive() {

const archive = document.querySelector("#archive");
if (!archive) return;

archive.innerHTML = "";

const years = {};

archive.forEach(art => {

if (!years[art.year]) {
years[art.year] = [];
}

years[art.year].push(art);

});

Object.keys(years)
.sort((a,b) => b - a)
.forEach(year => {

const section = document.createElement("div");
section.className = "archive-year";

const heading = document.createElement("h2");
heading.textContent = year;

const list = document.createElement("div");
list.className = "archive-list";

years[year].forEach(art => {

const row = document.createElement("a");
row.className = "archive-row";
row.href = art.page;

row.innerHTML = `
<span class="archive-title">${art.title.replace(", " + art.year, "")}</span>
<img src="${art.image}" alt="${art.title}">
`;

list.appendChild(row);

});

section.appendChild(heading);
section.appendChild(list);
archive.appendChild(section);

});

}

/* =========================
   YEAR NAVIGATION  
========================= */

function buildYearNav() {

const nav = document.getElementById("year-nav");

if (!nav) return;

const years = document.querySelectorAll(".gallery-year, .archive-year");

if (!years.length) return;

nav.innerHTML = "Jump to: ";

years.forEach((section, index) => {

const year = section.querySelector("h2").textContent;

const id = "year-" + year;

section.id = id;

const link = document.createElement("a");

link.href = "#" + id;

link.textContent = year;

nav.appendChild(link);

if (index < years.length - 1) {
nav.append(" · ");
}

});

}

/* =========================
   PREVIOUS / NEXT ARTWORK
========================= */

function buildArtNavigation() {

if (typeof artworks === "undefined") return;

const currentPath = window.location.pathname;
const currentPage = currentPath.split("/").pop();

const index = artworks.findIndex(art => art.page.includes(currentPage));

if (index === -1) return;

const prev = artworks[index - 1];
const next = artworks[index + 1];

const nav = document.querySelector(".art-navigation");

if (!nav) return;

function formatDate(dateString) {

const [year, month, day] = dateString.split("-").map(Number);

const date = new Date(year, month - 1, day);

return date.toLocaleDateString("en-US", {
year: "numeric",
month: "short",
day: "numeric"
});

}

nav.innerHTML = `

<div class="nav-left">
${prev ? `<a href="../${prev.page}">← ${formatDate(prev.date)}</a>` : ""}
</div>

<div class="nav-center">
<a href="../art.html">Back to Art</a>
</div>

<div class="nav-right">
${next ? `<a href="../${next.page}">${formatDate(next.date)} →</a>` : ""}
</div>

`;

document.addEventListener("keydown", (e) => {

if (e.key === "ArrowLeft" && prev) {
window.location.href = "../" + prev.page;
}

if (e.key === "ArrowRight" && next) {
window.location.href = "../" + next.page;
}

});

}

buildArtNavigation();

/* =========================
   RANDOM ARTWORK BUTTON
========================= */

function randomArtwork() {

const random = artworks[Math.floor(Math.random() * artworks.length)];
window.location.href = random.page;

}


/* =========================
   AUTO FOOTER
========================= */

function insertFooter() {

const footer = document.createElement("footer");

footer.className = "site-footer";

footer.innerHTML = `
<p>© ${new Date().getFullYear()} Christopher Shenefelt | The Dragon of Deseret</p>
<p class="footer-note">All artwork and writing © their respective years</p>
`;

document.querySelector("main").appendChild(footer);

}

/* =========================
   RUN EVERYTHING
========================= */

document.addEventListener("DOMContentLoaded", () => {
  buildGallery();
  buildArchive();
  buildYearNav();
  buildArtNavigation();
  insertFooter();
});
