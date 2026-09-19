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
---

# Sense Memory

Stanislavski's actors recalled a real sensory moment to produce a real emotion on stage. This skill does the same for design. A moment supplied by the user is the one input no model shares with any other prompt, so a design derived from it cannot converge on the median. Every other design skill works by refusal (ban lists, reflex-reject fonts) or by menu (eight anchors, fifteen styles, six hero architectures, a library of named brands). Menus are closed sets; a bigger menu is a bigger monoculture. This skill works by source: derive everything from one lived moment, and the refusals take care of themselves.

Rule zero: **carry the light and the feeling, never the props.** Christmas morning is not red, green, and snowflakes. It is low winter sun through one window, the glaze on a ceramic mug, wool, unhurried time, and a house that is still asleep. A stranger should feel the moment and be unable to name it.

## Project state (first tool call)

Run the probe before step 1:

```
node "${CLAUDE_SKILL_DIR}/scripts/context.mjs"
```

Labels: `MOMENT_EXISTS` means a brief is already persisted (extend it, never replace it without asking); `TOKENS` names the file and format to write into; `REGISTER_HINT` is a guess to confirm; `FONTS` are commitments to keep unless the user is replacing the identity.

If the shell is unavailable or denied, do not stop and do not ask for permission: Glob for `docs/DESIGN.md`, `docs/sense-memory.json`, `PRODUCT.md`, and any `tokens.css`, `globals.css`, `tailwind.config.*`, read what exists, and continue the workflow with those answers. The workflow below never depends on the shell; the scripts make it faster and stricter, not possible.

## Workflow

Six steps with a gate after each. A gate that is not written in the response was not passed. Do not write UI code before step 4 is shown.

### 1. Capture the moment

Take the moment the user gave. If the prompt has none, ask one question and stop: "What's a specific moment you'd want this to feel like? Time of day, where you are, what you're holding." One question, no menu. Do not invent a moment for the user unless they decline to give one; then propose one from the product's subject and say so.

Expand a thin moment into a first-person paragraph of four to six sentences before extracting anything. "Fall day" is a category; "8am, 48 degrees, wet leaves on the sidewalk, sun still low and gold, sweatshirt sleeves pulled over hands" is a moment. Every word the user used must land in a row of the inventory: "crisp" goes in Air, "the ball drops" goes in Tempo, "sweatshirt" goes in Materials. Expansion adds detail around their words and never replaces them. (A smoke test turned "crisp" into "flat, overcast": that is the failure.)

Confirm the register from `REGISTER_HINT` and the surface named in the prompt: brand (design is the product) or product (design serves the product). It sets how loud the moment may be in step 5.

**Gate 1:** the paragraph is in the response and contains every word the user used.

### 2. Sensory inventory

Fill every row. A blank row means the moment is not specific enough; go back to step 1.

| Row | What to write down |
|---|---|
| Light | Source, direction, color temperature, how much of the scene is lit vs in shadow, time of day |
| Objects | Five to eight physical things in frame, each with its color named as a material ("mug glaze", "pine needle", "wet asphalt") |
| Materials | What things are made of and how they feel: wool, glass, wet paper, brushed steel, confetti |
| Air | Temperature, humidity, stillness or wind, how dense or open the space is |
| Tempo | How fast things move and what the rhythm is: a held breath, a countdown, a slow pour |
| Sound | The one sound you'd remember and its shape: a pop, a hum, a crunch, silence |
| Gaze | Where the eyes go: up, down at your hands, out a window, across a crowd |
| Text in the scene | Lettering physically present: a tag, a sign, a handwritten note, a scoreboard, a receipt |
| The document | The printed or physical object that belongs to this moment: a gift tag, a ticket stub, a trail map, a recipe card, a field notebook, a setlist |
| The gesture | The one physical action: wrapping hands around a mug, looking up, kicking leaves |
| The keepsake | The single thing you'd remember a year later |

Real objects, real colors. "Warm" is not a color; "the amber of coffee held up to a window" is.

**Gate 2:** eleven rows, none blank, no adjective that could describe a different moment.

### 3. Translate to tokens

Read `references/translation.md` and walk the inventory through it. Each row maps to a decision:

