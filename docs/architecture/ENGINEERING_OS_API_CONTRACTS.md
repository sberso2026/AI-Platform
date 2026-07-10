# Engineering OS API Contracts

Batch **2.06** — stable REST API surface for Engineering Core and external apps.

**Version:** `2.06`  
**Auth:** Session cookie (Supabase auth) unless noted  
**Base:** `/api/engineering`

## Response Envelope

```json
{ "data": <T> }
```

Error:

```json
{ "error": "message" }
```

## Endpoints

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List tenant projects |
| POST | `/projects` | Create project |
| GET | `/projects/{projectId}` | Get project detail |

**POST body:**

```json
{
  "projectCode": "PRJ-001",
  "projectName": "Example Project",
  "metadata": {}
}
```

### Decisions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/decisions?projectId=` | List decisions |
| POST | `/decisions` | Create decision |
| POST | `/decisions` `{ "action": "approve", "id" }` | Approve (human only) |

### Actions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/actions` | List actions |
| POST | `/actions` | Create action |

### Risks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/risks` | List risks |
| GET | `/risks?view=matrix` | Risk matrix |
| POST | `/risks` | Create risk |

### Issues

| Method | Path | Description |
|--------|------|-------------|
| GET | `/issues` | List issues |
| POST | `/issues` | Create issue |
| POST | `/issues` `{ "action": "promote_to_decision", "id" }` | Promote to decision |

### Technical Queries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/technical-queries` | List TQs |
| POST | `/technical-queries` | Create TQ |

### Lessons Learned

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lessons` | List lessons |
| POST | `/lessons` | Create lesson |

### Timeline & Activity

| Method | Path | Description |
|--------|------|-------------|
| GET | `/timeline?projectId=` | Chronological events |
| GET | `/activity?projectId=` | Activity feed |

### Health & Demo (Batch 2.06)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health report |
| POST | `/demo/seed` | Seed demo data (`metadata.demo=true`) |
| POST | `/demo/reset` | Reset demo data only |

### Search & Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search?q=&type=` | Cross-entity search |
| GET | `/dashboard` | Dashboard aggregates |

## TypeScript

```typescript
import {
  ENGINEERING_API_VERSION,
  ENGINEERING_API_ENDPOINTS,
  isDemoMetadata,
  DEMO_METADATA_MARKER,
} from "@rtb/types";
```

`ENGINEERING_API_ENDPOINTS` provides OpenAPI-style metadata for each route.

## Project Intelligence Usage

External apps filter by `projectId` and write to Engineering Core APIs — never duplicate register storage.

See [PROJECT_INTELLIGENCE_INTEGRATION.md](./PROJECT_INTELLIGENCE_INTEGRATION.md).
