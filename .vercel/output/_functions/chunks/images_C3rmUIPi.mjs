function splitPath(path) {
  const lastSlash = path.lastIndexOf("/");
  const dir = lastSlash === -1 ? "" : path.slice(0, lastSlash);
  const file = lastSlash === -1 ? path : path.slice(lastSlash + 1);
  const dot = file.lastIndexOf(".");
  const stem = dot === -1 ? file : file.slice(0, dot);
  return { dir, stem };
}
function viewerSrc(sourcePath) {
  const { dir, stem } = splitPath(sourcePath);
  return `/${dir}/${stem}-1600.webp`;
}
function viewerSrcset(sourcePath) {
  const { dir, stem } = splitPath(sourcePath);
  return [
    `/${dir}/${stem}-900.webp 900w`,
    `/${dir}/${stem}-1200.webp 1200w`,
    `/${dir}/${stem}-1600.webp 1600w`,
    `/${dir}/${stem}-2000.webp 2000w`
  ].join(", ");
}
function thumbSrc(sourcePath) {
  const { dir, stem } = splitPath(sourcePath);
  return `/${dir}/${stem}-800.webp`;
}
function thumbSrcset(sourcePath) {
  const { dir, stem } = splitPath(sourcePath);
  return [`/${dir}/${stem}-480.webp 480w`, `/${dir}/${stem}-800.webp 800w`].join(", ");
}
function archiveThumbSrc(sourcePath) {
  const { dir, stem } = splitPath(sourcePath);
  return `/${dir}/${stem}-120.webp`;
}
function archiveThumbSrcset(sourcePath) {
  const { dir, stem } = splitPath(sourcePath);
  return [`/${dir}/${stem}-120.webp 1x`, `/${dir}/${stem}-240.webp 2x`].join(", ");
}
const GALLERY_SIZES = "(max-width: 900px) calc(100vw - 44px), 260px";
const VIEWER_SIZES = "(max-width: 700px) calc(100vw - 44px), (max-width: 1200px) calc(100vw - 120px), 900px";
const ARCHIVE_THUMB_SIZES = "60px";
function originalSrc(sourcePath) {
  return `/${sourcePath}`;
}

export { ARCHIVE_THUMB_SIZES as A, GALLERY_SIZES as G, VIEWER_SIZES as V, archiveThumbSrc as a, archiveThumbSrcset as b, thumbSrcset as c, viewerSrcset as d, originalSrc as o, thumbSrc as t, viewerSrc as v };
