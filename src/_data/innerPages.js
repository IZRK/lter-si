import { readFile } from "node:fs/promises";

export default async function () {
  const contentUrl = new URL("./sourceContent.json", import.meta.url);
  const content = JSON.parse(await readFile(contentUrl, "utf8"));
  return content.filter((item) => item.route !== "/");
}
