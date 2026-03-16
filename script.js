/* =========================
   BUILD ART PAGE GALLERY
========================= */

function buildGallery() {

const gallery = document.querySelector(".gallery");
if (!gallery) return;

gallery.innerHTML = "";

/* only show art entries */

const artItems = archive.filter(item => item.type === "art");

const years = {};

artItems.forEach(art => {

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

const container = document.querySelector("#archive");
if (!container) return;

container.innerHTML = "";

const years = {};

archive.forEach(item => {

if (!years[item.year]) {
years[item.year] = [];
}

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
<span class="archive-title">${item.title.replace(", " + item.year, "")}</span>
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

const nav = document.querySelector(".art-navigation");
if (!nav) return;

/* only navigate through art */

const artItems = archive.filter(item => item.type === "art");

const currentPath = window.location.pathname;
const currentPage = currentPath.split("/").pop();

const index = artItems.findIndex(art => art.page.includes(currentPage));

if (index === -1) return;

const prev = artItems[index - 1];
const next = artItems[index + 1];

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


/* =========================
   RANDOM ARTWORK BUTTON
========================= */

function randomArtwork() {

const artItems = archive.filter(item => item.type === "art");

const random = artItems[Math.floor(Math.random() * artItems.length)];

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

const main = document.querySelector("main");

if (main) {
main.appendChild(footer);
}

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
