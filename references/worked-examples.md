# Worked examples: three moments through the v2 chain

**These palettes are sampled output. Never copy them.** Every OKLCH value below came out of a plate
that was rendered from one specific light record; on your moment the sampler returns different
numbers, and a value lifted from this page is a palette with no light behind it. The same goes for
the fonts: the three ranked lines are what the catalog returned on 2026-09-19 for that query, not a
recommendation.

What this file is for: the shape of a real run. Each walkthrough is the output of the scripts, run on
2026-09-19 against the fixtures in `docs/tmp/`. The long absolute scratchpad path in each verdict line
is shortened to `<tmp>/` (or `<tournament>/` for the one line quoted off the tournament page);
nothing else inside a quoted line is edited. Two blocks are abridged, and nowhere else: `fold.mjs`
recipes keep the fields that bind the grid out of the eleven it prints, and the `fonts.mjs` ranked
lines drop the reason bullets printed under each rank.

Contents: 1 First coffee, 6:40am (ledger, landing and dashboard) · 2 Ferry deck, 23:40 (ticket-stub,
landing) · 3 Saturday farmers market, 9am (receipt, landing)

---

## 1. First coffee, 6:40am, house asleep

Fixture: `docs/tmp/canonical.json`. Register brand on the landing variant, product on the dashboard
variant. One moment, one fold, two surfaces.

### Step 2. The twelve rows

| Row | Value |
|---|---|
| Light | `source` one tungsten table lamp, shade on, in the corner · `clock` 8 · `kelvin` 2400 · `litFraction` 0.12 · `fill` a line of very small warm bulbs low on a shelf far behind the camera, 2200K, faint |
| Objects | white glazed cup rim, black coffee surface, honey oak floorboard, amber filament, grey wool cuff, the dark of the room |
| Materials | glazed ceramic, wool, wood |
| Air | warm, still, close |
| Tempo | slow |
| Sound | near silence, one tick |
| Gaze | down |
| Text in the scene | two lines in ballpoint on a small card |
| The document | account book |
| The gesture | both hands wrapped around the cup |
| The keepsake | steam crossing the lamp beam |
| The utterance | Nobody else is up yet. |

The Never list is `red and green pairing`, `any tree, star, gift or snowflake`, `any seasonal word`.
The string of bulbs is on it, so it leaves the frame and its light stays, in `fill`.

The document row matters more than it looks. The fixture as committed says "a handwritten card", and
that is not a document:

```
$ node scripts/fold.mjs --gaze down --document "a handwritten card" --surface landing
no fold for "a handwritten card". Fix the document row; the atlas is at references/folds.md
exit=3
```

Exit 3 is the instrument working. A card is an object, not an anatomy; the thing being kept in this
moment is an account of the night, so the row is `account book` and the rest of the run follows from
that one word.

### Step 3. The fold

```
$ node scripts/fold.mjs --gaze down --document "account book" --surface landing --diagram
fold=ledger  (The ledger)
gaze affinity: down, across
idea: The page keeps an account. Every section is an entry on one pitch, and one column accumulates.

shell      grid-template-columns: 146px minmax(0,1fr); no top bar exists, at any width.
row        grid-template-columns: 76px minmax(0,1fr) 300px 168px; column-gap: 28px; every band on the page uses this one row grid.
verticals  Two continuous hairlines run the full page height: one after the first column, one before the last. They never break at a section.
primary    The last entry, in the amount column, right-aligned. Never centered, never a floating pill.
plate      none

silhouette envelope (checked by silhouette-lint.mjs --fold ledger), calibrated: 2026-09-19 n=5:
  ruleRows >= 10
  vRules >= 2
  rightCol >= 0.35
  symmetry <= 0.62
  bandRatio <= 0.2

surface landing: the shell above, unchanged. The document is the page.

blocking diagram (24x14, legend: # display, = body, | rule, - hairline, @ primary, % plate, . empty, n nav):
  nn|=##...........==..|==
  nn|------------------|--
  nn|====..........==..|==
  nn|=###########..==..|==
  nn|.#######......==..|==
  nn|.=========....==..|..
  nn|.=========........|..
  nn|------------------|--
  nn|=#########....==..|==
  nn|.====.........=...|==
  nn|------------------|--
  nn|=########.....===.|==
  nn|------------------|--
  nn|======............|=@
```

The three numbers committed to at this step: `ruleRows >= 10`, `vRules >= 2`, `rightCol >= 0.35`.

