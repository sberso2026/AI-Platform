# Print validation

Screen editor and Print Preview are different renderers.

## Screen

Query editor: `min-height: 360px; max-height: 480px; overflow-y: auto`.

## Print

Source of truth: persisted canonical `question` HTML (`TqQueryHtml`).

Print CSS:

- `height: auto`
- `max-height: none`
- `overflow: visible`
- figures/images `page-break-inside: avoid`
- captions stay with the figure
- images `max-width: 100%; height: auto`
- toolbar not printed

The print view itself remains vertically scrollable. Browser Print uses A4. Long text may span pages; images should not clip horizontally.

`tqQueryPrintTokens(html)` compares plaintext, image ids, and captions so screen overflow cannot hide printed content.
