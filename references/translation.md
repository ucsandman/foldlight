# Translation: sense to token

Contents: 1 Light · 2 Objects to palette · 3 Materials · 4 Air · 5 Tempo and sound · 6 Text in the scene · 7 Gesture · 8 Keepsake · 9 Checks · 10 Surfaces

Composition is not here. Gaze and the document resolve to a fold by arithmetic in `scripts/fold.mjs`; the atlas and its aliases are `references/folds.md`.

Each section takes one row of the sensory inventory and turns it into a concrete decision. Apply every section; skipping one leaves that axis on its default, and defaults are what the user came here to escape.

## 1. Light → the record and the light kit

The Light row is a record, not a sentence. Five fields, all required; `shot.mjs` exits 3 when one is missing:

| Field | What it holds |
|---|---|
| `source` | The one lamp, window or sky, named as an object with its shade or aperture |
| `clock` | 1 to 12, where the key sits as seen from the camera |
| `kelvin` | The source's color temperature, a number |
| `litFraction` | 0 to 1, how much of the frame is lit |
| `fill` | Every light-emitting or reflecting item from the Never list, rewritten as light with its name removed |

The record compiles to the light kit. `plate-tokens.mjs` computes these from the plate and the shot record; the tables below are the cross-check, not a second source.

`clock` sets the light origin on the page:

| clock | `--source-x` | `--source-y` |
|---|---|---|
| 7 to 9 | 0 to 10 percent | 30 to 60 percent |
| 10 to 11 | 0 to 20 percent | 0 to 15 percent |
| 12 | 50 percent | 0 percent |
| 1 to 2 | 80 to 100 percent | 0 to 15 percent |
| 3 to 5 | 90 to 100 percent | 30 to 60 percent |
| 6 | 50 percent | 100 percent |

`litFraction` sets `--falloff`: 0.2 or under gives 3.0; 0.2 to 0.5 gives 2.2; over 0.5 gives 1.4. It also sets `--grain`: 0.055 at `--lit` 0.3 or under, else 0.

`kelvin` sets the tint of the neutrals: 2700 or under gives hue 60 to 75; 2700 to 4000 gives hue 75 to 90; 4000 to 5500 gives chroma 0; over 5500 gives hue 230 to 250. Tint toward the source's hue, never toward "warm" as a mood.

Dark or light is not argued. The plate decides it and `plate-tokens` prints it as `theme=dark` or `theme=light` on its verdict line. `--key-angle` is the only direction anything on the page casts, and `craft-lint shadow-origin` measures every drop shadow against it. The rest of the kit and the lamp on the page are in `references/light.md`.

## 2. Objects → palette

The five roles are sampled out of the plate by `plate-tokens.mjs`, not picked. This table is the cross-check: read the sampled value back against the object it should have come from, and when the two disagree the plate is wrong, not the table.

Take the five to eight objects from the inventory and assign roles. Every role is named after its object in the token comment; a token called `--cream` or `--paper` is a tell in itself.

| Role | Which object | Rule |
|---|---|---|
| `--bg` | The largest surface in the scene: the table, the floor, the sky, the wall | Never near-white warm by default. If the largest surface really is white (snow, a white tablecloth), use chroma 0 or tint toward the light source hue, not toward warmth |
| `--surface` | The object the light lands on | Sits above bg in value for a lit-object scene, below it for a scene where the panels are darker than the room |
| `--ink` | The darkest object with real color: pine needle, coffee, wet asphalt, the night sky between fireworks | Not #111. A dark green, a dark brown, a dark blue that a stranger reads as black until they look |
| `--accent` | The one thing in the scene that is bright: the ember, the ball's crystal, a yellow leaf, the confetti | The only saturated role. Used on primary action, selection, and the signature. Never in the indigo/violet band unless the scene really contains it (a stage wash, a jacaranda) |
| `--muted` | Secondary text and borders: steam, frost on the glass, the shadow side of the mug | Derived from ink at 55 to 65 percent, tinted the same hue |

Work in OKLCH. Check contrast after picking: ink on bg and ink on surface at 4.5:1 minimum, accent on bg at 3:1 for large text and icons.

**The drift rule.** A hand-picked role that differs from its sampled cluster by more than dL 0.04, dC 0.03 or dh 12 carries a `/* override: <reason> */` comment on its line, or `moment-lint --plate` fails it as `plate-drift`. An override with a reason is allowed; a silent nudge away from the photograph is not.

Colors come from objects, never from the category. If the scene is a holiday and the palette you wrote could be printed on that holiday's greeting card, start over from the objects that are not the holiday's symbols: the mug, the window, the floor, the sleeve.

## 3. Materials → radius, border, texture, shadow

