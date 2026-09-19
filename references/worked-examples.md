# Worked examples

Three moments run through the full pipeline. Read once for calibration. Never copy a palette from here into a project; the point is the shape of the reasoning, and a moment the user did not supply is not theirs.

Contents: 1 Christmas morning coffee (dashboard) · 2 New Year's Eve ball drop (landing page) · 3 First crisp day of fall (theme pack)

---

## 1. Christmas morning, coffee, house still asleep → a finance dashboard

### Moment (expanded)
6:40am, still dark outside. One lamp in the corner and the tree lights, nothing overhead. The first mug of coffee, white glazed ceramic, warm through both hands. Wool socks on a wood floor. Steam rising in the lamp light. Nobody else is up; the quiet has a weight to it. The only lettering in the room is the handwritten tags on the gifts.

### Inventory
- Light: one tungsten lamp, low left; tree lights as tiny warm points; 90 percent of the room in shadow
- Objects: white glazed mug, dark green needles, wood floor, red-brown coffee, the ember-orange of the lamp bulb, cream wool socks, shadow-side of the mug
- Materials: ceramic (dominant), wool, wood
- Air: warm, still, close, quiet
- Tempo: slow, unhurried; the slowest hour of the year
- Sound: the house ticking; near silence
- Gaze: down, at the mug and the floor; nothing above eye level matters
- Text in the scene: handwritten gift tags in pen
- The document: the gift tag, a small card with two lines on it
- Gesture: both hands around the mug
- Keepsake: the lamp light on the steam

### Translation
- **Theme:** dark. "6:40, one lamp, everything else off" forces it.
- **Brightest surface:** what the lamp hits, the mug. Panels are lighter than the page.
- **Palette**
  - `--bg: oklch(0.19 0.012 70)` wood floor in shadow
  - `--surface: oklch(0.25 0.014 70)` mug's shadow side
  - `--ink: oklch(0.94 0.01 80)` mug glaze under lamp light (light ink on dark)
  - `--accent: oklch(0.72 0.16 55)` lamp bulb ember
  - `--muted: oklch(0.62 0.02 75)` steam
  - Pine `oklch(0.32 0.06 155)` reserved for one thing: the selected-row background. The season is in the room, not on the card.
- **Material:** ceramic. Radius 6px, no borders, flat surfaces, one tight shadow plus one wide warm-tinted one, offset right (lamp is low left).
- **Air:** warm and close: 1.25 spacing ratio, denser than a default dashboard, tables allowed to sit closer to their headers.
- **Motion:** slow. 360ms ease-out-quint on every transition, no page-load sequence at all; the dashboard is simply there when you arrive. Reduced motion: instant.
- **Type:** the gift tag. Voice words: handwritten, small, unhurried. Reflex picks (Inter, Fraunces, Caveat) rejected; Caveat is the literal move. Display goes to a humanist serif with visible pen-like stress found by catalog search; body is a humanist sans with round terminals. Labels and data stay in the body face.
- **Gesture:** both hands around the mug → hover on any panel lifts its surface by 0.02 L toward the lamp hue; press holds 80ms before release.
- **Composition:** gaze is down, so the weight sits low and close: the content well is the object, generous margins around it, nothing pinned to the top edge beyond a thin nav. The document is a gift tag, so every panel carries at most two lines of metadata, set small, above its content; no eyebrow labels anywhere else.
- **Signature:** the lamp light. A single radial gradient anchored top-left of the viewport, warm hue, 6 percent opacity, that does not move and appears nowhere else. Every panel near it reads as lit; panels far from it read as in the room's shadow.
- **Never:** red-and-green pairing, snowflakes, a gift or tree icon, a "holiday" empty state.

### Checks
- Kitsch: a stranger sees a dark, lamp-lit finance tool. Pass.
- Cream trap: bg is L 0.19. Pass.
- Swap (to "rainy commute"): bg, ink, accent, tempo, and signature all change. Pass.

