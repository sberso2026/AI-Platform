# Query image storage

Images in Query / Information Required are controlled TQ evidence.

## Storage

- Signed upload into the existing private `engineering-documents` bucket.
- TQ-specific MIME policy: PNG, JPEG, WEBP. Extension **and** magic bytes.
- Document type `technical_query_attachment`.
- Object link `relationship=query_image`.
- Retrieval: `GET /api/engineering/technical-queries/:id/query-images/:documentId` after TQ authorization.
- Bytes are streamed through that route. Storage paths and service-role keys are not exposed to the browser.

## What is not done

- No base64 in TQ metadata.
- No second file repository.
- Global document register policy remains PDF/TXT/DOCX. Query images do not loosen that gate.
- Removing an image from a Draft editor does not destroy the stored file. Submitted query HTML is locked.