The dashboard variant is the same key, the same diagram and the same envelope. Only the surface line
changes:

```
$ node scripts/fold.mjs --gaze down --document "account book" --surface dashboard --diagram
surface dashboard: Keep the 146px rail and the 76/1fr/300/168 row. The four numbers that would have been KPI cards become the first four entries; the running total lives under the double rule; charts sit inside the entry column at the row pitch.
product register: keep the shell, the row grid, the verticals, the separation and the metadata column.
Standard affordances are untouched: tables stay tables, nav stays findable, the primary action keeps its label.
```

This is the whole point of one fold per project: the KPI cards do not come back on the dashboard,
they become the first four entries of the same account.

### Step 4a. The shot

```
$ node scripts/shot.mjs docs/tmp/canonical.json --out <tmp>/shot-canonical.json --check
CAMERA    50mm macro at 35cm, f/2.0, 2400K, 12% lit, shutter 1/60s, right 40% reserved empty
SAFE SIDE right 40% reserved for type | key light at 8 o'clock | 12% lit | grain 0.045 | wrote <tmp>/shot-canonical.json
NEVER_LEAK 0 (never-tokens=9 scanned=257 prompt words)
```

Nine never-tokens were scanned against a 257 word prompt. A verdict with the volume beside it is the
only kind worth quoting.

### Step 4b. The plate

```
$ node scripts/plate.mjs <tmp>/shot-canonical.json <tmp>/plate-canonical.png
PLATE <tmp>/plate-canonical.png: 1536x1024 provider=procedural bytes=1444088 colorType=2
  NOT PHOTOGRAPHIC: a rendered light study, key clock 8, 2400K, 12% lit, svg=3161 chars
```

No key, no network, no cost. The brief says NOT PHOTOGRAPHIC.

### Step 4c. The roles

```
$ node scripts/plate-tokens.mjs <tmp>/plate-canonical.png <tmp>/tokens-canonical.css --fold ledger --register brand
PASS PLATE-TOKENS <tmp>/plate-canonical.png: sampled=175104px of 1536x1024 roles=5 theme=dark provider=procedural register=brand fold=ledger findings=0
  --bg       oklch(0.127 0.005 53)      the room outside the lamp, plate luminance p06 to p20
  --surface  oklch(0.243 0.034 72)      the lit body of the subject, plate p55 to p72
  --ink      oklch(0.823 0.057 75)      the face of the light source itself, plate p98 and up
  --accent   oklch(0.535 0.098 71)      the hottest chroma the lamp makes, top 1 percent
  --muted    oklch(0.628 0.045 75)      62 percent of the way from bg to ink, on ink hue
  contrast ink/bg         11.60:1   floor 4.5:1   OK
  contrast ink/surface    9.40:1   floor 4.5:1   OK
  contrast accent/bg      3.83:1   floor 3.0:1   OK
  contrast muted/bg       5.69:1   floor 4.5:1   OK
  contrast muted/surface  4.61:1   floor 4.5:1   OK
  clamps   1 applied
    - muted lifted L 0.558 -> 0.628 to clear 4.5:1 on --bg and --surface
  safe box x46.9% y0% w53.1% h100%  (340 of 640 grid cells, mean L under 0.30, sd under 0.055)
  key      --source-x 5.4% --source-y 52% --key-angle 177deg --falloff 3 --lit 0.12 (tEXt) --grain 0.055
  wrote    <tmp>/tokens-canonical.css (roles=5 kit=7 twin=no lines=19)
```

Read that ink value: `oklch(0.823 0.057 75)` is the face of the lamp, and it carries chroma 0.057.
Under the v1 flat 0.08 cap it would have survived; under the authored cap it is the computed-role
branch that lets it exist at all. The safe box is the right 53 percent of the frame, which is the
reserved empty side from the shot record coming back as a measured rectangle: the headline goes
there and nowhere else.

The dashboard variant samples the same plate with `--register product` and prints the same five roles
and the same kit; register changes the header comment and the `timid-type` threshold, not the
palette.

```
$ node scripts/moment-lint.mjs <tmp>/tokens-canonical.css --plate <tmp>/plate-canonical.png --register brand
PASS <tmp>/tokens-canonical.css: roles=5 oklch=5 fold=ledger kit=yes findings=0

$ node scripts/moment-lint.mjs <tmp>/tokens-canonical-dash.css --plate <tmp>/plate-canonical.png --register product
PASS <tmp>/tokens-canonical-dash.css: roles=5 oklch=5 fold=ledger kit=yes findings=0
```

