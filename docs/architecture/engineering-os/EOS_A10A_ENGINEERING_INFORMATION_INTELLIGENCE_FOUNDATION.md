# EOS-A10A Engineering Information Intelligence Foundation

Status: **IMPLEMENTED** for staging / non-production (`rntonzigxwxcjlcsadip`). Additive after closed EOS-A9. Does not rewrite A9 historical certification.

Engineering Information Intelligence does not own engineering truth. Canonical engineering domains own their records. Information Intelligence determines, through governed and explainable policy:

- what information applies
- where it came from
- which source is authoritative for a stated purpose
- which revision/version is applicable
- whether it is current, stale, or superseded
- whether authority is ambiguous
- how that information participates in the Engineering Digital Thread

It must never silently convert source authority into engineering approval, technical correctness, safety, or compliance.

## Purpose

A10A answers: what engineering information exists, which canonical object owns it, what type it is, where it originated, which project/system/asset/discipline/lifecycle context it applies to, which revision/baseline applies, whether it is current/stale/superseded, which source is authoritative for a configured purpose, whether authority is ambiguous, what evidence establishes provenance, what depends on it, what replaces it, and whether it is suitable for a configured engineering use.

It does **not** decide whether engineering is correct, safe, code compliant, document-approved, or authorized for construction unless those conclusions are supported by separate canonical governed evidence.

## Engineering Information vs adjacent concepts

| Concept | Owner | A10A role |
| --- | --- | --- |
| Engineering Information | Information Intelligence | Governed reference/context only |
| Document | Document domain | Canonical artifact; referenced, not copied |
| Deliverable | Deliverable Intelligence | Expected output; may consume authority |
| Evidence | owning assertion domain | Supporting information for an evaluation |
| Configuration Baseline | Configuration | Frozen governed state |
| Digital Thread | Digital Thread | Relations/provenance between canonical objects |
| Digital Twin | Twin | Operational/physical state |
| Knowledge Graph | Platform KG projection | Derived accelerator; **not SOT**; KG reads remain **OFF** |
| Search | Engineering Search | Retrieval capability; reused, not replaced |

## Source ownership

`EngineeringInformationRef` identity is `tenant_id + workspace_id + project_id + source_object_type + source_object_id` plus governed context metadata. Canonical objects remain source of truth:

Document, Model, Dataset, Analysis Result, Requirement, Assumption, Decision, Interface Information, Configuration Baseline, Review Package, Deliverable, External Reference.

A10A does **not** create a second document store, analysis store, revision store, transmittal system, or search engine.

## Classification and type catalog

Classification reuses existing discipline, system, asset, lifecycle, and configuration identities. The bounded catalog is small and governed (`DESIGN_CRITERIA`, `LOAD_DATA`, `MATERIAL_PROPERTY`, and related types). There is no arbitrary executable taxonomy.

## Applicability and effectivity

Applicability uses existing canonical objects (project, system, asset, discipline, package, lifecycle stage, configuration baseline). Effective dates, revision, and baseline pinning are composed from source-domain facts when those domains provide them. File modified dates are never used.

## Authority model

Authority is **purpose-specific**. There is no universal rule such as “document always overrides model”. `AUTHORITATIVE_FOR_PURPOSE` means the governed information source to use for a configured purpose. It is **not** `ENGINEERING APPROVED`.

Purposes include `FOR_DESIGN_INPUT`, `FOR_COORDINATION`, `FOR_ENGINEERING_REVIEW`, `FOR_CONFIGURATION`, `FOR_CONSTRUCTION_REFERENCE`, `FOR_COMMISSIONING`, `FOR_OPERATIONS_REFERENCE`.

`InformationAuthorityPolicy` is versioned. Historical resolutions retain `policy_id` and `policy_version`. Policy mutation is admin-only and AAL2-gated via existing Engineering Settings identity-assurance. AI may suggest, explain, and surface ambiguity. AI may **not** silently select or override authority.

