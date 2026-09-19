---
type: regex
pattern: "snowflake|santa|holly|candy|cranberry|--(holiday|festive|christmas|xmas|snow)|Fraunces|[\x27\"]Inter[\x27\"]"
match: not_contains
flags: i
target: { source: file, path: styles/tokens.css }
---
