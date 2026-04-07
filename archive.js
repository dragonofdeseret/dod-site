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
    <p><strong>Medium:</strong> Pencil on Newspaper</p>
    <p>Congratulations. You found the hidden link to the concept sketch of my next 4ft x 5ft painting. Keep it between us.</p>
  `
  },
{
  id: "2025-08-28",
  type: "art",
  title: "August 28, 2025",
  year: 2025,
  date: "2025-08-28",
  image: "images/art/2025/2025-08-28.webp",
  medium: "Prisma Color",

  tags: ["mormonism", "harmonic-theism", "dragon"],

  sideNoteTitle: "With an eye single to the glory of God",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Prisma Color on Paper</p>
    <p>This is the famous Kirtland Temple spiral staircase. Drawn to be the cover of my book, "Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds"</p>
  `
  },
  {
    id: "2025-05-07",
    type: "art",
    title: "May 7, 2025",
    year: 2025,
    date: "2025-05-07",
    image: "images/art/2025/2025-05-07.webp",
    medium: "Charcoal",

    tags: ["zazen"],

  sideNoteTitle: "Zazen",
  sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Charcoal on Parchment Paper</p>
    <p>A personal favorite.</p>
  `
  },
{
  id: "2024-11-18_3",
  type: "art",
  title: "November 18, 2024 | #3",
  year: 2024,
  date: "2024-11-18",
  image: "images/art/2024/2024-11-18_3.webp",
  medium: "Oil Paint",

    tags: ["dragon", "psychedelics", "DMT"],

  sideNoteTitle: "The Pearl of Potentiality | Unfinished",
  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Unfinished delusions Scorpio Waterfall</p>
  `
},
{
  id: "2024-11-18_2",
  type: "art",
  title: "November 18, 2024 | #2",
  year: 2024,
  date: "2024-11-18",
  image: "images/art/2024/2024-11-18_2.webp",
  medium: "Oil Paint",

    tags: ["dragon", "psychedelics", "DMT"],

  sideNoteTitle: "The Pearl of Potentiality | Unfinished",
   sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Unfinished delusions Full Moon Vignette</p>
  `
},
{
  id: "2024-11-18_1",
  type: "art",
  title: "November 18, 2024 | #1",
  year: 2024,
  date: "2024-11-18",
  image: "images/art/2024/2024-11-18_1.webp",
  medium: "Oil Paint",

    tags: ["dragon", "psychedelics", "DMT"],

  sideNoteTitle: "The Pearl of Potentiality | Unfinished",
   sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Unfinished delusions</p>
  `
},
  {
    id: "2024-09-08",
    type: "art",
    title: "September 8, 2024",
    year: 2024,
    date: "2024-09-08",
    image: "images/art/2024/2024-09-08.webp",
    medium: "Charcoal",

    tags: ["landscape", "mushrooms", "zazen"],

  sideNoteTitle: "Mushroom Mountain",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
 {
    id: "2024-08-22_2",
    type: "art",
    title: "August 22, 2024 | #2",
    year: 2024,
    date: "2024-08-22",
    image: "images/art/2024/2024-08-22_2.webp",
    medium: "Charcoal",

    tags: ["landscape", "psychedelics", "LSD"],

  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2024-08-22_1",
    type: "art",
    title: "August 22, 2024 | #1",
    year: 2024,
    date: "2024-08-22",
    image: "images/art/2024/2024-08-22_1.webp",
    medium: "Charcoal",

    tags: [""],

  sideNoteTitle: "Details",
  sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Charcoal on Parchment Paper</p>
    <p></p>
  `
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
    exhibitCaptionMeta: "Musou Black and Glow in the Dark Acrylic on Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

    sideNoteTitle: "The Seed and Light of Latter-day Life",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Musou Black and Glow in the Dark Acrylic on Canvas</p>
    <p>Top center, is the seed and light of Latter-day Life</p>
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
    exhibitCaptionMeta: "Musou Black and Glow in the Dark Acrylic on Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

    sideNoteTitle: "Joseph's Silhouette",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Musou Black and Glow in the Dark Acrylic on Canvas</p>
    <p>But it's you, and you, and you.</p>
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
    exhibitCaptionMeta: "Glow in the Dark Acrylic and Musou Black on Canvas",
    medium: ["Oil Paint", "Glow Paint"],

     tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

    sideNoteTitle: "To Outer Darkness",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Glow in the Dark Acrylic and Musou Black on Canvas</p>
    <p>Where there is weeping, and wailing, and gnashing of teeth.</p>
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
    exhibitCaptionMeta: "Glow in the Dark Acrylic on Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

     sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Glow in the Dark Acrylic on Canvas</p>
    <p>Sierpinski's Glowing Eyes</p>
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
    exhibitCaptionMeta: "Glow in the Dark Acrylic on Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Glow in the Dark Acrylic on Canvas</p>
    <p>The Seal of Solomon.</p>
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
    exhibitCaptionMeta: "Glow in the Dark Acrylic on Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

     sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Glow in the Dark Acrylic on Canvas</p>
    <p>Those with eyes to see</p>
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
    exhibitCaptionTitle: "",
    exhibitCaptionMeta: "Glow layer detail",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

      sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Glow in the Dark Acrylic on Canvas</p>
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
    exhibitCaptionMeta: "Oil on 4' x 4' Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

      sideNoteTitle: "Sierpinski's Eye's",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on 4' x 4' Canvas</p>
    <p></p>
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
    exhibitCaptionMeta: "Glow in the Dark Acrylic on 4' x 4' Canvas",
    medium: ["Oil Paint", "Glow Paint"],

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on 4' x 4' Canvas</p>
    <p>Optional note/description here.</p>
  `
  },
  {
    id: "2024-08-02_1",
    type: "art",
    title: "August 2, 2024",
    year: 2024,
    date: "2024-08-02",
    image: "images/art/2024/2024-08-02_1.webp",
    medium: ["Oil Paint", "Glow Paint"],
    exhibit: "joe",
    exhibitOrder: 1,
    exhibitCaptionTitle: "I Know the Church is True",
    exhibitCaptionMeta: "Oil on 4' x 4' Canvas",

    tags: ["mormonism", "psychedelics", "LSD", "DMT", "psilocybin"],

    sideNoteTitle: "I Know the Church is True",
    sideNote: `
      <p><strong>Year:</strong> 2024</p>
      <p><strong>Medium:</strong> Oil on 4' x 4' Canvas</p>
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
    image: "images/art/2024/2024-06-25.webp",
    medium: "Charcoal",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Oil on 4' x 4' Canvas</p>
    <p></p>
  `
  },
  {
    id: "2024-01-30",
    type: "art",
    title: "January 30, 2024",
    year: 2024,
    date: "2024-01-30",
    image: "images/art/2024/2024-01-30.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 13,

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "It's Time to Leave the Woulds",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Ink on paper</p>
    <p>Stop dreaming. Stop prancing about the woods.</p>
  `
  },
  {
    id: "2024-01-28_2",
    type: "art",
    title: "January 28, 2024 | #2",
    year: 2024,
    date: "2024-01-28",
    image: "images/art/2024/2024-01-28_2.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 12,

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>Headed home</p>
  `
  },
  {
    id: "2024-01-28_1",
    type: "art",
    title: "January 28, 2024 | #1",
    year: 2024,
    date: "2024-01-28",
    image: "images/art/2024/2024-01-28_1.webp",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2024</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-12-14_2",
    type: "art",
    title: "December 14, 2023 | #2",
    year: 2023,
    date: "2023-12-14",
    image: "images/art/2023/2023-12-14_2.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 11,

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Give Me Two Years More",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>I Spy</p>
  `
  },
  {
    id: "2023-12-14_1",
    type: "art",
    title: "December 14, 2023 | #1",
    year: 2023,
    date: "2023-12-14",
    image: "images/art/2023/2023-12-14_1.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 10,

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Geminid Meteor Meditation",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>400µg during the Geminid Meteor Shower</p>
  `
  },
  {
    id: "2023-12-10_3",
    type: "art",
    title: "December 10, 2023 | #3",
    year: 2023,
    date: "2023-12-10",
    image: "images/art/2023/2023-12-10_3.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 9,

  tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Back to Or",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>I can see clearly now</p>
  `
  },
  {
    id: "2023-12-10_2",
    type: "art",
    title: "December 10, 2023 | #2",
    year: 2023,
    date: "2023-12-10",
    image: "images/art/2023/2023-12-10_2.webp",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-12-10_1",
    type: "art",
    title: "December 10, 2023 | #1",
    year: 2023,
    date: "2023-12-10",
    image: "images/art/2023/2023-12-10_1.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 8,

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Inheritance",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>"You are taught by the fathers you turn to the most." Something the trees once told my friend Andrew.</p>
  `
  },
  {
    id: "2023-12-06_2",
    type: "art",
    title: "December 6, 2023 | #2",
    year: 2023,
    date: "2023-12-06",
    image: "images/art/2023/2023-12-06_2.webp",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>Unravelling at around 7 hours into 900µg</p>
  `
  },
  {
    id: "2023-12-06_1",
    type: "art",
    title: "December 6, 2023 | #1",
    year: 2023,
    date: "2023-12-06",
    image: "images/art/2023/2023-12-06_1.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 7,

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>900µg portal</p>
  `
  },
  {
    id: "2023-11-13_2",
    type: "art",
    title: "November 13, 2023 | #2",
    year: 2023,
    date: "2023-11-13",
    image: "images/art/2023/2023-11-13_2.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 6,

  tags: ["landscape", "LSD", "zazen", "psychedelics", "visionary"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-11-13_1",
    type: "art",
    title: "November 13, 2023 | #1",
    year: 2023,
    date: "2023-11-13",
    image: "images/art/2023/2023-11-13_1.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 5,

  tags: ["LSD", "psychedelics", "zazen", "visionary"],

    sideNoteTitle: "The Winds of Change",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-10-31_1",
    type: "art",
    title: "October 31, 2023",
    year: 2023,
    date: "2023-10-31",
    image: "images/art/2023/2023-10-31_1.webp",
    medium: "Oil Paint",

    tags: ["mushrooms", "psilocybin", "psychedelics"],

    sideNoteTitle: "The Golden Teacher",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>I saw a grand Golden Teacher blossom out of the ether, and towering over me, it began to spill-out all matter of geometric pattern.</p>
  `
  },
  {
    id: "2023-10-24",
    type: "art",
    title: "October 24, 2023",
    year: 2023,
    date: "2023-10-24",
    image: "images/art/2023/2023-10-24.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p></p>
  `
  },
  {
    id: "2023-10-23",
    type: "art",
    title: "October 23, 2023",
    year: 2023,
    date: "2023-10-23",
    image: "images/art/2023/2023-10-23.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Blood Moon Harvest",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Oil on Canvas/p>
    <p>Charcoal break for some color</p>
  `
  },
  {
    id: "2023-09-01_2",
    type: "art",
    title: "September 1, 2023 | #2",
    year: 2023,
    date: "2023-09-01",
    image: "images/art/2023/2023-09-01_2.webp",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-09-01_1",
    type: "art",
    title: "September 1, 2023 | #1",
    year: 2023,
    date: "2023-09-01",
    image: "images/art/2023/2023-09-01_1.webp",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "psychedelics", "visionary"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-08-26_detail",
    type: "art",
    title: "August 26, 2023 | Detail",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_detail.webp",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "zazen", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023/p>
    <p><strong>Medium:</strong> Charcoal on Newspaper/p>
    <p>Zen tree. A personal favorite tree.</p>
  `
  },
  {
    id: "2023-08-26_4",
    type: "art",
    title: "August 26, 2023 | #4",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_4.webp",
    medium: "Charcoal",
    exhibit: "anand",

  tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>Sun Seeding</p>
  `
  },
  {
    id: "2023-08-26_3",
    type: "art",
    title: "August 26, 2023 | #3",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_3.webp",
    medium: "Charcoal",
    exhibit: "anand",

  tags: ["landscape", "LSD", "zazen", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-08-26_2",
    type: "art",
    title: "August 26, 2023 | #2",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_2.webp",
    exhibit: "anand",
    medium: "Charcoal",

  tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-08-26_1",
    type: "art",
    title: "August 26, 2023 | #1",
    year: 2023,
    date: "2023-08-26",
    image: "images/art/2023/2023-08-26_1.webp",
    medium: "Charcoal",
    exhibit: "anand",

    tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>The Soulcean</p>
  `
  },
  {
    id: "2023-08-13_2",
    type: "art",
    title: "August 13, 2023 | #2",
    year: 2023,
    date: "2023-08-13",
    image: "images/art/2023/2023-08-13_2.webp",
    exhibit: "woulds",
    medium: "Charcoal",
    exhibitOrder: 4,

    tags: ["landscape", "LSD", "zazen", "psychedelics"],

    sideNoteTitle: "Perseus Meteor Meditation 2",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>Perseids Meteor Shower</p>
  `
  },
  {
    id: "2023-08-13_1",
    type: "art",
    title: "August 13, 2023 | #1",
    year: 2023,
    date: "2023-08-13",
    image: "images/art/2023/2023-08-13_1.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 3,

    tags: ["landscape", "LSD", "zazen", "psychedelics"],

    sideNoteTitle: "Perseids Meteor Meditation",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>LSD trip during Perseids Meteor Shower</p>
  `
  },
  {
    id: "2023-08-06",
    type: "art",
    title: "August 6, 2023",
    year: 2023,
    date: "2023-08-06",
    image: "images/art/2023/2023-08-06.webp",
    medium: "Marker",

    tags: ["psychedelics", "mormonism"],

    sideNoteTitle: "The True Hallucinations of a Former Latter-day Saint",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Marker on paper</p>
    <p></p>
  `
  },
  {
    id: "2023-07-30",
    type: "art",
    title: "July 30, 2023",
    year: 2023,
    date: "2023-07-30",
    image: "images/art/2023/2023-07-30.webp",
    medium: "Charcoal",

    tags: ["zazen"],

    sideNoteTitle: "What is the Sound of One Hand",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-07-16_2",
    type: "art",
    title: "July 16, 2023 | #2",
    year: 2023,
    date: "2023-07-16",
    image: "images/art/2023/2023-07-16_2.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 2,

    tags: ["landscape", "LSD", "DMT", "psychedelics"],

    sideNoteTitle: "The Winds at Dimitri's Hollow",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>The winds blowing about in Dimitri's Hollow</p>
  `
  },
  {
    id: "2023-07-16_1",
    type: "art",
    title: "July 16, 2023 | #1",
    year: 2023,
    date: "2023-07-16",
    image: "images/art/2023/2023-07-16_1.webp",
    medium: "Charcoal",

    tags: ["landscape", "LSD", "zazen", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>Zen mountain pass</p>
  `
  },
  {
    id: "2023-07-10",
    type: "art",
    title: "July 10, 2023",
    year: 2023,
    date: "2023-07-10",
    image: "images/art/2023/2023-07-10.webp",
    medium: "Charcoal",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Canvas</p>
    <p>Mountain House View</p>
  `
  },
  {
    id: "2023-07-05",
    type: "art",
    title: "July 5, 2023",
    year: 2023,
    date: "2023-07-05",
    image: "images/art/2023/2023-07-05.webp",
    medium: "Charcoal",
    exhibit: "woulds",
    exhibitOrder: 1,

    tags: ["landscape", "LSD", "DMT", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p>The Bog</p>
  `
  },
  {
    id: "2023-06-27",
    type: "art",
    title: "June 27, 2023",
    year: 2023,
    date: "2023-06-27",
    image: "images/art/2023/2023-06-27.webp",
    medium: "Oil Paint",

    tags: [""],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Oil on canvas</p>
    <p>Close up on the sun from a 18x24 canvas since lost.</p>
  `
  },
  {
    id: "2023-06-24",
    type: "art",
    title: "June 24, 2023",
    year: 2023,
    date: "2023-06-24",
    image: "images/art/2023/2023-06-24.webp",
    medium: "Charcoal",

    tags: ["landscape", "LSD", "DMT", "psychedelics"],

    sideNoteTitle: "Dimitri's Willow's",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Newspaper</p>
    <p></p>
  `
  },
  {
    id: "2023-05-27",
    type: "art",
    title: "May 27, 2023",
    year: 2023,
    date: "2023-05-27",
    image: "images/art/2023/2023-05-27.webp",
    medium: "Charcoal",

    tags: ["LSD", "psychedelics"],

    sideNoteTitle: "Dog Getting Comfy",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p>Spun the charcoal stick around in the same pattern as my dog as he spun in circles before laying down.</p>
  `
  },
  {
    id: "2023-05-21_3",
    type: "art",
    title: "May 21, 2023 | #3",
    year: 2023,
    date: "2023-05-21",
    image: "images/art/2023/2023-05-21_3.webp",
    medium: "Charcoal",

    tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p>LSD views</p>
  `
  },
  {
    id: "2023-05-21_2",
    type: "art",
    title: "May 21, 2023 | #2",
    year: 2023,
    date: "2023-05-21",
    image: "images/art/2023/2023-05-21_2.webp",
    medium: "Charcoal",

    tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p>Zen emptiness 3 second painting.</p>
  `
  },
  {
    id: "2023-05-21_1",
    type: "art",
    title: "May 21, 2023 | #1",
    year: 2023,
    date: "2023-05-21",
    image: "images/art/2023/2023-05-21_1.webp",
    medium: "Charcoal",

    tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p></p>
  `
  },
  {
    id: "2023-05-18_2",
    type: "art",
    title: "May 18, 2023 | #2",
    year: 2023,
    date: "2023-05-18",
    image: "images/art/2023/2023-05-18_2.webp",
    medium: "Charcoal",

    tags: ["LSD", "psychedelics", "headless-way", "zazen"],

    sideNoteTitle: "Round Earth",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p>Curved Nature. LSD 3-second sketch.</p>
  `
  },
  {
    id: "2023-05-18_1",
    type: "art",
    title: "May 18, 2023 | #1",
    year: 2023,
    date: "2023-05-18",
    image: "images/art/2023/2023-05-18_1.webp",
    medium: "Charcoal",

    tags: [""],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p></p>
  `
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
    medium: "Charcoal",

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p>Zen emptiness 3 second painting.</p>
  `
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
    medium: "Charcoal",

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p>Zen emptiness 3 second painting.</p>
  `
  },
  {
    id: "2023-05-13_1",
    type: "art",
    title: "May 13, 2023 | #1",
    year: 2023,
    date: "2023-05-13",
    image: "images/art/2023/2023-05-13_1.webp",
    medium: "Charcoal",
    exhibit: "HZ5",
    exhibitOrder: 1,

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Charcoal on Paper/p>
    <p>Zen emptiness 3 second painting.</p>
  `
  },
  {
    id: "2023-05-07_4",
    type: "art",
    title: "May 7, 2023 | #4",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_4.webp",
    medium: "Charcoal",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p></p>
  `
  },
  {
    id: "2023-05-07_3",
    type: "art",
    title: "May 7, 2023 | #3",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_3.webp",
    medium: "Charcoal",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p></p>
  `
  },
  {
    id: "2023-05-07_2",
    type: "art",
    title: "May 7, 2023 | #2",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_2.webp",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p></p>
  `
  },
  {
    id: "2023-05-07_1",
    type: "art",
    title: "May 7, 2023 | #1",
    year: 2023,
    date: "2023-05-07",
    image: "images/art/2023/2023-05-07_1.webp",
    medium: "Charcoal",

    tags: ["DMT", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2023</p>
    <p><strong>Medium:</strong> Charcoal on Paper</p>
    <p></p>
  `
  },
  {
    id: "2023-09-19",
    type: "art",
    title: "September 19, 2022",
    year: 2022,
    date: "2022-09-19",
    image: "images/art/2022/2022-09-19.webp",
    medium: ["Oil Paint", "Ink"],

    tags: ["ink"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink and Oil on Canvas</p>
    <p>An otherworldly landscape completed while cross-faded on cannabis and two 12% beers.</p>
  `
  },
  {
    id: "2022-08-28_3",
    type: "art",
    title: "August 28, 2022 | #3",
    year: 2022,
    date: "2022-08-28",
    image: "images/art/2022/2022-08-28_3.webp",
    medium: "Oil Paint",

    tags: ["zazen"],

    sideNoteTitle: "Release",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>A release of existential tension.</p>
  `
  },
  {
    id: "2022-08-28_2",
    type: "art",
    title: "August 28, 2022 | #2",
    year: 2022,
    date: "2022-08-28",
    image: "images/art/2022/2022-08-28_2.webp",
    medium: "Oil Paint",

    tags: ["psychedelics", "DMT"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>A landscape that overlayed my backyard after a DMT come up. Painted in ~90s after coming up on 20mg.</p>
  `
  },
  {
    id: "2022-08-28_1",
    type: "art",
    title: "August 28, 2022 | #1",
    year: 2022,
    date: "2022-08-28",
    image: "images/art/2022/2022-08-28_1.webp",
    medium: "Oil Paint",

    tags: ["psychedelics", "DMT"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas/p>
    <p>My backyard on a DMT come up. Painted in ~90s while coming up on 20mg.</p>
  `
  },
  {
    id: "2022-08-14_2",
    type: "art",
    title: "August 14, 2022 | #2",
    year: 2022,
    date: "2022-08-14",
    image: "images/art/2022/2022-08-14_2.webp",
    medium: "Oil Paint",

    tags: ["psychedelics", "DMT"],

    sideNoteTitle: "DMT Haven",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p></p>
  `
  },
  {
    id: "2022-08-14_1",
    type: "art",
    title: "August 14, 2022 | #1",
    year: 2022,
    date: "2022-08-14",
    image: "images/art/2022/2022-08-14_1.webp",
    medium: "Oil Paint",

    tags: ["psychedelics", "DMT"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas/p>
    <p>Crossing DMT thresholds</p>
  `
  },
  {
    id: "2022-08-02",
    type: "art",
    title: "August 2, 2022",
    year: 2022,
    date: "2022-08-02",
    image: "images/art/2022/2022-08-02.webp",
    sideNoteTitle: "Sophia's Seblueision | Man Meditating in Cabin",
    medium: "Oil Paint",

    tags: ["zazen"],

    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Inspired by filbert brush zen painting completed on June 25, 2022/</p>
  `
  },
  {
    id: "2022-08-01_2",
    type: "art",
    title: "August 1, 2022",
    year: 2022,
    date: "2022-08-01",
    image: "images/art/2022/2022-08-01_2.webp",
    medium: "Oil Paint",
    exhibit: "HZ4",
    exhibitOrder: 7,
    showOnArt: false,

    tags: ["LSD", "psychedelics", "zazen"],

    sideNoteTitle: "Vivid Valley View + Section Inspirations",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas Paper, Oil on Canvas</p>
    <p>Compilation of meditative Ink on Canvas Paper works from weeks prior.</p>
  `
  },
  {
    id: "2022-08-01_1",
    type: "art",
    title: "August 1, 2022",
    year: 2022,
    date: "2022-08-01",
    image: "images/art/2022/2022-08-01_1.webp",
    medium: "Oil Paint",
    exhibit: "HZ4",
    exhibitOrder: 6,

    tags: ["LSD", "psychedelics"],

    sideNoteTitle: "Vivid Valley View",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Compilation of meditative Ink on Canvas Paper works from weeks prior.</p>
  `
  },
  {
    id: "2022-07-15_2",
    type: "art",
    title: "2nd Grade",
    year: 2022,
    date: "2022-07-15",
    image: "images/art/2022/2022-07-15_2.webp",
    medium: "Chalk",

    tags: ["visionary", "childhood"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 1997</p>
    <p><strong>Medium:</strong> Chalk on Paper</p>
    <p>Second grade art project relevant to a meditative painting completed in 2022. See next photo.</p>
  `
  },
  {
    id: "2022-07-15_1",
    type: "art",
    title: "July 15, 2022 | #1",
    year: 2022,
    date: "2022-07-15",
    image: "images/art/2022/2022-07-15_1.webp",
    medium: "Oil Paint",

    tags: ["visionary", "zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>I dipped a 1 inch round brush in a mixture of white and pthalo green, meditated in front of the canvas for about 30 seconds, and then completed the scene within 90 seconds. It was already a person favorite for some time, but the following spring I was going through some childhood memories when I came across an art project from second grade which matched the very well. See previos photo.</p>
  `
  },
    {
    id: "2022-06-25",
    type: "art",
    title: "June 25, 2022",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-25.webp",
    medium: "Oil Paint",

    tags: ["zazen", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on paper</p>
    <p>I dipped a filbert brush in white oil paint, meditated in front of the canvas for a moment, and then completed a hasty scene. This would later become inspiration for "Sophia's Sebluesion/Man Meditating in Cabin — August 2, 2022"</p>
  `
  },
  {
    id: "2022-06-24",
    type: "art",
    title: "June 24, 2022",
    year: 2022,
    date: "2022-06-24",
    image: "images/art/2022/2022-06-24.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Salt Lake City. Completed using leftover palette paint. A personal favorite.</p>
  `
  },
  {
    id: "2022-06-23",
    type: "art",
    title: "June 23, 2022",
    year: 2022,
    date: "2022-06-23",
    image: "images/art/2022/2022-06-23.webp",
    medium: "Oil Paint",

    tags: [""],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>I don't really remember this one, more is it in my possession, but now as I look back at it for some reason it always makes me think of A Series of Unfortunate Events.</p>
  `
  },
  {
    id: "2022-06-18_5",
    type: "art",
    title: "June 18, 2022 | #5",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_5.webp",
    medium: "Ink",

    tags: ["zazen"],

    exhibit: "HZ4",
    exhibitOrder: 1,
    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Ink on Canvas Paper</p>
    <p>I dipped a 1 inch round brush in ink and held it above the paper meditating until the moment spontaneously arose to strike the page and quickly complete a scene within a few strokes.</p>
  `
  },
  {
    id: "2022-06-18_4",
    type: "art",
    title: "June 18, 2022 | #4",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_4.webp",
    medium: "Ink",
    exhibit: "HZ4",
    exhibitOrder: 5,

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas Paper</p>
    <p>I dipped a 1 inch round brush in ink and held it above the paper meditating until the moment spontaneously arose to strike the page and quickly complete a scene within a few strokes.</p>
  `
  },
  {
    id: "2022-06-18_3",
    type: "art",
    title: "June 18, 2022 | #3",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_3.webp",
    medium: "Ink",
    exhibit: "HZ4",
    exhibitOrder: 2,

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas Paper</p>
    <p>I dipped a 1 inch round brush in ink and held it above the paper meditating until the moment spontaneously arose to strike the page and quickly complete a scene within a few strokes.</p>
  `
  },
  {
    id: "2022-06-18_2",
    type: "art",
    title: "June 18, 2022 | #2",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_2.webp",
    medium: "Ink",
    exhibit: "HZ4",
    exhibitOrder: 4,

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas Paper</p>
    <p>I dipped a 1 inch round brush in ink and held it above the paper meditating until the moment spontaneously arose to strike the page and quickly complete a scene within a few strokes.</p>
  `
  },
  {
    id: "2022-06-18_1",
    type: "art",
    title: "June 18, 2022 | #1",
    year: 2022,
    date: "2022-06-18",
    image: "images/art/2022/2022-06-18_1.webp",
    medium: "Ink",
    exhibit: "HZ4",
    exhibitOrder: 3,

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas Paper</p>
    <p>I dipped a 1 inch round brush in ink and held it above the paper meditating until the moment spontaneously arose to strike the page and quickly complete a scene within a few strokes.</p>
  `
  },
  {
    id: "2022-06-15_2",
    type: "art",
    title: "June 15, 2022",
    year: 2022,
    date: "2022-06-15",
    image: "images/art/2022/2022-06-15_2.webp",
    medium: "Ink",

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Purple Palms",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Scene completed after spreading oil on canvas with hand broom.</p>
  `
  },
  {
    id: "2022-06-15_1",
    type: "art",
    title: "June 15, 2022",
    year: 2022,
    date: "2022-06-15",
    image: "images/art/2022/2022-06-15_1.webp",
    medium: "Ink",
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Oil spread on canvas after being dipped in a hand broom.</p>
  `
  },
  {
    id: "2022-06-11_2",
    type: "art",
    title: "June 11, 2022",
    year: 2022,
    date: "2022-06-11",
    image: "images/art/2022/2022-06-11_2.webp",
    medium: "Ink",
    exhibit: "HZ3",
    exhibitOrder: 2,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Man Meditating Cliffside",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil and Blood on Canvas</p>
    <p>Scene completed after spreading blood on canvas after cutting my palm with a knife accidentally.</p>
  `
  },
  {
    id: "2022-06-11_1",
    type: "art",
    title: "June 5, 2022 | Blot",
    year: 2022,
    date: "2022-06-11",
    image: "images/art/2022/2022-06-11_1.webp",
    medium: "Ink",
    exhibit: "HZ3",
    exhibitOrder: 1,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Man Meditating Cliffside | Blot",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Blood on Canvas</p>
    <p>I cut my palm while folding a knife closed. It had a terrible closing mechanism and I was on LSD. I walked back in the house and saw an empty canvas, so I spread some blood on it before I cleaned up. I then went and completed the scene from what was left behind.</p>
  `
  },
  {
    id: "2022-06-08_2",
    type: "art",
    title: "June 8, 2022 | #2",
    year: 2022,
    date: "2022-06-08",
    image: "images/art/2022/2022-06-08_2.webp",
    medium: "Ink",
    exhibit: "HZ3",
    exhibitOrder: 6,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>Scene completed from ink spread on canvas by Siberian Elm limb</p>
  `
  },
  {
    id: "2022-06-08_1",
    type: "art",
    title: "June 8, 2022 | Blot",
    year: 2022,
    date: "2022-06-08",
    image: "images/art/2022/2022-06-08_1.webp",
    medium: "Ink",
    exhibit: "HZ3",
    exhibitOrder: 5,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>I dipped the young stem of a Siberian Elm tree in ink, spread it around the canvas, and then completed the scene from the blot.</p>
  `
  },
 {
    id: "2022-06-06",
    type: "art",
    title: "June 6, 2022",
    year: 2022,
    date: "2022-06-06",
    image: "images/art/2022/2022-06-06.webp",
    medium: "Oil Paint",

    tags: [""],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Bob Ross scene redone in my blues after I had a ton left over on the pallete.</p>
  `
  },
  {
    id: "2022-06-05_2",
    type: "art",
    title: "June 5, 2022",
    year: 2022,
    date: "2022-06-05",
    image: "images/art/2022/2022-06-05_2.webp",
    medium: "Ink",
    exhibit: "HZ3",
    exhibitOrder: 4,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Man Fishing at Ice Melt",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p></p>
  `
  },
  {
    id: "2022-06-05_1",
    type: "art",
    title: "June 5, 2022 | Blot",
    year: 2022,
    date: "2022-06-05",
    image: "images/art/2022/2022-06-05_1.webp",
    medium: "Ink",
    exhibit: "HZ3",
    exhibitOrder: 3,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Man Fishing at Ice Melt | Blot",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>I dipped a hand broom in blue oil paint, spread it around the canvas, and then completed the scene from the blot.</p>
  `
  },
  {
    id: "2022-05-29",
    type: "art",
    title: "May 29, 2022",
    year: 2022,
    date: "2022-05-29",
    image: "images/art/2022/2022-05-29.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Practicing several different things. Was last in the possession of Zelph on the Shelf.</p>
  `
  },
  {
    id: "2022-05-27_2",
    type: "art",
    title: "May 27, 2022",
    year: 2022,
    date: "2022-05-27",
    image: "images/art/2022/2022-05-27_2.webp",
    medium: "Ink",
    exhibit: "HZ2",
    exhibitOrder: 4,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p></p>
  `
  },
  {
    id: "2022-05-27_1",
    type: "art",
    title: "May 27, 2022 | Blot",
    year: 2022,
    date: "2022-05-27",
    image: "images/art/2022/2022-05-27_1.webp",
    medium: "Ink",
    exhibit: "HZ2",
    exhibitOrder: 3,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>I dipped my long hair in blue ink, slapped it on the canvas, and then completed the scene based on the blot left behind.</p>
  `
  },
  {
    id: "2022-05-26_2",
    type: "art",
    title: "May 26, 2022",
    year: 2022,
    date: "2022-05-26",
    image: "images/art/2022/2022-05-26_2.webp",
    medium: "Ink",
    exhibit: "HZ2",
    exhibitOrder: 2,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Chronic Pain",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>A visual representation of all the pain sensations associated with Chronic Pain, or what was then called, "Fibromyalgia."</p>
  `
  },
  {
    id: "2022-05-26_1",
    type: "art",
    title: "May 26, 2022 | Blot",
    year: 2022,
    date: "2022-05-26",
    image: "images/art/2022/2022-05-26_1.webp",
    medium: "Ink",
    exhibit: "HZ2",
    exhibitOrder: 1,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>I dipped my long hair in blue ink, slapped it on the canvas, and then completed the scene based on the blot left behind.</p>
  `
  },
  {
    id: "2022-05-23_5",
    type: "art",
    title: "May 23, 2022 | #3",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_5.webp",
    medium: "Ink",
    exhibit: "HZ1",
    exhibitOrder: 4,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>Self-transforming Elf Machines building the landscape. A dog emerges from the creations and begins to run.</p>
  `
  },
  {
    id: "2022-05-23_4",
    type: "art",
    title: "May 23, 2022 | Blot 2",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_4.webp",
    medium: "Ink",
    exhibit: "HZ1",
    exhibitOrder: 3,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>I dipped my long hair in blue and silver ink, slapped it on the canvas, and then completed the scene based on the blot left behind.</p>
  `
  },
  {
    id: "2022-05-23_3",
    type: "art",
    title: "May 23, 2022 | #2",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_3.webp",
    medium: "Ink",
    exhibit: "HZ1",
    exhibitOrder: 2,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Private Cove",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p></p>
  `
  },
  {
    id: "2022-05-23_2",
    type: "art",
    title: "May 23, 2022 | Blot 1",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_2.webp",
    medium: "Ink",
    exhibit: "HZ1",
    exhibitOrder: 1,
    showOnArt: false,

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>I dipped my long hair in silver ink, slapped it on the canvas, and then completed the scene based on the blot left behind.</p>
  `
  },
  {
    id: "2022-05-23_1",
    type: "art",
    title: "May 23, 2022 | #1",
    year: 2022,
    date: "2022-05-23",
    image: "images/art/2022/2022-05-23_1.webp",
    medium: "Ink",

    tags: ["zazen", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Ink on Canvas</p>
    <p>I dipped my long hair in purple ink, slapped it on the canvas, and then completed the scene based on the blot left behind.</p>
  `
  },
 {
    id: "2022-05-15_snowstorm",
    type: "art",
    title: "May 15, 2022",
    year: 2022,
    date: "2022-05-15",
    image: "images/art/2022/2022-05-15_snowstorm.webp",
    medium: "Oil Paint",

    tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>First LSD trip in 3 years. Local park.</p>
  `
  },
  {
    id: "2022-05-15",
    type: "art",
    title: "May 15, 2022",
    year: 2022,
    date: "2022-05-15",
    image: "images/art/2022/2022-05-15.webp",
    medium: "Oil Paint",

    tags: ["landscape", "LSD", "psychedelics"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>First LSD trip in 3 years. Local park.</p>
  `
  },
  {
    id: "2022-05-14",
    type: "art",
    title: "May 14, 2022",
    year: 2022,
    date: "2022-05-14",
    image: "images/art/2022/2022-05-14.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Nic Hankins, Bob Ross channel recreation.</p>
  `
  },
  {
    id: "2022-04-19",
    type: "art",
    title: "April 19, 2022",
    year: 2022,
    date: "2022-04-19",
    image: "images/art/2022/2022-04-19.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2025</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>The Cabins at Bear River Lodge, 2022.</p>
  `
  },
  {
    id: "2022-04-04",
    type: "art",
    title: "April 4, 2022",
    year: 2022,
    date: "2022-04-04",
    image: "images/art/2022/2022-04-04.webp",
    medium: "Oil Paint",

     tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Bob Ross recreation.</p>
  `
  },
  {
    id: "2022-04-03",
    type: "art",
    title: "April 3, 2022",
    year: 2022,
    date: "2022-04-03",
    image: "images/art/2022/2022-04-03.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Bob Ross recreation.</p>
  `
  },
 {
    id: "2022-04-01_2",
    type: "art",
    title: "April 1, 2022 | Underpainting",
    year: 2022,
    date: "2022-04-01",
    image: "images/art/2022/2022-04-01_2.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas<</p>
    <p>Bob Ross recreation.</p>
  `
  },
  {
    id: "2022-04-01_1",
    type: "art",
    title: "April 1, 2022",
    year: 2022,
    date: "2022-04-01",
    image: "images/art/2022/2022-04-01_1.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas<</p>
    <p>Bob Ross recreation.</p>
  `
  },
 {
    id: "2022-03-29",
    type: "art",
    title: "March 29, 2022",
    year: 2022,
    date: "2022-03-29",
    image: "images/art/2022/2022-03-29.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas<</p>
    <p>Uncertain if me or Bob Ross recreation. Probs Bob. But also looks incomplete-ish.</p>
  `
  },
  {
    id: "2022-03-25",
    type: "art",
    title: "March 25, 2022",
    year: 2022,
    date: "2022-03-25",
    image: "images/art/2022/2022-03-25.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "The Forest of Lee",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas<</p>
    <p>The stillness watches. The watching listens.</p>
  `
  },
  {
    id: "2022-03-23",
    type: "art",
    title: "March 23, 2022",
    year: 2022,
    date: "2022-03-23",
    image: "images/art/2022/2022-03-23.webp",
    medium: "Oil Paint",

    tags: [""],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas<</p>
    <p>Small scene made from oil leftover on the pallete. A personal favorite.</p>
  `
  },
  {
    id: "2022-03-15",
    type: "art",
    title: "March 15, 2022",
    year: 2022,
    date: "2022-03-15",
    image: "images/art/2022/2022-03-15.webp",
    medium: "Oil Paint",

    tags: [""],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas<</p>
    <p>Winter Ostara, 2022. Backyard of a Twitter mutual who lives on the East Coast.</p>
  `
  },
  {
    id: "2022-03-08_3",
    type: "art",
    title: "March 8, 2022 | #3",
    year: 2022,
    date: "2022-03-08",
    image: "images/art/2022/2022-03-08_3.webp",
    medium: "Oil Paint",
    exhibit: "mayuan",
    exhibitOrder: 3,

    tags: ["zazen", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Ma Yuan inspired. A family favorite.</p>
  `
  },
  {
    id: "2022-03-08_2",
    type: "art",
    title: "March 8, 2022 | #2",
    year: 2022,
    date: "2022-03-08",
    image: "images/art/2022/2022-03-08_2.webp",
    medium: "Oil Paint",
    exhibit: "mayuan",
    exhibitOrder: 2,

    tags: ["zazen", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Ma Yuan recreation. A family favorite.</p>
  `
  },
  {
    id: "2022-03-08_1",
    type: "art",
    title: "March 8, 2022 | #1",
    year: 2022,
    date: "2022-03-08",
    image: "images/art/2022/2022-03-08_1.webp",
    medium: "Oil Paint",
    exhibit: "mayuan",
    exhibitOrder: 1,

    tags: ["zazen", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas/p>
    <p>Ma Yuan recreation. A family favorite.</p>
  `
  },
  {
    id: "2022-03-03_2",
    type: "art",
    title: "March 3, 2022 | #2",
    year: 2022,
    date: "2022-03-03",
    image: "images/art/2022/2022-03-03_2.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on paper</p>
    <p>Made from leftover paint from previous Bob Ross recreation.</p>
  `
  },
  {
    id: "2022-03-03_1",
    type: "art",
    title: "March 3, 2022 | #1",
    year: 2022,
    date: "2022-03-03",
    image: "images/art/2022/2022-03-03_1.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on paper</p>
    <p>Bob Ross recreation.</p>
  `
  },
  {
    id: "2022-02-18",
    type: "art",
    title: "February 18, 2022",
    year: 2022,
    date: "2022-02-18",
    image: "images/art/2022/2022-02-18.webp",
    medium: "Oil Paint",

    tags: ["landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Practicing random winter scenes.</p>
  `
  },
  {
    id: "2022-02-14",
    type: "art",
    title: "February 14, 2022",
    year: 2022,
    date: "2022-02-14",
    image: "images/art/2022/2022-02-14.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>Bob Ross recreation</p>
  `
  },
  {
    id: "2022-01-30",
    type: "art",
    title: "January 30, 2022",
    year: 2022,
    date: "2022-01-30",
    image: "images/art/2022/2022-01-30.webp",
    medium: "Oil Paint",

    tags: ["bob-ross", "landscape"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2022</p>
    <p><strong>Medium:</strong> Oil on Canvas</p>
    <p>One of my first attempts to oil paint a Bob Ross.</p>
  `
  },
  {
    id: "2020-11-18",
    type: "art",
    title: "November 18, 2020",
    year: 2020,
    date: "2020-11-18",
    image: "images/art/2020/2020-11-18.webp",
    medium: "Pen",

    tags: ["zazen"],

    sideNoteTitle: "Details",
    sideNote: `
    <p><strong>Year:</strong> 2020</p>
    <p><strong>Medium:</strong> Pen on paper</p>
    <p>Sketch I started after a particular OBE meditation in the Fall of 2020. Never got around to finishing this one.</p>
  `
  },
  {
    id: "1997-03-30",
    type: "art",
    title: "1997-03-30",
    year: 1997,
    date: "1997-03-30",
    image: "images/art/1997/1997-03-30.webp",
    medium: "Paper",

    tags: ["childhood"],

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
    isBook: true,
    file: "pdf/NaturalisticBoM.pdf",
    sections: ["writing"],
    tags: ["mormon-theology", "metaphysics", "book-of-mormon", "headless-way"]
  },
  {
    id: "DragonPearl",
    type: "writing",
    title: "A Dragon Guards the Pearl of Enlightenment",
    year: 2025,
    date: "2025-09-22",
    isBook: true,
    file: "pdf/DragonPearl.pdf",
    sections: ["writing"],
    tags: ["mormon-theology", "metaphysics", "daoism", "cosmology", "panpsychism", "intelligence-theory"]
  },
 {
    id: "CtP",
    type: "writing",
    title: "Called to Purge",
    year: 2025,
    date: "2025-03-05",
    isBook: true,
    file: "pdf/CtP.pdf",
    sections: ["writing"],
    tags: ["mormon-theology", "metaphysics", "dreams", "consciousness", "phenomenology", "visionary"]
  },
  {
    id: "AcidLullabies",
    type: "writing",
    title: "Acid Lullabies: LSD Interactions with Chronic Pain & Insomnia, a Hypothesis",
    year: 2025,
    date: "2025-02-16",
    file: "pdf/AcidLullabies.pdf",
    sections: ["writing"],
    tags: ["LSD", "psychedelics", "consciousness", "consciousness-research", "medical", "science", "theory"],
  },
  {
    id: "HL",
    type: "writing",
    title: "Heaven's Ledger: the Spiritual Topology of Mormonism",
    year: 2024,
    date: "2024-09-29",
    file: "pdf/HL.pdf",
    sections: ["writing"],
    tags: ["mormon-theology", "metaphysics", "theory", "phenomenology", "panpsychism", "intelligence-theory", "book-of-mormon"]
  },
  {
    id: "AIPR",
    type: "writing",
    title: "The Perpetual PreRealization of Artificial Intelligence",
    year: 2024,
    date: "2024-06-24",
    file: "pdf/AIPR.pdf",
    sections: ["writing"],
    tags: ["consciousness", "artificial-intelligence", "daoism"]
  },
  {
    id: "THOOGTEOOS",
    type: "writing",
    title: "The Harmony of Our Gods and the Ecology of Our Souls",
    year: 2024,
    date: "2024-05-11",
    file: "pdf/THOOGTEOOS.pdf",
    sections: ["writing"],
    tags: ["mormon-theology", "metaphysics", "ontology", "cosmology", "panpsychism", "intelligence-theory"]
  },
  {
    id: "ND",
    type: "writing",
    title: "Nothing Doubting",
    year: 2024,
    date: "2024-01-09",
    file: "pdf/ND.pdf",
    sections: ["trips"],
    substance: ["Psilocybin"],
    tags: ["theophany", "visionary", "psychedelics", "consciousness", "phenomenology", "zazen", "meditation", "headless-way"]
  },
  {
    id: "FSoC",
    type: "writing",
    title: "The Fine Solution of Consciousness",
    year: 2023,
    date: "2023-12-21",
    file: "pdf/FSoC.pdf",
    sections: ["writing"],
    tags: ["consciousness", "science", "zazen"]
  },
  {
    id: "BSnSG",
    type: "writing",
    title: "Broken Shelves and Snow Globes",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/BSnSG.pdf",
    sections: ["writing"],
    tags: ["deconstruction", "ex-mormonism", "phenomenology"]
  },
  {
    id: "Toyn",
    type: "writing",
    title: "Recurring Toyn Dream | ~2000–2005",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/Toyn.pdf",
    sections: ["trips"],
    tags: ["dreams", "phenomenology", "consciousness"]
  },
  {
    id: "RDMain",
    type: "writing",
    title: "Recurring Dreams, 1996–2007",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/RDMain.pdf",
    sections: ["trips"],
    tags: ["dreams", "visionary", "phenomenology", "consciousness"]
  },
  {
    id: "CB",
    type: "writing",
    title: "Communication Breakdown",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/CB.pdf",
    sections: ["trips"],
    tags: ["meditation", "zazen", "phenomenology", "consciousness"]
  },
  {
    id: "TrampOBE",
    type: "writing",
    title: "Trampoline OBE Derealization, 1996",
    date: "2023-09-24",
    year: 2023,
    file: "pdf/TrampOBE.pdf",
    sections: ["trips"],
    tags: ["phenomenology", "consciousness"]
  },
  {
    id: "GT",
    type: "writing",
    title: "Golden Teachers",
    date: "2023-01-23",
    year: 2023,
    file: "pdf/GT.pdf",
    sections: ["trips"],
    substance: ["Psilocybin"],
    tags: ["psychedelics", "consciousness", "phenomenology", "zazen", "meditation", "headless-way"]
  },
{
    id: "TCJ",
    type: "writing",
    title: "The Cosmic Joke",
    date: "2022-09-22",
    year: 2022,
    file: "pdf/TCJ.pdf",
    sections: ["writing"],
    tags: ["DMT", "consciousness"]
  },
  {
    id: "TCAE",
    type: "writing",
    title: "The Cosmological Axis of Evil",
    date: "2022-09-22",
    year: 2022,
    file: "pdf/TCAE.pdf",
    sections: ["writing"]
  },
{
    id: "Vintepathy",
    type: "writing",
    title: "Vintepathy",
    date: "2022-09-22",
    year: 2022,
    file: "pdf/Vintepathy.pdf",
    sections: ["writing"],
  },
{
    id: "RoEM",
    type: "writing",
    title: "DMT: Representation of Entity Morphology",
    date: "2022-09-22",
    year: 2022,
    file: "pdf/RoEM.pdf",
    sections: ["writing"],
    tags: ["DMT", "consciousness", "science", "theory"]
  },
  {
    id: "DMTERRAIN",
    type: "writing",
    title: "DMT: The Dark Matter Terrain",
    date: "2022-09-22",
    year: 2022,
    file: "pdf/DMTERRAIN.pdf",
    sections: ["writing"],
    tags: ["DMT", "consciousness", "science", "theory", "psychedelics"]
  },
  {
    id: "HGA",
    type: "writing",
    title: "He's Gone APE",
    date: "2022-08-02",
    year: 2022,
    file: "pdf/HGA.pdf",
    sections: ["trips"],
    substance: ["Psilocybin"],
    tags: ["visionary", "psychedelics", "consciousness", "phenomenology"]
  },
  {
    id: "IAMT",
    type: "writing",
    title: "I've a Mother There",
    date: "2022-07-12",
    year: 2022,
    file: "pdf/IAMT.pdf",
    sections: ["trips"],
    substance: ["DMT"],
    tags: ["theophany", "visionary", "DMT", "consciousness", "phenomenology", "psychedelics"]
  },
  {
    id: "TGCoB",
    type: "writing",
    title: "The Great Chain of Belonging",
    date: "2022-06-24",
    year: 2022,
    file: "pdf/TGCoB.pdf",
    sections: ["trips"],
    substance: ["DMT"],
    tags: ["visionary", "DMT", "phenomenology", "mormon-theology", "metaphysics", "ontology", "cosmology", "panpsychism", "intelligence-theory"]
  },
  {
    id: "DogBuddha",
    type: "writing",
    title: "Does a Dog Have Buddha Nature?",
    date: "2022-05-26",
    year: 2022,
    file: "pdf/DogBuddha.pdf",
    sections: ["trips"],
    substance: ["LSD"],
    tags: ["zazen", "LSD", "psychedelics", "consciousness"]
  },
  {
    id: "WMZ",
    type: "writing",
    title: "What is the Meaning of Zen?",
    date: "2022-05-22",
    year: 2022,
    file: "pdf/WMZ.pdf",
    sections: ["trips"],
    substance: ["LSD"],
    tags: ["zazen", "LSD", "psychedelics", "consciousness"]
  },
  {
    id: "ForestofLee",
    type: "writing",
    title: "The Trembling Forest of Lee",
    subtitle: "Journey, Perspective, and the Context of Our Condition",
    year: 2021,
    date: "2021-08-31",
    file: "pdf/ForestofLee.pdf",
    sections: ["writing"],
    tags: ["mormon-theology", "phenomenology"]
  },
  {
    id: "Triplette",
    type: "writing",
    title: "[Trip]let[te]",
    date: "2020-11-03",
    year: 2020,
    file: "pdf/Triplette.pdf",
    sections: ["trips"],
    tags: ["zazen", "cannabis", "consciousness", "meditation", "phenomenology"]
  },
  {
    id: "SiA",
    type: "writing",
    title: "Soaked in Alacrity",
    date: "2020-08-08",
    year: 2020,
    file: "pdf/SiA.pdf",
    sections: ["trips"],
    substance: ["Cannabis"],
    tags: ["DMT", "cannabis", "medical", "phenomenology"]
  },
  {
    id: "AIW",
    type: "writing",
    title: "All is Well",
    date: "2019-05-11",
    year: 2019,
    file: "pdf/AIW.pdf",
    sections: ["trips"],
    substance: ["LSD"],
    tags: ["visionary", "LSD", "phenomenology", "mormon-theology", "metaphysics", "ontology", "cosmology", "panpsychism", "intelligence-theory", "consciousness", "consciousness-research"]
  },

/* ===================
       MARGINS
====================== */
{
  id: "2025_09_22_5",
  type: "margins",
  title: "The Divine Ecology",
  date: "2025-09-22",
  isBook: true,
  text: `
In Mormon theology, the Eternal God who governs all gods serves as an autochthonous frame of reference, while God the Father, though fully divine, is an ascended being within that divine ecology.`,
  detail: "Excerpt from: Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds.",
  marginsTags: ["harmonic-theism", "ontology", "mormon-theology"]
},
{
  id: "2025_09_22_4",
  type: "margins",
  title: "Eternal Progression",
  date: "2025-09-22",
  text: `
The cosmos is not a product of temporal causality, it is a ceaseless unfolding. This, a hint that even the divine nature of the Eternal God is ever-progressing, and always self-surpassing; expanding His space to conduct more kingdoms, in order that more kingdoms may join in the harmony of his ever-expanding, boundless space,`,
  detail: "Excerpt from: Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds.",
marginsTags: ["harmonic-theism", "mormon-theology", "daoism", "ontology", "cosmogony"] 
},
{
  id: "2025_09_22_3",
  type: "margins",
  title: "Structure, Significance, Symmetry",
  date: "2025-09-22",
  text: `
This correspondence between structure and significance aligns with emerging models in the study of consciousness itself.
"The Symmetry Theory of Valence," proposed by the Qualia Research Institute, 68 suggests that the quality of an experience its pleasure or suffering is not incidental, but reflects the underlying mathematical harmony of that experience's structure.

Symmetry, coherence, and compressibility are not just aesthetic features; they are the felt presence of those features. The more harmonious the experiential pattern, the more radiant the felt tone. Intelligence, then, is not only the capacity to structure the world, but to feel the symmetry of that structuring. The glory of God may reside, not just in light and truth, but in the beauty of its arrangement.`,
  detail: "Excerpt from: Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds.",
  marginsTags: ["harmonic-theism", "consciousness", "science", "intelligence-theory", "panpsychism"]
},
{
  id: "2025_09_22_2",
  type: "margins",
  title: "The Depth of Mormon Theology",
  date: "2025-09-22",
  text: `
The Mormon tradition sings a vision of God that is both expansive and intimate—being and becoming, law and light. Yet this harmonic theology is too often distorted… [Others'] flattened images, while understandable given limited exposure, tragically overlook the depth and intricacies of Mormon theology.`,
  detail: "Excerpt from: Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds.",
  marginsTags: ["harmonic-theism", "mormon-theology", "ontology"]
},
{
  id: "2025_09_22_1",
  type: "margins",
  title: "The Ontology of Resonance | The Golden Plates",
  date: "2025-09-22",
  text: `
The golden plates exist in the liminal space where matter becomes melody—a chord struck simultaneously in the soil of Cumorah’s hill, and the hyperdimensional lattice of the Spirit World. They are neither relic nor rumor, but resonance: a vibration echoing across the Möbius strip of eternity, accessible when perception pivots from passive sight to active grasp. The plates’ burial and exhumation are not sequential events, they are simultaneous frequencies in God’s eternal round… waiting to be unwoven by those who dare to hum harmonics into the abyss.`,
  detail: "Excerpt from: Harmonic Theism, Symphony No. I: Creatio ex Concordia and the Divine Arrangement of Worlds.",
  marginsTags: ["harmonic-theism", "ontology", "metaphysics", "causal-body", "book-of-mormon"]
},
{
  id: "2025_02_15",
  type: "margins",
  title: "Daoism v. Buddhism",
  date: "2025-02-15",
  text: `Daoism is anarchist, acosmotic, and has more breadth then Buddhism. 
The Daodejing is a very complex text that has been bastardized by many, and it includes the rich history of the wisdom of the Yijing.

Buddhism is a methodology of escape.
Daoism is a methodology of acceptance.`,
  detail: "Response to question on X regarding the differences between Buddhism and Daoism.",
  marginsTags: ["daoism"]
},
{
  id: "2025_02_20",
  type: "margins",
  title: "Why There is No Schizophrenia in the Congenitally Blind",
  date: "2025-02-20",
  text: `
Every sense is the specialization of the sense of touch. With no light touching the occipital lobe, it has rewired itself through plasticity to conform likely to the parietal lobe; “seeing” through the primary touch sense, (i.e. braille). The negative impact is enlarged ventricles in the prefrontal cortex and other regions. This may play a role in schizophrenia. Ventricles are the network housing the medium which defracts light for perception of dreams, psychedelics, or delusions, etc, –cerebrospinal fluid. CSF has nothing to defract in the congenitally blind, and is instead overloaded with other sensory information attempting to build an alternative consensus model/framework to reality.`,
detail: "Popular response to a video by '@idea.soup' which was reposted on X.",
  marginsTags: ["consciousness", "science", "theory"]
},

{
  id: "2025_01_22",
  type: "margins",
  title: "Psychescopes of Consciousness",
  date: "2025-01-22",
  text: `The true telescope and microscope for Consciousness is called a Psychescope, which is a blend of tryptamine's refracting light through cerebrospinal fluid.`,
detail: "Discussion of consciousness and psychedelics on X.",
  marginsTags: ["psychescope", "consciousness", "psychedelics"]
},
{
  id: "2024_07_23",
  type: "margins",
  title: "DMT as a Psychescope",
  date: "2024-07-23",
  text: `
One of the first things I learned from these experiences was that we can classify something like DMT as a Psychescope, that is to say like a telescope or microscope, but a scope for viewing quantum neuronal activity in the psyche-something like that. I know for certain I have seen quantum time crystals-because they were present in childhood recurring dreams I had decades before I knew what DMT was. These time crystals are basically personal genetic memory amplituhedra...`,
detail: "Conversations had on X.",
  marginsTags: ["psychescope", "consciousness", "DMT", "science", "psychedelics"]
},
{
  id: "2024_06_16",
  type: "margins",
  title: "All Sense is the Specialization of the Sense of Touch",
  date: "2024-06-16",
  text: `
All senses are the specialization of the sense of touch. This is why psychedelics feel so real. In a sense, you finally know that you're touching light when you see it, and touching sound when you hear it. It's in the tactile experience.`,
  marginsTags: ["psychedelics", "consciousness"]
},
{
 id: "2022_10-05",
  type: "margins",
  title: "Death of Anti-Mormonism, (1945–2022)",
  date: "2022-10-05",
  text: `
Modern-day Anti-mormonism reached full postmodern novelty on January 24, 2022. This was confirmed on October 1, 2022 by Dieter F. Uchtdorf.

A new era is on the rise.`,
  marginsTags: ["ex-mormonism", "deconstruction", "postmodernism"]
},
{
  id: "2022_09_22_5",
  type: "margins",
  title: "DMT",
  date: "2022-09-24",
  text: `
DMT is not merely a Schedule I controlled substance that everyone carries around in them endogenously every moment of every day, it is a reality expander and psychescopic tool for exploring deeply personal and mutually entailed vast quantum worlds of which we cannot possibly conceive on our own.`,
detail: "Excerpts from The Quantum Moiré, 2022.",
  marginsTags: ["quantum-moiré", "DMT", "psychedelics", "consciousness", "science"]
},
{
  id: "2022-09-24",
  type: "margins",
  title: "New Term: Psychescope",
  year: 2022,
  date: "2022-09-24",
  allowHtml: true,
  text: `
    <h3>Psychescope:</h3>
    <p>1. The telescope and microscope for the psyche.</p>
    <p>2. An instrument, tool, technology, or methodology used to activate altered and/or expanded states of consciousness.</p>

    <h3>Psychescopic:</h3>
    <p>1. Visible only through a psychescope.</p>
    <p>2. Capable of viewing layered dimensional spectrums of transvisible light.</p>
  `,
  detail: "Term coined after many heavy DMT, LSD and DMSD experiences in summer of 2022.",
  marginsTags: ["quantum-moiré", "psychescope", "consciousness", "psychedelics", "theory"]
},
{
  id: "2022_09_22_3",
  type: "margins",
  title: "Point of Reference",
  date: "2022-09-24",
  text: `
There appears to be no distinct or significant point of reference in which to reside or from which to observe the universe because space, while out there, is actually all in your head, and time, while morphic in all places, is only a memory; thus spacetime is a peculiar mirage of insignificant individuation. This must be the same for the Earth. It is a significant liquid space marble with an individual reference point around an individual sun, but Earth, while it is out there in space, is only everything inside of its atmospheres.`,
detail: "Excerpts from The Quantum Moiré, 2022.",
  marginsTags: ["quantum-moiré", "cosmogony", "cosmology", "headless-way", "consciousness"]
},
{
  id: "2022_09_22_2",
  type: "margins",
  title: "What Neurons Do",
  date: "2022-09-24",
  text: `Simply stated, what neurons do is what the universe does and what the universe does is what neurons do... What neurons and DNA do is what atoms and photons do, and what atoms and photons do is what neurons and DNA do...

There is space, structure, taxonomy, morphology, and ecology; an entire ecosystem hidden behind this iridescently transvisible veil of contracted human perception. I believe this is the dark matter we seek to illuminate. It is out there as our mutually entangled[interwoven] spacial opposite, just as it is entirely and exactly here within us as our mutually entailed neural moiré; the Dark and Grey Matter Terrain of experience. `,
detail: "Excerpts from The Quantum Moiré, 2022.",
  marginsTags: ["quantum-moiré", "theory", "dark-matter", "DMT", "science", "consciousness"]
},
{
  id: "2022_09_22_1",
  type: "margins",
  title: "I think, therefore, I Quoth",
  date: "2022-09-24",
  text: `I think, therefore I am.
I am, therefore, I think.
Therefore, I think I am;
Wherefore, I am, I think...
I think I am, therefore, 
I am.
Quoth the human—[n]evermore.`,
detail: "Excerpts from The Quantum Moiré, 2022.",
  marginsTags: ["quantum-moiré", "consciousness"]
},
{
 id: "2022_09-14",
  type: "margins",
  title: "Meditation",
  date: "2022-09-14",
  text: `
Meditation is life's day-to-day anesthetic.`,
  marginsTags: ["meditation", "zazen", "consciousness"]
},
{
  id: "2022_08_02",
  type: "margins",
  title: "DMSD",
  date: "2022-08-02",
  text: `Dimitri in the Sky with Diamonds (DMSD) = The combination of LSD, with 20-40mg of DMT at first peak.`,
  detail: "DMSD journeys of summer and fall 2022.",
  marginsTags: ["psychedelics", "LSD", "DMT", "DMSD", "consciousness", "consciousness-research"]
},
{
  id: "2022_06_23",
  type: "margins",
  title: "The Straw, Steel, and Sage men",
  date: "2022-06-23",
  text: `The straw man has no brain
The steel man has no heart
The sage has neither—
For they make the world of straw and steel men
One muddled mind, treating them as children.`,
detail: "date unknown, likely 2022-ish X post.",
marginsTags: ["philosophy", "zazen", "consciousness"]
},
{
id: "2022_05_11",
  type: "margins",
  title: "Free Will v. Determinism",
  date: "2022-05-11",
  text: `
Regarding Free Will vs Determinism. I find that what we really have is a slightly wider array of functions any one person can inhabit depending on how they recall the world, and thus how they believe the world arises. Any one can inhabit the following forms of world recollection and belief—whether or not they are free to choose to inhabit one of these or not, is up to which one they recall:

Functional Determinism
Nonfunctional Determinism
Functional Nondeterminism
Nonfunctional Nondeterminism`,
detail: "TikTok and YouTube conversations of 2022.",
marginsTags: ["philosophy", "mormon-theology", "consciousness"]
},
{
id: "2022_01_17_3",
  type: "margins",
  title: "Deconstructing Deconstruction",
  date: "2022-01-17",
  text: `
Now, as far as deconstruction goes the first question one ought ask themselves is whether or not they have deconstructed deconstruction.`,
detail: "Excerpt from: The Epistle of Christopher, 2022.",
marginsTags: ["deconstruction", "philosophy", "epistle-of-christopher"]
},
{
 id: "2022_01_17_2",
  type: "margins",
  title: "Nonstruction",
  date: "2022-01-17",
  text: `
Many would say that the idea of there being nothing we can do to improve ourselves, our circumstances, or an institution such as the church is rather a depressing idea. For Latter-day Saints it’s a metaphorical homage to that foundation-less, and drifting great and spacious building; full of the sneers and jeers of those lost in a vast and misunderstood Deconstruction of their very foundation; lost for a meaning of who they are and where they stand, and why. It also harkens back to pre-existent days when Lucifer presented a plan he had envisioned where everyone would be saved and receive salvation because we would be forced to obey—nothing we could do—no gift of free agency. But you see, that plan in and of itself is a doing and a choice. Had we been sent to Earth under this plan it wouldn’t have been a plan of involuntary non-doing but rather a plan of voluntarily doing exactly what we voluntarily chose and set out to involuntarily complete.`,
detail: "Excerpt from: The Epistle of Christopher, 2022.",
marginsTags: ["deconstruction", "philosophy", "mormon-theology", "epistle-of-christopher"]
},
{
id: "2022_01_17_1",
  type: "margins",
  title: "Deconstruction is just a Moment",
  date: "2022-01-17",
  text: `
For example, (not discounting the corresponding turmoil), many individuals have no doubt found comfort and opened eyes in the empirical deconstruction of Letter to a CES Director. Revelations of church historical inaccuracies or outright deceptions is enough to get anyone’s tapir and leave, but it is another thing altogether to cleave to these revelations in the very same way one does their restored eternal family doctrine. In this way the status of Deconstruction becomes the goal rather than having understood and fully realized what it means to undergo this process—if you need undergo it at all. 

Deconstruction is just a step, and it’s not even a necessary step in certain regards, it’s just a step that most take and keep taking because it is most often the case that an individual needs to derive or find meaning and reason for all the seasons they spent playing and sharing the wrong instrument. Deconstruction should not be the story. Deconstruction should be a moment.

Deconstruction is just Self-Epistemology and it should be noted that just as with the battle over the natural man unto receiving the grace of God, the desire to Deconstruct your Latter-day faith unto the better understanding of it and your nature as a good and happy secular human, is in the same vain. Both pursuits are paths desiring universally worthwhile insights while simultaneously pursuing Self-contentment. Because deconstruction is just a form of construction and construction is just a form of deconstruction, and in this way they are both always reconstructions.`,
detail: "Excerpt from: The Epistle of Christopher, 2022.",
marginsTags: ["deconstruction", "philosophy", "epistle-of-christopher"]
},

/* ===================
       QUOTES
====================== */

{
  id: "AH1",
  type: "quotes",
  text: "There can only be genuine understanding where there is a genuine person.",
  author: "Roger T. Ames & David L. Hall",
  source: "Daodejing, A Philosophical Translation"
},
{
  id: "Harding1",
  type: "quotes",
  text: "We suffer because we overlook the fact that, at heart, we are alright.",
  author: "D.E. Harding",
  source: "The Science of the First Person"
},
{
  id: "Sondheim1",
  type: "quotes",
  text: `Content Dictates Form.
Less is More.
God is in the Details.
All in the service of — Clarity.`,
  author: "Stephen Sondheim",
  source: "Finishing the Hat: Collected Lyrics (1954–1981)."
},

/* ===================
     PHOTO EXAMPLE
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
    tags: ["trees", "night", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p> Dejá Vù </p>
  `
  },
{
    id: "2026-03-30",
    type: "photo",
    title: "March 30, 2026",
    year: 2026,
    date: "2026-03-30",
    image: "images/photography/2026/2026-03-30.webp",
    tags: ["nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>⚪️</p>
  `
  },
{
    id: "2026-03-26",
    type: "photo",
    title: "March 26, 2026",
    year: 2026,
    date: "2026-03-26",
    image: "images/photography/2026/2026-03-26.webp",
    tags: ["nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Mushrooms grown in the log of a dead cottonwood</p>
  `
  },
 {
    id: "2026-03-15",
    type: "photo",
    title: "March 15, 2026",
    year: 2026,
    date: "2026-03-15",
    image: "images/photography/2026/2026-03-15.webp",
    tags: [""],
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
    tags: ["trees", "sunset", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Cottonwood Sunset</p>
  `
  },
{
    id: "2026-02-18",
    type: "photo",
    title: "February 18, 2026",
    year: 2026,
    date: "2026-02-18",
    image: "images/photography/2026/2026-02-18.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Let's snow for a walk</p>
  `
  },
{
    id: "2026-02-16",
    type: "photo",
    title: "February 16, 2026",
    year: 2026,
    date: "2026-02-16",
    image: "images/photography/2026/2026-02-16.webp",
    tags: ["dogs", "trees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Malamute, Samsky</p>
  `
  },
{
    id: "2026-01-29",
    type: "photo",
    title: "January 29, 2026",
    year: 2026,
    date: "2026-01-29",
    image: "images/photography/2026/2026-01-29.webp",
    tags: ["trees", "night"],
      sideNoteTitle: "Crepuscular",
      sideNote: `
   <p>Cottonwood Dusk</p>
  `
  },
{
    id: "2026-01-01",
    type: "photo",
    title: "January 1, 2026",
    year: 2026,
    date: "2026-01-01",
    image: "images/photography/2026/2026-01-01.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  }, 
 {
    id: "2025-12-30",
    type: "photo",
    title: "December 30, 2025",
    year: 2025,
    date: "2025-12-30",
    image: "images/photography/2025/2025-12-30.webp",
    tags: ["lsd"],
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
    tags: ["bees"],
    sideNoteTitle: "Details",
    sideNote: `
   <p></p>
  `
  },
 {
    id: "2025-12-01",
    type: "photo",
    title: "December 1, 2025",
    year: 2025,
    date: "2025-12-01",
    image: "images/photography/2025/2025-12-01.webp",
    showOnArchive: false,
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-10-21",
    type: "photo",
    title: "October 21, 2025",
    year: 2025,
    date: "2025-10-21",
    image: "images/photography/2025/2025-10-21.webp",
    tags: ["night", "stars", "nature", "lsd"],
    sideNoteTitle: "Jovial Company",
  sideNote: `
    <p>I am sometimes associated with jovial company. JSH 1:28.</p>
  `
  },
  {
    id: "2025-09-07",
    type: "photo",
    title: "September 7, 2025",
    year: 2025,
    date: "2025-09-07",
    image: "images/photography/2025/2025-09-07.webp",
        tags: ["blur", "lsd", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
    id: "2025-08-15",
    type: "photo",
    title: "August 15, 2025",
    year: 2025,
    date: "2025-08-15",
    image: "images/photography/2025/2025-08-15.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2025-08-13",
    type: "photo",
    title: "August 13, 2025",
    year: 2025,
    date: "2025-08-13",
    image: "images/photography/2025/2025-08-13.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-07-30_5",
    type: "photo",
    title: "July 30, 2025 | #3",
    year: 2025,
    date: "2025-07-30",
    image: "images/photography/2025/2025-07-30_5.webp",
        tags: ["bees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-07-30_4",
    type: "photo",
    title: "July 30, 2025 | #2",
    year: 2025,
    date: "2025-07-30",
    image: "images/photography/2025/2025-07-30_4.webp",
        tags: ["bees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-07-30_1",
    type: "photo",
    title: "July 30, 2025 | #1",
    year: 2025,
    date: "2025-07-30",
    image: "images/photography/2025/2025-07-30_1.webp",
        tags: ["bees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2025-07-20",
    type: "photo",
    title: "July 20, 2025",
    year: 2025,
    date: "2025-07-20",
    image: "images/photography/2025/2025-07-20.webp",
    tags: ["bees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-07-13_3",
    type: "photo",
    title: "July 13, 2025 | #3",
    year: 2025,
    date: "2025-07-13",
    image: "images/photography/2025/2025-07-13_3.webp",
    tags: ["flowers", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-07-13_2",
    type: "photo",
    title: "July 13, 2025 | #2",
    year: 2025,
    date: "2025-07-13",
    image: "images/photography/2025/2025-07-13_2.webp",
    tags: ["flowers", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2025-07-13_1",
    type: "photo",
    title: "July 13, 2025 | #1",
    year: 2025,
    date: "2025-07-13",
    image: "images/photography/2025/2025-07-13_1.webp",
    tags: ["flowers", "night", "stars"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2025-04-23",
    type: "photo",
    title: "April 23, 2025",
    year: 2025,
    date: "2025-04-23",
    image: "images/photography/2025/2025-04-23.webp",
    tags: ["flowers", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2025-02-25",
    type: "photo",
    title: "February 25, 2025",
    year: 2025,
    date: "2025-02-25",
    image: "images/photography/2025/2025-02-25.webp",
    tags: ["trees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2025-02-24",
    type: "photo",
    title: "February 24, 2025",
    year: 2025,
    date: "2025-02-24",
    image: "images/photography/2025/2025-02-24.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
    id: "2025-02-13",
    type: "photo",
    title: "February 13, 2025",
    year: 2025,
    date: "2025-02-13",
    image: "images/photography/2025/2025-02-13.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2024-10-22",
    type: "photo",
    title: "October 22, 2024",
    year: 2024,
    date: "2024-10-22",
    image: "images/photography/2024/2024-10-22.webp",
        tags: ["stars", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2024-08-10",
    type: "photo",
    title: "August 10, 2024",
    year: 2024,
    date: "2024-08-10",
    image: "images/photography/2024/2024-08-10.webp",
        tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2024-07-14",
    type: "photo",
    title: "July 14, 2024",
    year: 2024,
    date: "2024-07-14",
    image: "images/photography/2024/2024-07-14.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Donut Falls</p>
  `
  },
  {
    id: "2024-05-11_5",
    type: "photo",
    title: "May 11, 2024 | #5",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_5.webp",
        tags: ["dogs", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2024-05-11_4",
    type: "photo",
    title: "May 11, 2024 | #4",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_4.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2024-05-11_3",
    type: "photo",
    title: "May 11, 2024 | #3",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_3.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2024-05-11_2",
    type: "photo",
    title: "May 11, 2024 | #2",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_2.webp",
        tags: ["nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2024-05-11_1",
    type: "photo",
    title: "May 11, 2024 | #1",
    year: 2024,
    date: "2024-05-11",
    image: "images/photography/2024/2024-05-11_1.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2024-04-02",
    type: "photo",
    title: "April 2, 2024",
    year: 2024,
    date: "2024-04-02",
    image: "images/photography/2024/2024-04-02.webp",
        tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2024-02-18_2",
    type: "photo",
    title: "February 18, 2024 | #2",
    year: 2024,
    date: "2024-02-18",
    image: "images/photography/2024/2024-02-18_2.webp",
    tags: ["trees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2024-02-18_1",
    type: "photo",
    title: "February 18, 2024 | #1",
    year: 2024,
    date: "2024-02-18",
    image: "images/photography/2024/2024-02-18_1.webp",
    tags: ["trees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2023-12-06_2",
    type: "photo",
    title: "December 6, 2023 | #2",
    year: 2023,
    date: "2023-12-06",
    image: "images/photography/2023/2023-12-06_2.webp",
        tags: ["blur", "lsd", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2023-12-06_1",
    type: "photo",
    title: "December 6, 2023 | #1",
    year: 2023,
    date: "2023-12-06",
    image: "images/photography/2023/2023-12-06_1.webp",
        tags: ["stars", "nature", "lsd"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
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
    tags: ["mushrooms"],
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
        tags: ["blur", "lsd"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2023-09-24",
    type: "photo",
    title: "September 24, 2023",
    year: 2023,
    date: "2023-09-24",
    image: "images/photography/2023/2023-09-24.webp",
    tags: ["trees", "nature", "stars", "sunset"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2023-07-29",
    type: "photo",
    title: "July 29, 2023",
    year: 2023,
    date: "2023-07-29",
    image: "images/photography/2023/2023-07-29.webp",
    tags: ["nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2023-06-17",
    type: "photo",
    title: "June 17, 2023",
    year: 2023,
    date: "2023-06-17",
    image: "images/photography/2023/2023-06-17.webp",
    tags: ["dmt"],
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
    tags: ["lsd"],
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
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Mountain House</p>
  `
  },
  {
    id: "2022-12-10",
    type: "photo",
    title: "December 10, 2022",
    year: 2022,
    date: "2022-12-10",
    image: "images/photography/2022/2022-12-10.webp",
        tags: ["lsd", "dmt", "mushrooms"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
    id: "2022-12-03",
    type: "photo",
    title: "December 3, 2022",
    year: 2022,
    date: "2022-12-03",
    image: "images/photography/2022/2022-12-03.webp",
        tags: ["dogs"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
    id: "2022-07-30",
    type: "photo",
    title: "July 30, 2022",
    year: 2022,
    date: "2022-07-30",
    image: "images/photography/2022/2022-07-30.webp",
    tags: [""],
    sideNoteTitle: "Details",
      sideNote: `An early morning cross-referencing the Dao.`
  },
  {
    id: "2022-06-07",
    type: "photo",
    title: "June 7, 2022",
    year: 2022,
    date: "2022-06-07",
    image: "images/photography/2022/2022-06-07.webp",
        tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2022-06-02",
    type: "photo",
    title: "June 2, 2022",
    year: 2022,
    date: "2022-06-02",
    image: "images/photography/2022/2022-06-02.webp",
       tags: ["nature", "trees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2021-12-15",
    type: "photo",
    title: "December 15, 2021",
    year: 2021,
    date: "2021-12-15",
    image: "images/photography/2021/2021-12-15.webp",
        tags: ["trees", "nature", "dogs"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2021-10-09",
    type: "photo",
    title: "October 9, 2021",
    year: 2021,
    date: "2021-10-09",
    image: "images/photography/2021/2021-10-09.webp",
       tags: ["cannabis", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Central Park?</p>
  `
  },
 {
    id: "2021-10-04_2",
    type: "photo",
    title: "October 4, 2021 | #2",
    year: 2021,
    date: "2021-10-04",
    image: "images/photography/2021/2021-10-04_2.webp",
    tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2021-10-04_1",
    type: "photo",
    title: "October 4, 2021 | #1",
    year: 2021,
    date: "2021-10-04",
    image: "images/photography/2021/2021-10-04_1.webp",
    tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2021-06-05_2",
    type: "photo",
    title: "June 5, 2021 | #2",
    year: 2021,
    date: "2021-06-05",
    image: "images/photography/2021/2021-06-05_2.webp",
        tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2021-06-05_1",
    type: "photo",
    title: "June 5, 2021 | #1",
    year: 2021,
    date: "2021-06-05",
    image: "images/photography/2021/2021-06-05_1.webp",
        tags: ["flowers", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2021-05-27",
    type: "photo",
    title: "May 27, 2021",
    year: 2021,
    date: "2021-05-27",
    image: "images/photography/2021/2021-05-27.webp",
       tags: ["flowers", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2020-11-11",
    type: "photo",
    title: "November 11, 2020",
    year: 2020,
    date: "2020-11-11",
    image: "images/photography/2020/2020-11-11.webp",
       tags: ["lsd", "dogs"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2020-11-04_2",
    type: "photo",
    title: "November 3, 2020 | #2",
    year: 2020,
    date: "2020-11-04",
    image: "images/photography/2020/2020-11-04_2.webp",
      tags: ["night", "trees", "stars", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2020-11-04_1",
    type: "photo",
    title: "November 4, 2020 | #1",
    year: 2020,
    date: "2020-11-04",
    image: "images/photography/2020/2020-11-04_1.webp",
      tags: ["night", "trees", "stars", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2020-11-03",
    type: "photo",
    title: "November 3, 2020",
    year: 2020,
    date: "2020-11-03",
    image: "images/photography/2020/2020-11-03.webp",
      tags: ["trees", "stars", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2020-06-30",
    type: "photo",
    title: "June 30, 2020",
    year: 2020,
    date: "2020-06-30",
    image: "images/photography/2020/2020-06-30.webp",
        tags: ["flowers", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2019-11-30",
    type: "photo",
    title: "November 30, 2019",
    year: 2019,
    date: "2019-11-30",
    image: "images/photography/2019/2019-11-30.webp",
        tags: ["nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2019-11-03",
    type: "photo",
    title: "November 3, 2019",
    year: 2019,
    date: "2019-11-03",
    image: "images/photography/2019/2019-11-03.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2019-09-30",
    type: "photo",
    title: "September 30, 2019",
    year: 2019,
    date: "2019-09-30",
    image: "images/photography/2019/2019-09-30.webp",
        tags: ["dogs"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
 {
    id: "2019-09-29_3",
    type: "photo",
    title: "September 29, 2019 | #3",
    year: 2019,
    date: "2019-09-29",
    image: "images/photography/2019/2019-09-29_3.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2019-09-29_2",
    type: "photo",
    title: "September 29, 2019 | #2",
    year: 2019,
    date: "2019-09-29",
    image: "images/photography/2019/2019-09-29_2.webp",
        tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
  {
    id: "2019-09-29_1",
    type: "photo",
    title: "September 29, 2019 | #1",
    year: 2019,
    date: "2019-09-29",
    image: "images/photography/2019/2019-09-29_1.webp",
         tags: ["trees", "nature"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
  id: "2019-07-18",
  type: "photo",
  title: "July 18, 2019",
  year: 2019,
  date: "2019-07-18",
  image: "images/photography/2019/2019-07-18.webp",
    tags: ["flowers"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
  {
    id: "2019-06-09",
    type: "photo",
    title: "June 9, 2019",
    year: 2019,
    date: "2019-06-09",
    image: "images/photography/2019/2019-06-09.webp",
    tags: [""],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
  id: "2019-03-03",
  type: "photo",
  title: "March 3, 2019",
  year: 2019,
  date: "2019-03-03",
  image: "images/photography/2019/2019-03-03.webp",
    tags: ["dogs"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2019-02-16",
  type: "photo",
  title: "February 16, 2019",
  year: 2019,
  date: "2019-02-16",
  image: "images/photography/2019/2019-02-16.webp",
    tags: ["dogs"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2018-11-29",
  type: "photo",
  title: "November 29, 2018",
  year: 2018,
  date: "2018-11-29",
  image: "images/photography/2018/2018-11-29.webp",
    tags: ["dogs", "night"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2018-08-14",
  type: "photo",
  title: "August 14, 2018",
  year: 2018,
  date: "2018-08-14",
  image: "images/photography/2018/2018-08-14.webp",
    tags: ["night", "stars"],
      sideNoteTitle: "Details",
      sideNote: `
   <p>Alignment witnessed on Newport Beach</p>
  `
},
  {
    id: "2017-08-25",
    type: "photo",
    title: "August 25, 2017",
    year: 2017,
    date: "2017-08-25",
    image: "images/photography/2017/2017-08-25.webp",
    tags: ["trees"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
  },
{
  id: "2016-12-20",
  type: "photo",
  title: "December 20, 2016",
  year: 2016,
  date: "2016-12-20",
  image: "images/photography/2016/2016-12-20.webp",
    tags: ["sunset"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2016-08-07",
  type: "photo",
  title: "August 7, 2016",
  year: 2016,
  date: "2016-08-07",
  image: "images/photography/2016/2016-08-07.webp",
    tags: ["sunset"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2015-02-13",
  type: "photo",
  title: "February 13, 2015",
  year: 2015,
  date: "2015-02-13",
  image: "images/photography/2015/2015-02-13.webp",
    tags: ["sunset"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2014-11-27",
  type: "photo",
  title: "November 27, 2014",
  year: 2014,
  date: "2014-11-27",
  image: "images/photography/2014/2014-11-27.webp",
    tags: ["sunset"],
      sideNoteTitle: "Details",
      sideNote: `
   <p></p>
  `
},
{
  id: "2014-10-25",
  type: "photo",
  title: "October 25, 2014",
  year: 2014,
  date: "2014-10-25",
  image: "images/photography/2014/2014-10-25.webp",
  tags: ["sunset"],
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
    title: "Moments in the Woulds",
    year: 2023,
    date: "2023-12-06",
    description: ""
  },
  {
    id: "anand",
    title: "An And",
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
