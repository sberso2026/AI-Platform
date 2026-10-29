# EOS-D6-R5 Equipment Duty and Utility Context Closeout

## Purpose

R5 records the Process equipment-duty, capacity and performance requirements, and utility context that are explicitly required for exact Process cases. One substantive runtime is added. The live runtime count is 5. The architecture runtime count and the architecture equipment-duty count remain 0. The R4 evidence runtime count remains 1 and its live runtime count remains 4. R5 does not calculate equipment duty, select or size equipment, calculate utility consumption, or validate Mechanical design.

## What requirements govern

Every duty or utility record binds to an exact current Process identity and an exact current stream or system revision, including the exact current R2 context for that subject. It also binds to one exact current R3 operating or design case. R4 calculation evidence may be cited at its exact current fingerprint, and a D4 Mechanical equipment revision may be cited when one is supplied. The cited evidence result is not copied into the requirement. A supplied duty stays distinct from an explicitly adopted Process requirement, and the supplied record remains current after adoption. Utility evidence is recorded the same way: a supplied consumption statement is not an adopted or validated utility requirement until a separate governed adoption restates the same value and unit. Canonical currentness, digital thread, and fingerprint are reused. No parallel engine is created.

## Boundaries that stay closed

A Process equipment duty is not Mechanical equipment design, a validated Mechanical selection, or equipment sized by EOS. A capacity or performance requirement is not Mechanical design or validated equipment performance. R5 does not select equipment, a type, a vendor, or a model, and it does not size a pump, compressor, exchanger, vessel, or other Mechanical equipment. A D4 reference does not transfer Mechanical authority, validate Mechanical engineering, mutate a D4 record, or repoint the reference. An energy-balance result does not become an adopted equipment duty, and a hydraulic result does not become a validated pump duty or a Mechanical selection. A utility requirement is not a utility calculated by EOS or a validated utility-system design. Units stay as supplied. Requirements do not propagate across cases or outside their stated applicability. R3 conditions and basis, and R4 evidence, are not rewritten. Equipment duty does not create a relief scenario, a process-safety requirement, or a safeguard. R5 does not create Electrical or I&C design, and it does not validate or mutate Piping. History is preserved by supersession. AI and admin are not Process engineering authority.

## Runtimes that remain zero

Process safety and relief, requirements, interfaces, review, the dedicated currentness runtime, the D9 source contract, and D9 integration remain at count zero. Every Process calculation, including equipment-duty and utility calculation, remains at count zero. Validation, conformance, approval, and certification remain zero. Cross-discipline reasoning remains zero. D7, D8, and D9 remain unstarted. D1 remains incomplete. D2 through D5 remain complete bounded and are not reopened. No schema change. No new dependency.

## Evidence

Engineering OS typecheck passed. Web app typecheck passed. Release-governance typecheck passed. Pilot scoped typecheck passed with the known isolated debt pattern, zero web tsc errors, and zero isolated debt errors. The Engineering OS suite passed 348 files and 1851 tests. Web lint passed with pre-existing warnings. Integration tests in the engineering-review suite passed, 2 tests. The raw security suite failed only on packages/engineering-review/src/migration.test.ts and packages/engineering-review-persistence/src/boundary.test.ts, both the established EOS-A16D import in eos-a16d-generic-binary-retrieval.test.ts. Failure count is 2 and root cause count is 1. Hosted RLS passed with 2 tests and 1 skipped. RLS guard tests passed. Secret scan passed with 618 files and 0 findings. Dependency audit is critical 0, high 0, moderate 1, advisory GHSA-w5hq-g745-h8pq on uuid through exceljs. Release governance tests passed at 164, and the ledger returned ok.

## Next phase

The next phase is EOS-D6-R6-PROCESS-SAFETY-AND-RELIEF-CONTEXT, type PROCESS_SAFETY_AND_RELIEF_CONTEXT. Its scope is to implement governed Process-safety, hazard-study, relief-scenario, safeguarding-requirement and depressuring-context records using exact R1-R5 revisions and supplied evidence. Preserve the distinction between Process hazard/safety context and approved safeguards, relief scenario and relief-device design, Process requirement and I&C functional-safety implementation. Do not calculate relief loads, size relief devices, perform depressuring calculations, perform SIL calculations, design safeguards, validate engineering or perform D9 reasoning. This closeout names that phase and does not start it.
