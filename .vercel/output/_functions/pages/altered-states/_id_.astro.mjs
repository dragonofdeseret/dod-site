import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute } from '../../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_C5n2BgKy.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const getStaticPaths = (async () => {
  const writing = await getCollection("writing");
  const trips = writing.filter(
    (it) => Array.isArray(it.data.sections) && it.data.sections.includes("trips")
  );
  return trips.map((item) => ({ params: { id: item.data.id }, props: { item } }));
});
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { item } = Astro2.props;
  const fromParam = Astro2.url.searchParams.get("from") ?? "trips";
  const backHref = fromParam === "archive" ? "/archive" : "/altered-states";
  const backText = fromParam === "archive" ? "\u2190 Back to Archive" : "\u2190 Back to Altered States";
  const pdfSrc = `/${item.data.file}#zoom=page-width&view=FitH`;
  const pdfOpen = `/${item.data.file}`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": item.data.title, "active": "writing", "subActive": "altered-states" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>${item.data.title}</h1> </header> <div class="writing-actions"> <a${addAttribute(backHref, "href")}>${backText}</a> <a${addAttribute(pdfOpen, "href")} target="_blank" rel="noopener">Enter Fullscreen</a> </div> <div class="essay-pdf"> <div class="pdf-container"> <iframe${addAttribute(pdfSrc, "src")}${addAttribute(item.data.title, "title")}></iframe> </div> <div class="pdf-mobile-link"> <a${addAttribute(pdfOpen, "href")} target="_blank" rel="noopener">Open PDF</a> </div> </div> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/altered-states/[id].astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/altered-states/[id].astro";
const $$url = "/altered-states/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  getStaticPaths,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
