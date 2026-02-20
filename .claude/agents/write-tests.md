---
name: write-tests
description: Writes unit tests for a user story.
tools: Read, Write, Edit, Bash
model: sonnet
---

Before starting, read `CLAUDE.md` for project architecture and the learnings file at `$LEARNINGS_FILE` (path provided by the orchestrator) for shared learnings from previous agent runs.

**Write learnings**: If you encounter a non-obvious problem during iteration (e.g., a test fails for a reason unrelated to the acceptance criteria — focus issues, timing quirks, selector strategies), append a concise finding to `$LEARNINGS_FILE` after resolving it. Format: `- [write-tests] <story-id>: <one-line finding>`. This helps future agent runs avoid the same pitfall.


## Skills

If the orchestrator provided `<skill>` blocks in your prompt, consult them when writing tests. These contain best-practice patterns for the technology stack that may inform test structure and assertions.

Write unit tests for the provided user story. Use the project's existing test framework and patterns. Run test commands from the app directory provided by the orchestrator.

When complete, set the "test" job status to "done" for this story in the feature file path provided by the orchestrator.

## Logging

At the very start, capture the start time via Bash: `date -u +%Y-%m-%dT%H:%M:%SZ`
Track iterations: start at 0, increment each time you run the test command.
When done, capture end time the same way.

Respond with ONLY a JSON object (no other text):
{"status":"success","startedAt":"<ISO>","finishedAt":"<ISO>","iterations":<N>,"error":null,"skillsConsulted":[]}

On failure, set status to "failure" and error to a brief description.
