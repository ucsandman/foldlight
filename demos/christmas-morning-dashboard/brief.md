# Design brief: Christmas morning, first coffee

## The moment
It's Christmas morning, 6:40am, and the house is still asleep. One lamp is on in the corner, the only light besides the tree bulbs strung low across the mantel. This is the first coffee, held in both hands, white ceramic warm against my palms. Wool socks on the cold wood floor, steam curling up into the lamp's glow. Nobody else is up yet, and the quiet has a weight to it, the kind that only happens once a year.

## Register
product (an ops and finance dashboard, a small company's product register)

## Sensory inventory
| Row | Detail |
|---|---|
| Light | One tungsten lamp low in the corner, warm cast; tiny tree bulbs behind it add almost nothing; 6:40am means it is still dark outside; roughly ninety percent of the room unlit |
| Objects | White glazed mug, dark pine needle, honey-toned wood floor, black coffee in the cup, the amber filament of the lamp bulb, cream wool sock, the mug's shadowed underside |
| Materials | Glazed ceramic (dominant), wool, wood |
| Air | Warm, still, close, held-quiet |
| Tempo | Slow, unhurried, the slowest hour of the year |
| Sound | The house ticking, near silence, the last drip of the coffee maker |
| Gaze | Down, into the mug, at the floor |
| Text in the scene | A handwritten note tag left on the counter from wrapping gifts the night before |
| The document | The gift tag, two lines in pen |
| The gesture | Both hands wrapped around the mug |
| The keepsake | Steam rising through the lamp light |

## Light
Dark theme. "6:40am, one lamp, house asleep" forces it. The lamp is the brightest surface: whatever it touches (the mug, the cards nearest the sidebar header) sits lighter in value than the page around it. Shadows fall right and long, offset from a low light source in the corner, tinted toward tungsten (hue 55 to 70).

## Palette (OKLCH, each named after its object)
--bg:      oklch(0.16 0.014 65)  wood floor in lamp shadow
--surface: oklch(0.22 0.016 65)  mug's shadowed underside
--ink:     oklch(0.95 0.012 85)  mug glaze under lamp light
--accent:  oklch(0.74 0.15 58)   lamp bulb filament   (the only saturated role)
--muted:   oklch(0.6 0.018 70)   steam rising through the lamp light

Contrast checked with the linter's own OKLCH to sRGB path: ink on bg and ink on surface both clear 4.5:1, accent on bg clears 3:1.

## Material
Two materials, container and content: wood for the page (radius 4px, hairline borders, warm-tinted long shadow, no texture) and glazed ceramic for cards and panels (radius 6px, no borders, flat color, one tight shadow plus one wide warm one, offset right for the low-left lamp). Wool shows up only in spacing, not in any surface: the close, warm air row, never a knit texture.

## Composition
The document is a gift tag, two lines in pen: every panel carries at most two lines of metadata above its content, no eyebrow labels anywhere else. Gaze is down, so weight sits low and close, not pinned to the top edge. The content well (the register table and the chart) is the object of the page; the sidebar is a thin, quiet nav, not a hero. A left sidebar holds the company mark and five nav items; the content well holds the summary row, the table, the chart, and the reorder panel, each with generous inset padding so nothing runs edge to edge.

## Type
The object is the gift tag: a couple of lines in pen on cardstock, produced by hand, not by a machine. Voice words: handwritten, unhurried, intimate. Reflex picks (Caveat, Kalam, Homemade Apple) are the literal move and are discarded; a script face on a finance table would read as a decoration, not a room. Catalog search for a family with visible pen-like stress that still sits still on a data table: **Spectral** for display (a serif with soft, calligraphic-leaning strokes, used only on the company mark and section headings), **Karla** for body and all table, label, and metadata text (a humanist grotesk with round, warm terminals). Neither appears on the reflex-reject list.

## Motion
Slow and unhurried, 320 to 480ms, ease-out-quint with a long tail; no page-load sequence at all, the register is simply there when you arrive. Hover lightens a surface slightly toward the lamp's hue over 160ms. Press holds for a beat (60ms, fast) before releasing back over 380ms (slow), so pressing a row or the primary button feels like the weight of holding the mug, not a snap. Reduced motion removes all of it: instant state changes, the ambient steam drift frozen in place.

## Signature
A soft warm radial glow fixed at the top-left corner of the shell (the lamp itself, felt but never drawn as a lamp), and directly above the first summary card, a slow vertical drift of blurred, semi-transparent muted color that rises and settles on a 14 second loop, transform only, nowhere else on the page: the steam.

## Reflex ledger
| axis | reflex default | from the scene |
|---|---|---|
| Theme | Light theme, default for a finance dashboard | Dark: one lamp, 6:40am, the house still asleep forces it |
| Palette | Blue or indigo primary, neutral cool greys | Wood, ceramic, and lamp-ember hues; accent is hue 58, nowhere near the indigo band |
| Radius | 8px across the board (the generic AI default) | 6px on ceramic cards, 4px on the wood shell, split by material |
| Spacing | 1.5 open ratio, generous whitespace everywhere | 1.25, tighter and closer, because the room is warm and close, not cold and open |
| Motion | 200ms ease-in-out on everything, a fade-in page load | 320 to 480ms ease-out-quint, no page-load sequence, asymmetric press-and-release timing |
| Type | Inter for body, a geometric sans for display | Spectral display plus Karla body, chosen against the gift tag's pen |
| Composition | Centered hero, three feature cards, footer nav | A thin sidebar and a low, close content well; two-line metadata ceiling from the gift tag |
| Gesture | Instant hover, snap on click | Hover warms toward the lamp hue; press holds a beat before releasing |
| Signature | A generic loading spinner or empty decorative graphic | A fixed lamp glow plus a slow steam drift above the primary card, nowhere else |

## Never
Red-and-green color pairing. Snowflake, tree, gift box, or star iconography. The word "holiday" or any seasonal copy anywhere on the page.

## Checks
- **Kitsch:** the palette is wood floor, mug glaze, lamp ember, and steam; the signature is a corner glow and a slow drift. A stranger sees a dark, warm, lamp-lit ops tool at 6am, not a holiday. Pass.
- **Cream trap:** bg sits at L 0.16, surface at L 0.22, both far below the 0.84-0.98 warm near-white band the trap describes. Pass.
- **Swap:** replacing this moment with a rainy commute or a stadium at kickoff would change bg, ink, accent, tempo, composition, and the signature; none of those five would survive the swap. Pass.
- **Silhouette:** reduced to a 200px black-on-white shape, the fold reads as a thin left column plus an uneven content well (summary strip, a wide table, a narrower stacked pair of panels), not a centered hero with three equal cards. Pass.
- **Awwwards lane:** no viewport-scale headline, no monospace micro-labels, no floating pill nav, no cinematic dark scrim over a photo, no spring-physics hover; the sidebar is a plain fixed column and the only motion is the lamp-hue hover and the steam drift, both scene-derived. Pass.
