---
type: regex
pattern: "--(cream|paper|bone|sand|linen|parchment|oatmeal)\b|[\x27\"]Inter[\x27\"]|Fraunces|#6366f1|#8b5cf6|\u2014"
match: not_contains
flags: i
target: { source: file, path: styles/tokens.css }
---
