// Shared Firebase loader. Config comes from Firebase Hosting's reserved
// /__/firebase/init.json, so no keys live in the repo.
const SDK = "https://www.gstatic.com/firebasejs/13.3.0";
export const sdk = (name) => import(`${SDK}/firebase-${name}.js`);

let appPromise;
export function getApp() {
  appPromise ??= (async () => {
    const res = await fetch("/__/firebase/init.json");
    if (!res.ok) throw new Error(`Firebase config unavailable (${res.status})`);
    const { initializeApp } = await sdk("app");
    return initializeApp(await res.json());
  })();
  return appPromise;
}