### Step 5a. Type

Text in the scene is two lines in ballpoint, so `--method pen`. The three words for the object are
"pressed, uneven, private": medium contrast, a wedge terminal, normal width. The display string is
the real one and the size is the real one.

```
$ node scripts/fonts.mjs --role display --method pen --contrast medium --terminal wedge --width normal \
    --need opsz,wght --limit 3 --specimen <tmp>/spec-canonical.html \
    --string "The house is still asleep." --size 88 \
    --bg "oklch(0.127 0.005 53)" --ink "oklch(0.823 0.057 75)"
scanned=2046 families (google+fontshare) role=display method=pen contrast=medium terminal=wedge need=opsz,wght reflex=references/reflex-fonts.json n=32 ranked=2046
rank=1 TikTok Sans score=80 axes=opsz,slnt,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,slnt,wdth,wght@12..36,-6..0,75..150,300..900&display=swap
rank=2 Bodoni Moda score=69 axes=opsz,wght source=google url=https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..900&display=swap
rank=3 Bodoni Moda SC score=69 axes=opsz,wght source=google url=https://fonts.googleapis.com/css2?family=Bodoni+Moda+SC:opsz,wght@6..96,400..900&display=swap
demoted=6: Google Sans Flex, Merriweather, Bricolage Grotesque, Google Sans, Noto Serif, Cairo
specimen=<tmp>/spec-canonical.html faces=3 string="The house is still asleep." size=88px bg=oklch(0.127 0.005 53)
```

Specimen read (`<tmp>/spec-canonical.png`, 1440x900, the three faces set at 88px on the sampled bg):
**Bodoni Moda wins at rank 2.** At 88px its thin-to-thick modulation is the pressure of a ballpoint
that ran out and was pressed harder, and the hairlines survive on a 0.127 ground. TikTok Sans at rank
1 scored highest on axes and reads as a screen grotesque with no hand in it, the face this skill
exists to avoid. Bodoni Moda SC sets the sentence in small caps, which turns a private note into a
plaque. The token file records `--font-display` with
`/* fonts.mjs rank=2 query=pen/wedge/opsz,wght */`, and the rank is the provenance that lets a
queried face through `reflex-font`.

### Step 5b. Voice and the six states

Dials forced by the rows: Gaze `down` gives second person close; Tempo `slow` gives present
continuous; Air still plus Tempo slow gives median 5 to 9, ceiling 14; Sound near silence gives
`volume: quiet`, clause cap 1, no exclamation marks. Written to `docs/voice.json`
(`docs/tmp/voice-canonical.json` is the committed copy).

| State | String |
|---|---|
| `empty` | Nothing has asked for you yet. |
| `loading` | Counting what came in overnight. |
| `error` | The count stopped at 5:02. Open the ledger and it starts again. |
| `offline` | Nothing since 4:12. Whatever arrives will wait. |
| `done` | That was all of it. |
| `first-run` | This page is empty until tomorrow morning. |

Six strings, no apology in the error line, and the empty state is the moment's actual content rather
than a shrug with an icon. They ship as `data-state="<name>"` so `copy-lint` can count them.

### The motion score

Tempo `slow`, dominant material glazed ceramic:

```json
{
  "verb": "reveal",
  "travel": 1,
  "transient": { "ms": 90, "curve": "ceramic", "name": "the mug set down on the wood floor" },
  "transport": { "bpm": 5.5, "feel": "one slow breath, in and out, the room's tone" },
  "resolve": "once",
  "silence": 300,
  "twin": "the lamp is already at full, the night is a fixed gradient instead of time, every held item is lit"
}
```

Travel 1px is the whole argument against the fade-up reflex: at 1px the page still moves, in
brightness and in mask position, and nothing slides.

### Measured

The eight verify lines for this moment live in `demos/christmas-morning-landing/MEASURED.md` and
`demos/christmas-morning-dashboard/MEASURED.md` once those demos are built in phase 6. They are not
invented here.

One real line exists already, from the tournament page this fold was extracted from
(`scratchpad/tournament/silhouette/fold-1440.png`, the ledger landing page that won the
twelve-candidate tournament, re-linted with the shipped script):

