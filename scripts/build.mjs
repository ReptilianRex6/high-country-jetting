import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { business as b, services, other, work } from "../src/content.mjs";
const preview = process.env.SITE_ENV !== "production";
const base = (process.env.BASE_PATH || "").replace(/\/$/, "");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const call = `<a class="button" href="tel:${b.tel}">Call ${b.phone} ↗</a>`;
const links = [
  ["/", "Home"],
  ["/services/", "Drain & sewer"],
  ["/other-services/", "Other services"],
  ["/recent-work/", "Recent work"],
  ["/contact/", "Contact"],
];
const intro = (tag, title, text) =>
  `<section class="wrap intro"><p class="eyebrow">${tag}</p><h1>${title}</h1><p class="lead">${text}</p></section>`;
const band = `<section class="band"><div class="wrap band-inner"><div><p class="eyebrow">Let’s get it flowing</p><h2>Tell us what’s going on.</h2><p>Share your location and the problem you’re seeing.<br>We’ll talk through the next step.</p></div>${call}</div></section>`;
const photo = (w, { hero = false } = {}) =>
  `<img src="/assets/work/${w.slug}-1280.webp" srcset="${base}/assets/work/${w.slug}-640.webp 640w, ${base}/assets/work/${w.slug}-1280.webp ${w.width}w" sizes="${hero ? "(max-width: 600px) 100vw, 50vw" : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"}" alt="${esc(w.alt)}" width="${w.width}" height="${w.height}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const art = `<figure class="hero-photo">${photo(work[0], { hero: true })}<figcaption>Local equipment. Real work.<span>High Country Jetting · Uintah Basin</span></figcaption></figure>`;

const home = `<section class="wrap hero"><div><p class="eyebrow">● &nbsp; Serving the Uintah Basin</p><h1>Clear lines.<br>Local service.<br><em>Less hassle.</em></h1><p class="lead">Drain cleaning, hydro-jetting, and sewer camera inspections for Uintah and Duchesne counties.</p><div class="actions">${call}<a class="text-link" href="/services/">Explore our services ↗</a></div></div>${art}</section><div class="strip"><div class="wrap"><span>Hydro-jetting</span><span>Camera inspections</span><span>Pipe descaling</span><span>Line locating</span></div></div><section class="wrap section"><div class="section-heading"><div><p class="eyebrow">Below the surface</p><h2>A clear plan for<br>a clogged line.</h2></div><p>From a slow drain to a recurring sewer backup, the first step is understanding the problem. We offer cleaning and diagnostic services to help you decide what comes next.</p></div><div class="cards">${services
  .slice(0, 3)
  .map(
    (s, i) =>
      `<a class="card" href="/services/#${s[0]}"><span class="number">0${i + 1}</span><h3>${s[1]}</h3><p>${s[2]}</p><span class="arrow">↗</span></a>`,
  )
  .join(
    "",
  )}</div></section><section class="area"><div class="wrap area-grid"><p class="eyebrow">Right here in the Basin</p><h2>Serving our<br>corner of Utah.</h2><div><p class="lead">Uintah County.<br>Duchesne County.</p><p>Have a job outside the regular service area? Call with your location and we’ll discuss availability.</p><a class="text-link" href="/contact/">Get in touch ↗</a></div></div></section>${band}`;
const gallery = work.length
  ? `<div class="gallery">${work.map((w) => `<figure><a href="/assets/work/${w.slug}-1280.webp" aria-label="View larger photo: ${esc(w.caption)}">${photo(w)}</a><figcaption>${esc(w.caption)}</figcaption></figure>`).join("")}</div>`
  : "";

const pages = [
  [
    "/",
    "Drain Cleaning & Hydro-Jetting in the Uintah Basin",
    "Drain cleaning, hydro-jetting, and sewer inspections serving Uintah and Duchesne counties.",
    home,
  ],
  [
    "/services/",
    "Drain & Sewer Services",
    "Hydro-jetting, drain cleaning, descaling, camera inspections, and locating in the Uintah Basin.",
    intro(
      "Drain & sewer services",
      "Clear the blockage.<br>Understand the cause.",
      "Practical cleaning and inspection options for the lines you rely on every day.",
    ) +
      `<section class="wrap service-list">${services.map((s, i) => `<article class="service-row" id="${s[0]}"><span class="number">0${i + 1}</span><div><h2>${s[1]}</h2><p>${s[2]}</p></div><div><p>${s[3]}</p><a class="text-link" href="/contact/">Ask about ${s[1].toLowerCase()} ↗</a></div></article>`).join("")}</section>` +
      band,
  ],
  [
    "/other-services/",
    "Property Maintenance Services",
    "Ask about gutter cleaning, chimney sweeping, and power washing in Uintah and Duchesne counties.",
    intro(
      "Around your property",
      "Care beyond<br>the sewer line.",
      "Gutter cleaning, chimney sweeping, and power washing for your property’s next project.",
    ) +
      `<section class="wrap section other-grid">${other.map((s, i) => `<article><span class="number">0${i + 1}</span><h2>${s[0]}</h2><p>${s[1]}</p><a class="text-link" href="/contact/">Discuss your project ↗</a></article>`).join("")}</section>` +
      band,
  ],
  [
    "/recent-work/",
    "Recent Work",
    "Recent projects from High Country Jetting, serving the Uintah Basin.",
    intro(
      "Recent work",
      "A look at<br>the work we do.",
      "Drain and sewer service, property maintenance, and projects around the Uintah Basin.",
    ) +
      `<section class="wrap section">${gallery}${preview ? '<aside class="note"><strong>Preview content pending:</strong> The recent Instagram posts feed will be added when the account is available.</aside>' : ""}</section>` +
      band,
  ],
  [
    "/contact/",
    "Contact & Service Area",
    `Call ${b.phone} for drain and sewer services in Uintah and Duchesne counties.`,
    intro(
      "Contact High Country Jetting",
      "Let’s talk<br>about your line.",
      "Call, text, or email with your location and a brief description of the problem.",
    ) +
      `<section class="wrap contact-grid"><div><p class="eyebrow">Start a conversation</p><a class="big-phone" href="tel:${b.tel}">${b.phone}</a><a class="text-link" href="sms:${b.tel}">Send a text ↗</a><a class="email" href="mailto:${b.email}">${b.email}</a><h2 class="small-title">Service area</h2><p>Uintah County and Duchesne County, Utah.</p><p>Outside these areas? Contact us to ask about availability.</p></div><aside class="inquiry"><p class="eyebrow">Help us help you</p><h2>A few details<br>go a long way.</h2><ol><li>Your name and callback number</li><li>The town or location of the job</li><li>What’s happening, and when it started</li><li>A convenient time to get in touch</li></ol><p>Please call for urgent issues. Email response times can vary.</p></aside></section>`,
  ],
  [
    "/404.html",
    "Page Not Found",
    "Find your way back to High Country Jetting.",
    intro(
      "404 · Page not found",
      "Let’s get you<br>back on track.",
      "This page may have moved. Explore our services or contact us for help.",
    ) +
      `<div class="wrap section"><a class="button" href="/">Back to home ↗</a></div>`,
  ],
];
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("src/assets", "dist/assets", {
  recursive: true,
  filter: (source) => !/\.(?:pdf|jpe?g)$/i.test(source),
});
for (const [path, title, description, body] of pages) {
  const nav = links
    .map(
      ([url, label]) =>
        `<a href="${url}" ${url === path ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    url: b.domain,
    telephone: b.tel,
    email: b.email,
    areaServed: ["Uintah County, Utah", "Duchesne County, Utah"],
  }).replace(/</g, "\\u003c");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | ${b.name}</title><meta name="description" content="${esc(description)}">${preview || path === "/404.html" ? '<meta name="robots" content="noindex, nofollow">' : ""}<link rel="canonical" href="${b.domain}${path}"><meta name="theme-color" content="#12384f"><meta property="og:title" content="${esc(title)} | ${b.name}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${b.domain}${path}"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/site.css"><script defer src="/assets/site.js"></script><script type="application/ld+json">${schema}</script></head><body><a class="skip" href="#main">Skip to content</a>${preview ? '<div class="preview-banner">Design preview · Business details and integrations pending client review</div>' : ""}<header class="wrap header"><a class="brand" href="/" aria-label="High Country Jetting home"><img class="brand-logo" src="/assets/logo.png" alt="High Country Jetting" width="1618" height="961"></a><button class="menu" aria-expanded="false" aria-controls="nav" type="button">Menu ＋</button><nav id="nav" aria-label="Main navigation">${nav}</nav><a class="header-call" href="tel:${b.tel}">Call now ↗</a></header><main id="main">${body}</main><footer><div class="wrap footer-grid"><div><a class="footer-brand" href="/">High Country Jetting</a><p>Drain & sewer services.<br>Rooted in the Uintah Basin.</p></div><div><p class="eyebrow">Explore</p>${links
    .slice(1)
    .map(([url, label]) => `<a href="${url}">${label}</a>`)
    .join(
      "",
    )}</div><div><p class="eyebrow">Get in touch</p><a href="tel:${b.tel}">${b.phone}</a><a href="mailto:${b.email}">${b.email}</a><p>Uintah & Duchesne counties, Utah</p></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} High Country Jetting</span><span>Local roots. Clearer lines.</span></div></footer><a class="mobile-call" href="tel:${b.tel}">Call ${b.phone} ↗</a></body></html>`;
  const file = path.endsWith(".html")
    ? "dist" + path
    : "dist" + path + "index.html";
  await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  await writeFile(
    file,
    base ? html.replace(/(href|src)="\//g, `$1="${base}/`) : html,
  );
}
await writeFile(
  "dist/robots.txt",
  preview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nSitemap: ${b.domain}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
    .filter((p) => p[0] != "/404.html")
    .map((p) => `<url><loc>${b.domain}${p[0]}</loc></url>`)
    .join("")}</urlset>`,
);
console.log(
  `Built ${pages.length} pages (${preview ? "preview: noindex" : "production: indexable"}).`,
);
