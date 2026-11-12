# Personalized invitation routes

The website has a shared guest link and individual godparent links. It is still one React/Vite app with the same Supabase RSVP database.

## Links to share after deploying to Vercel

- Regular guests: `https://baby-ryn-rsvp.vercel.app/hello`
- Ninang Marie (configured sample): `https://baby-ryn-rsvp.vercel.app/ninang-marie`
- `https://baby-ryn-rsvp.vercel.app/` also works as the shared guest invitation.

Every route opens the same welcome artwork with an **Open invitation** button. On personalized godparent routes, that button opens the animated envelope and then the person's letter. The RSVP displays their configured name without an input. On `/hello`, the button opens ceremony/luncheon details and RSVP; the visitor enters their name *there*.

The old `/#/organizer` URL and organizer login continue to work.

## Add another Ninong or Ninang

Edit `src/config.js` and add another item to `GODPARENTS` like:

```js
{
  name: "Juan Dela Cruz",
  role: "Ninong",
  slug: "ninong-juan",
  letter: {
    teaser: "A special note from Baby Ryn.",
    paragraphs: [
      "Write an opening message specifically for Ninong Juan.",
      "Write a second, more personal paragraph based on what the family wants to say.",
    ],
    closing: "I can't wait to celebrate with you!",
  },
},
```

Then send `https://baby-ryn-rsvp.vercel.app/ninong-juan`. Each slug must be unique and in lowercase, with hyphens and no leading slash. The letter content should be written individually for each godparent. Only Marie has an example in this copy of the project because no other names or custom letters were provided.

## Google Maps

The **luncheon card's View on Google Maps link** is now `https://maps.app.goo.gl/hVk58p2Q3ch3FEaD8`. The mini route map and its route link are unchanged. Reception remains marked tentative.

## Security and privacy

The personalized URLs provide convenience, **not identity verification**: anyone with a link can open it and submit an RSVP using that godparent name. Godparent names and letter text are bundled with the public website. Avoid private or sensitive content, and send links only to intended guests. The project adds a `noindex` meta tag to discourage search engine indexing, but this does not secure the URLs or prevent people sharing them.

## Deployment

Vercel uses the new `vercel.json` rewrite so `/hello` and godparent URLs load the same React app even if opened directly or refreshed. This is required for these routes.

This ZIP deliberately excludes `.env`, `.git`, `dist`, and `node_modules`. Preserve your existing Supabase environment variables in Vercel / your local `.env`. No Supabase migration is needed.

From the extracted `baby-ryn-rsvp` folder:

```sh
npm install
npm test
npm run build
npm run dev
```
