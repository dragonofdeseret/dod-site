import { g as getServerSupabase } from '../../chunks/supabase_bTFI5HMz.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ cookies, redirect }) => {
  const supabase = getServerSupabase(cookies);
  await supabase.auth.signOut();
  return redirect("/admin/login");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
