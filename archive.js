/* ==================
   MERGED ARCHIVE
===================== */

window.archive = normalizeArchive([
  ...(window.artItems || []),
  ...(window.writingItems || []),
  ...(window.marginItems || []),
  ...(window.quoteItems || []),
  ...(window.photoItems || [])
]);
