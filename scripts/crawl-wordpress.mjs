import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_ORIGIN = "https://lter.zrc-sazu.si";
const API = `${SOURCE_ORIGIN}/wp-json/wp/v2`;
const DATA_DIR = path.join(ROOT, "src", "_data");
const MEDIA_DIR = path.join(ROOT, "src", "assets", "media");

const extraAssets = [
  `${SOURCE_ORIGIN}/wp-content/uploads/2022/03/2869-1024-Slovenia.png`,
  `${SOURCE_ORIGIN}/wp-content/uploads/2021/08/image-edited.jpeg`,
  `${SOURCE_ORIGIN}/wp-content/uploads/2021/06/cropped-cropped-cropped-LTER-Slovenia-1-192x192.jpg`
];

// The original attachment URL currently serves a media-library contact sheet,
// while this generated derivative is the portrait shown by the live page.
const assetSourceOverrides = {
  [`${SOURCE_ORIGIN}/wp-content/uploads/2024/01/slika.png`]:
    `${SOURCE_ORIGIN}/wp-content/uploads/2024/01/slika-225x300.png`
};

const linkOverrides = {
  "http://en.gozdis.si/home/": "https://www.gozdis.si/en/",
  "https://www.um.si/en/Pages/default.aspx": "https://www.um.si/en/",
  "mailto:pipan@zrc-sazu.si": "mailto:tanja.pipan@zrc-sazu.si"
};

const altTextByFilename = {
  "2869-1024-Slovenia.png": "LTER Slovenia — Slovenian Long-term Ecosystem Research Network",
  "image-edited.jpeg": "Illuminated footbridge crossing a cavern in the Škocjan Caves",
  "Croaticus.jpg": "Two translucent cave-adapted crustaceans seen through a microscope",
  "Leptodirus_hochenwartii_reticulatus.jpg": "Leptodirus hochenwartii cave beetle",
  "Proteus_anguinus_anguinus.jpg": "Olm, Proteus anguinus, in its subterranean habitat",
  "Netopir-680x1024.jpg": "Bat resting in a cave",
  "Cerkvenik-714x1024.jpg": "Researcher surveying a cave passage",
  "Plan.jpg": "Planina karst landscape",
  "ELTER-RI-1024x714.jpg": "eLTER Research Infrastructure overview",
  "H2020.jpg": "eLTER H2020 project graphic",
  "new-eLTER-PPP-1.jpg": "eLTER PPP project graphic",
  "new-eLTER-PLUS-1.jpg": "eLTER PLUS project graphic",
  "LTER-Slovenia-1-1024x682.jpg": "LTER Slovenia network logo",
  "slika.png": "Dr. Ioana Nae in front of the Karst Research Institute ZRC SAZU",
  "slika-225x300.png": "Dr. Ioana Nae in front of the Karst Research Institute ZRC SAZU"
};

const decodeEntities = (input = "") => input
  .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
  .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#039;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

const stripHtml = (html = "") => decodeEntities(html)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const safeName = (value) => value
  .normalize("NFKD")
  .replace(/[^a-zA-Z0-9._-]+/g, "-")
  .replace(/^-+|-+$/g, "");

const assetPathFor = (urlString) => {
  const url = new URL(decodeEntities(urlString));
  const uploadMarker = "/wp-content/uploads/";
  if (url.hostname === "lter.zrc-sazu.si" && url.pathname.includes(uploadMarker)) {
    const relative = decodeURIComponent(url.pathname.split(uploadMarker)[1]);
    const parts = relative.split("/").map(safeName);
    return `/assets/media/${parts.join("/")}`;
  }
  const parts = decodeURIComponent(url.pathname).split("/").filter(Boolean).map(safeName);
  return `/assets/media/external/${safeName(url.hostname)}/${parts.join("/")}`;
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { "user-agent": "LTER-Slovenia-static-import/1.0" } });
  if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`);
  return response.json();
};

const findDownloadableAssets = (html = "") => {
  const urls = [];
  for (const match of html.matchAll(/\b(?:src|href|data|poster)=["'](https?:\/\/[^"']+)["']/gi)) {
    const value = decodeEntities(match[1]);
    const parsed = new URL(value);
    const isLocalUpload = parsed.hostname === "lter.zrc-sazu.si" && parsed.pathname.includes("/wp-content/uploads/");
    const isReferencedImage = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(parsed.pathname);
    if (isLocalUpload || isReferencedImage) urls.push(value);
  }
  return urls;
};

const downloadAsset = async (urlString) => {
  const requestUrl = assetSourceOverrides[urlString] || urlString;
  const localUrl = assetPathFor(requestUrl);
  const outputPath = path.join(ROOT, "src", localUrl);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const response = await fetch(requestUrl, { headers: { "user-agent": "LTER-Slovenia-static-import/1.0" } });
  if (!response.ok) throw new Error(`Could not download ${requestUrl}: ${response.status}`);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  return { source: urlString, fetchedFrom: requestUrl, local: localUrl };
};

const addAltText = (html) => html.replace(/<img\b([^>]*?)\balt=(['"])\2([^>]*)>/gi, (tag, before, quote, after) => {
  const src = `${before} ${after}`.match(/\bsrc=["']([^"']+)["']/i)?.[1] || "";
  const filename = decodeURIComponent(src.split("/").pop() || "");
  const alt = altTextByFilename[filename] || filename
    .replace(/-\d+x\d+(?=\.[^.]+$)/, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ");
  return `<img${before}alt="${alt.replace(/"/g, "&quot;")}"${after}>`;
});