### Where it shows up on the dashboard
Neutral scale, dark theme, lamp gradient, 360ms transitions, pine selected-row, ember on the primary button and the current nav item. Chart series colors come from the dataviz skill, not from this palette. Nothing else changes.

---

## 2. New Year's Eve when the ball drops → a product launch landing page

### Moment (expanded)
11:59pm in a packed square, cold enough to see breath. Everyone looking up. The ball is a crystal sphere on a pole, LED-lit, changing color, against a black sky. The screens are counting in white block digits. Ten seconds where nobody speaks, then the release: the roar, the confetti, kissing strangers. Then it is just a cold night again and everyone is happy.

### Inventory
- Light: LED, from above and ahead; the sky is black; the crowd is lit from the ball and the screens
- Objects: black sky, crystal ball (white-blue when lit), screen digits (white), the crowd's dark coats, confetti (paper white, one metallic), breath in cold air
- Materials: crystal and glass (dominant), paper confetti, wool coats
- Air: cold, crowded, tight, loud after the drop
- Tempo: held breath for ten counts, then one burst, then stillness
- Sound: the count, then the roar; a pop
- Gaze: up, everyone's chin lifted
- Text in the scene: the countdown digits, LED matrix, block, white
- The document: the event ticket, a stub with a tear line and one big number
- Gesture: looking up
- Keepsake: the ten seconds of quiet before the roar

### Translation
- **Theme:** dark, black sky. Forced.
- **Brightest surface:** the ball and the digits. Surfaces are black; the lit elements are the content itself.
- **Palette**
  - `--bg: oklch(0.12 0.01 260)` night sky
  - `--surface: oklch(0.17 0.012 260)` crowd's coats
  - `--ink: oklch(0.97 0 0)` screen digits, chroma 0
  - `--accent: oklch(0.86 0.09 230)` crystal lit from inside, white-blue
  - `--muted: oklch(0.6 0.015 250)` breath in cold air
  - One metallic confetti tone, used once in the signature.
- **Material:** crystal and glass. Radius 2px, 1px light borders on dark, a hairline highlight on every panel's top edge. Sharp short shadows.
- **Air:** cold and crowded: tight spacing (1.2 ratio), elements allowed to touch, the fold is dense.
- **Motion:** held breath then burst. Page load is one counted sequence: the hero counts down over 2s with deliberate 200ms holds, then the headline cuts in at 140ms ease-out-expo. After that, stillness; no scroll-triggered fades anywhere. On user action: fast and decisive, 150ms, no bounce. Reduced motion: headline is present immediately.
- **Type:** LED matrix block digits. Voice words: lit, blocky, loud. Reflex picks (Space Mono, IBM Plex Mono, Inter) rejected; Space Mono is the literal move. Display goes to a wide, heavy grotesk with squared counters found by catalog search; body is a plain neutral sans at generous size for a cold, fast read.
- **Gesture:** looking up → the primary CTA sits at the top of the hero, not below the fold; scroll-linked elements rise slightly as you scroll down.
- **Composition:** gaze is up, so the weight hangs from the top edge: headline and primary CTA in the top third, the rest of the fold nearly empty black. The document is a ticket stub, so the page has exactly one tear line (a single rule separating the fold from what follows) and one big number (the countdown), and metadata reads like a stub: date, place, one line.
- **Signature:** the ten seconds of quiet. The countdown is real: it counts, and the product's name lands on zero. It runs once per visit. Nothing else on the page animates on load.
- **Never:** champagne glasses, fireworks illustrations, "2027" as a graphic, gold-and-black as a palette, confetti particles falling continuously.

### Checks
- Kitsch: a stranger sees a dark, sharp, lit launch page with a countdown reveal. A countdown alone does not name the holiday. Pass.
- Cream trap: not applicable, dark bg. Pass.
- Swap (to "Christmas morning"): every axis changes. Pass.

---

## 3. First crisp day of fall, jeans and a sweatshirt → a light and dark theme pack for a notes app

