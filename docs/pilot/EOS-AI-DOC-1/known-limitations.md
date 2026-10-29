# Known limitations

- Native PDF text is preferred. OCR is not applied silently to every PDF; scanned pages may remain partial until OCR policy applies.
- Figure understanding is caption + nearby text (and readable annotations already in the text layer). It is not authoritative structured CAD/geometry data.
- DOCX extraction is mammoth raw text; complex drawings inside DOCX may be incomplete.
- Live Preview UAT used the authorised TXT fixture. PDF and DOCX parsers are covered by unit tests, not by a second live file in this run.
- Semantic/vector retrieval requires an explicit governed embedding key. Preview ran keyword search (`ready_with_warnings` / AI searchable Yes). The document UI says keyword search is active; implementation jargon is under Show details.
- Workspace-wide document-body search is not enabled; Ask uses Current Document or Current Project scope for body retrieval.
- Production is not promoted by this ticket.
