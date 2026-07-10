# Knowledge Graph Foundation

## Overview

Graph foundation for organizational intelligence. Full RAG is Phase 2 — this phase delivers nodes, edges, evidence, and type registries.

## Node Types (system)

document, chunk, task, action, decision, risk, agent_run, workflow, asset, person, organization, project, workspace

## Edge Types (system)

references, supports, contradicts, created_by, assigned_to, affects, belongs_to, derived_from, requires_review, resolved_by

## API

`POST /api/platform/knowledge` — create node (default) or edge (`{ type: "edge", fromNodeId, toNodeId, edgeType }`)

## Rules

- All nodes and edges are tenant-scoped
- High-value AI outputs should create graph nodes (wired in Phase 2)
- Evidence items link to documents, chunks, decisions, risks, actions
