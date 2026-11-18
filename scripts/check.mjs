import { readdir, readFile, access } from "node:fs/promises";
import { resolve, sep } from "node:path";
const root = resolve("dist"),
  base = (process.env.BASE_PATH || "").replace(/\/$/, "");
let count = 0;
const seen = [];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (entry.name.endsWith(".html")) {
      const html = await readFile(path, "utf8");
      if ((html.match(/<h1\b/g) || []).length !== 1)
        throw Error(`${path}: expected one h1`);
      for (const required of [
        'name="description"',
        'rel="canonical"',
        "application/ld+json",
        'id="main"',
      ])
        if (!html.includes(required))
          throw Error(`${path}: missing ${required}`);
      for (const match of html.matchAll(
        /(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g,
      )) {
        const url = match[1].slice(base.length),
          target = resolve(
            root,
            "." + url + (url.endsWith("/") ? "index.html" : ""),
          );
        await access(target).catch(() => {
          throw Error(`${path}: broken link ${url}`);
        });
      }
      for (const img of html.matchAll(/<img\b[^>]*>/g)) {
        const alt = img[0].match(/\balt="([^"]*)"/);
        if (!alt) throw Error(`${path}: img missing alt`);
        if (!alt[1].trim() && !path.includes(`${sep}admin${sep}`))
          throw Error(`${path}: img has empty alt`);
      }
      const redirect = path.endsWith(`${sep}other-services${sep}index.html`);
      let sawBusiness = false;
      let sawFaq = false;
      for (const block of html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      )) {
        let data;
        try {
          data = JSON.parse(block[1]);
        } catch (error) {
          throw Error(`${path}: invalid JSON-LD (${error.message})`);
        }
        const types = [].concat(data["@type"] || []);
        if (types.includes("PlumbingService")) {
          sawBusiness = true;
          for (const key of [
            "@id",
            "name",
            "url",
            "telephone",
            "email",
            "logo",
            "image",
            "areaServed",
            "hasOfferCatalog",
          ])
            if (data[key] == null) throw Error(`${path}: JSON-LD missing ${key}`);
          if (data.url !== "https://www.highcountryjetting.com")
            throw Error(`${path}: business url is not the canonical domain`);
          const cities = data.areaServed
            .filter((area) => area["@type"] === "City")
            .map((area) => area.name);
          for (const town of ["Vernal", "Roosevelt", "Duchesne"])
            if (!cities.includes(town))
              throw Error(`${path}: areaServed missing ${town}`);
          if (
            !Array.isArray(data.hasOfferCatalog.itemListElement) ||
            data.hasOfferCatalog.itemListElement.length < 8
          )
            throw Error(`${path}: service catalog incomplete`);
          if (data.sameAs) {
            for (const link of [].concat(data.sameAs))
              if (typeof link !== "string" || !/^https:\/\//.test(link))
                throw Error(`${path}: sameAs must be https URLs`);
          }
        }
        if (types.includes("FAQPage")) {
          sawFaq = true;
          if (!Array.isArray(data.mainEntity) || data.mainEntity.length < 3)
            throw Error(`${path}: FAQPage needs questions`);
          for (const question of data.mainEntity)
            if (
              question["@type"] !== "Question" ||
              !question.name ||
              !question.acceptedAnswer?.text
            )
              throw Error(`${path}: malformed FAQ question`);
        }
      }
      if (!redirect && !sawBusiness)
        throw Error(`${path}: missing PlumbingService schema`);
      if (
        path.endsWith(`${sep}service-area${sep}index.html`) &&
        !sawFaq
      )
        throw Error(`${path}: missing FAQPage schema`);
      if (
        path.includes(`${sep}service-area${sep}`) &&
        !path.endsWith(`${sep}service-area${sep}index.html`) &&
        sawFaq
      )
        throw Error(`${path}: town page should not repeat FAQPage`);
      if (
        !redirect &&
        (!html.includes('property="og:image"') ||
          !html.includes('name="twitter:card"'))
      )
        throw Error(`${path}: missing social meta`);
      if (
        !html.includes(
          'rel="canonical" href="https://www.highcountryjetting.com',
        )
      )
        throw Error(`${path}: canonical is not on www.highcountryjetting.com`);
      seen.push({ path, html });
      for (const set of html.matchAll(/srcset="([^"]+)"/g)) {
        for (const candidate of set[1].split(",")) {
          const url = candidate.trim().split(/\s+/)[0];
          if (!url.startsWith(base + "/assets/"))
            throw Error(`${path}: srcset missing base path: ${url}`);
          await access(resolve(root, "." + url.slice(base.length))).catch(
            () => {
              throw Error(`${path}: broken srcset ${url}`);
            },
          );
        }
      }
      count++;
    }
  }
}
await scan(root);
const robotsTxt = await readFile(resolve(root, "robots.txt"), "utf8");
const previewLock = /^Disallow: \/$/m.test(robotsTxt);
for (const { path, html } of seen) {
  const rel = path.slice(root.length);
  const blocked =
    rel.endsWith(`${sep}admin${sep}index.html`) ||
    rel.endsWith(`${sep}404.html`) ||
    rel.endsWith(`${sep}other-services${sep}index.html`);
  const noindex = /<meta name="robots" content="noindex/.test(html);
  if ((previewLock || blocked) && !noindex)
    throw Error(`${path}: expected noindex`);
  if (!previewLock && !blocked && noindex)
    throw Error(`${path}: unexpected noindex on a public page`);
}
const home = seen.find((page) => page.path.endsWith(`${sep}dist${sep}index.html`));
const homeTitle = home.html.match(/<title>([^<]*)<\/title>/)[1];
for (const town of ["Vernal", "Roosevelt", "Duchesne"])
  if (!homeTitle.includes(town)) throw Error(`home title missing ${town}`);
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
for (const loc of [
  "https://www.highcountryjetting.com/service-area/",
  "https://www.highcountryjetting.com/service-area/vernal/",
  "https://www.highcountryjetting.com/service-area/roosevelt/",
  "https://www.highcountryjetting.com/service-area/duchesne/",
])
  if (!sitemap.includes(`<loc>${loc}</loc>`))
    throw Error(`sitemap missing ${loc}`);
if (sitemap.includes("/admin/") || sitemap.includes("404.html"))
  throw Error("sitemap includes a non-public URL");
await access(resolve(root, "assets/og.png"));
console.log(
  `Checked ${count} pages: local links, headings, JSON-LD, and required metadata pass.`,
);
