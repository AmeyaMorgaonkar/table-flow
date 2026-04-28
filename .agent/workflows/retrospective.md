---
description: Post-milestone learning capture for TableFlow — what worked, what hurt, generate instinct files
---

### Step 1 — Ask What We Are Retrospecting
"Which milestone or feature are we reviewing?"

### Step 2 — Gather Feedback
Ask: "What went well? What was painful or slow? Any patterns you noticed repeating?"

### Step 3 — Summarize the Session
Write a brief summary: decisions made, problems encountered, patterns observed.

### Step 4 — Generate Instinct Files
For any pattern that repeated 3+ times, create .agent/instincts/[kebab-name].md with:
- trigger: when [situation]
- confidence: 0.0-1.0
- action: specific thing to do
- evidence: observed N times

### Step 5 — Promote to Rules or Skills
Ask: "Should any of these instincts become a permanent rule or skill?"
If yes: update .agent/rules/ or create a new skill.

### Step 6 — Update Constitution
If any architecture or scope decisions changed, update PROJECT_CONSTITUTION.md.
// turbo
Run `git add -A && git commit -m "docs: retrospective instincts for [milestone]"`