| Material in the scene | Radius | Border | Texture | Shadow | Specular |
|---|---|---|---|---|---|
| Wool, knit, felt | Pill or large (12 to 16px) | None or 1px in muted | Subtle grain overlay (2 to 4 percent) | Soft, wide, low opacity | No specular at all; a fine lit fuzz where the rim light grazes the fibres, deep micro shadow between them |
| Ceramic, glazed | Medium (8 to 10px is the AI default; go 6 or 12, not 8) | None | None; the glaze is the flat color | One tight shadow plus one wide one | One hard specular highlight no wider than 4mm on the lit edge, then a long soft falloff across the body; the glaze reads wet, not matte |
| Glass, crystal, ice | 2 to 4px | 1px, light on dark | Optional hairline highlight on the top edge | Sharp, short | Two specular hits, one on the near wall and one refracted through the far wall |
| Wet paper, cardboard, newsprint | 0 to 2px | 1px in ink at 20 percent | Paper grain at 3 to 6 percent | None; use borders for depth | Not a `shot.mjs` material; the row is dropped from the prompt |
| Brushed steel, concrete, asphalt | 0px | 1px hairline | None | Hard, offset, neutral | A single anisotropic streak stretched along the brush direction |
| Confetti, streamers, fabric in motion | Mixed: pills for chips, sharp for containers | None | None | None; motion carries the depth | Not a `shot.mjs` material; the row is dropped from the prompt |
| Leaves, bark, wood grain | 4 to 6px | None | Fine grain overlay | Warm-tinted, offset toward the sun direction | A long low sheen running with the grain, never a hotspot |

The Specular column is the `MATERIAL` table in `scripts/shot.mjs`, verbatim, and it reaches the plate prompt in the order the Materials row lists. The five keys it knows are `glazed ceramic`, `wool`, `wood`, `glass` and `steel`; anything else is silently dropped, so name the dominant material with one of those words when you want it lit.

Pick the one material that dominates the inventory and commit the whole system to it. Two materials is allowed when one is the container and the other is the content (a ceramic mug on a wood table: wood for the page, ceramic for the cards).

**Peak and trough.** When a surface is a rendered range rather than a flat fill (a gradient, the plate, a lit panel), ink contrast is evaluated at the worst of flat, peak and trough, never at the modeled value. `craft-lint contrast` measures the painted pixel under the text, so grain and the lamp are already in the number: a modeled 4.66:1 measured 4.27:1 once the one grain layer was composited.

## 4. Air → spacing and density

- **Cold, still, open** (a winter morning, an empty field): generous spacing, `clamp()` that breathes on wide viewports, few elements per fold, wide gutters.
- **Warm, close, crowded** (a packed square at midnight, a kitchen with everyone in it): tighter spacing, denser layouts, elements allowed to touch, less whitespace between sections.
- **Humid or heavy:** larger type, more line-height, slower everything.
- **Dry, crisp, sharp** (the first fall day): tight leading, crisp 1px rules, no blur anywhere, high value contrast.

Write the spacing scale as a ratio: 1.5 for open scenes, 1.25 for dense ones. Vary it: the tightest gap in the system should be visibly tighter than the loosest, so the layout has rhythm rather than one padding value repeated.

## 5. Tempo and sound → motion

The Tempo row is one of five score words. Each carries its numbers; nothing here is chosen by taste.

| Score word | The moment | Travel | Transient | Durations |
|---|---|---|---|---|
| slow | a first coffee, a long bath | 1px | 90ms | 320 to 480ms |
| held | 10, 9, 8 | 4px | 200ms | the pause is the beat |
| burst | the ball drops, the whistle blows | 8px | 120ms | one cut, no tween |
| crisp | a cold walk, a morning run | 3px | 160ms | 160 to 320ms |
| drift | snowfall, leaves, steam | 2px | one ambient loop | 8 to 20s per loop |

The verb, the travel budget, the transport, the material curve and the reduced-motion twin are `references/motion.md`. The Sound row sets the transient's curve and the silence that must precede it; near silence means no motion at all except what answers the user.

## 6. Text in the scene → typography

Find the lettering that physically exists in the moment: a gift tag in handwriting, the scoreboard in Times Square, a trailhead sign, a coffee bag label, a receipt, a wool sweater's woven tag, a chalkboard menu. That object is the type brief.

Procedure:

1. Name the object and its production method: letterpress, LED matrix, routed wood, a Sharpie, a knitting pattern, a typewriter.
2. Name three concrete voice words that describe it as an object: "stamped, worn, unhurried" or "lit, blocky, loud".
3. Run `scripts/fonts.mjs` with the method, the three words as `--contrast` and `--terminal`, the document's width and the axes the display string needs; render the specimen at the real size on the real background; read the PNG and name the winner and the two runners-up. The procedure and the dial-to-flag table are `references/type.md`. The reflex list is not written out here: it lives in `references/reflex-fonts.json`, is applied by `fonts.mjs` as a demotion and by `moment-lint reflex-font` as a finding, and a listed family passes only with `/* fonts.mjs rank=<1..3> */` beside it in the token file.

Labels and UI text in product register stay in the body face; the scene's display face appears in headings and the signature only.

