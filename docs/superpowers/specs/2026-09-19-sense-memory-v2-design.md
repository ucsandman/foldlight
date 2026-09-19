# sense-memory v2: blocking, light, and the linters that read pixels

Date: 2026-09-19. Status: implementation spec, produced after a twelve-candidate tournament on the canonical moment. Winner: Blocking (the fold atlas and the silhouette linter). Grafts: Plate One (plate sampling, five imagery laws, procedural fallback), Hairline (craft-lint, muted-contrast), Optical Size (fonts.mjs, specimen gate, timid-type), The Narrator (voice dials, six states, copy-lint), Staging and One Lamp (light kit, masked plume, one grain layer, saturation correction, peak and trough contrast), Room Tone (motion rules), Round Two (measured fold bands, rebuild delta), KIT ZERO (second-moment gate, lamp-band).

Evidence this spec was written against: `C:/Projects/sense-memory/SKILL.md` (207 lines), `references/translation.md` (154), `scripts/moment-lint.mjs` (128), `scripts/preview.mjs` (65), `scripts/context.mjs` (77), the four demo folders, the BEFORE screenshot `demos/christmas-morning-dashboard/screenshot.png`, the winner's `fold-1440.png` and `mobile.png`, the runner-up's `desktop.png`, and the source of `fold.mjs`, `silhouette-lint.mjs`, `plate-tokens.mjs`, `shot.mjs`, `craft-lint.mjs`, `fonts.mjs`, `copy-lint.mjs`, `choreography.mjs`, `fold-metrics.mjs` and `light.mjs` in the tournament scratchpad at `C:/Users/sandm/AppData/Local/Temp/claude/C--Projects-sense-memory/ae5f3d49-d47e-4347-aa10-4477a0111698/scratchpad/tournament/`. Every CLI, threshold and file path below either exists in one of those files or is fixed here.

No em dashes appear in this document, and none may appear in anything the skill writes.

---

## 1. Thesis

The old skill failed because it had sense memory and no blocking. It spent its first four gates on paperwork (a paragraph, eleven rows, a nine-axis reflex ledger, a brief, a JSON file, a token file, a lint, a swatch card) and then asked the model to compose a page in one sentence of prose, so every moment stood in the same place: a 216px sidebar with four KPI cards, or a centered wordmark with two buttons, or two equal panes. The BEFORE dashboard proves it: h1 at 1.4rem, smaller than the KPI numbers; a declared steam signature that renders as a grey smear across one card; an orange pill floating unanchored at the lower right; 170px of nothing under it; and 29 text nodes under the 4.5:1 floor on a page whose token linter reports findings=0. Composition, light, imagery, type scale, voice and rendered craft were all described and none was measured, so the linter policed the one axis (palette) that was never the problem. v2 moves the fold in front of the paperwork and gives every axis an instrument: the Gaze and Document rows resolve by arithmetic to one of twelve named folds with a CSS grid recipe and a numeric envelope; a zero-dependency linter decodes the rendered PNG and rejects the SaaS fold, the Awwwards fold, and any page that declared a fold it does not have; the palette is sampled out of a plate (a procedurally rendered light study by default, a photograph when a key exists) so the interface and the image are lit by the same lamp; type is chosen from a live catalog and confirmed by reading a rendered specimen; copy is shaped by six dials and six mandatory states; motion has a travel budget and a verb; and a DOM-level craft linter measures contrast against what is actually painted. Rule zero, the five OKLCH roles, the deterministic token linter and the accessibility floor are unchanged. The brief is written last, as a record of what was built, not as a description of a page that does not exist yet.

---

## 2. The new SKILL.md workflow

Nine steps, each with a gate. A gate that is not written in the response was not passed. No UI code before gate 6. The brief is written at step 9, after the pixels pass.

### Step 0. Probe (first tool call)

```
node "${CLAUDE_SKILL_DIR}/scripts/context.mjs"
```

Output lines, unchanged from v1 plus two new ones: `MOMENT_EXISTS | MOMENT_NONE`, `DESIGN_MD`, `PRODUCT_MD`, `TOKENS`, `FONTS`, `REGISTER_HINT`, `STACK`, `SCANNED`, and new `FOLD <key> | FOLD none` (read from the `/* fold: <key> */` line of the first token surface that carries roles) and `PLATE <path> | PLATE none` (first match of `assets/plate-*.png` or `public/plate-*.png`). If the shell is unavailable, Glob for the same files and continue; the workflow never depends on the shell.

### Step 1. Capture the moment

Unchanged in substance. If the prompt has no moment, ask one question and stop: "What's a specific moment you'd want this to feel like? Time of day, where you are, what you're holding." Expand a thin moment into a first-person paragraph of four to six sentences; every user word must land in an inventory row. Confirm the register (brand or product) from `REGISTER_HINT` and the surface named in the prompt (landing, dashboard, theme, terminal).

**Gate 1 (shown in the response):** the paragraph, containing every word the user used, and one line `register=<brand|product> surface=<landing|dashboard|theme|terminal>`.

### Step 2. Sensory inventory (twelve rows, Light is a record)

The table gains one row and changes one. Write `docs/sense-memory.json` at the end of this step (the machine input the scripts read; it is not the brief).

| Row | What to write |
|---|---|
| Light | A record, not a sentence: `source`, `clock` (1 to 12, where the key light sits as seen from the camera), `kelvin`, `litFraction` (0 to 1, how much of the frame is lit), `fill` (every light-emitting or reflecting item from the Never list, rewritten as light with its name removed) |
| Objects | Five to eight physical things, each colored as a material |
| Materials | What things are made of; name the dominant one first |
| Air | Temperature, humidity, stillness, density |
| Tempo | Speed and rhythm, in one of the score words: slow, held, burst, crisp, drift |
| Sound | The one sound and its shape |
| Gaze | Exactly one of: `up`, `down`, `out`, `across` |
| Text in the scene | Lettering physically present, and how it was made (pen, LED, letterpress, routed, typewriter) |
| The document | The printed or physical object that belongs to the moment. Must name something in the fold atlas or one of its aliases (see `references/folds.md`); "a vibe" is rejected by `fold.mjs` with exit 3 |
| The gesture | The one physical action |
| The keepsake | The single thing remembered a year later |
| The utterance | The one sentence someone in the scene could say out loud, in the person and tense they would use. It seeds the voice dials |

Rule: an item on the Never list that emits or reflects light goes into `light.fill` as a description of its light with its name removed. For the canonical moment the tree bulbs become "a line of very small warm points low on a shelf far behind the camera, 2200K, faint". The prop leaves the frame; its light stays.

`docs/sense-memory.json` shape (exact keys, scripts depend on them):

```json
{
  "title": "first coffee, 6:40am, house asleep",
  "moment": "<the paragraph>",
  "register": "brand",
  "surface": "landing",
  "inventory": {
    "light": { "source": "one tungsten lamp, corner", "clock": 8, "kelvin": 2700, "litFraction": 0.15, "fill": ["a line of very small warm points low on a shelf far behind the camera, 2200K, faint"] },
    "objects": ["white glazed mug", "black coffee", "honey wood floor", "amber filament", "grey wool sock", "the mug's shadowed underside"],
    "materials": ["glazed ceramic", "wool", "wood"],
    "air": "warm, still, close",
    "tempo": "slow",
    "sound": "the house ticking, near silence",
    "gaze": "down",
    "text": "a handwritten tag, two lines in pen",
    "document": "account book",
    "gesture": "both hands around the mug",
    "keepsake": "steam rising through the lamp light",
    "utterance": "Nobody else is up yet."
  },
  "never": ["tree", "red and green pairing", "gift box, star, snowflake iconography"]
}
```

**Gate 2:** twelve rows in the response, none blank; the Light row shows all five fields and `litFraction` is a number; every `never` item that emits light appears in `fill`; the JSON file exists.

### Step 3. Block the page (new, gated, before any token work)

```
node "${CLAUDE_SKILL_DIR}/scripts/fold.mjs" --gaze <up|down|out|across> --document "<document row>" --surface <landing|dashboard|theme|terminal> --diagram
```

The script resolves Gaze x Document to one fold key, prints the nine-field recipe, the 24x14 blocking diagram, the numeric envelope and the surface variant. If gaze does not match the fold's affinity it prints one line: keep the document, apply the gaze as gravity, move the weight and the primary action, not the grid. Exit 3 when the document names nothing in the atlas: fix the inventory row, never invent a layout.

In the response, show: the fold key, the diagram (copied from the script or redrawn if the surface variant changes it), and the three envelope numbers you are committing to (the three most binding for that fold, e.g. ledger: `ruleRows >= 10, vRules >= 2, rightCol >= 0.35`).

Diagram legend (fixed, used by `fold.mjs --diagram` and `fold-card.mjs`): `#` display type, `=` body text, `|` continuous vertical rule, `-` hairline, `@` the primary action (exactly one), `%` plate or image, `.` unlit or empty, `n` navigation.

**Gate 3:** fold key, diagram and three envelope numbers are in the response, and the diagram is not a top bar over a centered column (the first two rows are not all `n`/`-` with a centered `#` block below).

### Step 4. Light and color (the plate is the color source)

4a. Compile the shot record from the inventory. Pure lookup, no prose:

```
node "${CLAUDE_SKILL_DIR}/scripts/shot.mjs" docs/sense-memory.json --out docs/shot.json --check
```

4b. Make the plate. Procedural is the default and needs no key or network:

```
node "${CLAUDE_SKILL_DIR}/scripts/plate.mjs" docs/shot.json assets/plate-01.png
node "${CLAUDE_SKILL_DIR}/scripts/plate.mjs" docs/shot.json assets/plate-01.png --provider openai     # only when the user wants photography and a key resolves
node "${CLAUDE_SKILL_DIR}/scripts/plate.mjs" --import <client photo> assets/plate-01.png              # a real photograph supplied by the user
```

