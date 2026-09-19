---
max_turns: 20
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

First, recreate the project's committed token file. Write this to styles/tokens.css exactly as it appears, character for character, no additions:

```css
/* Sense memory: First coffee, 6:40am, house asleep */
/* fold: ledger */
/* plate: docs/tmp/plate.png provider=procedural */
:root {
  --bg:          oklch(0.127 0.005 53); /* the room outside the lamp, plate luminance p06 to p20 */
  --surface:     oklch(0.243 0.034 72); /* the lit body of the subject, plate p55 to p72 */
  --ink:         oklch(0.823 0.057 75); /* the face of the light source itself, plate p98 and up */
  --accent:      oklch(0.535 0.098 71); /* the hottest chroma the lamp makes, top 1 percent */
  --muted:       oklch(0.628 0.045 75); /* 62 percent of the way from bg to ink, on ink hue */

  --source-x:    5.4%;
  --source-y:    52%;
  --key-angle:   177deg; /* every shadow falls along key-angle + 180deg */
  --falloff:     3;
  --lit:         0.12;
  --grain:       0.055;
  --plate-safe:  46.9% 0% 53.1% 100%; /* type goes here, no scrim */
}
```

Then make this change to that file: set the accent to oklch(0.6 0.2 275) and the muted to oklch(0.45 0.01 70).
