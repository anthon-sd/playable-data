import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'string-width';
import 'mime';
import './chunks/astro_345be169.mjs';
import 'clsx';
import { compile } from 'path-to-regexp';

if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}

new TextEncoder();

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    })
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"privacy-policy/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/privacy-policy","type":"page","pattern":"^\\/privacy-policy\\/?$","segments":[[{"content":"privacy-policy","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/privacy-policy.astro","pathname":"/privacy-policy","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"sitemap.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/sitemap.xml","type":"endpoint","pattern":"^\\/sitemap\\.xml$","segments":[[{"content":"sitemap.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sitemap.xml.js","pathname":"/sitemap.xml","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"topics/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/topics","type":"page","pattern":"^\\/topics\\/?$","segments":[[{"content":"topics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/topics/index.astro","pathname":"/topics","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"admin/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin","type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"admin/newsletter/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/newsletter","type":"page","pattern":"^\\/admin\\/newsletter\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"newsletter","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/newsletter.astro","pathname":"/admin/newsletter","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"admin/login/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/login","type":"page","pattern":"^\\/admin\\/login\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/login.astro","pathname":"/admin/login","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"terms/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/terms","type":"page","pattern":"^\\/terms\\/?$","segments":[[{"content":"terms","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/terms.astro","pathname":"/terms","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"tags/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tags","type":"page","pattern":"^\\/tags\\/?$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/articles-list","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/articles-list","type":"endpoint","pattern":"^\\/api\\/articles-list$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"articles-list","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/articles-list.js","pathname":"/api/articles-list","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/media/list","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/media/list","type":"endpoint","pattern":"^\\/api\\/media\\/list$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"media","dynamic":false,"spread":false}],[{"content":"list","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/media/list.js","pathname":"/api/media/list","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/newsletter-signup","type":"endpoint","pattern":"^\\/api\\/newsletter-signup$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"newsletter-signup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/newsletter-signup.js","pathname":"/api/newsletter-signup","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/login","type":"endpoint","pattern":"^\\/api\\/auth\\/login$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/login.js","pathname":"/api/auth/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://playabledata.io","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/admin/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/admin/newsletter.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/blog/[...slug].astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/404.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/admin/login.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/blog/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/privacy-policy.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/tags/[tag].astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/tags/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/terms.astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/topics/[tag].astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/topics/[topic].astro",{"propagation":"none","containsHead":true}],["C:/Users/antho/OneDrive/Documents/GitHub/playable-data-master/src/pages/topics/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var r=(i,c,s)=>{let n=async()=>{await(await i())()},t=new IntersectionObserver(e=>{for(let o of e)if(o.isIntersecting){t.disconnect(),n();break}});for(let e of s.children)t.observe(e)};(self.Astro||(self.Astro={})).visible=r;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000empty-middleware":"_empty-middleware.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_20668620.mjs","/src/pages/api/newsletter-signup.js":"chunks/pages/newsletter-signup_0d0a7c89.mjs","\u0000@astrojs-manifest":"manifest_bb5d6e82.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_fbd4ab20.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_5d594c43.mjs","\u0000@astro-page:src/pages/privacy-policy@_@astro":"chunks/privacy-policy_8685e25b.mjs","\u0000@astro-page:src/pages/sitemap.xml@_@js":"chunks/sitemap_7bb7ac33.mjs","\u0000@astro-page:src/pages/topics/index@_@astro":"chunks/index_51b1377c.mjs","\u0000@astro-page:src/pages/topics/[tag]@_@astro":"chunks/_tag__268ed6c2.mjs","\u0000@astro-page:src/pages/topics/[topic]@_@astro":"chunks/_topic__ea7c1182.mjs","\u0000@astro-page:src/pages/admin/index@_@astro":"chunks/index_d2798a1a.mjs","\u0000@astro-page:src/pages/admin/newsletter@_@astro":"chunks/newsletter_ec417232.mjs","\u0000@astro-page:src/pages/admin/login@_@astro":"chunks/login_58d32b2a.mjs","\u0000@astro-page:src/pages/terms@_@astro":"chunks/terms_2b533a28.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"chunks/index_811f8fbb.mjs","\u0000@astro-page:src/pages/blog/[...slug]@_@astro":"chunks/_.._1d97faaa.mjs","\u0000@astro-page:src/pages/tags/index@_@astro":"chunks/index_1eec1a8c.mjs","\u0000@astro-page:src/pages/tags/[tag]@_@astro":"chunks/_tag__ee511bdf.mjs","\u0000@astro-page:src/pages/404@_@astro":"chunks/404_2ab01036.mjs","\u0000@astro-page:src/pages/api/newsletter-signup@_@js":"chunks/newsletter-signup_c6ed8f4d.mjs","\u0000@astro-page:src/pages/api/articles-list@_@js":"chunks/articles-list_5b51b77f.mjs","\u0000@astro-page:src/pages/api/articles/[id]@_@js":"chunks/_id__4e3faf1d.mjs","\u0000@astro-page:src/pages/api/media/list@_@js":"chunks/list_fc2f3e44.mjs","\u0000@astro-page:src/pages/api/auth/login@_@js":"chunks/login_4454a3b2.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.b191030b.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/index.e0b03a86.css","/_astro/index.f5f36de9.css","/favicon.png","/favicon.svg","/robots.txt","/admin/styles.css","/images/default-avatar.svg","/images/logo.png","/index.html","/privacy-policy/index.html","/sitemap.xml","/topics/index.html","/admin/index.html","/admin/newsletter/index.html","/admin/login/index.html","/terms/index.html","/blog/index.html","/tags/index.html","/404.html","/api/articles-list","/api/media/list"]});

export { manifest };