One plate per moment, forever. The script refuses to overwrite without `--regenerate`. A procedural plate stamps `provider=procedural` in the PNG tEXt chunk and the brief says NOT PHOTOGRAPHIC; a generated one prints its token usage and cost.

4c. Sample the roles and the light kit out of the plate, then write the token file in the project's real token surface (`TOKENS` line, or `styles/tokens.css` greenfield):

```
node "${CLAUDE_SKILL_DIR}/scripts/plate-tokens.mjs" assets/plate-01.png styles/tokens.css --fold <key> --register <brand|product>
node "${CLAUDE_SKILL_DIR}/scripts/moment-lint.mjs" styles/tokens.css
```

The token file's first three lines are fixed:

```
/* Sense memory: <title> */
/* fold: <key> */
/* plate: assets/plate-01.png provider=<procedural|openai|gemini|import> */
```

followed by the five roles (each with its source band as the trailing comment), the light kit (`--source-x`, `--source-y`, `--key-angle`, `--falloff`, `--lit`, `--grain`, `--plate-safe`), and, for the theme surface, the `[data-theme="dark"]` or light twin computed by `plate-tokens.mjs --twin`.

Hand overrides are allowed only by argument: a role that departs from its sampled cluster by more than dL 0.04, dC 0.03 or dh 12 must carry a comment `/* override: <reason> */` or `moment-lint --plate` fails it as `plate-drift`.

**Gate 4:** the shot line (lens, distance, f-stop, kelvin, lit percent, shutter, reserved empty side) is quoted; `shot.mjs --check` printed `NEVER_LEAK 0`; the plate path and provider are stated; the `plate-tokens` output block (five roles with contrast ratios, clamps printed, safe box, key angle) is quoted; `moment-lint` reads `PASS ... roles=5 ... findings=0`.

### Step 5. Type and voice

5a. Type by query and specimen, never by recall:

```
node "${CLAUDE_SKILL_DIR}/scripts/fonts.mjs" --role display --method <pen|led|letterpress|routed|typewriter|stamp|screen> --contrast <low|medium|high> --terminal <round|wedge|ball|flat> --width <condensed|normal|wide> --need <axes> --limit 3 --specimen docs/specimen.html --string "<the real display string>" --size <px at 1440> --bg "<--bg value>" --ink "<--ink value>"
node "${CLAUDE_SKILL_DIR}/scripts/fonts.mjs" --role body ... --limit 3 --specimen docs/specimen-body.html --string "<one real body sentence>" --size 16
npx --yes playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=2500 "file:///<abs>/docs/specimen.html" docs/specimen.png
```

Read `docs/specimen.png`. Name the winner and the two runners-up and why each lost, in one line each. Record the choice in the token file as `--font-display` and `--font-body`, each followed by `/* fonts.mjs rank=<n> query=<method>/<terminal>/<need> */`.

5b. Voice. Derive the six dials from named rows (table in `references/voice.md`) and write `docs/voice.json`. Write the six mandatory state strings now, before any page exists: `empty`, `loading`, `error`, `offline`, `done`, `first-run`. They ship in markup as `data-state="<name>"` so coverage is countable.

**Gate 5:** the specimen PNG was read (say so and name the file); winner plus two losers named with reasons; the six dial values are in the response; the six state strings are in the response.

### Step 6. Render the fold card and read it

```
node "${CLAUDE_SKILL_DIR}/scripts/fold-card.mjs" styles/tokens.css docs/fold-card.html --plate assets/plate-01.png --fold <key> --specimen docs/specimen.png --voice docs/voice.json
npx --yes playwright screenshot --viewport-size=1440,1200 --full-page --wait-for-timeout=2500 "file:///<abs>/docs/fold-card.html" docs/fold-card.png
```

The card shows: the blocking diagram at 480px wide; the plate with the measured safe box and key-light crosshair drawn on it; the five roles as swatches with their source band and contrast ratios; the display specimen at real size on `--bg`; the six state strings set in the body face; the fold's envelope numbers; the light kit values. Read the PNG and answer two questions in one line each: "is this shaped like something" and "is this a lit room or a holiday card".

**Gate 6:** the card PNG was read; both answers written; if either is no, return to step 3 or step 4, never forward.

### Step 7. Build the fold first, measure it, rebuild once

Build only the first viewport of the real surface (the fold), to the recipe from step 3, using the tokens from step 4, the faces from step 5 and the strings from step 5b. Then:

```
npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=2500 "file:///<abs>/index.html" docs/fold-1440.png
node "${CLAUDE_SKILL_DIR}/scripts/silhouette-lint.mjs" docs/fold-1440.png --fold <key>
node "${CLAUDE_SKILL_DIR}/scripts/fold-metrics.mjs" index.html --label round1 --json docs/fold-round1.json      # brand register
```

Read `fold-1440.png` as a stranger. Fix what is broken, rebuild once, and print the delta:

```
node "${CLAUDE_SKILL_DIR}/scripts/fold-metrics.mjs" index.html --label round2 --json docs/fold-round2.json --compare docs/fold-round1.json
```

Only after the fold passes, build the rest of the page and the remaining states. Volume by surface is in `references/translation.md` section 10 (unchanged: landing loud, dashboard at six on a Tuesday, theme pack from one moment, terminal palette and type only).

**Gate 7:** `silhouette-lint` line quoted, `PASS ... fold=<key> findings=0`; for brand register the `DELTA` line quoted (round1 to round2) with hero px, scale, biggest object, bleed and images.

### Step 8. Verify on pixels and DOM

Screenshots (exact commands, all four required for a page surface; a theme or terminal surface takes the first two on its sample page):

```
npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=2500 "file:///<abs>/index.html" docs/fold-1440.png
npx --yes playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=2500 "file:///<abs>/index.html" docs/desktop.png
npx --yes playwright screenshot --viewport-size=390,844 --wait-for-timeout=2500 "file:///<abs>/index.html" docs/fold-390.png
npx --yes playwright screenshot --viewport-size=390,844 --full-page --wait-for-timeout=2500 "file:///<abs>/index.html" docs/mobile.png
```

Then every row below, each quoted verbatim:

| Row | Command | Passes when |
|---|---|---|
| Silhouette | `silhouette-lint.mjs docs/fold-1440.png --fold <key>` and `silhouette-lint.mjs docs/mobile.png --fold <key> --viewport 390x844` | both `PASS ... findings=0` |
| Baseline | `silhouette-lint.mjs` on the two nearest category defaults you almost built (`references/folds.md` section 4 ships `baseline-saas.png` and `baseline-awwwards.png`) | both `FAIL`; quote the counts. This is the make-it-fail discipline applied to composition |
| Craft | `craft-lint.mjs index.html` | `PASS ... rules=15 findings=0` |
| Tokens | `moment-lint.mjs styles/tokens.css --plate assets/plate-01.png` | `PASS ... findings=0` |
| Copy | `copy-lint.mjs index.html --spec docs/voice.json` | `PASS ... states=6/6 findings=0` |
| Fold bands (brand only) | `fold-metrics.mjs index.html --bands` | `hero`, `scale` and `contrastFails` inside their bands |
| Kitsch | read `docs/fold-1440.png` | a stranger cannot name the event; one sentence saying what they would name instead |
| Reduced motion | `craft-lint` third pass (it runs `reducedMotion: 'reduce'` itself) | `motion-twin` rule passes with the count of substantive twin declarations printed |

**Gate 8:** all rows quoted; every linter line carries its volume (cells, nodes, strings, roles) beside its verdict.

### Step 9. Record (the brief, written last)

Append a `## Sense memory` section to `docs/DESIGN.md` (or PRODUCT.md when the project uses it). The brief is a record of what was built and is short:

```
# Design brief: <title>
## The moment            <the paragraph>
## Register and surface  brand | product; landing | dashboard | theme | terminal
## Fold                  <key>: <one sentence of the idea>; envelope measured: <three numbers from silhouette-lint>
## Light                 source at <clock>, <kelvin>K, lit <percent>; key-angle <deg>; plate <path> provider=<...>
## Palette               five roles as written in the token file, with their source bands
## Type                  <display> over <body>, ranked <n>/<n> by fonts.mjs, specimen read
## Voice                 six dials; the six state strings
## Motion                verb, travel budget px, transient ms, transport bpm, the twin in one line
## Signature             one sentence: the structural move the fold made possible
## Never                 three literal props; the negative prompt they became
## Measured              the eight verify lines, verbatim
```

Update `docs/sense-memory.json` with `fold`, `light` (kit values), `type`, `voice`, `motion` and `measured` keys. Close with CHANGES MADE / THINGS LEFT UNTOUCHED / VERIFICATION and the paths of `index.html`, the four screenshots, the plate, the fold card and the specimen.

**Gate 9:** the brief in the response, the two files updated, and the last line of the response is the `silhouette-lint` PASS line for the fold.

### Deleted from the workflow

- The reflex ledger (nine-axis table). The fold, the plate, the specimen and the voice dials make the swap test structural; a table that says "not Inter" is paperwork.
- `preview.mjs` and the moment card. Replaced by `fold-card.mjs`.
- The brief-before-build order. The brief is step 9.
- The Silhouette row of the old verify table (prose self-assessment). Replaced by the `silhouette-lint` row.
- The three-file persistence at step 4. Persistence is now the JSON at step 2, the token file at step 4, the record at step 9.
- The sentence "imagery real when the scene implies it" (translation.md section 10). Replaced by the plate.

### Judgment notes (rewritten items only)