```
$ node scripts/silhouette-lint.mjs <tournament>/silhouette/fold-1440.png --fold ledger
PASS <tournament>/silhouette/fold-1440.png: cells=200x125 viewport=1440x900 foldRows=125 inkedRows=87 ground=rgb(24,18,13) 79% envelope=5 fold=ledger findings=0
  symmetry=0.320 heroSymmetry=0.215 axisCentered=0.105 heroInk=0.169 foldInk=0.174 bandRatio=0.000 ruleRows=15.000 vRules=3.000 gutters=3.000 leftFlush=0.333 rightCol=0.402 maxInkWidth=0.960 cardRepeat=3.000 stagger=0.558 deadBottom=0.000 deadQuad=0.800 topBand=0.055 sidebar=0.160 heroRow=0.650
  SAAS_FOLD 1/6  AWWWARDS_FOLD 0/4
```

`ruleRows=15` against a floor of 10, `vRules=3` against 2, `rightCol=0.402` against 0.35: the three
numbers committed to at step 3, measured off the pixels. `SAAS_FOLD 1/6` and `AWWWARDS_FOLD 0/4`
means the page is not either category default, and that is a count, not an opinion.

---

## 2. Ferry deck, 23:40, one sodium lamp

Fixture: `docs/tmp/ferry.json`. Register brand, surface landing. This is the second-moment gate: a
different room, a different fold, the same chain.

### Step 2. The twelve rows

| Row | Value |
|---|---|
| Light | `source` one sodium deck lamp, off to the right, unshaded · `clock` 3 · `kelvin` 2000 · `litFraction` 0.2 · `fill` a thin broken line of very small cold points along the far edge, 4000K, faint |
| Objects | wet steel rail, black water, orange sodium spill on the deck plate, grey painted deck, salt haze on the lens, the dark past the rail |
| Materials | steel, glass, wood |
| Air | cold, wet, open |
| Tempo | drift |
| Sound | the engine under the deck, one low note |
| Gaze | out |
| Text in the scene | a boarding pass, serial numbers in dot matrix |
| The document | boarding pass |
| The gesture | both hands flat on the wet rail |
| The keepsake | the crease where the pass was folded all evening |
| The utterance | We are nearly across. |

Never: `cruise ship`, `anchor or porthole iconography`, `nautical navy and white stripes`. The far
shore is a light source, not a skyline, so it goes into `fill`.

### Step 3. The fold

```
$ node scripts/fold.mjs --gaze out --document "boarding pass" --surface landing --diagram
fold=ticket-stub  (The ticket stub)
gaze affinity: down, up
idea: The page is torn down a perforation. The narrow side carries the same facts, reduced, and it stays.

shell      grid-template-columns: minmax(0,1fr) 12px 118px; the 12px column is the perforation, a dotted vertical rule.
row        The wide side is free. The stub is a fixed stack of 5 fields, 1 per 84px.
verticals  The perforation, dotted, full height, sticky.
primary    On the stub, at its foot.
plate      crop

silhouette envelope (checked by silhouette-lint.mjs --fold ticket-stub), calibrated: 2026-09-19 n=5:
  vRules >= 1
  rightCol >= 0.75
  symmetry <= 0.55

surface landing: the shell above, unchanged. The document is the page.

blocking diagram (24x14, legend: # display, = body, | rule, - hairline, @ primary, % plate, . empty, n nav):
  ######...............|==
  ####.................|==
  #############........|==
  #########............|..
  ==========...........|==
  =============........|..
  ---------------------|==
  ==========...........|==
  =============........|..
  =======..............|==
  ---------------------|==
  ==========...........|==
  ========.............|==
  .....................|=@

note: gaze "out" is not this fold's affinity (down, up). Keep the document and apply the gaze as gravity: move the primary action and the visual weight, not the grid.
```

Read the note, because this is the case the atlas is built for. Gaze `out` wants a horizon; the
document is a boarding pass and the grid stays a perforated stub. The gaze is spent as gravity: the
display block sits high and wide with the dark of the water under it, and the primary action stays at
the foot of the stub where a ticket's action always is. Committed numbers: `vRules >= 1`,
`rightCol >= 0.75`, `symmetry <= 0.55`.

### Step 4. Light, plate, roles

```
$ node scripts/shot.mjs docs/tmp/ferry.json --out <tmp>/shot-ferry.json --check
CAMERA    35mm at 3m, f/8, 2000K, 20% lit, shutter 1/30s, left 40% reserved empty
SAFE SIDE left 40% reserved for type | key light at 3 o'clock | 20% lit | grain 0.045 | wrote <tmp>/shot-ferry.json
NEVER_LEAK 0 (never-tokens=9 scanned=226 prompt words)
```

The key is at clock 3, so the reserved empty side flips to the left. The safe box and the headline
follow it without anyone deciding.

