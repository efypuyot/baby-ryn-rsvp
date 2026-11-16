# Personalized invitation routes

The website has a shared guest link and individual godparent links. It is still one React/Vite app with the same Supabase RSVP database.

## Links to share after deploying to Vercel

- Regular guests: `https://baby-ryn-rsvp.vercel.app/guest`
- Ninang Marie (personal link): `https://baby-ryn-rsvp.vercel.app/ninang-marie`
- `https://baby-ryn-rsvp.vercel.app/` also works as the shared guest invitation.

Every route opens the same welcome artwork with an **Open invitation** button. On personalized godparent routes, that button opens the animated envelope and then the person's letter. The RSVP displays their configured name without an input. On `/guest`, the button opens ceremony/luncheon details and RSVP; the visitor enters their name _there_.

The old `/#/organizer` URL and organizer login continue to work.

## Add another Ninong or Ninang

Edit `src/config.js` and add another item to `GODPARENTS` like:

```js
{
  name: "Juan Dela Cruz",
  role: "Ninong",
  slug: "ninong-juan",
  letter: {
    paragraphs: [`Write the full message here, including any closing.

Add a blank line between paragraphs.`],
  },
},
```

Then send `https://baby-ryn-rsvp.vercel.app/ninong-juan`. Each slug must be unique and in lowercase, with hyphens and no leading slash. Replace the single placeholder string in each godparent’s `letter.paragraphs` with their full message. Use a template literal to include line breaks.

## Invite a couple

Use one `GODPARENTS` entry with a shared slug and letter. Keep the first recipient’s
`role` and `name` on the entry and add `partner: { role: "Ninang", name: "Micah" }`
for the second recipient. If individual links already exist, list their slugs in
`routeAliases` on the shared entry and remove the separate entries.

Jase and Micah’s shared path is `/ninong-jase-and-ninang-micah`. Both names
appear on the invitation and in the saved RSVP. The adult count starts at two
and the couple can adjust it before submitting.

## Google Maps

The **luncheon card's View on Google Maps link** is now `https://maps.app.goo.gl/hVk58p2Q3ch3FEaD8`. The mini route map and its route link are unchanged. Reception remains marked tentative.

## Security and privacy

The personalized URLs provide convenience, **not identity verification**: anyone with a link can open it and submit an RSVP using that godparent name. Godparent names and letter text are bundled with the public website. Avoid private or sensitive content, and send links only to intended guests. The project adds a `noindex` meta tag to discourage search engine indexing, but this does not secure the URLs or prevent people sharing them.

## Deployment

Vercel uses the new `vercel.json` rewrite so `/guest` and godparent URLs load the same React app even if opened directly or refreshed. This is required for these routes.

This ZIP deliberately excludes `.env`, `.git`, `dist`, and `node_modules`. Preserve your existing Supabase environment variables in Vercel / your local `.env`. No Supabase migration is needed.

From the extracted `baby-ryn-rsvp` folder:

```sh
npm install
npm test
npm run build
npm run dev
```
