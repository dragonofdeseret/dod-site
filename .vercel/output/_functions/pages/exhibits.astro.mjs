import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Exhibits = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Exhibits;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Exhibits", "active": "art", "subActive": "exhibits" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Exhibits</h1> <p class="page-intro">collections. seasons. moments.</p> </header> <div class="art-back"> <a href="/art">← Back to Artwork</a> </div> <div id="exhibits-archive" class="timeline"> <p style="color: var(--ink-soft); margin-top: 1em;">
Exhibits collection is being rebuilt. Browse all artwork in the meantime.
</p> </div> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/exhibits.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/exhibits.astro";
const $$url = "/exhibits";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Exhibits,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
