import { readFileSync } from "node:fs";
import site from "./site.js";

const sl = JSON.parse(readFileSync(new URL("./slLocaleDraft.json", import.meta.url), "utf8"));
const n = sl.navigation.items;
const withSl = (url) => (url === "/" ? "/sl/" : `/sl${url}`);

const slugKeys = {
  about: "about",
  consortium: "consortium",
  contact: "contact",
  "elter-h2020": "elterH2020",
  "elter-plus": "elterPlus",
  "elter-ppp": "elterPpp",
  events: "events",
  "karst-research-at-lter-slovenia-sites": "karstResearchAtLterSloveniaSites",
  "lter-slovenia": "lterSlovenia",
  media: "media",
  "news-events": "newsEvents",
  projects: "projects",
  publications: "publications",
  report: "report",
  "report-2": "report2",
  research: "research",
  sites: "sites",
  "sites-2": "sites2",
  "ta-ra-2017": "taRa2017",
  "ta-ra-2019": "taRa2019",
  "ta-ra-access-scheme": "taRaAccessScheme",
  testimonials: "testimonials",
  "testimonials-2": "testimonials2"
};

const mapBySlug = (values) => Object.fromEntries(
  Object.entries(slugKeys).map(([slug, key]) => [slug, values[key]])
);

const slNavigation = [
  {
    label: n.about,
    items: [
      { label: n.lterSlovenia, url: withSl("/lter-slovenia/") },
      { label: n.elterEsfri, url: withSl("/about/") },
      { label: n.consortium, url: withSl("/consortium/") }
    ]
  },
  { label: n.sites, url: withSl("/sites-2/") },
  {
    label: n.research,
    items: [
      { label: n.research, url: withSl("/research/") },
      { label: n.publications, url: withSl("/publications/") },
      { label: n.projects, url: withSl("/projects/") }
    ]
  },
  {
    label: n.access,
    items: [
      { label: n.taRaAccessScheme, url: withSl("/ta-ra-access-scheme/") },
      { label: n.visit2017, url: withSl("/ta-ra-2017/") },
      { label: n.visit2019, url: withSl("/ta-ra-2019/") },
      { label: n.testimonial, url: withSl("/ta-ra-2019/testimonials-2/") },
      { label: n.report2019, url: withSl("/report-2/") }
    ]
  },
  {
    label: n.news,
    items: [
      { label: n.news, url: withSl("/news-events/") },
      { label: n.events, url: withSl("/events/") },
      { label: n.media, url: withSl("/media/") }
    ]
  },
  { label: n.contact, url: withSl("/contact/") }
];

const slSite = {
  ...site,
  name: sl.meta.siteName,
  fullName: sl.meta.fullName,
  description: sl.meta.siteDescription,
  lang: sl.meta.lang,
  locale: sl.meta.locale,
  alternateLocale: site.locale,
  metaTitleSuffix: sl.meta.metaTitleSuffix,
  defaultImageAlt: sl.meta.defaultImageAlt,
  navigation: slNavigation,
  pageDescriptions: mapBySlug(sl.pageDescriptions),
  sectionBySlug: mapBySlug(sl.sectionNames),
  pageTitles: mapBySlug(sl.pageTitles),
  contact: {
    ...site.contact,
    name: "dr. Tanja Pipan",
    role: sl.pages.contact.representativeRole,
    institute: sl.pages.contact.institute
  },
  organizationSchema: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: sl.meta.siteName,
    alternateName: sl.meta.fullName,
    url: site.url,
    logo: `${site.url}/assets/media/2022/03/2869-1024-Slovenia.png`,
    email: site.contact.email,
    telephone: site.contact.phone,
    parentOrganization: {
      "@type": "ResearchOrganization",
      name: "Znanstvenoraziskovalni center Slovenske akademije znanosti in umetnosti",
      url: "https://www.zrc-sazu.si/"
    },
    sameAs: [site.contact.social]
  })
};

export default {
  en: {
    ...site,
    alternateLocale: sl.meta.locale,
    metaTitleSuffix: "Long-term ecosystem research"
  },
  sl: slSite
};
