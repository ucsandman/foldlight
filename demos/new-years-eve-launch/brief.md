# Design brief: New Year's Eve, ten seconds up

## The moment
It's New Year's Eve, 11:59 in the square, thousands of us packed shoulder to shoulder, breath showing in the cold. Every face is tipped back, everyone looking up at the lit ball on its pole against the black sky. The digits change on the jumbotron in short white pulses. Nobody is talking anymore; the ten seconds before the ball drops go quiet all at once, a whole crowd holding one breath together. Then it releases, the ball falls, the roar goes up, and for a second the sky is full of paper and noise before it turns into just a cold night full of happy strangers.

## Register
brand (a product launch page; the moment carries the fold)

## Sensory inventory
| Row | What's there |
|---|---|
| Light | LED floodlights on the crowd, the ball lit from inside, jumbotron screens glowing white, black sky above, most of the square in shadow between the lit points |
| Objects | black sky, the crystal ball on its pole (white-blue facets), jumbotron digits (white LED block numerals), the crowd's dark wool coats, unopened paper confetti packets, breath visible in the cold, a folded wristband in someone's coat pocket |
| Materials | crystal and glass (dominant, the ball), LED matrix (the digits), wool (coats), paper (wristband, confetti) |
| Air | cold, dense, crowded, pressed close, dead still for ten seconds then suddenly loud |
| Tempo | 11:59, the last ten seconds counted in unison, one held breath, then release at zero |
| Sound | the crowd counting aloud together, then the roar and the pop of the ball's light burst |
| Gaze | up, every chin tipped back, everyone looking up at the ball |
| Text in the scene | the jumbotron's block LED digits, counting down |
| The document | an event wristband, a stub with a tear line, a gate number, one big digit |
| The gesture | chin tipped back, straining upward to see the ball over the crowd |
| The keepsake | the one second of total quiet across a whole crowd, right before zero |

## Translation

**Light -> theme:** "11:59, black sky, the only light is LED" forces dark. The lit ball and the jumbotron digits are the brightest points; everything else in the square sits in shadow between them, so surfaces stay close in value to bg and hierarchy leans on the lit accent and ink weight rather than a wide surface gap.

**Objects -> palette (OKLCH)**
- `--bg: oklch(0.13 0.015 255)` night sky over the square
- `--surface: oklch(0.185 0.016 255)` the crowd's wool coats, packed close
- `--ink: oklch(0.965 0.004 95)` jumbotron digit white, warmed a fraction by the LED tint
- `--accent: oklch(0.80 0.13 220)` the ball lit from inside, white-blue crystal
- `--muted: oklch(0.58 0.018 250)` breath visible in the cold air

**Materials -> radius/border/shadow:** crystal and glass dominate. Cards get a small 3px radius, no fill borders except a 1px light-on-dark hairline, a hairline highlight along the top edge to read as a lit facet, and short sharp shadows with almost no blur (`0 2px 6px`). No grain, no glass blur effects (glassmorphism is banned separately and the material calls for sharpness, not haze).

**Air -> spacing:** cold and crowded reads as a 1.2 spacing ratio, tight gutters, sections allowed to sit close, no wide breathing room anywhere on the page.

