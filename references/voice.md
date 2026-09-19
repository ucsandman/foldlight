# Voice: six dials forced by the inventory, and six states written before the page

The utterance row seeds the voice; the other rows set its dials. Nothing here is a tone of voice
document: every dial is a number or a closed set, written to `docs/voice.json` at step 5b and
measured by `scripts/copy-lint.mjs`.

## 1. The six dials, each forced by named rows

| Dial | Forced by | Value |
|---|---|---|
| Person and distance | Gaze | `down` second person, close ("you", "your"); `out` first person plural ("we", "our"); `up` second person imperative; `across` third person |
| Tense | Tempo | `slow` and `drift` present continuous; `held` future; `burst` and `crisp` simple present |
| Sentence band | Air plus Tempo | Air sets the base: still or close, median 5 to 9 words, ceiling 14; crowded, median 4 to 7, ceiling 11; open, median 6 to 10, ceiling 16. Tempo adjusts it: `burst` takes 1 off both ends of the median and 2 off the ceiling; `held` takes 1 off the ceiling; `slow`, `drift` and `crisp` leave the base. So still and slow is 5 to 9 / 14, crowded and burst is 3 to 6 / 9, open and crisp is 6 to 10 / 16 |
| Lexicon altitude | Objects plus Materials | concrete nouns from the inventory are allowed; category nouns are banned: no "solution", "platform", "experience", "journey", "workflow" |
| What it notices | Gaze plus Keepsake | the copy names what the gaze lands on, never the product's feature list first |
| Volume ceiling | Sound plus Air | near silence: no exclamation marks, no imperatives in headlines, one verb per sentence, clause cap 1 |

The utterance row is the calibration string: if a line could not be said out loud by the person in
the scene, in that person and tense, it is not in this voice.

## 2. `docs/voice.json` schema

```json
{
  "brand": "Sill",
  "person": "second",
  "volume": "quiet",
  "median": [5, 9],
  "ceiling": 14,
  "headlineWords": 8,
  "clauseCap": 1,
  "props": ["christmas", "tree", "gift", "mug", "coffee", "lamp", "steam", "wool", "sock"],
  "states": ["empty", "loading", "error", "offline", "done", "first-run"],
  "labelCase": "sentence"
}
```

`person` is one of `first`, `first-plural`, `second`, `second-imperative`, `third`. `volume` is
`quiet` or `plain`. `props` is the Never list plus the scene's own nouns (mug, lamp, steam, wool), so
the page carries the light and never names the props: rule zero enforced on words. `brand` may be
`null`; when it is set, `copy-lint` counts how often the product is the subject and rejects an h1
that opens with the name followed by "is" or a colon. `labelCase` is `sentence` or `title`.

## 3. Four headline patterns, and the tagline slot is banned outright

- The observation: "What last night left you."
- The refusal: "One page. Never a feed."
- The hour: "6:40 is the default."
- The instruction in the utterance's voice: "Set one hour. The house learns to wait."

No pattern begins with the product name plus "is". A heading of three or more words with no finite
verb is a slogan, not a sentence, and `copy-lint slogan` says so. There is no tagline slot under the
wordmark: a tagline is a slogan with a job title. Delete it, or make it a sentence that is true.

## 4. The six states, written at step 5b

`empty`, `loading`, `error`, `offline`, `done`, `first-run`. They are written before any page exists
and ship in markup as `data-state="<name>"` so coverage is countable by `copy-lint` and by
`craft-lint states`. Each is one or two sentences inside the dial band.

Model lines for the canonical moment (first coffee, 6:40am, house asleep, person second, quiet):

| State | Line |
|---|---|
| `empty` | Nothing has asked for you yet. |
| `loading` | Counting what came in overnight. |
| `error` | The count stopped at 5:02. Open the ledger and it starts again. |
| `offline` | Nothing since 4:12. Whatever arrives will wait. |
| `done` | That was all of it. |
| `first-run` | This page is empty until tomorrow morning. |

The empty state is the moment's actual content, not a shrug with an icon. Error names the thing and
the next action in the same sentence, with no apology. On a dashboard the empty state is written at
step 5b and never improvised at build time.

## 5. copy-lint rules

`node scripts/copy-lint.mjs <file.html|file.md|copy.json> --spec docs/voice.json [--json]`, and
`--hook` for PreToolUse. Verdict line:
`PASS|FAIL <file>: strings=<n> words=<n> sentences=<n> beats=<n> median=<n> states=<k>/6 findings=<n>`.
Exit 0 pass, 1 findings, 2 usage.

Extraction: the text-bearing tags of the body (headings, p, li, a, button, label, td, th, span and
the rest), plus `alt`, `placeholder` and `title` attributes. Strings of one or two words are beats:
counted for the ban list, never averaged into the sentence band.

The twelve rules:

| Rule | Fails when |
|---|---|
| `banned-phrase` | any phrase from the SaaS ban list appears (seamless, effortless, powerful, robust, game-chang, unlock, unleash, elevate your, built for, everything you need, in seconds, ai-powered and the rest) |
| `prop-leak` | a `props` word from voice.json appears in rendered copy |
| `median-band` | the median sentence length falls outside `median`, measured over four or more sentences |
| `ceiling` | any sentence runs over `ceiling` words |
| `headline-words` | an h1 to h4 runs over `headlineWords` |
| `clause-cap` | commas, semicolons and coordinators in one sentence exceed `clauseCap` |
| `person` | a pronoun set other than the moment's outnumbers it (two or more hits) |
| `exclamation` | an exclamation mark appears while `volume` is quiet |
| `tagline-slot` | a string carries `data-role="tagline"`, or a heading opens with the brand name plus "is" or a colon |
| `label-case` | a label of six words or fewer is Title Case or all caps while `labelCase` is sentence |
| `state-coverage` | a name in `states` has no `[data-state="<name>"]` element; prints `<k>/<n>` |
| `em-dash` | the copy contains an em or en dash |

Four rules survive from the tournament because they caught real copy: `slogan` (a heading with no
finite verb), `slogan-shape` (the two beat pattern), `abstraction` (a category noun above the
altitude of the scene), `brand-echo` (the product is the subject more than once per 150 words),
`volume` (urgency words against a quiet sound row) and `lorem`.
