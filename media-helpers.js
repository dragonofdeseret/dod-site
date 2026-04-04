/* ==================
   MEDIA HELPERS
===================== */

function withWebp(path) {
  return String(path).replace(/\.(jpe?g|png|JPG|JPEG|PNG)$/i, ".webp");
}

function mediaFromPath(path, kind = "art") {
  const webp = withWebp(path);
  const lastSlash = webp.lastIndexOf("/");
  const dir = webp.slice(0, lastSlash);
  const file = webp.slice(lastSlash + 1);
  const dot = file.lastIndexOf(".");
  const stem = dot === -1 ? file : file.slice(0, dot);

  return {
    image: `${dir}/${stem}-2000.webp`,
    thumb: `${dir}/${stem}-800.webp`,
    imageSrcset: `${dir}/${stem}-1200.webp 1200w, ${dir}/${stem}-2000.webp 2000w`,
    thumbSrcset: `${dir}/${stem}-480.webp 480w, ${dir}/${stem}-800.webp 800w, ${dir}/${stem}-1200.webp 1200w`,
    mediaKind: kind
  };
}

function normalizeArchive(items) {
  return items.map((item) => {
    if (!item.image) return item;

    const kind = item.type === "photo" ? "photo" : "art";

    return {
      ...item,
      ...mediaFromPath(item.image, kind)
    };
  });
}
