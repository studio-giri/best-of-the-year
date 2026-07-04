---
name: create-pr
description: Create a concise, easy-to-read PR description in GitHub
---

Create a GitHub PR for the current branch, written for a reader with no context.

- Title: conventional commit + ticket, e.g. `feat(createRanking): Add error message if username's taken`.
- If any committed file looks unrelated, stop and ask first.
- If there are unstaged files, stop and ask the user about them.
- Show the description and get explicit approval before publishing; re-show after any edit.
- No "Generated with Claude Code" mention.

Use the template below; drop any empty section to keep short PRs short.

<template>
## Why
<!-- Problem/goal in 1-3 sentences; link the ticket. Reader has no context. -->

## What changed
<!-- Meaningful changes as bullets (behavior, not a file-by-file recap). -->

## Choices & tradeoffs
<!-- Non-obvious decisions a reviewer would question: approach vs alternative, shortcuts, constraints. Omit if none. -->

## Notes for the reviewer
<!-- Optional: where to start, focus areas, out-of-scope, deferred follow-ups. -->
</template>
