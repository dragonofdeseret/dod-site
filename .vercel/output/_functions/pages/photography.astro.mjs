import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
import { g as groupByYear } from '../chunks/sort-group_CkIBYZnl.mjs';
import { t as thumbSrc, c as thumbSrcset, G as GALLERY_SIZES } from '../chunks/images_C3rmUIPi.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Photography = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Photography;
  const photo = await getCollection("photo");
  const grouped = groupByYear(photo);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Photography", "active": "art", "subActive": "photo" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Photography</h1> <p class="page-intro">light through grain</p> <nav class="year-nav"> ${grouped.map((g) => renderTemplate`<a${addAttribute(`#year-${g.year}`, "href")}>${g.year}</a>`)} </nav> </header> <section class="gallery"> ${grouped.map((g) => renderTemplate`<section class="gallery-year"${addAttribute(`year-${g.year}`, "id")}> <h2>${g.year}</h2> <div class="gallery-grid"> ${g.items.map((it) => renderTemplate`<a${addAttribute(`/photography/${it.data.id}`, "href")}> <img${addAttribute(thumbSrc(it.data.image), "src")}${addAttribute(thumbSrcset(it.data.image), "srcset")}${addAttribute(GALLERY_SIZES, "sizes")} loading="lazy" decoding="async"${addAttribute(it.data.title, "alt")}> </a>`)} </div> </section>`)} </section> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/photography.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/photography.astro";
const $$url = "/photography";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Photography,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
