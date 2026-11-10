# Baby Ryn's Christening — family RSVP 💙

A mobile-first React + Vite RSVP website inspired by the baby-blue invitation. Recognized godparents see a personalized letter. Other guests go straight to celebration details and a family/group RSVP. The parents can view responses and total attendee headcount.

## Quick start (fully working local demo)

You need **Node.js 20.19+ or 22.12+** and npm. In the project folder:

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite (usually http://localhost:5173). **Without `.env`, development runs in DEMO MODE:** responses are stored in your current browser's `localStorage`; the organizer view shows those demo records without a password. This is for local testing ONLY. Another browser, device, or visitor will **not** see those demo RSVPs. The local demo organizer view is **not secure**.

For a production Vercel deployment, the app requires Supabase configuration. It does not silently save RSVPs to localStorage in production.

## Add Baby Ryn's photos

Put these **three exact files** in `public/images/`:

| File | Photo | Display |
|---|---|---|
| `public/images/ryn-main.jpg` | Front-facing original photo | Flower-shaped crop on welcome screen |
| `public/images/ryn-letter.jpg` | Side-profile original photo | Rounded rectangle on godparent letter |
| `public/images/ryn-rsvp.jpg` | Close-up original photo | Flower-shaped crop on event details / RSVP |

The project deliberately contains **no baby photos**. Without them, it shows attractive placeholders instead of broken images. The invitation's watercolor colors, scallops, clouds, balloons, and flower frames are drawn with CSS/SVG. Prefer optimized JPEGs ~800–1200px across, with faces near the center; do not make the photos public if that isn't desired.

## Edit names, godparents, and event information

Open `src/config.js`:

- `EVENT` — baby's name, parents, ceremony, luncheon, deadline, Marie's contact details, maximum group size.
- `GODPARENTS` — the exact names and explicit aliases for Ninongs and Ninangs. **Currently only `Marie` is an illustrative godparent entry. Replace/complete the list before sharing.** A case-insensitive exact name/alias match triggers the letter; unknown or ambiguous names go directly to RSVP. No fuzzy guessing.
- `PHOTO_PATHS` — paths to your baby photos, if you change filenames.

Names and aliases in this client-side list are visible to anyone inspecting the deployed frontend. This is personalization, **not identity verification**. If private role recognition is needed, use individual invitation tokens and server-side matching instead.

## Set up Supabase for real shared RSVPs

1. Create a new Supabase project at https://supabase.com/ . Keep the database password private.
2. In **SQL Editor**, execute all SQL in `supabase/schema.sql`. This creates `rsvps`, `organizer_accounts`, validation constraints, and row-level security (RLS).
3. In **Authentication → Users**, use the Supabase dashboard to create an email/password organizer user for each parent/organizer. Note the **Auth User ID (UUID)**. Only trusted organizers should be provisioned.
4. In **SQL Editor**, authorize each organizer with their *real* UUID (replace the placeholder):

   ```sql
   insert into public.organizer_accounts (user_id)
   values ('PASTE-REAL-AUTH-USER-UUID-HERE');
   ```

5. In **Project Settings → API / Connect**, copy the project URL and **publishable (or legacy anon) public key**. Create a `.env` file in this project using `.env.example`:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
   ```

6. Restart `npm run dev`. The app will now use the real database. Use `Organizer view` and sign in with the organizer account you created.

**Security:** Anonymous visitors can only INSERT RSVP data (and may not read, update or delete any RSVPs). Authenticated organizers on the allowlist can SELECT all RSVPs (read-only). The application never includes a service-role/secret key. The organizer dashboard and RLS both check organizer access; RLS enforces database security even if someone bypasses the UI. Organizer accounts must be created and approved by the project owner in the Supabase dashboard/SQL editor — there is no public organizer signup page.

**Important limitations:** The anonymous form is intended for a small, trusted family event. Public anonymous inserts may still attract spam or fake entries. For stronger abuse prevention, add a protected serverless submission endpoint with CAPTCHA/rate limiting, rather than keeping a completely public anonymous insert route. A guest can misstate their name, godparent status, or group size; the name-only welcome is not an authentication mechanism. The SQL headcount maximum (`20`) should match `EVENT.maxAttendeesPerFamily`.

**Duplicates:** Clicking submit repeatedly is guarded and retries reuse the same unique submission ID. Separate form sessions are separate RSVP records; one family's record does not overwrite another family's record just because a representative name matches. Organizers can review duplicate names manually.

## Deploy on Vercel

1. Make sure Supabase is configured and your photos have been added.
2. Push the project to your Git repository (or import this folder into Vercel).
3. In Vercel choose **Framework Preset: Vite**, **Build Command: `npm run build`**, **Output Directory: `dist`**.
4. In Vercel Project Settings → Environment Variables set both:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy or redeploy after saving environment variables. Vite embeds these **public** values at build time. **Never** put a service role key, secret key, or organizer password in Vercel's `VITE_` variables or in frontend code.
6. Share the deployed URL with guests. Authorized parents can click **Organizer view** at the top right.

React's Vite output can be deployed as a static frontend, but **Vercel cannot persist RSVPs inside the HTML or source files**. Supabase is the shared backend.

## Run tests / production build

```bash
npm test
npm run build
npm run preview
```

Manual test checklist:

- Enter `Marie` → personalized **Ninang Marie** letter → details → RSVP.
- Enter an unknown name → skip letter → ceremony/luncheon details → RSVP.
- Accept with 4 total attendees → 1 RSVP response and 4 expected guests.
- Decline → 0 attendees; success copy reflects declining.
- Press submit twice quickly → only 1 submission for that form session.
- In local demo, check Organizer view in the **same browser** and its filter/search.
- In production, verify anonymous guests cannot view RSVP rows; approved organizers can read; non-organizer accounts cannot read.
- Remove a photo file → verify designed fallback; add photo → verify correct crop.
- Check a 320px-wide phone viewport and full desktop screen.

## Project tree

```text
baby-ryn-rsvp/
├── index.html
├── package.json
├── .env.example
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── ryn-main.jpg       ← add yourself
│       ├── ryn-letter.jpg     ← add yourself
│       └── ryn-rsvp.jpg       ← add yourself
├── src/
│   ├── App.jsx
│   ├── config.js
│   ├── styles.css
│   ├── components/{Decorations,Photos}.jsx
│   └── lib/{supabase,rsvp}.js
├── supabase/schema.sql
└── tests/utils.test.js
```

**RSVP deadline:** December 1, 2026. The website displays a courteous post-deadline notice but still allows late submissions, advising visitors to contact Marie about seating.
