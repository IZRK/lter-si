import { readFileSync } from "node:fs";
import network from "./network.js";

const sl = JSON.parse(readFileSync(new URL("./slLocaleDraft.json", import.meta.url), "utf8"));

const ecosystemLabels = {
  "Underground karst": sl.network.ecosystemLabels.undergroundKarst,
  "Forest & karst": sl.network.ecosystemLabels.forestAndKarst,
  Freshwater: sl.network.ecosystemLabels.freshwater,
  Forest: sl.network.ecosystemLabels.forest,
  Marine: sl.network.ecosystemLabels.marine
};

const siteNames = {
  "Postojna–Planina Cave System": "Postojnsko-planinski jamski sistem",
  "Škocjan Caves": "Škocjanske jame",
  "Cerknica Lake": "Cerkniško jezero",
  "Lake Bohinj": "Bohinjsko jezero",
  "Gulf of Trieste": "Tržaški zaliv"
};

const partnerNames = {
  "ZRC SAZU": "Znanstvenoraziskovalni center Slovenske akademije znanosti in umetnosti",
  "NIB–MBP": "Nacionalni inštitut za biologijo — Morska biološka postaja Piran",
  GIS: "Gozdarski inštitut Slovenije",
  "UL–BF": "Univerza v Ljubljani — Biotehniška fakulteta",
  PSJ: "Javni zavod Park Škocjanske jame",
  PMS: "Prirodoslovni muzej Slovenije",
  TULAR: "Društvo za jamsko biologijo — Jamski laboratorij Tular",
  UM: "Univerza v Mariboru",
  UNG: "Univerza v Novi Gorici"
};

const projectEyebrows = [
  sl.network.projectEyebrows.preparatoryPhase,
  sl.network.projectEyebrows.advancedCommunity,
  sl.network.projectEyebrows.startingCommunity
];

const galleryAlts = [
  sl.network.galleryAlts.croaticus,
  sl.network.galleryAlts.leptodirusHochenwartii,
  sl.network.galleryAlts.proteusAnguinus,
  sl.network.galleryAlts.bat,
  sl.network.galleryAlts.researcher,
  sl.network.galleryAlts.planina
];

const slNetwork = {
  ...network,
  stats: [
    { value: "2003", label: sl.network.stats.networkEstablished },
    { value: "16", label: sl.network.stats.researchSites },
    { value: String(network.partners.length), label: sl.network.stats.partners }
  ],
  sites: network.sites.map((site) => ({
    ...site,
    name: siteNames[site.name] || site.name,
    ecosystem: ecosystemLabels[site.ecosystem] || site.ecosystem
  })),
  partners: network.partners.map((partner) => ({
    ...partner,
    name: partnerNames[partner.short] || partner.name
  })),
  projects: network.projects.map((project, index) => ({
    ...project,
    eyebrow: projectEyebrows[index],
    url: `/sl${project.url}`
  })),
  gallery: network.gallery.map((photo, index) => ({
    ...photo,
    alt: galleryAlts[index]
  }))
};

export default { en: network, sl: slNetwork };
