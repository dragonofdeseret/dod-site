import { a3 as createAstro, a4 as createComponent, aq as renderTemplate, a9 as defineScriptVars, ah as renderComponent, aj as renderHead, l as Fragment, a0 as addAttribute } from '../../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { g as getServerSupabase } from '../../chunks/supabase_bTFI5HMz.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = false;
const $$AuthCallback = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AuthCallback;
  const supabase = getServerSupabase(Astro2.cookies);
  const url = Astro2.url;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  let error = null;
  if (code) {
    const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeErr) {
      error = exchangeErr.message;
    } else {
      return Astro2.redirect(next);
    }
  }
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Signing in\u2026</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/global.css">', '</head> <body class="admin-body"> <div class="admin-login-wrap"> <div class="admin-login-card"> ', " </div> </div>  <script>(function(){", "\n      ;(async () => {\n        if (!window.location.hash) return\n        const hash = new URLSearchParams(window.location.hash.slice(1))\n        const access_token = hash.get('access_token')\n        const refresh_token = hash.get('refresh_token')\n        if (!access_token || !refresh_token) return\n        const { getBrowserSupabase } = await import('/src/lib/supabase.ts')\n        const supabase = getBrowserSupabase()\n        const { error } = await supabase.auth.setSession({\n          access_token,\n          refresh_token,\n        })\n        if (!error) window.location.replace(next)\n      })().catch((e) => console.error(e))\n    })();<\/script> </body> </html>"])), renderHead(), error ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate` <h1>Sign-in failed</h1> <div class="admin-flash admin-flash--error">${error}</div> <a class="admin-button admin-button--ghost" href="/admin/login">
Try again
</a> ` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate` <h1>Signing you in…</h1> <p class="admin-flash admin-flash--info">
If you're not redirected automatically, you can${" "} <a${addAttribute(next, "href")}>continue here</a>.
</p> ` })}`, defineScriptVars({ next }));
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/auth-callback.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/auth-callback.astro";
const $$url = "/admin/auth-callback";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AuthCallback,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
