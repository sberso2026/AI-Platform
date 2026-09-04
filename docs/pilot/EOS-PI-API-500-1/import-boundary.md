# Import boundary

```
NO_HEAVY_PARSER_IMPORT_IN_GENERAL_PI_API_PATHS=true
```

## Package exports

| Entry | Path | May load pdf-parse? |
|---|---|---|
| `@rtb/project-intelligence` | domain/contracts/intelligence views | no |
| `@rtb/project-intelligence/access` | `security/access-guard.ts` | no |
| `@rtb/project-intelligence/server` | server services, no parser re-exports | no |
| `@rtb/project-intelligence/parsers` | native-parsers, parser-routing, document-worker | yes |

## General PI API import count

```
PI_HEAVY_PARSER_GENERAL_API_IMPORT_COUNT=0
```

Regression gate: `apps/web/src/__tests__/eos-pi-api-500-1.test.ts` and `packages/project-intelligence/tests/import-boundary.test.ts`.

Webpack still externalizes `pdf-parse` / `pdfjs-dist` / `@napi-rs/canvas` for document routes. Tracing includes are limited to document API paths so intelligence lambdas are not required to ship native parser runtimes.
