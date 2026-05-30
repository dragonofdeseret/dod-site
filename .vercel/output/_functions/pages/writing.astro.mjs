import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute, am as renderScript } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
import { g as groupByYear } from '../chunks/sort-group_CkIBYZnl.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Writing = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Writing;
  const writing = await getCollection("writing");
  const indexItems = writing.filter(
    (it) => !(Array.isArray(it.data.sections) && it.data.sections.includes("trips"))
  );
  const grouped = groupByYear(indexItems);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Writing", "active": "writing" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Writings</h1> <p class="page-intro">
Essays, Excerpts, and Musings |${" "} <a href="https://a.co/d/04zcw8xP" target="_blank" rel="noopener" class="buy-link">
Purchase Harmonic Theism ↗
</a> </p> <nav class="year-nav"> ${grouped.map((g) => renderTemplate`<a${addAttribute(`#year-${g.year}`, "href")}>${g.year}</a>`)} </nav> <div class="filter-block"> <div class="filter-row"> <div class="tag-filter tag-filter-writing" data-filter-name="writingTags" data-filter-target=".archive-list > .archive-row" data-filter-key="writing-tags" data-filter-mode="or"></div> </div> </div> </header> <div id="writing"> ${grouped.map((g) => renderTemplate`<div class="archive-year"${addAttribute(`year-${g.year}`, "id")}> <h2>${g.year}</h2> <div class="archive-list"> ${g.items.map((it) => renderTemplate`<a class="archive-row"${addAttribute(`/writing/${it.data.id}`, "href")}${addAttribute((it.data.tags ?? []).join(","), "data-writing-tags")}> <div class="archive-title"> ${it.data.title} ${it.data.tags && it.data.tags.length > 0 && renderTemplate`<div class="item-tags-inline"> ${it.data.tags.map((t) => renderTemplate`<span class="item-tag-inline">${t}</span>`)} </div>`} </div> <div class="archive-meta">${it.data.date || g.year}</div> </a>`)} </div> </div>`)} </div> ${renderScript($$result2, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/writing.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/writing.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/writing.astro";
const $$url = "/writing";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Writing,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
