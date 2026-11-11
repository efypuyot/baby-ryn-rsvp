# Baby Ryn RSVP — corrected Vite build imports

## Why the build failed

`src/App.jsx` imports `./components/Decorations.jsx` and `./components/Photos.jsx`. Both files were absent from the ZIP you supplied, so Vite stopped at the first missing import. The fixed project contains both components.

## Files restored / added

- `src/components/Decorations.jsx` — clouds, pastel hot-air balloons, and decorative flowers (SVG).
- `src/components/Photos.jsx` — the `FlowerPhoto` and `RoundedPhoto` components used by the invitation screens.
- `src/components.css` and `public/flower-mask.svg` — responsive floral photo framing.
- `src/main.jsx` — imports `components.css`.

The current interactive envelope is already implemented **inside `src/App.jsx`**, so the obsolete standalone `src/components/EnvelopeReveal.jsx` is intentionally not included.

## Running locally

Extract the ZIP to a fresh folder, then:

```bash
cd baby-ryn-rsvp
npm install
npm test
npm run build
npm run dev
```

For the live site, **keep your existing `.env` file on your computer** or recreate it based on `.env.example`. This ZIP intentionally excludes `.env`, `.git`, `node_modules`, and `dist`. Your existing Supabase project, database, and Vercel environment variables are not changed by these code fixes.

If you are applying to an already-working repository, **merge just the restored files and the additional CSS import**. Your existing `src/config.js`, photos, and other customizations are already preserved in this ZIP as uploaded.

## Verification

- All relative JavaScript/JSX imports were checked to point to files that exist.
- All JavaScript/JSX sources passed a Babel syntax parse.
- All 7 existing RSVP utility tests passed.
- A complete production Vite build could not run in this isolated environment because npm packages could not be fetched. Run `npm run build` on your Mac to complete that check.

No Supabase SQL migration is required to repair the missing component imports.
