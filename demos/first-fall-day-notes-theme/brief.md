# Design brief: first crisp fall walk

## The moment
It's 8am on the first properly cold Saturday of the year, 48 degrees, sun low and gold but the air dry and sharp. I've got jeans on and a sweatshirt with the sleeves pulled over my hands, coffee steam curling off the cup. The sidewalk is scattered with wet leaves, yellow and brown and a few still stubbornly green, and everything looks sharper than it did in August. It's the perfect walk, brisk and clear, the kind where you notice your own breath.

## Register
product (a notes app theme pack; the moment sets the room, not the affordances)

## Light
8am, low gold sun, dry clear air, long shadows: forces a light theme for day. The paired night theme is the same walk after sunset, same objects lit by streetlight and porch light instead of the sun. The light source is what the sun (day) or the porch light (night) lands on, so surface sits above bg in the day pane; in the night pane surface (the denim, lit) is a step lighter than bg (the asphalt, unlit), same relationship.

## Palette (OKLCH, each named after its object)

### Day
--bg:      oklch(0.87 0.01 252)   heather grey sweatshirt cotton, tinted toward the sky
--surface: oklch(0.95 0.003 85)   white sky near the low sun
--ink:     oklch(0.26 0.035 264)  indigo denim jeans
--accent:  oklch(0.55 0.19 80)    the yellow leaf, held in the low sun (the only saturated role)
--muted:   oklch(0.55 0.02 258)   shadow side of the sweatshirt

### Night (same room, after dark)
--bg:      oklch(0.19 0.01 260)   wet asphalt after dark
--surface: oklch(0.28 0.035 264)  denim catching the porch light
--ink:     oklch(0.92 0.01 250)   sweatshirt cotton, pale against the dark
--accent:  oklch(0.55 0.19 80)    the same yellow leaf, still lit
--muted:   oklch(0.45 0.015 250)  streetlight glare on wet pavement

## Material
radius: 14px cards / 10px shell (cotton, large not pill) · border: 1px in muted · texture: none (flat cotton weave, no grain overlay) · shadow: soft, wide, low-opacity, cool-tinted (`--shadow-card`)

## Composition
The document is a folded trail map with a legend, so navigation is a horizontal legend of tag chips, not a tree. Gaze is out and ahead down the sidewalk, so the note list reads as a wide low band with horizontal rhythm (a scrolling row of cards, not a vertical stack). The open note and its toolbar sit below the band, generous inset padding throughout (sleeves pulled over hands: nothing runs edge to edge).

## Type
The woven neck tag inside the sweatshirt collar: stitched, plain, durable, one line of small caps. Reflex picks (Inter, DM Sans, Space Grotesk) rejected. Catalog search for a grotesk with soft, stitched-looking terminals and a real weight range landed on Schibsted Grotesk (Google Fonts, OFL licensed): one family, weight contrast (700 for headings and the toolbar label, 400/500 for body and list text), used for both display and body per product register (no separate display face).

## Motion
Brisk tempo: 180ms `--ease-out-quart` on hover and focus, no page-load sequence (the page is simply there). Confirmations (saving a note, closing the toolbar) use a short two-stage hold at `--duration-slow` (320ms), the crunch underfoot. `prefers-reduced-motion` collapses every transition to 0.01ms.

## Signature
One yellow leaf, rendered as a single clip-path shape in `--accent`, resting once on the night pane's empty-state card, whose background is the wet-asphalt `--bg`; never repeated as an icon or bullet anywhere else on the page.

## Reflex ledger
| axis | reflex default | from the scene |
|---|---|---|
| theme | dark by default for a "premium" notes app | light for day, paired dark for the same room after sunset, both from the same five objects |
| bg | warm near-white "cream" card surface | heather grey cotton tinted toward the sky, hue 252, outside the warm band |
| accent | indigo/violet brand blue | the yellow leaf, held against low sun, hue 80 |
| radius | 8px "AI default" medium rounding | 14px, cotton is soft and does not sit in the middle |
| navigation | vertical sidebar with icon list | a horizontal legend of tag chips, the trail map's key |
| list layout | tall vertical stack of rows | a wide low band, horizontal scroll, gaze reads out and ahead |
| spacing | tight, dense product chrome | generous inset padding, sleeves pulled over hands |
| motion | 250ms ease-in-out fade on everything | 180ms ease-out-quart, no page-load sequence, a two-stage hold on confirm |
| type | Inter or a geometric grotesk by reflex | Schibsted Grotesk, chosen for the stitched neck-tag object |
| signature | a seasonal icon in the empty state | one leaf clip-path, used exactly once, never as a bullet or nav icon |

## Never
orange-and-brown "autumn" palette, pumpkin or plaid texture anywhere, leaf icons used as navigation or list bullets

## Checks
- Kitsch: a stranger sees a cool grey notes app with a yellow selection color and cannot name the season from the screenshot. Pass.
- Cream trap: day `--bg` is L 0.87 but hue 252 (outside 40-100); day `--surface` is L 0.95 but chroma 0.003 (at/under the 0.004 floor). Neither lands in the warm near-white band. Pass.
- Swap: replacing the moment with "a rainy commute" would change bg, ink, accent hue, motion tempo (brisk to sluggish), the horizontal-band composition (to a dense list), and the signature (leaf to something else); every named axis moves. Pass.
- Silhouette: reduced to a 200px silhouette, the fold reads as a horizontal legend row over a wide horizontal card band over a lower editor block, not "centered headline, subhead, two buttons, three boxes." Pass.
- Awwwards lane: no viewport-scale headline, no monospace micro-labels, no floating pill nav, no dark cinematic scrim, no spring-physics hover, no scroll-in animation; the horizontal legend and card band came from the gaze and document rows, not a template. Pass.
