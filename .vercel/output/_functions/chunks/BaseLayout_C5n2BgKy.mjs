import { a3 as createAstro, a4 as createComponent, ae as maybeRenderHead, a0 as addAttribute, ah as renderComponent, l as Fragment, aq as renderTemplate, aj as renderHead, ao as renderSlot } from './astro/server_SUuzwIB7.mjs';
import 'piccolore';
/* empty css                        */

const $$Astro$1 = createAstro("https://dragonofdeseret.com");
const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Sidebar;
  const { active, subActive } = Astro2.props;
  const cls = (key) => active === key ? "active" : void 0;
  const subCls = (key) => subActive === key ? "nav-sub active" : "nav-sub";
  return renderTemplate`${maybeRenderHead()}<nav class="sidebar"> <h1>Christopher Shenefelt</h1> <a href="/"${addAttribute(cls("home"), "class")}>Home</a> <a href="/archive"${addAttribute(cls("archive"), "class")}>Archive</a> <a href="/art"${addAttribute(cls("art"), "class")}>Artwork</a> ${active === "art" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <a href="/exhibits"${addAttribute(subCls("exhibits"), "class")}>Exhibits</a> <a href="/photography"${addAttribute(subCls("photo"), "class")}>Photography</a> ` })}`} <a href="/writing"${addAttribute(cls("writing"), "class")}>Writing</a> ${active === "writing" && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <a href="/altered-states"${addAttribute(subCls("altered-states"), "class")}>Altered States</a> <a href="/margins"${addAttribute(subCls("margins"), "class")}>Margins &amp; Excerpts</a> <a href="/quotes"${addAttribute(subCls("quotes"), "class")}>Quotes from Others</a> ` })}`} <a href="/now"${addAttribute(cls("now"), "class")}>Now</a> <a href="/questions"${addAttribute(cls("questions"), "class")}>Questions</a> <a href="/bio"${addAttribute(cls("bio"), "class")}>Biography</a> <div class="sidebar-social"> <a href="https://a.co/d/04zcw8xP" target="_blank" rel="noopener" class="sidebar-external">
Harmonic Theism ↗
</a> <a href="https://daodezion.com" target="_blank" rel="noopener" class="sidebar-external external-link">
Dao De Zion ↗
</a> <a href="https://www.instagram.com/dragonofdeseret/" target="_blank" rel="noopener" class="sidebar-external external-link">
Instagram ↗
</a> </div> </nav>`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/components/Sidebar.astro", void 0);

const $$Astro = createAstro("https://dragonofdeseret.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "Essays, art, and photography by Christopher Shenefelt.",
    ogImage,
    active,
    subActive
  } = Astro2.props;
  const fullTitle = `${title} \u2014 Christopher Shenefelt`;
  const canonical = new URL(Astro2.url.pathname, Astro2.site).toString();
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${fullTitle}</title><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(canonical, "href")}><meta property="og:title"${addAttribute(fullTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="website"><meta property="og:url"${addAttribute(canonical, "content")}>${ogImage && renderTemplate`<meta property="og:image"${addAttribute(ogImage, "content")}>`}<meta name="twitter:card"${addAttribute(ogImage ? "summary_large_image" : "summary", "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body> <div class="layout"> ${renderComponent($$result, "Sidebar", $$Sidebar, { "active": active, "subActive": subActive })} <main class="content"> ${renderSlot($$result, $$slots["default"])} </main> </div> </body></html>`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
