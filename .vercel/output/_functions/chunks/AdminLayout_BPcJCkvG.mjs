import { a3 as createAstro, a4 as createComponent, aj as renderHead, a0 as addAttribute, ao as renderSlot, aq as renderTemplate } from './astro/server_SUuzwIB7.mjs';
import 'piccolore';
import 'clsx';
/* empty css                        */
/* empty css                        */

const $$Astro = createAstro("https://dragonofdeseret.com");
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title, active } = Astro2.props;
  const user = Astro2.locals.user;
  const fullTitle = `${title} \u2014 Admin`;
  function cls(key) {
    return active === key ? "admin-nav__link active" : "admin-nav__link";
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${fullTitle}</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="admin-body"> <header class="admin-topbar"> <div class="admin-topbar__title"> <a href="/admin">Archive</a> <span class="admin-topbar__sep">/</span> <span>${title}</span> </div> <div class="admin-topbar__actions"> <a href="/" target="_blank" rel="noopener">View site ↗</a> <span class="admin-topbar__user">${user?.email}</span> <form method="POST" action="/admin/sign-out"> <button type="submit" class="admin-button admin-button--ghost">
Sign out
</button> </form> </div> </header> <div class="admin-layout"> <nav class="admin-nav"> <a href="/admin"${addAttribute(cls("dashboard"), "class")}>Dashboard</a> <div class="admin-nav__heading">Collections</div> <a href="/admin/art"${addAttribute(cls("art"), "class")}>Artwork</a> <a href="/admin/photo"${addAttribute(cls("photo"), "class")}>Photography</a> <a href="/admin/writing"${addAttribute(cls("writing"), "class")}>Writing</a> <a href="/admin/margins"${addAttribute(cls("margins"), "class")}>Margins</a> <a href="/admin/quotes"${addAttribute(cls("quotes"), "class")}>Quotes</a> <div class="admin-nav__heading">Site pages</div> <a href="/admin/site/now"${addAttribute(cls("site"), "class")}>Now</a> </nav> <main class="admin-main"> ${renderSlot($$result, $$slots["default"])} </main> </div> </body></html>`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