### Moment (expanded)
Saturday, 8am, 48 degrees. The sun is low and gold but the air is cold and dry. Wet leaves on the sidewalk, yellow and brown, some still green. A grey cotton sweatshirt with sleeves pulled over hands, jeans, the first walk that needs them. Coffee steam is visible. Everything looks sharper than it did in August.

### Inventory
- Light: low gold sun from the right, long shadows, dry clear air, high contrast
- Objects: grey cotton sweatshirt, indigo denim, wet asphalt, yellow leaf, brown leaf, a still-green leaf, white sky near the sun, coffee cup lid
- Materials: cotton (dominant), wet paper (the leaves), asphalt
- Air: cold, dry, crisp, open
- Tempo: brisk; a walk with purpose
- Sound: leaves crunching; a two-stage sound with a short hold
- Gaze: out and ahead, down the sidewalk, horizon low
- Text in the scene: the sweatshirt's woven neck tag; a trailhead sign further on
- The document: a trail map, folded, with a legend
- Gesture: sleeves pulled over hands
- Keepsake: the one yellow leaf on wet black asphalt

### Translation
- **Theme:** light for the day, dark for the same walk after sunset. Both from the same objects.
- **Brightest surface:** whatever the low sun hits. Surface is lighter than bg, shadows long and warm, offset left (sun from the right).
- **Palette, day**
  - `--bg: oklch(0.88 0.008 250)` heather grey sweatshirt cotton, tinted toward the sky, not toward warmth
  - `--surface: oklch(0.96 0.006 90)` white sky near the sun
  - `--ink: oklch(0.24 0.03 265)` indigo denim, dark enough to read as near-black
  - `--accent: oklch(0.82 0.17 95)` the yellow leaf
  - `--muted: oklch(0.52 0.02 255)` shadow side of the sweatshirt
- **Palette, night:** same objects after dark. bg becomes wet asphalt `oklch(0.2 0.01 260)`, surface the denim `oklch(0.27 0.03 265)`, ink the cotton `oklch(0.9 0.008 250)`, accent stays the leaf, muted the asphalt highlight. One identity, two hours.
- **Material:** cotton. Radius 12px, 1px muted borders, a 3 percent grain overlay, soft wide low-opacity shadows tinted toward the sun.
- **Air:** cold, dry, open: 1.5 spacing ratio, generous gutters, tight leading, crisp 1px rules, no blur anywhere.
- **Motion:** brisk. 180ms ease-out-quart everywhere. No page-load sequence. Confirmations use a two-stage ease with a 60ms hold (the crunch). Reduced motion: instant.
- **Type:** the woven neck tag. Voice words: stitched, plain, durable. Reflex picks (Inter, DM Sans, Instrument Sans) rejected. A single grotesk with a real weight range, chosen by catalog search for slightly soft, stitched-looking terminals, used at three weights. No display face; the notes app is product register.
- **Gesture:** sleeves over hands → every input and card carries generous inset padding; nothing runs edge to edge; the editor has a wide comfortable margin.
- **Composition:** gaze is out and ahead, so the notes list reads as a wide low band with horizontal rhythm, not a tall sidebar stack. The document is a trail map, so navigation is a legend: a short key of tags at the edge of the view, and folders read as regions rather than a tree.
- **Signature:** the leaf on asphalt. Exactly one place in the product uses the accent at full size: the empty state, where a single leaf-shaped clip-path in the accent sits on the dark asphalt tone. Never as an icon, never as a bullet, never repeated.
- **Never:** orange-and-brown palette, pumpkin anything, a plaid texture, leaf icons in navigation.

### Checks
- Kitsch: a stranger sees a cool grey notes app with a yellow selection color. Pass.
- Cream trap: bg L 0.88, but hue 250 and C 0.008; outside the warm band. Pass. (Had the sweatshirt been oatmeal, bg would have landed in the trap; the fix would have been chroma 0 with the warmth moved into the shadow tint.)
- Swap (to "New Year's Eve"): every axis changes. Pass.
