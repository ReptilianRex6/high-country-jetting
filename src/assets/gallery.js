// Adds photos posted from /admin/ to the top of the Recent Work gallery.
// If Firebase can't be reached, the built-in photos still show.
import { getApp, sdk } from "./fb.js";

const grid = document.getElementById("gallery");

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter(Boolean));
  return node;
}

function figure(p) {
  const img = el("img", {
    src: p.url1280,
    srcset: `${p.url640} ${p.smallWidth}w, ${p.url1280} ${p.width}w`,
    sizes: "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw",
    alt: p.alt || p.caption,
    width: p.width,
    height: p.height,
    loading: "lazy",
    decoding: "async",
  });
  const link = el("a", { href: p.url1280 }, img);
  link.setAttribute("aria-label", `View larger photo: ${p.caption}`);
  return el(
    "figure",
    {},
    link,
    el(
      "figcaption",
      {},
      p.caption,
      p.description && el("span", { className: "photo-desc", textContent: p.description }),
    ),
  );
}

if (grid) {
  try {
    const app = await getApp();
    const fs = await sdk("firestore");
    const snap = await fs.getDocs(
      fs.query(fs.collection(fs.getFirestore(app), "photos"), fs.orderBy("createdAt", "desc"), fs.limit(60)),
    );
    grid.prepend(...snap.docs.map((d) => figure(d.data())));
  } catch (err) {
    console.warn("Live gallery unavailable:", err);
  }
}
