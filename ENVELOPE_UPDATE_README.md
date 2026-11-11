# Interactive envelope

The personalized letter for recognized godparents opens as a CSS-animated envelope. The envelope code lives **inside `src/App.jsx`**; it uses `src/envelope.css` and inline SVG icons, so it does not depend on `src/components/EnvelopeReveal.jsx`.

Guests: name -> (if a godparent) tap sealed envelope -> tap/swipe to unfold letter -> RSVP. All other guests proceed directly to the celebration details and RSVP form.

For the missing-components build fix, see `BUILD_FIX_README.md`.
