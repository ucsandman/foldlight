# The fold atlas

Twelve documents, each with an anatomy written as a grid law. The atlas is the data in `scripts/fold.mjs`; this file is the same twelve entries written out for reading. `node scripts/fold.mjs --gaze <gaze> --document "<document row>" --surface <surface> --diagram` prints one entry. Nothing here is a style menu: you do not choose a fold, the inventory does.

## 1. What a fold is

A fold is a document's anatomy written as a grid law. A page that is a ledger has one container, not four, because an account book has one: a rail, a row pitch, two continuous rules and a column that accumulates. The page is the document, so the questions a generic layout leaves open (how many columns, where the heading goes, what separates two sections, where the primary action sits) are already answered by the object the moment contains. That is the whole mechanism. A hero architecture cannot do this, because "bold" has no anatomy and a receipt does.

Each entry below is a recipe, not a picture. The eleven fields say what the shell is, what the row grid is, what runs vertically, where the one primary action sits, what separates two things, where metadata lives, what the nav is, what the type does, and what is forbidden. The envelope is the same recipe in numbers, measured off the rendered PNG by `scripts/silhouette-lint.mjs`, so a page cannot declare a fold it does not have.

## 2. Selection

Selection is arithmetic: Gaze x Document. The document row of the sensory inventory names a physical object; `fold.mjs` matches it case-insensitively against the atlas keys, then the alias table, then as a whole word inside the row (so "an account book, ruled" resolves to ledger). A document that matches nothing exits 3: fix the inventory row, never invent a layout.

Gaze is the tiebreaker and the modifier, never a free choice. When the gaze is in the fold's affinity list the recipe stands as written. When it is not, keep the document and apply the gaze as gravity: move the visual weight and the primary action, not the grid.

### Gaze affinity

| Fold | Gaze affinity |
|---|---|
| ledger | down, across |
| gift-tag | down |
| field-notebook | down |
| ticket-stub | down, up |
| trail-map | out |
| museum-label | across |
| broadsheet | across |
| recipe-card | down |
| setlist | down |
| receipt | down |
| scoreboard | up |
| contact-sheet | across |

### The alias table (37 aliases)

| Alias | Fold |
|---|---|
| account book | ledger |
| daybook | ledger |
| invoice | ledger |
| balance sheet | ledger |
| tag | gift-tag |
| luggage tag | gift-tag |
| name card | gift-tag |
| place card | gift-tag |
| notebook | field-notebook |
| journal | field-notebook |
| lab book | field-notebook |
| ticket | ticket-stub |
| boarding | ticket-stub |
| boarding pass | ticket-stub |
| map | trail-map |
| chart | trail-map |
| tide table | trail-map |
| label | museum-label |
| placard | museum-label |
| wall text | museum-label |
| newspaper | broadsheet |
| front page | broadsheet |
| programme | broadsheet |
| recipe | recipe-card |
| index card | recipe-card |
| set list | setlist |
| call sheet | setlist |
| running order | setlist |
| bill | receipt |
| check | receipt |
| till roll | receipt |
| scorecard | scoreboard |
| split time | scoreboard |
| leaderboard | scoreboard |
| proof sheet | contact-sheet |
| seating chart | contact-sheet |
| card catalog | contact-sheet |

## 3. The twelve entries

Diagram legend, fixed, the same one `fold.mjs --diagram` and `fold-card.mjs` use: `#` display type, `=` body text, `|` continuous vertical rule, `-` hairline, `@` the primary action (exactly one), `%` plate or image, `.` unlit or empty, `n` navigation. Every diagram is 24 columns by 14 rows, one grid of the first viewport at 1440x900.

### 3.1 ledger: The ledger

