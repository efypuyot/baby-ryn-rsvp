# Baby Ryn — subtle invitation animations

This update adds animations without changing your Supabase schema, RSVP code, godparent list, or photos.

## Applying this to your existing deployed project (recommended)

1. Copy `src/animations.css` into your **existing** project's `src/` folder.
2. In your existing `src/main.jsx`, immediately after `import './styles.css';`, add:

   ```js
   import './animations.css';
   ```

3. Run `npm run dev`, then `npm test` and `npm run build` in your project.
4. Commit and push. Vercel redeploys when your Git integration is configured.

**Do not replace your existing `src/config.js` or `.env` file.** This update uses only CSS and a stylesheet import. It does not touch Supabase or RSVP data.

### Effects
- Gently drifting clouds, balloons and decorative flowers
- Soft entrance animation on each invitation step
- Blooming baby-photo frames and staggered letter text
- Friendly hover/tap feedback on buttons and RSVP options
- Smooth appearance of family age counters and infant details
- Small heart and sparkles on the thank-you screen
- Subtle dashboard cards appearing in sequence

All motion is disabled by the visitor's operating-system **Reduce Motion** setting (`prefers-reduced-motion: reduce`). No extra packages are needed.

### Photo filenames (unchanged)

Place images inside `public/images/`:
- `ryn-main.jpg` — front-facing portrait
- `ryn-letter.jpg` — side-profile portrait
- `ryn-rsvp.jpg` — close-up portrait
