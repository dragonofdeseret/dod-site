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
  return items.map(item => {
    if (!item.image) return item;

    const kind = item.type === "photo" ? "photo" : "art";

    return {
      ...item,
      ...mediaFromPath(item.image, kind)
    };
  });
}


/* ===================
       EXAMPLE
====================== */

/* {
  id: "example-id",
  type: "art",
  title: "Example Title",
  year: 2025,
  date: "2025-08-28",
  image: "images/art/2025/example.webp",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Ink on paper</p>
    <p>Optional note/description here.</p>
  `
}, */

/* ==================
         ART
===================== */

const archive = normalizeArchive([

  {
    id: "2026-01-01",
    type: "art",
    title: "January 01, 2026",
    year: 2026,
    date: "2026-01-01",
    image: "images/art/2026/2026-01-01.webp",
    showOnArt: false,
    showOnArchive: false,
 sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2025–2026</p>
    <p><strong>Medium:</strong> Pencil</p>
    <p>Congratulations. You found the hidden link to the concept sketch of my next 4ft x 5ft painting. Keep it between us.</p>
  `
  },
  {
    id: "2025-05-07",
    type: "art",
    title: "May 7, 2025",
    year: 2025,
    date: "2025-05-07",
    image: "images/art/2025/2025-05-07.webp"
  },
{
  id: "2024-11-18_3",
  type: "art",
  title: "November 18, 2024 | #3",
  year: 2024,
  date: "2024-11-18",
  image: "images/art/2024/2024-11-18_3.webp",
  sideNoteTitle: "The Pearl of Potentiality | Unfinished",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on 3x3 canvas</p>
    <p>Vignette Detail</p>
  `
},
{
  id: "2024-11-18_2",
  type: "art",
  title: "November 18, 2024 | #2",
  year: 2024,
  date: "2024-11-18",
  image: "images/art/2024/2024-11-18_2.webp",
  sideNoteTitle: "The Pearl of Potentiality | Unfinished",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on 3x3 canvas</p>
    <p>Vignette Detail</p>
  `
},
{
  id: "2024-11-18_1",
  type: "art",
  title: "November 18, 2024 | #1",
  year: 2024,
  date: "2024-11-18",
  image: "images/art/2024/2024-11-18_1.webp",
  sideNoteTitle: "The Pearl of Potentiality | Unfinished",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on 3x3 canvas</p>
    <p>Painting was unfinished. 1/2 has since been painted over.</p>
  `
},
  {
    id: "2024-09-08",
    type: "art",
    title: "September 8, 2024",
    year: 2024,
    date: "2024-09-08",
    image: "images/art/2024/2024-09-08.webp"
  },
  {
  id: "2025-08-28",
  type: "art",
  title: "August 28, 2025",
  year: 2025,
  date: "2025-08-28",
  image: "images/art/2025/2025-08-28.webp",
  description: "Short description",
  sideNoteTitle: "With an eye single to the glory of God",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Prisma Color on Paper</p>
    <p>This is the famous Kirtland Temple spiral staircase. Drawn to be the cover of my book, "Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds"</p>
  `
  },
  {
    id: "2024-08-22",
    type: "art",
    title: "August 22, 2024",
    year: 2024,
    date: "2024-08-22",
    image: "images/art/2024/2024-08-22_1.webp"
  },
 {
    id: "2024-08-02_10",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_10.webp",
    exhibit: "joe",
    exhibitOrder: 7,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",
   
    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer detail</p>
  `
  },
 {
    id: "2024-08-02_9",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_9.webp",
    exhibit: "joe",
    exhibitOrder: 8,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",
 
    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer detail</p>
  `
  },
 {
    id: "2024-08-02_8",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_8.webp",
    exhibit: "joe",
    exhibitOrder: 9,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",
   
    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Into–Outer Darkness</p>
  `
  },
 {
    id: "2024-08-02_7",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_7.webp",
    exhibit: "joe",
    exhibitOrder: 6,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",
   
    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer detail</p>
  `
  },
 {
    id: "2024-08-02_6",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_6.webp",
    exhibit: "joe",
    exhibitOrder: 4,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer detail</p>
  `
  },
 {
    id: "2024-08-02_5",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_5.webp",
    exhibit: "joe",
    exhibitOrder: 3,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer detail</p>
  `
  },
 {
    id: "2024-08-02_4",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_4.webp",
    exhibit: "joe",
    exhibitOrder: 5,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer detail</p>
  `
  },
  {
    id: "2024-08-02_3",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_3.webp",
    exhibit: "joe",
    exhibitOrder: 10,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic</p>
      <p>All Seeing Sierpinski</p>
  `
  },
  {
    id: "2024-08-02_2",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_2.webp",
    exhibit: "joe",
    exhibitOrder: 2,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>Glow layer for those with eyes to see</p>
  `
  },
  {
    id: "2024-08-02_1",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_1.webp",
    exhibit: "joe",
    exhibitOrder: 1,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil & Acrylic on Canvas, 4'x 4'",

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Mixed Oil & Acrylic on 4x4 Canvas</p>
      <p>229 days - 7 months & 16 days</p>
      <p>20 LSD trips, (~8,000µg)</p>
      <p>3 Mushroom trips</p>
      <p>3 DMT trips</>
      <p>Restoration of Belief</p>
  `
  },
  {
    id: "2024-06-25",
    type: "art",
    title: "June 25, 2024",
    year: 2024,
    date: "2024-06-25",
    image: "images/art/2024/2024-06-25.webp"
  },
  {
    id: "2024-01-30",
    type: "art",
    title: "January 30, 2024",
    year: 2024,
    date: "2024-01-30",
    image: "images/art/2024/2024-01-30.webp",
    exhibit: "woulds",
    exhibitOrder: 13
  },
  {
    id: "2024-01-28_2",
    type: "art",
    title: "January 28, 2024 | #2",
    year: 2024,
    date: "2024-01-28",
    image: "images/art/2024/2024-01-28_2.webp",
    exhibit: "woulds",
    exhibitOrder: 12
  },
  {
    id: "2024-01-28_1",
    type: "art",
    title: "January 28, 2024 | #1",
    year: 2024,
    date: "2024-01-28",
    image: "images/art/2024/2024-01-28_1.webp"
  },
  {
    id: "2023-12-14_2",
    type: "art",
    title: "December 14, 2023 | #2",
    year: 2023,
    date: "2023-12-14",
    image: "images/art/2023/2023-12-14_2.webp",
    exhibit: "woulds",
    exhibitOrder: 11
  },
  {
    id: "2023-12-14_1",
    type: "art",
    title: "December 14, 2023 | #1",
    year: 2023,
    date: "2023-12-14",
    image: "images/art/2023/2023-12-14_1.webp",
    exhibit: "woulds",
    exhibitOrder: 10
  },
  {
    id: "2023-12-10_3",
    type: "art",
    title: "December 10, 2023 | #3",
    year: 2023,
    date: "2023-12-10",
    image: "images/art/2023/2023-12-10_3.webp",
    exhibit: "woulds",
    exhibitOrder: 9
  },
  {
    id: "2023-12-10_2",
    type: "art",
    title: "December 10, 2023 | #2",
    year: 2023,
    date: "2023-12-10",
    image: "images/art/2023/2023-12-10_2.webp"
  },
  {
    id: "2023-12-10_1",
    type: "art",
    title: "December 10, 2023 | #1",
    year: 2023,
    date: "2023-12-10",
    image: "images/art/2023/2023-12-10_1.webp",
    exhibit: "woulds",
    exhibitOrder: 8
  },
  {
    id: "2023-12-06_2",
    type: "art",
    title: "December 6, 2023 | #2",
    year: 2023,
    date: "2023-12-06",
    image: "images/art/2023/2023-12-06_2.webp"
  },
  {
    id: "2023-12-06_1",
    type: "art",
    title: "December 6, 2023 | #1",
    year: 2023,
    date: "2023-12-06",
    image: "images/art/2023/2023-12-06_1.webp",
    exhibit: "woulds",
    exhibitOrder: 7
  },
  {
    id: "2023-11-13_2",
    type: "art",
    title: "November 13, 2023 | #2",
    year: 2023,
    date: "2023-11-13",
    image: "images/art/2023/2023-11-13_2.webp",
    exhibit: "woulds",
    exhibitOrder: 6
  },
  {
    id: "2023-11-13_1",
    type: "art",
    title: "November 13, 2023 | #1",
    year: 2023,
    date: "2023-11-13",
    image: "images/art/2023/2023-11-13_1.webp",
    exhibit: "woulds",
    exhibitOrder: 5
  },
  {
    id: "2023-10-31_1",
    type: "art",
    title: "October 31, 2023",
    year: 2023,
    date: "2023-10-31",
    image: "images/art/2023/2023-10-31_1.webp"
  },
  {
    id: "2023-10-24",
    type: "art",
    title: "October 24, 2023",
    year: 2023,
    date: "2023-10-24",
    image: "images/art/2023/2023-10-24.webp"
  },
  {
    id: "2023-10-23",
    type: "art",
    title: "October 23, 2023",
    year: 2023,
    date: "2023-10-23",
    image: "images/art/2023/2023-10-23.webp"
  },
  {
    id: "2023-09-01_2",
    type: "art",
    title: "September 1, 2023 | #2",
    year: 2023,
    date: "2023-09-01",
    image: "images/art/2023/2023-09-01_2.webp"
  },
  {
    id: "2023-09-01_1",
    type: "art",
    title: "September 1, 2023 | #1",
    year: 2023,
    date: "2023-09-01",
    image: "images/art/2023/2023-09-01_1.webp"
  },
  {
    id: "2023-08-26_detail",
    type: "art",
    title: "August 26, 2023 | Detail",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_detail.webp",
  },
  {
    id: "2023-08-26_4",
    type: "art",
    title: "August 26, 2023 | #4",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_4.webp",
    exhibit: "detour"
  },
  {
    id: "2023-08-26_3",
    type: "art",
    title: "August 26, 2023 | #3",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_3.webp",
    exhibit: "detour"
  },
  {
    id: "2023-08-26_2",
    type: "art",
    title: "August 26, 2023 | #2",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_2.webp",
    exhibit: "detour"
  },
  {
    id: "2023-08-26_1",
    type: "art",
    title: "August 26, 2023 | #1",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_1.webp",
    exhibit: "detour"
  },
  {
    id: "2023-08-13_2",
    type: "art",
    title: "August 13, 2023 | #2",
    year: 2023,
    date: "2023-08-13",
    image: "images/art/2023/2023-08-13_2.webp",
    exhibit: "woulds",
    exhibitOrder: 4
  },
  {
    id: "2023-08-13_1",
    type: "art",
    title: "August 13, 2023 | #1",
    year: 2023,
    date: "2023-08-13",
    image: "images/art/2023/2023-08-13_1.webp",
    exhibit: "woulds",
    exhibitOrder: 3
  },
  {
    id: "2023-08-06",
    type: "art",
    title: "August 6, 2023",
    year: 2023,
    date: "2023-08-06",
    image: "images/art/2023/2023-08-06.webp"
  },
  {
    id: "2023-07-30",
    type: "art",
    title: "July 30, 2023",
    year: 2023,
    date: "2023-07-30",
    image: "images/art/2023/2023-07-30.webp"
  },
  {
    id: "2023-07-16_2",
    type: "art",
    title: "July 16, 2023 | #2",
    year: 2023,
    date: "2023-07-16",
    image: "images/art/2023/2023-07-16_2.webp",
    exhibit: "woulds",
    exhibitOrder: 2
  },
  {
    id: "2023-07-16_1",
    type: "art",
    title: "July 16, 2023 | #1",
    year: 2023,
    date: "2023-07-16",
    image: "images/art/2023/2023-07-16_1.webp"
  },
  {
    id: "2023-07-10",
    type: "art",
    title: "July 10, 2023",
    year: 2023,
    date: "2023-07-10",
    image: "images/art/2023/2023-07-10.webp"
  },
  {
    id: "2023-07-05",
    type: "art",
    title: "July 5, 2023",
    year: 2023,
    date: "2023-07-05",
    image: "images/art/2023/2023-07-05.webp",
    exhibit: "woulds",
    exhibitOrder: 1
  },
  {
    id: "2023-06-27",
    type: "art",
    title: "June 27, 2023",
    year: 2023,
    date: "2023-06-27",
    image: "images/art/2023/2023-06-27.webp"
  },
  {
    id: "2023-06-24",
    type: "art",
    title: "June 24, 2023",
    year: 2023,
    date: "2023-06-24",
    image: "images/art/2023/2023-06-24.webp"
  },
  {
    id: "2023-05-28",
    type: "art",
    title: "May 27, 2023",
    year: 2023,
    date: "2023-05-28",
    image: "images/art/2023/2023-05-28.webp"
  },
  {
    id: "2023-05-21_3",
    type: "art",
    title: "May 21, 2023 | #3",
    year: 2023,
    date: "2023-05-21",
    image: "images/art/2023/2023-05-21_3.webp",
    page: "art/2023-05-21_3.html"
  },
  {
    id: "2023-05-21_2",
    type: "art",
    title: "May 21, 2023 | #2",
    year: 2023,
    date: "2023-05-21",
    image: "images/art/2023/2023-05-21_2.webp"
  },
  {
    id: "2023-05-21_1",
    type: "art",
    title: "May 21, 2023 | #1",
    year: 2023,
    date: "2023-05-21",
    image: "images/art/2023/2023-05-21_1.webp"
  },
  {
    id: "2023-05-18_2",
    type: "art",
    title: "May 18, 2023 | #2",
    year: 2023,
    date: "2023-05-18",
    image: "images/art/2023/2023-05-18_2.webp"
  },
  {
    id: "2023-05-18_1",
    type: "art",
    title: "May 18, 2023 | #1",
    year: 2023,
    date: "2023-05-18",
    image: "images/art/2023/2023-05-18_1.webp"
  },
  {
    id: "2023-05-13_3",
    type: "art",
    title: "May 13, 2023 | #3",
    year: 2023,
    date: "2023-05-13",
    image: "images/art/2023/2023-05-13_3.webp",
    exhibit: "HZ5",
    exhibitOrder: 3,
    exhibitSpan: "full"
  },
  {
    id: "2023-05-13_2",
    type: "art",
    title: "May 13, 2023 | #2",
    year: 2023,
    date: "2023-05-13",
    image: "images/art/2023/2023-05-13_2.webp",
    exhibit: "HZ5",
    exhibitOrder: 2,
    exhibitSpan: "full"
  },
  {
    id: "2023-05-13_1",
    type: "art",
    title: "May 13, 2023 | #1",
    year: 2023,
    date: "2023-05-13",
    image: "images/art/2023/2023-05-13_1.webp",
    exhibit: "HZ5",
    exhibitOrder: 1,
    exhibitSpan: "full"
  },
  {
    id: "2023-05-07_4",
    type: "art",
    title: "May 7, 2023 | #4",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_4.webp"
  },
  {
    id: "2023-05-07_3",
    type: "art",
    title: "May 7, 2023 | #3",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_3.webp"
  },
  {
    id: "2023-05-07_2",
    type: "art",
    title: "May 7, 2023 | #2",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_2.webp"
  },
  {
    id: "2023-05-07_1",
    type: "art",
    title: "May 7, 2023 | #1",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_1.webp"
  },
  {
    id: "2023-09-19",
    type: "art",
    title: "September 19, 2022",
    year: 2022,
    date: "2022-09-19",
    image: "images/art/2022/2022-09-19.webp"
  },
  {
    id: "2022-08-28_3",
    type: "art",
    title: "August 28, 2022 | #3",
    year: 2022,
    date: "2022-08-28",
    image: "images/art/2022/2022-08-28_3.webp"
  },
  {
    id: "2022-08-28_2",
    type: "art",
    title: "August 28, 2022 | #2",
    year: 2022,
    date: "2022-08-28",
    image: "images/art/2022/2022-08-28_2.webp"
  },
  {
    id: "2022-08-28_1",
    type: "art",
    title: "August 28, 2022 | #1",
    year: 2022,
    date: "2022-08-28",
    image: "images/art/2022/2022-08-28_1.webp"
  },
  {
    id: "2022-08-14_2",
    type: "art",
    title: "August 14, 2022 | #2",
    year: 2022,
    date: "2022-08-14",
    image: "images/art/2022/2022-08-14_2.webp"
  },
  {
    id: "2022-08-14_1",
    type: "art",
    title: "August 14, 2022 | #1",
    year: 2022,
    date: "2022-08-14",
    image: "images/art/2022/2022-08-14_1.webp"
  },
  {
    id: "2022-08-02",
    type: "art",
    title: "August 2, 2022",
    year: 2022,
    date: "2022-08-02",
    image: "images/art/2022/2022-08-02.webp"
  },
  {
    id: "2022-08-01_2",
    type: "art",
    title: "August 1, 2022",
    year: 2022,
    date: "2022-08-01",
    image: "images/art/2022/2022-08-01_2.webp",
    exhibit: "HZ4",
    exhibitOrder: 7,
    showOnArt: false
  },
  {
    id: "2022-08-01_1",
    type: "art",
    title: "August 1, 2022",
    year: 2022,
    date: "2022-08-01",
    image: "images/art/2022/2022-08-01_1.webp",
    exhibit: "HZ4",
    exhibitOrder: 6
  },
  {
    id: "2022-07-15_2",
    type: "art",
    title: "July 15, 2022 | 2nd Grade",
    year: 2022,
    date: "2022-07-15",
    image: "images/art/2022/2022-07-15_2.webp"
  },
  {
    id: "2022-07-15_1",
    type: "art",
    title: "July 15, 2022 | #1",
    year: 2022,
    date: "2022-07-15",
    image: "images/art/2022/2022-07-15_1.webp"
  },
  {
    id: "2022-06-25",
    type: "art",
    title: "June 6 2022",
    year: 2022,
    date: "2022-06-25",
    image: "images/art/2022/2022-06-25.webp"
  },
  {
    id: "2022-06-24",
    type: "art",
    title: "June 24, 2022",
    year: 2022,
    date: "2022-06-24",
    image: "images/art/2022/2022-06-24.webp"
  },
  {
    id: "2022-06-23",
    type: "art",
    title: "June 23, 2022",
    year: 2022,
    date: "2022-06-23",
    image: "images/art/2022/2022-06-23.webp"
  },
  {
    id: "2022-06-18_6",
    type: "art",
    title: "June 18, 2022 | #6",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_6.webp"
  },
  {
    id: "2022-06-18_5",
    type: "art",
    title: "June 18, 2022 | #5",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_5.webp",
    exhibit: "HZ4",
    exhibitOrder: 1
  },
  {
    id: "2022-06-18_4",
    type: "art",
    title: "June 18, 2022 | #4",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_4.webp",
    exhibit: "HZ4",
    exhibitOrder: 5
  },
  {
    id: "2022-06-18_3",
    type: "art",
    title: "June 18, 2022 | #3",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_3.webp",
    exhibit: "HZ4",
    exhibitOrder: 2
  },
  {
    id: "2022-06-18_2",
    type: "art",
    title: "June 18, 2022 | #2",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_2.webp",
    exhibit: "HZ4",
    exhibitOrder: 4
  },
  {
    id: "2022-06-18_1",
    type: "art",
    title: "June 18, 2022 | #1",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_1.webp",
    exhibit: "HZ4",
    exhibitOrder: 3
  },
  {
    id: "2022-06-15_2",
    type: "art",
    title: "June 15, 2022",
    year: 2022,
    date: "2022-06-15",
    image: "images/art/2022/2022-06-15_2.webp"
  },
  {
    id: "2022-06-15_1",
    type: "art",
    title: "June 15, 2022",
    year: 2022,
    date: "2022-06-15",
    image: "images/art/2022/2022-06-15_1.webp",
    showOnArt: false
  },
  {
    id: "2022-06-11_2",
    type: "art",
    title: "June 11, 2022",
    year: 2022,
    date: "2022-06-11",
    image: "images/art/2022/2022-06-11_2.webp",
    exhibit: "HZ3",
    exhibitOrder: 2,
  },
  {
    id: "2022-06-11_1",
    type: "art",
    title: "June 5, 2022 | Blot",
    year: 2022,
    date: "2022-06-11",
    image: "images/art/2022/2022-06-11_1.webp",
    exhibit: "HZ3",
    exhibitOrder: 1,
    showOnArt: false
  },
  {
    id: "2022-06-08_2",
    type: "art",
    title: "June 8, 2022 | #2",
    year: 2022,
    date: "2022-06-08",
    image: "images/art/2022/2022-06-08_2.webp",
    exhibit: "HZ3",
    exhibitOrder: 6,
  },
  {
    id: "2022-06-08_1",
    type: "art",
    title: "June 8, 2022 | Blot",
    year: 2022,
    date: "2022-06-08",
    image: "images/art/2022/2022-06-08_1.webp",
    exhibit: "HZ3",
    exhibitOrder: 5,
    showOnArt: false
  },
  {
    id: "2022-06-05_2",
    type: "art",
    title: "June 5, 2022",
    year: 2022,
    date: "2022-06-05",
    image: "images/art/2022/2022-06-05_2.webp",
    exhibit: "HZ3",
    exhibitOrder: 4,
  },
  {
    id: "2022-06-05_1",
    type: "art",
    title: "June 5, 2022 | Blot",
    year: 2022,
    date: "2022-06-05",
    image: "images/art/2022/2022-06-05_1.webp",
    exhibit: "HZ3",
    exhibitOrder: 3,
    showOnArt: false
  },
  {
    id: "2022-05-29",
    type: "art",
    title: "May 29, 2022",
    year: 2022,
    date: "2022-05-29",
    image: "images/art/2022/2022-05-29.webp"
  },
  {
    id: "2022-05-27_2",
    type: "art",
    title: "May 27, 2022",
    year: 2022,
    date: "2022-05-27",
    image: "images/art/2022/2022-05-27_2.webp",
    exhibit: "HZ2",
    exhibitOrder: 4,
  },
  {
    id: "2022-05-27_1",
    type: "art",
    title: "May 27, 2022 | Blot",
    year: 2022,
    date: "2022-05-27",
    image: "images/art/2022/2022-05-27_1.webp",
    exhibit: "HZ2",
    exhibitOrder: 3,
    showOnArt: false
  },
  {
    id: "2022-05-26_2",
    type: "art",
    title: "May 26, 2022",
    year: 2022,
    date: "2022-05-26",
    image: "images/art/2022/2022-05-26_2.webp",
    exhibit: "HZ2",
    exhibitOrder: 2,
  },
  {
    id: "2022-05-26_1",
    type: "art",
    title: "May 26, 2022 | Blot",
    year: 2022,
    date: "2022-05-26",
    image: "images/art/2022/2022-05-26_1.webp",
    exhibit: "HZ2",
    exhibitOrder: 1,
    showOnArt: false
  },
  {
    id: "2022-05-23_5",
    type: "art",
    title: "May 23, 2022 | #3",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_5.webp",
    exhibit: "HZ1",
    exhibitOrder: 4,
  },
  {
    id: "2022-05-23_4",
    type: "art",
    title: "May 23, 2022 | Blot 2",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_4.webp",
    exhibit: "HZ1",
    exhibitOrder: 3,
    showOnArt: false
  },
  {
    id: "2022-05-23_3",
    type: "art",
    title: "May 23, 2022 | #2",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_3.webp",
    exhibit: "HZ1",
    exhibitOrder: 2,
  },
  {
    id: "2022-05-23_2",
    type: "art",
    title: "May 23, 2022 | Blot 1",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_2.webp",
    exhibit: "HZ1",
    exhibitOrder: 1,
    showOnArt: false
  },
  {
    id: "2022-05-23_1",
    type: "art",
    title: "May 23, 2022 | #1",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_1.webp"
  },
  {
    id: "2022-05-15",
    type: "art",
    title: "May 15, 2022",
    year: 2022,
    date: "2022-05-15",
    image: "images/art/2022/2022-05-15.webp"
  },
  {
    id: "2022-05-14",
    type: "art",
    title: "May 14, 2022",
    year: 2022,
    date: "2022-05-14",
    image: "images/art/2022/2022-05-14.webp"
  },
  {
    id: "2022-04-19",
    type: "art",
    title: "April 19, 2022",
    year: 2022,
    date: "2022-04-19",
    image: "images/art/2022/2022-04-19.webp"
  },
  {
    id: "2022-04-04",
    type: "art",
    title: "April 4, 2022",
    year: 2022,
    date: "2022-04-04",
    image: "images/art/2022/2022-04-04.webp"
  },
  {
    id: "2022-04-03",
    type: "art",
    title: "April 3, 2022",
    year: 2022,
    date: "2022-04-03",
    image: "images/art/2022/2022-04-03.webp"
  },
  {
    id: "2022-04-01",
    type: "art",
    title: "April 1, 2022",
    year: 2022,
    date: "2022-04-01",
    image: "images/art/2022/2022-04-01.webp"
  },
  {
    id: "2022-03-25",
    type: "art",
    title: "March 25, 2022",
    year: 2022,
    date: "2022-03-25",
    image: "images/art/2022/2022-03-25.webp"
  },
  {
    id: "2022-03-23",
    type: "art",
    title: "March 23, 2022",
    year: 2022,
    date: "2022-03-23",
    image: "images/art/2022/2022-03-23.webp"
  },
  {
    id: "2022-03-15",
    type: "art",
    title: "March 15, 2022",
    year: 2022,
    date: "2022-03-15",
    image: "images/art/2022/2022-03-15.webp"
  },
  {
    id: "2022-03-08_3",
    type: "art",
    title: "March 8, 2022 | #3",
    year: 2022,
    date: "2022-03-08",
    image: "images/art/2022/2022-03-08_3.webp",
    exhibit: "mayuan",
    exhibitOrder: 3
  },
  {
    id: "2022-03-08_2",
    type: "art",
    title: "March 8, 2022 | #2",
    year: 2022,
    date: "2022-03-08",
    image: "images/art/2022/2022-03-08_2.webp",
    exhibit: "mayuan",
    exhibitOrder: 2
  },
  {
    id: "2022-03-08_1",
    type: "art",
    title: "March 8, 2022 | #1",
    year: 2022,
    date: "2022-03-08",
    image: "images/art/2022/2022-03-08_1.webp",
    exhibit: "mayuan",
    exhibitOrder: 1
  },
  {
    id: "2022-03-03_2",
    type: "art",
    title: "March 3, 2022 | #2",
    year: 2022,
    date: "2022-03-03",
    image: "images/art/2022/2022-03-03_2.webp"
  },
  {
    id: "2022-03-03_1",
    type: "art",
    title: "March 3, 2022 | #1",
    year: 2022,
    date: "2022-03-03",
    image: "images/art/2022/2022-03-03_1.webp"
  },
  {
    id: "2022-02-18",
    type: "art",
    title: "February 18, 2022",
    year: 2022,
    date: "2022-02-18",
    image: "images/art/2022/2022-02-18.webp"
  },
  {
    id: "2022-02-14",
    type: "art",
    title: "February 14, 2022",
    year: 2022,
    date: "2022-02-14",
    image: "images/art/2022/2022-02-14.webp"
  },
  {
    id: "2022-01-30",
    type: "art",
    title: "January 30, 2022",
    year: 2022,
    date: "2022-01-30",
    image: "images/art/2022/2022-01-30.webp"
  },
  {
    id: "2020-11-18",
    type: "art",
    title: "November 18, 2020",
    year: 2020,
    date: "2020-11-18",
    image: "images/art/2020/2020-11-18.webp"
  },
  {
    id: "1997-03-30",
    type: "art",
    title: "1997-03-30",
    year: 1997,
    date: "1997-03-30",
    image: "images/art/1997/1997-03-30.webp",
    sideNoteTitle: "Details",
    sideNote: `
      <p><strong>Year:</strong> 1997</p>
      <p><strong>Medium:</strong> Paper</p>
      <p>Second grade art project of recurring dream</p>
    `
  },

  /* ==================
         WRITING
  ===================== */

  {
    id: "NaturalisticBoM",
    type: "writing",
    title: "Resonating through the Veil: a Harmonic Response to the Naturalistic Explanation of the Book of Mormon",
    year: 2025,
    date: "2025-11-16",
    file: "pdf/NaturalisticBoM.pdf",
    sections: ["writing"]
  },
  {
    id: "AcidLullabies",
    type: "writing",
    title: "Acid Lullabies: LSD Interactions with Chronic Pain & Insomnia, a Hypothesis",
    year: 2025,
    date: "2025-02-16",
    file: "pdf/AcidLullabies.pdf",
    sections: ["writing"]
  },
  {
    id: "HL",
    type: "writing",
    title: "Heaven's Ledger: the Spiritual Topology of Mormonism",
    year: 2024,
    date: "2024-09-29",
    file: "pdf/HL.pdf",
    sections: ["writing"]
  },
  {
    id: "AIPR",
    type: "writing",
    title: "The Perpetual PreRealization of Artificial Intelligence",
    year: 2024,
    date: "2024-06-24",
    file: "pdf/AIPR.pdf",
    sections: ["writing"]
  },
  {
    id: "THOOGTEOOS",
    type: "writing",
    title: "The Harmony of Our Gods and the Ecology of Our Souls",
    year: 2024,
    date: "2024-05-11",
    file: "pdf/THOOGTEOOS.pdf",
    sections: ["writing"]
  },
  {
    id: "FSoC",
    type: "writing",
    title: "The Fine Solution of Consciousness",
    year: 2023,
    date: "2023-12-21",
    file: "pdf/FSoC.pdf",
    sections: ["writing"]
  },
  {
    id: "Toyn",
    type: "writing",
    title: "Recurring Toyn Dream | ~2000–2005",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/Toyn.pdf",
    sections: ["trips"],
    substance: "Dreams"
  },
  {
    id: "RDMain",
    type: "writing",
    title: "Recurring Dreams, 1996–2007",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/RDMain.pdf",
    sections: ["trips"],
    substance: "Dreams"
  },
  {
    id: "CB",
    type: "writing",
    title: "Communication Breakdown",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/CB.pdf",
    sections: ["trips"],
    substance: "Zen"
  },
  {
    id: "TrampOBE",
    type: "writing",
    title: "Trampoline OBE Derealization, 1996",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/TrampOBE.pdf",
    sections: ["trips"],
    substance: "OBE"
  },
  {
    id: "GT",
    type: "writing",
    title: "Golden Teachers",
    date: "2023-01-23",
    year: 2023,
    file: "pdf/GT.pdf",
    sections: ["trips"],
    substance: "Psilocybin"
  },
  {
    id: "DMTERRAIN",
    type: "writing",
    title: "The Dark Matter Terrain",
    date: "2022-09-23",
    year: 2022,
    file: "pdf/DMTERRAIN.pdf",
    sections: ["writing"]
  },
  {
    id: "HGA",
    type: "writing",
    title: "He's Gone APE",
    date: "2022-08-02",
    year: 2022,
    file: "pdf/HGA.pdf",
    sections: ["trips"],
    substance: "Psilocybin"
  },
  {
    id: "IAMT",
    type: "writing",
    title: "I've a Mother There",
    date: "2022-07-12",
    year: 2022,
    file: "pdf/IAMT.pdf",
    sections: ["trips"],
    substance: "DMT"
  },
  {
    id: "TGCoB",
    type: "writing",
    title: "The Great Chain of Belonging",
    date: "2022-06-24",
    year: 2022,
    file: "pdf/TGCoB.pdf",
    sections: ["trips"],
    substance: "DMT"
  },
  {
    id: "DogBuddha",
    type: "writing",
    title: "Does a Dog Have Buddha Nature?",
    date: "2022-05-26",
    year: 2022,
    file: "pdf/DogBuddha.pdf",
    sections: ["trips"],
    substance: ["LSD", "Zen"]
  },
  {
    id: "WMZ",
    type: "writing",
    title: "What is the Meaning of Zen?",
    date: "2022-05-22",
    year: 2022,
    file: "pdf/WMZ.pdf",
    sections: ["trips"],
    substance: ["LSD", "Zen"]
  },
  {
    id: "ForestofLee",
    type: "writing",
    title: "The Trembling Forest of Lee",
    subtitle: "Journey, Perspective, and the Context of Our Condition",
    year: 2021,
    date: "2021-08-31",
    file: "pdf/ForestofLee.pdf",
    sections: ["writing"]
  },
  {
    id: "Triplette",
    type: "writing",
    title: "[Trip]let[te]",
    date: "2020-11-03",
    year: 2020,
    file: "pdf/Triplette.pdf",
    sections: ["trips"],
    substance: ["Zen", "Cannabis"]
  },
  {
    id: "SiA",
    type: "writing",
    title: "Soaked in Alacrity",
    date: "2020-08-08",
    year: 2020,
    file: "pdf/SiA.pdf",
    sections: ["trips"],
    substance: ["Cannabis"]
  },
  {
    id: "AIW",
    type: "writing",
    title: "All is Well",
    date: "2019-05-11",
    year: 2019,
    file: "pdf/AIW.pdf",
    sections: ["trips"],
    substance: "LSD"
  },

/* ===================
       EXAMPLE
====================== */

/* {
  id: "example-id",
  type: "photo",
  title: "Example Title",
  year: 2025,
  date: "2025-08-28",
  image: "images/photography/2025/example.webp",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Ink on paper</p>
    <p>Optional note/description here.</p>
  `
}, */

  /* ==================
        PHOTOGRAPHY
  ===================== */
 
{
    id: "2026-03-31",
    type: "photo",
    title: "March 31, 2026",
    year: 2026,
    date: "2026-03-31",
    image: "images/photography/2026/2026-03-31.webp",
  },
{
    id: "2026-03-30",
    type: "photo",
    title: "March 30, 2026",
    year: 2026,
    date: "2026-03-30",
    image: "images/photography/2026/2026-03-30.webp",
    description: "⚪️"
  },
{
    id: "2026-03-26",
    type: "photo",
    title: "March 26, 2026",
    year: 2026,
    date: "2026-03-26",
    image: "images/photography/2026/2026-03-26.webp",
  },
 {
    id: "2026-03-15",
    type: "photo",
    title: "March 15, 2026",
    year: 2026,
    date: "2026-03-15",
    image: "images/photography/2026/2026-03-15.webp",
          sideNoteTitle: "Details",
      sideNote: `
    <p><strong>Year:</strong> Date Unknown</p>
    <p><strong>Medium:</strong> Greece</p>
   <p> Stitched on canvas with wool by my great-aunt in the mountains of Trikala, Greece. </p>
  `
  },
{
    id: "2026-02-22",
    type: "photo",
    title: "February 22, 2026",
    year: 2026,
    date: "2026-02-22",
    image: "images/photography/2026/2026-02-22.webp",
  },
{
    id: "2026-02-18",
    type: "photo",
    title: "February 18, 2026",
    year: 2026,
    date: "2026-02-18",
    image: "images/photography/2026/2026-02-18.webp",
  },
{
    id: "2026-02-16",
    type: "photo",
    title: "February 16, 2026",
    year: 2026,
    date: "2026-02-16",
    image: "images/photography/2026/2026-02-16.webp",
  },
{
    id: "2026-01-29",
    type: "photo",
    title: "January 29, 2026",
    year: 2026,
    date: "2026-01-29",
    image: "images/photography/2026/2026-01-29.webp",
  },
{
    id: "2026-01-01",
    type: "photo",
    title: "January 1, 2026",
    year: 2026,
    date: "2026-01-01",
    image: "images/photography/2026/2026-01-01.webp",
  }, 
 {
    id: "2025-12-30",
    type: "photo",
    title: "December 30, 2025",
    year: 2025,
    date: "2025-12-30",
    image: "images/photography/2025/2025-12-30.webp",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> LSD on gel</p>
    <p></p>
  `
  },
 {
    id: "2025-12-10",
    type: "photo",
    title: "December 10, 2025",
    year: 2025,
    date: "2025-12-10",
    image: "images/photography/2025/2025-12-10.webp",
  },
 {
    id: "2025-12-01",
    type: "photo",
    title: "December 1, 2025",
    year: 2025,
    date: "2025-12-01",
    image: "images/photography/2025/2025-12-01.webp",
  },
  {
    id: "2025-10-21",
    type: "photo",
    title: "October 21, 2025",
    year: 2025,
    date: "2025-10-21",
    image: "images/photography/2025/2025-10-21.webp",
    sideNoteTitle: "Jovial Company",
  sideNote: `
    <p><strong>Medium:</strong> JSH 1:28</p>
    <p>I am sometimes associated with jovial company</p>
  `
  },
  {
    id: "2025-09-07",
    type: "photo",
    title: "September 7, 2025",
    year: 2025,
    date: "2025-09-07",
    image: "images/photography/2025/2025-09-07.webp",
    description: ""
  },
{
    id: "2025-08-15",
    type: "photo",
    title: "August 15, 2025",
    year: 2025,
    date: "2025-08-15",
    image: "images/photography/2025/2025-08-15.webp",
  },
 {
    id: "2025-08-13",
    type: "photo",
    title: "August 13, 2025",
    year: 2025,
    date: "2025-08-13",
    image: "images/photography/2025/2025-08-13.webp",
  },
  {
    id: "2025-07-30_5",
    type: "photo",
    title: "July 30, 2025 | #5",
    year: 2025,
    date: "2025-07-30",
    image: "images/photography/2025/2025-07-30_5.webp",
    description: ""
  },
  {
    id: "2025-07-30_4",
    type: "photo",
    title: "July 30, 2025 | #4",
    year: 2025,
    date: "2025-07-30",
    image: "images/photography/2025/2025-07-30_4.webp",
    description: ""
  },
  {
    id: "2025-07-30_1",
    type: "photo",
    title: "July 30, 2025 | #1",
    year: 2025,
    date: "2025-07-30",
    image: "images/photography/2025/2025-07-30_1.webp",
    description: ""
  },
 {
    id: "2025-07-20",
    type: "photo",
    title: "July 20, 2025",
    year: 2025,
    date: "2025-07-20",
    image: "images/photography/2025/2025-07-20.webp",
  },
  {
    id: "2025-07-13_3",
    type: "photo",
    title: "July 13, 2025 | #3",
    year: 2025,
    date: "2025-07-13",
    image: "images/photography/2025/2025-07-13_3.webp",
    description: ""
  },
  {
    id: "2025-07-13_2",
    type: "photo",
    title: "July 13, 2025 | #2",
    year: 2025,
    date: "2025-07-13",
    image: "images/photography/2025/2025-07-13_2.webp",
    description: ""
  },
  {
    id: "2025-07-13_1",
    type: "photo",
    title: "July 13, 2025 | #1",
    year: 2025,
    date: "2025-07-13",
    image: "images/photography/2025/2025-07-13_1.webp",
    description: ""
  },
 {
    id: "2025-04-23",
    type: "photo",
    title: "April 23, 2025",
    year: 2025,
    date: "2025-04-23",
    image: "images/photography/2025/2025-04-23.webp",
  },
 {
    id: "2025-02-25",
    type: "photo",
    title: "February 25, 2025",
    year: 2025,
    date: "2025-02-25",
    image: "images/photography/2025/2025-02-25.webp",
  },
 {
    id: "2025-02-24",
    type: "photo",
    title: "February 24, 2025",
    year: 2025,
    date: "2025-02-24",
    image: "images/photography/2025/2025-02-24.webp",
  },
 {
    id: "2024-10-22",
    type: "photo",
    title: "October 22, 2024",
    year: 2024,
    date: "2024-10-22",
    image: "images/photography/2024/2024-10-22.webp",
    description: ""
  },
  {
    id: "2024-07-14",
    type: "photo",
    title: "July 14, 2024",
    year: 2024,
    date: "2024-07-14",
    image: "images/photography/2024/2024-07-14.webp",
    description: ""
  },
  {
    id: "2024-05-11_5",
    type: "photo",
    title: "May 11, 2024 | #5",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_5.webp",
    description: ""
  },
  {
    id: "2024-05-11_4",
    type: "photo",
    title: "May 11, 2024 | #4",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_4.webp",
    description: ""
  },
  {
    id: "2024-05-11_3",
    type: "photo",
    title: "May 11, 2024 | #3",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_3.webp",
    description: ""
  },
  {
    id: "2024-05-11_2",
    type: "photo",
    title: "May 11, 2024 | #2",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_2.webp",
    description: ""
  },
  {
    id: "2024-05-11_1",
    type: "photo",
    title: "May 11, 2024 | #1",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_1.webp",
    description: ""
  },
 {
    id: "2023-02-18_2",
    type: "photo",
    title: "February 18, 2024 | #2",
    year: 2024,
    date: "2024-02-18",
    image: "images/photography/2024/2024-02-18_2.webp",
  },
 {
    id: "2023-02-18_1",
    type: "photo",
    title: "February 18, 2024 | #1",
    year: 2024,
    date: "2024-02-18",
    image: "images/photography/2024/2024-02-18_1.webp",
  },
 {
    id: "2023-12-06_2",
    type: "photo",
    title: "December 6, 2023 | #2",
    year: 2023,
    date: "2023-12-06",
    image: "images/photography/2023/2023-12-06_2.webp",
    description: ""
  },
 {
    id: "2023-12-06_1",
    type: "photo",
    title: "December 6, 2023 | #1",
    year: 2023,
    date: "2023-12-06",
    image: "images/photography/2023/2023-12-06_1.webp",
    description: ""
  },
  {
    id: "2023-10-17",
    type: "photo",
    title: "October 17, 2023",
    year: 2023,
    date: "2023-10-17",
    image: "images/photography/2023/2023-10-17.webp",
          sideNoteTitle: "Details",
      sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> MDMA</p>
  `
  },
{
    id: "2023-10-11",
    type: "photo",
    title: "October 11, 2023",
    year: 2023,
    date: "2023-10-11",
    image: "images/photography/2023/2023-10-11.webp",
        sideNoteTitle: "Details",
      sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Golden Teachers</p>
  `
  },
  {
    id: "2023-10-06",
    type: "photo",
    title: "October 6, 2023",
    year: 2023,
    date: "2023-10-06",
    image: "images/photography/2023/2023-10-06.webp",
    description: ""
  },
  {
    id: "2023-09-24",
    type: "photo",
    title: "September 24, 2023",
    year: 2023,
    date: "2023-09-24",
    image: "images/photography/2023/2023-09-24.webp",
  },
  {
    id: "2023-07-29",
    type: "photo",
    title: "July 29, 2023",
    year: 2023,
    date: "2023-07-29",
    image: "images/photography/2023/2023-07-29.webp",
  },
  {
    id: "2023-06-17",
    type: "photo",
    title: "June 17, 2023",
    year: 2023,
    date: "2023-06-17",
    image: "images/photography/2023/2023-06-17.webp",
      sideNoteTitle: "Details",
      sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> N,N-DMT</p>
  `
  },
  {
    id: "2023-06-03",
    type: "photo",
    title: "June 3, 2023",
    year: 2023,
    date: "2023-06-03",
    image: "images/photography/2023/2023-06-03.webp",
      sideNoteTitle: "Details",
      sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> S-MDA</p>
  `
  },
  {
    id: "2023-04-20",
    type: "photo",
    title: "April 20, 2023",
    year: 2023,
    date: "2023-04-20",
    image: "images/photography/2023/2023-04-20.webp",
         sideNoteTitle: "Details",
      sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> LSD paper sheet</p>
  `
  },
  {
    id: "2023-01-03",
    type: "photo",
    title: "January 1, 2023",
    year: 2023,
    date: "2023-01-03",
    image: "images/photography/2023/2023-01-03.webp",
    description: ""
  },
  {
    id: "2022-12-10",
    type: "photo",
    title: "December 10, 2022",
    year: 2022,
    date: "2022-12-10",
    image: "images/photography/2022/2022-12-10.webp",
    description: ""
  },
{
    id: "2022-12-03",
    type: "photo",
    title: "December 3, 2022",
    year: 2022,
    date: "2022-12-03",
    image: "images/photography/2022/2022-12-03.webp",
    description: ""
  },
 {
    id: "2021-12-15",
    type: "photo",
    title: "December 15, 2021",
    year: 2021,
    date: "2021-12-15",
    image: "images/photography/2021/2021-12-15.webp",
    description: ""
  },
 {
    id: "2021-10-04_2",
    type: "photo",
    title: "October 4, 2021 | #2",
    year: 2021,
    date: "2021-10-04",
    image: "images/photography/2021/2021-10-04_2.webp"
  },
 {
    id: "2021-10-04_1",
    type: "photo",
    title: "October 4, 2021 | #1",
    year: 2021,
    date: "2021-10-04",
    image: "images/photography/2021/2021-10-04_1.webp"
  },
 {
    id: "2021-06-05_2",
    type: "photo",
    title: "June 5, 2021 | #2",
    year: 2021,
    date: "2021-06-05",
    image: "images/photography/2021/2021-06-05_2.webp",
    description: ""
  },
 {
    id: "2021-06-05_1",
    type: "photo",
    title: "June 5, 2021 | #1",
    year: 2021,
    date: "2021-06-05",
    image: "images/photography/2021/2021-06-05_1.webp",
    description: ""
  },
 {
    id: "2021-05-27",
    type: "photo",
    title: "May 27, 2021",
    year: 2021,
    date: "2021-05-27",
    image: "images/photography/2021/2021-05-27.webp",
    description: ""
  },
 {
    id: "2020-11-11",
    type: "photo",
    title: "November 11, 2020",
    year: 2020,
    date: "2020-11-11",
    image: "images/photography/2020/2020-11-11.webp",
    description: ""
  },
 {
    id: "2020-11-04_2",
    type: "photo",
    title: "November 3, 2020 | #2",
    year: 2020,
    date: "2020-11-04",
    image: "images/photography/2020/2020-11-04_2.webp",
    description: ""
  },
 {
    id: "2020-11-04_1",
    type: "photo",
    title: "November 4, 2020 | #1",
    year: 2020,
    date: "2020-11-04",
    image: "images/photography/2020/2020-11-04_1.webp",
    description: ""
  },
 {
    id: "2020-11-03",
    type: "photo",
    title: "November 3, 2020",
    year: 2020,
    date: "2020-11-03",
    image: "images/photography/2020/2020-11-03.webp",
    description: ""
  },
  {
    id: "2022-06-07",
    type: "photo",
    title: "June 7, 2022",
    year: 2022,
    date: "2022-06-07",
    image: "images/photography/2022/2022-06-07.webp",
    description: ""
  },
  {
    id: "2021-10-09",
    type: "photo",
    title: "October 9, 2021",
    year: 2021,
    date: "2021-10-09",
    image: "images/photography/2021/2021-10-09.webp",
    description: ""
  },
  {
    id: "2020-06-30",
    type: "photo",
    title: "June 30, 2020",
    year: 2020,
    date: "2020-06-30",
    image: "images/photography/2020/2020-06-30.webp",
    description: ""
  },
  {
    id: "2019-11-30",
    type: "photo",
    title: "November 30, 2019",
    year: 2019,
    date: "2019-11-30",
    image: "images/photography/2019/2019-11-30.webp",
    description: ""
  },
  {
    id: "2019-11-03",
    type: "photo",
    title: "November 3, 2019",
    year: 2019,
    date: "2019-11-03",
    image: "images/photography/2019/2019-11-03.webp",
    description: ""
  },
 {
    id: "2019-09-30",
    type: "photo",
    title: "September 30, 2019",
    year: 2019,
    date: "2019-09-30",
    image: "images/photography/2019/2019-09-30.webp",
    description: ""
  },
 {
    id: "2019-09-29_3",
    type: "photo",
    title: "September 29, 2019 | #3",
    year: 2019,
    date: "2019-09-29",
    image: "images/photography/2019/2019-09-29_3.webp",
    description: ""
  },
  {
    id: "2019-09-29_2",
    type: "photo",
    title: "September 29, 2019 | #2",
    year: 2019,
    date: "2019-09-29",
    image: "images/photography/2019/2019-09-29_2.webp",
    description: ""
  },
  {
    id: "2019-09-29_1",
    type: "photo",
    title: "September 29, 2019 | #1",
    year: 2019,
    date: "2019-09-29",
    image: "images/photography/2019/2019-09-29_1.webp",
    description: ""
  },
{
  id: "2019-07-18",
  type: "photo",
  title: "July 18, 2019",
  year: 2019,
  date: "2019-07-18",
  image: "images/photography/2019/2019-07-18.webp"
},
  {
    id: "2019-06-09",
    type: "photo",
    title: "June 9, 2019",
    year: 2019,
    date: "2019-06-09",
    image: "images/photography/2019/2019-06-09.webp"
  },
{
  id: "2019-03-03",
  type: "photo",
  title: "March 3, 2019",
  year: 2019,
  date: "2019-03-03",
  image: "images/photography/2019/2019-03-03.webp"
},
{
  id: "2019-02-16",
  type: "photo",
  title: "February 16, 2019",
  year: 2019,
  date: "2019-02-16",
  image: "images/photography/2019/2019-02-16.webp"
},
{
  id: "2018-11-29",
  type: "photo",
  title: "November 29, 2018",
  year: 2018,
  date: "2018-11-29",
  image: "images/photography/2018/2018-11-29.webp"
},
{
  id: "2018-08-14",
  type: "photo",
  title: "August 14, 2018",
  year: 2018,
  date: "2018-08-14",
  image: "images/photography/2018/2018-08-14.webp"
},
  {
    id: "2017-08-25",
    type: "photo",
    title: "August 25, 2017",
    year: 2017,
    date: "2017-08-25",
    image: "images/photography/2017/2017-08-25.webp"
  },
{
  id: "2016-12-20",
  type: "photo",
  title: "December 20, 2016",
  year: 2016,
  date: "2016-12-20",
  image: "images/photography/2016/2016-12-20.webp"
},
{
  id: "2016-08-07",
  type: "photo",
  title: "August 7, 2016",
  year: 2016,
  date: "2016-08-07",
  image: "images/photography/2016/2016-08-07.webp"
},
{
  id: "2015-02-13",
  type: "photo",
  title: "February 13, 2015",
  year: 2015,
  date: "2015-02-13",
  image: "images/photography/2015/2015-02-13.webp"
},
{
  id: "2014-11-27",
  type: "photo",
  title: "November 27, 2014",
  year: 2014,
  date: "2014-11-27",
  image: "images/photography/2014/2014-11-27.webp"
},
{
  id: "2014-10-25",
  type: "photo",
  title: "October 25, 2014",
  year: 2014,
  date: "2014-10-25",
  image: "images/photography/2014/2014-10-25.webp",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2014</p>
    <p><strong>Medium:</strong> Kingsbury Hall Sunset</p>
    <p>Production: ODT's Thriller</p>
  `
},
{
  id: "2014-07-23",
  type: "photo",
  title: "July 23, 2014",
  year: 2014,
  date: "2014-07-23",
  image: "images/photography/2014/2014-07-23.webp",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2013</p>
    <p><strong>Medium:</strong> Bird watching</p>
    <p>Naked, Msr. André, Armani</p>
  `
},
{
  id: "2013-09-24",
  type: "photo",
  title: "September 24, 2013",
  year: 2013,
  date: "2013-09-24",
  image: "images/photography/2013/2013-09-24.webp",
  sideNoteTitle: "",
  sideNote: `
    <p><strong>Year:</strong> 2013</p>
    <p><strong>Medium:</strong> Austad Auditorium</p>
    <p></p>
  `
}

]);

