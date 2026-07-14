# AccountBrief source manifest

This manifest defines the feature package for the `automated-account-research-assistant` repository. Paths are relative to the workspace; feature files should retain the same repository-relative destinations.

## Application source

| Source of truth | Repository destination | Purpose |
| --- | --- | --- |
| `work/site-source/app/work/account-research/page.tsx` | `app/work/account-research/page.tsx` | Route entry point and page metadata |
| `work/site-source/app/work/account-research/AccountResearchAssistant.tsx` | `app/work/account-research/AccountResearchAssistant.tsx` | Interactive prototype, fixtures, claim model, safeguards, and evaluation UI |
| `work/site-source/app/work/account-research/AccountResearch.module.css` | `app/work/account-research/AccountResearch.module.css` | Responsive visual system, architecture diagram, focus states, and reduced-motion behavior |
| `work/site-source/app/work/account-research/account-research-model.mjs` | `app/work/account-research/account-research-model.mjs` | Query normalization, deterministic fixture resolution, and evaluation summary |

## Tests

| Source of truth | Repository destination | Purpose |
| --- | --- | --- |
| `work/site-source/tests/account-research.test.mjs` | `tests/account-research.test.mjs` | Route completeness, safety contract, source coverage, resolver, and abstention checks |

## Referenced demo assets

The walkthrough video and poster are served from `https://prasiddhakarki.online/demos/` and referenced with absolute HTTPS URLs by the interactive component. They are intentionally not duplicated in this lightweight source repository.

## Package documentation

| Generated file | Purpose |
| --- | --- |
| `README.md` | Public project overview, architecture, measured outcomes, safeguards, setup, and production seams |
| `MANIFEST.md` | Source-to-package inventory and handoff checklist |

## Runtime handoff

The feature source expects a Next.js App Router-compatible host with React, TypeScript, CSS Modules, and Node.js `>=22.13.0`. Preserve the host's package manifest, pnpm lockfile, root layout, TypeScript configuration, and Vinext/Vite configuration when exporting the route as-is, or supply equivalent standalone scaffolding. Do not copy build output, dependency directories, Wrangler state, local environment files, or the source repository's Git metadata.

## Verification checklist

- All four route files are present at `app/work/account-research/`.
- The focused test is present at `tests/account-research.test.mjs`.
- Both walkthrough asset URLs return successfully from the live portfolio.
- `node --test tests/account-research.test.mjs` passes.
- The live route renders at `/work/account-research`.
- No external research call or fabricated personal contact has been added during packaging.