```
$ node scripts/plate.mjs <tmp>/shot-ferry.json <tmp>/plate-ferry.png
PLATE <tmp>/plate-ferry.png: 1536x1024 provider=procedural bytes=1421749 colorType=2
  NOT PHOTOGRAPHIC: a rendered light study, key clock 3, 2000K, 20% lit, svg=3167 chars
```

```
$ node scripts/plate-tokens.mjs <tmp>/plate-ferry.png <tmp>/tokens-ferry.css --fold ticket-stub --register brand
PASS PLATE-TOKENS <tmp>/plate-ferry.png: sampled=175104px of 1536x1024 roles=5 theme=dark provider=procedural register=brand fold=ticket-stub findings=0
  --bg       oklch(0.127 0.005 53)      the room outside the lamp, plate luminance p06 to p20
  --surface  oklch(0.232 0.03 66)       the lit body of the subject, plate p55 to p72
  --ink      oklch(0.779 0.058 70)      the face of the light source itself, plate p98 and up
  --accent   oklch(0.486 0.074 66)      the hottest chroma the lamp makes, top 1 percent
  --muted    oklch(0.621 0.045 70)      62 percent of the way from bg to ink, on ink hue
  contrast ink/bg         9.98:1   floor 4.5:1   OK
  contrast ink/surface    8.34:1   floor 4.5:1   OK
  contrast accent/bg      3.11:1   floor 3.0:1   OK
  contrast muted/bg       5.53:1   floor 4.5:1   OK
  contrast muted/surface  4.62:1   floor 4.5:1   OK
  clamps   2 applied
    - accent lifted L 0.426 -> 0.486 to clear 3:1 on --bg
    - muted lifted L 0.531 -> 0.621 to clear 4.5:1 on --bg and --surface
  safe box x0% y0% w50% h100%  (320 of 640 grid cells, mean L under 0.30, sd under 0.055)
  key      --source-x 96% --source-y 45% --key-angle 354deg --falloff 3 --lit 0.2 (tEXt) --grain 0.055
  wrote    <tmp>/tokens-ferry.css (roles=5 kit=7 twin=no lines=19)
```

`--source-x 96%` and `--key-angle 354deg` are the sodium lamp at clock 3, and every box shadow on the
page will be cast from that angle or `craft-lint shadow-origin` says so. The safe box is the left
half of the frame, the opposite side from the canonical run, and the page is built around that
inversion.

```
$ node scripts/moment-lint.mjs <tmp>/tokens-ferry.css --plate <tmp>/plate-ferry.png --register brand
PASS <tmp>/tokens-ferry.css: roles=5 oklch=5 fold=ticket-stub kit=yes findings=0
```

### Step 5a. Type

Serial numbers in dot matrix: `--method stamp`, three words "pressed, blunt, repeated", low contrast,
flat terminals, condensed for the stub's 118px column.

```
$ node scripts/fonts.mjs --role display --method stamp --contrast low --terminal flat --width condensed \
    --need wght,wdth --limit 3 --specimen <tmp>/spec-ferry.html \
    --string "We are nearly across." --size 72 \
    --bg "oklch(0.127 0.005 53)" --ink "oklch(0.779 0.058 70)"
scanned=2046 families (google+fontshare) role=display method=stamp contrast=low terminal=flat need=wght,wdth reflex=references/reflex-fonts.json n=32 ranked=2046
rank=1 TikTok Sans score=95 axes=opsz,slnt,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,slnt,wdth,wght@12..36,-6..0,75..150,300..900&display=swap
rank=2 Pathway Extreme score=87 axes=opsz,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=Pathway+Extreme:opsz,wdth,wght@8..144,75..100,100..900&display=swap
rank=3 Science Gothic score=87 axes=CTRS,slnt,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=Science+Gothic:CTRS,slnt,wdth,wght@0..85,-10..0,50..200,100..900&display=swap
demoted=6: Google Sans Flex, Bricolage Grotesque, Archivo, Cabin, IBM Plex Sans, Noto Sans
specimen=<tmp>/spec-ferry.html faces=3 string="We are nearly across." size=72px bg=oklch(0.127 0.005 53)
```

