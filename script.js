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
   ACTIVE SITE NAV
========================= */

document.querySelectorAll(".site-nav a").forEach(link => {
if (link.href === window.location.href) {
link.classList.add("active");
}
});

/* =========================
   MUSEUM IMAGE VIEWER
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

const heading = document.createElement("h2");
heading.textContent = year;

const list = document.createElement("div");
list.className = "archive-list";

years[year].forEach(item => {

const row = document.createElement("a");
row.className = "archive-row";
row.href = item.page;

let thumbnail = "";

if (item.type === "art" && item.image) {
thumbnail = `<img src="${item.image}" alt="${item.title}">`;
}

row.innerHTML = `
<span class="archive-title">${(item.title || "Untitled")}</span>
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
   PRELOAD IMAGES
========================= */

function preloadImage(src){
const img = new Image();
img.src = src;
}


/* =========================
   INFINITE SCROLL
========================= */

function enableInfiniteScroll(artItems, index){

const next = artItems[index + 1];
if (!next) return;

let triggered = false;

window.addEventListener("scroll", () => {

if (triggered) return;

if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200){

triggered = true;

const container = document.createElement("div");
container.className = "next-art";

container.innerHTML = `
<a href="../${next.page}">
<p class="next-label">Next Work</p>
<img src="../${next.image}">
<p>${next.title}</p>
</a>
`;

document.querySelector("main").appendChild(container);

}

});

}


/* =========================
   TIMELINE NAV
========================= */

function buildTimeline(artItems){

const nav = document.querySelector(".art-navigation");
if (!nav) return;

const years = [...new Set(artItems.map(a => a.year))];

const timeline = document.createElement("div");
timeline.className = "timeline";

timeline.innerHTML = years.map(year => `
<a href="../art.html#year-${year}">${year}</a>
`).join(" ");

nav.appendChild(timeline);

}


/* =========================
   AUTO-GENERATE ART PAGE
========================= */

function autoBuildArtPage(){

const container = document.querySelector(".art-auto");
if (!container) return;

const currentPage = window.location.pathname.split("/").pop();

const item = archive.find(
i => i.page.split("/").pop() === currentPage && i.type === "art"
);

if (!item) return;

container.innerHTML = `
<h1>${item.title}</h1>

<div class="art-image">
<img src="../${item.image}" alt="${item.title}">
</div>

<p class="art-date">${item.date}</p>
`;

}

/* =========================
   ART NAVIGATION
========================= */

function buildArtNavigation() {

const nav = document.querySelector(".art-navigation");
if (!nav) return;

const artItems = archive
.filter(item => item.type === "art")
.sort((a,b) => new Date(a.date) - new Date(b.date));

const currentPage = window.location.pathname.split("/").pop();

const index = artItems.findIndex(
item => item.page.split("/").pop() === currentPage
);

if (index === -1) return;

const prev = artItems[index - 1];
const next = artItems[index + 1];

/* FIXED DATE FORMAT (no timezone bug) */

function formatDate(dateString){
const [y,m,d] = dateString.split("-");
return `${y}-${m}-${d}`;
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

/* Arrow keys still work  */

document.addEventListener("keydown", e => {

if (e.key === "ArrowLeft" && prev){
window.location.href = "../" + prev.page;
}

if (e.key === "ArrowRight" && next){
window.location.href = "../" + next.page;
}

});

}

/* =========================
   YEAR NAV (TOP OF PAGE)
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
   RANDOM ARTWORK
========================= */

function randomArtwork() {
const artItems = archive.filter(item => item.type === "art");
const random = artItems[Math.floor(Math.random() * artItems.length)];
window.location.href = random.page;

}

/* =========================
   COLLECTIONS (EXHIBITIONS)
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
link.href = item.page;

link.innerHTML = `<img src="${item.image}">`;

grid.appendChild(link);

});

section.appendChild(grid);
container.appendChild(section);

});

}

/* =========================
   AUTO WRITING PAGE
========================= */

function autoBuildWritingPage(){

const container = document.querySelector(".writing-auto");
if (!container) return;

const currentPage = window.location.pathname.split("/").pop();

const item = archive.find(
i => i.page.split("/").pop() === currentPage && i.type === "writing"
);

if (!item) return;

container.innerHTML = `
<h1>${item.title}</h1>

<div class="pdf-viewer">
<iframe src="../${item.pdf}" frameborder="0"></iframe>
</div>

<p class="writing-date">${item.date}</p>
`;

}


/* =========================
   FOOTER
========================= */

function insertFooter() {

const footer = document.createElement("footer");

footer.className = "site-footer";

footer.innerHTML = `
<p>© ${new Date().getFullYear()} Christopher Shenefelt</p>
`;

document.querySelector("main")?.appendChild(footer);

}


/* =========================
   RUN
========================= */

document.addEventListener("DOMContentLoaded", () => {

buildGallery();
buildArchive();
buildArtNavigation();
buildYearNav();
autoBuildArtPage();
buildCollections();
autoBuildWritingPage();
insertFooter();

});
