import * as adapter from '@astrojs/netlify/netlify-functions.js';
import { renderers } from './renderers.mjs';
import { manifest } from './manifest_bb5d6e82.mjs';

const _page0  = () => import('./chunks/generic_fbd4ab20.mjs');
const _page1  = () => import('./chunks/index_5d594c43.mjs');
const _page2  = () => import('./chunks/privacy-policy_8685e25b.mjs');
const _page3  = () => import('./chunks/sitemap_7bb7ac33.mjs');
const _page4  = () => import('./chunks/index_51b1377c.mjs');
const _page5  = () => import('./chunks/_tag__268ed6c2.mjs');
const _page6  = () => import('./chunks/_topic__ea7c1182.mjs');
const _page7  = () => import('./chunks/index_d2798a1a.mjs');
const _page8  = () => import('./chunks/newsletter_ec417232.mjs');
const _page9  = () => import('./chunks/login_58d32b2a.mjs');
const _page10  = () => import('./chunks/terms_2b533a28.mjs');
const _page11  = () => import('./chunks/index_811f8fbb.mjs');
const _page12  = () => import('./chunks/_.._1d97faaa.mjs');
const _page13  = () => import('./chunks/index_1eec1a8c.mjs');
const _page14  = () => import('./chunks/_tag__ee511bdf.mjs');
const _page15  = () => import('./chunks/404_2ab01036.mjs');
const _page16  = () => import('./chunks/newsletter-signup_c6ed8f4d.mjs');
const _page17  = () => import('./chunks/articles-list_5b51b77f.mjs');
const _page18  = () => import('./chunks/_id__4e3faf1d.mjs');
const _page19  = () => import('./chunks/list_fc2f3e44.mjs');
const _page20  = () => import('./chunks/login_4454a3b2.mjs');const pageMap = new Map([["node_modules/astro/dist/assets/endpoint/generic.js", _page0],["src/pages/index.astro", _page1],["src/pages/privacy-policy.astro", _page2],["src/pages/sitemap.xml.js", _page3],["src/pages/topics/index.astro", _page4],["src/pages/topics/[tag].astro", _page5],["src/pages/topics/[topic].astro", _page6],["src/pages/admin/index.astro", _page7],["src/pages/admin/newsletter.astro", _page8],["src/pages/admin/login.astro", _page9],["src/pages/terms.astro", _page10],["src/pages/blog/index.astro", _page11],["src/pages/blog/[...slug].astro", _page12],["src/pages/tags/index.astro", _page13],["src/pages/tags/[tag].astro", _page14],["src/pages/404.astro", _page15],["src/pages/api/newsletter-signup.js", _page16],["src/pages/api/articles-list.js", _page17],["src/pages/api/articles/[id].js", _page18],["src/pages/api/media/list.js", _page19],["src/pages/api/auth/login.js", _page20]]);
const _manifest = Object.assign(manifest, {
	pageMap,
	renderers,
});
const _args = {};

const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler, pageMap };
