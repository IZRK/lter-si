import { readFile } from "node:fs/promises";

const readJson = async (relativePath, fallback = {}) => {
  try {
    return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};

const metadata = {
  about: {
    title: "eLTER ESFRI",
    excerpt: "Evropska raziskovalna infrastruktura, ki povezuje dolgoročne raziskave ekosistemov, kritičnih con in družbeno-ekoloških sistemov."
  },
  events: {
    title: "Dogodki",
    excerpt: "Srečanja, konference, forumi in spletni seminarji eLTER med letoma 2018 in 2025."
  },
  "elter-h2020": {
    title: "eLTER H2020",
    excerpt: "Projekt eLTER H2020 in njegov prispevek k porazdeljeni evropski infrastrukturi za ekosistemske raziskave."
  },
  "elter-plus": {
    title: "eLTER PLUS",
    excerpt: "Projekt eLTER PLUS, ki krepi celostne raziskave sistemov na evropskih območjih in platformah."
  },
  "elter-ppp": {
    title: "eLTER PPP",
    excerpt: "Projekt pripravljalne faze eLTER za vzpostavitev trajnostne evropske raziskovalne infrastrukture."
  },
  media: {
    title: "Mediji",
    excerpt: "Filmi in zgodbe s terena o raziskavah v mreži LTER Slovenija."
  },
  publications: {
    title: "Publikacije",
    excerpt: "Raziskave, konferenčni prispevki in drugi rezultati mreže LTER Slovenija med letoma 2019 in 2026."
  },
  report: {
    title: "Poročilo",
    excerpt: "Preberite ali prenesite poročilo o raziskovalnem obisku eLTER v okviru transnacionalnega in oddaljenega dostopa leta 2019."
  },
  sites: {
    title: "Raziskovalna območja",
    excerpt: "Spoznajte 16 slovenskih območij dolgoročnih ekosistemskih raziskav v jamah, gozdovih, jezerih in Jadranskem morju."
  },
  testimonials: {
    title: "Izkušnja raziskovalke",
    excerpt: "Osebni pogled udeleženke na terensko delo, sodelovanje in raziskovanje krasa med obiskom eLTER v Sloveniji."
  }
};

const slugKeys = {
  about: "about", consortium: "consortium", contact: "contact",
  "elter-h2020": "elterH2020", "elter-plus": "elterPlus", "elter-ppp": "elterPpp",
  events: "events", "karst-research-at-lter-slovenia-sites": "karstResearchAtLterSloveniaSites",
  "lter-slovenia": "lterSlovenia", media: "media", "news-events": "newsEvents",
  projects: "projects", publications: "publications", report: "report", "report-2": "report2",
  research: "research", sites: "sites", "sites-2": "sites2", "ta-ra-2017": "taRa2017",
  "ta-ra-2019": "taRa2019", "ta-ra-access-scheme": "taRaAccessScheme",
  testimonials: "testimonials", "testimonials-2": "testimonials2"
};

const localizeHtml = (html = "") => html
  .replace(/href=(['"])\/(?!\/|assets\/|sl\/)/gi, "href=$1/sl/")
  .replace(/alt="([^"]+) project graphic"/gi, 'alt="Grafika projekta $1"')
  .replace('alt="eLTER Research Infrastructure overview"', 'alt="Pregled raziskovalne infrastrukture eLTER"')
  .replace(
    'alt="Dr. Ioana Nae in front of the Karst Research Institute ZRC SAZU"',
    'alt="Dr. Ioana Nae pred Inštitutom za raziskovanje krasa ZRC SAZU"'
  )
  .replaceAll("LTER-Slovenija", "LTER Slovenija")
  .replaceAll("socioekološke", "družbeno-ekološke")
  .replaceAll("multi- in interdisciplinarne", "več- in interdisciplinarne")
  .replace("Mreža LTER Slovenija je bila", "Omrežje LTER Slovenija je bilo")
  .replace("Omrežje LTER Slovenija je bilo ustanovljena", "Omrežje LTER Slovenija je bilo ustanovljeno")
  .replace("ko je postala tudi članica", "ko je postalo tudi član")
  .replace(
    "Omrežje LTER Slovenija je bilo ustanovljeno leta 2003, ko je postalo tudi član ILTER in LTER Europe.",
    "Omrežje LTER Slovenija je bilo ustanovljeno leta 2003 in se je takrat pridružilo omrežjema ILTER in LTER Europe."
  )
  .replaceAll("več- in interdisciplinarne", "multidisciplinarne in interdisciplinarne")
  .replaceAll("nacionalni muzej", "prirodoslovni muzej")
  .replaceAll("mreže lokacij ILTER", "omrežja raziskovalnih območij ILTER")
  .replaceAll(
    "v okviru nove mobilnosti eLTER za transnacionalni in oddaljeni dostop",
    "v okviru novega programa mobilnosti eLTER za nadnacionalni in oddaljeni dostop"
  )
  .replaceAll("sistema mobilnosti eLTER", "programa mobilnosti eLTER")
  .replaceAll("transnacionalni in oddaljeni dostop", "nadnacionalni in oddaljeni dostop")
  .replace("inštitutu, ki ga je odprl Emil Racovitza", "inštitutu, ki ga je ustanovil Emil Racovitza")
  .replace("se podali v najgloblji kanjon v Evropi, Škocjan&#8221;.", "se podali v Škocjanske jame, kjer je najgloblji podzemni kanjon v Evropi.&#8221;")
  .replaceAll("dve lokaciji eLTER", "dve območji eLTER")
  .replaceAll("svetovno izjemna lokacija", "svetovno izjemno območje")
  .replaceAll("Obe lokaciji", "Obe območji")
  .replaceAll("EU HORIZON 2020", "EU Obzorje 2020")
  .replaceAll("Raziskovanje krasa na lokacijah LTER Slovenija", "Raziskovanje krasa na območjih LTER Slovenija")
  .replaceAll("&#8220;", "»")
  .replaceAll("&#8221;", "«");

export default async function () {
  const source = await readJson("./sourceContent.json", []);
  const [pagesA, pagesB, eventsPage, locale] = await Promise.all([
    readJson("./slPagesA.json"),
    readJson("./slPagesB.json"),
    readJson("./slEvents.json"),
    readJson("./slLocaleDraft.json")
  ]);
  const translations = { ...pagesA, ...pagesB, events: eventsPage };

  return source.map((item) => {
    const translated = translations[item.slug] || metadata[item.slug] || {};
    const localeKey = slugKeys[item.slug];
    const originalRoute = item.route;
    const route = originalRoute === "/" ? "/sl/" : `/sl${originalRoute}`;
    return {
      ...item,
      ...translated,
      title: locale.pageTitles?.[localeKey] || translated.title || metadata[item.slug]?.title || item.title,
      excerpt: locale.pageDescriptions?.[localeKey] || translated.excerpt || metadata[item.slug]?.excerpt || item.excerpt,
      // Untranslated fallbacks are official citations, event titles or empty
      // source bodies; substantive prose is supplied by the translation files.
      content: localizeHtml(translated.content ?? item.content),
      langCode: "sl",
      originalRoute,
      route,
      translationRoute: originalRoute
    };
  });
}