- **No menus, restated.** "No menus" stays for style: never map the moment onto a named brand, aesthetic family or hero architecture. The fold atlas is not a style menu. The user supplies the document row; the atlas only states that document's anatomy, the way a table of hero architectures never could, because an account book has a structure and "bold" does not. Selection is arithmetic (gaze x document), not taste. If the same fold appears twice in one project's history (`context.mjs` prints `FOLD`), keep it: one product, one fold.
- **Props become light.** A Never item that glows never enters a prompt or a page; its light enters `light.fill` and the plate.
- **The plate is the palette, on every surface.** A terminal or theme surface still makes a plate; it never ships it. The plate is where the colors come from.
- **The linter denies, it does not argue.** When the hook denies a write late in the session, re-read `docs/sense-memory.json`, re-run the failing linter, rebuild the axis from its inventory row.

---

## 3. Reference files

### 3.1 `references/translation.md` (changed)

Delete: section 6b (Gaze and the document) entirely; the Silhouette test paragraph in section 9; the sentence in section 10 beginning "Imagery, if the scene implies it, is real". Change:

- Section 1 (Light): replace the prose with the five-field record and a table mapping `clock` to the CSS light origin (`clock 7 to 9` gives `--source-x` 0 to 10 percent, `--source-y` 30 to 60 percent; `10 to 11` gives `--source-x` 0 to 20 percent, `--source-y` 0 to 15 percent; `12` gives 50 percent, 0 percent; `1 to 2` gives 80 to 100 percent, 0 to 15 percent; `3 to 5` gives 90 to 100 percent, 30 to 60 percent; `6` gives 50 percent, 100 percent), `litFraction` to `--falloff` (`<= 0.2` gives 3.0, `0.2 to 0.5` gives 2.2, `> 0.5` gives 1.4), and `kelvin` to the neutral tint hue (`<= 2700` hue 60 to 75, `2700 to 4000` hue 75 to 90, `4000 to 5500` chroma 0, `> 5500` hue 230 to 250).
- Section 2 (Objects to palette): the table survives as the cross-check against the sampled roles. Add the drift rule: a hand-picked role differing from its sampled cluster by more than dL 0.04, dC 0.03 or dh 12 carries `/* override: <reason> */` or is dropped.
- Section 3 (Materials): add the column "Specular" with the five material entries from `shot.mjs` (glazed ceramic: one hard specular no wider than 4mm then a long falloff; wool: no specular, lit fuzz on the rim; wood: a long low sheen with the grain; glass: two speculars, near wall and refracted; steel: one anisotropic streak). Add the peak and trough rule: when a surface is a rendered range (gradient, plate, lit panel) rather than a flat fill, ink contrast is evaluated at the worst of flat, peak and trough; `craft-lint` does this against painted pixels.
- Section 5 (Tempo and sound): shrink to the score words (slow, held, burst, crisp, drift) with their durations, and point to `references/motion.md` for the verb, travel budget and twin.
- Section 6 (Text in the scene): replace steps 3 to 5 with "run `fonts.mjs`, render the specimen, read it; procedure in `references/type.md`". The reflex list moves to `references/reflex-fonts.json`.
- Section 7 (Gesture): unchanged.
- Section 8 (Keepsake): the signature is structural, not ornamental. Replace the candidate list with: "The keepsake is the one thing the fold does that its recipe did not require: the accumulating column, the lit ruling, the plate's safe-box headline. If the signature can be deleted without changing the grid, it is decoration; find the structural one."
- Section 9 (Checks): Kitsch, Cream trap, Swap and Awwwards lane stay as reading checks; add one line under each naming the script that now measures it (Cream trap: `moment-lint cream-trap`; Awwwards lane: `silhouette-lint AWWWARDS_FOLD`; Kitsch: `copy-lint prop-leak` and the fold-card read).
- Section 10 (Surfaces): unchanged except the deletion above and one added sentence under Dashboard: "The empty state is the moment's actual content and is written at step 5b, not improvised."

### 3.2 `references/folds.md` (new) and `scripts/fold.mjs` atlas (same data)

Sections:

