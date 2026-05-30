import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$AdminLayout } from '../chunks/AdminLayout_BPcJCkvG.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const [art, photo, writing, margins, quotes] = await Promise.all([
    getCollection("art"),
    getCollection("photo"),
    getCollection("writing"),
    getCollection("margins"),
    getCollection("quotes")
  ]);
  const totals = [
    { name: "Artwork", count: art.length, href: "/admin/art" },
    { name: "Photography", count: photo.length, href: "/admin/photo" },
    { name: "Writing", count: writing.length, href: "/admin/writing" },
    { name: "Margins", count: margins.length, href: "/admin/margins" },
    { name: "Quotes", count: quotes.length, href: "/admin/quotes" }
  ];
  const allDated = [...art, ...photo, ...writing, ...margins].map((it) => ({ ...it, ts: Date.parse(it.data.date ?? "") || 0 })).sort((a, b) => b.ts - a.ts).slice(0, 5);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard", "active": "dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="admin-h1">Dashboard</h1> <p class="admin-subtitle">${`Signed in as ${Astro2.locals.user?.email ?? "admin"}`}</p> <div class="admin-card"> <h2 class="admin-card__title">Collections</h2> <ul class="admin-list"> ${totals.map((t) => renderTemplate`<li class="admin-list__row"> <a${addAttribute(t.href, "href")}>${t.name}</a> <span class="admin-list__meta">${t.count} entries</span> </li>`)} </ul> </div> <div class="admin-card"> <h2 class="admin-card__title">Recent</h2> ${allDated.length === 0 ? renderTemplate`<p class="admin-list__meta">No dated entries yet.</p>` : renderTemplate`<ul class="admin-list"> ${allDated.map((it) => renderTemplate`<li class="admin-list__row"> <a${addAttribute(`/admin/${it.collection}/${it.data.id}`, "href")}> ${it.data.title} <span class="admin-list__meta">· ${it.collection}</span> </a> <span class="admin-list__meta">${it.data.date}</span> </li>`)} </ul>`} </div> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/index.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
