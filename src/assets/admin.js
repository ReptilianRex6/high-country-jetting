// Photo manager for /admin/. Only emails listed in firestore.rules and
// storage.rules can post or remove photos; everyone else is read-only.
import { getApp, sdk } from "./fb.js";

const MODEL = "gemini-3.6-flash";
const CATEGORIES = { "drain-sewer": "Drain & sewer", property: "Property services" };
const PROMPT = `You write gallery text for High Country Jetting, a local drain, sewer, and property-services company in Utah's Uintah Basin.
Return JSON with:
- caption: 2 to 6 words, sentence case, no ending period.
- description: 1 or 2 plain, friendly sentences (under 40 words) about the work shown.
- alt: one factual sentence describing what is visible, for screen-reader users.
Rules: describe only what is visible or stated in the owner's notes. Do not invent towns, results, prices, guarantees, or customer details. Never mention names, faces, street addresses, house numbers, or license plates. No emojis or hashtags.`;

const $ = (id) => document.getElementById(id);
const ui = {
  status: $("admin-status"), signin: $("signin"), signout: $("signout"), panel: $("admin-panel"),
  form: $("upload-form"), file: $("photo"), preview: $("preview"), category: $("category"),
  caption: $("caption"), description: $("description"), alt: $("alt"),
  suggest: $("suggest"), submit: $("upload"), msg: $("form-msg"), list: $("photo-list"),
};
const say = (node, text, tone = "") => { node.textContent = text; node.dataset.tone = tone; };

function friendly(err) {
  const code = err?.code || "";
  if (code.includes("permission-denied") || code.includes("unauthorized"))
    return "This Google account isn't allowed to change the website photos.";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "Sign-in was cancelled.";
  if (code.includes("unauthorized-domain")) return "This web address isn't approved for sign-in yet. Ask Ethan to add it.";
  if (code.includes("network") || code.includes("unavailable")) return "Couldn't reach the internet. Check your signal and try again.";
  return "Something went wrong. Please try again.";
}

let app, auth, db, storage, fs, st;
try {
  app = await getApp();
  const authSdk = await sdk("auth");
  [fs, st] = await Promise.all([sdk("firestore"), sdk("storage")]);
  auth = authSdk.getAuth(app);
  db = fs.getFirestore(app);
  storage = st.getStorage(app);

  ui.signin.onclick = () =>
    authSdk.signInWithPopup(auth, new authSdk.GoogleAuthProvider()).catch((e) => say(ui.status, friendly(e), "error"));
  ui.signout.onclick = () => authSdk.signOut(auth);
  authSdk.onAuthStateChanged(auth, onUser);
} catch (err) {
  console.error(err);
  say(ui.status, "The photo manager couldn't load. Refresh the page to try again.", "error");
}

async function onUser(user) {
  ui.signin.hidden = !!user;
  ui.signout.hidden = !user;
  ui.panel.hidden = true;
  if (!user) return say(ui.status, "Sign in with the business Google account to add photos.");
  say(ui.status, `Checking access for ${user.email}…`);
  try {
    // Readable only by approved accounts (see firestore.rules), so this doubles as an access check.
    await fs.getDoc(fs.doc(db, "admin", "access"));
  } catch (err) {
    return say(ui.status, `${user.email} isn't allowed to change the website photos.`, "error");
  }
  say(ui.status, `Signed in as ${user.email}`);
  ui.panel.hidden = false;
  loadList();
}

// ---------- Photo prep: resize, fix rotation, strip location metadata ----------
let images = null;

async function render(bitmap, max) {
  const s = Math.min(1, max / bitmap.width, (max * 2) / bitmap.height);
  const w = Math.round(bitmap.width * s), h = Math.round(bitmap.height * s);
  const canvas = Object.assign(document.createElement("canvas"), { width: w, height: h });
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  const encode = (type, q) => new Promise((r) => canvas.toBlob(r, type, q));
  let blob = await encode("image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", 0.85); // older Safari
  return { blob, w, h };
}

ui.file.onchange = async () => {
  images = null;
  ui.alt.value = "";
  ui.preview.hidden = true;
  const file = ui.file.files[0];
  if (!file) return;
  say(ui.msg, "Getting the photo ready…");
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const [large, small] = [await render(bitmap, 1280), await render(bitmap, 640)];
    bitmap.close?.();
    images = { large, small };
    ui.preview.src = URL.createObjectURL(small.blob);
    ui.preview.hidden = false;
    say(ui.msg, "");
  } catch (err) {
    console.error(err);
    say(ui.msg, "That photo couldn't be opened. Try a JPEG or PNG, or take a new one.", "error");
  }
};

// ---------- ✨ Write it for me ----------
const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

