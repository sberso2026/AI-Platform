# EOS-AI-RELIABILITY-1R — UI observations

Recorded from the authenticated Engineering AI Ask path on https://eos-pilot.rtbea.com.au. No UX redesign in this phase. These feed a later enterprise UX ticket.

Surface: `apps/web/src/components/engineering/ask-engineering-shell.tsx` plus live `POST /api/engineering/ai` responses in `live-certify.json`.

## High

1. **Duplicate evidence / duplicate ingestions.** Control and perturbed each returned five sources. Rank 1–5 in the retrieval trace are the same page-14 guard window under different `chunk_id`s (`not_selected_after_window_dedupe`). The visible source list still mixes the gold excerpt, a near-duplicate figure window, rotating-parts text on page 17, and the committee preface on page 2. Users see several cards that are not distinct clauses.

2. **Answer adds neighbouring requirements.** For “minimum sheet metal guard thickness”, generation states 1.5 mm and also deflection / mesh thickness from the same paragraph, and the source list includes page 17 rotating parts and page 2 committee text. The numeric 1.5 mm is evidenced; the extra cards dilute the answer.

## Medium

3. **Raw document UUID in citation URLs.** Clickable sources use `/engineering/documents/008ff87c-ede6-4007-b94d-480ef54a77e0?page=14&chunk=...`. The card title shows `AS 1755:1986`, but the href is the UUID.

4. **Citation section labels are noisy.** Visible section lines include `Figure 5.1 ).` and `5.3.3 Rotating \tparts. \tThe \tuse \tof \texposed`. Gold page-14 body has `section_path` null, so the sheet-metal 1.5 mm fact is not labelled 5.2.1 in the UI.

5. **Answer hierarchy.** Responses open with `**Answer:**` / `**Why?**` markdown inside the message body, while the shell also has a separate Why? panel and a Sources list. Fact / inference / assumption labelling is inconsistent. Evidence state, authority, retrieval mode (`lexical`), and `scope document` render as a muted metadata line under the answer.

## Low

6. **`rank1_margin:0`.** Duplicate ingestions share the same fusion score. Not shown in the main answer; present under Show details.

7. **Implementation terminology under Show details.** `query_plan:`, `candidate:`, `document_body_hits:`, `lexical_hits:`, `vector_hits:`, `E3 context PARTIAL` are behind the limitations Show details control. Main limitations list is cleaner than earlier builds. `retrieval_only` did not appear on this certified run (`degraded=false`).

8. **Retrieval mode chip.** This run showed `lexical` (accurate for gold recovery). Earlier Preview builds showed `hybrid` whenever embeddings were configured, even when `semantic_score` on the gold chunk was null.

## Not observed on this certified run

- User-facing `retrieval_only` degraded copy (generation succeeded with OpenAI).
- Cross-document UUID/number leak in Current Document answers.

## Out of scope for this phase

Do not change layout, citation chrome, or copy here. Later UX work should hide UUIDs, collapse duplicate chunks, prefer a single clause card, and keep diagnostics in Show details only.
