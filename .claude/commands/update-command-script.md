---
name: update-command-script
description: Workflow command scaffold for update-command-script in Goat-Bot-V2.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-command-script

Use this workflow when working on **update-command-script** in `Goat-Bot-V2`.

## Goal

Update an individual command script in the scripts/cmds directory, such as fixing bugs, improving code, or changing behavior.

## Common Files

- `scripts/cmds/*.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit the relevant file in scripts/cmds (e.g., unsend.js, bot.js, prefix.js, help.js, uptime.js)
- Commit the changes with a message indicating the update

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.