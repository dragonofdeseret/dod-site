import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_B4MP3gNX.mjs';
import { manifest } from './manifest_CnSMUEjk.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/api/delete.astro.mjs');
const _page2 = () => import('./pages/admin/api/save.astro.mjs');
const _page3 = () => import('./pages/admin/auth-callback.astro.mjs');
const _page4 = () => import('./pages/admin/login.astro.mjs');
const _page5 = () => import('./pages/admin/sign-out.astro.mjs');
const _page6 = () => import('./pages/admin/_collection_/_id_.astro.mjs');
const _page7 = () => import('./pages/admin/_collection_.astro.mjs');
const _page8 = () => import('./pages/admin.astro.mjs');
const _page9 = () => import('./pages/altered-states/_id_.astro.mjs');
const _page10 = () => import('./pages/altered-states.astro.mjs');
const _page11 = () => import('./pages/archive.astro.mjs');
const _page12 = () => import('./pages/art/_id_.astro.mjs');
const _page13 = () => import('./pages/art.astro.mjs');
const _page14 = () => import('./pages/bio.astro.mjs');
const _page15 = () => import('./pages/exhibits.astro.mjs');
const _page16 = () => import('./pages/margins.astro.mjs');
const _page17 = () => import('./pages/now.astro.mjs');
const _page18 = () => import('./pages/photography/_id_.astro.mjs');
const _page19 = () => import('./pages/photography.astro.mjs');
const _page20 = () => import('./pages/questions.astro.mjs');
const _page21 = () => import('./pages/quotes.astro.mjs');
const _page22 = () => import('./pages/writing/_id_.astro.mjs');
const _page23 = () => import('./pages/writing.astro.mjs');
const _page24 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/api/delete.ts", _page1],
    ["src/pages/admin/api/save.ts", _page2],
    ["src/pages/admin/auth-callback.astro", _page3],
    ["src/pages/admin/login.astro", _page4],
    ["src/pages/admin/sign-out.ts", _page5],
    ["src/pages/admin/[collection]/[id].astro", _page6],
    ["src/pages/admin/[collection]/index.astro", _page7],
    ["src/pages/admin/index.astro", _page8],
    ["src/pages/altered-states/[id].astro", _page9],
    ["src/pages/altered-states/index.astro", _page10],
    ["src/pages/archive.astro", _page11],
    ["src/pages/art/[id].astro", _page12],
    ["src/pages/art.astro", _page13],
    ["src/pages/bio.astro", _page14],
    ["src/pages/exhibits.astro", _page15],
    ["src/pages/margins.astro", _page16],
    ["src/pages/now.astro", _page17],
    ["src/pages/photography/[id].astro", _page18],
    ["src/pages/photography.astro", _page19],
    ["src/pages/questions.astro", _page20],
    ["src/pages/quotes.astro", _page21],
    ["src/pages/writing/[id].astro", _page22],
    ["src/pages/writing.astro", _page23],
    ["src/pages/index.astro", _page24]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "2ea151fc-b640-4797-bb03-8df2f6d7b628",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
