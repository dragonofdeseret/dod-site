import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
import { g as groupByYear } from '../chunks/sort-group_CkIBYZnl.mjs';
import { a as archiveThumbSrc, b as archiveThumbSrcset, A as ARCHIVE_THUMB_SIZES } from '../chunks/images_C3rmUIPi.mjs';
export { renderers } from '../renderers.mjs';

function itemUrl(item, from = "archive") {
  const { type, id, sections } = item.data;
  const q = from ? `?from=${from}` : "";
  switch (type) {
    case "art":
      return `/art/${id}${q}`;
    case "photo":
      return `/photography/${id}${q}`;
    case "writing": {
      const isTrip = Array.isArray(sections) && sections.includes("trips");
      return isTrip ? `/altered-states/${id}${q}` : `/writing/${id}${q}`;
    }
    case "margins":
      return `/margins#${id}`;
    case "quotes":
      return `/quotes#${id}`;
    default:
      return "#";
  }
}

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Archive = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Archive;
  const [art, photo, writing, margins] = await Promise.all([
    getCollection("art"),
    getCollection("photo"),
    getCollection("writing"),
    getCollection("margins")
  ]);
  const dated = [...art, ...photo, ...writing, ...margins];
  const grouped = groupByYear(dated);
  function badgeLabelFor(type) {
    if (type === "writing") return "PDF";
    if (type === "margins") return "Margins";
    if (type === "quotes") return "Quotes";
    return null;
  }
  function badgeIsWide(type) {
    return type === "writing" || type === "margins" || type === "quotes";
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Archive", "active": "archive", "description": "Bleached silks, carved blocks." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Archive</h1> <p class="page-intro">bleached silks, carved blocks</p> </header> <nav class="year-nav"> ${grouped.map((g) => renderTemplate`<a${addAttribute(`#year-${g.year}`, "href")}>${g.year}</a>`)} </nav> <div id="archive"> ${grouped.map((g) => renderTemplate`<div class="archive-year"${addAttribute(`year-${g.year}`, "id")}> <h2>${g.year}</h2> <div class="archive-list"> ${g.items.map((it) => {
    const url = itemUrl(it, "archive");
    const hasImage = (it.data.type === "art" || it.data.type === "photo") && "image" in it.data && !!it.data.image;
    const badge = badgeLabelFor(it.data.type);
    return renderTemplate`<div class="archive-row"> <div class="archive-title"> <a${addAttribute(url, "href")}>${it.data.title || it.data.date}</a> </div> <div class="archive-meta-wrap"> <div class="archive-meta">${it.data.date || g.year}</div> ${hasImage ? renderTemplate`<a${addAttribute(url, "href")}> <img class="archive-thumb"${addAttribute(archiveThumbSrc(it.data.image), "src")}${addAttribute(archiveThumbSrcset(
      it.data.image
    ), "srcset")}${addAttribute(ARCHIVE_THUMB_SIZES, "sizes")} loading="lazy" decoding="async"${addAttribute(it.data.title, "alt")}> </a>` : badge && renderTemplate`<a${addAttribute(url, "href")}> <div${addAttribute([
      "archive-badge",
      badgeIsWide(it.data.type) && "archive-badge--wide"
    ], "class:list")}> ${badge} </div> </a>`} </div> </div>`;
  })} </div> </div>`)} </div> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/archive.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/archive.astro";
const $$url = "/archive";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Archive,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
