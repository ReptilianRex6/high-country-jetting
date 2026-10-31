# High Country Jetting

## Branch workflow

- Work on `staging`. Pushes run `.github/workflows/firebase-staging.yml` and update Firebase's `client-review` channel, renewing it for 30 days after each successful deployment.
- GitHub uses Workload Identity Federation and a short-lived access token (no stored service-account key), restricted to this repository's staging branch. The cloud IAM setup is configured.
- Merge approved staging changes into `main` at launch. The main workflow currently checks the production build only; live deployment is deliberately disabled. Enable a separately authorized main-branch identity/deploy step at launch. Merging today will not publish to Firebase live.
- The older GitHub Pages preview remains available; Firebase is the review target going forward.
- Drain/sewer and property services share `/services/`, with separate sections. `/other-services/` forwards to the property section.

## Firebase review hosting

Project: `high-country-jetting` (selected in `.firebaserc`). Review channel: `client-review`.
Preview: https://high-country-jetting--client-review-a2lzch5c.web.app

The review channel expires November 29, 2026 unless renewed. It is publicly accessible by URL, with preview noindex rules. The existing custom domain has not been changed.

Refresh the review deployment after building and checking in preview mode, with `BASE_PATH` unset:

```sh
firebase hosting:channel:deploy client-review --project high-country-jetting --expires 30d
```

Firebase Auth is not used by this static site; a preview-channel Auth synchronization warning does not require enabling sign-in.

Static multi-page redesign.

## Local preview

Requires Node.js 22 or later; no dependency installation needed.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173. Rebuild after edits, then refresh. Stop with Ctrl+C.

Builds default to preview mode with a review banner and noindex metadata. No deployment has been made. Business content needs client confirmation. The supplied logo and six selected client photos are integrated. Instagram feed and photo submissions remain pending account access. Originals stay in src/assets; the build excludes original JPEGs/PDFs and ships the optimized WebP photos and logo PNG.

Edit `src/content.mjs` for services and approved gallery entries. Templates are in `scripts/build.mjs`; styling and navigation are in `src/assets/`.

Production build in PowerShell:

```powershell
$env:SITE_ENV = 'production'
npm run build
npm run check
Remove-Item Env:SITE_ENV
```

Production permits indexing and removes preview notices. Do not launch until content, integrations, and client review are complete. `firebase.json` prepares hosting; no Firebase project is selected. Use a client-owned project and provider billing. Preserve email DNS, inventory old URLs for redirects, and keep Squarespace running through migration validation.

## Photo workflow to set up

Use a client-owned Website Photos Drive folder and test uploads from the client's phone. Include service, town, caption, and publication permission. Review submissions, remove sensitive details/location metadata, optimize into `src/assets/work/`, and add approved entries to `work` in `src/content.mjs` with `slug`, `alt`, `caption`, `width`, and `height`; produce matching `<slug>-640.webp` and `<slug>-1280.webp` variants. Build, check, and deploy after review. Drive submissions do not automatically publish. Confirm future publishing responsibility and maintenance pricing at handoff.
