# Light

One lamp, named in the Light row, computed into tokens by `plate-tokens.mjs` and
spent on the page by the rules below. Nothing here is a taste call: every number
is sampled from the plate or derived from the five-field Light record.

## 1. The light kit tokens

`plate-tokens.mjs` writes seven tokens under the five roles. They are the whole
kit; a page that carries roles and no kit is unlit.

| Token | What it is | Where it comes from |
|---|---|---|
| `--source-x` | percent of the viewport, horizontal | centroid of the plate's top 2 percent luminance cells |
| `--source-y` | percent of the viewport, vertical | the same centroid |
| `--key-angle` | deg, the only direction anything casts | angle from the centre of the frame to that centroid, 0deg east, clockwise, screen y down |
| `--falloff` | 3.0, 2.2 or 1.4 | `litFraction` at or under 0.2, 0.2 to 0.5, over 0.5 |
| `--lit` | 0 to 1 | the shot record's `litFraction`, read from the plate's `lit` tEXt chunk, measured from the pixels when the chunk is absent |
| `--grain` | 0.055 when `--lit` is at or under 0.3, else 0 | a dark room shows its film grain, a lit one does not |
| `--plate-safe` | `x% y% w% h%` | the largest even, unlit rectangle of the 32x20 grid (the criterion inverts to bright and even on a light-theme plate) |

`moment-lint no-light-kit` fails any file that carries five roles and no
`--source-x`. The kit is a hard requirement, not a flourish.

The clock to origin table, used by both the procedural plate and this file:

| Light row `clock` | `--source-x` | `--source-y` |
|---|---|---|
| 7 to 9 | 0 to 10 percent | 30 to 60 percent |
| 10 to 11 | 0 to 20 percent | 0 to 15 percent |
| 12 | 50 percent | 0 percent |
| 1 to 2 | 80 to 100 percent | 0 to 15 percent |
| 3 to 5 | 90 to 100 percent | 30 to 60 percent |
| 6 | 50 percent | 100 percent |

## 2. The lamp on the page

One fixed radial, once, on the document:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 60% 50% at var(--source-x) var(--source-y),
    color-mix(in oklch, var(--accent) 12%, transparent),
    transparent 70%);
}
```

Every `box-shadow` offset in the project is derived from `--key-angle`, so one
lamp casts every shadow:

```
x = cos(key-angle + 180deg) * d
y = sin(key-angle + 180deg) * d
```

The four precomputed pairs for `--key-angle: 296deg` (the angle the tournament
plate shipped with), at d = 2, 8, 16 and 24 px:

| d | x | y | box-shadow |
|---|---|---|---|
| 2 | -0.88px | 1.80px | `box-shadow: -0.88px 1.80px 2px ...` |
| 8 | -3.51px | 7.19px | `box-shadow: -3.51px 7.19px 8px ...` |
| 16 | -7.01px | 14.38px | `box-shadow: -7.01px 14.38px 16px ...` |
| 24 | -10.52px | 21.57px | `box-shadow: -10.52px 21.57px 24px ...` |

At 296deg the shadows fall down and to the left, which places the lamp up and to
the right of the frame. A lamp low on the left, the canonical 8 o'clock, samples
out of the plate at about 177deg and throws its shadows down and to the right.
Read the number out of the token file, never out of this table.

`craft-lint shadow-origin` measures every painted drop shadow against
`--key-angle` and allows 20 degrees of drift.

## 3. The masked plume rule

Any light built with `clip-path` reads as a CSS shape (one render in the
tournament read as a wall corner). A plume is masked and blurred or it is not a
plume:

```css
.plume {
  filter: blur(34px);
  mask-image: radial-gradient(closest-side, #000 40%, transparent 100%);
}
```

34px is the floor, not a suggestion. Nothing with a hard edge is light.

## 4. One grain layer

Grain is one document-level layer. Per-section grain leaves a bright seam at
every boundary.

```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: var(--grain);
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 220px 220px;
}
```

Contrast is re-measured after grain, by `craft-lint`, against painted pixels: a
modeled 4.66:1 measured 4.27:1 once the grain was in the composite.

## 5. The lit panel

A panel is lit from the lamp side, not floated on a shadow:

```css
.panel {
  background: radial-gradient(120% 90% at var(--source-x) var(--source-y),
    var(--surface-lit) 0%, var(--surface) 60%);
  box-shadow: inset 0 1px 0 var(--specular);
}
```

`--surface-lit` is `--surface` with L plus 0.03. `--specular` is `--ink` at 14
percent alpha. The 1px rim goes on the lamp side only.

## 6. The lit ruling (the ledger's light)

Rules are light, so they dim with distance from the lamp:

```css
.row { border-bottom: 1px solid
  color-mix(in oklch, var(--muted) calc(var(--lit-row) * 1%), transparent); }
```

`--lit-row` steps 30, 27, 24, 22, 21, 20, 19, 18, 16 down the page, and each rule
carries a horizontal gradient dimming toward the side away from the lamp. The row
being read is the brightest thing on screen.

## 7. Saturation for computed roles

An authored role keeps the 0.08 chroma cap. A computed role, in a file carrying a
`/* plate: ... */` line, may carry chroma up to `min(C(accent), 0.12)`. Forbidding
chroma on ink forbids the tungsten bulb from existing: the canonical plate samples
ink at chroma 0.106 and v1 had to clamp it to 0.050 to pass its own linter.

A token file written before this correction still declares the clamped 0.050, so
`plate-tokens --check` reads it as `plate-drift` against the very plate it came
from (dC 0.056). That finding is correct and the remedy is not a looser tolerance:
regenerate the file from its plate, or keep the v1 number and write
`/* override: v1 flat chroma cap */` on the `--ink` line.

## 8. Peak and trough

When ink sits on a rendered range (a gradient, the plate, a lit panel) the number
that counts is the worst of flat, peak and trough. `craft-lint contrast` measures
the painted pixel, so this needs no model, only the screenshot.

## 9. Reduced motion for light

Light never animates under `prefers-reduced-motion: reduce`. The lamp is on, the
plume is still, the grain is static. The twin is a design: a static lit state, not
`animation: none`.
