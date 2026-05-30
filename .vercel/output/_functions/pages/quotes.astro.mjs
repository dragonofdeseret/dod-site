import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Quotes = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Quotes;
  const quotes = await getCollection("quotes");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Quotes", "active": "writing", "subActive": "quotes" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Quotes</h1> <p class="page-intro">from others</p> </header> <div class="art-back"> <a href="/writing">← Back to Writing</a> </div> <section id="quotes-list" class="quotes-list"> ${quotes.map((q) => {
    const text = (q.body ?? "").trim();
    const attribution = [q.data.author, q.data.source].filter(Boolean).join(", ");
    return renderTemplate`<article class="quote-entry"${addAttribute(q.data.id, "id")}> <div class="quote-text quote-text-block">${text}</div> ${attribution && renderTemplate`<div class="quote-attribution">— ${attribution}</div>`} </article>`;
  })} </section> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/quotes.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/quotes.astro";
const $$url = "/quotes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Quotes,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
