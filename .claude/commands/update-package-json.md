---
name: update-package-json
description: Workflow command scaffold for update-package-json in Goat-Bot-V2.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-package-json

Use this workflow when working on **update-package-json** in `Goat-Bot-V2`.

## Goal

Update the package.json file to change dependencies, engine versions, or other configuration settings.

## Common Files

- `package.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit package.json to update dependency versions or engine requirements
- Commit the changes with a message indicating the update (e.g., 'Update package.json', 'Update aminul-new-fca dependency version', etc.)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.