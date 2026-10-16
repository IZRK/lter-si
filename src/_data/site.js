const siteUrl = (process.env.SITE_URL || "https://lter.zrc-sazu.si").replace(/\/$/, "");

const pageDescriptions = {
  about: "The European research infrastructure connecting long-term ecosystem, critical zone and socio-ecological research.",
  consortium: "Nine Slovenian research, education and conservation partners working together across ecosystems and disciplines.",
  contact: "Contact the national representative and coordinating institute for LTER Slovenia.",
  "elter-h2020": "The eLTER H2020 project and its contribution to a distributed European ecosystem research infrastructure.",
  "elter-plus": "The eLTER PLUS project, strengthening whole-system research across European sites and platforms.",
  "elter-ppp": "The eLTER Preparatory Phase Project for a sustainable European research infrastructure.",
  events: "An archive of eLTER meetings, conferences, forums and webinars from 2018 to 2025.",
  "karst-research-at-lter-slovenia-sites": "How long-term research at Postojna–Planina and Škocjan Caves helps understand and protect vulnerable karst systems.",
  "lter-slovenia": "A national network founded in 2003, connecting 16 long-term research sites and nine partner institutions.",
  media: "Films and field stories from research across the LTER Slovenia network.",
  "news-events": "Selected updates from the European and international long-term ecosystem research community.",
  projects: "European projects supporting the development of long-term ecosystem research infrastructure.",
  publications: "Research, conference contributions and other outputs from the LTER Slovenia network, 2019–2026.",
  report: "Read or download the report from the 2019 eLTER Transnational and Remote Access research visit.",
  "report-2": "Download or read the report from the 2019 eLTER Transnational and Remote Access research visit.",
  research: "Current and completed research connected to hydrology, forested karst aquifers and long-term ecosystem observation.",
  sites: "Explore 16 Slovenian long-term ecosystem research sites across caves, forests, lakes and the Adriatic Sea.",
  "sites-2": "Explore 16 Slovenian long-term ecosystem research sites, from caves and forests to lakes and the Adriatic Sea.",
  "ta-ra-2017": "The 2017 eLTER Transnational and Remote Access research visit hosted by the Karst Research Institute ZRC SAZU.",
  "ta-ra-2019": "A 2019 research visit focused on cave invertebrate diversity in the Postojna–Planina and Škocjan cave systems.",
  "ta-ra-access-scheme": "Research visits hosted through the eLTER Transnational and Remote Access mobility scheme.",
  testimonials: "A participant’s reflection on fieldwork, collaboration and karst research during an eLTER visit to Slovenia.",
  "testimonials-2": "Dr. Ioana Nae reflects on fieldwork, collaboration and karst research during her eLTER visit to Slovenia."
};

const sectionBySlug = {
  about: "European infrastructure",
  consortium: "The network",
  contact: "Get in touch",
  "elter-h2020": "European projects",
  "elter-plus": "European projects",
  "elter-ppp": "European projects",
  events: "News & events",
  "karst-research-at-lter-slovenia-sites": "Field notes",
  "lter-slovenia": "The network",
  media: "News & events",
  "news-events": "News & events",
  projects: "European projects",
  publications: "Research outputs",
  report: "Access scheme",
  "report-2": "Access scheme",
  research: "Research",
  sites: "Research sites",
  "sites-2": "Research sites",
  "ta-ra-2017": "Access scheme",
  "ta-ra-2019": "Access scheme",
  "ta-ra-access-scheme": "Access scheme",
  testimonials: "Access scheme",
  "testimonials-2": "Access scheme"
};

const pageTitles = {
  "lter-slovenia": "About LTER Slovenia",
  "report-2": "2019 TA–RA activity report",
  "sites-2": "LTER Slovenia research sites",
  "testimonials-2": "A researcher’s perspective"
};

// Keep the original WordPress routes working without indexing duplicate pages.
const aliasTargets = {
  report: "/report-2/",
  sites: "/sites-2/",
  testimonials: "/ta-ra-2019/testimonials-2/"
};

export default {
  name: "LTER Slovenia",
  fullName: "Slovenian Long-term Ecosystem Research Network",
  url: siteUrl,
  lang: "en",
  locale: "en_GB",
  currentYear: new Date().getUTCFullYear(),
  description: "Slovenia’s national network for long-term, place-based ecosystem and socio-ecological research.",
  logo: "/assets/media/2022/03/2869-1024-Slovenia.png",
  favicon: "/assets/media/2021/06/cropped-cropped-cropped-LTER-Slovenia-1-192x192.jpg",
  defaultImage: "/assets/media/2021/08/image-edited.jpeg",
  defaultImageAlt: "Illuminated footbridge crossing a cavern in the Škocjan Caves",
  contact: {
    name: "Tanja Pipan, PhD",
    role: "National representative for LTER Slovenia",
    institute: "Karst Research Institute, ZRC SAZU",
    phone: "+386 5 700 19 40",
    phoneDisplay: "+386 5 700 19 40",
    email: "tanja.pipan@zrc-sazu.si",
    social: "https://twitter.com/LTER_Slovenia"
  },
  pageDescriptions,
  sectionBySlug,
  pageTitles,
  aliasTargets,
  navigation: [
    {
      label: "About",
      items: [
        { label: "LTER Slovenia", url: "/lter-slovenia/" },
        { label: "eLTER ESFRI", url: "/about/" },
        { label: "Consortium", url: "/consortium/" }
      ]
    },
    { label: "Sites", url: "/sites-2/" },
    {
      label: "Research",
      items: [
        { label: "Research", url: "/research/" },
        { label: "Publications", url: "/publications/" },
        { label: "Projects", url: "/projects/" }
      ]
    },
    {
      label: "Access",
      items: [
        { label: "TA–RA access scheme", url: "/ta-ra-access-scheme/" },
        { label: "2017 visit", url: "/ta-ra-2017/" },
        { label: "2019 visit", url: "/ta-ra-2019/" },
        { label: "Testimonial", url: "/ta-ra-2019/testimonials-2/" },
        { label: "2019 report", url: "/report-2/" }
      ]
    },
    {
      label: "News",
      items: [
        { label: "News", url: "/news-events/" },
        { label: "Events", url: "/events/" },
        { label: "Media", url: "/media/" }
      ]
    },
    { label: "Contact", url: "/contact/" }
  ],
  organizationSchema: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: "LTER Slovenia",
    alternateName: "Slovenian Long-term Ecosystem Research Network",
    url: siteUrl,
    logo: `${siteUrl}/assets/media/2022/03/2869-1024-Slovenia.png`,
    email: "tanja.pipan@zrc-sazu.si",
    telephone: "+386 5 700 19 40",
    parentOrganization: {
      "@type": "ResearchOrganization",
      name: "Research Centre of the Slovenian Academy of Sciences and Arts",
      url: "https://www.zrc-sazu.si/en"
    },
    sameAs: ["https://twitter.com/LTER_Slovenia"]
  })
};
