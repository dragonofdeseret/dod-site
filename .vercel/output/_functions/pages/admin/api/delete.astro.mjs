import { d as deleteFile } from '../../../chunks/github-commit_DPsv2RC9.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function pathFor(b) {
  if (b.collection === "quotes") return `src/content/quotes/${b.id}.md`;
  if (!b.year) throw new Error("year required for non-quote collections");
  return `src/content/${b.collection}/${b.year}/${b.id}.md`;
}
const POST = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body must be JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  try {
    const path = pathFor(body);
    const { commitSha } = await deleteFile({
      path,
      message: `Delete ${body.collection}: ${body.id}`
    });
    return new Response(JSON.stringify({ ok: true, path, commitSha }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin delete] failed", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
