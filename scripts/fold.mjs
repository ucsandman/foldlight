#!/usr/bin/env node
// fold.mjs - the fold atlas. Composition is chosen from the inventory, never composed by taste.
//
//   node fold.mjs --gaze down --document "account book"            pick and print one recipe
//   node fold.mjs --gaze down --document ledger --diagram          add the 24x14 blocking diagram
//   node fold.mjs --gaze down --document ledger --surface dashboard  the shell for that surface
//   node fold.mjs --fold ledger --json                             machine-readable (silhouette-lint, fold-card)
//   node fold.mjs --list                                           all twelve keys with their gaze affinity
//
// Gaze x Document selects the fold. Gaze is a tiebreaker and a modifier, never a free choice.
// A gaze outside the fold's affinity applies as gravity: it moves the weight and the primary
// action, never the grid.
//
// Diagram legend: # display type, = body text, | vertical rule, - hairline,
//                 @ the primary action (exactly one), % plate, . empty, n navigation.
//
// Exit 0 ok, 2 usage, 3 no fold for that document.

export const CALIBRATED = 'calibrated: 2026-09-19 n=5';

export const ATLAS = {
  ledger: {
    name: 'The ledger',
    gaze: ['down', 'across'],
    idea: 'The page keeps an account. Every section is an entry on one pitch, and one column accumulates.',
    shell: 'grid-template-columns: 146px minmax(0,1fr); no top bar exists, at any width.',
    row: 'grid-template-columns: 76px minmax(0,1fr) 300px 168px; column-gap: 28px; every band on the page uses this one row grid.',
    verticals: 'Two continuous hairlines run the full page height: one after the first column, one before the last. They never break at a section.',
    primary: 'The last entry, in the amount column, right-aligned. Never centered, never a floating pill.',
    separation: 'Hairline under every row; a double rule (2px + 1px, 3px apart) at a total.',
    metadata: 'Column one only, tabular figures, same size as body.',
    nav: 'Thumb-index tabs stacked down the left rail, full viewport height, hairline between each.',
    type: 'Display lives inside the entry column, never spanning the page. The amount column is the only right-aligned text in the document.',
    forbidden: ['cards', 'a full-width top nav bar', 'a centered container', 'section headings on their own line'],
    plate: 'none',
    envelope: { ruleRows: ['>=', 10], vRules: ['>=', 2], rightCol: ['>=', 0.35], symmetry: ['<=', 0.62], bandRatio: ['<=', 0.2] },
    diagram: [
      'nn|=##...........==..|==',
      'nn|------------------|--',
      'nn|====..........==..|==',
      'nn|=###########..==..|==',
      'nn|.#######......==..|==',
      'nn|.=========....==..|..',
      'nn|.=========........|..',
      'nn|------------------|--',
      'nn|=#########....==..|==',
      'nn|.====.........=...|==',
      'nn|------------------|--',
      'nn|=########.....===.|==',
      'nn|------------------|--',
      'nn|======............|=@',
    ],
    surfaces: {
      dashboard: 'Keep the 146px rail and the 76/1fr/300/168 row. The four numbers that would have been KPI cards become the first four entries; the running total lives under the double rule; charts sit inside the entry column at the row pitch.',
      theme: 'The row pitch is the line-height, the two verticals are the gutter rules, the amount column is where every numeric token right-aligns; the accent lights the current row only.',
      terminal: 'The row pitch becomes line-height, the amount column becomes the gutter alignment for the prompt and the status line; the rail becomes the 2-column sign area.',
    },
  },
  'gift-tag': {
    name: 'The gift tag',
    gaze: ['down'],
    idea: 'Everything hangs from one point near the top left. The page addresses one reader and is signed at the foot.',
    shell: 'grid-template-columns: 64px min(46ch, 78vw) 1fr; the first column is the string, a 1px line descending from the anchor.',
    row: 'A single column. No row grid, no second column of content anywhere.',
    verticals: 'The string: one hairline from the anchor point to the signature line.',
    primary: 'The signature line at the foot of the card, left-aligned under a short rule.',
    separation: 'Blank line only. No rules, no cards, no boxes.',
    metadata: 'A vertical rail to the right of the card, small, rotated 90deg, dates only.',
    nav: 'Three links threaded on the string, between the anchor and the card.',
    type: 'Two sizes only: the addressee line and everything else.',
    forbidden: ['full-width bands', 'a second column of content', 'any grid of cards', 'torn paper edges or skeuomorphic texture'],
    plate: 'none',
    envelope: { maxInkWidth: ['<=', 0.66], bandRatio: ['<=', 0.15], symmetry: ['<=', 0.5] },
    diagram: [
      '.--.....................',
      '.|......................',
      '.|n.....................',
      '.|n.....................',
      '.|n.....................',
      '.|......................',
      '.|#########.............',
      '.|......................',
      '.|==========...=........',
      '.|==========...=........',
      '.|=======......=........',
      '.|......................',
      '.|---...................',
      '.|@.....................',
    ],
    surfaces: {
      dashboard: 'The string stays and the card becomes the one open item; everything else is a dated list under the signature line, never a second column.',
      theme: 'The anchor and the string are the only chrome: a 1px accent rule down the left of the active pane, the signature line as the status bar.',
      terminal: 'The string is the left gutter rule at column 8; two type sizes only, the prompt and everything else.',
    },
  },
  'field-notebook': {
    name: 'The field notebook',
    gaze: ['down'],
    idea: 'A ruled page with a margin that argues with it. Marginalia never lines up with what it annotates.',
    shell: 'grid-template-columns: minmax(0,1fr) 34%; gap 56px.',
    row: 'A 28px baseline grid the body snaps to. Margin notes are offset 14px or 42px from their referent, never 0.',
    verticals: 'One hairline between body and margin, broken wherever a margin note crosses it.',
    primary: 'Pinned in the margin at the line it refers to.',
    separation: 'A date at the head of each block. No rules between blocks.',
    metadata: 'The margin.',
    nav: 'An index at the foot of the page, not the head.',
    type: 'Body at one size. The margin is one step smaller and never bold.',
    forbidden: ['centered headings', 'a hero', 'equal-height cards'],
    plate: 'crop',
    envelope: { rightCol: ['>=', 0.5], symmetry: ['<=', 0.5], stagger: ['>=', 0.25] },
    diagram: [
      '====...........|........',
      '==============.|........',
      '==============.|..===...',
      '==============.|........',
      '.=============.|........',
      '==============.|...====.',
      '====...........|........',
      '==============.|........',
      '.=============.|..@.....',
      '==============.|........',
      '==============.|..===...',
      '.=============.|........',
      '...............|........',
      'nn..nn..nn.....|........',
    ],
    surfaces: {
      dashboard: 'The body column is the work, the 34% margin is every annotation the product would have put in a card: alerts, deltas, notes, each offset from its row.',
      theme: 'The 28px baseline is the line-height, the margin is the gutter and the fold column, the broken hairline is the active-line indicator.',
      terminal: 'Line-height 28px at the body size, the margin becomes the right-hand status column, the index at the foot becomes the tab line.',
    },
  },
  'ticket-stub': {
    name: 'The ticket stub',
    gaze: ['down', 'up'],
    idea: 'The page is torn down a perforation. The narrow side carries the same facts, reduced, and it stays.',
    shell: 'grid-template-columns: minmax(0,1fr) 12px 118px; the 12px column is the perforation, a dotted vertical rule.',
    row: 'The wide side is free. The stub is a fixed stack of 5 fields, 1 per 84px.',
    verticals: 'The perforation, dotted, full height, sticky.',
    primary: 'On the stub, at its foot.',
    separation: 'Horizontal perforations across the wide side only.',
    metadata: 'Rotated 90deg on the stub, reading bottom to top.',
    nav: 'The stub is the nav. It sticks while the wide side scrolls.',
    type: 'The stub is entirely uppercase at 11px with 0.14em tracking. The wide side is not.',
    forbidden: ['a centered hero', 'a footer', 'symmetric columns'],
    plate: 'crop',
    envelope: { vRules: ['>=', 1], rightCol: ['>=', 0.75], symmetry: ['<=', 0.55] },
    diagram: [
      '######...............|==',
      '####.................|==',
      '#############........|==',
      '#########............|..',
      '==========...........|==',
      '=============........|..',
      '---------------------|==',
      '==========...........|==',
      '=============........|..',
      '=======..............|==',
      '---------------------|==',
      '==========...........|==',
      '========.............|==',
      '.....................|=@',
    ],
    surfaces: {
      dashboard: 'The stub is the persistent record (account, period, status, count, action) and the wide side is the working view; the perforation never moves.',
      theme: 'The perforation is the split rule, the stub palette is the uppercase 11px chrome, the wide side carries the body roles.',
      terminal: 'The stub is the right-hand 118px status column at 11px with 0.14em tracking; the perforation is the one vertical rule.',
    },
  },
  'trail-map': {
    name: 'The trail map',
    gaze: ['out'],
    idea: 'The fold is a horizon. Content is placed at elevations, and a legend in the corner explains the marks.',
    shell: 'grid-template-rows: 22vh minmax(0,1fr) 96px; a 220px legend box fixed bottom-left.',
    row: 'Sections sit at named elevations on a left-edge scale; vertical spacing is proportional to the distance between them, never equal.',
    verticals: 'The elevation scale: a hairline with ticks on the left edge, full height.',
    primary: 'At the trailhead, inside the legend, bottom-left.',
    separation: 'Contour hairlines that step rather than run straight.',
    metadata: 'Elevation ticks on the left edge.',
    nav: 'The legend.',
    type: 'Place names in small caps, spaced. Body unspaced.',
    forbidden: ['equal vertical rhythm', 'a top nav bar', 'centered anything'],
    plate: 'bleed',
    envelope: { lowBand: ['>=', 0.5], symmetry: ['<=', 0.6], stagger: ['>=', 0.3] },
    diagram: [
      '|.......................',
      '|....########...........',
      '|....======.............',
      '|-----------------------',
      '|.........====..........',
      '|..............====.....',
      '|...====................',
      '|.........-------.......',
      '|.................===...',
      '|.....===...............',
      '|...........====........',
      '|.......................',
      '|====...................',
      '|===@...................',
    ],
    surfaces: {
      dashboard: 'Elevations become severity or time bands on the left scale; the legend becomes the filter box, fixed bottom-left; nothing sits at equal vertical rhythm.',
      theme: 'The horizon is the header split, the elevation scale is the line-number rule, the legend is the palette key.',
      terminal: 'The left scale is the gutter with ticks at every tenth line; the legend is the bottom 96px status block.',
    },
  },
  'museum-label': {
    name: 'The museum label',
    gaze: ['across'],
    idea: 'A small block of authoritative text beside a very large object. The label never grows.',
    shell: 'grid-template-columns: minmax(0,30ch) minmax(0,1fr); gap 96px; the right column bleeds to the viewport edge.',
    row: 'The label is five lines in fixed order: title, maker, date, medium, accession. Nothing is added to it.',
    verticals: 'None. Air separates the columns.',
    primary: 'Under the accession line, a text link in small caps with a 1px underline. Never a filled button.',
    separation: '96px of air, nothing else.',
    metadata: 'The label block.',
    nav: 'A floor-plan strip along the very bottom edge, 44px, full bleed.',
    type: 'The label is one size. The object carries no type at all.',
    forbidden: ['a subhead under a headline', 'three feature cards', 'a filled primary button'],
    plate: 'bleed',
    envelope: { maxInkWidth: ['>=', 0.9], symmetry: ['<=', 0.5], bandRatio: ['<=', 0.3] },
    diagram: [
      '..........%%%%%%%%%%%%%%',
      '=======...%%%%%%%%%%%%%%',
      '======....%%%%%%%%%%%%%%',
      '=====.....%%%%%%%%%%%%%%',
      '=======...%%%%%%%%%%%%%%',
      '====......%%%%%%%%%%%%%%',
      '..........%%%%%%%%%%%%%%',
      '@.........%%%%%%%%%%%%%%',
      '..........%%%%%%%%%%%%%%',
      '..........%%%%%%%%%%%%%%',
      '..........%%%%%%%%%%%%%%',
      '..........%%%%%%%%%%%%%%',
      '..........%%%%%%%%%%%%%%',
      'nnnnnnnnnnnnnnnnnnnnnnnn',
    ],
    surfaces: {
      dashboard: 'The label is the fixed five-line record of the selected object and never grows; the bleeding right column is the object itself (the chart, the table, the document).',
      theme: 'The label block is the sidebar at 30ch and the bleeding column is the canvas; 96px of air is the only separator, no rules anywhere.',
      terminal: 'The 30ch label is the left pane width and the bleed column is the output; the floor-plan strip is the 44px bottom bar.',
    },
  },
  broadsheet: {
    name: 'The broadsheet front page',
    gaze: ['across'],
    idea: 'Many stories at once under one masthead rule, ranked by column span, not by card size.',
    shell: 'grid-template-columns: repeat(6, 1fr); column-gap: 0; a hairline between every column.',
    row: 'The lead spans 4, the sidebar 2. Nothing spans 6 except the masthead rule and the dateline.',
    verticals: 'Five hairlines, full height, one per column gap.',
    primary: 'In the ear: the boxed top-right cell beside the masthead.',
    separation: 'Rules that run the full measure of the story, not the page.',
    metadata: 'A dateline row directly under the masthead rule, 1 line, hairline above and below.',
    nav: 'Section words in a single rule-bounded row under the masthead.',
    type: 'One deck head at 3 sizes above the fold; body at 9.5/13 in a narrow measure.',
    forbidden: ['a hero image', 'a single column of content', 'rounded corners'],
    plate: 'crop',
    envelope: { vRules: ['>=', 3], bandRatio: ['<=', 0.35], symmetry: ['<=', 0.68] },
    diagram: [
      '####################.@..',
      '------------------------',
      '===|===|===|===|===|====',
      '---|---|---|---|---|----',
      'nnn|nnn|nnn|===|===|====',
      '###########|===|===|====',
      '===========|===|===|====',
      '===========|===|===|====',
      '---|---|---|---|---|----',
      '===|===|===|===|===|====',
      '===|###|===|===|===|====',
      '===|===|===|===|===|====',
      '---|---|---|---|---|----',
      '===|===|===|===|===|====',
    ],
    surfaces: {
      dashboard: 'Rank by column span, never by card size: the lead metric spans 4 columns, the sidebar 2, and the hairlines between columns stay full height.',
      theme: 'Six columns become the six-step scale; the masthead rule is the top chrome rule and the dateline row is the breadcrumb.',
      terminal: 'The six columns become the tab stops; the masthead rule and the dateline are the two header lines above the buffer.',
    },
  },
  'recipe-card': {
    name: 'The recipe card',
    gaze: ['down'],
    idea: 'Quantities on the left, method on the right, one step per line, and the card is smaller than the page.',
    shell: 'A 5:3 card of min(880px, 86vw) placed at 38% from the top, the rest of the page is the table it sits on.',
    row: 'grid-template-columns: 14ch minmax(0,1fr); the left column is right-aligned numerals.',
    verticals: 'One hairline between quantity and method.',
    primary: 'The last step.',
    separation: 'A hairline above the method block only.',
    metadata: 'Yield and time on one line under the title.',
    nav: 'Tabs along the top edge of the card, inside it, not the page.',
    type: 'Numerals one step larger than the method text.',
    forbidden: ['full-bleed sections', 'a page-width footer', 'more than one card'],
    plate: 'bleed',
    envelope: { maxInkWidth: ['<=', 0.88], deadBottom: ['<=', 0.2], symmetry: ['<=', 0.62] },
    diagram: [
      '........................',
      '........................',
      '........................',
      '........................',
      '........................',
      '...nn.nn.nn.............',
      '...#####................',
      '...====.................',
      '...---------------......',
      '...=..|=========........',
      '...=..|=========........',
      '...=..|=========........',
      '...=..|========@........',
      '........................',
    ],
    surfaces: {
      dashboard: 'One card, never a grid of them: quantities left at 14ch, method right, one step per line, and the page around it stays the table it sits on.',
      theme: 'The card is the editor pane inset on the page ground; the quantity hairline is the gutter rule and numerals run one step larger.',
      terminal: 'The 14ch quantity column is the label gutter, the method column is the output, and the card inset is the padding.',
    },
  },
  setlist: {
    name: 'The setlist',
    gaze: ['down'],
    idea: 'One hard-left column of single lines at display size, read at arm length in bad light.',
    shell: 'grid-template-columns: min(30ch, 62vw) minmax(0,1fr); the right column stays empty except for times.',
    row: 'One line per item, line-height 1.06, nothing wraps. Items that are done are struck through.',
    verticals: 'None.',
    primary: 'The encore: set apart by a 96px gap and a bracket drawn in 2px.',
    separation: 'Gap size only: 16px within a set, 96px between sets.',
    metadata: 'Times, right of each line, one step down, muted.',
    nav: 'None. The list is the page.',
    type: 'Display size for every item. There is no body text on this page.',
    forbidden: ['paragraphs', 'a subhead', 'any box'],
    plate: 'none',
    envelope: { maxInkWidth: ['<=', 0.7], bandRatio: ['<=', 0.12], symmetry: ['<=', 0.42] },
    diagram: [
      '#########.....=.........',
      '#######.......=.........',
      '##########....=.........',
      '########......=.........',
      '........................',
      '#########.....=.........',
      '###########...=.........',
      '........................',
      '........................',
      '##########....=.........',
      '########......=.........',
      '........................',
      '|#########....=.........',
      '|#######@.....=.........',
    ],
    surfaces: {
      dashboard: 'Every row is one line at display size with its time to the right; done rows are struck through, and there is no body text on the page at all.',
      theme: 'Line-height 1.06 and one size: the only contrast is struck-through versus live, and the time column is the muted step.',
      terminal: 'One size, line-height 1.06, no wrap; the time column is the right-hand gutter and the encore bracket is the prompt mark.',
    },
  },
  receipt: {
    name: 'The receipt',
    gaze: ['down'],
    idea: 'A narrow column of item and price with dotted leaders, ruled once at the subtotal and twice at the total.',
    shell: 'A min(44ch, 86vw) column, hard left at 12% of the viewport, the page around it unlit.',
    row: 'grid-template-columns: minmax(0,1fr) auto with a dotted leader filling the gap.',
    verticals: 'None.',
    primary: 'The total row.',
    separation: 'A 1px rule above the subtotal, a 1px + 1px double rule above the total.',
    metadata: 'A header block in 11px uppercase, centered inside the column only.',
    nav: 'None above the fold; a tear-off edge at the foot carries the links.',
    type: 'One family at one size, plus the total at 2.4x.',
    forbidden: ['a wide measure', 'images', 'a top bar'],
    plate: 'none',
    envelope: { maxInkWidth: ['<=', 0.6], bandRatio: ['<=', 0.12], symmetry: ['<=', 0.5] },
    diagram: [
      '.....====...............',
      '.....====...............',
      '........................',
      '...===......=...........',
      '...====.....=...........',
      '...==.......=...........',
      '...=====....=...........',
      '...===......=...........',
      '...----------...........',
      '...===......=...........',
      '...----------...........',
      '...----------...........',
      '...====.....@...........',
      '........................',
    ],
    surfaces: {
      dashboard: 'The narrow column holds item and amount with a dotted leader; the subtotal takes one rule and the total takes two, and the page around the column stays unlit.',
      theme: 'One family at one size plus the total at 2.4x; the unlit page around the column is the ground and the two rules are the only chrome.',
      terminal: 'The 44ch column is the measure, the dotted leader is the tab fill, and the double rule is the separator above the last line.',
    },
  },
  scoreboard: {
    name: 'The scoreboard',
    gaze: ['up'],
    idea: 'One figure at the top at absurd scale, and a fixed strip of period cells under it that never moves.',
    shell: 'grid-template-rows: 40px minmax(0,1fr) 132px; the 40px bar is flush to the top edge, full bleed.',
    row: 'The strip: repeat(auto-fit, minmax(72px, 1fr)), each cell hairline-bounded, all equal.',
    verticals: 'Cell dividers in the strip only.',
    primary: 'In the strip, in the last cell.',
    separation: 'The strip is the only separator on the page.',
    metadata: 'The strip.',
    nav: 'The 40px top bar, flush, no padding, no logo lockup.',
    type: 'The figure at 22vw, tabular, and nothing else above 18px.',
    forbidden: ['a paragraph above the fold', 'rounded corners', 'a centered subhead'],
    plate: 'none',
    envelope: { topBand: ['>=', 0.8], foldInk: ['<=', 0.3], bandRatio: ['<=', 0.4] },
    diagram: [
      'nnnnnnnnnnnnnnnnnnnnnnnn',
      '........................',
      '..############..........',
      '..############..........',
      '..############..........',
      '..############..........',
      '..############..........',
      '..############..........',
      '........................',
      '........................',
      '........................',
      '........................',
      '==|==|==|==|==|==|==|===',
      '==|==|==|==|==|==|==|==@',
    ],
    surfaces: {
      dashboard: 'The one number the product exists to show runs at 22vw, tabular; every other figure lives in the fixed strip of equal cells and nothing else goes above 18px.',
      theme: 'The 40px flush bar is the title bar with no padding; the strip is the status line of equal hairline-bounded cells.',
      terminal: 'The figure is the one oversized readout, the strip is the bottom 132px of equal cells, and nothing between them exceeds 18px.',
    },
  },
  'contact-sheet': {
    name: 'The contact sheet',
    gaze: ['across'],
    idea: 'A uniform grid to all four page edges, every cell numbered in the gutter, exactly one cell marked.',
    shell: 'grid-template-columns: repeat(6, 1fr); gap: 4px; padding: 4px; the grid reaches every edge.',
    row: 'Every cell the same aspect (3:2). No cell is ever larger than another.',
    verticals: 'The gutters themselves, 4px, all the way down.',
    primary: 'Inside the one marked cell.',
    separation: 'None. The grid is continuous.',
    metadata: 'Frame numbers in the 4px gutter, 8px type, rotated.',
    nav: 'The roll number strip across the top gutter, 6 words, one per column.',
    type: '8px and 11px only, except inside the marked cell.',
    forbidden: ['a hero', 'whitespace at the page edges', 'a cell that spans two columns'],
    plate: 'bleed',
    envelope: { ink: ['>=', 0.45], bandRatio: ['<=', 0.3], edgeBleed: ['>=', 0.9] },
    diagram: [
      'nnn|nnn|nnn|nnn|nnn|nnnn',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '---|---|---|---|---|----',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '---|---|---|---|---|----',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '%%%|%%%|%@%|%%%|%%%|%%%%',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
      '---|---|---|---|---|----',
      '%%%|%%%|%%%|%%%|%%%|%%%%',
    ],
    surfaces: {
      dashboard: 'Every record is a cell of the same 3:2 aspect to all four edges, numbered in the 4px gutter; exactly one cell is marked and it carries the action.',
      theme: 'The 4px gutters are the only separators and they reach every edge; two type sizes, 8px and 11px, outside the marked cell.',
      terminal: 'The grid becomes the pane layout with 4px gutters to every edge; frame numbers are the 8px pane labels in the gutter.',
    },
  },
};

