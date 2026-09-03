# EOS-AI-DOC-QA-1 — Engineering Document Question Answering Reliability Engine

**Host:** https://eos-pilot.rtbea.com.au  
**Preview only.** Production was not promoted. External users were not invited.

## A. Failure trace (pre-remediation)

Both founder questions retrieved the 4.5 m body window, but **rank 1 was neighbouring clause (d) force (70 N / 230 N)**. The 4.5 m sentence was selected at fused rank 8. Generation ran (OpenAI) and answered the force requirement. Sufficiency did not abstain. Degraded mode was the previously observed UX when generation failed; this run showed wrong-fact generation instead.

`LANYARD_FAILURE_LAYER=evidence_selection+grounded_generation`  
`LANYARD_FAILURE_ROOT_CAUSE=Neighbouring same-clause force text outranked the asked interval property; generation used the first evidence window; no structured MAX-interval extraction or claim verification.`

Correct 4.5 m chunk: retrieved, not rank 1, selected, passed to generation. Provider executed. Response parsing succeeded. Sufficiency did not reject. Extractable fact was discarded by ranking/generation, not by missing retrieval.

See `failure-trace.json`.

## B–J. Engine

Generic query planner now emits intent, subject (including OR-alternatives), property, constraint, qualifier, unit expectation, relationship, and expected answer type. Fragments, commands, design statements, and inverted requirements are first-class.

Retrieval classifies DIRECT / SUPPORTING / CONTEXTUAL / IRRELEVANT and prefers DIRECT evidence for generation. Normative extraction reads `not exceeding` / `not less than` / `shall` patterns. Claim verification removes unsupported numerical requirements. If generation fails or emits unsupported claims, the structured evidence-derived answer is shown without “Engineering AI could not generate an answer.”

UI: ANSWER / BASIS / SOURCE. Diagnostics stay under Show details.

Production retrieval/QA files do not contain AS 1755, 4.8.7.6, 4.5 m, lanyard, pull wire, or founder question strings.

## K–N. Evaluation

Five authorised fixture documents, 256 supported questions, 50 unsupported. Splits: development / founder-style / blind holdout. Offline metrics are in `benchmark-results.json`. Pilot quality gates are **not** fully met on the holdout/numerical extractor; live founder regressions are the operational gate.

## Q. Shared intelligence risk

`SHARED_QA_COMPONENTS=query planner, lexical/hybrid retrieval, evidence assembly, AI Director generation, claim verification, citation assembly`  
`AFFECTED_INTELLIGENCE_MODULES=Project Intelligence documents; Engineering OS Ask/E2/E5; AI Director; Memory (E7) fold-in; E9 capability routing`

Do not treat meeting intelligence, inspection AI, asset intelligence, or digital twin as certified by this ticket. Each needs its own evaluation pack.

## Return

See repository HEAD / Preview build identity after deployment. Founder acceptance is still required.