ui.suggest.onclick = async () => {
  if (!images) return say(ui.msg, "Pick a photo first.", "error");
  ui.suggest.disabled = true;
  say(ui.msg, "Writing a caption…");
  try {
    const { getAI, getGenerativeModel, GoogleAIBackend, Schema } = await sdk("ai");
    const model = getGenerativeModel(getAI(app, { backend: new GoogleAIBackend() }), {
      model: MODEL,
      systemInstruction: PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: Schema.object({
          properties: { caption: Schema.string(), description: Schema.string(), alt: Schema.string() },
        }),
      },
    });
    const notes = [ui.caption.value, ui.description.value].map((s) => s.trim()).filter(Boolean).join(" — ");
    const result = await model.generateContent([
      `Type of work: ${CATEGORIES[ui.category.value]}.${notes ? ` Owner's notes: ${notes}` : ""}`,
      { inlineData: { data: await toBase64(images.small.blob), mimeType: images.small.blob.type } },
    ]);
    const out = JSON.parse(result.response.text());
    ui.caption.value = (out.caption || "").slice(0, 80);
    ui.description.value = (out.description || "").slice(0, 500);
    ui.alt.value = (out.alt || "").slice(0, 200);
    say(ui.msg, "Here's a draft. Edit anything you like, then post.", "ok");
  } catch (err) {
    console.error(err);
    say(ui.msg, "Couldn't write one right now. You can type your own.", "error");
  } finally {
    ui.suggest.disabled = false;
  }
};

// ---------- Post ----------
ui.form.onsubmit = async (e) => {
  e.preventDefault();
  if (!images) return say(ui.msg, "Pick a photo first.", "error");
  const caption = ui.caption.value.trim();
  if (!caption) return say(ui.msg, "Add a short caption.", "error");
  ui.submit.disabled = ui.suggest.disabled = true;
  say(ui.msg, "Uploading…");
  try {
    const ref = fs.doc(fs.collection(db, "photos"));
    const parts = [["1280", images.large], ["640", images.small]].map(([size, img]) => ({
      img,
      path: `work/${ref.id}-${size}.${img.blob.type === "image/webp" ? "webp" : "jpg"}`,
    }));
    const [url1280, url640] = await Promise.all(
      parts.map(async ({ img, path }) => {
        const r = st.ref(storage, path);
        await st.uploadBytes(r, img.blob, {
          contentType: img.blob.type,
          cacheControl: "public, max-age=31536000, immutable",
        });
        return st.getDownloadURL(r);
      }),
    );
    await fs.setDoc(ref, {
      caption,
      description: ui.description.value.trim(),
      alt: ui.alt.value.trim() || caption,
      category: ui.category.value,
      url1280,
      url640,
      paths: parts.map((p) => p.path),
      width: images.large.w,
      height: images.large.h,
      smallWidth: images.small.w,
      createdAt: fs.serverTimestamp(),
    });
    ui.form.reset();
    ui.preview.hidden = true;
    images = null;
    say(ui.msg, "Posted! It's now on the Recent Work page.", "ok");
    loadList();
  } catch (err) {
    console.error(err);
    say(ui.msg, friendly(err), "error");
  } finally {
    ui.submit.disabled = ui.suggest.disabled = false;
  }
};

// ---------- Current photos ----------
async function loadList() {
  try {
    const snap = await fs.getDocs(fs.query(fs.collection(db, "photos"), fs.orderBy("createdAt", "desc")));
    if (snap.empty) {
      ui.list.replaceChildren(Object.assign(document.createElement("li"), { textContent: "No photos posted yet." }));
      return;
    }
    ui.list.replaceChildren(...snap.docs.map(row));
  } catch (err) {
    console.error(err);
    ui.list.textContent = "Couldn't load the photo list.";
  }
}

function row(d) {
  const p = d.data();
  const li = document.createElement("li");
  const img = Object.assign(document.createElement("img"), { src: p.url640, alt: "", loading: "lazy" });
  const text = document.createElement("div");
  const title = Object.assign(document.createElement("strong"), { textContent: p.caption });
  const date = p.createdAt?.toDate?.().toLocaleDateString() || "";
  const meta = Object.assign(document.createElement("span"), {
    textContent: [CATEGORIES[p.category], date].filter(Boolean).join(" · "),
  });
  text.append(title, meta);
  const remove = Object.assign(document.createElement("button"), { type: "button", className: "remove", textContent: "Remove" });
  remove.onclick = async () => {
    if (!confirm(`Remove “${p.caption}” from the website?`)) return;
    remove.disabled = true;
    try {
      await fs.deleteDoc(d.ref);
      await Promise.all((p.paths || []).map((path) => st.deleteObject(st.ref(storage, path)).catch(() => {})));
      loadList();
    } catch (err) {
      remove.disabled = false;
      alert(friendly(err));
    }
  };
  li.append(img, text, remove);
  return li;
}
