import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute, am as renderScript } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
import { g as groupByYear } from '../chunks/sort-group_CkIBYZnl.mjs';
import { t as thumbSrc, c as thumbSrcset, G as GALLERY_SIZES } from '../chunks/images_C3rmUIPi.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Art = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Art;
  const art = await getCollection("art");
  const grouped = groupByYear(art);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Artwork", "active": "art", "description": "Patterns in jade." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Artwork</h1> <div class="page-intro-row"> <p class="page-intro">patterns in jade |</p> <div class="gallery-controls"> <div id="random-container"></div> </div> </div> <nav class="year-nav"> ${grouped.map((g) => renderTemplate`<a${addAttribute(`#year-${g.year}`, "href")}>${g.year}</a>`)} </nav> <div class="filter-block"> <div class="filter-row"> <div class="tag-filter tag-filter-art-tags" data-filter-name="artTags" data-filter-target=".gallery-grid > a" data-filter-key="art-tags" data-filter-mode="or"></div> </div> </div> </header> <section class="gallery"> ${grouped.map((g) => renderTemplate`<section class="gallery-year"${addAttribute(`year-${g.year}`, "id")}> <h2>${g.year}</h2> <div class="gallery-grid"> ${g.items.map((it) => renderTemplate`<a${addAttribute(`/art/${it.data.id}`, "href")}${addAttribute((it.data.tags ?? []).join(","), "data-art-tags")}${addAttribute(String(it.data.year), "data-year")}> <img${addAttribute(thumbSrc(it.data.image), "src")}${addAttribute(thumbSrcset(it.data.image), "srcset")}${addAttribute(GALLERY_SIZES, "sizes")} loading="lazy" decoding="async"${addAttribute(it.data.title, "alt")}> </a>`)} </div> </section>`)} </section> ${renderScript($$result2, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/art.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/art.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/art.astro";
const $$url = "/art";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Art,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
