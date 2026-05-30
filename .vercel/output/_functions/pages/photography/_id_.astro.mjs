import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, a9 as defineScriptVars, am as renderScript, a0 as addAttribute, l as Fragment, av as unescapeHTML, ae as maybeRenderHead } from '../../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_C5n2BgKy.mjs';
import { a as sortByDateDescWithIdTiebreak } from '../../chunks/sort-group_CkIBYZnl.mjs';
import { v as viewerSrc, d as viewerSrcset, V as VIEWER_SIZES, o as originalSrc } from '../../chunks/images_C3rmUIPi.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const getStaticPaths = (async () => {
  const items = sortByDateDescWithIdTiebreak(await getCollection("photo"));
  return items.map((item, i) => {
    const prev = items[i - 1] ?? null;
    const next = items[i + 1] ?? null;
    return {
      params: { id: item.data.id },
      props: { item, prev, next }
    };
  });
});
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { item, prev, next } = Astro2.props;
  const fromParam = Astro2.url.searchParams.get("from") ?? "photography";
  const back = fromParam === "archive" ? { href: "/archive", text: "Back to Archive" } : { href: "/photography", text: "Back to Photography" };
  const prevUrl = prev ? `/photography/${prev.data.id}?from=${fromParam}` : "";
  const nextUrl = next ? `/photography/${next.data.id}?from=${fromParam}` : "";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": item.data.title, "active": "art", "subActive": "photo" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="art-page"> <h1 id="title">', '</h1> <div class="art-navigation" id="nav"> <div class="nav-left"> ', ' </div> <div class="nav-center"> <a', ">", '</a> </div> <div class="nav-right"> ', ' </div> </div> <div id="art-layout"> ', " </div> </div> ", " <script>(function(){", "\n    document.addEventListener('keydown', (e) => {\n      if (document.querySelector('.image-viewer')) return\n      if (e.key === 'ArrowLeft' && prevUrl) window.location.href = prevUrl\n      if (e.key === 'ArrowRight' && nextUrl) window.location.href = nextUrl\n    })\n  })();<\/script> "])), maybeRenderHead(), item.data.title, prev && renderTemplate`<a${addAttribute(prevUrl, "href")}>← Previous</a>`, addAttribute(back.href, "href"), back.text, next && renderTemplate`<a${addAttribute(nextUrl, "href")}>Next →</a>`, item.data.sideNote ? renderTemplate`<div class="media-row"> <div class="media-image"> <img id="art-image"${addAttribute(viewerSrc(item.data.image), "src")}${addAttribute(viewerSrcset(item.data.image), "srcset")}${addAttribute(VIEWER_SIZES, "sizes")} decoding="async"${addAttribute(item.data.title, "alt")}${addAttribute(originalSrc(item.data.image), "data-lightbox")} style="cursor: zoom-in"> </div> <aside class="media-note"> <h3>${item.data.sideNoteTitle ?? "Details"}</h3> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${unescapeHTML(item.data.sideNote)}` })} </aside> </div>` : renderTemplate`<div class="art-image"> <img id="art-image"${addAttribute(viewerSrc(item.data.image), "src")}${addAttribute(viewerSrcset(item.data.image), "srcset")}${addAttribute(VIEWER_SIZES, "sizes")} decoding="async"${addAttribute(item.data.title, "alt")}${addAttribute(originalSrc(item.data.image), "data-lightbox")} style="cursor: zoom-in"> </div>`, renderScript($$result2, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/photography/[id].astro?astro&type=script&index=0&lang.ts"), defineScriptVars({ prevUrl, nextUrl })) })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/photography/[id].astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/photography/[id].astro";
const $$url = "/photography/[id]";

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
