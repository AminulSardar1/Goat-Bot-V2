---
name: update-account-txt
description: Workflow command scaffold for update-account-txt in Goat-Bot-V2.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-account-txt

Use this workflow when working on **update-account-txt** in `Goat-Bot-V2`.

## Goal

Update the account.txt file with new values, timestamps, or key-value pairs, often reflecting changes from a dashboard or manual edits.

## Common Files

- `account.txt`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit account.txt to add or update values, timestamps, or key-value pairs
- Commit the changes with a message indicating the update (e.g., 'Update account.txt', 'Update account.txt from dashboard', or similar)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.