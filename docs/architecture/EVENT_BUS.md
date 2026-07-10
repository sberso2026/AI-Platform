# Platform Event Bus

## Overview

Internal event system for decoupled communication between kernel services and future Operating Systems.

## Components

- **EventBusService** — Publish, dispatch, replay
- **EventSubscriber** — In-process handler interface
- **event_subscriptions** — Database-backed subscription registry

## Event Types

`tenant.created`, `workspace.created`, `plugin.installed`, `document.uploaded`, `agent.run.started`, `agent.run.completed`, `review.required`, `decision.created`, `risk.created`, `workflow.started`, `workflow.completed`

## Rules

- Events are **immutable** after creation (DB triggers block update/delete)
- All events are **tenant-scoped**
- Failed dispatches logged to `event_dispatch_attempts`
- Admins can **replay** events via `EventBusService.replay()`

## Integration

Notifications subscribe to `review.required`, `agent.run.completed`, and `workflow.failed` events automatically when kernel is initialized via `createPlatformKernel()`.