- **gaze** down, across
- **idea** The page keeps an account. Every section is an entry on one pitch, and one column accumulates.
- **shell** grid-template-columns: 146px minmax(0,1fr); no top bar exists, at any width.
- **row** grid-template-columns: 76px minmax(0,1fr) 300px 168px; column-gap: 28px; every band on the page uses this one row grid.
- **verticals** Two continuous hairlines run the full page height: one after the first column, one before the last. They never break at a section.
- **primary** The last entry, in the amount column, right-aligned. Never centered, never a floating pill.
- **separation** Hairline under every row; a double rule (2px + 1px, 3px apart) at a total.
- **metadata** Column one only, tabular figures, same size as body.
- **nav** Thumb-index tabs stacked down the left rail, full viewport height, hairline between each.
- **type** Display lives inside the entry column, never spanning the page. The amount column is the only right-aligned text in the document.
- **forbidden** cards / a full-width top nav bar / a centered container / section headings on their own line
- **plate** none
- **envelope** ruleRows >= 10, vRules >= 2, rightCol >= 0.35, symmetry <= 0.62, bandRatio <= 0.2 (calibrated: 2026-09-19 n=5)

```
nn|=##...........==..|==
nn|------------------|--
nn|====..........==..|==
nn|=###########..==..|==
nn|.#######......==..|==
nn|.=========....==..|..
nn|.=========........|..
nn|------------------|--
nn|=#########....==..|==
nn|.====.........=...|==
nn|------------------|--
nn|=########.....===.|==
nn|------------------|--
nn|======............|=@
```

- **surfaces, dashboard** Keep the 146px rail and the 76/1fr/300/168 row. The four numbers that would have been KPI cards become the first four entries; the running total lives under the double rule; charts sit inside the entry column at the row pitch.
- **surfaces, theme** The row pitch is the line-height, the two verticals are the gutter rules, the amount column is where every numeric token right-aligns; the accent lights the current row only.
- **surfaces, terminal** The row pitch becomes line-height, the amount column becomes the gutter alignment for the prompt and the status line; the rail becomes the 2-column sign area.

### 3.2 gift-tag: The gift tag

- **gaze** down
- **idea** Everything hangs from one point near the top left. The page addresses one reader and is signed at the foot.
- **shell** grid-template-columns: 64px min(46ch, 78vw) 1fr; the first column is the string, a 1px line descending from the anchor.
- **row** A single column. No row grid, no second column of content anywhere.
- **verticals** The string: one hairline from the anchor point to the signature line.
- **primary** The signature line at the foot of the card, left-aligned under a short rule.
- **separation** Blank line only. No rules, no cards, no boxes.
- **metadata** A vertical rail to the right of the card, small, rotated 90deg, dates only.
- **nav** Three links threaded on the string, between the anchor and the card.
- **type** Two sizes only: the addressee line and everything else.
- **forbidden** full-width bands / a second column of content / any grid of cards / torn paper edges or skeuomorphic texture
- **plate** none
- **envelope** maxInkWidth <= 0.66, bandRatio <= 0.15, symmetry <= 0.5 (calibrated: 2026-09-19 n=5)

```
.--.....................
.|......................
.|n.....................
.|n.....................
.|n.....................
.|......................
.|#########.............
.|......................
.|==========...=........
.|==========...=........
.|=======......=........
.|......................
.|---...................
.|@.....................
```

- **surfaces, dashboard** The string stays and the card becomes the one open item; everything else is a dated list under the signature line, never a second column.
- **surfaces, theme** The anchor and the string are the only chrome: a 1px accent rule down the left of the active pane, the signature line as the status bar.
- **surfaces, terminal** The string is the left gutter rule at column 8; two type sizes only, the prompt and everything else.

### 3.3 field-notebook: The field notebook

- **gaze** down
- **idea** A ruled page with a margin that argues with it. Marginalia never lines up with what it annotates.
- **shell** grid-template-columns: minmax(0,1fr) 34%; gap 56px.
- **row** A 28px baseline grid the body snaps to. Margin notes are offset 14px or 42px from their referent, never 0.
- **verticals** One hairline between body and margin, broken wherever a margin note crosses it.
- **primary** Pinned in the margin at the line it refers to.
- **separation** A date at the head of each block. No rules between blocks.
- **metadata** The margin.
- **nav** An index at the foot of the page, not the head.
- **type** Body at one size. The margin is one step smaller and never bold.
- **forbidden** centered headings / a hero / equal-height cards
- **plate** crop
- **envelope** rightCol >= 0.5, symmetry <= 0.5, stagger >= 0.25 (calibrated: 2026-09-19 n=5)

