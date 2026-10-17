# EOS-D1G-R5 SPACE GASS connector hardening and D1G closeout

This phase hardens the existing SPACE GASS read-only connector and closes the D1G external solver integration track. It does not execute SPACE GASS, edit a model, or add an engineering formula. Offline connector conformance is not live provider validation. Live connectivity is not structural model validation. Closeout is not engineer validation, code conformance, or general structural design.

## Phase inventory

D1G-R1 is the provider-neutral adapter in packages/engineering-os/src/structural-systems/solver-adapter.ts, with contracts in packages/types/src/structural-systems-d1g-r1.ts, tests in eos-d1g-r1.test.ts, and the R1 architecture note. Runtime count is 1. It translates provider records into D1F inputs. It does not solve a structure.

D1G-R2 is the result package and secure ingestion in result-package.ts, with contracts in structural-systems-d1g-r2.ts, the version 1 example and schema, tests in eos-d1g-r2.test.ts, and the R2 note. Runtime count is 1. Package limits remain security and test bounds.

D1G-R3 is the provider selection record in provider-selection.ts and eos-d1g-r3-provider-selection.json, with contracts in structural-systems-d1g-r3.ts, one test, and the R3 architecture note. Maturity remains first provider selected and connector architecture defined. SPACE GASS, local REST, read-only, API generation v1.

D1G-R4 is the connector in space-gass-connector.ts, the mapping in space-gass-mapping.ts, the transport in space-gass-transport.ts, contracts in structural-systems-d1g-r4.ts, tests in eos-d1g-r4.test.ts, and the R4 note. One commercial connector runtime. Solver executions 0. Model modifications 0. New formulas 0. Maturity at the end of R4 was offline conformance validated. R5 keeps that connector and corrects the version claim.

D1F-R2 raw and normalized result contracts are reused. No parallel adapter, package, mapping, normalization engine, or result-authority model is created.

## Canonical chain

A synthetic SPACE GASS snapshot is replayed by the R4 connector, mapped once, handed to the R1 adapter, serialized as an R2 version 1 chunk, ingested by the R2 pipeline, and normalized by D1F. The connector cannot govern. Completed is not convergence. Provider case titles do not become EOS case ids. Provider object ids do not become EOS member ids without a governed mapping.

## Version evidence

The official versioning page states that current HTTP paths use /api/v1 and that SDK package versions mirror desktop versions. Its table lists desktop 15.0.2 and 15.1.0 beside the matching SDK packages. Those rows are pairing examples. They are not a tested REST compatibility matrix. The API overview states an install prerequisite of SPACE GASS 14.5 or later. That sentence is not converted into an open-ended accepted range. Evidence status is partially proven. The supported contract is API generation v1. Desktop version compatibility is not yet validated. A missing version fails closed. A non-v1 API generation fails closed. A reported desktop version is stored for provenance and is not accepted as compatible. SDK examples are not used as REST proof.

The canonical base URL remains http://127.0.0.1:34560/api/v1. The authentication and versioning pages also document http://localhost:34560/api/v1. Both loopback forms are allowed. No other host is allowed.

## Endpoint evidence

GET /job/units is named by the concepts page for job units. GET /job/structure/nodes and GET /job/structure/members are named by the versioning page examples and the concepts entity table. GET /job/structure/node-restraints, GET /job/loads/load-cases, and GET /job/loads/combination-load-cases are the concepts entity paths. GET /job/analysis/runs/{runId} is the concepts poll for Completed, Failed, or Cancelled. GET /job/query/analysis/static/node-reactions and GET /job/query/analysis/static/member-intermediate-forces are named by the official OpenAPI schema and by the documented SDK query methods. All of these remain GET only.

The official schema also names GET /job/query/analysis/static/member-end-forces. That path is not on the allowlist. A station at distance zero or at member length remains a station. Reaction moment component names mx, my, and mz appear on the official node-reaction schema. They are not imported and are not treated as zero.

## Native scale

Official query parameters for the collections used here include loadCases, members, nodes, nodeType, offset, and limit. Page, cursor, and continuation tokens are not used. EOS package chunking is a separate serialization step. It does not bound the provider HTTP response. The native response limit remains 262144 bytes. Live collection reads use offset and limit, with a governed page size of 16 and at most 32 pages, one request at a time. A short page ends the read. A missing offset or a duplicate result identity makes the affected scope incomplete. The same logical rows produce the same identities regardless of page boundaries. Scale classification is bounded filtered pilot. It is not a production candidate. A single filtered response can still exceed the byte limit, and that response fails closed.

