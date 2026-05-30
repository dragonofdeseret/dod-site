import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, am as renderScript } from '../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C5n2BgKy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = true;
const $$Questions = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Questions;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Questions", "active": "questions" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="page-header"> <h1>Questions</h1> <p class="page-intro"></p> </header> <section class="questions-intro"> <form id="question-form" class="question-form"> <textarea id="question-input" name="question" placeholder="ask a question..." required></textarea>  <input type="text" id="website-field" name="website" class="hidden-honeypot" tabindex="-1" autocomplete="off"> <button type="submit">submit</button> </form> <p id="question-status" class="questions-note">
questions appear here upon system approval. this can take some time.
</p> </section> <section id="questions-list" class="questions-list"></section> ${renderScript($$result2, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/questions.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/questions.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/questions.astro";
const $$url = "/questions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Questions,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
