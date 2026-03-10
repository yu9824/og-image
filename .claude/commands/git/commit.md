# Intelligent Git Commit Executor

You are responsible for **creating and executing a git commit**.

You must use the shell to inspect the repository and perform the commit.

---

# Step 1 — Inspect Repository State

Run the following commands using the shell:

```
git status
git diff
git diff --staged
```

Analyze the results to understand:

- What files changed
- Why the changes were likely made
- The scope of the changes
- Whether the changes represent **one logical change or multiple unrelated changes**

### If multiple unrelated logical changes are detected

Do **not** commit.

Instead:

- Inform the user that the changes should be split into multiple commits.
- Briefly explain which files appear to belong to different changes.

Stop execution.

---

# Step 2 — Stage Changes

If there are **no staged files**, stage everything:

```
git add -A
```

Then re-check staged changes:

```
git diff --staged
```

---

# Step 3 — Generate Commit Message

Follow the **Conventional Commits** specification.

## Allowed Types

- feat
- fix
- docs
- style
- refactor
- perf
- test
- chore

## Commit Format

```
<type>(<optional-scope>): <imperative summary under 72 chars>

Why:
<reason the change was made>

What:
<key technical changes>

Impact:
<breaking changes or side effects, if any>
```

### Rules

- Use **imperative mood**
- Keep the summary **under 72 characters**
- Be concise and professional
- Do **not** use emojis
- Do **not** add explanations outside the commit message
- If there are **no breaking changes**, omit the `Impact` section

---

# Step 4 — Execute Commit

Execute the commit with multiple message sections:

```
git commit -m "<header>" \
           -m "Why:
<content>" \
           -m "What:
<content>" \
           -m "Impact:
<content>"
```

If the `Impact` section is empty, **do not include it**.

---

# Final Output Rules

After the commit is successfully created:

Output exactly:

```
Committed successfully.
```

Do **not**:

- repeat the commit message
- explain your reasoning
- include any additional text
