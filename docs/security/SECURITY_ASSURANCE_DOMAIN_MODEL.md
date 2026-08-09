# Security & Assurance Domain Model (Draft)

Status: Phase 15A discovery · no database/runtime

## Canonical concepts

| Concept | Purpose |
| --- | --- |
| SecurityControl | RTB reusable control (catalogue entry) |
| SecurityFrameworkReference | External framework theme/outcome reference |
| SecurityRequirement | Mapped requirement under a control |
| ControlImplementationReference | Pointer to implementing system/owner |
| SecurityEvidenceReference | Provenanced evidence pointer (no sensitive payload) |
| SecurityAssessment | PASS / FAIL / PARTIAL / UNKNOWN for a control |
| SecurityFinding | Normalized finding from external/internal sources |
| SecurityException | Bounded, justified, time-limited exception |
| SecurityRiskReference | Optional risk linkage (not a risk engine) |
| SecurityPostureSnapshot | Dimensional posture (no opaque universal score) |
| ComplianceMapping | Control → framework mapping |
| AssuranceStatement | Internal readiness statement |
| CustomerAssuranceReference | Approved customer-facing assurance artifact ref |
| ExternalAssuranceReference | External audit/cert/pen-test opinion ref |

## Semantics locks

| Lock | Value |
| --- | --- |
| frameworkMapping ≠ certification | true |
| controlPass ≠ auditOpinion | true |
| absence of evidence ≠ PASS | true |
| stale evidence ≠ current assurance | true |
| automated evidence ≠ independent assurance | true |