Specimen read (`<tmp>/spec-ferry.png`, 1440x900, three faces at 72px on the sampled bg):
**Science Gothic wins at rank 3.** Its terminals are cut square and its joints are squared off, so at
72px it reads as something a machine printed on a card rather than something a designer set, which is
what a boarding pass is; its `wdth` axis runs 50 to 200 and the stub needs the narrow end. TikTok Sans
at rank 1 is the highest scorer and the most anonymous: at 72px it is Helvetica on a wet deck. Pathway
Extreme is close and loses on weight, its strokes go thin and elegant where the lamp needs something
that survives 20 percent lit. Recorded as `/* fonts.mjs rank=3 query=stamp/flat/wght,wdth */`.

### Step 5b. Voice and the six states

Gaze `out` gives first person plural. Tempo `drift` gives present continuous. Air is open, so the
sentence band is median 6 to 10, ceiling 16 (the band table has no `open + drift` row; the open row is
taken and the choice is recorded). Sound is one low note under the deck: `volume: quiet`. Props are
the Never list plus rail, water, lamp, deck and pass, so the page carries the light and never names
the objects.

| State | String |
|---|---|
| `empty` | We are not carrying anything for you yet. |
| `loading` | We are still counting what came in. |
| `error` | The count stopped at 23:12. One tap and we start again. |
| `offline` | Nothing is reaching us out here. It will keep until we land. |
| `done` | We are across. That was all of it. |
| `first-run` | We are keeping the first crossing empty on purpose. |

### The motion score

Tempo `drift`, dominant material steel:

```json
{
  "verb": "warm",
  "travel": 2,
  "transient": { "ms": 140, "curve": "steel", "name": "the lamp catching the wet rail as the deck rolls" },
  "transport": { "bpm": 4, "feel": "one ambient loop, 14s, the sodium lamp breathing against the engine" },
  "resolve": "never",
  "silence": 0,
  "twin": "the lamp sits at full, the water is a fixed gradient, the stub is lit and still"
}
```

`warm` permits color, background-color, box-shadow and filter, which is the whole page: a sodium lamp
on wet steel moves in brightness, not in position. Travel stays at 2px and `resolve: never` because a
crossing does not finish.

### Measured

The eight verify lines live in `demos/ferry-deck/MEASURED.md` once that demo is built in phase 6.
No page exists yet, so there is no `silhouette-lint` line for this fold and none is invented here.

---

## 3. Saturday farmers market, 9am

Fixture: `docs/tmp/farmers-market.json`. Register brand, surface landing (a storefront). This is the
high-key sampler case: 85 percent of the frame is lit.

### Step 2. The twelve rows

| Row | Value |
|---|---|
| Light | `source` late-summer sun, high and open, canvas awnings cutting hard bands of shade · `clock` 11 · `kelvin` 4000 · `litFraction` 0.85 · `fill` white chalk dust on a wiped board throwing a soft bounce up into the shade, 5000K, weak |
| Objects | tomato skin warm red-orange, weathered crate slats sun-bleached grey-brown, chalkboard slate near-black with a green cast, chalk dust ghosted white, cut basil deep green, sun-baked pavement grey |
| Materials | wood, glazed ceramic, steel |
| Air | warm, close, crowded, dense |
| Tempo | crisp |
| Sound | a hum of overlapping voices, no one sound cuts through |
| Gaze | across |
| Text in the scene | chalkboard prices, hand-chalked, uneven strokes |
| The document | till roll |
| The gesture | hands moving over a crate, turning a tomato to check the far side |
| The keepsake | the rubbed-out price with the new one rechalked beside it |
| The utterance | Four for a dollar, and take the soft one. |

Never: `gingham`, `barn`, `mason lid`. Every object is a color taken from the thing itself, which is
what keeps the palette out of the farm-stand cliche.

### Step 3. The fold

```
$ node scripts/fold.mjs --gaze across --document "till roll" --surface landing --diagram
fold=receipt  (The receipt)
gaze affinity: down
idea: A narrow column of item and price with dotted leaders, ruled once at the subtotal and twice at the total.

shell      A min(44ch, 86vw) column, hard left at 12% of the viewport, the page around it unlit.
row        grid-template-columns: minmax(0,1fr) auto with a dotted leader filling the gap.
verticals  None.
primary    The total row.
plate      none

silhouette envelope (checked by silhouette-lint.mjs --fold receipt), calibrated: 2026-09-19 n=5:
  maxInkWidth <= 0.6
  bandRatio <= 0.12
  symmetry <= 0.5

surface landing: the shell above, unchanged. The document is the page.

blocking diagram (24x14, legend: # display, = body, | rule, - hairline, @ primary, % plate, . empty, n nav):
  .....====...............
  .....====...............
  ........................
  ...===......=...........
  ...====.....=...........
  ...==.......=...........
  ...=====....=...........
  ...===......=...........
  ...----------...........
  ...===......=...........
  ...----------...........
  ...----------...........
  ...====.....@...........
  ........................

note: gaze "across" is not this fold's affinity (down). Keep the document and apply the gaze as gravity: move the primary action and the visual weight, not the grid.
```

