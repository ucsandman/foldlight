---
type: regex
pattern: "christmas|holiday|snowflake|santa"
match: not_contains
flags: i
target: { source: file, path: index.html }
---
