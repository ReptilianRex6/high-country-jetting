import { readdir, readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve("dist"),
  base = (process.env.BASE_PATH || "").replace(/\/$/, "");
let count = 0;
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
console.log(
  `Checked ${count} pages: local links, headings, and required metadata pass.`,
);
