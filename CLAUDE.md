# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Node.js project used for testing Claude Code agents. Entry point is `index.js`.

## Commands

- **Run**: `node index.js`

## Custom Agents

Agent definitions live in `.claude/agents/`

## Agent Skills Mapping

Skills to inject into subagents. The orchestrator reads this mapping and passes skill content inline to each agent type. Append `:full` to a skill name to load AGENTS.md (full rules with code examples) instead of the default SKILL.md (compact index).

| Agent              | Skills                             |
|--------------------|------------------------------------|
| `build-user-story` | `vercel-react-best-practices:full` |
| `run-playwright`   | `webapp-testing`                   |
| `run-lint`         |                                    |
| `run-typecheck`    |                                    |
| `write-tests`      |                                    |

## Learnings

- [write-tests] US-001: When testing React components that use requestAnimationFrame for fade-in effects, mock RAF in beforeEach but use a separate test with a manually-triggered RAF callback to verify the opacity transition from 0 to 1.
- [write-tests] US-001: SVG attribute stroke-width is rendered as a lowercase hyphenated attribute in JSDOM, so use getAttribute("stroke-width") rather than camelCase strokeWidth when querying path elements in tests.
