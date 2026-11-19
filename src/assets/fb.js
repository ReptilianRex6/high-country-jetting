// Shared Firebase loader. Config comes from Firebase Hosting's reserved
// /__/firebase/init.json, so no keys live in the repo.

// reCAPTCHA Enterprise site key for App Check. Transcribed from the console:
// the character after "6uR" is a lowercase L, and the one before "Ogt" is a capital I.
const APP_CHECK_RECAPTCHA_SITE_KEY = "6Lf-LScuAAAAAEe6uRlAWWk-nv-6bR4Mb3n_IOgt";

const SDK = "https://www.gstatic.com/firebasejs/13.3.0";
export const sdk = (name) => import(`${SDK}/firebase-${name}.js`);

let appPromise;
export function getApp() {
  appPromise ??= (async () => {
    const res = await fetch("/__/firebase/init.json");
    if (!res.ok) throw new Error(`Firebase config unavailable (${res.status})`);
    const { initializeApp } = await sdk("app");
    const app = initializeApp(await res.json());
    // Before Firestore, Storage, or AI Logic so those requests carry a token.
    await initAppCheck(app);
    return app;
  })();
  return appPromise;
}

// The Firebase SDK loads reCAPTCHA Enterprise. Don't add a grecaptcha script tag.
async function initAppCheck(app) {
  // Debug provider only on a local host. The SDK prints a token to register in the console.
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await sdk("app-check");
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(APP_CHECK_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}
