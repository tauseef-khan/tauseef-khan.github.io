import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './chunks/astro_64aL7IGX.mjs';
import 'clsx';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

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
  return (params) => {
    const path = toPath(params);
    return path || "/";
  };
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
    }),
    isIndex: rawRouteData.isIndex
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
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"about/about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about/about","isIndex":false,"type":"page","pattern":"^\\/about\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}],[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about/about.md","pathname":"/about/about","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"blogs/home-mmouzo/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blogs/home-mmouzo","isIndex":false,"type":"page","pattern":"^\\/blogs\\/home-mmouzo\\/?$","segments":[[{"content":"blogs","dynamic":false,"spread":false}],[{"content":"home-mmouzo","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blogs/home-mmouzo.md","pathname":"/blogs/home-mmouzo","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"certificates/backend2022/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/certificates/backend2022","isIndex":false,"type":"page","pattern":"^\\/certificates\\/backend2022\\/?$","segments":[[{"content":"certificates","dynamic":false,"spread":false}],[{"content":"backend2022","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/certificates/backend2022.md","pathname":"/certificates/backend2022","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"contact/github/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact/github","isIndex":false,"type":"page","pattern":"^\\/contact\\/github\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}],[{"content":"github","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact/github.md","pathname":"/contact/github","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"contact/linkedin/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact/linkedin","isIndex":false,"type":"page","pattern":"^\\/contact\\/linkedin\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}],[{"content":"linkedin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact/linkedin.md","pathname":"/contact/linkedin","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"projects/spotfilm/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/projects/spotfilm","isIndex":false,"type":"page","pattern":"^\\/projects\\/spotfilm\\/?$","segments":[[{"content":"projects","dynamic":false,"spread":false}],[{"content":"spotfilm","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/spotfilm.md","pathname":"/projects/spotfilm","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"studies/studie1/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/studies/studie1","isIndex":false,"type":"page","pattern":"^\\/studies\\/studie1\\/?$","segments":[[{"content":"studies","dynamic":false,"spread":false}],[{"content":"studie1","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/studies/studie1.md","pathname":"/studies/studie1","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"studies/studie2/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/studies/studie2","isIndex":false,"type":"page","pattern":"^\\/studies\\/studie2\\/?$","segments":[[{"content":"studies","dynamic":false,"spread":false}],[{"content":"studie2","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/studies/studie2.md","pathname":"/studies/studie2","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"works/work1/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works/work1","isIndex":false,"type":"page","pattern":"^\\/works\\/work1\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}],[{"content":"work1","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works/work1.md","pathname":"/works/work1","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"works/work2/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works/work2","isIndex":false,"type":"page","pattern":"^\\/works\\/work2\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}],[{"content":"work2","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works/work2.md","pathname":"/works/work2","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"works/work3/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works/work3","isIndex":false,"type":"page","pattern":"^\\/works\\/work3\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}],[{"content":"work3","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works/work3.md","pathname":"/works/work3","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"works/work4/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/works/work4","isIndex":false,"type":"page","pattern":"^\\/works\\/work4\\/?$","segments":[[{"content":"works","dynamic":false,"spread":false}],[{"content":"work4","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/works/work4.md","pathname":"/works/work4","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://tauseefkhan.xyz","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/Documents/Repos/Personal/tauseef-khan.github.io/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_8Pc8znJ3.mjs","\u0000@astrojs-manifest":"manifest_JAp7oqeC.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_B9ab-UK1.mjs","\u0000@astro-page:src/pages/about/about@_@md":"chunks/about_CFSz8OUk.mjs","\u0000@astro-page:src/pages/blogs/home-mmouzo@_@md":"chunks/home-mmouzo_CPWi7nPz.mjs","\u0000@astro-page:src/pages/certificates/backend2022@_@md":"chunks/backend2022_CIe1b4By.mjs","\u0000@astro-page:src/pages/contact/github@_@md":"chunks/github_z54yTSMD.mjs","\u0000@astro-page:src/pages/contact/linkedin@_@md":"chunks/linkedin_Cl7MTW-J.mjs","\u0000@astro-page:src/pages/projects/spotfilm@_@md":"chunks/spotfilm_BXJa9py2.mjs","\u0000@astro-page:src/pages/studies/studie1@_@md":"chunks/studie1_DGfk2l0t.mjs","\u0000@astro-page:src/pages/studies/studie2@_@md":"chunks/studie2_ufjtMOs2.mjs","\u0000@astro-page:src/pages/works/work1@_@md":"chunks/work1_B48XaQkJ.mjs","\u0000@astro-page:src/pages/works/work2@_@md":"chunks/work2_BY-TIMLP.mjs","\u0000@astro-page:src/pages/works/work3@_@md":"chunks/work3_BY6Cdn_C.mjs","\u0000@astro-page:src/pages/works/work4@_@md":"chunks/work4_wWx__9WX.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_BYr3V_Fl.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.yzwUO3MD.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/dm-sans-latin-wght-normal.DeBecvsH.woff2","/_astro/dm-sans-latin-ext-wght-normal.D1bw2c55.woff2","/_astro/about.xcUlBJkn.css","/CNAME","/favicon.webp","/gl_flag_128x.png","/profile.webp","/snap-items.png","/snap-md.png","/snap_laptop.webp","/snap_mobile.webp","/snap_project.webp","/about/about/index.html","/blogs/home-mmouzo/index.html","/certificates/backend2022/index.html","/contact/github/index.html","/contact/linkedin/index.html","/projects/spotfilm/index.html","/studies/studie1/index.html","/studies/studie2/index.html","/works/work1/index.html","/works/work2/index.html","/works/work3/index.html","/works/work4/index.html","/index.html"],"buildFormat":"directory"});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