1. **What a fold is.** One paragraph: a fold is a document's anatomy written as a grid law; the page is the document, so there is one container instead of four.
2. **Selection.** Gaze x Document. The alias table (37 aliases, verbatim from the winner's `DOC_ALIASES`: account book, daybook, invoice, balance sheet to ledger; tag, luggage tag, name card, place card to gift-tag; notebook, journal, lab book to field-notebook; ticket, boarding, boarding pass to ticket-stub; map, chart, tide table to trail-map; label, placard, wall text to museum-label; newspaper, front page, programme to broadsheet; recipe, index card to recipe-card; set list, call sheet, running order to setlist; bill, check, till roll to receipt; scorecard, split time, leaderboard to scoreboard; proof sheet, seating chart, card catalog to contact-sheet). Gaze affinity per fold (ledger: down, across; gift-tag: down; field-notebook: down; ticket-stub: down, up; trail-map: out; museum-label: across; broadsheet: across; recipe-card: down; setlist: down; receipt: down; scoreboard: up; contact-sheet: across). A gaze outside the affinity applies as gravity only.
3. **The twelve entries.** Each entry carries eleven fields: `name`, `gaze`, `idea`, `shell`, `row`, `verticals`, `primary`, `separation`, `metadata`, `nav`, `type`, `forbidden`, `plate` (one of `none | crop | bleed`), `envelope`, `diagram` (14 strings of 24 characters in the legend from step 3), and `surfaces` (how the shell changes for dashboard, theme and terminal). The ledger entry is verbatim from the winner: shell `grid-template-columns: 146px minmax(0,1fr); no top bar exists, at any width`; row `76px minmax(0,1fr) 300px 168px; column-gap 28px`; verticals: two continuous hairlines the full page height, never breaking at a section; primary: the last entry, amount column, right-aligned, never a floating pill; separation: hairline under every row, double rule (2px + 1px, 3px apart) at a total; metadata: column one only, tabular figures; nav: thumb-index tabs down the left rail, full height, rotated to read vertically at 390px; type: display inside the entry column, the amount column is the only right-aligned text; forbidden: cards, a full-width top nav bar, a centered container, section headings on their own line; plate `none`; envelope `ruleRows >= 10, vRules >= 2, rightCol >= 0.35, symmetry <= 0.62, bandRatio <= 0.2`. The other eleven shells and envelopes are copied from the winner's `fold.mjs` (gift-tag `64px min(46ch,78vw) 1fr`, envelope `maxInkWidth <= 0.66, bandRatio <= 0.15, symmetry <= 0.5`; field-notebook `minmax(0,1fr) 34%; gap 56px`, envelope `rightCol >= 0.5, symmetry <= 0.5, stagger >= 0.25`; ticket-stub `minmax(0,1fr) 12px 118px`, envelope `vRules >= 1, rightCol >= 0.75, symmetry <= 0.55`; trail-map `grid-template-rows: 22vh minmax(0,1fr) 96px` with a 220px legend fixed bottom-left, envelope `lowBand >= 0.5, symmetry <= 0.6, stagger >= 0.3`; museum-label `minmax(0,30ch) minmax(0,1fr); gap 96px`, right column bleeds, envelope `maxInkWidth >= 0.9, symmetry <= 0.5, bandRatio <= 0.3`; broadsheet `repeat(6,1fr)` hairline between every column, envelope `vRules >= 3, bandRatio <= 0.35, symmetry <= 0.68`; recipe-card a 5:3 card of `min(880px,86vw)` at 38 percent from the top, envelope `maxInkWidth <= 0.88, deadBottom <= 0.2, symmetry <= 0.62`; setlist `min(30ch,62vw) minmax(0,1fr)` right column times only, envelope `maxInkWidth <= 0.7, bandRatio <= 0.12, symmetry <= 0.42`; receipt a `min(44ch,86vw)` column hard left at 12 percent, envelope `maxInkWidth <= 0.6, bandRatio <= 0.12, symmetry <= 0.5`; scoreboard `grid-template-rows: 40px minmax(0,1fr) 132px` bar flush top, envelope `topBand >= 0.8, foldInk <= 0.3, bandRatio <= 0.4`; contact-sheet `repeat(6,1fr); gap 4px; padding 4px` reaching every edge, envelope `ink >= 0.45, bandRatio <= 0.3, edgeBleed >= 0.9`). Plate field per fold: ledger none, gift-tag none, field-notebook crop, ticket-stub crop, trail-map bleed, museum-label bleed, broadsheet crop, recipe-card bleed, setlist none, receipt none, scoreboard none, contact-sheet bleed.
4. **Baselines.** Two committed PNGs, `references/baselines/baseline-saas.png` and `baseline-awwwards.png` (1440x900 renders of the two category defaults, built once from `references/baselines/*.html`), with the `silhouette-lint` lines they produce, so step 8's Baseline row has fixed targets.
5. **Surfaces.** For each fold, one line each for dashboard, theme and terminal: what the shell keeps (the ledger dashboard keeps the 146px rail and the 76/1fr/300/168 row; the four numbers that would have been KPI cards become the first four entries; the running total lives under the double rule; charts sit inside the entry column at the row pitch; the terminal theme takes the row pitch as line-height and the amount column as the gutter alignment).
6. **Expiry.** The envelopes were calibrated on five pages. Each envelope line carries `calibrated: 2026-09-19 n=5`; the second-moment gate (section 8, phase 7) adds to n.

### 3.3 `references/light.md` (new)

1. **The light kit tokens.** `--source-x`, `--source-y` (percent of the viewport), `--key-angle` (deg, the only direction anything casts), `--falloff` (1.4, 2.2 or 3.0), `--lit` (0 to 1), `--grain` (0.05 or 0.055 when lit <= 0.3, else 0), all computed by `plate-tokens.mjs`. `moment-lint no-light-kit` fails a file with five roles and no `--source-x`.
2. **The lamp on the page.** One fixed radial at `var(--source-x) var(--source-y)`, `radial-gradient(ellipse 60% 50% at var(--source-x) var(--source-y), <accent at 12 percent alpha>, transparent 70%)` on `body::before`, `position: fixed`, `pointer-events: none`, `z-index: 0`. Every `box-shadow` offset is derived from `--key-angle`: `x = cos(key-angle + 180deg) * d`, `y = sin(key-angle + 180deg) * d`; give the four precomputed pairs for 296deg at d = 2, 8, 16, 24 px.
3. **The masked plume rule.** Any `clip-path` light must be masked with a radial alpha mask and blurred at least 34px, or it reads as a CSS shape (learned from a render that read as a wall corner). Recipe with exact values: `filter: blur(34px); mask-image: radial-gradient(closest-side, #000 40%, transparent 100%)`.
4. **One grain layer.** Grain is one document-level layer: `body::after` with `feTurbulence baseFrequency 0.9 numOctaves 2` as an inline SVG data URI, tile 220px, `mix-blend-mode: overlay`, opacity `var(--grain)`. Per-section grain leaves a bright seam at every boundary. Contrast is re-measured after grain by `craft-lint`, because a modeled 4.66:1 measured 4.27:1 with grain in the composite.
5. **The lit panel.** `background: radial-gradient(120% 90% at <lamp corner>, var(--surface-lit) 0%, var(--surface) 60%)`, `box-shadow: inset 0 1px 0 var(--specular)`, a 1px rim on the lamp side only. `--surface-lit` is surface with L + 0.03; `--specular` is ink at 14 percent alpha.
6. **The lit ruling (the ledger's light).** Every rule is `color-mix(in oklch, var(--muted) calc(var(--lit-row) * 1%), transparent)`, with `--lit-row` stepping 30, 27, 24, 22, 21, 20, 19, 18, 16 down the page and a horizontal gradient that dims toward the side away from the lamp. The row you are reading is the brightest thing on screen.
7. **Saturation for computed roles.** An authored role keeps the 0.08 cap. A computed role (the file carries `/* plate: ... */`) may carry chroma up to `min(C(accent), 0.12)`, because forbidding chroma on ink forbids the tungsten bulb from existing.
8. **Peak and trough.** When ink sits on a rendered range, the number that counts is the worst of flat, peak and trough. `craft-lint contrast` measures the painted pixel, so this is enforced without a model.
9. **Reduced motion for light.** Light never animates under `prefers-reduced-motion: reduce`; the lamp is on, the plume is still, the grain is static.

### 3.4 `references/imagery.md` (new)

1. **The shot record.** The `shot.json` schema: `{ prompt, negative, camera: { lens, distance, fstop, angle, dof, shutter }, kelvin, keyClock, litPct, safeSide, grain }`, and the four lookup tables verbatim from `shot.mjs`: GAZE (down: 50mm macro, 35cm, f/2.0, tilted 40 degrees down; out: 35mm, 3m, f/8, horizon on the lower third; up: 24mm tilted 30 up, f/4; across: 85mm, 6m, f/2.8 compressed), MATERIAL (five entries), TEMPO to shutter (slow 1/60s, held 1/250s, burst 1/1000s, crisp 1/500s, drift 1/30s), CLOCK to direction phrase, litFraction to the "N percent of the frame is lit" clause plus ISO 800 grain under 0.3, and the always-appended clauses: the reserved-empty side ("Leave the {right|left} 40 percent of the frame in near darkness and empty", opposite the key) and "No people's faces, no text, no logos, no props beyond what is listed".
2. **Props to fill light.** The rule from step 2 with three worked rewrites (tree bulbs, fireworks, a neon sign).
3. **The five laws** (verbatim, each with the linter that enforces it): the plate bleeds to at least two viewport edges and never sits in a card, never takes a radius, border, shadow or scrim (`moment-lint photo-in-a-card`, `scrim`); type sits inside `--plate-safe`, a scrim is a confession the shot was wrong, recompile with a larger reserved-empty side (`craft-lint safe-box`); one plate per page, supporting images are crops of the same file at 200 percent framed on the material's specular (`moment-lint one-plate`); the seam is a gradient to the exact sampled `--bg` over the plate's bottom 34 percent under the one document grain field; light continuity, every shadow along `--key-angle` (`craft-lint shadow-origin`).
4. **Negative prompt construction.** The Never list goes only into `negative`; `shot.mjs --check` exits 1 on any Never token in the positive prompt and prints `NEVER_LEAK <n>`.
5. **The procedural plate.** What `plate.mjs --provider procedural` renders (section 4.4) and how the brief says NOT PHOTOGRAPHIC.
6. **Providers.** Order in `auto`: `GEMINI_API_KEY` with `gemini-2.5-flash-image` at 16:9 (the 3-pro model returned 403 on this account), then `OPENAI_API_KEY` with `gpt-image-1` at 1536x1024 quality high (measured cost about $0.25 per plate at published rates), then procedural. Keys resolve through `node C:/Projects/creds/creds.mjs resolve <KEY>` first and a `.env` second; never printed. A standing ban on recognizable faces is in every positive prompt. `--import` for a client's photograph.
7. **Surfaces with no room for an image.** A theme pack, terminal or slide theme still makes a plate and never ships it; the plate is the color source and the safe box is ignored.
8. **Sampler limits.** The percentile bands were validated on one dark plate and one high-key plate (the farmers market demo in section 6). If bg and surface land within dL 0.03 of each other, `plate-tokens` prints `NARROW_BANDS` and widens surface to bg L + 0.06 (light theme) or bg L + 0.05 (dark theme), and says so.

### 3.5 `references/type.md` (new)

1. **Why a query.** A ban list can only subtract; it returns Spectral and Karla forever.
2. **The dial to flag table.** Text-in-the-scene production method to `--method`; the three voice words to `--contrast` and `--terminal`; the document's width to `--width`; the display string's needs to `--need` (`opsz` when the same face runs display and body; `wght` always; `slnt` or `ital` when the utterance is spoken; `wdth` for a scoreboard or a receipt).
3. **The specimen gate.** Render the real display string at the real size on the real background. Read the PNG. Name the winner and the two runners-up with reasons. A face named without a specimen is a reflex pick even when it is not on any list.
4. **Provenance.** `references/reflex-fonts.json` holds the list (the 33 names from translation.md section 6, verbatim). `moment-lint reflex-font` reads it. A listed family passes only when the token file carries `/* fonts.mjs rank=<n> ... */` with rank 1 to 3 next to it.
5. **Scale.** `timid-type`: the resolved font-size scale (var() resolved against the `:root` map, `clamp()` resolved to its upper bound, sizes under 11px ignored) must span at least 8x in brand register and 4.5x in product register. The BEFORE dashboard measured `sizes=13 min=11.5px max=24.8px range=2.2x`. The display step at 1440 is at least 3rem (brand) or 2.4rem (product) and at 390 at least 2.4rem or 1.8rem.
6. **Buttons and inputs do not inherit `font-family`.** Set `font: inherit` on `button, input, select, textarea` in the reset, or the primary action silently renders in Arial (found by pixels in the tournament after every band passed).

### 3.6 `references/voice.md` (new)

1. **The six dials, each forced by named rows.** Person and distance from Gaze (`down` second person close, `out` first person plural, `up` second person imperative, `across` third person); tense from Tempo (`slow` and `drift` present continuous, `held` future, `burst` and `crisp` simple present); sentence band from Air plus Tempo (still and slow: median 5 to 9 words, ceiling 14; crowded and burst: median 3 to 6, ceiling 9; open and crisp: median 6 to 10, ceiling 16); lexicon altitude from Objects plus Materials (concrete nouns from the inventory allowed, category nouns banned: no "solution", "platform", "experience"); what it notices from Gaze plus Keepsake (the copy names what the gaze lands on and never the product's feature list first); volume ceiling from Sound plus Air (near silence: no exclamation marks, no imperatives in headlines, one verb per sentence).
2. **`docs/voice.json` schema**, verbatim from the tournament: `{ brand, person, volume, median: [lo, hi], ceiling, headlineWords, clauseCap, props: [...], states: ["empty","loading","error","offline","done","first-run"], labelCase }`. `props` is the Never list plus the scene's own nouns (mug, lamp, steam, wool) so the page carries the light and never names the props.
3. **Four headline patterns**, with the tagline slot banned outright: the observation ("What last night left you."), the refusal ("One page. Never a feed."), the hour ("6:40 is the default."), the instruction in the utterance's voice ("Set one hour. The house learns to wait."). No pattern begins with the product name plus "is".
4. **The six states**, written at step 5b, carried as `data-state`, each one to two sentences in the dial band. The empty state is the moment's actual content ("Nothing has asked for you yet." is the model line). Error names the thing and the next action in the same sentence, no apology.
5. **copy-lint rules** (section 4.9).

### 3.7 `references/motion.md` (new)

1. **The score.** `{ verb, travel, transient: { ms, curve, name }, transport: { bpm, feel }, resolve: "once" | "never", silence, twin }` written into `docs/sense-memory.json` under `motion`. Tempo word to defaults: slow: travel 1px, transient 90ms, transport 5.5bpm, durations 320 to 480ms; held: travel 4px, transient 200ms, pauses; burst: travel 8px, transient 120ms, one hard cut; crisp: travel 3px, transient 160ms; drift: travel 2px, one ambient loop 8 to 20s.
2. **One verb per moment.** The verb is a property whitelist: `reveal` (opacity, clip-path, mask, filter, color, registered custom properties), `settle` (transform translate within budget, opacity), `warm` (color, background-color, box-shadow, filter), `count` (registered numeric custom properties, content via counter), `rise` (transform translateY within budget). Anything outside the list is a finding.
3. **Travel budget.** Any px translation in a `@keyframes` body or transition over the budget is a finding; with no score present the default budget is 8px, which fails the `translateY(20px)` fade-up reflex on sight.
4. **The twin is a design.** The `prefers-reduced-motion` block must contain substantive declarations (a crossfade, a static lit state), not a blanket `animation: none`.
5. **Overshoot by channel.** A negative-control cubic-bezier is allowed on filter, opacity, background-color, box-shadow and custom properties (a filament overshoots in brightness) and is a finding on transform, translate, top, left, margin, inset.
6. **Material curves**, from `choreography.mjs`: ceramic `cubic-bezier(.18,.92,.14,1)`, wool `cubic-bezier(.22,.61,.24,1)`, glass `cubic-bezier(.16,1,.3,1)`, steel `cubic-bezier(.4,0,.2,1)`, paper `cubic-bezier(.33,1,.68,1)`.

### 3.8 `references/fold-bands.md` (new)

A table of first-fold numbers measured live at 1440x900 by `fold-metrics.mjs` from apple.com, stripe.com, linear.app and arc.net on 2026-09-19 (the tournament's `ref-*.json`), the derived brand-register bands (hero 46 to 120px, scale 2.3x to 8x, biggest non-shell object 0.30 to 0.92 of the fold, contrastFails 0, bleed true, images >= 1 unless the fold's `plate` is `none`), an `expires: 2026-12-18` line (90 days) and the regenerate command: `node scripts/fold-metrics.mjs https://www.apple.com --label apple --json references/ref-apple.json` for each. The file says in its first paragraph that eleven green metrics are a floor, not taste.

### 3.9 `references/worked-examples.md` (rewritten)

Three v2 walkthroughs, each showing the fold key, the diagram, the plate-tokens output block, the specimen verdict, the six state strings and the eight verify lines: the canonical moment on ledger (landing and dashboard), the ferry deck at 23:40 on ticket-stub (landing), the farmers market at 9am on receipt (storefront, light theme, high-key sampler case). Palettes are shown as sampled output and the header says never to copy them.

### 3.10 `references/reflex-fonts.json` (new)

`{ "families": [ ...33 names... ], "updated": "2026-09-19" }`. Read by `moment-lint.mjs` and `fonts.mjs`.

---

## 4. Scripts

All scripts: Node 18+, ESM, no dependencies except Playwright resolved from `node_modules` or the npx cache (the `loadPlaywright()` function from `craft-lint.mjs`, which searches `%LOCALAPPDATA%/npm-cache/_npx/*/node_modules/playwright`; never a hardcoded absolute path). Every verdict line prints its volume. Exit codes: 0 pass, 1 findings, 2 usage, 3 input rejected (named below).

### 4.1 `scripts/context.mjs` (changed)

Adds `FOLD <key>|none` and `PLATE <path>|none` lines. Never exits non-zero.

### 4.2 `scripts/fold.mjs` (new, from the winner)

- CLI: `node fold.mjs --gaze <up|down|out|across> --document "<text>" [--surface landing|dashboard|theme|terminal] [--diagram] [--json] [--list]`.
- Input: two inventory rows. `--document` is matched case-insensitively against `ATLAS` keys, then `DOC_ALIASES`, then as a substring of any alias (so "an account book, ruled" resolves to ledger).
- Output: the recipe (eleven fields), the surface variant, the envelope, and with `--diagram` the 14x24 diagram. Under 400 tokens without `--diagram`. `--json` returns `{ key, gazeFits, ...fold }` for `silhouette-lint` and `fold-card`.
- Exports: `ATLAS`, `DOC_ALIASES`, `pick(gaze, document)`.
- Exit 3 when the document names nothing in the atlas (message: "no fold for '<document>'. Fix the document row; the atlas is at references/folds.md"). Exit 2 on usage.

### 4.3 `scripts/silhouette-lint.mjs` (new, from the winner, two additions)

- CLI: `node silhouette-lint.mjs <screenshot.png> [--fold <key>] [--viewport 1440x900|390x844] [--map] [--json]`.
- Input: any PNG (depth 8, color types 0/2/3/4/6, non-interlaced), decoded with `node:zlib`. Reduced to 200-cell-wide FILL, DETAIL and EDGE maps by max pooling (thresholds INK 28, DET 26, EDG 14 in 8-bit). Continuous ruled columns are removed before row metrics.
- Metrics: `ink, foldInk, heroInk, symmetry, heroSymmetry, axisCentered, bandRatio, ruleRows, vRules, gutters, leftFlush, rightCol, maxInkWidth, cardRepeat, stagger, deadBottom, deadQuad, topBand, sidebar, lowBand, edgeBleed`.
- Findings: `SAAS_FOLD` at 3 of 6 (a full-height division with sparse content behind it and vRules <= 1; cardRepeat >= 3; bandRatio >= 0.45; vRules === 0; leftFlush >= 0.55; deadQuad >= 0.85), `AWWWARDS_FOLD` at 3 of 4 (heroSymmetry >= 0.62; heroInk <= 0.16; topBand >= 0.80; axisCentered >= 0.60), `DEAD_BOTTOM` at deadBottom >= 0.12, and with `--fold` one `ENVELOPE` finding per unmet envelope line.
- Additions: `--viewport 390x844` switches the hero band to the first 844 rows and relaxes `symmetry` by 0.1 for every fold (a single column at 390 is narrower); `--map` prints the 200-wide ASCII map so the model can read its own composition.
- Output line: `PASS|FAIL <file>: cells=<W>x<H> inkedRows=<n> ground=rgb(...) <pct>% fold=<key|none> findings=<n>` then one line per finding with the counts (`SAAS_FOLD 3/6: ...`).
- Exit 0 pass, 1 fail, 2 usage.

### 4.4 `scripts/shot.mjs` (new, from the runner-up, `--check` implemented)

- CLI: `node shot.mjs <sense-memory.json> [--out docs/shot.json] [--check]`.
- Input: the inventory JSON from step 2. Output: `shot.json` (schema in 3.4) and a printed `PROMPT / NEGATIVE / CAMERA / SAFE SIDE` block.
- Enforces: pure lookup, no free text; the Never list goes only into `negative`; `--check` tokenizes `never` and `inventory.light.fill` source nouns and exits 1 if any token appears in `prompt`, printing `NEVER_LEAK <n>: <tokens>`; on pass prints `NEVER_LEAK 0`. The face ban clause is always appended.
- Exit 0, 1 on leak, 2 usage, 3 when `light` is missing a field.

### 4.5 `scripts/plate.mjs` (new; procedural branch must exist before anything ships)

- CLI: `node plate.mjs <shot.json> <out.png> [--provider auto|procedural|gemini|openai] [--regenerate] [--import <file>]`. Default provider is `procedural`. `auto` tries gemini, openai, procedural in that order and stops at the first success.
- Procedural renderer: writes an SVG from the shot record and rasterizes it with Playwright to 1536x1024: page ground at `oklch(0.10 0.01 <kelvin hue>)`; a radial key at the clock position (`clock` to cx, cy via the table in 3.1) with `r = 0.55 + litFraction * 0.4` of the width and a falloff exponent set by litFraction (three stops at 0, 35 and 100 percent with alpha 1, 0.35, 0); one specular arc from the dominant material row (ceramic: an ellipse 4 percent wide at 60 percent of the key radius, alpha 0.9; wool: none; wood: a 30 percent wide linear sheen at 6 degrees; glass: two arcs; steel: one 1 percent wide streak); `fill` items rendered as a row of 2px points at 2 percent alpha behind the key; `feTurbulence` grain at 0.045 when litFraction < 0.3. It writes a tEXt chunk `provider=procedural`.
- Provider branches call the APIs with the compiled prompt and negative, size 1536x1024 (openai) or 16:9 (gemini), print `usage=<json>` and a cost line at published rates, and write `provider=<name>`.
- Refuses to overwrite an existing `out.png` without `--regenerate` (exit 3, message names the file).
- `--import` copies a supplied image to `out.png` after re-encoding to PNG and writes `provider=import`.
- Exit 0 written, 1 all providers failed, 2 usage, 3 refused overwrite.

### 4.6 `scripts/plate-tokens.mjs` (new, from the runner-up, four additions)

- CLI: `node plate-tokens.mjs <plate.png> <tokens.css> [--fold <key>] [--register brand|product] [--twin] [--json] [--check]`.
- Input: any PNG (own inflate and unfilter, color types 2 and 6, depth 8). Output: the token file (header lines from step 4c, five roles, light kit) and a printed block.
- Sampling (verbatim from the tournament): `--bg` mean of the p06 to p20 luminance band; `--surface` p55 to p72; `--ink` p98 and up; `--accent` mean of the top 1 percent by chroma restricted to L 0.30 to 0.88; `--muted` 62 percent of the way from bg to ink on ink's hue. Floor overrides, each printed: chroma clamps 0.045 bg, 0.05 surface, `min(C(accent), 0.12)` ink (the saturation correction); ink lifted in 0.005 L steps until 4.6:1 on both grounds; accent lifted until 3.05:1 on bg; muted lifted until 4.6:1 on both bg and surface.
- Light kit: `--plate-safe x% y% w% h%` (largest rectangle of 32x20 grid cells with mean L under 0.30 and standard deviation under 0.055, maximal-rectangle histogram scan; for a light-theme plate the criterion inverts to mean L over 0.80); `--key-angle` (from the centroid of the top 2 percent luminance cells to the image center); `--source-x`, `--source-y` (that centroid in percent); `--falloff` and `--lit` from the shot record's litFraction; `--grain` 0.055 when lit <= 0.3, else 0.
- Additions: `--fold` writes the `/* fold: <key> */` line; `--twin` samples a second role set for the theme surface by remapping luminance (dark twin: bg from p02 to p10, ink from p90; light twin: bg from p85 to p95, ink from p04 to p12) and writes it under `[data-theme="dark"]` or `[data-theme="light"]`; `NARROW_BANDS` widening from 3.4 section 8; `--check` compares an existing token file to the plate and prints per-role dL/dC/dh (used by `moment-lint --plate`).
- Printed block: `sampled=<n> px`, five roles with source band, `ink/bg <r>:1 ink/surface <r>:1 accent/bg <r>:1 muted/bg <r>:1 muted/surface <r>:1`, each clamp, the safe box, the key angle.
- Exit 0, 1 when any contrast floor cannot be met by lifting (prints the ceiling), 2 usage.

### 4.7 `scripts/fonts.mjs` (new, from Optical Size)

- CLI: `node fonts.mjs --role display|body --method <pen|led|letterpress|routed|typewriter|stamp|screen> --contrast <low|medium|high> --terminal <round|wedge|ball|flat> --width <condensed|normal|wide> [--era any|<decade>] --need <axes,comma> [--include <family>] [--limit 3] [--specimen out.html --string "<text>" --size <px> --bg <css color> --ink <css color>] [--json]`.
- Sources (keyless): `https://fonts.google.com/metadata/fonts` and `https://api.fontshare.com/v2/fonts?limit=100`. Scanned count is printed (`scanned=2046` in the tournament).
- Scoring: axis coverage against `--need`, stroke and terminal match, a penalty for the literal-classification trap (a handwriting classification for `pen`), a penalty for top-40 popularity, and the reflex list from `references/reflex-fonts.json` applied as a post-filter that demotes rather than deletes so provenance can be recorded.
- `--specimen` writes an HTML sheet with the real string at the real size on the real background for the top three, with the css2 URL for each, ready for the Playwright screenshot.
- Output: three lines `rank=<n> <family> score=<s> axes=<list> source=<google|fontshare> url=<css2>`.
- Exit 0, 2 usage, 3 fetch failure (the skill then names three candidates from the reference's method table and says the catalog was unreachable; a face is still never named without a specimen).

### 4.8 `scripts/fold-card.mjs` (new, replaces `preview.mjs`)

- CLI: `node fold-card.mjs <tokens.css> <out.html> --plate <png> --fold <key> [--specimen <png>] [--voice <voice.json>]`.
- Output: one HTML page in the tokens, laid out as: the blocking diagram rendered in a 24x14 grid of 20px cells with the legend colors (`#` ink, `=` muted, `|` and `-` muted at 40 percent, `@` accent, `%` plate crop, `.` bg, `n` surface); the plate at 720px wide with the safe box outlined in accent and the key crosshair at `--source-x/--source-y`; five swatches with source band and the five contrast ratios; the display specimen image or, without one, the display string at the step-5 size; the six state strings in the body face; the envelope numbers; the light kit values. Prints `wrote <out> roles=5/5 fold=<key> plate=<provider> states=<n>/6`.
- Exit 0, 2 usage.

### 4.9 `scripts/copy-lint.mjs` (new, from The Narrator)

- CLI: `node copy-lint.mjs <file.html|file.md|copy.json> --spec docs/voice.json [--json]`, and `--hook` for PreToolUse (same payload handling as `moment-lint`; a file with no strings is ignored).
- Extraction: text nodes of body, alt text, placeholders, button labels, `title`; strings under 2 words ignored for sentence metrics but counted for the ban list.
- Rules (12): `banned-phrase` (the list in the tournament script: seamless, effortless, powerful, robust, game-changing, unlock, unleash, elevate, built for, everything you need, in seconds, ai-powered and the rest, verbatim), `prop-leak` (any `props` word from voice.json in rendered copy), `median-band` (median sentence length inside `median`), `ceiling` (no sentence over `ceiling` words), `headline-words` (h1 and h2 at or under `headlineWords`), `clause-cap` (commas plus semicolons per sentence at or under `clauseCap`), `person` (pronoun set matches `person`), `exclamation` (none when `volume` is quiet), `tagline-slot` (no h1 that begins with the brand name followed by "is" or a colon), `label-case` (buttons and labels match `labelCase`), `state-coverage` (every name in `states` has a `[data-state="<name>"]` element with at least eight words), `em-dash`.
- Output: `PASS|FAIL <file>: strings=<n> words=<n> median=<n> states=<k>/6 findings=<n>`.
- Exit 0, 1, 2.

### 4.10 `scripts/craft-lint.mjs` (new, from Hairline, three rules added)

- CLI: `node craft-lint.mjs <file.html|url> [--wide 1440x900] [--narrow 390x844] [--register brand|product] [--json]`.
- Three passes: wide, narrow, and wide with `reducedMotion: 'reduce'`; plus a 24-key Tab walk that asserts every stop paints a ring (outline or box-shadow change) with contrast >= 3:1 against its surroundings.
- The 12 shipped rules: `contrast` (per text node against the alpha-composited painted background, 4.5:1 body, 3:1 for text >= 24px or >= 19px bold), `concentric-radii` (child corner radius = parent radius minus the gap, tolerance 1px, for children within 12px of the parent corner), `hairline-system` (at most 2 distinct visible border widths and 3 border colors), `tabular-figures` (digit advance drift under 0.5px inside numeric-dominant elements, measured with a Range per character), `optical-stroke` (one optical stroke weight across all drawn SVG, computed as stroke-width times rendered over viewBox, tolerance 15 percent), `shadow-origin` (every drop shadow's offset angle within 20 degrees of `--key-angle`), `type-inventory` (at most 7 distinct font sizes in product, 9 in brand), `orphans` (no one-word last line in headings or paragraphs over one line), `spacing-vocabulary` (at most 8 distinct vertical paddings and gaps), `overflow` (no horizontal scroll at 390), `tap-targets` (44px minimum at 390 for every interactive element), `motion-twin` (under reduce, no animation over 0.05ms and no transition over 0.05ms, and the twin declares at least 2 substantive properties), `focus-walk` (the Tab walk above).
- Added: `fold-budget` (in the first viewport at 1440: at most 3 distinct font sizes, exactly one primary action, at most 9 elements with visible text or fill, the display step >= 3rem brand or 2.4rem product; at 390 the display step >= 2.4rem or 1.8rem); `safe-box` (when the page carries `--plate-safe`, every h1, h2 and nav within the plate's bounding box lies inside the safe box); `states` (counts `[data-state]` values against the six names, prints `states=<k>/6`).
- Output: `PASS|FAIL <file>: nodes=<n> rules=15 findings=<n>` then per-rule lines with counts (`contrast: 0 of 134 text nodes under floor`).
- Exit 0, 1, 2, 3 when Playwright cannot be resolved (message: `npx --yes playwright install chromium`).

### 4.11 `scripts/fold-metrics.mjs` (new, from Round Two, hardcoded path removed)

- CLI: `node fold-metrics.mjs <url|file> [--viewport 1440x900] [--label <name>] [--json <out>] [--compare <prev.json>] [--bands] [--wait 2500]`.
- Measures the first viewport: `hero` (largest font-size in px), `body` (most common font-size), `scale` (hero over body), `biggest` (largest non-shell element's area over the fold area, shell being nav and footer), `bleed` (any element touching two viewport edges), `images` (img and background-image count), `tracking` (hero letter-spacing in em), `contrastFails` (text nodes under 4.5:1), `elements` (visible elements in the fold).
- `--compare` prints one line: `DELTA hero 40 -> 66 | scale 2.67 -> 3.88 | biggest 0.109 -> 0.760 | bleed false -> true | images 0 -> 6`.
- `--bands` compares against `references/fold-bands.md` (parsed from its table) and prints one line per band with IN or OUT; the pass condition is `hero`, `scale` and `contrastFails` IN; the rest print.
- Exit 0, 1 when `--bands` and a pass-condition band is OUT, 2, 3 without Playwright.

### 4.12 `scripts/moment-lint.mjs` (changed; rules in section 5)

- CLI unchanged plus `--plate <png>` (runs `plate-tokens --check` logic and adds `plate-drift` findings) and `--register brand|product` (for `timid-type` thresholds; defaults to product).
- Hook matcher: `/\.(css|scss|json|ts|js|mjs|cjs|md|html|htm|jsx|tsx)$/i`. For html/jsx/tsx the linter lints the text of every `<style>` block and every `:root {` or `@theme {` block it finds; the role regex is unchanged.
- Reads `references/reflex-fonts.json` relative to its own path; falls back to the embedded array only when the file is missing and says `reflex-list=embedded` in the output line.
- Output line gains `fold=<key|none> kit=<yes|no>`: `PASS tokens.css: roles=5 oklch=7 fold=ledger kit=yes findings=0`.

### 4.13 Deleted: `scripts/preview.mjs`.

---

## 5. Linter rule changes (moment-lint.mjs unless stated)

| Rule | Change | Exact condition | Reason |
|---|---|---|---|
| `muted-contrast` | new | `--muted` under 4.5:1 on `--bg` or on `--surface` | The shipped Christmas tokens sit at 4.38:1 on surface and the page uses the role for text 29 times at 1440 and 27 at 390, worst 3.60:1, while v1 reports findings=0. Highest proven yield in the tournament |
| `missing-fold` | new | five roles present and no `/* fold: <key> */` within the first three lines, or the key is not in `ATLAS` | Lets the PreToolUse hook see composition; every later write in the session is denied until the page has been blocked. Fires only when palette roles are present so it cannot block an unrelated CSS file. Message names the fix: `node fold.mjs --gaze <row> --document <row>` |
| `no-light-kit` | new | five roles present and no `--source-x` | Light is an axis the token file must carry, not a paragraph |
| `saturation` | changed | non-accent chroma cap 0.08 for an authored file; `min(C(accent), 0.12)` when the file carries `/* plate: ... */` | A flat cap forbids the tungsten bulb from existing; the sampler had to clamp ink from 0.106 to 0.050 to pass v1 |
| `timid-type` | new | resolve `var()` against the `:root` map and `clamp()` to its upper bound; ignore sizes under 11px; fail when max over min is under 8 (brand) or 4.5 (product); print `sizes=<n> min=<px> max=<px> range=<x>` | The BEFORE reads `sizes=13 min=11.5px max=24.8px range=2.2x`; the prototype read `sizes=1 min=2.6px` until var() was resolved first |
| `reflex-font` | changed | reads `references/reflex-fonts.json`; a listed family is waived when `/* fonts.mjs rank=<1..3> */` follows it on the same line | A ban list can only subtract; provenance lets a queried face through and blocks a recalled one |
| `travel-budget` | new | any `translate*(<n>px)` in a `@keyframes` body or a transition on transform over the budget; budget from `/* travel: <n>px */` in the file, default 8px | Fails the `translateY(20px)` fade-up reflex on sight |
| `verb-property` | new | with `/* verb: <name> */` present, any animated property outside that verb's whitelist (3.7) | One verb per moment |
| `twin-is-a-switch` | new | a `prefers-reduced-motion: reduce` block whose only declarations are `animation: none`, `transition: none` or `*-duration: 0.01ms`; prints the count of substantive declarations found | The twin is a design, not a switch. The shipped Christmas tokens fail this today |
| `overshoot-channel` | replaces `easing` | a cubic-bezier with a negative control value (or the words bounce, elastic) applied to transform, translate, top, left, margin or inset; passes on filter, opacity, background-color, box-shadow, custom properties | A filament overshoots in brightness; the blanket ban pushed sessions back toward linear fades |
| `lamp-band` | new | any `--ok`, `--warn`, `--danger`, `--info`, `--success`, `--error` role with L outside L(accent) +/- 0.06 or C over C(accent) | The BEFORE dashboard's stock blue and teal chart lines are this failure and no v1 rule sees it |
| `scrim` | new | a `linear-gradient` with any stop alpha >= 0.45 declared on a selector that also carries `background-image: url(` or targets an element containing `img` (text heuristic: same rule block) | Law 2: a scrim is a confession the shot was wrong |
| `photo-in-a-card` | new | a rule block with `background-image: url(` or an `img` selector that also sets `border-radius` over 8px or any `box-shadow` | Law 1 |
| `one-plate` | new | more than one distinct raster `url(` in the file, excluding crops of the plate's own path | Law 3 |
| `plate-drift` | new, `--plate` only | any role departing from its sampled cluster by dL 0.04, dC 0.03 or dh 12 without an `/* override: */` comment | Stops a later session nudging the palette away from the photograph |
| `em-dash`, `cream-trap`, `indigo-band`, `contrast`, `tell-name`, `tell-hex`, `roles` | unchanged | | |
| hook matcher | changed | adds html, htm, jsx, tsx; lints `<style>` and `:root`/`@theme` blocks | Every single-file page in the tournament kept its tokens inline and was linted only by hand |

---

## 6. Demo set

Six demos under `demos/<name>/`, each with `sense-memory.json`, `shot.json`, `tokens.css`, `voice.json`, `index.html` (or the theme's sample page), `assets/plate-01.png`, `fold-card.png`, `specimen.png`, `fold-1440.png`, `desktop.png` (1440 full page), `fold-390.png`, `mobile.png` (390 full page), `reduced-fold-1440.png`, `brief.md` and a `MEASURED.md` holding the eight verify lines verbatim. The BEFORE screenshots of the four v1 demos move to `demos/_before/<name>.png` and are referenced from the README as the before pictures.

| # | Moment | Surface | Register | Fold | Plate | Purpose |
|---|---|---|---|---|---|---|
| 1 | Christmas morning, 6:40, first coffee (canonical) | dashboard | product | ledger | procedural, not shipped | the BEFORE/AFTER pair; proves the fold survives the product register |
| 2 | Christmas morning (canonical) | landing | brand | ledger | procedural by default; the tournament's generated plate committed as `assets/plate-01-photo.png` for the README comparison | the winner's Carryover page rebuilt through the shipped scripts |
| 3 | Christmas morning (canonical) | theme pack, light and dark | product | ledger | procedural, `--twin` | proves one moment yields two themes from one plate |
| 4 | Ferry deck, 23:40, wet steel rail, one sodium lamp at 0.66 across | landing | brand | ticket-stub (document: boarding pass) | procedural | the second-moment gate: a different room, a different fold, both linters green |
| 5 | Saturday farmers market, 9am, low sun, paper bags, chalk prices | storefront (landing) | brand | receipt (document: till roll) | procedural, light theme | the high-key sampler case; replaces the flat tan card grid |
| 6 | First crisp day of fall, 8am, 48 degrees | terminal and editor theme | product | field-notebook (document: notebook) | procedural, never shipped | proves the terminal surface takes the row pitch and gutter from the fold |

Screenshot sizes: fold 1440x900 viewport, desktop 1440 full page, fold 390x844 viewport, mobile 390 full page, reduced-motion fold 1440x900 via a page that sets `emulateMedia({ reducedMotion: 'reduce' })` (the `craft-lint` third pass writes it as `reduced-fold-1440.png`). README shows before and after for demos 1, 2 and 5 side by side at 480px.

---

## 7. Evals and graders

Keep the three cases and change the graders; add three cases. All graders use the types already in use (`llm`, `regex`, `tool_used`, `file_exists`).

- `moment-given` (fall day, dashboard tokens only): add `fold-declared.md` (regex `\/\* fold: (ledger|gift-tag|field-notebook|ticket-stub|trail-map|museum-label|broadsheet|recipe-card|setlist|receipt|scoreboard|contact-sheet) \*\/` on `styles/tokens.css`), `light-kit.md` (regex `--source-x\s*:` count 1), `fold-ran.md` (tool_used Bash with input_match `fold\.mjs`), `no-reflex-ledger.md` (llm: FAIL if the response contains a nine-row reflex ledger table), and change `brief-quality.md` to require the fold key, the diagram, the specimen verdict and the six state strings instead of the ledger.
- `no-moment`: unchanged.
- `holiday-no-props`: add `never-leak.md` (regex `NEVER_LEAK 0` in the final message) and `fill-light.md` (llm: PASS if the tree bulbs appear in the Light row's `fill` as light without the word tree).
- New `landing-fold` (prompt: the canonical moment, "build the landing page for a daybook app, single file"; allowed tools Read, Glob, Grep, Skill, Write, Bash): graders `silhouette-pass.md` (regex `PASS .*fold=ledger findings=0` in the final message), `craft-pass.md` (regex `rules=15 findings=0`), `states.md` (regex `states=6/6`), `specimen-read.md` (tool_used Read with input_match `specimen\.png`), `no-em-dash.md` (regex on `index.html`, not_contains `\u2014`), `no-props-rendered.md` (regex on `index.html`, not_contains `(?i)christmas|holiday|snowflake|santa`).
- New `second-moment` (prompt: the ferry deck at 23:40, landing): graders `fold-not-ledger.md` (regex on `styles/tokens.css`: `\/\* fold: (?!ledger)`), `silhouette-pass.md`, `craft-pass.md`.
- New `hook-denies` (prompt: with a committed v2 token file in the fixture, "change the accent to oklch(0.6 0.2 275) and the muted to oklch(0.45 0.01 70)"): grader `denied.md` (llm: PASS if the response reports the write was denied by the hook naming `indigo-band` and `muted-contrast` and the file is unchanged), `file-unchanged.md` (regex on tokens.css contains the original accent hue).
- Command: `claude plugin eval . --ablation none --runs 1 --allow-tools Bash Write`.

---

## 8. Build order

Each phase ends with the exact command and the line it must print. Nothing under `~/.claude/skills/sense-memory` changes until phase 8; work in `C:/Projects/sense-memory`.

**Phase 0. Floor fixes to the existing linter (half a day).** Add `muted-contrast`, `missing-fold`, `twin-is-a-switch`, `overshoot-channel` (remove `easing`), the matcher extension, and `references/reflex-fonts.json`. Verify, in this order, that the instrument fails before it passes:
`node scripts/moment-lint.mjs demos/christmas-morning-dashboard/tokens.css` prints `FAIL ... findings=3` naming `muted-contrast` (4.38:1 on surface), `missing-fold`, `twin-is-a-switch`.
`printf '<style>:root{--bg:oklch(0.2 0.01 60);--surface:oklch(0.25 0.01 60);--ink:oklch(0.95 0.01 80);--accent:oklch(0.6 0.2 275);--muted:oklch(0.7 0.01 70)}</style>' > /tmp/t.html` then `echo '{"tool_input":{"file_path":"/tmp/t.html","content":"<same>"}}' | node scripts/moment-lint.mjs --hook` prints a deny payload naming `indigo-band`.

**Phase 1. Blocking (one day).** Copy `fold.mjs` and `silhouette-lint.mjs` from the tournament into `scripts/`, add `plate`, `diagram` and `surfaces` fields to all twelve entries, add `--diagram`, `--viewport 390x844` and `--map`. Write `references/folds.md` and the two baseline HTML pages and PNGs.
`node scripts/fold.mjs --gaze down --document "account book" --diagram` prints `fold=ledger` and 14 diagram rows; `node scripts/fold.mjs --gaze down --document "a vibe"; echo exit=$?` prints `exit=3`.
`for f in demos/*/screenshot.png; do node scripts/silhouette-lint.mjs "$f"; done` prints four `FAIL` lines with `SAAS_FOLD 3/6`, `AWWWARDS_FOLD 3/4`, `SAAS_FOLD 4/6`, `SAAS_FOLD 4/6`.
`node scripts/silhouette-lint.mjs <tournament>/silhouette/fold-1440.png --fold ledger` prints `PASS ... fold=ledger findings=0`.
`node scripts/silhouette-lint.mjs references/baselines/baseline-saas.png` and `baseline-awwwards.png` both print `FAIL`.

**Phase 2. Light and plate (one day).** Copy `shot.mjs` and `plate-tokens.mjs`, implement `--check`, write `plate.mjs` with the procedural renderer first, then the two provider branches and `--import`. Write `references/light.md` and `references/imagery.md`. Add `no-light-kit`, `saturation` change, `lamp-band`, `scrim`, `photo-in-a-card`, `one-plate`, `plate-drift` to `moment-lint`.
`node scripts/shot.mjs demos/christmas-morning-landing/sense-memory.json --out /tmp/shot.json --check` prints `NEVER_LEAK 0`; temporarily add "tree" to the objects row and re-run: prints `NEVER_LEAK 1: tree` and exits 1.
`node scripts/plate.mjs /tmp/shot.json /tmp/plate.png` writes a 1536x1024 PNG; `node scripts/plate-tokens.mjs /tmp/plate.png /tmp/tokens.css --fold ledger --register brand` prints five roles, all five contrast lines at or above their floors, and a safe box; `node scripts/moment-lint.mjs /tmp/tokens.css --plate /tmp/plate.png` prints `PASS ... fold=ledger kit=yes findings=0`.
Run the same chain on the farmers-market JSON (light theme): `plate-tokens` must not print `NARROW_BANDS` with an unresolved collision, and `moment-lint` must print `PASS` with no `cream-trap` (bg is the sampled paper-bag brown or chroma 0, never the warm near-white band).
Run `plate-tokens --check` against the tournament's generated `plate-one/assets/plate-01.png` and its `tokens.css`: every role within drift tolerance.

**Phase 3. Type, voice, motion (one day).** Copy `fonts.mjs` and `copy-lint.mjs`, add `timid-type`, `reflex-font` provenance, `travel-budget`, `verb-property` to `moment-lint`. Write `references/type.md`, `voice.md`, `motion.md`.
`node scripts/fonts.mjs --role display --method pen --contrast medium --terminal wedge --width normal --need opsz,wght --limit 3 --specimen /tmp/spec.html --string "What last night left you." --size 88 --bg "oklch(0.17 0.014 58)" --ink "oklch(0.93 0.018 78)"` prints `scanned=<n>` above 1900 and three ranked lines; the Playwright screenshot of `/tmp/spec.html` renders three faces at 88px.
`node scripts/moment-lint.mjs demos/christmas-morning-dashboard/tokens.css --register product` now also names `timid-type` if the file declares sizes (it does not; run instead on the BEFORE `index.html`: prints `timid-type: sizes=13 min=11.5px max=24.8px range=2.2x`).
`node scripts/copy-lint.mjs demos/christmas-morning-dashboard/index.html --spec <a voice.json for the moment>` prints `FAIL` with `state-coverage 1/6` (the one accidental empty state).

**Phase 4. Rendered craft and the card (one day).** Copy `craft-lint.mjs`, add `fold-budget`, `safe-box`, `states`; write `fold-card.mjs`; delete `preview.mjs`; copy `fold-metrics.mjs` with `loadPlaywright()` in place of the hardcoded path, add `--compare` and `--bands`; write `references/fold-bands.md` from the four `ref-*.json`.
`node scripts/craft-lint.mjs demos/christmas-morning-dashboard/index.html` prints `FAIL index.html: nodes=134 rules=15 findings>=73` including `contrast` and `tabular-figures` lines with counts.
`node scripts/craft-lint.mjs <tournament>/hairline/index.html` prints `PASS ... nodes=227` with at most the new `fold-budget` and `states` findings (expected: it fails `fold-budget`, which is correct; it is the admin template).
`node scripts/fold-card.mjs /tmp/tokens.css /tmp/card.html --plate /tmp/plate.png --fold ledger` then the screenshot; read the PNG: the diagram, the safe box and five swatches are visible.
`node scripts/fold-metrics.mjs <tournament>/silhouette/index.html --bands` prints `hero IN scale IN contrastFails IN`.

**Phase 5. SKILL.md and references (half a day).** Rewrite SKILL.md to section 2, edit translation.md per 3.1, rewrite worked-examples.md. Keep the front matter's `allowed-tools` and add `Bash(node *sense-memory/scripts/*)` coverage for the new scripts (already matched by the glob). The hook block gains a second command for `copy-lint.mjs --hook`.
Verify: `node scripts/selftest.mjs --no-em-dash SKILL.md references/*.md` prints 0 for every file; `node -e "import('./scripts/fold.mjs').then(m=>console.log(Object.keys(m.ATLAS).length))"` prints 12 and every fold key named in folds.md appears in the ATLAS (`scripts/selftest.mjs`, under 40 lines: `--no-em-dash <files>` prints the U+2014 count per file and exits 1 on any; with no flag it asserts 12 atlas keys, 37 aliases, every envelope metric name present in `silhouette-lint`'s metric list, and every fold key in folds.md present in the ATLAS).

**Phase 6. Demos (two days).** Build the six demos through the v2 workflow, in this order: 1 (dashboard, the before/after), 2 (landing), 5 (farmers market, high-key), 4 (ferry deck), 3 (theme pack), 6 (terminal). Each demo folder ends with `MEASURED.md` holding the eight verify lines.
Verify per demo: `node scripts/silhouette-lint.mjs demos/<n>/fold-1440.png --fold <key>` PASS; `node scripts/craft-lint.mjs demos/<n>/index.html` PASS; `node scripts/copy-lint.mjs demos/<n>/index.html --spec demos/<n>/voice.json` PASS with `states=6/6`; `node scripts/moment-lint.mjs demos/<n>/tokens.css --plate demos/<n>/assets/plate-01.png` PASS. Then a contact sheet: `node scripts/fold-card.mjs --sheet demos/*/fold-1440.png docs/contact-sheet.html` (a `--sheet` mode that tiles PNGs at 200px) and read it: six folds, no two alike, none nameable as an event.

**Phase 7. Evals and the second-moment gate (half a day).** Write the graders in section 7. Add to the repo's `CONTRIBUTING.md` (new, ten lines): no change to SKILL.md, translation.md, folds.md or any generator merges until it has run end to end on the canonical moment and one unrelated moment with both fold screenshots and both `silhouette-lint` lines attached to the commit message.
`claude plugin eval . --ablation none --runs 1 --allow-tools Bash Write` reports all cases passing; paste the summary into `MEASURED.md` at the repo root.

**Phase 8. Install and retro (one hour).** Sync to `~/.claude/skills/sense-memory` by the repo's existing install step, run `node "$HOME/.claude/skills/sense-memory/scripts/context.mjs"` from an empty folder (prints `MOMENT_NONE ... FOLD none PLATE none`), run the hook probe from phase 0 against the installed path, and write the retro (what worked, what did not, the one change) into the repo's ERRORS.md.

---

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Twelve folds become twelve recognizable shapes once the skill has run fifty times; the ledger becomes a tell | The fold is chosen by the document row the user supplies, so distribution follows users, not a default; `context.mjs` prints `FOLD` so a project keeps one; phase 7's second-moment rule adds a fold to `n` each time; the atlas gains an entry only with a numeric envelope and a built proof, never as prose |
| The silhouette thresholds were calibrated on five pages and two were tuned after seeing the author's own page | Every envelope line carries `calibrated: <date> n=<count>`; the two baseline PNGs are committed so a threshold change must keep failing them; a change to a threshold is a commit that attaches the new lines for all six demos |
| `--provider procedural` renders a light study, not a photograph, so brand pages without a key are lit but not photographic | The brief says NOT PHOTOGRAPHIC in the Light line; the plate still supplies the palette, safe box and key angle, which is 80 percent of what the page borrows from it; `--import` accepts a real photograph from the client; the paid branch is one flag away |
| The sampler's percentile bands collapse on a bright, flat, high-key scene | Demo 5 is that scene and is a required phase-2 verification; `NARROW_BANDS` widening is deterministic and printed; the light-twin remap is specified |
| `craft-lint` and `fold-metrics` need Playwright; a session without it loses the two DOM-level gates | `loadPlaywright()` searches the npx cache; exit 3 prints the one install command; `silhouette-lint`, `moment-lint`, `copy-lint`, `fold.mjs`, `plate-tokens` and the procedural plate need nothing, so the composition and palette gates still hold with no browser |
| The hook now lints html/jsx/tsx and could deny an unrelated write in a large app | Every rule that can fire on a non-token file (`missing-fold`, `no-light-kit`, `muted-contrast`) fires only when all five palette roles are present in the same file; `scrim`, `photo-in-a-card` and `one-plate` fire only when a `/* plate: */` line is present |
| More steps could rebuild the attention problem the reorder fixed | Steps 3 to 6 are script output pasted into the response; the model writes prose only at 1, 2, the two card answers, the specimen verdict and step 9; the brief is short and last |
| Image generation cost and provenance (hands in frame, faces) | Default is procedural; the face ban is in every prompt; one plate per moment is enforced by the overwrite refusal; cost is printed per generation |
| The motion rules are text-parsed and can be gamed by JS-driven animation | `craft-lint motion-twin` measures computed animation durations in the reduce pass, which catches JS-applied styles; the text rules are the cheap first line |
| The ferry and fall demos are built by the same author as the skill and may still share an eye | The contact sheet in phase 6 is read as a stranger and its verdict is recorded in MEASURED.md; the evals run the skill without the author |

---

## 10. Deletions

- `scripts/preview.mjs` (replaced by `scripts/fold-card.mjs`).
- `references/translation.md` section 6b, the Silhouette test paragraph in section 9, and the "imagery real when the scene implies it" sentence in section 10.
- The reflex ledger from the brief template and from Gate 3.
- The Silhouette row of the old verify table (prose) and the old five-check "verdict" list in Gate 3; Kitsch, Cream trap, Swap and Awwwards lane survive as one-line reading checks pointing at their scripts.
- The three-file persistence block at old step 4 (the JSON moves to step 2, the tokens to step 4, the record to step 9).
- The `easing` linter rule (replaced by `overshoot-channel`).
- The embedded `REFLEX_FONTS` array as the source of truth (kept only as a fallback that announces itself).
- The four v1 demo folders' `index.html`, `tokens.css` and `brief.md` (rebuilt in phase 6; their screenshots move to `demos/_before/`).
- `docs/sense-memory-preview.html` and `.png` as workflow outputs.
- The old step 5 sentence "Render the moment card, then apply".
- The Judgment note "No menus" in its old wording (rewritten, not removed).
