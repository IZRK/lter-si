import { HtmlBasePlugin } from "@11ty/eleventy";
import { readFileSync } from "node:fs";

const slLocale = JSON.parse(readFileSync(new URL("./src/_data/slLocaleDraft.json", import.meta.url), "utf8"));
const getTranslation = (key = "") => key
  .split(".")
  .filter(Boolean)
  .reduce((value, part) => value?.[part], slLocale);

const normalizePrefix = (value = "/") => {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
};

export default function (eleventyConfig) {
  const configuredSiteUrl = process.env.SITE_URL;
  const sitePath = configuredSiteUrl ? new URL(configuredSiteUrl).pathname : "/";
  const pathPrefix = normalizePrefix(process.env.PATH_PREFIX ?? sitePath);

  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // HtmlBasePlugin rewrites every root-relative URL, including imported HTML.
  // Keep template URLs root-relative so they are prefixed exactly once.
  eleventyConfig.addFilter("url", (value = "") => value);
  eleventyConfig.addFilter("localeUrl", (value = "", langCode = "en") => {
    const url = String(value);
    if (langCode !== "sl" || !url.startsWith("/") || url.startsWith("/sl/")) return url;
    return url === "/" ? "/sl/" : `/sl${url}`;
  });

  eleventyConfig.addFilter("withBase", (html = "") => {
    if (pathPrefix === "/") return html;
    const prefix = pathPrefix.replace(/\/$/, "");
    return String(html)
      .replace(/(href|src|data|poster)=(['"])\/(?!\/)/g, `$1=$2${prefix}/`)
      .replace(/url\((['"]?)\/(?!\/)/g, `url($1${prefix}/`);
  });

  eleventyConfig.addFilter("privacyEmbed", (html = "") => String(html)
    .replaceAll("https://www.youtube.com/embed/", "https://www.youtube-nocookie.com/embed/"));

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("t", (fallback = "", langCode = "en", key = "") => (
    langCode === "sl" ? getTranslation(key) ?? fallback : fallback
  ));
  eleventyConfig.addFilter("absoluteUrl", (value = "/", base = "https://lter.zrc-sazu.si") => {
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return new URL(String(value).replace(/^\/+/, ""), normalizedBase).href;
  });
  eleventyConfig.addFilter("readableDate", (value, langCode = "en") => {
    if (!value) return "";
    return new Intl.DateTimeFormat(langCode === "sl" ? "sl-SI" : "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(value));
  });
  eleventyConfig.addFilter("year", (value) => new Date(value).getUTCFullYear());
  eleventyConfig.addFilter("externalUrl", (value = "") => /^https?:\/\//.test(value));

  eleventyConfig.addShortcode("icon", (name, className = "") => {
    const icons = {
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      chevron: '<path d="m6 9 6 6 6-6"/>',
      close: '<path d="M18 6 6 18M6 6l12 12"/>',
      external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
      leaf: '<path d="M20.8 3.2C13.4 3.3 7.6 5.7 5 10.4c-1.7 3.2-.7 6.4 1.8 8.1 2.5 1.6 5.8 1.1 7.6-1.5 2.7-3.9 2.6-8.1 6.4-13.8Z"/><path d="M4 21c2.1-5.8 6.1-9.5 11.6-11.8"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
      map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      microscope: '<path d="m6 18 3-3M10 14l4 4M9 3l6 6-4 4-6-6 4-4ZM13 21h8M17 17a4 4 0 0 1-4 4H7"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'
    };
    const paths = icons[name] || icons.arrow;
    return `<svg class="icon ${className}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  });

  return {
    pathPrefix,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
