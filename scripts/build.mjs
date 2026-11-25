import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import {
  business as b,
  services,
  other,
  work,
  towns,
  faqs,
  profiles,
  address,
  openingHours,
  geo,
} from "../src/content.mjs";
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
  ["/services/", "Services"],
  ["/service-area/", "Service area"],
  ["/recent-work/", "Recent work"],
  ["/contact/", "Contact"],
];
const intro = (tag, title, text, places = "") =>
  `<section class="wrap intro"><p class="eyebrow">${tag}</p><h1>${title}${places ? `<span class="places">${places}</span>` : ""}</h1><p class="lead">${text}</p></section>`;
const outsideArea = `Outside the area? Call anyway. We can often make arrangements.`;
const band = `<section class="band"><div class="wrap band-inner"><div><p class="eyebrow">Let’s get it flowing</p><h2>Tell us what’s going on.</h2><p>Share your location and the problem you’re seeing.<br>We’ll talk through the next step.</p></div>${call}</div></section>`;
const photo = (w, { hero = false } = {}) =>
  `<img src="/assets/work/${w.slug}-1280.webp" srcset="${base}/assets/work/${w.slug}-640.webp 640w, ${base}/assets/work/${w.slug}-1280.webp ${w.width}w" sizes="${hero ? "(max-width: 600px) 100vw, 50vw" : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"}" alt="${esc(w.alt)}" width="${w.width}" height="${w.height}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const art = `<figure class="hero-photo">${photo(work[0], { hero: true })}<figcaption>Local equipment. Real work.<span>High Country Jetting · Uintah Basin</span></figcaption></figure>`;
const ogImage = {
  url: `${b.domain}/assets/og.png`,
  width: 1200,
  height: 630,
  alt: "High Country Jetting logo, with a mountain mark above the business name",
  type: "image/png",
};
const pageTowns = towns.filter((t) => t.page);

function joinList(parts) {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`;
}
function townName(town) {
  return town.page
    ? `<a href="/service-area/${town.slug}/">${esc(town.name)}</a>`
    : esc(town.name);
}
function townListHtml() {
  return `<ul class="town-list">${["Uintah", "Duchesne"]
    .map((county) => {
      const names = joinList(
        towns.filter((t) => t.county === county).map(townName),
      );
      return `<li><strong>${county} County, Utah.</strong> ${names}.</li>`;
    })
    .join("")}</ul>`;
}
function profileLinksHtml(className) {
  const links = profiles
    .map((profile) => {
      const name = `${b.name} on ${profile.label}`;
      return `<a href="${esc(profile.url)}" aria-label="${esc(name)}">${esc(profile.label)}</a>`;
    })
    .join("");
  // One landmark for the repeated footer links. In-page links keep their own names.
  return className === "footer-profiles"
    ? `<nav class="footer-profiles" aria-label="Find us online">${links}</nav>`
    : `<div class="${className}">${links}</div>`;
}
function faqHtml() {
  return `<section class="wrap section faq" id="faq" aria-labelledby="faq-title"><div class="section-heading"><div><p class="eyebrow">Good questions</p><h2 id="faq-title">Before you call.</h2></div><p>Where we work, and how hydro-jetting compares with snaking.</p></div><div class="faq-list">${faqs
    .map(
      (item) =>
        `<article><h3>${esc(item.q)}</h3><p>${esc(item.a)}</p></article>`,
    )
    .join("")}</div></section>`;
}
function businessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["PlumbingService", "LocalBusiness"],
    "@id": `${b.domain}/#business`,
    name: b.name,
    url: b.domain,
    telephone: b.tel,
    email: b.email,
    logo: `${b.domain}/assets/logo.png`,
    image: [
      `${b.domain}/assets/work/jetting-equipment-1280.webp`,
      `${b.domain}/assets/logo.png`,
    ],
    description:
      "Drain cleaning, hydro-jetting, camera inspections, pipe descaling, and line locating for Uintah and Duchesne counties, from Fruitland to Jensen, in Utah’s Uintah Basin.",
    areaServed: [
      ...towns.map((t) => ({
        "@type": "City",
        name: t.name,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: `${t.county} County`,
          containedInPlace: { "@type": "State", name: "Utah" },
        },
      })),
      ...["Uintah County", "Duchesne County"].map((name) => ({
        "@type": "AdministrativeArea",
        name,
        containedInPlace: { "@type": "State", name: "Utah" },
      })),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Drain, sewer, and property services",
      itemListElement: [
        ...services.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s[1],
            description: s[3],
            url: `${b.domain}/services/#${s[0]}`,
          },
        })),
        ...other.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s[0],
            description: s[1],
            url: `${b.domain}/services/#property-services`,
          },
        })),
      ],
    },
  };
  // address, openingHours, and geo stay off until src/content.mjs has real values.
  if (profiles.length) {
    if (
      profiles.some(
        (profile) =>
          !profile ||
          typeof profile.label !== "string" ||
          !profile.label.trim() ||
          typeof profile.url !== "string" ||
          !/^https:\/\//.test(profile.url),
      )
    ) {
      throw new Error(
        "profiles in src/content.mjs need a label and an https URL",
      );
    }
    schema.sameAs = profiles.map((profile) => profile.url);
  }
  if (address) schema.address = address;
  if (openingHours) schema.openingHours = openingHours;
  if (geo) schema.geo = geo;
  return schema;
}
function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
function jsonLdScripts(path) {
  const blocks = [businessSchema()];
  if (path === "/service-area/") blocks.push(faqSchema());
  return blocks
    .map(
      (block) =>
        `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, "\\u003c")}</script>`,
    )
    .join("");
}
function townPage(town) {
  if (!town.lead || !town.blurb) throw new Error(`town ${town.slug} needs lead and blurb`);
  const others = pageTowns.filter((t) => t.slug !== town.slug);
  const serviceItems = services
    .map(
      (s) =>
        `<li><a href="/services/#${s[0]}">${esc(s[1])}</a>. ${esc(s[2])}</li>`,
    )
    .join("");
  return [
    `/service-area/${town.slug}/`,
    `Drain Cleaning in ${town.name}, Utah`,
    `Drain cleaning, hydro-jetting, and sewer camera inspections in ${town.name}, Utah. High Country Jetting serves ${town.county} County and the rest of the Uintah Basin.`,
    intro(
      `${esc(town.name)}, Utah`,
      `Drain cleaning<br>in <em>${esc(town.name)}.</em>`,
      town.lead,
    ) +
      `<section class="wrap section town-services"><div class="section-heading"><div><p class="eyebrow">Services</p><h2>How we can help.</h2></div><p>${esc(town.blurb)}</p></div><ul class="service-links">${serviceItems}</ul><p class="town-also">Also serving ${joinList(others.map(townName))}, and the rest of the <a href="/service-area/">Uintah Basin</a>.</p></section>${band}`,
  ];
}
function serviceAreaPage() {
  return [
    "/service-area/",
    "Service Area: Vernal, Roosevelt & Duchesne, Utah",
    "High Country Jetting serves Vernal, Roosevelt, Duchesne, and other communities from Fruitland to Jensen in Uintah and Duchesne counties, Utah.",
    intro(
      "Service area",
      "Serving the<br><em>Uintah Basin.</em>",
      "Drain cleaning, hydro-jetting, and sewer inspections from Fruitland to Jensen, across Uintah and Duchesne counties.",
      "Vernal · Roosevelt · Duchesne",
    ) +
      `<section class="wrap section"><div class="section-heading"><div><p class="eyebrow">Where we work</p><h2>Towns we serve.</h2></div><p>Vernal, Roosevelt, and Duchesne have their own pages. The other towns we cover are on the list too.</p></div>${townListHtml()}<p class="town-also"><a class="text-link" href="/contact/">Contact us ↗</a></p></section>${faqHtml()}${band}`,
  ];
}

