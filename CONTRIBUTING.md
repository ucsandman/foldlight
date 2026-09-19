# Contributing

## The second-moment gate

No change to `SKILL.md`, `references/translation.md`, `references/folds.md`, or any generator
(`fold.mjs`, `plate.mjs`, `plate-tokens.mjs`, `fonts.mjs`, `fold-card.mjs`) merges until it has run
end to end on the canonical moment and on one unrelated moment. Both runs go through the whole
workflow, steps 0 to 9, not a partial re-render. Attach to the commit message: both fold
screenshots (`fold-1440.png` for each moment) and both `silhouette-lint` lines, verbatim, with
their counts. Two moments, because one moment proves the scripts run and two prove the shape came
from the document row and not from the author's hand. A threshold change carries the same evidence
for all six demos, and the two committed baselines must still fail. A run that cannot show both
lines is not a run; open it as a draft and say which step blocked.

## Verification commands

```
node scripts/selftest.mjs                                                  # 12 atlas keys, 37 aliases, envelope metrics, folds.md keys
node scripts/selftest.mjs --no-em-dash SKILL.md CONTRIBUTING.md references/*.md
node scripts/fold.mjs --gaze down --document "account book" --diagram      # fold=ledger and 14 diagram rows
node scripts/fold.mjs --gaze down --document "a vibe"; echo exit=$?        # exit=3
node scripts/silhouette-lint.mjs references/baselines/baseline-saas.png    # FAIL, SAAS_FOLD 3/6
node scripts/silhouette-lint.mjs references/baselines/baseline-awwwards.png # FAIL, AWWWARDS_FOLD 4/4
node scripts/shot.mjs <moment>/sense-memory.json --out /tmp/shot.json --check   # NEVER_LEAK 0
node scripts/plate.mjs /tmp/shot.json /tmp/plate.png                       # 1536x1024 provider=procedural
node scripts/plate-tokens.mjs /tmp/plate.png /tmp/tokens.css --fold <key> --register brand
node scripts/moment-lint.mjs /tmp/tokens.css --plate /tmp/plate.png        # PASS roles=5 fold=<key> kit=yes findings=0
node scripts/fonts.mjs --role display --method pen --contrast medium --terminal wedge --width normal --need opsz,wght --limit 3 --specimen /tmp/spec.html --string "<display string>" --size 88 --bg "<--bg>" --ink "<--ink>"
node scripts/fold-card.mjs /tmp/tokens.css /tmp/card.html --plate /tmp/plate.png --fold <key> --voice <voice.json>
node scripts/silhouette-lint.mjs demos/<n>/fold-1440.png --fold <key>      # PASS findings=0
node scripts/silhouette-lint.mjs demos/<n>/mobile.png --fold <key> --viewport 390x844
node scripts/craft-lint.mjs demos/<n>/index.html --register <brand|product>  # PASS rules=15 states=6/6 findings=0
node scripts/copy-lint.mjs demos/<n>/index.html --spec demos/<n>/voice.json  # PASS states=6/6 findings=0
node scripts/moment-lint.mjs demos/<n>/tokens.css --plate demos/<n>/assets/plate-01.png
node scripts/fold-metrics.mjs demos/<n>/index.html --bands                 # hero IN scale IN contrastFails IN
claude plugin eval . --ablation none --runs 1 --allow-tools Bash Write     # all cases pass
```

## The two PreToolUse hooks

`SKILL.md` installs two hooks on Write and Edit: `moment-lint.mjs --hook` and
`copy-lint.mjs --hook --spec docs/voice.json`. Both are silent until they have something to judge:
the token hook ignores a file with fewer than five palette roles, and the copy hook exits 0 while
`docs/voice.json` does not exist (the project has not reached step 5b) and applies `state-coverage`
only to a whole markup document (an html, htm, jsx or tsx target whose content carries `<body`).
A markdown brief, a snippet Edit and a partial component are never denied for missing states.
Reproduce both silences before changing either hook:

```
echo '{"tool_input":{"file_path":"index.html","content":"<h1>Nobody else is up yet.</h1>"}}' | node scripts/copy-lint.mjs --hook --spec docs/voice.json; echo exit=$?    # 0, no output, when docs/voice.json is absent
echo '{"tool_input":{"file_path":"README.md","content":"--bg: oklch(0.2 0 0)"}}' | node scripts/moment-lint.mjs --hook; echo exit=$?                                  # 0, no output: one role is not a palette
```

Every verdict line prints the volume it processed. A linter line with no count beside its verdict
is not evidence, and a check that has never been seen failing has been run, not verified: that is
what the two committed baseline PNGs are for.
