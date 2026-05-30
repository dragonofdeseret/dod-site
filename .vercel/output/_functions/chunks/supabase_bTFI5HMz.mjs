import { createServerClient } from '@supabase/ssr';
import { a as SUPABASE_URL, S as SUPABASE_ANON_KEY } from './env_D020CG04.mjs';

const COOKIE_OPTIONS = {
  name: "cs-archive-auth",
  // 7-day session. Admin only — no public exposure.
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "lax",
  // Astro dev serves over plain HTTP; relax `secure` in dev so the
  // cookie still saves. Vercel deploys serve over HTTPS so it'll
  // upgrade automatically.
  secure: true,
  httpOnly: true,
  path: "/"
};
function getServerSupabase(cookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          cookies.set(name, value, options);
        }
      }
    }
  });
}

export { getServerSupabase as g };
