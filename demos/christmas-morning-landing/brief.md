# Design brief: first coffee, 6:40am, house asleep

## The moment
It's Christmas morning, 6:40am, and the house is still asleep. One lamp is on in the corner, the only light besides the tree bulbs strung low across the mantel. This is the first coffee, held in both hands, white ceramic warm against my palms. Wool socks on the cold wood floor, steam curling up into the lamp's glow. Nobody else is up yet, and the quiet has a weight to it, the kind that only happens once a year.

## Register and surface
brand; landing. The product is Carryover, a daybook for one-person shops: it writes one page overnight and the owner reads it before opening.

## Fold
ledger: the page keeps an account, every section is an entry on one pitch, and one column accumulates. Envelope measured on `fold-1440.png`: ruleRows=12.000 (floor 10), vRules=3.000 (floor 2), rightCol=0.377 (floor 0.35).

## Light
Source at 8 o'clock, 2400K, lit 12 percent; `--source-x 5.4% --source-y 52%`, key-angle 177deg, falloff 3, grain 0.055. Plate `assets/plate-01.png` provider=procedural (1536x1024, a rendered light study, never shipped: the ledger's plate is none). Safe box x46.9% y0% w53.1% h100%.

## Palette
Five roles, sampled, as written in `tokens.css`:

- `--bg` oklch(0.127 0.005 53) the room outside the lamp, plate luminance p06 to p20
- `--surface` oklch(0.243 0.034 72) the lit body of the subject, plate p55 to p72
- `--ink` oklch(0.823 0.057 75) the face of the light source itself, plate p98 and up
- `--accent` oklch(0.535 0.098 71) the hottest chroma the lamp makes, top 1 percent
- `--muted` oklch(0.628 0.045 75) 62 percent of the way from bg to ink, on ink hue

## Type
Bodoni Moda over Commissioner. Bodoni Moda ranked 2 of 2046 families by `fonts.mjs` (query pen/wedge/opsz,wght), Commissioner ranked 1 (query pen/round/wght); both specimens rendered at their real sizes on the sampled ground and read as PNGs. Bodoni Moda also carries the tabular figures the amount column needs, measured at 25 numeric cells with zero advance variance.

## Voice
Second person, quiet, median 5 to 9 words, ceiling 14, headline cap 8 words, clause cap 1, sentence-case labels, brand Carryover. The six states, shipped as `data-state` rows in the book:

- empty: Nothing has asked for you yet.
- loading: Counting what came in overnight.
- error: The count stopped at 5:02. Open the ledger and it starts again.
- offline: Nothing since 4:12. Whatever arrives will wait.
- done: That was all of it.
- first-run: This page is empty until tomorrow morning.

## Motion
Verb reveal; travel budget 1px, so nothing slides and the page moves in brightness only. Transient 90ms on the ceramic curve `cubic-bezier(0.18,0.92,0.14,1)`, transport 5.5bpm (a 10.9s breath on the beam), silence 300ms before the first entry lights, resolve once. The twin: under `prefers-reduced-motion` the lamp is already at full, the beam is held at 0.58, every ruling is lit one step brighter and nothing is waiting to arrive.

## Signature
The ruling is light: every rule on the page is a gradient whose brightness is set by its distance from the lamp (`--lit-row` 34 down to 22, dimming again across each rule toward the far corner), which is what lets a page of empty ruled lines read as a lit object instead of a void. Delete it and the grid stops being a room.

## Never
Three literal props: a tree, a gift or star or snowflake, any red and green pairing. They became the negative prompt `red and green pairing, any tree, star, gift or snowflake, any seasonal word, studio softbox, two light sources, colour gel, bokeh balls, glossy advertising retouch, text, watermark, illustration, CGI look`, and the one prop that emitted light stayed as `light.fill`: a line of very small warm bulbs low on a shelf far behind the camera, 2200K, faint.

## Measured
The eight verify lines are in `MEASURED.md`, verbatim, with the `fold.mjs` first line and the `plate-tokens` verdict.

## Files
`index.html`, `tokens.css`, `voice.json`, `shot.json`, `foldlight.json`, `assets/plate-01.png` (the plate this palette was sampled from), `assets/plate-01-photo.png` (the tournament's generated photograph, kept only as a comparison), `specimen.html` and `specimen.png`, `fold-card.html` and `fold-card.png`, `fold-1440.png`, `desktop.png`, `fold-390.png`, `mobile.png`, `reduced-fold-1440.png`.