## Security boundary

Only GET is issued. Mutating endpoints, model edits, solver runs, and process launches are absent. The caller cannot supply an arbitrary path or host. The raw authority must be exactly 127.0.0.1, localhost, or bracketed IPv6 loopback on the governed port. Decimal, hexadecimal, DNS, userinfo, and mapped addresses are rejected. Redirects are not followed. Timeouts and the byte limit remain. Retries are only for timeout or 503, at most two retries. The connector is not exported from the browser entry. There is no generic localhost proxy. A live read requires both the explicit live switch and the feature flag d1g.spaceGass.readOnlyConnector. The flag defaults to false and does not grant engineering authority. No live test ran. Live project data was not committed.

## Semantics preserved

Job units are read from the units response. Local x runs from node A to node B. Local y and z are not design major and minor. Sign factors stay in the versioned mapping manifest. Positive native axial remains compression. Load cases and combinations are extracted and stay unapproved until an explicit governed map is supplied. Member station forces keep native components, station distance, and node A as the station origin. Support reactions keep Fx, Fy, and Fz at the provider node. Warnings for cases that were not analysed stay warnings. Object ids are snapshot scoped. Cross-revision stability is not claimed. Nonlinear convergence stays unresolved and cannot govern.

## Provenance, fingerprints, and staleness

The bundle provenance lists the normalized result, raw result, neutral adapter, connector, provider result, model and run, native snapshot, provider version, connector version, and mapping manifest. Fingerprints cover the selection record, mapping manifest, native snapshot, connector bundle, each chunk, the R1 execution, and the R2 package. The same inputs reproduce the same fingerprints. A source, desktop version, connector version, mapping, or object-mapping change changes the bundle fingerprint. Chunk order does not. A topology change adds the existing D1F stale-upstream finding. Because Completed is not convergence, that finding does not by itself become a clean stale completeness label while a nonconverged finding is also present.

## Capability, maturity, debt, and claims

The provider-neutral adapter, secure package ingestion, provider selection, and read-only connector are implemented. Live connectivity is not validated. Station-force and reaction-force import are implemented within the bounded pilot. Reaction moments, member-end import, major and minor design axes, nonlinear convergence, model edit, and solver execution are not implemented. Multi-provider support is not implemented.

Maturity of the closeout is external solver integration implemented with SPACE GASS read-only offline conformance validated. Architecture, runtime, and offline conformance are distinct from live connectivity, engineer validation, and code conformance. Engineer-validated and conformance-validated connector counts remain 0. Live validated connector count remains 0.

Debt that remains: live SPACE GASS validation pending, reaction moments unresolved for import, member-end endpoint not enabled, nonlinear convergence unresolved, generic major and minor mapping unresolved, cross-revision object identity unknown, precise REST desktop compatibility unvalidated, production-scale retrieval limited, only one commercial provider connected, solver execution absent, model edit absent, D1F steel dispatch limited to D1D_EU_TENSION, concrete human review pending, D1F human review pending, and the existing GA security debt. None of those debts is closed by this phase. Live validation debt blocks a live-connector claim. The unresolved semantics and the single-provider limit block production pilot, general structural design, engineer-validated, and conformance claims. GA security debt blocks general availability. They do not block this offline closeout.

Product claims that are true: external solver adapter foundation, external result package ingestion, SPACE GASS read-only connector, and SPACE GASS offline replay. Station forces and reaction forces are bounded imports. Live connectivity, analysis execution, model authoring, reaction moments, member-end results, nonlinear convergence, and multi-provider support are not claimed.

A second commercial provider would be useful later to test that the neutral adapter is not SPACE GASS shaped. The repository roadmap does not make that the next phase.

## Next phase evidence

D1F-0 lists D1G as the last numbered item in the structural systems sequence and names D1H condition assessment and D1I structural digital twin only as unimplemented boundaries. It does not assign a phase identifier or scope for the work after D1G closeout. The older structural completion plan lists D1H Inspection and Condition after D1G in a recommended order, and its own next step is still D1A. That plan does not define a current post-closeout phase identifier. The successor is therefore not determinable from the repository. The next action is a read-only roadmap audit. This closeout does not invent a D1H phase number.

## Release

The capability manifest is the existing structural manifest. No parallel manifest is created. Release classification stays internal. Validation state stays not validated. Conformance state stays an intended profile. No database migration is added. The feature flag stays off.
