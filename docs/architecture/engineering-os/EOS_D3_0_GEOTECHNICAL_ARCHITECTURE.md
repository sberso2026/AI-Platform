# EOS-D3-0 Geotechnical Architecture

## Purpose

D3 is the Geotechnical engineering discipline inside Engineering OS. This phase defines Geotechnical scope, ownership, objects, evidence, authority, lifecycle, currentness, interfaces to Structural and Civil, the future D9 source contract, and the later implementation sequence. It does not record a Geotechnical object and it does not calculate bearing, settlement, slope stability, earth pressure, or ground improvement.

The Civil track remains complete with the classification COMPLETE_BOUNDED_WITH_LIMITATIONS and a runtime count of eleven. This phase does not reopen D2. D1 structural pack complete remains no. D1N stays closed. D1 debt is not remediated here.

## Scope and exclusions

Canonical Geotechnical scope is site investigation context, boreholes, test pits, investigation locations, geological and soil stratigraphy, soil and rock classification, groundwater observations, laboratory-test evidence, in-situ-test evidence, geotechnical parameter context, foundation recommendation context, bearing and settlement criteria context, excavation and support context, slope and geotechnical stability context, earthworks material suitability, pavement subgrade parameters, ground improvement context, and geohazard context. D3 also governs its own requirements, assumptions, decisions, evidence, interfaces, review and validation governance, and currentness.

D3 does not absorb Structural members, structural analysis, structural load paths, structural capacity, or Structural engineering authority. Civil grading, roads, drainage, Civil utility corridors, and Civil spatial design authority remain D2. Mechanical, Piping, Process, Electrical, and Instrumentation and Control remain future discipline authorities. Cross-discipline intelligence remains D9. D3 does not perform that reasoning.

## Ownership and object model

D3 owns these categories: site investigation context, stratigraphy and groundwater, field and laboratory test context, geotechnical parameter context, foundation excavation and slope context, earthworks subgrade and improvement, geohazard context, and Geotechnical governance records.

Adopted object types are GEOTECHNICAL_SITE_CONTEXT, INVESTIGATION_LOCATION, BOREHOLE, TEST_PIT, STRATIGRAPHIC_LAYER, GROUNDWATER_OBSERVATION, FIELD_TEST_RECORD, LAB_TEST_RECORD, MATERIAL_CLASSIFICATION, GEOTECHNICAL_PARAMETER_SET, FOUNDATION_GEOTECHNICAL_CONTEXT, EXCAVATION_GEOTECHNICAL_CONTEXT, SLOPE_GEOTECHNICAL_CONTEXT, EARTHWORKS_MATERIAL_CONTEXT, PAVEMENT_SUBGRADE_CONTEXT, GROUND_IMPROVEMENT_CONTEXT, GEOHAZARD_CONTEXT, GEOTECHNICAL_GOVERNANCE_RECORD, GEOTECHNICAL_REQUIREMENT, GEOTECHNICAL_ASSUMPTION, GEOTECHNICAL_DECISION, GEOTECHNICAL_EVIDENCE_REFERENCE, GEOTECHNICAL_INTERFACE, and GEOTECHNICAL_STANDARD_REFERENCE.

An unknown or freeform object type does not become authoritative by being named. Each adopted object has an identity inside tenant, workspace, and project scope, an owning discipline of Geotechnical, explicit relationships by identifier, a cited lifecycle stage, an authority role, provenance, a currentness state, evidence references, and a jurisdiction or standards context where a standard applies. Relationships are declared. They are not inferred from proximity, name, or chronology.

## Observation, test, interpretation, and parameter

D3 keeps six semantic classes distinct: raw observation, test result, interpretation or classification, engineering parameter, engineering recommendation, and a validated or approved state. An observation is not an interpretation. A test result is not an engineering parameter. An engineering parameter is not a validated parameter. A recommendation is not an approval. AI must not convert raw investigation evidence into an authoritative parameter.

## Evidence and provenance

Interpreted Geotechnical records cite governed evidence where an evidence source applies. Source kinds are borehole logs, test pit logs, laboratory reports, field-test data, groundwater observations, geological mapping, consultant reports, standards and references, historical site information, and instrumented monitoring. AI cannot fabricate Geotechnical evidence.

## Parameter authority

A GEOTECHNICAL_PARAMETER_SET may cite unit weight, cohesion, friction angle, modulus, Poisson ratio, undrained shear strength, bearing parameters, settlement and compressibility parameters, permeability, subgrade parameters, groundwater level, and rock or soil classification properties. Those fields are governed context. This architecture does not calculate them and does not infer an authoritative value. AI cannot invent an authoritative Geotechnical parameter.