export const DOC_ALIASES = {
  'account book': 'ledger', 'daybook': 'ledger', 'invoice': 'ledger', 'balance sheet': 'ledger',
  'tag': 'gift-tag', 'luggage tag': 'gift-tag', 'name card': 'gift-tag', 'place card': 'gift-tag',
  notebook: 'field-notebook', journal: 'field-notebook', 'lab book': 'field-notebook',
  ticket: 'ticket-stub', boarding: 'ticket-stub', 'boarding pass': 'ticket-stub',
  map: 'trail-map', chart: 'trail-map', 'tide table': 'trail-map',
  label: 'museum-label', placard: 'museum-label', 'wall text': 'museum-label',
  newspaper: 'broadsheet', 'front page': 'broadsheet', programme: 'broadsheet',
  recipe: 'recipe-card', 'index card': 'recipe-card',
  'set list': 'setlist', 'call sheet': 'setlist', 'running order': 'setlist',
  bill: 'receipt', check: 'receipt', 'till roll': 'receipt',
  scorecard: 'scoreboard', 'split time': 'scoreboard', leaderboard: 'scoreboard',
  'proof sheet': 'contact-sheet', 'seating chart': 'contact-sheet', 'card catalog': 'contact-sheet',
};

export function pick(gaze, document) {
  const raw = String(document == null ? '' : document).trim().toLowerCase();
  let key = ATLAS[raw] ? raw : DOC_ALIASES[raw];
  if (!key && raw) {
    // "an account book, ruled" resolves to ledger: longest name wins, so "boarding pass"
    // is never shadowed by "boarding".
    const names = [...Object.keys(ATLAS), ...Object.keys(DOC_ALIASES)].sort((a, b) => b.length - a.length);
    for (const n of names) {
      if (!new RegExp(`(^|[^a-z])${n.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}($|[^a-z])`).test(raw)) continue;
      key = ATLAS[n] ? n : DOC_ALIASES[n];
      break;
    }
  }
  if (!key) return null;
  const f = ATLAS[key];
  const fit = !gaze || f.gaze.includes(gaze);
  return { key, fold: f, gazeFits: fit };
}