```
====...........|........
==============.|........
==============.|..===...
==============.|........
.=============.|........
==============.|...====.
====...........|........
==============.|........
.=============.|..@.....
==============.|........
==============.|..===...
.=============.|........
...............|........
nn..nn..nn.....|........
```

- **surfaces, dashboard** The body column is the work, the 34% margin is every annotation the product would have put in a card: alerts, deltas, notes, each offset from its row.
- **surfaces, theme** The 28px baseline is the line-height, the margin is the gutter and the fold column, the broken hairline is the active-line indicator.
- **surfaces, terminal** Line-height 28px at the body size, the margin becomes the right-hand status column, the index at the foot becomes the tab line.

### 3.4 ticket-stub: The ticket stub

- **gaze** down, up
- **idea** The page is torn down a perforation. The narrow side carries the same facts, reduced, and it stays.
- **shell** grid-template-columns: minmax(0,1fr) 12px 118px; the 12px column is the perforation, a dotted vertical rule.
- **row** The wide side is free. The stub is a fixed stack of 5 fields, 1 per 84px.
- **verticals** The perforation, dotted, full height, sticky.
- **primary** On the stub, at its foot.
- **separation** Horizontal perforations across the wide side only.
- **metadata** Rotated 90deg on the stub, reading bottom to top.
- **nav** The stub is the nav. It sticks while the wide side scrolls.
- **type** The stub is entirely uppercase at 11px with 0.14em tracking. The wide side is not.
- **forbidden** a centered hero / a footer / symmetric columns
- **plate** crop
- **envelope** vRules >= 1, rightCol >= 0.75, symmetry <= 0.55 (calibrated: 2026-09-19 n=5)

```
######...............|==
####.................|==
#############........|==
#########............|..
==========...........|==
=============........|..
---------------------|==
==========...........|==
=============........|..
=======..............|==
---------------------|==
==========...........|==
========.............|==
.....................|=@
```

- **surfaces, dashboard** The stub is the persistent record (account, period, status, count, action) and the wide side is the working view; the perforation never moves.
- **surfaces, theme** The perforation is the split rule, the stub palette is the uppercase 11px chrome, the wide side carries the body roles.
- **surfaces, terminal** The stub is the right-hand 118px status column at 11px with 0.14em tracking; the perforation is the one vertical rule.

### 3.5 trail-map: The trail map

- **gaze** out
- **idea** The fold is a horizon. Content is placed at elevations, and a legend in the corner explains the marks.
- **shell** grid-template-rows: 22vh minmax(0,1fr) 96px; a 220px legend box fixed bottom-left.
- **row** Sections sit at named elevations on a left-edge scale; vertical spacing is proportional to the distance between them, never equal.
- **verticals** The elevation scale: a hairline with ticks on the left edge, full height.
- **primary** At the trailhead, inside the legend, bottom-left.
- **separation** Contour hairlines that step rather than run straight.
- **metadata** Elevation ticks on the left edge.
- **nav** The legend.
- **type** Place names in small caps, spaced. Body unspaced.
- **forbidden** equal vertical rhythm / a top nav bar / centered anything
- **plate** bleed
- **envelope** lowBand >= 0.5, symmetry <= 0.6, stagger >= 0.3 (calibrated: 2026-09-19 n=5)

```
|.......................
|....########...........
|....======.............
|-----------------------
|.........====..........
|..............====.....
|...====................
|.........-------.......
|.................===...
|.....===...............
|...........====........
|.......................
|====...................
|===@...................
```

- **surfaces, dashboard** Elevations become severity or time bands on the left scale; the legend becomes the filter box, fixed bottom-left; nothing sits at equal vertical rhythm.
- **surfaces, theme** The horizon is the header split, the elevation scale is the line-number rule, the legend is the palette key.
- **surfaces, terminal** The left scale is the gutter with ticks at every tenth line; the legend is the bottom 96px status block.

