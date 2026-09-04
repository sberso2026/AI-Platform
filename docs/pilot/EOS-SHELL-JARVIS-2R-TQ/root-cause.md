# EOS-SHELL-JARVIS-2R-TQ root cause

## Stored representation

Canonical Technical Query query/information-required content is stored as HTML in `engineering_technical_queries.question`. The rich editor persists figures of the form:

```html
<figure class="tq-query-figure" data-document-id="{document-id}">
  <img data-document-id="{document-id}" src="/api/engineering/technical-queries/{tq-id}/query-images/{document-id}" />
  <figcaption>…</figcaption>
</figure>
```

Title, status, ownership, due date, and metadata remain on the existing TQ row. This ticket does not rewrite canonical `question` HTML.

## Register representation (defect)

The Preview register interpolated `item.question` / `item.title` as React text. React therefore showed the markup literally: `<div>`, `<figure>`, `class="tq-query-figure"`, `data-document-id`, UUIDs, and `/api/engineering/technical-queries/...` paths.

A second leak exists when a blank title falls back to `question`.

`TQ_RAW_HTML_REGISTER_ROOT_CAUSE=Canonical question is HTML; register interpolated question/title as text children instead of a plain-text summary projection.`

## Detail representation

Detail now sanitizes canonical HTML and renders supported structure (paragraphs, lists, images, captions) through `TqQueryHtml`. Authorized query-image GET serves bytes already referenced in stored HTML. Rendered `img` tags do not keep `data-document-id` or CSS implementation classes as visible text.

## Print representation

Print uses the same sanitized renderer, full canonical query text, images, captions, response, basis, and closeout. Print CSS removes clipping and internal scroll boxes.

## What was not changed

Canonical TQ model, list/create JSON, ownership, workflow, RBAC, auth, audit, notifications, Engineering Core, Project Intelligence, AI, Knowledge Graph, and storage architecture.
