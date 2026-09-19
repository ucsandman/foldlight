---
type: regex
pattern: '\/\* fold: (ledger|gift-tag|field-notebook|ticket-stub|trail-map|museum-label|broadsheet|recipe-card|setlist|receipt|scoreboard|contact-sheet) \*\/'
match: contains
target: { source: file, path: styles/tokens.css }
---
