# LTER Slovenia

A redesigned bilingual static edition of [LTER Slovenia](https://lter.zrc-sazu.si/), built with [Eleventy](https://www.11ty.dev/). English uses the original routes and the Slovenian edition mirrors them under `/sl/`.

## Local development

Node.js 22 is recommended.

```sh
npm ci
npm start
```

Eleventy writes the production build to `_site/`:

```sh
npm run build
```

To refresh the WordPress-derived content and referenced media before rebuilding:

```sh
npm run crawl
npm run build
```

The crawl command requires network access and updates `src/_data/sourceContent.json`, `src/_data/source.json`, and downloaded files under `src/assets/media/`.

The Slovenian editorial translations live in `src/_data/slPagesA.json`, `src/_data/slPagesB.json`, and `src/_data/slEvents.json`; interface copy lives in `src/_data/slLocaleDraft.json`. A full rebuild is required after changing these data files.

## GitHub Pages

Pushes to `main` run the Pages deployment workflow. It gets the public base URL from GitHub Pages and derives the path prefix from it, so the same build works at a project path such as `/lter-si/` and at a custom domain root. An explicit `PATH_PREFIX` can still override this for manual builds. The workflow publishes `_site/`.

For the first deployment, choose **GitHub Actions** as the source in **Settings → Pages**. No `CNAME` is included; configuring the live `lter.zrc-sazu.si` domain requires an intentional DNS migration by its owner.

## Consortium content

The WordPress snapshot in `src/_data/sourceContent.json` lists eight partners and references a GIS logo on LifeWatch that now returns HTTP 404. The displayed consortium is curated in `src/_data/network.js`, with Slovenian names in `src/_data/localizedNetwork.js`. UNG is included there as the ninth partner; it is absent from the archived consortium page.

Local partner assets come from the institutions' official sites:

- GIS: <https://www.gozdis.si/p/assets/logo.svg>, used by <https://www.gozdis.si/en/>.
- UNG: <https://ung.si/media/images/ung-logo.width-800.png>, listed on <https://ung.si/en/university/symbols/>.

These local assets and curated partner data are independent of the WordPress crawl.
