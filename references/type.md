# Type: the lettering in the scene, found by query and confirmed on a specimen

The Text in the scene row names lettering that physically exists in the moment: a gift tag in pen, a
scoreboard in LEDs, a routed trailhead sign, a letterpressed label. That object is the type brief.
`scripts/fonts.mjs` turns it into a catalog query; the specimen PNG decides.

## 1. Why a query

A ban list can only subtract. Reject Inter and Fraunces and the next pick is Spectral and Karla,
forever, because the reflex is not a list of names, it is the habit of naming a face from memory.
A query searches 2046 live families by the physical facts of the lettering (how the stroke was made,
how it ends, how wide the document is, which axes the string needs) and ranks what it finds, so the
answer can be a face nobody reaches for. The reflex list survives only as a post-filter that demotes
a listed family by a large penalty instead of deleting it, so a listed face can still win on the
evidence and be recorded with its rank.

## 2. The dial to flag table

| Inventory row | Flag | How to read it |
|---|---|---|
| Text in the scene, production method | `--method pen \| led \| letterpress \| routed \| typewriter \| stamp \| screen` | The tool that made the letters, not the mood. Each method vetoes its literal trap: `pen` penalises the Handwriting classification, because a pen means a written skeleton in a printed face |
| The three voice words for the object | `--contrast low \| medium \| high` | Stamped and worn is low; engraved and thin is high. Sets the stroke family the score prefers |
| The three voice words for the object | `--terminal round \| wedge \| ball \| flat` | How the stroke ends. No catalog carries the field, so it is read off the stroke class plus the shape axes (`ROND`, `SOFT`, `VOLM` for round; `FLAR`, `opsz` for wedge; `VOLM` for ball; `GRAD`, `wdth`, `ELSH` for flat) |
| The document row | `--width condensed \| normal \| wide` | A receipt and a scoreboard are condensed; a broadsheet is wide. A `wdth` axis scores when the width is not normal |
| The display string's needs | `--need <axes,comma>` | `opsz` when one family runs display and body; `wght` always; `slnt` or `ital` when the utterance is spoken; `wdth` for a scoreboard or a receipt |
| Register and surface | `--role display \| body` | A Display classification asked to set body text is penalised |

Optional: `--era any|contemporary|pre1960`, `--include <family>` to pin a candidate into the
specimen, `--limit <n>`, `--json`.

## 3. The specimen gate

Render the real display string at the real size on the real background, then read the PNG:

```
node scripts/fonts.mjs --role display --method pen --contrast medium --terminal wedge \
  --width normal --need opsz,wght --limit 3 \
  --specimen docs/specimen.html --string "<the real display string>" --size <px at 1440> \
  --bg "<--bg value>" --ink "<--ink value>"
npx --yes playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=2500 \
  "file:///<abs>/docs/specimen.html" docs/specimen.png
```

Read `docs/specimen.png`. Name the winner and the two runners-up, one line each, with the reason the
loser lost as a fact about the rendering (the wedge never arrives at 88px, the counters close, the
figures are lining where the document has tabular). A face named without a specimen is a reflex pick
even when it is on no list. Repeat for `--role body --size 16` with one real body sentence.

The body role takes the same treatment: `--specimen docs/specimen-body.html`, a sentence from the
page, 16px.

## 4. Provenance

`references/reflex-fonts.json` holds the list (the names from translation.md section 6) and is read
by `moment-lint.mjs` and by `fonts.mjs`. `fonts.mjs` prints `reflex=<path|embedded> n=<count>` on its
verdict line, so a run against the embedded fallback announces itself. The fontshare monoculture
(Satoshi, General Sans, Cabinet Grotesk, Switzer, Clash Display) is demoted as well; those names are
not in the JSON, which is a Google Fonts list.

Record the choice in the token file:

```css
--font-display: "Bodoni Moda", serif;   /* fonts.mjs rank=3 query=pen/wedge/opsz,wght */
--font-body:    "Commissioner", sans-serif; /* fonts.mjs rank=1 query=pen/round/wght */
```

`moment-lint reflex-font` waives a listed family only when `/* fonts.mjs rank=<1..3> ... */` follows
it on the same line. A recalled face is blocked; a queried one passes with its receipt.

## 5. Scale

`moment-lint timid-type` resolves `var()` against the `:root` map and `clamp()` to its upper bound,
ignores sizes under 11px, and prints `sizes=<n> min=<px> max=<px> range=<x>`. The floor:

- brand register: max over min at least 8x
- product register: at least 4.5x
- the display step at 1440 is at least `3rem` (brand) or `2.4rem` (product)
- the display step at 390 is at least `2.4rem` (brand) or `1.8rem` (product)

The BEFORE dashboard measures `sizes=13 min=11.5px max=24.8px range=2.2x`: an h1 at 1.4rem, smaller
than its own KPI numbers. A prototype of the rule read `sizes=1 min=2.6px` until `var()` was resolved
first, so resolve before measuring.

## 6. Buttons and inputs do not inherit `font-family`

Set it in the reset, in the same change that declares the faces:

```css
button, input, select, textarea { font: inherit; }
```

Without it the primary action silently renders in Arial while every band in the token file passes.
This was found by reading pixels in the tournament, not by a linter, which is why the specimen and
the fold card are read and not just run.
