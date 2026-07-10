# Workflow Engine

## Overview

Generic, versioned workflow engine usable by all Operating Systems.

## Model

- **workflow_definitions** — Named workflow (slug per tenant)
- **workflow_versions** — Versioned, publishable definitions
- **workflow_steps** — Steps with types: action, approval, human_review, condition, notification, agent, delay
- **workflow_transitions** — Step-to-step flow
- **workflow_instances** — Running instances pinned to version at start
- **workflow_step_runs** — Per-step execution history

## Pre-seeded Workflows

1. **human-review** — Submit → Human Review → Complete
2. **agent-answer-approval** — Agent Output → Approval (no autonomous approval) → Deliver

## API

`POST /api/platform/workflows` with `{ definitionSlug, context }` starts an instance.

## Rules

- Workflow definitions are versioned; instances preserve the version used at start
- Human review and approval steps set instance status to `waiting_review`
- All starts publish `workflow.started` events