### 3.6 museum-label: The museum label

- **gaze** across
- **idea** A small block of authoritative text beside a very large object. The label never grows.
- **shell** grid-template-columns: minmax(0,30ch) minmax(0,1fr); gap 96px; the right column bleeds to the viewport edge.
- **row** The label is five lines in fixed order: title, maker, date, medium, accession. Nothing is added to it.
- **verticals** None. Air separates the columns.
- **primary** Under the accession line, a text link in small caps with a 1px underline. Never a filled button.
- **separation** 96px of air, nothing else.
- **metadata** The label block.
- **nav** A floor-plan strip along the very bottom edge, 44px, full bleed.
- **type** The label is one size. The object carries no type at all.
- **forbidden** a subhead under a headline / three feature cards / a filled primary button
- **plate** bleed
- **envelope** maxInkWidth >= 0.9, symmetry <= 0.5, bandRatio <= 0.3 (calibrated: 2026-09-19 n=5)

```
..........%%%%%%%%%%%%%%
=======...%%%%%%%%%%%%%%
======....%%%%%%%%%%%%%%
=====.....%%%%%%%%%%%%%%
=======...%%%%%%%%%%%%%%
====......%%%%%%%%%%%%%%
..........%%%%%%%%%%%%%%
@.........%%%%%%%%%%%%%%
..........%%%%%%%%%%%%%%
..........%%%%%%%%%%%%%%
..........%%%%%%%%%%%%%%
..........%%%%%%%%%%%%%%
..........%%%%%%%%%%%%%%
nnnnnnnnnnnnnnnnnnnnnnnn
```

- **surfaces, dashboard** The label is the fixed five-line record of the selected object and never grows; the bleeding right column is the object itself (the chart, the table, the document).
- **surfaces, theme** The label block is the sidebar at 30ch and the bleeding column is the canvas; 96px of air is the only separator, no rules anywhere.
- **surfaces, terminal** The 30ch label is the left pane width and the bleed column is the output; the floor-plan strip is the 44px bottom bar.

### 3.7 broadsheet: The broadsheet front page

- **gaze** across
- **idea** Many stories at once under one masthead rule, ranked by column span, not by card size.
- **shell** grid-template-columns: repeat(6, 1fr); column-gap: 0; a hairline between every column.
- **row** The lead spans 4, the sidebar 2. Nothing spans 6 except the masthead rule and the dateline.
- **verticals** Five hairlines, full height, one per column gap.
- **primary** In the ear: the boxed top-right cell beside the masthead.
- **separation** Rules that run the full measure of the story, not the page.
- **metadata** A dateline row directly under the masthead rule, 1 line, hairline above and below.
- **nav** Section words in a single rule-bounded row under the masthead.
- **type** One deck head at 3 sizes above the fold; body at 9.5/13 in a narrow measure.
- **forbidden** a hero image / a single column of content / rounded corners
- **plate** crop
- **envelope** vRules >= 3, bandRatio <= 0.35, symmetry <= 0.68 (calibrated: 2026-09-19 n=5)

```
####################.@..
------------------------
===|===|===|===|===|====
---|---|---|---|---|----
nnn|nnn|nnn|===|===|====
###########|===|===|====
===========|===|===|====
===========|===|===|====
---|---|---|---|---|----
===|===|===|===|===|====
===|###|===|===|===|====
===|===|===|===|===|====
---|---|---|---|---|----
===|===|===|===|===|====
```

- **surfaces, dashboard** Rank by column span, never by card size: the lead metric spans 4 columns, the sidebar 2, and the hairlines between columns stay full height.
- **surfaces, theme** Six columns become the six-step scale; the masthead rule is the top chrome rule and the dateline row is the breadcrumb.
- **surfaces, terminal** The six columns become the tab stops; the masthead rule and the dateline are the two header lines above the buffer.

### 3.8 recipe-card: The recipe card

