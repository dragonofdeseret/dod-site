function toMs(v) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}
function sortByDateDesc(items) {
  return [...items].sort((a, b) => toMs(b.data.date) - toMs(a.data.date));
}
function sortByDateDescWithIdTiebreak(items) {
  return [...items].sort((a, b) => {
    const d = toMs(b.data.date) - toMs(a.data.date);
    if (d !== 0) return d;
    const ix = (s) => {
      const m = String(s ?? "").match(/_(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    };
    return ix(a.data.id) - ix(b.data.id);
  });
}
function groupByYear(items) {
  const buckets = /* @__PURE__ */ new Map();
  for (const it of items) {
    const y = it.data.year ?? (it.data.date ? new Date(it.data.date).getUTCFullYear() : "undated");
    const key = String(y);
    const arr = buckets.get(key) ?? [];
    arr.push(it);
    buckets.set(key, arr);
  }
  return [...buckets.entries()].sort(([a], [b]) => {
    if (a === "undated") return 1;
    if (b === "undated") return -1;
    return Number(b) - Number(a);
  }).map(([year, arr]) => ({ year, items: sortByDateDescWithIdTiebreak(arr) }));
}

export { sortByDateDescWithIdTiebreak as a, groupByYear as g, sortByDateDesc as s };
