# Design brief: Saturday farmers market, 9am, August

## The moment
It's Saturday morning, just past 9am in August, and the farmers market is already thick with people. Tomatoes are piled into wooden crates, red and orange and some still green-shouldered, their skins warm from the truck ride in. Chalkboard signs lean against each stall, prices scrawled in white chalk and smudged where a thumb brushed past. The air is warm and close, thick with the smell of overripe fruit and cut basil. Everyone is talking at once, vendors calling out totals, a kid asking for a peach, a dog barking somewhere behind the crates. The sun is already high enough to throw hard shadows under every awning.

## Register
brand

## Sensory inventory

| Row | Notes |
|---|---|
| Light | Late-summer sun already well up by 9am, bright and even outdoors, canvas awnings cut hard-edged bands of shade across each stall; high contrast between full sun and awning shadow |
| Objects | Tomato skin, warm red-orange; weathered crate slats, sun-bleached grey-brown; chalkboard slate, near-black with a green cast; chalk dust, ghosted white where a price was wiped; cut basil, deep green; wildflower honey, amber in a jar; market pavement, sun-baked grey |
| Materials | Rough-sawn wood (dominant, the crates), painted slate and chalk dust, brown kraft paper (produce bags) |
| Air | Warm, close, crowded, dense; forty stalls packed into one lot, elbow to elbow |
| Tempo | Brisk, purposeful, no single event; a continuous overlapping bustle rather than a countdown or a reveal |
| Sound | Everyone talking at once: a hum of overlapping voices, no one sound cuts through |
| Gaze | Across the crowd, scanning stall to stall and crate to crate, no single point holds the eye |
| Text in the scene | Chalkboard prices, hand-chalked, uneven strokes, one board rubbed out and rewritten |
| The document | The chalkboard price list: item and price in a running column, corrections visible, no photography |
| The gesture | Hands moving over a crate, picking up a tomato and turning it to check the far side |
| The keepsake | The rubbed-out price with the new one rechalked next to it, still slightly smudged |

## Light
Bright, even daylight forces a light theme; 9am August sun with hard-edged awning shadow gives a narrow value gap between bg and surface, with hierarchy carried by borders rather than deep shadow. Shadows on the wood shell are warm-tinted and offset, following the low-morning sun.

## Palette (OKLCH, each named after its object)
--bg:      oklch(0.90 0 0)          sun-bleached pavement in the market aisle
--surface: oklch(0.80 0.025 70)     weathered crate wood, lit straight by the 9am sun
--ink:     oklch(0.24 0.03 155)     the chalkboard slate under the lettering
--accent:  oklch(0.58 0.20 32)      a tomato pulled warm out of the crate   (the only saturated role)
--muted:   oklch(0.58 0.025 155)    chalk dust ghosted on a board wiped and rewritten all morning

## Material
Two materials, container and content: rough-sawn wood for the page shell (radius 6px, no border, warm offset shadow toward the sun) and kraft paper for product and vendor cards (radius 2px, hairline ink border, no cast shadow, depth from the border instead).

## Composition
The document is the chalkboard price list, so the hero is built as a board: a running column of item/price rows, not a centered headline and subhead. Gaze moves across the crowd, so the product section is a dense, uneven grid where items vary in size rather than a hero-plus-three-cards layout; no single item is enlarged into a hero image.

## Type
Object: the chalkboard and the chalk stick, hand-lettered under a thumb-smudged edge. Voice words: blunt, pressed, immediate. Reflex picks (a literal chalk or marker script) rejected as the kitsch move. Display: Anton, a bold condensed grotesk built for shouted produce-stand pricing, used uppercase at poster weight for headings only. Body: Karla, a plain humanist sans for the running text, labels, and every price.

## Motion
Tempo is brisk with no single event, so there is no page-load sequence; the page is simply there when it loads. Interactions run 160 to 220ms on a flat ease-out-quart with no overshoot. The gesture (picking up a tomato to turn it) becomes the hover state: a product tile lifts a few pixels and tilts slightly, then settles. Reduced motion collapses both durations to 0ms.

## Signature
The one rewritten price on the hero board: the old number struck through in a fainter tone, the new number rechalked beside it in the accent color with a small note on when it changed, appearing once and nowhere else on the page.

## Reflex ledger
| axis | reflex default | from the scene |
|---|---|---|
| Theme | Dark, moody brand site by default | Bright, even daylight theme, forced by a 9am August sun |
| --bg | Warm cream near-white | Chroma-0 pavement grey, warmth pushed into the shadow and accent instead |
| --accent | Indigo or violet brand blue | A tomato red-orange at hue 32, the one saturated object in the scene |
| Material | 8px medium rounded cards everywhere | Two materials: 6px wood shell, 2px paper cards with borders instead of shadow |
| Air | Generous whitespace, one column of breathing room | Tight 1.25-feel spacing, items packed close, a crowded lot |
| Motion | A staged hero reveal on scroll or load | No load sequence at all; brisk 160 to 220ms interactions, nothing more |
| Type | Inter or a display serif for a brand hero | Anton for shouted pricing, Karla for the plain read |
| Composition | Centered headline, subhead, two buttons, three even cards | A price-board hero and an uneven grid sized by what's in the crate |
| Gesture | A generic scale-up hover | A tilt-and-lift that mimics turning a tomato over in hand |
| Signature | A decorative brand flourish | One rubbed-out, rechalked price, used exactly once |

## Never
No gingham, plaid, or basket-weave texture. No leaf or basket icon anywhere in navigation or as a bullet. No hand-lettered "farm fresh" script typeface.

## Checks

**Kitsch:** the palette reads as pavement grey, crate wood, slate ink, and one tomato-red accent; nothing on the page names a holiday or a seasonal cliche. A stranger sees a bright, crowded, honest storefront. Pass.

**Cream trap:** --bg is chroma 0, outside the trap by definition. --surface sits at L 0.80, below the L 0.84 floor of the warm near-white band. Pass.

**Swap:** replaced with a rainy commute, bg (wet asphalt, not chroma-0 pavement), ink, accent (no tomato red), tempo (unhurried or heads-down instead of brisk chatter), composition (a single horizon band instead of a crowded grid), and the signature (no rechalked price) would all change. Pass.

**Silhouette:** reduced to a 200px black-on-white silhouette, the fold reads as a dark board panel with a ragged list of rows beside a headline block, followed by an uneven grid of mixed-size tiles, not "centered headline, subhead, two buttons, three boxes." Pass.

**Awwwards lane:** no viewport-scale headline, no floating pill nav, no dark cinematic scrim, no mono micro-labels, no spring-physics hover; the nav is a plain underlined bar and the hero type tops out at 3rem. Pass.
