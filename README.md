# Baby Ryn — mobile browser update

This is a focused responsive update to the **animated React + age-group RSVP** app. It preserves your godparents in `src/config.js`, your Supabase connection, existing records, animations, and all event details.

## Use on your existing deployed repository

Copy these four files from the mobile update package into the same paths in your project:

- `src/responsive.css` — new responsive styles, iPhone-safe input sizes and touch targets
- `src/main.jsx` — imports `responsive.css` after the other styles
- `src/App.jsx` — mobile dashboard cards, focus / scroll behavior on screen transitions
- `index.html` — viewport safe-area support

If you've customized `src/App.jsx` or `index.html` since the earlier ZIP, **merge the changes instead of overwriting** those customizations. Keep your actual `src/config.js`, `.env` / Vercel environment variables, and Supabase data unchanged.

## Check on your computer

```bash
npm install
npm test
npm run build
npm run dev
```

Test with iPhone Safari and Android Chrome as well as your desktop browser's responsive device mode. Suggested widths: 320, 360, 375, 390, 430, 768, 1024 px. Check welcome, godparent letter, family age counters, thank-you, organizer login, mobile dashboard filtering and long messages. Check portrait and landscape orientation, and virtual keyboard behavior.

## Redeploy

```bash
git add index.html src/App.jsx src/main.jsx src/responsive.css
git commit -m "feat: improve mobile RSVP browser experience"
git push
```

No database migration is required for this mobile-only update.

## Photo filenames (unchanged)

Put your photos in `public/images/`:

- `ryn-main.jpg`
- `ryn-letter.jpg`
- `ryn-rsvp.jpg`

Note: the responsive mobile dashboard is a **card view**; the original full table remains for wider screens.

## Editing an RSVP

Guests can resubmit using the same name. Godparents can resubmit from their
personal invitation, including an alias of a couple’s shared link. A repeat
submission updates the matching response and keeps its original ID and creation
date. If older duplicate responses already exist, the save updates one match
and preserves the other rows.

In the Supabase SQL Editor, run
`supabase/2026-11-17_edit_rsvps.sql` after the age-group migration and before
deploying the frontend. The migration adds a save function without granting
direct guest access to read or update the RSVP table. The link or guest name
is the match key, so anyone who knows it can resubmit.

To roll back, redeploy the previous frontend first. The added column and
function can stay in place while the older insert-only code runs.
