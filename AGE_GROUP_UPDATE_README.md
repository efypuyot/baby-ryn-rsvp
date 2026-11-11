# Adult / Kids / Infant RSVP Update

Your existing Supabase and Vercel projects are retained.

## 1. Database first

In Supabase Dashboard > SQL Editor, paste and run:
`supabase/2026-11-10_age_group_counts.sql`

The migration adds four nullable columns and preserves all existing responses. Previous rows intentionally have no invented age-group breakdown.

## 2. Copy these files into your CURRENT project

- `src/App.jsx`
- `src/utils.js`
- `src/lib/rsvp.js`
- `src/styles.css`

The ZIP also includes updated tests at `tests/utils.test.js`.

**Important:** Do not replace your existing `src/config.js`, `.env`, or photos; keep your actual godparents list and Supabase credentials. The updated code uses the same `EVENT.maxAttendeesPerFamily` value from your config.

## 3. Run and deploy

```
npm test
npm run build
git add src/App.jsx src/utils.js src/lib/rsvp.js src/styles.css tests/utils.test.js supabase/2026-11-10_age_group_counts.sql
git commit -m "feat: record adults kids and infants in family RSVPs"
git push
```

Vercel redeploys from the connected branch.

## Age groups / organizer totals

- Adults: 12+.
- Kids: 3–11.
- Infants: 0–2.
- Ask how many **of the infants already counted** need an individual seat and/or kiddie meal. This is a subset of infants and **not** an extra guest count.
- `attendee_count` includes every attendee, including infants.
- The estimated package count = adults + kids + infants with requested seat/meal. Venue policy is unverified; organizers should confirm actual seating/catering charges with the venue.
- Older rows' total attendance is included, while category/package estimates omit unclassified old attendees; dashboard highlights this clearly.