## 7. Gesture → interaction signature

The one physical action of the moment becomes what the interface does when touched. Not a metaphor rendered literally, a quality of response.

- Wrapping hands around a mug → hover states warm slightly (surface lightens toward the light source hue), pressed states hold for a beat before releasing.
- Looking up at the ball → scroll-linked elements rise as you scroll down; the primary CTA is at the top of the viewport, not the bottom.
- Kicking through leaves → list items scatter a few pixels on hover and settle; drag interactions feel light.
- Pulling sleeves over hands → inputs and cards have generous inset padding; nothing is edge-to-edge.
- A toast, a cheer → confirmations expand outward once and stop; no confetti particles, the expansion is the cheer.

Apply it to at most three interaction types (hover, press, confirm) and keep it consistent across the product.

## 8. Keepsake → the signature element

The one thing remembered a year later becomes the one thing the framework does not ship. Exactly one, and it is structural, not ornamental.

The keepsake is the one thing the fold does that its recipe did not require: the accumulating column, the lit ruling, the plate's safe-box headline. If the signature can be deleted without changing the grid, it is decoration; find the structural one.

The signature is where the boldness is spent. Everything around it stays quiet. If a second signature appears, remove one.

## 9. Checks

Four reading checks. Each one now has an instrument beside it; the reading is what you do before the instrument runs, and both verdicts go in the response.

**Kitsch test.** Read the palette and the signature aloud. Could a stranger name the event? "Red, green, gold, snowflake loader" fails. "Dark pine ink, glazed white surface, one ember accent, a slow window-light gradient" passes; it is Christmas morning to the person who described it and a calm, lit room to everyone else.
Measured by: `copy-lint prop-leak` on the rendered strings, and the fold-card read at step 6.

**Cream trap.** Is `--bg` or `--surface` in OKLCH L 0.84 to 0.98, C under 0.06, hue 40 to 100? Then the moment translated into the 2026 AI default. Go back to the object and take its actual color, or move the warmth into the light source (shadow tint, the signature gradient) and set the role to chroma 0. A token comment that says bone, cream, paper, linen, oatmeal, or parchment is the same trap by name; a white mug under a cool sky is `oklch(0.97 0.004 240)`, not bone. (A smoke test passed bg and then named the surface "bone": that is the failure.)
Measured by: `moment-lint cream-trap`, plus `tell-name` for the trap by name.

**Swap test.** Replace the moment with a different one for thirty seconds (a rainy commute, a stadium at kickoff). Would bg, ink, accent, motion tempo, composition, and the signature all change? If any would survive the swap, that axis is still on its default.
Measured by: the chain itself, run twice. `fold.mjs` takes the grid from the other moment's document row, `plate-tokens.mjs` samples the other plate, `fonts.mjs` re-queries and `voice.json` re-derives; any output that comes back identical is the axis that survived the swap.

**Awwwards lane.** The current "premium" monoculture is as recognizable as the SaaS one: viewport-scale headline (10vw+), tiny monospace micro-labels, a floating pill nav, dark cinematic scrim over a photo, spring-physics hover on everything, every element animating in on scroll. Any of these appears only if a scene row produced it (a scoreboard's LED digits earn a large display; a stage's black earns the dark scrim). "Make it feel expensive" is not a scene row.
Measured by: `silhouette-lint AWWWARDS_FOLD` at 3 of 4 on the rendered fold, with `moment-lint scrim` on the token file.

## 10. Surfaces

How loud the moment is allowed to be, by surface.

**Landing page, brand site, campaign.** Full volume. The fold is the moment: light and palette carry it, the signature sits in the hero, one page-load sequence at the moment's tempo. Copy takes the moment's tense and pace: short and present-tense for a burst, longer and unhurried for a slow morning.

**Dashboard, admin, product UI.** The moment at six in the morning on a Tuesday. It lives in: the neutral scale and its tint, dark or light, spacing density, the motion tempo of every transition, the type pairing, the interaction signature on hover and press. It does not live in: data colors (semantic, from the dataviz skill), status colors, navigation placement, table density beyond the air row's guidance. The accent appears on primary action, selection, and the signature only. The signature is small: a loading indicator, a focus ring, the empty state illustration. The empty state is the moment's actual content and is written at step 5b, not improvised at build time.

**Theme or token package, light and dark.** Derive both from the same moment: the scene at its hour, and the same room after dark (or before dawn). Same objects, same materials; the light source changes. This produces a paired theme that is obviously one identity, unlike a generic inversion.

**Terminal, editor, or slide theme.** Palette and type only. Ink and bg from the objects, accent for the cursor or the current slide indicator, three or four syntax or content colors drawn from the remaining objects in the inventory. The signature is one thing: the cursor shape, the selection color, the slide transition.

**Component or single page inside an existing product.** The existing DESIGN.md wins on everything it specifies. The moment fills only the axes the existing system leaves open, and is recorded in DESIGN.md so the next component inherits it.