## D1 interface

Future D3 to D1 handoffs may carry foundation soil or rock context, allowable or characteristic parameter context, settlement criteria, groundwater, excavation constraints, pile or foundation geotechnical context, lateral soil parameter context, and geohazard limitations. Future D1 to D3 references may cite structural reactions, foundation geometry, governed load cases, required foundation performance, and retaining-system geometry. Defining the interface does not transfer authority. D3 is not the Structural authority, and D1 is not the Geotechnical authority. No live D1 to D3 reasoning runtime is created.

## D2 interface

The D3 to D2 contract reuses the Civil interface topics already canonicalized for soil parameters, groundwater, settlement criteria, excavation and fill criteria, slope criteria, subgrade criteria, Civil levels, earthworks geometry, and corridor geometry. It does not create a competing contract. Directional subjects that cite those topics are soil classification, earthworks material suitability, excavation constraints, slope criteria, settlement context, pavement subgrade parameters, ground-improvement context, and geohazard context toward Civil, and site or surface context, proposed levels, grading, cut or fill zones, road or access context, drainage context, and Civil corridor or excavation geometry toward Geotechnical. Authority stays with the owning discipline.

## Currentness, fingerprint, and digital thread

Currentness reuses the existing states CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. No parallel Geotechnical currentness engine is created. Fingerprints reuse fingerprintCanonical. No second fingerprint algorithm is created. The digital thread remains packages/engineering-os/src/digital-thread. No parallel Geotechnical digital thread is created.

Future propagation walks explicit declared relationships only. Explicit change dependencies are investigation evidence to stratigraphy and groundwater, stratigraphy or test records to a parameter set, a parameter set to foundation excavation and slope context, and a parameter or context record to the D1 and D2 interface. A declared dependency requires reassessment. It does not silently repoint history, and it does not authorize an inferred dependency graph.

## Review and validation governance

Future D3 records reuse canonical review and validation governance. AI is not Geotechnical engineering authority. Admin is not Geotechnical engineering authority. Validated is not conformant, not engineering approved, and not certified. This phase does not implement a validation runtime.

Maturity reuses CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. A maturity stage is not validation, approval, or certification. Authority roles are author or designer, reviewer, approver, Geotechnical engineering authority, lifecycle authority, source-system authority, AI assistant, and administrator.

## D9 source contract

Future D9 may consume a Geotechnical source contract that carries object identity and type, exact revision, lifecycle, currentness, provenance, authority, assumptions, requirements, decisions, evidence, Geotechnical parameters, investigation context, D1 and D2 interface records, limitations, lineage, review and validation state, and the canonical fingerprint. The source-contract runtime count remains zero. D9 runtime remains unstarted. A defined source contract does not make D9 ready and does not transfer Geotechnical authority.

## Jurisdiction and standards

D3 uses the existing jurisdiction profile catalog and adds no profile id. A GEOTECHNICAL_STANDARD_REFERENCE will cite identity, edition, jurisdiction profile, applicability, project adoption, departures, provenance, and human engineering confirmation when a later phase records one. This architecture does not claim legal or regulatory compliance.

## Runtime prohibition

Geotechnical runtime has not started. Runtime count remains zero. Site investigation, borehole, laboratory test, field test, parameter, foundation calculation, bearing capacity, settlement, slope stability, earth pressure, ground-improvement design, automatic validation, approval, certification, cross-discipline reasoning, and D9 integration counts remain zero. D4 through D9 remain unstarted. No database schema changes. No dependency is added.

## Implementation decomposition

Twelve later phases follow this architecture. The first is EOS-D3-R1-GEOTECHNICAL-IDENTITY-AND-OBJECT-FOUNDATION, type GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION. It records one Geotechnical context and the object identities it owns. It does not record boreholes, test results, stratigraphy, parameters, foundation recommendations, or calculations.

The remaining order is site investigation and evidence context, stratigraphy groundwater and material context, field and laboratory test context, geotechnical parameter context, foundation excavation and slope context, requirements assumptions and change, discipline interfaces and handoffs, review and validation governance, currentness and digital thread, the D9 source contract, and a bounded Geotechnical closeout. This phase does not start the first of those phases.

## Next phase

The next phase is EOS-D3-R1-GEOTECHNICAL-IDENTITY-AND-OBJECT-FOUNDATION. Geotechnical runtime count remains zero.