- **gaze** down
- **idea** Quantities on the left, method on the right, one step per line, and the card is smaller than the page.
- **shell** A 5:3 card of min(880px, 86vw) placed at 38% from the top, the rest of the page is the table it sits on.
- **row** grid-template-columns: 14ch minmax(0,1fr); the left column is right-aligned numerals.
- **verticals** One hairline between quantity and method.
- **primary** The last step.
- **separation** A hairline above the method block only.
- **metadata** Yield and time on one line under the title.
- **nav** Tabs along the top edge of the card, inside it, not the page.
- **type** Numerals one step larger than the method text.
- **forbidden** full-bleed sections / a page-width footer / more than one card
- **plate** bleed
- **envelope** maxInkWidth <= 0.88, deadBottom <= 0.2, symmetry <= 0.62 (calibrated: 2026-09-19 n=5)

```
........................
........................
........................
........................
........................
...nn.nn.nn.............
...#####................
...====.................
...---------------......
...=..|=========........
...=..|=========........
...=..|=========........
...=..|========@........
........................
```

- **surfaces, dashboard** One card, never a grid of them: quantities left at 14ch, method right, one step per line, and the page around it stays the table it sits on.
- **surfaces, theme** The card is the editor pane inset on the page ground; the quantity hairline is the gutter rule and numerals run one step larger.
- **surfaces, terminal** The 14ch quantity column is the label gutter, the method column is the output, and the card inset is the padding.

### 3.9 setlist: The setlist

- **gaze** down
- **idea** One hard-left column of single lines at display size, read at arm length in bad light.
- **shell** grid-template-columns: min(30ch, 62vw) minmax(0,1fr); the right column stays empty except for times.
- **row** One line per item, line-height 1.06, nothing wraps. Items that are done are struck through.
- **verticals** None.
- **primary** The encore: set apart by a 96px gap and a bracket drawn in 2px.
- **separation** Gap size only: 16px within a set, 96px between sets.
- **metadata** Times, right of each line, one step down, muted.
- **nav** None. The list is the page.
- **type** Display size for every item. There is no body text on this page.
- **forbidden** paragraphs / a subhead / any box
- **plate** none
- **envelope** maxInkWidth <= 0.7, bandRatio <= 0.12, symmetry <= 0.42 (calibrated: 2026-09-19 n=5)

```
#########.....=.........
#######.......=.........
##########....=.........
########......=.........
........................
#########.....=.........
###########...=.........
........................
........................
##########....=.........
########......=.........
........................
|#########....=.........
|#######@.....=.........
```

- **surfaces, dashboard** Every row is one line at display size with its time to the right; done rows are struck through, and there is no body text on the page at all.
- **surfaces, theme** Line-height 1.06 and one size: the only contrast is struck-through versus live, and the time column is the muted step.
- **surfaces, terminal** One size, line-height 1.06, no wrap; the time column is the right-hand gutter and the encore bracket is the prompt mark.

### 3.10 receipt: The receipt

- **gaze** down
- **idea** A narrow column of item and price with dotted leaders, ruled once at the subtotal and twice at the total.
- **shell** A min(44ch, 86vw) column, hard left at 12% of the viewport, the page around it unlit.
- **row** grid-template-columns: minmax(0,1fr) auto with a dotted leader filling the gap.
- **verticals** None.
- **primary** The total row.
- **separation** A 1px rule above the subtotal, a 1px + 1px double rule above the total.
- **metadata** A header block in 11px uppercase, centered inside the column only.
- **nav** None above the fold; a tear-off edge at the foot carries the links.
- **type** One family at one size, plus the total at 2.4x.
- **forbidden** a wide measure / images / a top bar
- **plate** none
- **envelope** maxInkWidth <= 0.6, bandRatio <= 0.12, symmetry <= 0.5 (calibrated: 2026-09-19 n=5)

```
.....====...............
.....====...............
........................
...===......=...........
...====.....=...........
...==.......=...........
...=====....=...........
...===......=...........
...----------...........
...===......=...........
...----------...........
...----------...........
...====.....@...........
........................
```