const repairPublicationLinks = (html) => html
  // Two source anchors accidentally include their DOI citation inside href.
  .replace(/<a([^>]*?)href=(['"])(https?:\/\/[^"',]+), DOI: ([^"']+)\2([^>]*)>[\s\S]*?<\/a>/gi,
    (match, before, quote, url, doi, after) => `<a${before}href="${url}"${after}>${url}</a>, DOI: ${doi}`)
  // COBISS retired its former Slovenian OPAC hostname.
  .replace(/https:\/\/plus\.si\.cobiss\.net\/opac7\/bib\/(\d+)(?:\?lang=sl)?/gi,
    "https://plus.cobiss.net/cobiss/si/en/bib/$1")
  // Repair a split `h` + linked `ttps://…` in one Scientific Reports citation.
  .replace(/\bh(<a\b[^>]*href=(['"])https?:\/\/[^"']+\2[^>]*>)ttps:\/\//gi, "$1https://");

const cleanHtml = (input, assetMap) => {
  let html = input;
  for (const [source, local] of assetMap) {
    html = html.split(source).join(local);
    html = html.split(source.replaceAll("&", "&amp;")).join(local);
  }
  for (const [source, replacement] of Object.entries(linkOverrides)) {
    html = html.split(source).join(replacement);
  }

  html = html
    .replaceAll(SOURCE_ORIGIN, "")
    .replace(/\s+srcset=(['"])[\s\S]*?\1/gi, "")
    .replace(/\s+sizes=(['"])[\s\S]*?\1/gi, "")
    .replace(/<button\b[^>]*class=(['"])[^'"]*lightbox-trigger[^'"]*\1[^>]*>[\s\S]*?<\/button>/gi, "")
    .replace(/\sdata-wp-[\w:-]+=(['"])[\s\S]*?\1/gi, "")
    .replace(/\sdata-(?:type|id)=(['"])[\s\S]*?\1/gi, "")
    .replace(/\sstyle=(['"])[\s\S]*?\1/gi, "")
    .replace(/\shidden(?=\s|>)/gi, "")
    .replace(/<div\b[^>]*wp-block-spacer[^>]*><\/div>/gi, "")
    .replace(/<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?\s*>)*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return addAltText(repairPublicationLinks(html));
};

await mkdir(DATA_DIR, { recursive: true });
await mkdir(MEDIA_DIR, { recursive: true });

const [pages, posts] = await Promise.all([
  fetchJson(`${API}/pages?per_page=100&_embed=1`),
  fetchJson(`${API}/posts?per_page=100&_embed=1`)
]);

const sourceItems = [
  ...pages.map((item) => ({ ...item, type: "page" })),
  ...posts.map((item) => ({ ...item, type: "post" }))
];

const featuredUrls = sourceItems
  .map((item) => item._embedded?.["wp:featuredmedia"]?.[0]?.source_url)
  .filter(Boolean);
const discoveredAssets = sourceItems.flatMap((item) => findDownloadableAssets(item.content.rendered));
const uniqueAssets = [...new Set([...extraAssets, ...featuredUrls, ...discoveredAssets])];

const downloaded = [];
for (let index = 0; index < uniqueAssets.length; index += 6) {
  const batch = uniqueAssets.slice(index, index + 6);
  const results = await Promise.all(batch.map(async (assetUrl) => {
    try {
      return await downloadAsset(assetUrl);
    } catch (error) {
      console.warn(`Skipped unavailable asset: ${assetUrl} (${error.message})`);
      return null;
    }
  }));
  downloaded.push(...results.filter(Boolean));
}
const assetMap = new Map(downloaded.map((asset) => [asset.source, asset.local]));

const items = sourceItems.map((item) => {
  const title = decodeEntities(stripHtml(item.title.rendered));
  const text = stripHtml(item.content.rendered);
  const featuredSource = item._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const route = item.id === 7 ? "/" : new URL(item.link).pathname;
  return {
    id: item.id,
    type: item.type,
    slug: item.slug === "create-your-website-with-blocks" ? "home" : item.slug,
    route,
    title,
    date: item.date,
    modified: item.modified,
    excerpt: stripHtml(item.excerpt?.rendered) || `${text.slice(0, 210).trim()}${text.length > 210 ? "…" : ""}`,
    content: cleanHtml(item.content.rendered, assetMap),
    featuredImage: featuredSource ? assetMap.get(featuredSource) : null,
    sourceUrl: item.link
  };
});

items.sort((a, b) => {
  if (a.route === "/") return -1;
  if (b.route === "/") return 1;
  return a.title.localeCompare(b.title, "en");
});

const manifest = {
  source: SOURCE_ORIGIN,
  retrievedAt: new Date().toISOString(),
  latestPostModifiedAt: posts.length
    ? `${posts.map((item) => item.modified).sort().at(-1)}Z`
    : new Date().toISOString(),
  totals: {
    pages: pages.length,
    posts: posts.length,
    assets: downloaded.length
  },
  assets: downloaded
};

await Promise.all([
  writeFile(path.join(DATA_DIR, "sourceContent.json"), `${JSON.stringify(items, null, 2)}\n`),
  writeFile(path.join(DATA_DIR, "source.json"), `${JSON.stringify(manifest, null, 2)}\n`)
]);

console.log(`Imported ${pages.length} pages, ${posts.length} post and ${downloaded.length} assets from ${SOURCE_ORIGIN}.`);