**Tempo/sound -> motion:** held breath then burst. The page-load signature counts 10 to 0 once, one real second per number (the crowd's actual count), each digit landing with a short 140ms ease-out-expo cut, no easing bounce. At zero the product name replaces the digit on the same 140ms cut and the page goes still; nothing else animates on load. Interaction motion (hover, press) runs on `--duration-fast` (150ms), decisive, no travel distance, no bounce.

**Text in the scene -> type:** the jumbotron's LED block digits. Voice words: lit, blocky, exact. Reflex picks - Space Mono, IBM Plex Mono, Roboto Mono - are on the reject list; a literal digital-clock face would also read as kitsch (a scoreboard prop, not a lit room). Catalog search for a wide, heavy grotesk with squared counters and a real weight range: **Archivo** (Google Fonts, width axis to Expanded, weight 900) for display, set once at the countdown and the hero line. Body face: **Public Sans** (Google Fonts), a plain, neutral humanist sans built for fast, legible reading in the cold, used everywhere else including labels.

**Gaze/document -> composition:** gaze is up, so the weight hangs from the top edge: nav is a thin single line, the hero (countdown, headline, primary CTA) sits in the top third, the rest of the fold stays dark and nearly empty until the explain section. The document is the event wristband: the page carries exactly one tear line (a single hairline rule separating the hero from what follows, not a torn graphic), one big number (the countdown digit itself, never repeated as decoration), and stub-style metadata (a small caps line reading like a gate/date/admission code) instead of section eyebrows.

**Gesture -> interaction signature:** chin tipped back to see the ball -> the primary CTA sits at the top of the hero, not the bottom; as you scroll, the explain and access sections rise slightly into place instead of fading, mirroring the crowd tipping up rather than any bounce or slide-from-side.

**Keepsake -> signature:** the one second of total quiet before zero. The countdown is a real counted sequence, ten to zero, that runs once per visit and lands the product name where the "0" would be. Under reduced motion the product name is simply present at load with no count. No other element on the page performs a load animation; the quiet second is spent once and not repeated.

## Reflex ledger
| Axis | Reflex default | From the scene |
|---|---|---|
| Theme | Light SaaS launch page, white bg | Black sky, dark theme forced by 11:59 and LED-only light |
| Palette hue family | Indigo/violet "premium" accent | Ball-crystal white-blue at hue 220, outside the indigo band |
| Radius | 8px default card radius | 3px, from crystal/glass, sharp not soft |
| Spacing | Generous 1.5 ratio "premium" whitespace | 1.2 ratio, tight, crowd pressed close |
| Motion | Scroll-triggered fade-ins on every section | One counted sequence in the hero only, then stillness; no scroll fades |
| Type | Space Mono or a literal LED/digital-clock face | Archivo Expanded 900, a heavy grotesk with squared counters, not a clock face |
| Composition | Centered hero, subhead, two buttons, three feature cards | Weight hung from the top edge; one tear line; one big number; stub metadata |
| CTA placement | Primary button below the fold or centered mid-hero | Primary CTA at the top of the hero, gaze pulls up not down |
| Signature | A gradient blob or animated background loop | One counted sequence, ten to zero, spent once |
| Access model | Three identical pricing cards | Two stub-style admission tiers, General Admission and Priority, named like ticket classes |

## Checks
- **Kitsch:** the palette reads as "night sky, crowd-coat charcoal, LED white, one lit crystal blue, cold-breath grey" - nameable as a dark, sharp launch page with a countdown, not as "New Year's". No champagne, no fireworks graphic, no gold-and-black. **Pass.**
- **Cream trap:** bg is L 0.13, surface L 0.185, both far outside the L .84-.98 warm-white band; no tell names used. **Pass.**
- **Swap test:** swapped for "a rainy commute" - bg, ink, accent, tempo, composition and the signature would all change (no countdown, no top-hung weight, warm grey not crystal blue). **Pass.**
- **Silhouette test:** at 200px black-on-white, the fold reads as a thin top nav, a short hairline, a big top-third number block with a button above it, then a single-rule divider and dense metadata line - not "centered headline, subhead, two buttons, three boxes." **Pass.**
- **Awwwards lane:** no viewport-scale (10vw+) headline, no floating pill nav, no dark cinematic scrim over a photo, no spring-physics hover, no scroll-triggered reveal library. The one exception earned by the scene is a large display numeral for the countdown, which the jumbotron row licenses directly. **Pass.**

## Never
Champagne glasses or flutes. Fireworks illustrations or particle bursts. A "2027" or year graphic as a hero image. (Confetti particles falling continuously and a gold-and-black palette are also excluded on the same grounds: they are the holiday's own iconography, not the scene's objects.)