- **surfaces, dashboard** The narrow column holds item and amount with a dotted leader; the subtotal takes one rule and the total takes two, and the page around the column stays unlit.
- **surfaces, theme** One family at one size plus the total at 2.4x; the unlit page around the column is the ground and the two rules are the only chrome.
- **surfaces, terminal** The 44ch column is the measure, the dotted leader is the tab fill, and the double rule is the separator above the last line.

### 3.11 scoreboard: The scoreboard

- **gaze** up
- **idea** One figure at the top at absurd scale, and a fixed strip of period cells under it that never moves.
- **shell** grid-template-rows: 40px minmax(0,1fr) 132px; the 40px bar is flush to the top edge, full bleed.
- **row** The strip: repeat(auto-fit, minmax(72px, 1fr)), each cell hairline-bounded, all equal.
- **verticals** Cell dividers in the strip only.
- **primary** In the strip, in the last cell.
- **separation** The strip is the only separator on the page.
- **metadata** The strip.
- **nav** The 40px top bar, flush, no padding, no logo lockup.
- **type** The figure at 22vw, tabular, and nothing else above 18px.
- **forbidden** a paragraph above the fold / rounded corners / a centered subhead
- **plate** none
- **envelope** topBand >= 0.8, foldInk <= 0.3, bandRatio <= 0.4 (calibrated: 2026-09-19 n=5)

```
nnnnnnnnnnnnnnnnnnnnnnnn
........................
..############..........
..############..........
..############..........
..############..........
..############..........
..############..........
........................
........................
........................
........................
==|==|==|==|==|==|==|===
==|==|==|==|==|==|==|==@
```

- **surfaces, dashboard** The one number the product exists to show runs at 22vw, tabular; every other figure lives in the fixed strip of equal cells and nothing else goes above 18px.
- **surfaces, theme** The 40px flush bar is the title bar with no padding; the strip is the status line of equal hairline-bounded cells.
- **surfaces, terminal** The figure is the one oversized readout, the strip is the bottom 132px of equal cells, and nothing between them exceeds 18px.

### 3.12 contact-sheet: The contact sheet

- **gaze** across
- **idea** A uniform grid to all four page edges, every cell numbered in the gutter, exactly one cell marked.
- **shell** grid-template-columns: repeat(6, 1fr); gap: 4px; padding: 4px; the grid reaches every edge.
- **row** Every cell the same aspect (3:2). No cell is ever larger than another.
- **verticals** The gutters themselves, 4px, all the way down.
- **primary** Inside the one marked cell.
- **separation** None. The grid is continuous.
- **metadata** Frame numbers in the 4px gutter, 8px type, rotated.
- **nav** The roll number strip across the top gutter, 6 words, one per column.
- **type** 8px and 11px only, except inside the marked cell.
- **forbidden** a hero / whitespace at the page edges / a cell that spans two columns
- **plate** bleed
- **envelope** ink >= 0.45, bandRatio <= 0.3, edgeBleed >= 0.9 (calibrated: 2026-09-19 n=5)

```
nnn|nnn|nnn|nnn|nnn|nnnn
%%%|%%%|%%%|%%%|%%%|%%%%
%%%|%%%|%%%|%%%|%%%|%%%%
%%%|%%%|%%%|%%%|%%%|%%%%
---|---|---|---|---|----
%%%|%%%|%%%|%%%|%%%|%%%%
%%%|%%%|%%%|%%%|%%%|%%%%
%%%|%%%|%%%|%%%|%%%|%%%%
---|---|---|---|---|----
%%%|%%%|%%%|%%%|%%%|%%%%
%%%|%%%|%@%|%%%|%%%|%%%%
%%%|%%%|%%%|%%%|%%%|%%%%
---|---|---|---|---|----
%%%|%%%|%%%|%%%|%%%|%%%%
```

- **surfaces, dashboard** Every record is a cell of the same 3:2 aspect to all four edges, numbered in the 4px gutter; exactly one cell is marked and it carries the action.
- **surfaces, theme** The 4px gutters are the only separators and they reach every edge; two type sizes, 8px and 11px, outside the marked cell.
- **surfaces, terminal** The grid becomes the pane layout with 4px gutters to every edge; frame numbers are the 8px pane labels in the gutter.