`maxInkWidth <= 0.6` is the whole discipline of this fold: a till roll is narrow and the right 40
percent of the viewport stays empty, which is also where the shot record reserved the dark. A crowded
market rendered as a full-bleed grid of produce photography is the obvious page; a 44ch column of
prices with two thirds of the screen empty is the one the document asks for. Gaze `across` is spent as
gravity: the items sit at one weight with no hero among them.

### Step 4. Light, plate, roles

```
$ node scripts/shot.mjs docs/tmp/farmers-market.json --out <tmp>/shot-farmers-market.json --check
CAMERA    85mm at 6m, f/2.8, 4000K, 85% lit, shutter 1/500s, right 40% reserved empty
SAFE SIDE right 40% reserved for type | key light at 11 o'clock | 85% lit | grain 0 | wrote <tmp>/shot-farmers-market.json
NEVER_LEAK 0 (never-tokens=4 scanned=245 prompt words)
```

`grain 0`: the grain layer is for a dark room, and at 85 percent lit there is nothing for it to hide.

```
$ node scripts/plate.mjs <tmp>/shot-farmers-market.json <tmp>/plate-farmers-market.png
PLATE <tmp>/plate-farmers-market.png: 1536x1024 provider=procedural bytes=612674 colorType=2
  NOT PHOTOGRAPHIC: a rendered light study, key clock 11, 4000K, 85% lit, svg=3133 chars
```

```
$ node scripts/plate-tokens.mjs <tmp>/plate-farmers-market.png <tmp>/tokens-farmers.css --fold receipt --register brand
PASS PLATE-TOKENS <tmp>/plate-farmers-market.png: sampled=175104px of 1536x1024 roles=5 theme=dark provider=procedural register=brand fold=receipt findings=0
  --bg       oklch(0.189 0.029 93)      the room outside the lamp, plate luminance p06 to p20
  --surface  oklch(0.425 0.05 91)       the lit body of the subject, plate p55 to p72
  --ink      oklch(0.882 0.062 92)      the face of the light source itself, plate p98 and up
  --accent   oklch(0.588 0.099 92)      the hottest chroma the lamp makes, top 1 percent
  --muted    oklch(0.813 0.045 92)      62 percent of the way from bg to ink, on ink hue
  contrast ink/bg         12.98:1   floor 4.5:1   OK
  contrast ink/surface    5.81:1   floor 4.5:1   OK
  contrast accent/bg      4.47:1   floor 3.0:1   OK
  contrast muted/bg       10.36:1   floor 4.5:1   OK
  contrast muted/surface  4.64:1   floor 4.5:1   OK
  clamps   2 applied
    - chroma-clamp --surface 0.079 -> 0.05 (accent is the only saturated role)
    - muted lifted L 0.618 -> 0.813 to clear 4.5:1 on --bg and --surface
  safe box x81.3% y0% w18.8% h100%  (120 of 640 grid cells, mean L under 0.30, sd under 0.055)
  key      --source-x 18% --source-y 6.4% --key-angle 234deg --falloff 1.4 --lit 0.85 (tEXt) --grain 0
  wrote    <tmp>/tokens-farmers.css (roles=5 kit=7 twin=no lines=19)
```

Three things to read here. `--falloff 1.4` is the flat, open light of an 85 percent lit frame, against
3.0 for both night scenes. The surface chroma was clamped from 0.079 to 0.05, which is the sampler
refusing to let the whole page go tomato. And the safe box collapsed to 18.8 percent of the width,
because a bright frame has almost nowhere dark to put a headline; that number is the warning that this
plate wants type on a lit ground, with the contrast measured on the painted pixel.

Note what the sampler did not do: it printed `theme=dark` on a scene at 85 percent lit, because the
procedural plate renders a bright subject against a dark ground rather than a bright field, so the p06
to p20 band is still dark. The light twin for this surface comes from `plate-tokens --twin`, not from
the base run.

```
$ node scripts/moment-lint.mjs <tmp>/tokens-farmers.css --plate <tmp>/plate-farmers-market.png --register brand
PASS <tmp>/tokens-farmers.css: roles=5 oklch=5 fold=receipt kit=yes findings=0
```