## Resolver

`EngineeringInformationAuthorityResolver` is deterministic and explainable. Outcomes include `RESOLVED`, `NO_SOURCE`, `NO_ELIGIBLE_SOURCE`, `NO_AUTHORITATIVE_SOURCE`, `AMBIGUOUS`/`CONFLICT`, `SOURCE_STALE`, `SOURCE_SUPERSEDED`, and `POLICY_NOT_CONFIGURED`. Callers cannot submit `authoritative=true`, `current=true`, `approved=true`, or `sourcePriority`. Server resolves authority. Competing eligible sources produce explicit conflict with **no automatic winner**. Missing required sources produce `NO_AUTHORITATIVE_SOURCE` with no fabricated fallback.

Authority conflict is competing governed claim, not LLM semantic contradiction.

## Freshness, staleness, supersession, provenance, lineage

Freshness (`CURRENT`, `POTENTIALLY_STALE`, `STALE`, `SUPERSEDED`, `UNKNOWN`) composes canonical source-domain facts (Document A9D revision authority, Analysis staleness, Decision supersession, baseline membership, effective period). Staleness reasons remain owned by the source bounded context. Supersession reuses governed `SUPERSEDES` relations. Provenance is source-domain provenance, not a second audit log. Lineage reuses `USES`, `DEPENDS_ON`, `SUPPORTED_BY`, `BASED_ON`, `SUPERSEDES`, `VERIFIED_BY`.

## Composition

- **Digital Thread:** Information is context over thread nodes; it is not the graph.
- **Platform KG:** not required; KG reads remain OFF.
- **Document:** expose revision/status mapping/authority; no DMS.
- **Deliverable:** authority/freshness visible; authority alone does not complete review, configuration, or approval.
- **Lifecycle:** optional `AUTHORITATIVE_INFORMATION_REQUIRED` criterion; profile controls applicability; not every gate requires A10A.
- **Requirements / Assumptions / Interfaces / Analysis / Decisions:** consume or pin authority; do not replace verification, invalidation, interface lifecycle, A7B execution, or decision reversal.
- **Assurance:** deterministic conditions only (`AMBIGUOUS_INFORMATION_AUTHORITY`, `NO_AUTHORITATIVE_INFORMATION_SOURCE`, `STALE_AUTHORITATIVE_INFORMATION`, `SUPERSEDED_INFORMATION_STILL_REFERENCED`, `INFORMATION_AUTHORITY_POLICY_MISSING`). No automatic Finding, Issue, defect, or compliance conclusion.
- **Search:** enrich existing hits; no new engine.
- **External sources:** governed references only. Connectors are not implemented. SharePoint/email/vendor/API data is not authoritative unless policy says so.

## Security / RLS / AAL2 / UI

Protected policy mutations reuse closed A9 identity-assurance (AAL2). Information routes are Engineering OS core, not a PI SKU. RLS: same-workspace authorized read; other workspace/tenant/anonymous deny; engineers cannot mutate policy; admins can; hidden source metadata does not leak across workspaces. UI: `/engineering/information` and `/engineering/settings/information` using existing `eos-select` tokens. No traffic-light authority score. Staging fixture-list hygiene remains deferred.

## Tests

Unit: resolver, conflict, no-source, stale, policy version, cross-discipline, Digital Thread, Deliverable, Assurance, Analysis pin, lifecycle composition, search enrichment, performance metrics. Live JWT/RLS against staging. Selector contrast regression reuses A9F-G1 `eos-select`.

## Limitations

- Connectors (SharePoint, BIM, ERP, survey, vendor systems) are not implemented.
- Technical contradiction intelligence remains future work.
- A7C real-tool execution remains `DEFERRED_EXTERNAL_DEPENDENCY`.
- `READY_FOR_CONTROLLED_PILOT` remains **NO**.
- Staging RLS fixture project-list hygiene remains deferred.
- No production deployment.