/* ===================
       EXAMPLE
====================== */

/* {
  id: "example-id",
  type: "art",
  title: "Example Title",
  year: 2025,
  date: "2025-08-28",
  image: "images/art/2025/example.webp",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Ink on paper</p>
    <p>Optional note/description here.</p>
  `
}, */

/* ==================
       EXHIBITS
===================== */

const exhibits = [
  {
    id: "joe",
    title: "I Know the Church is True",
    year: 2024,
    date: "2024-06-24",
    description: "4ft x 4ft Oil x Acrylic"
  },
  {
    id: "woulds",
    title: "Wooulds Walkabout",
    year: 2023,
    date: "2023-12-06",
    description: ""
  },
  {
    id: "detour",
    title: "Walkabout Detour",
    year: 2023,
    date: "2023-08-26",
    description: ""
  },
  {
    id: "HZ5",
    title: "Hatsuboku Zen #5",
    year: 2023,
    date: "2023-05-13",
    description: ""
  },
  {
    id: "HZ4",
    title: "Hatsuboku Zen #4",
    year: 2022,
    date: "2022-06-11",
    description: ""
  },
  {
    id: "HZ3",
    title: "Hatsuboku Zen #3",
    year: 2022,
    date: "2022-06-11",
    description: ""
  },
  {
    id: "HZ2",
    title: "Hatsuboku Zen #2",
    year: 2022,
    date: "2022-05-27",
    description: ""
  },
  {
    id: "HZ1",
    title: "Hatsuboku Zen #1",
    year: 2022,
    date: "2022-05-23",
    description: ""
  },
  {
    id: "mayuan",
    title: "Ma Yuan Recreations & Inspiration",
    year: 2022,
    date: "2022-03-08",
    description: ""
  }
];
