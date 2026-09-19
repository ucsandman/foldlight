# Translation: sense to token

Contents: 1 Light · 2 Objects to palette · 3 Materials · 4 Air · 5 Tempo and sound · 6 Text in the scene · 6b Gaze and the document · 7 Gesture · 8 Keepsake · 9 Checks · 10 Surfaces

Each section takes one row of the sensory inventory and turns it into a concrete decision. Apply every section; skipping one leaves that axis on its default, and defaults are what the user came here to escape.

## 1. Light → theme, brightest surface, shadow

Decide dark or light from the scene, in one sentence that forces the answer: "6am, one lamp, house dark" forces dark; "10am, snow glare through a south window" forces light. If the sentence does not force it, add detail until it does.

- **Time of day sets the theme.** Night, pre-dawn, a lit stage in a dark arena: dark theme. Daylight scenes: light theme. Dusk and golden hour: light theme with a darker-than-usual surface and warm ink, or dark with a lit band; pick the one the objects support.
- **The light source sets the brightest surface.** Whatever the source hits becomes `--surface` (cards, panels, the content well). The background is what sits outside the light. In a scene with one lamp, panels are lighter than the page; in a scene with an overcast sky, everything is close in value and hierarchy comes from ink weight instead.
- **Direction sets the shadow.** Low sun from the left means shadows offset right and long: `0 8px 24px -8px` with a warm tint. Overhead fluorescent means tight, neutral, almost no offset. Firelight or a screen glow means no drop shadow at all; use a soft inner glow or none.
- **Color temperature tints the neutrals.** Add 0.005 to 0.015 chroma toward the light's hue, not toward "warm" as a mood. Tungsten pushes toward hue 60 to 80; north window pushes toward 230 to 250; a stage rig toward whatever the wash color is.
- **How much is lit sets contrast range.** A scene mostly in shadow with one lit object gets a wide value gap between bg and surface. A bright, even scene gets a narrow gap and relies on borders.

## 2. Objects → palette

Take the five to eight objects from the inventory and assign roles. Every role is named after its object in the token comment; a token called `--cream` or `--paper` is a tell in itself.

| Role | Which object | Rule |
|---|---|---|
| `--bg` | The largest surface in the scene: the table, the floor, the sky, the wall | Never near-white warm by default. If the largest surface really is white (snow, a white tablecloth), use chroma 0 or tint toward the light source hue, not toward warmth |
| `--surface` | The object the light lands on | Sits above bg in value for a lit-object scene, below it for a scene where the panels are darker than the room |
| `--ink` | The darkest object with real color: pine needle, coffee, wet asphalt, the night sky between fireworks | Not #111. A dark green, a dark brown, a dark blue that a stranger reads as black until they look |
| `--accent` | The one thing in the scene that is bright: the ember, the ball's crystal, a yellow leaf, the confetti | The only saturated role. Used on primary action, selection, and the signature. Never in the indigo/violet band unless the scene really contains it (a stage wash, a jacaranda) |
| `--muted` | Secondary text and borders: steam, frost on the glass, the shadow side of the mug | Derived from ink at 55 to 65 percent, tinted the same hue |

Work in OKLCH. Check contrast after picking: ink on bg and ink on surface at 4.5:1 minimum, accent on bg at 3:1 for large text and icons.

Colors come from objects, never from the category. If the scene is a holiday and the palette you wrote could be printed on that holiday's greeting card, start over from the objects that are not the holiday's symbols: the mug, the window, the floor, the sleeve.

## 3. Materials → radius, border, texture, shadow

| Material in the scene | Radius | Border | Texture | Shadow |
|---|---|---|---|---|
| Wool, knit, felt | Pill or large (12 to 16px) | None or 1px in muted | Subtle grain overlay (2 to 4 percent) | Soft, wide, low opacity |
| Ceramic, glazed | Medium (8 to 10px is the AI default; go 6 or 12, not 8) | None | None; the glaze is the flat color | One tight shadow plus one wide one |
| Glass, crystal, ice | 2 to 4px | 1px, light on dark | Optional hairline highlight on the top edge | Sharp, short |
| Wet paper, cardboard, newsprint | 0 to 2px | 1px in ink at 20 percent | Paper grain at 3 to 6 percent | None; use borders for depth |
| Brushed steel, concrete, asphalt | 0px | 1px hairline | None | Hard, offset, neutral |
| Confetti, streamers, fabric in motion | Mixed: pills for chips, sharp for containers | None | None | None; motion carries the depth |
| Leaves, bark, wood grain | 4 to 6px | None | Fine grain overlay | Warm-tinted, offset toward the sun direction |

Pick the one material that dominates the inventory and commit the whole system to it. Two materials is allowed when one is the container and the other is the content (a ceramic mug on a wood table: wood for the page, ceramic for the cards).

## 4. Air → spacing and density

