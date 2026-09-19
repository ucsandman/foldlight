---
type: regex
pattern: '--(bg|surface|ink|accent|muted)\s*:\s*oklch\('
match: "count:5"
target: { source: file, path: styles/tokens.css }
---
