# Auth contract

```
PI_API_ROUTES_ALWAYS_JSON=true
PI_API_ROUTES_NEVER_LOGIN_REDIRECT=true
PI_API_HTML_LOGIN_REDIRECT_COUNT=0
```

- Unauthenticated API: HTTP 401 `{ ok:false, error:{ code:"unauthenticated", message, requestId } }`
- Unauthorized: HTTP 403 JSON (`forbidden` / entitlement codes)
- Missing workspace: HTTP 403 `workspace_not_assigned`
- Missing project: HTTP 400 `project_required`
- `apps/web/src/middleware.ts` skips `/api/*` for browser login redirects (`isApiRoute`)
- `guardEngineeringApi` returns `unauthenticatedResponse` JSON, never a Location to `/login`

PI entitlement denials are rewritten through `projectIntelligenceGuardError` so commerce HTML/empty bodies cannot leak to JSON clients.
