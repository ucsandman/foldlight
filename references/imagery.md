# Imagery

One plate per moment, forever. The plate is where the colors come from, on every
surface, including the surfaces that never ship it.

## 1. The shot record

`scripts/shot.mjs` compiles the inventory into `shot.json`. Pure lookup: the same
JSON in gives the same prompt out.

```json
{
  "title": "first coffee, 6:40am, house asleep",
  "prompt": "<compiled, never free text>",
  "negative": "<the Never list, then the standing bans>",
  "camera": { "lens": "50mm macro", "distance": "35cm", "fstop": "f/2.0", "angle": "...", "dof": "...", "shutter": "1/60s, so anything moving in the air is slightly smeared" },
  "material": "glazed ceramic",
  "kelvin": 2400,
  "keyClock": 8,
  "litPct": 12,
  "safeSide": "right",
  "grain": 0.045
}
```

**GAZE to camera.** The Gaze row is one of four words; a longer row ("down at
hands", "across a crowd") matches on its gaze word.

| Gaze | Lens | Distance | f-stop | Angle | Depth of field |
|---|---|---|---|---|---|
| down | 50mm macro | 35cm | f/2.0 | camera at chest height, tilted 40 degrees down | focus on the near rim, everything past 12cm falls off |
| out | 35mm | 3m | f/8 | camera level, horizon on the lower third | deep, everything sharp |
| up | 24mm | 2m | f/4 | camera tilted 30 degrees up | deep |
| across | 85mm | 6m | f/2.8 | camera at eye height, compressed | shallow, one plane sharp |

**MATERIAL to specular.** The Materials row, dominant first. A material not on
this list contributes nothing to the prompt.

| Material | Specular |
|---|---|
| glazed ceramic | one hard specular highlight no wider than 4mm on the lit edge, then a long soft falloff across the body; the glaze reads wet, not matte |
| wool | no specular at all; a fine lit fuzz where the rim light grazes the fibres, deep micro shadow between them |
| wood | a long low sheen running with the grain, never a hotspot |
| glass | two specular hits, one on the near wall and one refracted through the far wall |
| steel | a single anisotropic streak stretched along the brush direction |

**TEMPO to shutter.**

| Tempo | Shutter |
|---|---|
| slow | 1/60s, so anything moving in the air is slightly smeared |
| held | 1/250s, everything just short of frozen |
| burst | 1/1000s, frozen mid-flight |
| crisp | 1/500s |
| drift | 1/30s, movement drawn as a soft trail |

**CLOCK to direction phrase.** Where the key sits, as seen from the camera.

| Clock | Phrase |
|---|---|
| 1, 2 | from the upper right |
| 3 | from the right |
| 4, 5 | from the right and low |
| 6 | from low in front, below the subject |
| 7 | from the left and slightly behind |
| 8 | from the left, low, just out of frame |
| 9 | from the left |
| 10, 11 | from the upper left |
| 12 | from directly behind the subject |

**litFraction to the lit clause.** `About <n> percent of the frame is lit; the
rest falls to a deep neutral black that keeps its detail.` Under 0.3 the record
also carries `grain: 0.045` and the prompt says `Shot on 35mm film at ISO 800:
fine grain, no lifted shadows, no HDR, no colour grading beyond the lamp's own
<kelvin>K cast.`

**The two always-appended clauses.**

1. The reserved empty side, opposite the key: `Leave the {right|left} 40 percent
   of the frame in near darkness and empty. Nothing enters it.` Clocks 7 to 11
   are left-hand keys and reserve the right; clocks 1 to 5 reserve the left.
2. The standing ban: `No people's faces, no text, no logos, no props beyond what
   is listed.`

## 2. Props become light

A Never item that emits or reflects light never enters a prompt or a page. Its
light enters `inventory.light.fill` with the prop's name removed, and the fill
reaches the plate through the prompt's out-of-frame clause.

| The prop | The fill light |
|---|---|
| a lit tree | a line of very small warm points low on a shelf far behind the camera, 2200K, faint |
| fireworks | irregular cold flashes far outside the window, 6000K, brief, never reaching the near surfaces |
| a neon sign | a steady saturated wash on the far wall only, one hue, no source visible, no letterforms |

`shot.mjs --check` is the instrument: it tokenizes the Never list and reads the
compiled prompt, which contains the fill clause verbatim, so a rewrite that kept
the prop's name is caught.

## 3. The five laws

1. **The plate bleeds.** It reaches at least two viewport edges and never sits in
   a card: no radius, no border, no shadow, no scrim.
   (`moment-lint photo-in-a-card`, `moment-lint scrim`)
2. **Type sits inside `--plate-safe`.** A scrim is a confession the shot was
   wrong; recompile with a larger reserved-empty side instead.
   (`craft-lint safe-box`)
3. **One plate per page.** Supporting images are crops of the same file at 200
   percent, framed on the material's specular. (`moment-lint one-plate`)
4. **The seam is a gradient** to the exact sampled `--bg`, over the plate's bottom
   34 percent, under the one document grain field.
5. **Light continuity.** Every shadow on the page falls along `--key-angle`, which
   was measured from this plate. (`craft-lint shadow-origin`)

## 4. Negative prompt construction

The Never list goes only into `negative`, followed by the standing bans: studio
softbox, two light sources, colour gel, bokeh balls, glossy advertising retouch,
text, watermark, illustration, CGI look. A Never token that reaches the positive
prompt is a finding:

```
node scripts/shot.mjs docs/sense-memory.json --out docs/shot.json --check
NEVER_LEAK 0 (never-tokens=9 scanned=257 prompt words)
NEVER_LEAK 1: tree (never-tokens=9 scanned=258 prompt words)   # exit 1
```

## 5. The procedural plate

`plate.mjs` defaults to `--provider procedural`: no key, no network, no cost. It
writes an SVG from the shot record and rasterizes it with Playwright to
1536x1024.

- page ground at `oklch(0.10 0.01 <kelvin hue>)`;
- a radial key at the `clock` position, radius `(0.55 + litFraction * 0.4)` of the
  width, three stops at 0, 35 and 100 percent with alpha 1, the falloff alpha and
  0; the middle alpha is `0.35 ^ (falloff / 2.2)`, so a dark room falls off fast
  and an open one does not;
- one specular from the dominant material row, on the line from the key to the
  centre of the frame;
- the `fill` lights as a row of 2px points at 2 percent alpha behind the key,
  felt and never seen;
- `feTurbulence baseFrequency 0.9 numOctaves 2` at 0.045 when litFraction is
  under 0.3.

It stamps a tEXt chunk `provider=procedural` (plus `lit`, `kelvin`, `key-clock`
and `title`, which is how `plate-tokens.mjs` reads the lamp back out of the file).
The brief says **NOT PHOTOGRAPHIC** on the Light line whenever the provider is
`procedural`. The plate still supplies the palette, the safe box and the key
angle, which is most of what the page borrows from a photograph.

## 6. Providers

Order under `--provider auto`: gemini, then openai, then procedural, stopping at
the first success.

| Provider | Model | Size | Cost at published rates |
|---|---|---|---|
| gemini | `gemini-2.5-flash-image` | 16:9 | about $0.04 per image |
| openai | `gpt-image-1`, quality high | 1536x1024 | about $0.25 per plate |

The 3-pro image model returned 403 on this account; flash is the one that works.
Keys resolve through `node C:/Projects/creds/creds.mjs resolve <KEY>` first and a
`.env` second, and are never printed: `--dry-run` prints the whole request shape
with the header value replaced by `<OPENAI_API_KEY resolved=yes|no, not printed>`
and sends nothing. The face ban is in every positive prompt. `--import <file>`
takes a client's real photograph, re-encodes it to PNG and stamps
`provider=import`. `plate.mjs` refuses to overwrite an existing plate without
`--regenerate` and exits 3: one plate per moment, forever.

## 7. Surfaces with no room for an image

A theme pack, a terminal theme or a slide theme still makes a plate and never
ships it. The plate is the color source; the safe box is ignored; `--twin` turns
the same plate into the second theme.

## 8. Sampler limits

The percentile bands were validated on one dark plate (the canonical moment) and
one high-key plate (the farmers market). Two deterministic corrections, both
printed in the `plate-tokens` block:

- **NARROW_BANDS.** When `--bg` and `--surface` land within dL 0.03 of each other,
  `--surface` is widened to bg L plus 0.06 (light theme) or bg L plus 0.05 (dark
  theme).
- **cream-clamp.** A sampled ground that lands in the warm near-white band
  (L 0.84 to 0.98, chroma under 0.06, hue 40 to 100) has its chroma set to 0. The
  ground is the object's real color or it is neutral; it is never cream.

A third correction, `SURFACE_PULLED`, fires when the sampled surface band sits
between `--bg` and `--ink`: the surface is pulled back toward `--bg` until `--ink`
clears 4.5:1 on it. A surface the ink cannot sit on is not a surface. When even
that cannot clear the floor, `plate-tokens` prints the ceiling and exits 1.