## 4. Baselines

Two committed 1440x900 renders of the category defaults, built once from `references/baselines/baseline-saas.html` and `baseline-awwwards.html`, so step 8's Baseline row has fixed targets and a threshold change has to keep failing them. This is the make-it-fail discipline applied to composition: an instrument that has never been seen failing has been run, not verified.

```
node scripts/silhouette-lint.mjs references/baselines/baseline-saas.png
node scripts/silhouette-lint.mjs references/baselines/baseline-awwwards.png
```

Measured 2026-09-19, Chromium via `npx --yes playwright screenshot --viewport-size=1440,900`:

```
FAIL references/baselines/baseline-saas.png: cells=200x125 viewport=1440x900 foldRows=125 inkedRows=51 ground=rgb(254,255,255) 96% envelope=0 fold=none findings=3
  SAAS_FOLD 3/6  AWWWARDS_FOLD 4/4
  - SAAS_FOLD: 3 of 6 shape conditions met (three or more equal blocks in one row; no continuous ruled column anywhere; an empty lower right (deadQuad >= 0.85)).
  - AWWWARDS_FOLD: 4 of 4 shape conditions met (mirror-symmetric fold (heroSymmetry >= 0.62); near-empty fold (heroInk <= 0.16); full-measure top bar; the fold is pinned to the centre axis (axisCentered >= 0.60)).
  - DEAD_BOTTOM: the last 15% of the page carries no content.

FAIL references/baselines/baseline-awwwards.png: cells=200x125 viewport=1440x900 foldRows=125 inkedRows=45 ground=rgb(11,11,13) 95% envelope=0 fold=none findings=1
  SAAS_FOLD 2/6  AWWWARDS_FOLD 4/4
  - AWWWARDS_FOLD: 4 of 4 shape conditions met (mirror-symmetric fold (heroSymmetry >= 0.62); near-empty fold (heroInk <= 0.16); full-measure top bar; the fold is pinned to the centre axis (axisCentered >= 0.60)).
```

Both exit 1. The SaaS baseline is a full-width top bar, a centered hero, three equal cards and a footer band; the Awwwards baseline is a viewport-scale centered headline under a pill nav with a dark scrim. Neither file carries palette roles, so `moment-lint` has nothing to say about either one: they are shape fixtures and nothing else. Re-render them only when a threshold changes, with `npx --yes playwright screenshot --viewport-size=1440,900 --wait-for-timeout=1200 "file:///<abs>/references/baselines/<name>.html" references/baselines/<name>.png`, and attach the new lines to that commit.

## 5. Surfaces

One fold, four surfaces. The shell, the row grid, the verticals, the separation and the metadata column survive every surface change; what changes is volume, not composition. The ledger dashboard keeps the 146px rail and the 76/1fr/300/168 row: the four numbers that would have been KPI cards become the first four entries, the running total lives under the double rule, charts sit inside the entry column at the row pitch, and the terminal theme takes the row pitch as line-height and the amount column as the gutter alignment. Standard affordances are untouched on a product surface: tables stay tables, nav stays findable, the primary action keeps its label.

