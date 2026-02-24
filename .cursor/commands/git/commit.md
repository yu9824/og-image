# Intelligent Git Commit Executor

You are responsible for creating AND executing a git commit.

## Step 1 — Analyze Repository State

Run:

- git status
- git diff
- git diff --staged

Understand:
- What changed
- Why it changed
- Scope of impact
- Whether changes are logically grouped

If multiple unrelated logical changes exist:
- STOP
- Inform the user to split commits
- Do not commit

---

## Step 2 — Stage Changes

If nothing is staged:
- Stage all modified and new files using:
  git add -A

---

## Step 3 — Generate Commit Message

Follow Conventional Commits.

### Allowed types

- feat
- fix
- docs
- style
- refactor
- perf
- test
- chore

### Format

<type>(<optional-scope>): <imperative summary under 72 chars>

Why:
- <reason>

What:
- <key technical changes>

Impact:
- <breaking changes or side effects if any>
  (omit if none)

Rules:
- Use imperative mood
- Be concise but professional
- No emojis
- No explanations outside the commit message

---

## Step 4 — Execute Commit

Execute:

git commit -m "<header>" \
            -m "Why:
<content>" \
            -m "What:
<content>" \
            -m "Impact:
<content>"

If Impact section is empty:
- Do not include it

---

## Final Output

After committing:
- Output only: "Committed successfully."
- Do not repeat the commit message
- Do not explain your reasoning