const home = `<section class="wrap hero"><div><p class="eyebrow">● &nbsp; Serving Utah’s Uintah Basin</p><h1>Clear lines.<br>Local service.<br><em>Less hassle.</em></h1><p class="lead">Hydro-jetting, drain cleaning, and sewer camera inspections for Vernal, Roosevelt, Duchesne, and the rest of Uintah and Duchesne counties.</p><div class="actions">${call}<a class="text-link" href="/services/">Explore our services ↗</a></div></div>${art}</section><div class="strip"><div class="wrap"><span>Hydro-jetting</span><span>Camera inspections</span><span>Pipe descaling</span><span>Line locating</span></div></div><section class="wrap section"><div class="section-heading"><div><p class="eyebrow">Below the surface</p><h2>A clear plan for<br>a clogged line.</h2></div><p>Whether it’s a slow drain or a recurring sewer backup, the first step is understanding the problem. We offer cleaning and diagnostic services to help you decide what comes next.</p></div><div class="cards">${services
  .slice(0, 3)
  .map(
    (s, i) =>
      `<a class="card" href="/services/#${s[0]}"><span class="number">0${i + 1}</span><h3>${s[1]}</h3><p>${s[2]}</p><span class="arrow">↗</span></a>`,
  )
  .join(
    "",
  )}</div></section><section class="area" id="service-area"><div class="wrap area-grid"><p class="eyebrow">Service area</p><h2>Right here<br>in the <em>Basin.</em></h2><div><p class="lead">Homes and businesses from Fruitland to Jensen.</p><p>Vernal, Roosevelt, Duchesne, and the towns in between. ${outsideArea}</p><a class="text-link" href="/service-area/">See towns we serve ↗</a></div></div></section>${band}`;
