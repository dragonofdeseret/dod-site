import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute } from '../../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_BPcJCkvG.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { collection } = Astro2.params;
  const KNOWN = ["art", "photo", "writing", "margins", "quotes", "site"];
  if (!collection || !KNOWN.includes(collection)) {
    return Astro2.redirect("/admin");
  }
  const col = collection;
  const LABELS = {
    art: "Artwork",
    photo: "Photography",
    writing: "Writing",
    margins: "Margins",
    quotes: "Quotes",
    site: "Site pages"
  };
  const raw = await getCollection(col);
  const items = [...raw].sort((a, b) => {
    const ad = Date.parse(a.data.date ?? "") || 0;
    const bd = Date.parse(b.data.date ?? "") || 0;
    return bd - ad;
  });
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": LABELS[col], "active": col }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;"> <div> <h1 class="admin-h1">${LABELS[col]}</h1> <p class="admin-subtitle">${items.length} ${items.length === 1 ? "entry" : "entries"}</p> </div> <a class="admin-button"${addAttribute(`/admin/${col}/new`, "href")}>+ New ${col === "quotes" ? "quote" : col === "margins" ? "note" : col === "writing" ? "essay" : col}</a> </div> <div class="admin-card"> ${items.length === 0 ? renderTemplate`<p class="admin-list__meta">No entries yet. Click "+ New" above to add the first one.</p>` : renderTemplate`<ul class="admin-list"> ${items.map((it) => {
    const id = it.data.id ?? it.id;
    const title = it.data.title ?? (it.data.author && it.data.source ? `${it.data.author} \u2014 ${it.data.source}` : it.data.author || it.data.source || id);
    return renderTemplate`<li class="admin-list__row"> <a${addAttribute(`/admin/${col}/${id}`, "href")}>${title}</a> <span class="admin-list__meta">${it.data.date ?? "\u2014"}</span> </li>`;
  })} </ul>`} </div> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/[collection]/index.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/[collection]/index.astro";
const $$url = "/admin/[collection]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
