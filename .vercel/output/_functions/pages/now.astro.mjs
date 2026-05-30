import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { getEntry } from '../chunks/_astro_content_C9A6bo2c.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Now = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Now;
  const entry = await getEntry("site", "now");
  const body = entry?.body ?? "";
  function parseSections(md) {
    const out = [];
    let current = null;
    const flushBuffer = (buf) => {
      if (!current) return;
      const text = buf.join("\n").trim();
      if (text) current.paragraphs.push(text);
    };
    let para = [];
    for (const rawLine of md.split("\n")) {
      const line = rawLine.replace(/\r$/, "");
      if (/^##\s+/.test(line)) {
        flushBuffer(para);
        para = [];
        current = { title: line.replace(/^##\s+/, "").trim(), items: [], paragraphs: [] };
        out.push(current);
        continue;
      }
      if (!current) continue;
      if (/^-\s+/.test(line)) {
        flushBuffer(para);
        para = [];
        current.items.push(line.replace(/^-\s+/, "").trim());
        continue;
      }
      if (line.trim() === "") {
        flushBuffer(para);
        para = [];
        continue;
      }
      para.push(line);
    }
    flushBuffer(para);
    return out;
  }
  const sections = parseSections(body);
  const KICKERS = {
    Studio: "Studio",
    Writing: "Writing",
    Reading: "Reading",
    "Always reading": "Return"
  };
  function kickerFor(title) {
    return KICKERS[title] ?? title;
  }
  function headingFor(title) {
    if (title === "Always reading") return "Always reading";
    return `Currently ${title.toLowerCase()}`;
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Now", "active": "archive" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="now-page"> <header class="page-header"> <h1>Now</h1> <p class="page-intro">${entry?.data.title === "Now" ? "" : entry?.data.title}</p> </header> <section class="now-grid"> ${sections.map((s) => renderTemplate`<article class="now-card"> <div class="now-kicker">${kickerFor(s.title)}</div> <h2>${headingFor(s.title)}</h2> ${s.items.length > 0 && renderTemplate`<ul class="now-list"> ${s.items.map((it) => renderTemplate`<li>${it}</li>`)} </ul>`} ${s.paragraphs.length > 0 && renderTemplate`<div class="now-prose"> ${s.paragraphs.map((p) => renderTemplate`<p>${p}</p>`)} </div>`} </article>`)} </section> </div> ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/now.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/now.astro";
const $$url = "/now";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Now,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
