---
name: run-typecheck
description: Runs TypeScript type checking and fixes errors.
tools: Read, Write, Edit, Bash
model: sonnet
---

Before starting, read `CLAUDE.md` for project architecture for shared learnings from previous agent runs.

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
