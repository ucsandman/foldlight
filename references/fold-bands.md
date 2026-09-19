# Fold bands: what a first viewport measures on pages that work

Eleven green metrics are a floor, not taste: a page inside every band below is only free of the
measurable faults, and a page can sit inside all of them and still be forgettable. The bands exist
so a fold that is timid (a 24px hero over 16px body, nothing bleeding, one grey card at 11 percent
of the viewport) is caught by arithmetic instead of by an opinion. Nothing here says what to build.

Source: `scripts/fold-metrics.mjs` at 1440x900, run live against four shipping pages on 2026-09-19.

expires: 2026-12-18

## 1. Measured, 2026-09-19, 1440x900

| Page | hero px | body px | scale | sizes | biggest | bleed | images | ink | hero tracking |
|---|---|---|---|---|---|---|---|---|---|
| apple.com (macbook-air) | 64 | 14 | 4.57 | 7 | 0.355 | true | 4 | 0.091 | 0em |
| stripe.com | 48 | 48 | 1.00 | 4 | 0.761 | true | 1 | 0.412 | -0.020em |
| linear.app | 64 | 15 | 4.27 | 7 | 0.454 | true | 10 | 0.179 | -0.022em |
| arc.net | 46 | 20 | 2.30 | 5 | 0.686 | true | 5 | 0.060 | -0.040em |

Notes on the four rows. Stripe's `scale` of 1.00 is an artifact of a fold whose only body copy is
set at the hero size; its hero is still 48px, which is why the hero band and not the scale band is
read as the primary signal there. `contrastFails` was not captured in the 2026-09-19 reference runs
(the metric was added to `fold-metrics.mjs` afterwards), so its band is not derived from these four
pages; it is fixed at 0 by the accessibility floor the rest of the skill already enforces.

## 2. Derived bands (brand register)

`fold-metrics.mjs --bands` parses this table. Columns: metric, low, high, and whether the band is a
pass condition. A pass-condition band that reads OUT exits 1; the rest print and inform.

| Metric | Low | High | Pass |
|---|---|---|---|
| hero | 46 | 120 | yes |
| scale | 2.3 | 8 | yes |
| contrastFails | 0 | 0 | yes |
| biggest | 0.30 | 0.92 | no |
| bleed | true | true | no |
| images | 1 | 99 | no |

`hero` is the largest font size painted in the first viewport, in px. `scale` is hero over the most
common body size. `biggest` is the largest non-shell painted element as a fraction of the fold area
(shell being nav and footer, anything at or over 85 percent of the fold). `bleed` is true when any
painted element touches two viewport edges. `images` counts `img`, `svg`, `canvas` and
`background-image` elements in the fold; the band does not apply when the page's fold declares
`plate: none` in the atlas (ledger, gift-tag, setlist, receipt, scoreboard), because those folds
carry no image by design.

## 3. Regenerate

The bands expire on 2026-12-18. To rebuild them, run each of these and replace the table in
section 1, then re-derive section 2:

```
node scripts/fold-metrics.mjs https://www.apple.com/macbook-air/ --label apple --json references/ref-apple.json
node scripts/fold-metrics.mjs https://stripe.com --label stripe --json references/ref-stripe.json
node scripts/fold-metrics.mjs https://linear.app --label linear --json references/ref-linear.json
node scripts/fold-metrics.mjs https://arc.net --label arc --json references/ref-arc.json
```

Low is the smallest measured value rounded down to the nearest reference page, high is headroom
above the largest (the hero high of 120 and the scale high of 8 are ceilings, not observations: a
hero over 120px at 1440 is a poster, not a fold).