const gallery = `<div class="gallery" id="gallery">${work.map((w) => `<figure><a href="/assets/work/${w.slug}-1280.webp" aria-label="View larger photo: ${esc(w.caption)}">${photo(w)}</a><figcaption>${esc(w.caption)}</figcaption></figure>`).join("")}</div>`;
const instagram = profiles.find(
  (profile) =>
    profile &&
    typeof profile.url === "string" &&
    profile.url.includes("instagram.com/"),
);
const instagramFollow = instagram
  ? `<p class="follow"><a class="text-link" href="${esc(instagram.url)}">Follow us on Instagram ↗</a></p>`
  : "";

const pages = [
  [
    "/",
    "Drain Cleaning in Vernal, Roosevelt & Duchesne",
    "Drain cleaning, hydro-jetting, and sewer camera inspections in Vernal, Roosevelt, Duchesne, and across Utah’s Uintah Basin.",
    home,
  ],
  [
    "/services/",
    "Drain & Sewer Services in Vernal, Roosevelt & Duchesne",
    "Hydro-jetting, drain cleaning, camera inspections, and property care in Vernal, Roosevelt, Duchesne, and Utah’s Uintah Basin.",
    intro(
      "Our services",
      "One local crew.<br><em>Clear lines.</em>",
      "Clogged drains, stubborn buildup, and lines you want to see before anyone digs. Here’s the drain, sewer, and property work we do.",
    ) +
      `<section class="wrap service-list" aria-labelledby="drain-sewer"><div class="category-heading service-heading"><h2 id="drain-sewer">Drain &amp; sewer</h2><a class="text-link" href="#property-services">Jump to property services ↓</a></div>${services.map((s) => `<article class="service-row" id="${s[0]}"><div><h3>${s[1]}</h3><p>${s[2]}</p></div><div><p>${s[3]}</p></div></article>`).join("")}<div class="section-contact"><a class="text-link" href="/contact/">Ask about drain &amp; sewer services ↗</a></div></section><section class="property-services" aria-labelledby="property-services"><div class="wrap category-heading"><h2 id="property-services">Around your property</h2><p class="property-tagline">Care beyond the sewer line.</p></div><div class="wrap other-grid">${other.map((s) => `<article><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join("")}</div><div class="wrap section-contact"><a class="text-link" href="/contact/">Ask about property services ↗</a></div></section>` +
      band,
  ],
  serviceAreaPage(),
  ...pageTowns.map(townPage),
  [
    "/recent-work/",
    "Recent Work in Vernal, Roosevelt & Duchesne",
    "Photos of drain, sewer, and property work by High Country Jetting in Vernal, Roosevelt, Duchesne, and nearby Uintah Basin towns.",
    intro(
      "Recent work",
      "Photos from<br><em>real jobs.</em>",
      "Drain cleaning, hydro-jetting, inspections, and property work. These are the trucks, the tools, and the kind of jobs we take on.",
    ) +
      `<section class="wrap section">${gallery}${instagramFollow}</section>` +
      band,
    '<script type="module" src="/assets/gallery.js"></script>',
  ],
  [
    "/contact/",
    "Contact for Vernal, Roosevelt & Duchesne Drain Service",
    `Call ${b.phone} for drain cleaning and hydro-jetting in Vernal, Roosevelt, Duchesne, and other Uintah Basin towns in Utah.`,
    intro(
      "Contact High Country Jetting",
      "Let’s <em>talk.</em>",
      "Call, text, or email with your town and a brief description of the problem.",
    ) +
      `<section class="wrap contact-grid"><div><p class="eyebrow">Start a conversation</p><a class="big-phone" href="tel:${b.tel}">${b.phone}</a><a class="text-link" href="sms:${b.tel}">Send a text ↗</a><a class="email" href="mailto:${b.email}">${b.email}</a>${profileLinksHtml("profile-links")}<h2 class="small-title">Service area</h2><p>Tell us your town when you call. <a href="/service-area/">See the towns we cover ↗</a>. If yours isn’t listed, call and we’ll see what we can do.</p></div><aside class="inquiry"><p class="eyebrow">Help us help you</p><h2>A few details<br>go a long way.</h2><ol><li>Your name and callback number</li><li>The town or location of the job</li><li>What’s happening, and when it started</li><li>A convenient time to get in touch</li></ol><p>Please call for urgent issues. Email response times can vary.</p></aside></section>`,
  ],
  [
    "/admin/",
    "Website Photos",
    "Add and remove photos on the High Country Jetting Recent Work page.",
    intro(
      "Website photos",
      "Add a photo<br>from the job.",
      "Snap a photo, add a few words, and post it to the Recent Work page.",
    ) +
      `<section class="wrap admin"><div class="admin-bar"><p id="admin-status" role="status">Loading…</p><button id="signin" class="button" type="button" hidden>Sign in with Google</button><button id="signout" class="admin-link" type="button" hidden>Sign out</button></div><div id="admin-panel" hidden><form id="upload-form" class="admin-card" novalidate><h2>Add a photo</h2><label class="photo-pick"><input id="photo" type="file" accept="image/*"><span>📷 Take or choose a photo</span></label><img id="preview" class="admin-preview" alt="Selected photo preview" hidden><label>Type of work<select id="category"><option value="drain-sewer">Drain &amp; sewer</option><option value="property">Property services</option></select></label><label>Short caption <span class="hint">a few words</span><input id="caption" maxlength="80" autocomplete="off" placeholder="Hydro-jetting a main line"></label><label>Description <span class="hint">optional</span><textarea id="description" maxlength="500" rows="3" placeholder="Jot a few notes and tap ✨ to polish them, or leave it blank."></textarea></label><input type="hidden" id="alt"><div class="admin-actions"><button id="suggest" class="button button-soft" type="button">✨ Write it for me</button><button id="upload" class="button" type="submit">Post to website</button></div><p id="form-msg" class="admin-msg" role="status"></p></form><section class="admin-card"><h2>On the website now</h2><ul id="photo-list" class="photo-list"></ul></section></div></section>`,
    '<script type="module" src="/assets/admin.js"></script>',
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
for (const [path, title, description, body, scripts = ""] of pages) {
  const nav = links
    .map(([url, label]) => {
      const on = url === "/" ? path === "/" : path.startsWith(url);
      return `<a href="${url}"${on ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  const pageTitle = `${esc(title)} | ${b.name}`;
  const descriptionTag = esc(description);
  const robots =
    preview || path === "/404.html" || path === "/admin/"
      ? '<meta name="robots" content="noindex, nofollow">'
      : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${pageTitle}</title><meta name="description" content="${descriptionTag}">${robots}<link rel="canonical" href="${b.domain}${path}"><meta name="theme-color" content="#12384f"><meta property="og:site_name" content="${esc(b.name)}"><meta property="og:locale" content="en_US"><meta property="og:title" content="${pageTitle}"><meta property="og:description" content="${descriptionTag}"><meta property="og:type" content="website"><meta property="og:url" content="${b.domain}${path}"><meta property="og:image" content="${ogImage.url}"><meta property="og:image:alt" content="${esc(ogImage.alt)}"><meta property="og:image:width" content="${ogImage.width}"><meta property="og:image:height" content="${ogImage.height}"><meta property="og:image:type" content="${ogImage.type}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${pageTitle}"><meta name="twitter:description" content="${descriptionTag}"><meta name="twitter:image" content="${ogImage.url}"><meta name="twitter:image:alt" content="${esc(ogImage.alt)}"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/site.css"><script defer src="/assets/site.js"></script>${jsonLdScripts(path)}${scripts}</head><body><a class="skip" href="#main">Skip to content</a>${preview ? '<div class="preview-banner">Design preview · Business details and integrations pending client review</div>' : ""}<header class="wrap header"><a class="brand" href="/" aria-label="High Country Jetting home"><img class="brand-logo" src="/assets/logo.png" alt="High Country Jetting" width="1618" height="961"></a><button class="menu" aria-expanded="false" aria-controls="nav" type="button">Menu ＋</button><nav id="nav" aria-label="Main navigation">${nav}</nav><a class="header-call" href="tel:${b.tel}">Call now ↗</a></header><main id="main">${body}</main><footer><div class="wrap footer-grid"><div><a class="footer-brand" href="/">High Country Jetting</a><p>Drain & sewer services.<br>Rooted in the Uintah Basin.</p></div><div><p class="eyebrow">Explore</p>${links
    .slice(1)
    .map(([url, label]) => `<a href="${url}">${label}</a>`)
    .join(
      "",
    )}</div><div><p class="eyebrow">Get in touch</p><a href="tel:${b.tel}">${b.phone}</a><a href="mailto:${b.email}">${b.email}</a>${profileLinksHtml("footer-profiles")}<p>Serving the Uintah Basin, Utah</p></div></div><div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} High Country Jetting</span><span>Local roots. Clearer lines.</span></div></footer><a class="mobile-call" href="tel:${b.tel}">Call ${b.phone} ↗</a></body></html>`;
  const file = path.endsWith(".html")
    ? "dist" + path
    : "dist" + path + "index.html";
  await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  await writeFile(
    file,
    base ? html.replace(/(href|src)="\//g, `$1="${base}/`) : html,
  );
}
await mkdir("dist/other-services", { recursive: true });
await writeFile(
  "dist/other-services/index.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${base}/services/#property-services"><title>Services moved | High Country Jetting</title><meta name="description" content="Property services are now on our combined services page."><link rel="canonical" href="${b.domain}/services/"><script type="application/ld+json">{}</script></head><body><main id="main"><h1>Our services are together now.</h1><a href="${base}/services/#property-services">See property services</a></main></body></html>`,
);
await writeFile(
  "dist/robots.txt",
  preview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${b.domain}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
    .filter((p) => !["/404.html", "/admin/"].includes(p[0]))
    .map((p) => `<url><loc>${b.domain}${p[0]}</loc></url>`)
    .join("")}</urlset>`,
);
console.log(
  `Built ${pages.length} pages (${preview ? "preview: noindex" : "production: indexable"}).`,
);
