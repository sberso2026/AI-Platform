Post-D1I canonical roadmap

This is a new roadmap governance decision. The phase identifier EOS-D1J-0-STRUCTURAL-OPTIMIZATION-CERTIFICATION-ARCHITECTURE did not exist in the repository before this decision. This document records the route after EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT. Earlier roadmap documents remain historical records and are not rewritten.

D1I closeout

EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT remains the D1I closeout. D1I status remains COMPLETE_BOUNDED_WITH_LIMITATIONS. D1I maturity remains STRUCTURAL_DIGITAL_TWIN_BOUNDED_RUNTIME_IMPLEMENTED. This decision does not promote D1I to software engineer validation, method conformance, live structural health monitoring, or an autonomous digital twin. No new D1I runtime feature is added.

D1J identity

The canonical D1J name remains STRUCTURAL OPTIMIZATION CERTIFICATION. D1J runtime remains not started. The historical completion plan describes D1J as certification of a STRUCTURAL optimization study path with human selection, multi-objective and Pareto semantics, no automatic winner, an immutable run manifest, and governed solver references. Dependencies named there are D1B, D1G, and D1D where a design check applies. The post-D1G roadmap records that a certified solver dependency is unmet by the offline SPACE GASS connector, so D1J execution was not started.

Certification-term meaning

In this repository, STRUCTURAL OPTIMIZATION CERTIFICATION means EOS process evidence that a structural optimization study is bound to a jurisdiction and standard binding, exact analysis or solver references, human selection, and an immutable manifest. It does not mean professional engineering certification, regulatory certification, legal product certification, or solver certification. Solver certification remains a D1G dependency. Design-compliance claims remain outside D1J until the applicable D1D or D1L evidence exists.

Architecture and runtime

Architecture readiness is not runtime readiness. Runtime readiness is not engineer validation. Engineer validation is not conformance validation. Offline read-only connector conformance is not a certified live solver.

D1J architecture can define optimization problem identity, scope, design variables, governed bounds, an immutable baseline design reference, objective definitions, constraint definitions, engineering-check references, analysis and evaluation references, candidate identity and lineage, method identity, multi-objective and Pareto semantics, human review and selection, provenance, fingerprints, invalidation, and the certification-evidence boundary without executing an optimization algorithm or a solver. Defining that architecture does not require a certified solver to exist. Using an external solver result for runtime optimization, a pilot optimization claim, or a certification claim does require the D1G certified-solver gate, and that gate fails closed today.

This decision does not authorize D1J optimization runtime, solver execution, candidate generation, automatic selection, or a synthetic or pilot optimization phase. An uncertified solver result is not relabelled as synthetic certified optimization. Fixture tests of a future architecture are not certified optimization.

Optimization authority

An optimization problem is not an analysis model and is not a design candidate. A candidate is an immutable proposed reference with exact variable values, evaluation references, and provenance. A candidate is not a selected design, an approved design, a code-compliant design, or a certified design. Ranking is not approval. A single objective does not automatically win. No universal best-design score is created. A weighted score is not required. No default objective weights exist, and AI cannot set governing weights.

Objectives are not engineering constraints. Constraints reuse existing D1B, D1D, and D1E checks by reference. No parallel steel, concrete, or structural check engine is planned. An optimizer cannot override a failed check. An unknown check is not a pass. The baseline design is not rewritten. AI cannot invent ungoverned design variables or bounds, originate a governing cost rate or carbon factor, waive a failed constraint, or approve a design. AI may later explain trade-offs, summarize candidates, identify missing inputs, suggest questions, and describe Pareto trade-offs. Human engineering approval and human final candidate selection remain required.

A future stochastic method cannot use untraceable randomness. A solver reference cannot float to the latest result. An unvalidated solver result cannot certify an optimized design. Condition state does not automatically reduce capacity. Telemetry is not a control loop. Autonomous generative design is not authorized. D1J references D1I, D1F, and D1G and does not mutate their history.

Authorized next phase

The next phase is EOS-D1J-0-STRUCTURAL-OPTIMIZATION-CERTIFICATION-ARCHITECTURE. Its type is structural optimization certification architecture. It defines the architecture listed above and does not implement optimization runtime, solver execution, candidate generation, automatic design selection, or certification claims.

The exact later sequence is not canonicalized here. A provisional decomposition for that architecture review is a problem and design-variable foundation, an objective and constraint and evaluation contract, multi-objective candidate composition, a certification and conformance evidence gate, and closeout.

Readiness remains layered: architecture ready, fixture-test ready, pilot runtime ready, live-solver runtime ready, engineer validated, conformance validated, and certification eligible. Only the architecture layer is authorized to be defined next. The others are not authorized.

D1G and SPACE GASS

D1G maturity remains EXTERNAL_SOLVER_INTEGRATION_IMPLEMENTED_WITH_SPACE_GASS_READ_ONLY_OFFLINE_CONFORMANCE_VALIDATED. That token is read-only offline connector conformance. D1G is not live validated, not engineer validated, not code-conformance validated, and not a certified solver. The SPACE GASS connector is implemented as read-only. It is not live validated, not engineer validated, and not certified for D1J optimization. No D1G certification phase is invented by this decision. No repository phase currently authorizes the live certification work.

Neighbouring tracks

D1K Cross-Discipline Structural Interfaces remains not started. Its recorded dependencies are D1A and D1F, so D1K is not blocked by the D1J runtime gate. This decision does not start D1K. D1L Structural Global Certification Gate remains not started and depends on the earlier in-scope structural tracks. D1M CAD or BIM intelligence and D1N concept-to-detailed orchestration remain unimplemented boundaries and are not absorbed by D1J.

Discipline order remains D1 structural, D2 civil, D3 geotechnical, D4 mechanical, D5 piping, D6 process, D7 electrical, D8 instrumentation and control, and D9 cross-discipline intelligence. D2 and D3 are not started. The D1 structural pack is not complete.

Debt

Concrete C10 engineer review, D1F system-orchestrator human review, SPACE GASS live validation, D1H engineer validation, D1I engineer validation, and D1I conformance validation remain pending. They block engineer-validated and conformance claims. They do not block D1J architecture. The unmet D1G certified-solver prerequisite blocks D1J runtime, pilot optimization, certification claims, and the D1L global gate. GA security debt remains and blocks general availability. It does not block D1J architecture.
