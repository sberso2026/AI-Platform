# Known limitations

- AI Director generation still fails on Preview. Answers are retrieval-grounded DOCUMENT FACT / INFERENCE / MISSING EVIDENCE under degraded copy. External Engineering AI UAT-3 must not start on this basis.
- Hybrid/vector retrieval is not configured (`HYBRID_RETRIEVAL_PASS=false`). Keyword search is the live path.
- Conveyor register number remains the upload fallback `UPL-AS_1755-1986_Conveyors_-_Design___Fabric`, not a reviewed `AS 1755:1986`. Identity inference exists; this live row was not rewritten.
- PDF `section_path` is often null; clause numbers appear in excerpt text (4.2.1 / 4.2.3 / 7.2.2) rather than as structured citation fields.
- Chunk windows are 1200 characters with overlap, so neighbouring clauses can appear as extra citations.
- Figure handling is caption + nearby text, not structured CAD/geometry.
- Native PDF text only. OCR is not applied silently to scanned pages.
- Upload p95 was not re-measured in the final live run.
- Production was not promoted.