- **Cold, still, open** (a winter morning, an empty field): generous spacing, `clamp()` that breathes on wide viewports, few elements per fold, wide gutters.
- **Warm, close, crowded** (a packed square at midnight, a kitchen with everyone in it): tighter spacing, denser layouts, elements allowed to touch, less whitespace between sections.
- **Humid or heavy:** larger type, more line-height, slower everything.
- **Dry, crisp, sharp** (the first fall day): tight leading, crisp 1px rules, no blur anywhere, high value contrast.

Write the spacing scale as a ratio: 1.5 for open scenes, 1.25 for dense ones. Vary it: the tightest gap in the system should be visibly tighter than the loosest, so the layout has rhythm rather than one padding value repeated.

## 5. Tempo and sound → motion

Motion is the axis where the moment is most detectable and least often used. Set it from the tempo row, not from a motion library's defaults.

| Tempo of the moment | Durations | Easing | Page load | On user action |
|---|---|---|---|---|
| Slow, unhurried (a first coffee, a long bath) | 320 to 480ms | ease-out-quint, long tail | One slow reveal of the hero only, or none | Crossfade; nothing snaps |
| Held breath, anticipation (10, 9, 8...) | 200ms with deliberate pauses | ease-in-out for the count, ease-out for the release | A counted sequence that resolves once | Press states that hold, then release |
| Burst, release (the ball drops, the whistle blows) | 120 to 180ms | ease-out-expo | One hard cut at the moment of release, then stillness | Fast, decisive, no bounce |
| Crisp, brisk (a cold walk, a morning run) | 160 to 220ms | ease-out-quart | None; the page is simply there | Snappy, short travel |
| Drift (snowfall, leaves, steam) | One ambient loop at 8 to 20s | linear or sine | An ambient element that moves only on display surfaces, pauses off screen, never under reduced motion | Unaffected |

The sound row shapes the easing curve. A pop is ease-out-expo. A hum is linear or sine. A crunch is a two-stage ease with a short hold. Silence is no motion at all except what answers the user.

Reduced motion is not optional: every animation ships a `prefers-reduced-motion` alternative, usually an instant transition or a crossfade.

## 6. Text in the scene → typography

Find the lettering that physically exists in the moment: a gift tag in handwriting, the scoreboard in Times Square, a trailhead sign, a coffee bag label, a receipt, a wool sweater's woven tag, a chalkboard menu. That object is the type brief.

Procedure:

1. Name the object and its production method: letterpress, LED matrix, routed wood, a Sharpie, a knitting pattern, a typewriter.
2. Name three concrete voice words that describe it as an object: "stamped, worn, unhurried" or "lit, blocky, loud".
3. List the three fonts you would reach for by reflex, then check them against the reflex-reject list. These are the training-data defaults; any of them on a greenfield brief is a tell regardless of how well it fits:

   Inter · Geist · Roboto · Arial · Helvetica · Fraunces · Newsreader · Lora · Crimson (Pro, Text) · Playfair Display · Cormorant (Garamond) · Syne · IBM Plex (Sans, Serif, Mono) · Space Mono · Space Grotesk · DM Sans · DM Serif (Display, Text) · Outfit · Plus Jakarta Sans · Instrument Sans · Instrument Serif · Manrope · Sora · Caveat · Pacifico · Bebas Neue · Montserrat · Poppins · Open Sans · Lato · Raleway · Nunito

   Discard any that appear. The linter's `reflex-font` check enforces the core of this list on the token file.
4. Search a real catalog with the object in mind (Google Fonts, Velvetyne, Pangram Pangram, Future Fonts, Klim, ABC Dinamo). Choose the face that could plausibly have been used to make the object, then confirm the license and that it loads.
5. Display and body: one family with weight contrast, or two on a contrast axis (serif plus sans, geometric plus humanist). Never two similar sans faces.

Labels and UI text in product register stay in the body face; the scene's display face appears in headings and the signature only.

## 6b. Gaze and the document → composition

Layout is where AI sameness is structural, not cosmetic: reduce most generated pages to a 200px silhouette and they are the same page (centered hero, three cards, a footer). Two inventory rows fix the silhouette.

**Gaze sets gravity.** Where the eyes go in the moment is where the visual weight sits on the page.
- Looking up (a ball drop, fireworks, a ceiling): weight at the top, primary action high in the viewport, content hangs from the top edge.
- Looking down at your hands (a mug, a phone, a book): weight low and close, the content well is the object, generous margins around it.
- Looking out (a window, a horizon, a trail): a wide low band across the fold, horizontal rhythm, the fold is a horizon line.
- Looking across a crowd or a table: dense, many small things at similar weight, no single hero.

**The document sets the genre.** Every moment has a printed or physical object that belongs to it: a gift tag, a ticket stub, a trail map, a receipt, a setlist, a recipe card, a field notebook, a scoreboard. That object becomes the page's organizing idea, the way a real designer might lay out a landing page as an annual report or a museum label. It governs column structure, how sections are separated, how metadata is shown, and what the navigation is (a ticket has a stub; a map has a legend; a notebook has a margin). It never becomes decoration: no skeuomorphic torn edges, no paper texture on the whole page. The genre is felt in the structure and named nowhere.

