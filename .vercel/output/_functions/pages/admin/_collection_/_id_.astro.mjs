import { a3 as createAstro, a4 as createComponent, ah as renderComponent, aq as renderTemplate, ae as maybeRenderHead, a0 as addAttribute, l as Fragment, am as renderScript } from '../../../chunks/astro/server_SUuzwIB7.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_BPcJCkvG.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://dragonofdeseret.com");
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { collection, id } = Astro2.params;
  const KNOWN = ["art", "photo", "writing", "margins", "quotes", "site"];
  if (!collection || !KNOWN.includes(collection)) {
    return Astro2.redirect("/admin");
  }
  const col = collection;
  const isNew = id === "new";
  let entry = null;
  if (!isNew && id) {
    const { getCollection } = await import('../../../chunks/_astro_content_C9A6bo2c.mjs');
    const all = await getCollection(col);
    entry = all.find((e) => e.data?.id === id || e.id === id) ?? null;
    if (!entry) {
      return Astro2.redirect(`/admin/${col}`);
    }
  }
  const d = entry?.data ?? {};
  const f = {
    id: String(d.id ?? ""),
    title: String(d.title ?? ""),
    date: String(d.date ?? ""),
    year: d.year ? Number(d.year) : (/* @__PURE__ */ new Date()).getFullYear(),
    image: String(d.image ?? ""),
    file: String(d.file ?? ""),
    sideNoteTitle: String(d.sideNoteTitle ?? "Details"),
    sideNote: String(d.sideNote ?? ""),
    detail: String(d.detail ?? ""),
    author: String(d.author ?? ""),
    source: String(d.source ?? ""),
    tags: Array.isArray(d.tags) ? d.tags.join(", ") : "",
    marginsTags: Array.isArray(d.marginsTags) ? d.marginsTags.join(", ") : "",
    sections: Array.isArray(d.sections) ? d.sections : ["writing"],
    body: entry?.body ?? ""
  };
  const BUCKETS = {
    art: "art-images",
    photo: "photo-images",
    writing: "pdf-files",
    margins: void 0,
    quotes: void 0,
    site: void 0
  };
  const bucket = BUCKETS[col];
  const title = isNew ? `New ${col}` : f.title || f.id || id;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": title, "active": col }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="admin-h1">${isNew ? `New ${col}` : title}</h1> <p class="admin-subtitle"> <a${addAttribute(`/admin/${col}`, "href")}>← Back to ${col}</a> </p> <div id="save-status" class="admin-flash" style="display: none;"></div> <form id="admin-editor-form"${addAttribute(col, "data-collection")}${addAttribute(String(isNew), "data-is-new")}${addAttribute(bucket ?? "", "data-media-bucket")}>  ${col !== "quotes" && renderTemplate`<div class="admin-field"> <label class="admin-label" for="title">Title</label> <input class="admin-input" type="text" id="title" name="title"${addAttribute(f.title, "value")} required> </div>`} ${col !== "quotes" && col !== "site" && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="admin-field"> <label class="admin-label" for="date">Date</label> <input class="admin-input" type="date" id="date" name="date"${addAttribute(f.date, "value")} required> </div> <div class="admin-field"> <label class="admin-label" for="year">Year</label> <input class="admin-input" type="number" id="year" name="year"${addAttribute(String(f.year), "value")} min="1900" max="2100" required> <span class="admin-hint">Auto-fills from Date.</span> </div> ` })}`}  ${col !== "site" && renderTemplate`<div class="admin-field"> <label class="admin-label" for="id">ID (also the filename)</label> <input class="admin-input" type="text" id="id" name="id"${addAttribute(f.id, "value")} required${addAttribute(!isNew, "readonly")}> <span class="admin-hint">${isNew ? "Auto-filled from date or title. Edit if you want a custom slug." : "Renaming requires a delete + recreate; readonly when editing."}</span> </div>`} ${col === "site" && renderTemplate`<input type="hidden" name="id"${addAttribute(f.id || "now", "value")}>`}  ${(col === "art" || col === "photo") && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="admin-field"> <label class="admin-label">Image</label> ${bucket && renderTemplate`<input type="file" name="media-file" accept="image/*" class="admin-input">`} <input type="hidden" name="image"${addAttribute(f.image, "value")}> ${f.image && renderTemplate`<img id="media-preview"${addAttribute(f.image.startsWith("http") ? f.image : `/${f.image}`, "src")} alt="preview" class="admin-upload__preview" style="display: block;">`} ${!f.image && renderTemplate`<img id="media-preview" alt="preview" class="admin-upload__preview" style="display: none;">`} <span class="admin-hint">Upload an image; the URL is filled in automatically.</span> </div> <div class="admin-field"> <label class="admin-label" for="sideNoteTitle">Side note title</label> <input class="admin-input" type="text" id="sideNoteTitle" name="sideNoteTitle"${addAttribute(f.sideNoteTitle, "value")}> </div> <div class="admin-field"> <label class="admin-label" for="sideNote">Side note (HTML body)</label> <textarea class="admin-textarea" id="sideNote" name="sideNote" rows="6">${f.sideNote}</textarea> <span class="admin-hint">Free-form HTML. Renders on the right side of the entry page.</span> </div> <div class="admin-field"> <label class="admin-label" for="tags">Tags</label> <input class="admin-input" type="text" id="tags" name="tags"${addAttribute(f.tags, "value")}> <span class="admin-hint">Comma-separated.</span> </div> ` })}`} ${col === "writing" && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="admin-field"> <label class="admin-label">PDF</label> ${bucket && renderTemplate`<input type="file" name="media-file" accept="application/pdf" class="admin-input">`} <input type="hidden" name="file"${addAttribute(f.file, "value")}> ${f.file && renderTemplate`<p class="admin-hint">Current: <code>${f.file}</code></p>`} <span class="admin-hint">Upload a PDF; the URL is filled in automatically.</span> </div> <div class="admin-field"> <label class="admin-label">Sections (controls which page lists this essay)</label> <label style="display:block; margin: 4px 0;"> <input type="checkbox" name="sections" value="writing"${addAttribute(f.sections.includes("writing"), "checked")}>
Writing (main essays list)
</label> <label style="display:block; margin: 4px 0;"> <input type="checkbox" name="sections" value="trips"${addAttribute(f.sections.includes("trips"), "checked")}>
Altered States (trip reports)
</label> </div> <div class="admin-field"> <label class="admin-label" for="tags">Tags</label> <input class="admin-input" type="text" id="tags" name="tags"${addAttribute(f.tags, "value")}> <span class="admin-hint">Comma-separated.</span> </div> ` })}`} ${col === "margins" && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="admin-field"> <label class="admin-label" for="body">Excerpt text</label> <textarea class="admin-textarea" id="body" name="body" rows="8" required>${f.body}</textarea> </div> <div class="admin-field"> <label class="admin-label" for="detail">Source / attribution</label> <input class="admin-input" type="text" id="detail" name="detail"${addAttribute(f.detail, "value")}> <span class="admin-hint">e.g. "Excerpt from: Harmonic Theism, Symphony No. I."</span> </div> <div class="admin-field"> <label class="admin-label" for="marginsTags">Tags</label> <input class="admin-input" type="text" id="marginsTags" name="marginsTags"${addAttribute(f.marginsTags, "value")}> <span class="admin-hint">Comma-separated.</span> </div> ` })}`} ${col === "quotes" && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="admin-field"> <label class="admin-label" for="body">Quote text</label> <textarea class="admin-textarea" id="body" name="body" rows="6" required>${f.body}</textarea> </div> <div class="admin-field"> <label class="admin-label" for="author">Author</label> <input class="admin-input" type="text" id="author" name="author"${addAttribute(f.author, "value")}> </div> <div class="admin-field"> <label class="admin-label" for="source">Source / citation</label> <input class="admin-input" type="text" id="source" name="source"${addAttribute(f.source, "value")}> </div> ` })}`} ${col === "site" && renderTemplate`<div class="admin-field"> <label class="admin-label" for="body">Body</label> <textarea class="admin-textarea" id="body" name="body" rows="20" required>${f.body}</textarea> <span class="admin-hint">
Markdown. For the Now page, use <code>## Section</code> headings — each one
          becomes a card. List items under each section start with <code>- </code>.
          See src/content/site/now.md for the shape.
</span> </div>`} <div class="admin-actions" style="margin-top: 24px;"> <button type="submit" class="admin-button">${isNew ? "Publish" : "Save changes"}</button> <a class="admin-button admin-button--ghost"${addAttribute(`/admin/${col}`, "href")}>Cancel</a> ${!isNew && renderTemplate`<button type="button" id="admin-delete-btn" class="admin-button admin-button--danger" style="margin-left: auto;">Delete</button>`} </div> </form> ${renderScript($$result2, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/[collection]/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/[collection]/[id].astro", void 0);

const $$file = "/Users/christophershenefelt/Library/Mobile Documents/com~apple~CloudDocs/Websites/christophershenefelt-site-astro/src/pages/admin/[collection]/[id].astro";
const $$url = "/admin/[collection]/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
