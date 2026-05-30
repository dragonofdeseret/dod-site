import { a3 as createAstro, a4 as createComponent, a0 as addAttribute, aj as renderHead, ao as renderSlot, aq as renderTemplate, ah as renderComponent, ae as maybeRenderHead, l as Fragment } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_C9A6bo2c.mjs';
import 'clsx';
/* empty css                                */
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro("https://dragonofdeseret.com");
const $$HomeLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$HomeLayout;
  const {
    title,
    description = "Essays, art, and inquiry by Christopher Shenefelt."
  } = Astro2.props;
  const fullTitle = title === "Home" ? "Christopher Shenefelt" : `${title} \u2014 Christopher Shenefelt`;
  const canonical = new URL(Astro2.url.pathname, Astro2.site).toString();
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${fullTitle}</title><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(canonical, "href")}><meta property="og:title"${addAttribute(fullTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="website"><meta property="og:url"${addAttribute(canonical, "content")}><meta name="twitter:card" content="summary"><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="home-body"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/layouts/HomeLayout.astro", void 0);

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
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
  const writingSorted = [...writing].filter((w) => !(Array.isArray(w.data.sections) && w.data.sections.includes("trips"))).sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date));
  const featured = writingSorted[0] ?? null;
  const latestAll = [
    ...writing.map((w) => ({ collection: "writing", data: w.data })),
    ...art.map((a) => ({ collection: "art", data: a.data })),
    ...photo.map((p) => ({ collection: "photo", data: p.data })),
    ...margins.map((m) => ({ collection: "margins", data: m.data }))
  ];
  const latest = latestAll.filter((it) => it.data.date).sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date)).slice(0, 5);
  const sections = [
    {
      href: "/writing",
      eyebrow: "Essays",
      title: "Writing",
      body: "Long-form pieces on harmonic theism, Mormon metaphysics, phenomenology of altered states, and the texture of belief.",
      count: writing.length
    },
    {
      href: "/art",
      eyebrow: "Studio",
      title: "Artwork",
      body: "Artpocrypha.",
      count: art.length
    },
    {
      href: "/photography",
      eyebrow: "Lens",
      title: "Photography",
      body: "Field notes from the eye.",
      count: photo.length
    },
    {
      href: "/margins",
      eyebrow: "Notes",
      title: "Margins & Excerpts",
      body: "Marginalia from the books, the dreams, the long conversations. Short forms.",
      count: margins.length
    },
    {
      href: "/altered-states",
      eyebrow: "Reports",
      title: "Altered States",
      body: "Field notes and phenomenology from Altered States: Vision, Sleep Paralysis, Meditation, Cannabis, LSD, DMT, Psilocybin.",
      count: writing.filter((w) => Array.isArray(w.data.sections) && w.data.sections.includes("trips")).length
    },
    {
      href: "/now",
      eyebrow: "Current",
      title: "Now",
      body: "What I am painting, writing, and reading at this moment.",
      count: null
    }
  ];
  const today = /* @__PURE__ */ new Date();
  const dayIndex = today.getUTCFullYear() * 1e3 + today.getUTCMonth() * 50 + today.getUTCDate();
  const quoteOfDay = quotes.length > 0 ? quotes[dayIndex % quotes.length] : null;
  return renderTemplate`${renderComponent($$result, "HomeLayout", $$HomeLayout, { "title": "Home", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="home" data-astro-cid-j7pv25f6>  <header class="home__masthead" data-astro-cid-j7pv25f6> <h1 class="home__name" data-astro-cid-j7pv25f6>Christopher Shenefelt</h1> <p class="home__monicker" data-astro-cid-j7pv25f6>The Dragon of Deseret</p> <p class="home__tagline" data-astro-cid-j7pv25f6>Essays, art, light.</p> <div class="home__rule" data-astro-cid-j7pv25f6></div> </header>  <section class="home__voice" data-astro-cid-j7pv25f6> <p class="home__voice-text" data-astro-cid-j7pv25f6>
A working archive. I write about Mormon theology and Daoist
        metaphysics, about consciousness and the phenomenology of
        altered states. I make charcoal drawings, take photographs,
        keep margin notes. What you find here is what I'm reading,
        thinking, and trying to say clearly — in the order it arrived.
</p> </section>  ${featured && renderTemplate`<section class="home__featured" data-astro-cid-j7pv25f6> <div class="home__featured-eyebrow eyebrow" data-astro-cid-j7pv25f6>Featured · Latest essay</div> <h2 class="home__featured-title" data-astro-cid-j7pv25f6> <a${addAttribute(`/writing/${featured.data.id}`, "href")} data-astro-cid-j7pv25f6>${featured.data.title}</a> </h2> ${featured.data.tags && featured.data.tags.length > 0 && renderTemplate`<div class="home__featured-tags" data-astro-cid-j7pv25f6> ${featured.data.tags.slice(0, 5).map((t) => renderTemplate`<span class="home__tag" data-astro-cid-j7pv25f6>${t}</span>`)} </div>`} <a class="home__featured-read"${addAttribute(`/writing/${featured.data.id}`, "href")} data-astro-cid-j7pv25f6>
Read the essay →
</a> </section>`}  <section class="home__sections" data-astro-cid-j7pv25f6> <div class="home__section-header eyebrow" data-astro-cid-j7pv25f6>Sections</div> <ul class="home__section-list" data-astro-cid-j7pv25f6> ${sections.map((s) => renderTemplate`<li class="home__section-row" data-astro-cid-j7pv25f6> <a${addAttribute(s.href, "href")} class="home__section-link" data-astro-cid-j7pv25f6> <div class="home__section-eyebrow" data-astro-cid-j7pv25f6>${s.eyebrow}</div> <h3 class="home__section-title" data-astro-cid-j7pv25f6>${s.title}</h3> <p class="home__section-body" data-astro-cid-j7pv25f6>${s.body}</p> ${s.count !== null && renderTemplate`<span class="home__section-count" data-astro-cid-j7pv25f6> ${s.count} ${s.count === 1 ? "entry" : "entries"} </span>`} </a> </li>`)} </ul> </section>  <section class="home__latest" data-astro-cid-j7pv25f6> <div class="home__section-header eyebrow" data-astro-cid-j7pv25f6>Recently added</div> <ul class="home__latest-list" data-astro-cid-j7pv25f6> ${latest.map((it) => {
    const url = it.collection === "writing" ? `/writing/${it.data.id}` : it.collection === "art" ? `/art/${it.data.id}` : it.collection === "photo" ? `/photography/${it.data.id}` : `/margins#${it.data.id}`;
    return renderTemplate`<li class="home__latest-row" data-astro-cid-j7pv25f6> <span class="home__latest-kind" data-astro-cid-j7pv25f6>${it.collection}</span> <a class="home__latest-title"${addAttribute(url, "href")} data-astro-cid-j7pv25f6> ${it.data.title} </a> <span class="home__latest-date mono" data-astro-cid-j7pv25f6>${it.data.date}</span> </li>`;
  })} </ul> </section>  ${quoteOfDay && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-j7pv25f6": true }, { "default": async ($$result3) => renderTemplate` <hr class="asterism" data-astro-cid-j7pv25f6> <section class="home__quote" data-astro-cid-j7pv25f6> <blockquote class="home__quote-text" data-astro-cid-j7pv25f6> ${(quoteOfDay.body ?? "").trim()} <cite data-astro-cid-j7pv25f6> ${quoteOfDay.data.author} ${quoteOfDay.data.source && renderTemplate`<span class="home__quote-source" data-astro-cid-j7pv25f6> · ${quoteOfDay.data.source}</span>`} </cite> </blockquote> </section> ` })}`}  <footer class="home__colophon" data-astro-cid-j7pv25f6> <div class="home__colophon-rule" data-astro-cid-j7pv25f6></div> <div class="home__colophon-grid" data-astro-cid-j7pv25f6> <div data-astro-cid-j7pv25f6> <div class="eyebrow" data-astro-cid-j7pv25f6>About</div> <p data-astro-cid-j7pv25f6> <a href="/bio" data-astro-cid-j7pv25f6>Biography</a> · <a href="/questions" data-astro-cid-j7pv25f6>Questions</a> </p> </div> <div data-astro-cid-j7pv25f6> <div class="eyebrow" data-astro-cid-j7pv25f6>Works</div> <p data-astro-cid-j7pv25f6> <a href="https://a.co/d/04zcw8xP" target="_blank" rel="noopener" data-astro-cid-j7pv25f6>
Harmonic Theism ↗
</a>${" "}
·${" "} <a href="https://daodezion.com" target="_blank" rel="noopener" data-astro-cid-j7pv25f6>
Dao De Zion ↗
</a>${" "}
·${" "} <a href="https://valencejournal.com" target="_blank" rel="noopener" data-astro-cid-j7pv25f6>
Valence Journal ↗
</a>${" "}
·${" "} <a href="https://contextualology.com" target="_blank" rel="noopener" data-astro-cid-j7pv25f6>
Contextualology ↗
</a> </p> </div> <div data-astro-cid-j7pv25f6> <div class="eyebrow" data-astro-cid-j7pv25f6>Elsewhere</div> <p data-astro-cid-j7pv25f6> <a href="https://www.instagram.com/dragonofdeseret/" target="_blank" rel="noopener" data-astro-cid-j7pv25f6>
Instagram ↗
</a> </p> </div> </div> <p class="home__colophon-mark mono" data-astro-cid-j7pv25f6>
© ${(/* @__PURE__ */ new Date()).getFullYear()} Christopher Shenefelt · the Dragon of Deseret
        · artwork and writing © their respective years
</p> </footer> </div> ` })} `;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/index.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
