# EOS-SHELL-JARVIS-2R-TQ security

Query HTML is untrusted user content.

## Sanitization

`sanitizeTqQueryHtml`:

- strips `script`, `iframe`, `object`, `embed`, `link`, `style`
- strips event handlers
- strips `javascript:` / `vbscript:` / `data:text/html`
- drops images without a document id
- rewrites remaining images to the authorized query-image route
- keeps only `p, br, div, ul, ol, li, strong, b, em, i, figure, figcaption, img`
- removes implementation `class` and `data-document-id` from rendered markup

`dangerouslySetInnerHTML` is used only after this sanitizer.

## Image GET

Query-image GET requires Technical Query read entitlement, the document id to be referenced in canonical HTML (or the existing `document_id` link), tenant/workspace match, and a storage path scoped to `${tenantId}/${workspaceId}/`. Bytes stream from the existing `engineering-documents` bucket. No public bucket. No new storage architecture.

## Identifiers

Register and detail visible text must not show UUIDs, raw API paths, HTML source, or CSS class names. Authorized `img src` attributes remain the existing query-image route so images can load; they are not shown as register text.

## Freeze

No RBAC, auth, audit, or notification architecture change. No workflow `applyAction`.
