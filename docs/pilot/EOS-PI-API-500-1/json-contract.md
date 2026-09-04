# JSON contract

```
PI_API_ROUTES_ALWAYS_JSON=true
FAILED_DATA_NEVER_COERCED_TO_ZERO=true
```

Success:

```json
{ "ok": true, "data": { } }
```

Controlled failure:

```json
{
  "ok": false,
  "error": {
    "code": "PI_DATA_ERROR",
    "message": "Project Intelligence data could not be loaded.",
    "dataset": "schedule",
    "requestId": "..."
  }
}
```

Not exposed: stack traces, SQL, filesystem paths, secrets, service-role keys.

Client (`fetchPiJson` / `parseApiJsonResponse`):

1. Inspect `response.ok` and content-type
2. Never call `response.json()` blindly
3. HTML / non-JSON → bounded copy, Retry, Show details (request ID + dataset)
4. Failed dataset `data` stays `null` (not `0`, not `[]` unless the server authoritatively returned empty)

Logs: requestId, route, dataset, tenant, workspace, project, layer, error code, duration.