- Light → theme (dark or light decided by the scene, never by default), brightest surface, shadow direction
- Objects → the five palette roles in OKLCH (bg, surface, ink, one accent, muted), each named after its object
- Materials → radius, border weight, texture, shadow stack
- Air → spacing density and layout openness
- Tempo and sound → durations, easing shape, stagger rhythm, whether there is a page-load moment at all
- Gaze → composition: where the visual weight sits and where the primary action lives
- Text in the scene → the type direction as a physical object, then a real catalog search
- The document → the organizing genre of the page (a page that is a trail map is laid out unlike a page that is a receipt)
- The gesture → the interaction signature on hover, press, and confirm
- The keepsake → the one signature element the framework does not ship

Write a **reflex ledger** as you go: for every axis, the default you would have reached for on a generic brief, then what the scene gave instead, in one line each. An axis whose scene-derived value equals its reflex default is not translated yet. This ledger is the swap test made explicit; keep it in the brief.

Then run the checks in `references/translation.md` § Checks (kitsch, cream trap, swap, silhouette, Awwwards lane). Worked examples are in `references/worked-examples.md`; read them the first time for calibration, never to copy from.

**Gate 3:** the ledger has one line per axis and no axis equals its reflex; all five checks report a verdict.

### 4. Write the brief and lint it

Show the brief in the conversation, then persist it. Persisting is what stops the next AI session from regressing to indigo.

```
# Design brief: <moment in five words>

## The moment
<the paragraph from step 1>

## Register
brand | product

## Light
<theme decision and why, brightest surface, shadow direction>

## Palette (OKLCH, each named after its object)
--bg:      oklch(...)  <object>
--surface: oklch(...)  <object>
--ink:     oklch(...)  <object>
--accent:  oklch(...)  <object>   (the only saturated role)
--muted:   oklch(...)  <object>

## Material
radius: <value + reason> · border: <weight> · texture: <none | grain | ...> · shadow: <stack>

## Composition
<the document genre, where the weight sits, where the primary action lives>

## Type
<physical object it should look like> → <family chosen from a real catalog> for display, <family> for body

## Motion
<durations, easing, one orchestrated moment if any, what answers user action>

## Signature
<the one element, one sentence>

## Reflex ledger
| axis | reflex default | from the scene |

## Never
<three literal props this design must not contain>
```

No em dashes anywhere in the brief, the token comments, or the copy. Persist three things:

1. `docs/DESIGN.md`: append a `## Sense memory` section holding the brief (create the file if absent; if the project uses PRODUCT.md, add the moment there under the same heading).
2. `docs/sense-memory.json`: `{ "title", "moment", "register", "inventory": {rows}, "tokens": {roles}, "ledger": [...], "signature", "never": [...] }` so scripts and later sessions read structure, not prose.
3. The tokens, in the project's real token surface named by `TOKENS` (CSS custom properties, `@theme`, `tailwind.config`, or the theme file). Match the existing format exactly. Greenfield: `styles/tokens.css`. The first line of the token file is `/* Sense memory: <title> */` and every role carries its object as a trailing comment.

Then lint the token file. The linter is deterministic and prints its counts:

```
node "${CLAUDE_SKILL_DIR}/scripts/moment-lint.mjs" <token file>
```

(The hook resolves the script through `$HOME/.claude/skills/sense-memory`, because `${CLAUDE_SKILL_DIR}` expands only in the skill body, not in hook commands; a skill installed elsewhere edits that one line.) It fails on the cream band (bg or surface), indigo-band accents, contrast under 4.5:1, saturated non-accent roles, tell names (cream, bone, paper), tell hexes (indigo-500, blue-500, claude terracotta), reflex-reject fonts, em dashes, and bounce easing. The same linter runs as a PreToolUse hook on every Write and Edit for the rest of the session, so a regression later in the conversation is denied with the findings as the reason. `SKIPPED` is not a pass: if the linter cannot run in this environment, say so in one line, then check the token file by hand against the same list (both near-white roles outside L .84-.98 with hue 40-100, accent hue outside 255-305, ink contrast, no tell names, no font from the reflex-reject list in `references/translation.md` § 6, no em dashes, no bounce easing) and report which items you checked. Checking fonts against a list you recall instead of the one in the reference is how Fraunces got through in a test.

**Gate 4:** the brief is in the response, the three files exist, and the lint line reads `PASS ... findings=0`.

