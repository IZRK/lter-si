import { readFile } from "node:fs/promises";
import loadSlContent from "./slContent.js";

const aliasTargets = {
  report: "/report-2/",
  sites: "/sites-2/",
  testimonials: "/ta-ra-2019/testimonials-2/"
};

const englishTitles = {
  "lter-slovenia": "About LTER Slovenia",
  "report-2": "2019 TA–RA activity report",
  "sites-2": "LTER Slovenia research sites",
  "testimonials-2": "A researcher’s perspective"
};

export default async function () {
  const sourceUrl = new URL("./sourceContent.json", import.meta.url);
  const source = JSON.parse(await readFile(sourceUrl, "utf8"));
  const slContent = await loadSlContent();
  const englishPages = source
    .filter((item) => item.route !== "/")
    .map((item) => ({
      ...item,
      title: englishTitles[item.slug] || item.title,
      langCode: "en",
      originalRoute: item.route,
      translationRoute: `/sl${item.route}`,
      englishPath: item.route,
      slovenianPath: `/sl${item.route}`,
      canonicalPath: aliasTargets[item.slug] || item.route,
      robots: aliasTargets[item.slug] ? "noindex, follow" : ""
    }));
  const slovenianPages = slContent
    .filter((item) => item.originalRoute !== "/")
    .map((item) => ({
      ...item,
      englishPath: item.originalRoute,
      slovenianPath: item.route,
      canonicalPath: aliasTargets[item.slug] ? `/sl${aliasTargets[item.slug]}` : item.route,
      robots: aliasTargets[item.slug] ? "noindex, follow" : ""
    }));
  return [...englishPages, ...slovenianPages];
}