`cream-trap` did not fire: `--bg oklch(0.189 0.029 93)` is the dark under an awning, not the warm
near-white that a market scene reaches for by reflex.

### Step 5a. Type

Chalk on slate, uneven strokes: `--method pen`, three words "chalked, rubbed, quick", high contrast,
flat terminals, condensed for the 44ch column.

```
$ node scripts/fonts.mjs --role display --method pen --contrast high --terminal flat --width condensed \
    --need wght,wdth --limit 3 --specimen <tmp>/spec-farmers.html \
    --string "Four for a dollar." --size 64 \
    --bg "oklch(0.189 0.029 93)" --ink "oklch(0.882 0.062 92)"
scanned=2046 families (google+fontshare) role=display method=pen contrast=high terminal=flat need=wght,wdth reflex=references/reflex-fonts.json n=32 ranked=2046
rank=1 TikTok Sans score=93 axes=opsz,slnt,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,slnt,wdth,wght@12..36,-6..0,75..150,300..900&display=swap
rank=2 Pathway Extreme score=82 axes=opsz,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=Pathway+Extreme:opsz,wdth,wght@8..144,75..100,100..900&display=swap
rank=3 Science Gothic score=82 axes=CTRS,slnt,wdth,wght source=google url=https://fonts.googleapis.com/css2?family=Science+Gothic:CTRS,slnt,wdth,wght@0..85,-10..0,50..200,100..900&display=swap
demoted=6: Google Sans Flex, Bricolage Grotesque, Merriweather, Archivo, Cabin, IBM Plex Sans
```

Specimen read (`<tmp>/spec-farmers.png`, 1440x900, three faces at 64px on the sampled bg):
**Pathway Extreme wins at rank 2.** Its stroke stays one even width through the curve, the way a chalk
stick held flat does, and its `opsz` axis runs 8 to 144 so the same family carries the price column at
13px and the total at 64px. TikTok Sans at rank 1 is tighter and more finished than anything written
on a board at 9am. Science Gothic reads as machined, square at every joint, a fuel pump rather than a
hand; it won the ferry for exactly that reason and loses here for it. Recorded as
`/* fonts.mjs rank=2 query=pen/flat/wght,wdth */`.

Worth saying plainly: none of the three is chalk. The specimen gate is not there to find a perfect
face, it is there to stop a face being named without anyone looking at it.

### Step 5b. Voice and the six states

Gaze `across` gives third person. Tempo `crisp` gives simple present. Air is crowded, so the sentence
band is median 3 to 6, ceiling 9 (the band table has no `crowded + crisp` row; the crowded row is
taken and the choice is recorded). Sound is a hum with nothing cutting through: `volume: plain`, and
still no exclamation marks, because the market is loud and the page is not.

| State | State string |
|---|---|
| `empty` | The first stall opens at nine. |
| `loading` | The count is coming in. |
| `error` | The count stopped at 9:14. One tap starts it again. |
| `offline` | Nothing arrives until the signal returns. |
| `done` | Everything is counted. |
| `first-run` | Nothing is priced until Saturday. |

### The motion score

Tempo `crisp`, dominant material wood:

```json
{
  "verb": "count",
  "travel": 3,
  "transient": { "ms": 160, "curve": "paper", "name": "the price wiped off and rechalked beside it" },
  "transport": { "bpm": 96, "feel": "on the beat, the pace of a line moving past a stall" },
  "resolve": "once",
  "silence": 0,
  "twin": "the totals are already at their final value, the leader dots are drawn, nothing counts up"
}
```

`count` permits registered numeric custom properties and `content` via a counter, which is the
keepsake made structural: the total rechalks itself and nothing else on the page moves. Wood is not in
the material curve table (ceramic, wool, glass, steel, paper); `paper` is taken as the nearest and the
substitution is recorded here rather than left silent.

### Measured

The eight verify lines live in `demos/farmers-market/MEASURED.md` once that demo is built in phase 6.
No page exists yet, so no `silhouette-lint` or `craft-lint` line is quoted for it.

---

## What the three runs show together

Three moments, three folds, three different safe boxes, three different falloffs, and one chain that
never asked anyone's taste for any of it. The only prose written across all three runs is the moment
paragraph, the specimen verdict and the six state strings per moment. Everything else is a script's
output, quoted with the volume it processed beside its verdict.

The palettes above are what those three procedural plates happened to contain. Run the chain on your
moment and none of these numbers will come back.
