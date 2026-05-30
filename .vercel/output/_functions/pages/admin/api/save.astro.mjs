import { c as commitFile } from '../../../chunks/github-commit_DPsv2RC9.mjs';
export { renderers } from '../../../renderers.mjs';

function yamlString(value) {
  if (value === null || value === void 0) return '""';
  const s = String(value);
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function yamlArrayInline(values) {
  if (!values || values.length === 0) return null;
  return `[${values.map(yamlString).join(", ")}]`;
}
function yamlBlockScalar(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return ["|", ...trimmed.split("\n").map((ln) => `  ${ln}`)];
}
function serializeMarkdown(input) {
  const lines = ["---"];
  for (const field of input.fields) {
    if (field.kind === "array") {
      const arr = yamlArrayInline(field.value);
      if (arr) lines.push(`${field.key}: ${arr}`);
      continue;
    }
    if (field.kind === "block") {
      const block = yamlBlockScalar(field.value ?? void 0);
      if (block) {
        lines.push(`${field.key}: ${block[0]}`);
        for (let i = 1; i < block.length; i++) lines.push(block[i]);
      }
      continue;
    }
    if (field.kind === "number") {
      if (field.value !== null && field.value !== void 0) {
        lines.push(`${field.key}: ${field.value}`);
      }
      continue;
    }
    if (field.value !== null && field.value !== void 0 && field.value !== "") {
      lines.push(`${field.key}: ${yamlString(field.value)}`);
    }
  }
  lines.push("---");
  const body = (input.body ?? "").trim();
  return body ? `${lines.join("\n")}

${body}
` : `${lines.join("\n")}
`;
}

function pathFor(p) {
  if (p.type === "quotes") return `src/content/quotes/${p.id}.md`;
  if (p.type === "site") return `src/content/site/${p.id}.md`;
  return `src/content/${p.type}/${p.year}/${p.id}.md`;
}
function build(p) {
  switch (p.type) {
    case "art":
    case "photo":
      return {
        fields: [
          { key: "id", kind: "string", value: p.id },
          { key: "type", kind: "string", value: p.type },
          { key: "title", kind: "string", value: p.title },
          { key: "date", kind: "string", value: p.date },
          { key: "year", kind: "number", value: p.year },
          { key: "image", kind: "string", value: p.image },
          { key: "sideNoteTitle", kind: "string", value: p.sideNoteTitle },
          { key: "sideNote", kind: "block", value: p.sideNote },
          { key: "tags", kind: "array", value: p.tags }
        ]
      };
    case "writing":
      return {
        fields: [
          { key: "id", kind: "string", value: p.id },
          { key: "type", kind: "string", value: p.type },
          { key: "title", kind: "string", value: p.title },
          { key: "date", kind: "string", value: p.date },
          { key: "year", kind: "number", value: p.year },
          { key: "file", kind: "string", value: p.file },
          { key: "sections", kind: "array", value: p.sections },
          { key: "tags", kind: "array", value: p.tags }
        ]
      };
    case "margins":
      return {
        fields: [
          { key: "id", kind: "string", value: p.id },
          { key: "type", kind: "string", value: p.type },
          { key: "title", kind: "string", value: p.title },
          { key: "date", kind: "string", value: p.date },
          { key: "year", kind: "number", value: p.year },
          { key: "detail", kind: "string", value: p.detail },
          { key: "marginsTags", kind: "array", value: p.marginsTags }
        ],
        body: p.body
      };
    case "quotes":
      return {
        fields: [
          { key: "id", kind: "string", value: p.id },
          { key: "type", kind: "string", value: p.type },
          { key: "author", kind: "string", value: p.author },
          { key: "source", kind: "string", value: p.source }
        ],
        body: p.body
      };
    case "site":
      return {
        fields: [
          { key: "id", kind: "string", value: p.id },
          { key: "title", kind: "string", value: p.title }
        ],
        body: p.body
      };
  }
}
async function saveEntry(p, isNew) {
  const path = pathFor(p);
  const md = serializeMarkdown(build(p));
  const message = `${isNew ? "Add" : "Update"} ${p.type}: ${"title" in p && p.title ? p.title : p.id}`;
  const { commitSha } = await commitFile({ path, content: md, message });
  return { path, commitSha };
}

const prerender = false;
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
  if (!body?.payload?.type || !body.payload.id) {
    return new Response(
      JSON.stringify({ error: "payload.type + payload.id required" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }
  try {
    const result = await saveEntry(body.payload, Boolean(body.isNew));
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin save] failed", msg);
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
