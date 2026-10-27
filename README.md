# High Country Jetting

Static multi-page redesign.

## Local preview

Requires Node.js 22 or later; no dependency installation needed.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173. Rebuild after edits, then refresh. Stop with Ctrl+C.

Builds default to preview mode with a review banner and noindex metadata. No deployment has been made. Business content needs client confirmation. Photos, Instagram feed, and photo submissions are pending account access/assets. Decorative mountain artwork is original illustration, not a job photo or final logo.

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

Use a client-owned Website Photos Drive folder and test uploads from the client's phone. Include service, town, caption, and publication permission. Review submissions, remove sensitive details/location metadata, optimize into `src/assets/work/`, and add approved entries to `work` in `src/content.mjs` with `src`, `alt`, `caption`, `width`, and `height`. Build, check, and deploy after review. Drive submissions do not automatically publish. Confirm future publishing responsibility and maintenance pricing at handoff.