Product register: the document sets density, section separation, and where metadata sits. It does not override standard affordances (tables stay tables, navigation stays findable).

## 7. Gesture → interaction signature

The one physical action of the moment becomes what the interface does when touched. Not a metaphor rendered literally, a quality of response.

- Wrapping hands around a mug → hover states warm slightly (surface lightens toward the light source hue), pressed states hold for a beat before releasing.
- Looking up at the ball → scroll-linked elements rise as you scroll down; the primary CTA is at the top of the viewport, not the bottom.
- Kicking through leaves → list items scatter a few pixels on hover and settle; drag interactions feel light.
- Pulling sleeves over hands → inputs and cards have generous inset padding; nothing is edge-to-edge.
- A toast, a cheer → confirmations expand outward once and stop; no confetti particles, the expansion is the cheer.

Apply it to at most three interaction types (hover, press, confirm) and keep it consistent across the product.

## 8. Keepsake → the signature element

The one thing remembered a year later becomes the one thing the framework does not ship. Exactly one. Candidates:

- A specific light: a gradient that exists only where the window is, top-left, and nowhere else on the page.
- A specific object rendered as a structural element: the ring of a mug as the loading indicator; the countdown as the progress bar; a single leaf-shaped clip-path on the hero image (once, never as a bullet icon).
- A specific rhythm: every panel enters on the count, and the last one lands on the beat.
- A specific texture: frost on the top edge of every glass panel; steam as a slow blur above the hero only.
- A specific typographic move: the display face set once at poster size, kerned by hand, and used nowhere else.

The signature is where the boldness is spent. Everything around it stays quiet. If a second signature appears, remove one.

## 9. Checks

Run all three before writing anything to disk. Report each verdict.

**Kitsch test.** Read the palette and the signature aloud. Could a stranger name the event? "Red, green, gold, snowflake loader" fails. "Dark pine ink, glazed white surface, one ember accent, a slow window-light gradient" passes; it is Christmas morning to the person who described it and a calm, lit room to everyone else.

**Cream trap.** Is `--bg` or `--surface` in OKLCH L 0.84 to 0.98, C under 0.06, hue 40 to 100? Then the moment translated into the 2026 AI default. Go back to the object and take its actual color, or move the warmth into the light source (shadow tint, the signature gradient) and set the role to chroma 0. A token comment that says bone, cream, paper, linen, oatmeal, or parchment is the same trap by name; a white mug under a cool sky is `oklch(0.97 0.004 240)`, not bone. (A smoke test passed bg and then named the surface "bone": that is the failure.)

**Swap test.** Replace the moment with a different one for thirty seconds (a rainy commute, a stadium at kickoff). Would bg, ink, accent, motion tempo, composition, and the signature all change? If any would survive the swap, that axis is still on its default. The reflex ledger in the brief is this test written down per axis.

**Silhouette test.** Describe the fold as a 200px black-on-white silhouette. If the description is "centered headline, subhead, two buttons, three boxes" or "massive headline, pill nav, one image", the layout came from the category, not from the gaze and document rows. Rebuild the composition from § 6b.

**Awwwards lane.** The current "premium" monoculture is as recognizable as the SaaS one: viewport-scale headline (10vw+), tiny monospace micro-labels, a floating pill nav, dark cinematic scrim over a photo, spring-physics hover on everything, every element animating in on scroll. Any of these appears only if a scene row produced it (a scoreboard's LED digits earn a large display; a stage's black earns the dark scrim). "Make it feel expensive" is not a scene row.

## 10. Surfaces

How loud the moment is allowed to be, by surface.

**Landing page, brand site, campaign.** Full volume. The fold is the moment: light and palette carry it, the signature sits in the hero, one page-load sequence at the moment's tempo. Imagery, if the scene implies it, is real (see impeccable's brand register on stock imagery; verify URLs). Copy takes the moment's tense and pace: short and present-tense for a burst, longer and unhurried for a slow morning.

**Dashboard, admin, product UI.** The moment at six in the morning on a Tuesday. It lives in: the neutral scale and its tint, dark or light, spacing density, the motion tempo of every transition, the type pairing, the interaction signature on hover and press. It does not live in: data colors (semantic, from the dataviz skill), status colors, navigation placement, table density beyond the air row's guidance. The accent appears on primary action, selection, and the signature only. The signature is small: a loading indicator, a focus ring, the empty state illustration.

**Theme or token package, light and dark.** Derive both from the same moment: the scene at its hour, and the same room after dark (or before dawn). Same objects, same materials; the light source changes. This produces a paired theme that is obviously one identity, unlike a generic inversion.

**Terminal, editor, or slide theme.** Palette and type only. Ink and bg from the objects, accent for the cursor or the current slide indicator, three or four syntax or content colors drawn from the remaining objects in the inventory. The signature is one thing: the cursor shape, the selection color, the slide transition.

**Component or single page inside an existing product.** The existing DESIGN.md wins on everything it specifies. The moment fills only the axes the existing system leaves open, and is recorded in DESIGN.md so the next component inherits it.
