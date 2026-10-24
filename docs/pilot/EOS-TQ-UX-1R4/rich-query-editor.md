# Rich Query / Information Required

Query is an engineering-grade contenteditable field, not a second document system.

## Screen editor

- Minimum height 360px, maximum 480px, full content width.
- Vertical scrollbar only when content exceeds the interactive height.
- Paragraphs, line breaks, bullets, numbered lists, paste text, insert/paste images, optional captions.
- Toolbar: Bullets, Numbered, Insert Image.
- Upload states: Uploading image... / Upload complete / Upload failed - Retry.

## Persistence

Sanitized HTML is stored in the canonical `question` column.

Allowed tags: `p, br, div, ul, ol, li, strong, b, em, i, figure, figcaption, img`.

Images persist as `data-document-id` plus an authorized TQ image URL. Base64 is stripped.

Print uses the persisted HTML, not the editor DOM.
