import { a3 as createAstro, a4 as createComponent, aj as renderHead, aq as renderTemplate } from '../../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import 'clsx';
import { g as getServerSupabase } from '../../chunks/supabase_bTFI5HMz.mjs';
import { g as getAdminEmail } from '../../chunks/env_D020CG04.mjs';
/* empty css                                   */
/* empty css                                   */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const errorParam = Astro2.url.searchParams.get("error");
  const nextParam = Astro2.url.searchParams.get("next") ?? "/admin";
  let sent = false;
  let formError = null;
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const allowedEmail = getAdminEmail().toLowerCase();
    if (!email) {
      formError = "Email required.";
    } else if (email !== allowedEmail) {
      formError = "This email is not authorized for admin access.";
    } else {
      const supabase = getServerSupabase(Astro2.cookies);
      const callback = new URL("/admin/auth-callback", Astro2.url.origin);
      callback.searchParams.set("next", nextParam);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callback.toString(),
          shouldCreateUser: false
        }
      });
      if (error) {
        formError = error.message;
      } else {
        sent = true;
      }
    }
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Sign in — Admin</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="admin-body"> <div class="admin-login-wrap"> <div class="admin-login-card"> <h1>Christopher Shenefelt</h1> <p>Sign in to manage the archive.</p> ${errorParam === "not_authorized" && renderTemplate`<div class="admin-flash admin-flash--error">
That account isn't authorized for admin access.
</div>`} ${formError && renderTemplate`<div class="admin-flash admin-flash--error">${formError}</div>`} ${sent ? renderTemplate`<div class="admin-flash admin-flash--success">
Check your email — a sign-in link is on its way. Click it to
            return here and finish signing in.
</div>` : renderTemplate`<form method="POST"> <div class="admin-field"> <label class="admin-label" for="email">Email</label> <input class="admin-input" type="email" id="email" name="email" autocomplete="email" required placeholder="you@example.com"> <span class="admin-hint">
A one-tap sign-in link will be emailed to you.
</span> </div> <button class="admin-button" type="submit">Email me a link</button> </form>`} </div> </div> </body></html>`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/login.astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
