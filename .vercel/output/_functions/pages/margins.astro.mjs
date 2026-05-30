import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute, av as unescapeHTML, am as renderScript } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection, render as renderEntry } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
import { g as groupByYear, s as sortByDateDesc } from '../chunks/sort-group_CkIBYZnl.mjs';
export { renderers } from '../renderers.mjs';

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
function formatLongDate(dateString) {
  if (!dateString) return "";
  const parts = String(dateString).split("-");
  if (parts.length !== 3) return String(dateString);
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 1 || month > 12) {
    return String(dateString);
  }
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Margins = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Margins;
  const margins = await getCollection("margins");
  const grouped = groupByYear(sortByDateDesc(margins));
  const rendered = /* @__PURE__ */ new Map();
  for (const m of margins) {
    const { Content } = await renderEntry(m);
    const raw = m.body ?? "";
    const html = raw.trim().split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, "<br />").trim()}</p>`).join("\n");
    rendered.set(m.id, html);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Margins", "active": "writing", "subActive": "margins" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Margins</h1> <p class="page-intro">
margin notes, and excerpts from archived works and online conversations.
</p> </header> <nav class="year-nav"> ${grouped.map((g) => renderTemplate`<a${addAttribute(`#year-${g.year}`, "href")}>${g.year}</a>`)} </nav> <div class="filter-block"> <div class="filter-row"> <div class="tag-filter tag-filter-margins" data-filter-name="marginsTags" data-filter-target=".margins-list .quote-entry" data-filter-key="margins-tags" data-filter-mode="or"></div> </div> </div> <div class="art-back"> <a href="/writing">← Back to Writing</a> </div> <section id="margins-list" class="margins-list"> ${grouped.map((g) => renderTemplate`<section class="margins-year"${addAttribute(`year-${g.year}`, "id")}> <h2>${g.year}</h2> ${g.items.map((m) => renderTemplate`<article class="quote-entry"${addAttribute(m.data.id, "id")}${addAttribute((m.data.marginsTags ?? []).join(","), "data-margins-tags")}> <div class="quote-meta">${formatLongDate(m.data.date)}</div> <div class="quote-text quote-text-block">${unescapeHTML(rendered.get(m.id) ?? "")}</div> ${m.data.detail && renderTemplate`<div class="quote-detail">${m.data.detail}</div>`} ${m.data.marginsTags && m.data.marginsTags.length > 0 && renderTemplate`<div class="item-tags-inline"> ${m.data.marginsTags.map((t) => renderTemplate`<span class="item-tag-inline">${t}</span>`)} </div>`} </article>`)} </section>`)} </section> ${renderScript($$result2, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/margins.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/margins.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/margins.astro";
const $$url = "/margins";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Margins,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
