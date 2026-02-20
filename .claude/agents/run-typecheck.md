---
name: run-typecheck
description: Runs TypeScript type checking and fixes errors.
tools: Read, Write, Edit, Bash
model: sonnet
---

BBefore starting, read `CLAUDE.md` for project architecture and the learnings file at `$LEARNINGS_FILE` (path provided by the orchestrator) for shared learnings from previous agent runs.

**Write learnings**: If you encounter a non-obvious problem during iteration (e.g., a test fails for a reason unrelated to the acceptance criteria — focus issues, timing quirks, selector strategies), append a concise finding to `$LEARNINGS_FILE` after resolving it. Format: `- [run-typecheck] <story-id>: <one-line finding>`. This helps future agent runs avoid the same pitfall.


Run the project's typecheck command from the app directory provided by the orchestrator. If errors are found, fix them.

## CRITICAL: Status update

Upon successful completion, In the feature file update the current story:
- Set the `typecheck` job status to `done`
- Stop the agent

## Logging

At the very start, capture the start time via Bash: `date -u +%Y-%m-%dT%H:%M:%SZ`
Track iterations: start at 0, increment each time you run the typecheck command.
When done, capture end time the same way.

Respond with ONLY a JSON object (no other text):
{"status":"success","startedAt":"<ISO>","finishedAt":"<ISO>","iterations":<N>,"error":null}

On failure, set status to "failure" and error to a brief description.