| Fold | dashboard | theme | terminal |
|---|---|---|---|
| ledger | Keep the 146px rail and the 76/1fr/300/168 row. The four numbers that would have been KPI cards become the first four entries; the running total lives under the double rule; charts sit inside the entry column at the row pitch. | The row pitch is the line-height, the two verticals are the gutter rules, the amount column is where every numeric token right-aligns; the accent lights the current row only. | The row pitch becomes line-height, the amount column becomes the gutter alignment for the prompt and the status line; the rail becomes the 2-column sign area. |
| gift-tag | The string stays and the card becomes the one open item; everything else is a dated list under the signature line, never a second column. | The anchor and the string are the only chrome: a 1px accent rule down the left of the active pane, the signature line as the status bar. | The string is the left gutter rule at column 8; two type sizes only, the prompt and everything else. |
| field-notebook | The body column is the work, the 34% margin is every annotation the product would have put in a card: alerts, deltas, notes, each offset from its row. | The 28px baseline is the line-height, the margin is the gutter and the fold column, the broken hairline is the active-line indicator. | Line-height 28px at the body size, the margin becomes the right-hand status column, the index at the foot becomes the tab line. |
| ticket-stub | The stub is the persistent record (account, period, status, count, action) and the wide side is the working view; the perforation never moves. | The perforation is the split rule, the stub palette is the uppercase 11px chrome, the wide side carries the body roles. | The stub is the right-hand 118px status column at 11px with 0.14em tracking; the perforation is the one vertical rule. |
| trail-map | Elevations become severity or time bands on the left scale; the legend becomes the filter box, fixed bottom-left; nothing sits at equal vertical rhythm. | The horizon is the header split, the elevation scale is the line-number rule, the legend is the palette key. | The left scale is the gutter with ticks at every tenth line; the legend is the bottom 96px status block. |
| museum-label | The label is the fixed five-line record of the selected object and never grows; the bleeding right column is the object itself (the chart, the table, the document). | The label block is the sidebar at 30ch and the bleeding column is the canvas; 96px of air is the only separator, no rules anywhere. | The 30ch label is the left pane width and the bleed column is the output; the floor-plan strip is the 44px bottom bar. |
| broadsheet | Rank by column span, never by card size: the lead metric spans 4 columns, the sidebar 2, and the hairlines between columns stay full height. | Six columns become the six-step scale; the masthead rule is the top chrome rule and the dateline row is the breadcrumb. | The six columns become the tab stops; the masthead rule and the dateline are the two header lines above the buffer. |
| recipe-card | One card, never a grid of them: quantities left at 14ch, method right, one step per line, and the page around it stays the table it sits on. | The card is the editor pane inset on the page ground; the quantity hairline is the gutter rule and numerals run one step larger. | The 14ch quantity column is the label gutter, the method column is the output, and the card inset is the padding. |
| setlist | Every row is one line at display size with its time to the right; done rows are struck through, and there is no body text on the page at all. | Line-height 1.06 and one size: the only contrast is struck-through versus live, and the time column is the muted step. | One size, line-height 1.06, no wrap; the time column is the right-hand gutter and the encore bracket is the prompt mark. |
| receipt | The narrow column holds item and amount with a dotted leader; the subtotal takes one rule and the total takes two, and the page around the column stays unlit. | One family at one size plus the total at 2.4x; the unlit page around the column is the ground and the two rules are the only chrome. | The 44ch column is the measure, the dotted leader is the tab fill, and the double rule is the separator above the last line. |
| scoreboard | The one number the product exists to show runs at 22vw, tabular; every other figure lives in the fixed strip of equal cells and nothing else goes above 18px. | The 40px flush bar is the title bar with no padding; the strip is the status line of equal hairline-bounded cells. | The figure is the one oversized readout, the strip is the bottom 132px of equal cells, and nothing between them exceeds 18px. |
| contact-sheet | Every record is a cell of the same 3:2 aspect to all four edges, numbered in the 4px gutter; exactly one cell is marked and it carries the action. | The 4px gutters are the only separators and they reach every edge; two type sizes, 8px and 11px, outside the marked cell. | The grid becomes the pane layout with 4px gutters to every edge; frame numbers are the 8px pane labels in the gutter. |

## 6. Expiry

The envelopes were calibrated on five pages, which is why every envelope line above carries `calibrated: 2026-09-19 n=5`. Two of the five were the author's own, so the numbers are a floor and not taste. The second-moment gate (spec section 8, phase 7) adds to n: an unrelated moment that passes end to end raises the count in this file, and a threshold that has to move is a commit carrying the new `silhouette-lint` lines for all six demos plus both baselines still failing.

An atlas entry is added the same way: a numeric envelope, a built page that passes it, and both baselines still failing. Never as prose.
