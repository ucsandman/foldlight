---
name: sense-memory
description: Turn a remembered moment into a design identity, then carry it into the actual UI. The user describes a feeling, a scene, or a moment in time ("Christmas morning with coffee before anyone is up", "New Year's Eve when the ball drops", "the first crisp day of fall, jeans and a sweatshirt weather") and this skill extracts its light, palette, materials, tempo, composition, and one signature into OKLCH tokens, a written brief, and a rendered preview that a website, dashboard, app theme, slide deck, or terminal theme is then built from. Use whenever a user wants a site, dashboard, theme, or component to "feel like" a moment, season, place, ritual, or emotion; says their AI-built UI "looks like every other AI site" and wants an identity instead of a template; asks for design inspiration from a memory or a mood; or invokes /sense-memory. Runs before frontend-design, impeccable, or de-vibe and produces the brief those skills build from.
argument-hint: "[the moment, in your own words] [for: landing | dashboard | theme | terminal]"
allowed-tools:
  - Bash(node *sense-memory/scripts/*)
  - Bash(npx --yes playwright screenshot *)
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: node "$HOME/.claude/skills/sense-memory/scripts/moment-lint.mjs" --hook
        - type: command
          command: node "$HOME/.claude/skills/sense-memory/scripts/copy-lint.mjs" --hook --spec docs/voice.json
---

# Sense Memory

Rule zero: **carry the light and the feeling, never the props.** Christmas morning is not red, green, and snowflakes. It is low winter sun through one window, the glaze on a ceramic mug, wool, unhurried time, and a house that is still asleep. A stranger should feel the moment and be unable to name it.

Stanislavski's actors recalled a real sensory moment to produce a real emotion on stage. This skill does the same for design. A moment supplied by the user is the one input no model shares with any other prompt, so a design derived from it cannot converge on the median. Every other design skill works by refusal (ban lists, reflex-reject fonts) or by menu (eight anchors, fifteen styles, six hero architectures, a library of named brands). Menus are closed sets; a bigger menu is a bigger monoculture. This skill works by source: derive everything from one lived moment, and the refusals take care of themselves.

## Project state (first tool call)

Run the probe before step 1:

```
node "${CLAUDE_SKILL_DIR}/scripts/context.mjs"
```

Labels: `MOMENT_EXISTS` means a brief is already persisted (extend it, never replace it without asking); `TOKENS` names the file and format to write into; `REGISTER_HINT` is a guess to confirm; `FONTS` are commitments to keep unless the user is replacing the identity; `FOLD` is the fold key already declared in a token surface (one product keeps one fold, so reuse it); `PLATE` is the plate already made for this project (one plate per moment, forever).

If the shell is unavailable or denied, do not stop and do not ask for permission: Glob for `docs/DESIGN.md`, `docs/sense-memory.json`, `PRODUCT.md`, and any `tokens.css`, `globals.css`, `tailwind.config.*`, read what exists, and continue the workflow with those answers. The workflow below never depends on the shell; the scripts make it faster and stricter, not possible.

## Workflow

Nine steps, each with a gate. A gate that is not written in the response was not passed. No UI code before gate 6. The brief is written at step 9, after the pixels pass.

### 0. Probe

The command above. Read `FOLD` and `PLATE` before anything else; they decide whether this session is extending an identity or starting one.

**Gate 0:** the ten probe lines are in the response (`MOMENT_*`, `DESIGN_MD`, `PRODUCT_MD`, `TOKENS`, `FOLD`, `PLATE`, `FONTS`, `REGISTER_HINT`, `STACK`, `SCANNED`).

### 1. Capture the moment

If the prompt has no moment, ask one question and stop: "What's a specific moment you'd want this to feel like? Time of day, where you are, what you're holding." One question, no menu. Expand a thin moment into a first-person paragraph of four to six sentences. "Fall day" is a category; "8am, 48 degrees, wet leaves on the sidewalk, sun still low and gold, sweatshirt sleeves pulled over hands" is a moment. Every word the user used must land in an inventory row: "crisp" goes in Air, "the ball drops" goes in Tempo, "sweatshirt" goes in Materials. Expansion adds detail around their words and never replaces them.

**Gate 1:** the paragraph, containing every word the user used, and one line `register=<brand|product> surface=<landing|dashboard|theme|terminal>`.

### 2. Sensory inventory (twelve rows, Light is a record)

| Row | What to write |
|---|---|
| Light | A record, not a sentence: `source`, `clock` (1 to 12, where the key sits as seen from the camera), `kelvin`, `litFraction` (0 to 1), `fill` (every light-emitting item from the Never list, rewritten as light with its name removed) |
| Objects | Five to eight physical things, each colored as a material |
| Materials | What things are made of; the dominant one first |
| Air | Temperature, humidity, stillness, density |
| Tempo | One score word: slow, held, burst, crisp, drift |
| Sound | The one sound and its shape |
| Gaze | Exactly one of: up, down, out, across |
| Text in the scene | Lettering physically present, and how it was made (pen, LED, letterpress, routed, typewriter) |
| The document | The printed object that belongs to the moment. It must name something in the fold atlas or one of its aliases (`references/folds.md`); "a vibe" is rejected by `fold.mjs` with exit 3 |
| The gesture | The one physical action |
| The keepsake | The single thing remembered a year later |
| The utterance | The one sentence someone in the scene could say out loud, in their person and tense. It seeds the voice dials |

A Never item that emits or reflects light goes into `light.fill` as a description of its light with its name removed: the tree bulbs become "a line of very small warm bulbs low on a shelf far behind the camera, 2200K, faint". The prop leaves the frame; its light stays.

Write `docs/sense-memory.json` now. It is the machine input the scripts read, not the brief. Exact keys: `title`, `moment`, `register`, `surface`, `inventory` (`light` with the five fields, `objects`, `materials`, `air`, `tempo`, `sound`, `gaze`, `text`, `document`, `gesture`, `keepsake`, `utterance`) and `never`.

**Gate 2:** twelve rows in the response, none blank; the Light row shows all five fields and `litFraction` is a number; every `never` item that emits light appears in `fill`; the JSON file exists.

### 3. Block the page (before any token work)

```
node "${CLAUDE_SKILL_DIR}/scripts/fold.mjs" --gaze <up|down|out|across> --document "<document row>" --surface <landing|dashboard|theme|terminal> --diagram
```

The script resolves Gaze x Document to one fold key and prints the recipe (shell, row, verticals, primary, separation, metadata, nav, type, forbidden, plate), the silhouette envelope with its `calibrated:` line, the surface variant and the 24x14 diagram:

```
fold=ledger  (The ledger)
gaze affinity: down, across
shell      grid-template-columns: 146px minmax(0,1fr); no top bar exists, at any width.
silhouette envelope (checked by silhouette-lint.mjs --fold ledger), calibrated: 2026-09-19 n=5:
  ruleRows >= 10
  vRules >= 2
  rightCol >= 0.35
```

If the gaze is outside the fold's affinity the script says so: keep the document, apply the gaze as gravity, move the weight and the primary action, not the grid. Exit 3 (`no fold for "a handwritten card"`) means the document row names nothing in the atlas. Fix the inventory row; never invent a layout.

Diagram legend: `#` display type, `=` body text, `|` continuous vertical rule, `-` hairline, `@` the primary action (exactly one), `%` plate or image, `.` unlit or empty, `n` navigation.

**Gate 3:** fold key, the diagram and the three most binding envelope numbers are in the response, and the diagram is not a top bar over a centered column.

### 4. Light and color (the plate is the color source)

4a. Compile the shot record. Pure lookup, no prose:

```
node "${CLAUDE_SKILL_DIR}/scripts/shot.mjs" docs/sense-memory.json --out docs/shot.json --check
```

It prints `PROMPT`, `NEGATIVE`, `CAMERA`, `SAFE SIDE` and then `NEVER_LEAK 0 (never-tokens=9 scanned=257 prompt words)`. Any Never token in the positive prompt exits 1.

4b. Make the plate. Procedural is the default and needs no key and no network:

```
node "${CLAUDE_SKILL_DIR}/scripts/plate.mjs" docs/shot.json assets/plate-01.png
node "${CLAUDE_SKILL_DIR}/scripts/plate.mjs" docs/shot.json assets/plate-01.png --provider openai   # only when the user asks for photography and a key resolves
node "${CLAUDE_SKILL_DIR}/scripts/plate.mjs" --import <client photo> assets/plate-01.png            # a real photograph the user supplied
```

One plate per moment, forever; the script refuses to overwrite without `--regenerate` (exit 3). A procedural plate prints `NOT PHOTOGRAPHIC: a rendered light study, key clock 8, 2400K, 12% lit` and stamps `provider=procedural` in the PNG; a generated one prints its usage and cost.

4c. Sample the roles and the light kit out of the plate, into the project's real token surface (`TOKENS`, or `styles/tokens.css` greenfield), then lint:

```
node "${CLAUDE_SKILL_DIR}/scripts/plate-tokens.mjs" assets/plate-01.png styles/tokens.css --fold <key> --register <brand|product> --title "<title>"
node "${CLAUDE_SKILL_DIR}/scripts/moment-lint.mjs" styles/tokens.css --plate assets/plate-01.png --register <brand|product>
```

Add `--twin` for the theme surface (it writes the `[data-theme="dark"]` or `[data-theme="light"]` twin from the same plate). The token file's first three lines are fixed: `/* Sense memory: <title> */`, `/* fold: <key> */`, `/* plate: assets/plate-01.png provider=<...> */`, then the five roles with their source band as a trailing comment and the light kit (`--source-x`, `--source-y`, `--key-angle`, `--falloff`, `--lit`, `--grain`, `--plate-safe`). A role hand-moved from its sampled cluster by more than dL 0.04, dC 0.03 or dh 12 carries `/* override: <reason> */` or `moment-lint --plate` fails it as `plate-drift`.

**Gate 4:** the `CAMERA` and `SAFE SIDE` lines quoted with `NEVER_LEAK 0`; the plate path and provider stated; the `plate-tokens` block quoted (five roles, five contrast lines, the clamps, the safe box, the key line); and `moment-lint` reading `PASS styles/tokens.css: roles=5 oklch=5 fold=<key> kit=yes findings=0`.

### 5. Type and voice

5a. Type by query and specimen, never by recall:

```
node "${CLAUDE_SKILL_DIR}/scripts/fonts.mjs" --role display --method <pen|led|letterpress|routed|typewriter|stamp|screen> --contrast <low|medium|high> --terminal <round|wedge|ball|flat> --width <condensed|normal|wide> --need <axes> --limit 3 --specimen docs/specimen.html --string "<the real display string>" --size <px at 1440> --bg "<--bg value>" --ink "<--ink value>"
node "${CLAUDE_SKILL_DIR}/scripts/fonts.mjs" --role body --method <...> --contrast <...> --terminal <...> --width <...> --need wght --limit 3 --specimen docs/specimen-body.html --string "<one real body sentence>" --size 16 --bg "<--bg value>" --ink "<--ink value>"
npx --yes playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=2500 "file:///<abs>/docs/specimen.html" docs/specimen.png
```

The query line prints its volume (`scanned=2046 families (google+fontshare) ... ranked=2046`), then `rank=1 <family> score=<n> axes=<list> source=<google|fontshare> url=<css2>` for each candidate and a `demoted=` line for reflex families. Read `docs/specimen.png`. Name the winner and the two runners-up and why each lost, one line each. Record the choice in the token file as `--font-display` and `--font-body`, each followed by `/* fonts.mjs rank=<n> query=<method>/<terminal>/<need> */`; without that comment a listed family is a `reflex-font` finding. Exit 3 means the catalog was unreachable: say so, name three candidates from `references/type.md`, and still render a specimen.

5b. Voice. Derive the six dials from named rows (the table in `references/voice.md`) and write `docs/voice.json`: `{ brand, person, volume, median, ceiling, headlineWords, clauseCap, props, states, labelCase }`. Write the six state strings now, before any page exists: `empty`, `loading`, `error`, `offline`, `done`, `first-run`. They ship in markup as `data-state="<name>"` so coverage is countable: `node "${CLAUDE_SKILL_DIR}/scripts/copy-lint.mjs" <file.html> --spec docs/voice.json` reports `states=<n>/6` and fails a surface missing one. Run it on the fold's markup the moment step 7 renders, not only at the Copy row of step 8. The same linter runs as a PreToolUse hook for the rest of the session: silent until `docs/voice.json` exists, and `state-coverage` applies only to a whole markup document (an html target carrying `<body`), so a brief, a snippet Edit or a partial component is never denied for missing states.

**Gate 5:** the specimen PNG was read (say so and name the file); winner plus two losers with reasons; the six dial values; the six state strings.

### 6. Render the fold card and read it

```
node "${CLAUDE_SKILL_DIR}/scripts/fold-card.mjs" styles/tokens.css docs/fold-card.html --plate assets/plate-01.png --fold <key> --specimen docs/specimen.png --voice docs/voice.json
npx --yes playwright screenshot --viewport-size=1440,1200 --full-page --wait-for-timeout=2500 "file:///<abs>/docs/fold-card.html" docs/fold-card.png
```

It prints `wrote docs/fold-card.html roles=5/5 fold=<key> plate=<provider> states=6/6`. The card shows the blocking diagram, the plate with its measured safe box and key-light crosshair, the five roles with source bands and contrast ratios, the display specimen at real size, the six state strings in the body face, the envelope numbers and the light kit. Read the PNG and answer two questions in one line each: "is this shaped like something" and "is this a lit room or a holiday card".

**Gate 6:** the card PNG was read; both answers written; if either is no, return to step 3 or step 4, never forward.

### 7. Build the fold first, measure it, rebuild once

Build only the first viewport of the real surface, to the recipe from step 3, with the tokens from step 4, the faces from step 5 and the strings from 5b. Then:

```
npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=2500 "file:///<abs>/index.html" docs/fold-1440.png
node "${CLAUDE_SKILL_DIR}/scripts/silhouette-lint.mjs" docs/fold-1440.png --fold <key>
node "${CLAUDE_SKILL_DIR}/scripts/fold-metrics.mjs" index.html --label round1 --json docs/fold-round1.json
```

`silhouette-lint` prints one verdict line with its volume, then the metric row, then one line per finding:

```
PASS docs/fold-1440.png: cells=200x125 viewport=1440x900 foldRows=125 inkedRows=87 ground=rgb(24,18,13) 79% envelope=5 fold=ledger findings=0
  symmetry=0.320 ... ruleRows=15.000 vRules=3.000 rightCol=0.402 ...
  SAAS_FOLD 1/6  AWWWARDS_FOLD 0/4
```

Read `fold-1440.png` as a stranger. Fix what is broken, rebuild once, print the delta:

```
node "${CLAUDE_SKILL_DIR}/scripts/fold-metrics.mjs" index.html --label round2 --json docs/fold-round2.json --compare docs/fold-round1.json
```

Only after the fold passes, build the rest of the page and the remaining states. Volume by surface is in `references/translation.md` section 10 (landing loud, dashboard at six on a Tuesday, theme pack from one moment, terminal palette and type only). Content discipline while building: no fabricated testimonials, stats or logos; no lorem ipsum; no emoji standing in for an icon set; no placeholder image service. A section with nothing true to say is removed, not filled.

**Gate 7:** the `silhouette-lint` line quoted with `fold=<key> findings=0`; for brand register the `DELTA` line quoted from round1 to round2.

### 8. Verify on pixels and DOM

```
npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=2500 "file:///<abs>/index.html" docs/fold-1440.png
npx --yes playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=2500 "file:///<abs>/index.html" docs/desktop.png
npx --yes playwright screenshot --viewport-size=390,844 --wait-for-timeout=2500 "file:///<abs>/index.html" docs/fold-390.png
npx --yes playwright screenshot --viewport-size=390,844 --full-page --wait-for-timeout=2500 "file:///<abs>/index.html" docs/mobile.png
```

All four are required for a page surface; a theme or terminal surface takes the first two on its sample page. Then every row below, each quoted verbatim:

| Row | Command | Passes when |
|---|---|---|
| Silhouette | `silhouette-lint.mjs docs/fold-1440.png --fold <key>` and `silhouette-lint.mjs docs/mobile.png --fold <key> --viewport 390x844` | both `PASS ... findings=0`; an `ENVELOPE <key>.<metric>` finding names the number the page missed |
| Baseline | `silhouette-lint.mjs references/baselines/baseline-saas.png` and `baseline-awwwards.png` | both `FAIL`, counts quoted (`SAAS_FOLD 3/6`, `AWWWARDS_FOLD 4/4`). This is the make-it-fail discipline applied to composition |
| Craft | `craft-lint.mjs index.html --register <register>` | `PASS index.html: nodes=<n> rules=15 states=6/6 findings=0` |
| Tokens | `moment-lint.mjs styles/tokens.css --plate assets/plate-01.png` | `PASS ... roles=5 ... kit=yes findings=0` |
| Copy | `copy-lint.mjs index.html --spec docs/voice.json` | `PASS ... strings=<n> words=<n> states=6/6 findings=0` |
| Fold bands (brand only) | `fold-metrics.mjs index.html --bands` | `hero`, `scale` and `contrastFails` IN; the other bands print |
| Kitsch | read `docs/fold-1440.png` | a stranger cannot name the event; one sentence saying what they would name instead |
| Reduced motion | the third `craft-lint` pass, which sets `reducedMotion: 'reduce'` itself | `motion-twin` passes with the count of substantive twin declarations printed |

**Gate 8:** all eight rows quoted; every linter line carries its volume (cells, nodes, strings, roles) beside its verdict.

### 9. Record (the brief, written last)

Append a `## Sense memory` section to `docs/DESIGN.md` (or PRODUCT.md when the project uses it). The brief is a record of what was built and is short:

```
# Design brief: <title>
## The moment            <the paragraph>
## Register and surface  brand | product; landing | dashboard | theme | terminal
## Fold                  <key>: <one sentence of the idea>; envelope measured: <three numbers from silhouette-lint>
## Light                 source at <clock>, <kelvin>K, lit <percent>; key-angle <deg>; plate <path> provider=<...>
## Palette               five roles as written in the token file, with their source bands
## Type                  <display> over <body>, ranked <n> by fonts.mjs, specimen read
## Voice                 six dials; the six state strings
## Motion                verb, travel budget px, transient ms, transport bpm, the twin in one line
## Signature             one sentence: the structural move the fold made possible
## Never                 three literal props; the negative prompt they became
## Measured              the eight verify lines, verbatim
```

Update `docs/sense-memory.json` with `fold`, `light`, `type`, `voice`, `motion` and `measured` keys. Close with CHANGES MADE / THINGS LEFT UNTOUCHED / VERIFICATION and the paths of `index.html`, the four screenshots, the plate, the fold card and the specimen.

**Gate 9:** the brief in the response, the two files updated, and the last line of the response is the `silhouette-lint` PASS line for the fold.

## Drift

Long conversations regress toward the mean. When output later in the session starts to look generic, or a hook denies a write, do not argue with the hook: re-read `docs/sense-memory.json`, re-run the failing linter, and rebuild the failing axis from its inventory row. The fix is always upstream in the inventory, never a different default.

## Judgment notes

- **No menus, restated.** Never map the moment onto a named brand, aesthetic family or hero architecture. The fold atlas is not a style menu: the user supplies the document row and the atlas only states that document's anatomy, the way a table of hero architectures never could, because an account book has a structure and "bold" does not. Selection is arithmetic (gaze x document), not taste. If `context.mjs` prints a `FOLD`, keep it: one product, one fold.
- **Props become light.** A Never item that glows never enters a prompt or a page; its light enters `light.fill` and the plate.
- **The plate is the palette, on every surface.** A terminal or theme surface still makes a plate and never ships it. The plate is where the colors come from.
- **The linter denies, it does not argue.** When a hook denies a write late in the session, re-read the JSON, re-run the failing linter, rebuild that axis from its row.
- **One moment per product.** Two moments is a mood board. If the user offers several, ask which one is the home screen.
- **The user's details outrank the tables.** If they said "the ball drops", the countdown tempo is non-negotiable; the tables only say how to express it.
- **Seasonal palettes are the trap,** and "cozy" pulls straight into cream and terracotta. Warmth comes from the light source, the material and the tempo; the sampler takes it from the plate.
- **Product UI keeps its affordances,** and the accessibility floor is unchanged. A low-light moment does not license low-contrast text; it licenses a dark theme with bright ink.

## Evals

`evals/` holds the cases for `claude plugin eval`: a dashboard from a given moment, a request with no moment (must ask one question and write nothing), a holiday brief that must not leak props, a landing fold that must pass `silhouette-lint` and `craft-lint`, a second moment that must not resolve to the same fold, and a hook case that must report a denied write. Run from the skill directory:

```
claude plugin eval . --ablation none --runs 1 --allow-tools Bash Write
```