### 5. Render the moment card, then apply

Before building any page, render the card and look at it:

```
node "${CLAUDE_SKILL_DIR}/scripts/preview.mjs" <token file> docs/sense-memory-preview.html --signature "<one sentence>"
npx --yes playwright screenshot --viewport-size=1000,900 --full-page file:///<abs path>/docs/sense-memory-preview.html docs/sense-memory-preview.png
```

Skip the render only if the shell is unavailable, and say so. Read the PNG. This is the stranger test on real pixels: five swatches, the display face, a panel with a selected row, the primary button. If it reads as a holiday card, go back to step 2. If it reads as a lit room, continue.

The brief is now the input to whichever skill builds the UI. Paste it as the design direction when invoking frontend-design or impeccable, or build directly when the change is token-level. Volume by surface, detailed in `references/translation.md` § Surfaces:

- **Landing or brand page:** the moment is loud. The document genre organizes the page, light and palette carry the fold, the signature lives in the hero, one page-load sequence at the moment's tempo, imagery real when the scene implies it.
- **Dashboard or product UI:** the moment at six in the morning on a Tuesday. It lives in neutrals, light, density, tempo, and the interaction signature. Data colors stay semantic (load the dataviz skill for charts). Accent on primary action and selection only.
- **Theme or token pack:** light and dark from the same moment, the room at its hour and the same room after dark.
- **Terminal, editor, or slide theme:** palette and type only; the signature is one thing the highlighter or slide master does differently.

Content discipline while applying: no fabricated testimonials, stats, or logos; no lorem ipsum; no emoji or unicode glyphs standing in for an icon set; no placeholder image service as a fallback. A section with nothing true to say is removed, not filled.

### 6. Verify

Render the real surface (frontend-verify skill or Playwright), screenshot it, and answer each in the response with a verdict:

| Check | Passes when |
|---|---|
| Kitsch | A stranger cannot name the holiday, season, or event from the screenshot |
| Swap | A different moment would change bg, ink, accent, tempo, composition, and the signature |
| Silhouette | Reduced to a 200px black-on-white silhouette, the layout is not the category's default (centered hero, three cards, footer) |
| Reflex | No axis matches de-vibe's design-tells catalog or impeccable's bans; no Awwwards-lane defaults (viewport-scale headline, mono micro-labels, pill nav, dark cinematic scrim) unless the scene produced them |
| Lint | `moment-lint.mjs` on the token file reads `findings=0` after the build, with the role count shown |
| Floor | 4.5:1 body contrast, visible focus, reduced-motion alternative for every animation, no text overflow at 375px |

Close with CHANGES MADE / THINGS LEFT UNTOUCHED / VERIFICATION and the paths of the three persisted files plus the two previews.

## Drift

Long conversations regress toward the mean. When output later in the session starts to look generic, or the hook denies a write, do not argue with the hook: re-read `docs/sense-memory.json`, re-run the lint, and rebuild the failing axis from its inventory row. The fix is always upstream in the inventory, never a different default.

## Judgment notes

- **One moment per product.** Two moments is a mood board. If the user offers several, ask which one is the home screen.
- **The user's details outrank the translation table.** If they said "the ball drops", the countdown tempo is non-negotiable; the table only says how to express it.
- **Seasonal palettes are the trap.** Fall is not orange, winter is not ice blue. Pull colors from the objects; the season will be present in the light without any of its clichés.
- **"Cozy" pulls straight into cream and terracotta,** the saturated AI default of 2026. Warmth comes from the light source, the material, and the tempo. The background is the object the light falls on, not "warm white". The linter enforces this on bg and surface.
- **No menus.** Do not map the moment onto the nearest named brand, aesthetic family, or hero architecture. If a step produces "this is basically Linear", the step is wrong.
- **Product UI keeps its affordances.** The moment never changes what a button is or where navigation lives. It changes what the room feels like while you use them.
- **Accessibility floor is unchanged.** A low-light moment does not license low-contrast text; it licenses a dark theme with bright ink.

## Evals

`evals/` holds three cases for `claude plugin eval`: a dashboard from a given moment, a request with no moment (must ask one question and write nothing), and a holiday brief that must not leak props. Run from the skill directory:

```
claude plugin eval . --ablation none --runs 1 --allow-tools Bash Write
```
