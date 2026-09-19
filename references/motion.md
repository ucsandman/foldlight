# Motion: one verb, a travel budget in pixels, and a twin that is a design

Tempo and Sound are a score, not an adjective. The score is written into `docs/sense-memory.json`
under `motion` and is enforced by `moment-lint` (`travel-budget`, `verb-property`,
`twin-is-a-switch`, `overshoot-channel`) and by `craft-lint motion-twin` in its reduced-motion pass.

## 1. The score

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

Tempo word to defaults:

| Tempo | travel | transient | transport | durations |
|---|---|---|---|---|
| slow | 1px | 90ms | 5.5bpm | 320 to 480ms |
| held | 4px | 200ms | pauses between beats | the pause is the beat |
| burst | 8px | 120ms | one hard cut | one cut, no tween |
| crisp | 3px | 160ms | on the beat | 160 to 320ms |
| drift | 2px | one ambient loop | 8 to 20s per loop | no resolve |

`resolve` is `once` or `never`; a page that resolves `once` stops moving and stays stopped.
`silence` is the stillness in milliseconds that must precede the transient, so the one hard sound in
the scene lands in a quiet room.

## 2. One verb per moment

The verb is a property whitelist. Anything animated outside the list is a finding.

| Verb | Properties it permits |
|---|---|
| `reveal` | opacity, clip-path, mask, filter, color, registered custom properties |
| `settle` | transform translate within the travel budget, opacity |
| `warm` | color, background-color, box-shadow, filter |
| `count` | registered numeric custom properties, content via counter |
| `rise` | transform translateY within the travel budget |

A moment has one verb. Two verbs on one page is two moments, and the page reads as a template with
motion applied to it.

## 3. Travel budget

Any pixel translation in a `@keyframes` body or in a transition on transform over the budget is a
finding. With no score in the file the default budget is 8px, which fails the `translateY(20px)`
fade-up reflex on sight. Declare the budget in the token file as `/* travel: <n>px */` when the score
sets something other than the default.

Light travels instead of boxes: at travel 1px the page still moves, in brightness, in color and in
mask position, and nothing slides.

## 4. The twin is a design

The `prefers-reduced-motion: reduce` block must contain substantive declarations: a crossfade, a
static lit state, a fixed gradient where time used to be. A block whose only declarations are
`animation: none`, `transition: none` or `*-duration: 0.01ms` is a switch, not a twin, and
`twin-is-a-switch` fails it while printing the count of substantive declarations found. Two or more
substantive declarations is the floor; the tournament emitter required three of its own.

Light never animates under reduce: the lamp is on, the plume is still, the grain is static.

## 5. Overshoot by channel

A cubic-bezier with a negative control value, or the words bounce or elastic, is:

- allowed on `filter`, `opacity`, `background-color`, `box-shadow` and custom properties. A tungsten
  filament overshoots in brightness: `--lamp` reaching 1.06 before settling to 1 is the moment.
- a finding on `transform`, `translate`, `top`, `left`, `margin` and `inset`. Nothing physical in the
  scene overshoots in position.

This replaces the old blanket `easing` ban, which pushed sessions back toward linear fades.

## 6. Material curves

From the dominant material in the Materials row:

| Material | Curve | What it is |
|---|---|---|
| ceramic | `cubic-bezier(.18,.92,.14,1)` | hard attack, dead stop, no overshoot: a glazed base set on wood |
| wool | `cubic-bezier(.22,.61,.24,1)` | muffled attack, long tail |
| glass | `cubic-bezier(.16,1,.3,1)` | fast out, long settle, nothing bounces |
| steel | `cubic-bezier(.4,0,.2,1)` | even, machined, no character at either end |
| paper | `cubic-bezier(.33,1,.68,1)` | light, quick, a page falling flat |

The transient takes the dominant material's curve; the transport takes a sine
(`cubic-bezier(.37,0,.63,1)`) because a room's tone breathes in and out at the same rate.
