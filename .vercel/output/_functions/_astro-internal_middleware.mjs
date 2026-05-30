import { d as defineMiddleware, s as sequence } from './chunks/index_BNf6VcFq.mjs';
import { g as getServerSupabase } from './chunks/supabase_bTFI5HMz.mjs';
import { g as getAdminEmail } from './chunks/env_D020CG04.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_C5YDKzlu.mjs';
import 'piccolore';
import './chunks/astro/server_SUuzwIB7.mjs';
import 'clsx';

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";
const AUTH_CALLBACK_PATH = "/admin/auth-callback";
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;
  const pathname = url.pathname;
  if (!pathname.startsWith(ADMIN_PREFIX)) return next();
  if (pathname === LOGIN_PATH || pathname === AUTH_CALLBACK_PATH) {
    return next();
  }
  const supabase = getServerSupabase(cookies);
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) {
    const next2 = encodeURIComponent(pathname + url.search);
    return redirect(`${LOGIN_PATH}?next=${next2}`);
  }
  const adminEmail = getAdminEmail();
  if ((user.email ?? "").toLowerCase() !== adminEmail.toLowerCase()) {
    await supabase.auth.signOut();
    return redirect(`${LOGIN_PATH}?error=not_authorized`);
  }
  locals.user = {
    id: user.id,
    email: user.email ?? ""
  };
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