const SURFACES = ['landing', 'dashboard', 'theme', 'terminal'];

function render(key, f, surface) {
  const L = [];
  L.push(`fold=${key}  (${f.name})`);
  L.push(`gaze affinity: ${f.gaze.join(', ')}`);
  L.push(`idea: ${f.idea}`);
  L.push('');
  L.push(`shell      ${f.shell}`);
  L.push(`row        ${f.row}`);
  L.push(`verticals  ${f.verticals}`);
  L.push(`primary    ${f.primary}`);
  L.push(`separation ${f.separation}`);
  L.push(`metadata   ${f.metadata}`);
  L.push(`nav        ${f.nav}`);
  L.push(`type       ${f.type}`);
  L.push(`forbidden  ${f.forbidden.join(' / ')}`);
  L.push(`plate      ${f.plate}`);
  L.push('');
  L.push(`silhouette envelope (checked by silhouette-lint.mjs --fold ${key}), ${CALIBRATED}:`);
  for (const [m, [op, v]] of Object.entries(f.envelope)) L.push(`  ${m} ${op} ${v}`);
  if (surface && surface !== 'landing') {
    L.push('');
    L.push(`surface ${surface}: ${f.surfaces[surface]}`);
  } else if (surface === 'landing') {
    L.push('');
    L.push('surface landing: the shell above, unchanged. The document is the page.');
  }
  if (surface === 'dashboard') {
    L.push('product register: keep the shell, the row grid, the verticals, the separation and the metadata column.');
    L.push('Standard affordances are untouched: tables stay tables, nav stays findable, the primary action keeps its label.');
  }
  return L.join('\n');
}

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : undefined; };
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('fold.mjs')) {
  if (argv.includes('--list')) {
    for (const [k, f] of Object.entries(ATLAS)) console.log(`${k.padEnd(15)} gaze: ${f.gaze.join('/').padEnd(12)} plate: ${f.plate.padEnd(6)} ${f.idea}`);
    console.log(`\n${Object.keys(ATLAS).length} folds. Aliases: ${Object.keys(DOC_ALIASES).length}.`);
    process.exit(0);
  }
  const key = arg('fold');
  const doc = arg('document') || key;
  const gaze = arg('gaze');
  const surface = arg('surface');
  if (!doc) {
    console.error('usage: fold.mjs --gaze <up|down|out|across> --document "<text>" [--surface landing|dashboard|theme|terminal] [--diagram] [--json] [--list]');
    process.exit(2);
  }
  if (gaze && !['up', 'down', 'out', 'across'].includes(gaze)) {
    console.error(`usage: --gaze must be one of up, down, out, across (got "${gaze}")`);
    process.exit(2);
  }
  if (surface && !SURFACES.includes(surface)) {
    console.error(`usage: --surface must be one of ${SURFACES.join(', ')} (got "${surface}")`);
    process.exit(2);
  }
  const got = pick(gaze, doc);
  if (!got) {
    console.error(`no fold for "${doc}". Fix the document row; the atlas is at references/folds.md`);
    process.exit(3);
  }
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ key: got.key, gazeFits: got.gazeFits, calibrated: CALIBRATED, ...got.fold }, null, 2));
    process.exit(0);
  }
  console.log(render(got.key, got.fold, surface));
  if (argv.includes('--diagram')) {
    console.log('');
    console.log(`blocking diagram (24x14, legend: # display, = body, | rule, - hairline, @ primary, % plate, . empty, n nav):`);
    for (const line of got.fold.diagram) console.log('  ' + line);
  }
  if (!got.gazeFits) console.log(`\nnote: gaze "${gaze}" is not this fold's affinity (${got.fold.gaze.join(', ')}). Keep the document and apply the gaze as gravity: move the primary action and the visual weight, not the grid.`);
  process.exit(0);
}
