```markdown
# Goat-Bot-V2 Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and common workflows used in the Goat-Bot-V2 repository. Goat-Bot-V2 is a JavaScript-based bot project built with the Express framework. The guide covers file organization, code style, typical commit practices, and step-by-step instructions for frequent maintenance and development tasks, including updating configuration files, managing bot commands, and maintaining CI/CD workflows.

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `botCommands.js`, `accountManager.js`

**Import Style**
- Use relative imports.
  - Example:
    ```js
    const { getAccount } = require('../utils/accountUtils');
    ```

**Export Style**
- Use named exports.
  - Example:
    ```js
    // In scripts/cmds/help.js
    function helpCommand(args) { /* ... */ }
    module.exports = { helpCommand };
    ```

**Commit Patterns**
- Freeform commit messages, often with a short prefix.
- Average commit message length: ~24 characters.
- Example messages: `Update account.txt`, `Fix help command bug`

## Workflows

### Update Account File
**Trigger:** When you need to update account information, such as credentials, timestamps, or other key-value data.
**Command:** `/update-account`

1. Edit `account.txt` to add or update values, timestamps, or key-value pairs.
2. Commit the changes with a message indicating the update, such as:
   ```
   Update account.txt from dashboard
   ```
3. Push your changes to the repository.

### Update Dependencies or Package Metadata
**Trigger:** When you need to update dependencies, Node.js version requirements, or project metadata in `package.json`.
**Command:** `/update-dependency`

1. Edit `package.json` to update dependency versions or engine requirements.
2. Commit the changes with a descriptive message, such as:
   ```
   Update aminul-new-fca dependency version
   ```
3. Push your changes to the repository.

### Update Command Script
**Trigger:** When you want to modify the logic or implementation of a specific bot command.
**Command:** `/update-command`

1. Edit the relevant file in `scripts/cmds/` (e.g., `unsend.js`, `help.js`).
2. Commit the changes with a message indicating the update, such as:
   ```
   Fix bug in help.js
   ```
3. Push your changes to the repository.

**Example:**
```js
// scripts/cmds/help.js
function helpCommand(args) {
  // Improved help logic
}
module.exports = { helpCommand };
```

### Delete Command Script
**Trigger:** When you want to remove an obsolete or deprecated command script.
**Command:** `/delete-command`

1. Delete the relevant file from `scripts/cmds/` (e.g., `video.js`).
2. Commit the deletion with a message indicating which command was removed, such as:
   ```
   Remove video.js command
   ```
3. Push your changes to the repository.

### Update GitHub Actions Workflow
**Trigger:** When you need to adjust CI/CD settings, such as updating the Node.js version used in workflows.
**Command:** `/update-ci`

1. Edit `.github/workflows/main.yml` to change configuration (e.g., update Node.js version).
2. Commit the changes with a descriptive message, such as:
   ```
   Update Node.js version in CI
   ```
3. Push your changes to the repository.

## Testing Patterns

- Test files follow the pattern `*.test.*` (e.g., `bot.test.js`).
- The testing framework is not explicitly documented; check existing test files for structure.
- To add a test, create a file like `feature.test.js` and write your tests in JavaScript.

**Example:**
```js
// bot.test.js
const { helpCommand } = require('./help');

test('helpCommand returns help text', () => {
  expect(helpCommand([])).toContain('Usage');
});
```

## Commands

| Command           | Purpose                                                      |
|-------------------|--------------------------------------------------------------|
| /update-account   | Update `account.txt` with new values or timestamps           |
| /update-dependency| Update dependencies or metadata in `package.json`            |
| /update-command   | Modify a specific command script in `scripts/cmds/`          |
| /delete-command   | Remove an obsolete command script from `scripts/cmds/`       |
| /update-ci        | Update GitHub Actions workflow configuration                 |
```