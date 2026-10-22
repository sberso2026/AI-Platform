# EOS-D2-0 Civil Architecture

## Purpose

D2 is the Civil engineering discipline inside Engineering OS. This phase defines Civil scope, ownership, objects, evidence, authority, lifecycle, currentness, interfaces, and the later implementation sequence. It does not record a Civil object and it does not calculate earthworks, roads, hydrology, or hydraulics.

The parent sequencing decision remains in force. D1 structural pack complete remains no. D1 debt may be remediated in parallel and is not remediated here. D1N stays closed.

## Scope and exclusions

Canonical Civil scope is site development, survey and spatial reference, existing and design surface context, grading, earthworks context, roads and access, pavement context, drainage and stormwater context, channels, culvert context, outfalls, Civil utility corridors, trenches, pits, manholes, crossings, clearance envelopes, and erosion and sediment-control context. Civil also governs its own requirements, assumptions, decisions, evidence, and interfaces.

D2 does not absorb Structural, Geotechnical, Mechanical, Piping, Process, Electrical, or Instrumentation and Control. D9 remains the future owner of cross-discipline intelligence. D2 does not perform that reasoning.

## Ownership and object model

D2 owns these categories: site and spatial reference, surface context, grading and earthworks, roads and access, drainage and stormwater, Civil utility and corridor, erosion and sediment-control context, and Civil governance records.

Adopted object types are CIVIL_SITE, SURVEY_SOURCE, COORDINATE_REFERENCE, SURFACE_REFERENCE, GRADING_ZONE, FINISHED_LEVEL, EARTHWORKS_ZONE, ROAD_ALIGNMENT, ROAD_PROFILE, ROAD_CORRIDOR, PAVEMENT_CONTEXT, DRAINAGE_CATCHMENT, RAINFALL_REFERENCE, DRAINAGE_NETWORK, DRAINAGE_NODE, DRAINAGE_LINK, CHANNEL, CULVERT_REFERENCE, STORMWATER_OUTFALL, DETENTION_REFERENCE, CIVIL_UTILITY_CORRIDOR, TRENCH, PIT, MANHOLE, CROSSING, CLEARANCE_ENVELOPE, EROSION_CONTROL_CONTEXT, CIVIL_REQUIREMENT, CIVIL_ASSUMPTION, CIVIL_DECISION, CIVIL_EVIDENCE_REFERENCE, CIVIL_INTERFACE, and CIVIL_STANDARD_REFERENCE.

Each object has an identity inside tenant, workspace, and project scope, an owning discipline of Civil, explicit relationships by identifier, a cited lifecycle stage, an authority role, provenance, a currentness state, evidence references, and a jurisdiction or standards context where a standard applies. Relationships are declared. They are not inferred from geometry.

## Survey, spatial reference, and surfaces

A Civil spatial context cites a coordinate reference system, horizontal datum, vertical datum, project coordinates, and site boundary. A survey source cites its revision. An existing surface and a design surface are roles of SURFACE_REFERENCE, not a second terrain engine. Provenance and currentness are required. D2 does not fabricate survey or terrain data.

## Grading and earthworks

GRADING_ZONE, FINISHED_LEVEL, and EARTHWORKS_ZONE record Civil intent, constraints, assumptions, evidence references, and change relationships to the surfaces they cite. They do not calculate quantities. Slope stability remains a Geotechnical concern consumed later through the D3 interface, not a D2 calculation.

## Roads and access

ROAD_ALIGNMENT, ROAD_PROFILE, ROAD_CORRIDOR, and PAVEMENT_CONTEXT record geometric criteria, access, and drainage interface citations. They do not implement road-design calculations.

## Drainage and stormwater

DRAINAGE_CATCHMENT, RAINFALL_REFERENCE, DRAINAGE_NETWORK, DRAINAGE_NODE, DRAINAGE_LINK, CHANNEL, CULVERT_REFERENCE, STORMWATER_OUTFALL, and DETENTION_REFERENCE record network identity and the evidence a later calculation would have to cite. They do not implement hydrology or hydraulic calculations. A culvert or detention record is a reference, not a hydraulic result.

## Utility and corridor boundary

CIVIL_UTILITY_CORRIDOR, TRENCH, PIT, MANHOLE, CROSSING, and CLEARANCE_ENVELOPE are Civil spatial context. They may cite a future D4, D5, D6, D7, or D8 object by identity. They do not own that discipline's engineering truth. EROSION_CONTROL_CONTEXT records Civil erosion and sediment-control context without becoming an environmental or geotechnical authority.

## D1 interface

The D2 to D1 interface exchanges site levels, grading near structures, roads and access, drainage interfaces, crossings, and Civil conditions affecting Structural assets. Defining the interface does not make Civil the Structural authority, and it does not make Structural the Civil authority. D1 orchestration remains D1N.

## D3 interface

The D2 to D3 interface is the future governed exchange of soil parameters, groundwater, settlement criteria, excavation and fill criteria, slope criteria, and subgrade criteria against Civil levels, earthworks geometry, and corridor geometry. Civil may cite those inputs. Civil does not become the Geotechnical authority.

## Future D4 through D8 interfaces

Later disciplines need corridor space, crossing geometry, clearance envelopes, trench pit and manhole spatial context, and a citation to the other discipline's object identity. Those requirements are recorded so the Civil model does not close the door. D4 through D8 are not started.

## D9 source contract

Future D9 may consume a Civil source contract that carries object identity and type, exact revision, currentness, authority, provenance, requirements, assumptions, decisions, evidence, interfaces, spatial context, maturity, limitations, and the canonical fingerprint. D9 runtime count remains zero. D2 does not perform multidisciplinary reasoning.

## Requirements, assumptions, decisions, and evidence

A Civil requirement preserves source, applicability, version, authority, and currentness. An authoritative Civil assumption cannot be invented by AI. An AI recommendation is not an authoritative human engineering decision. Evidence present is not engineering validated.

## Authority and human oversight

Authority roles are author or designer, reviewer, approver, Civil engineering authority, lifecycle authority, source-system authority, AI assistant, and administrator. AI is not Civil engineering authority. Admin is not Civil engineering authority.

Human oversight keeps AI assistance, engineering recommendation, engineer review, validation, approval, conformance, and certification distinct. None of those is implemented in this phase.

## Maturity

Civil reuses the existing design stages CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, and DETAILED_DESIGN. It does not create a parallel stage enum. A maturity stage is not engineering validated, not engineering approved, and not certified.

## Currentness, change, provenance, fingerprint, and digital thread

Currentness reuses the existing states CURRENT, STALE, REASSESSMENT_REQUIRED, and SUPERSEDED. No parallel Civil currentness engine is created. Fingerprints reuse fingerprintCanonical. No second fingerprint algorithm is created. The digital thread remains packages/engineering-os/src/digital-thread. No parallel Civil digital thread is created.

Explicit change dependencies are survey source to surface reference, surface reference to grading and earthworks, grading or finished level to road drainage and interface reassessment, and road corridor to drainage, utility, and the D1 interface. A declared dependency requires reassessment. It does not silently repoint history, and it does not authorize inferred propagation beyond the declared edge.

## Jurisdiction and standards

Civil uses the existing jurisdiction profile catalog: global-baseline, australia, eu-eea, united-kingdom, united-states, canada, middle-east, apac-other, and other. Australia, the EU and EEA, the United States, and the Middle East are first-class profiles. The Philippines is not a new profile id. A Philippine project selects apac-other or other until the global catalog adopts a more specific profile. D2 adds no profile id.

A CIVIL_STANDARD_REFERENCE cites standard identity, edition, jurisdiction profile, applicability, project adoption, departures, provenance, and human engineering confirmation. Privacy, human oversight, provenance, least privilege, auditability, regional data governance, and cybersecurity remain the existing global governance foundation. This architecture does not claim legal or regulatory compliance.

## AI boundaries

AI may assist and may produce a recommendation. AI may not invent an authoritative assumption, approve a Civil decision, validate Civil engineering, certify a Civil design, or act as Civil engineering authority.

## Implementation decomposition

Twelve later phases follow this architecture. The first is EOS-D2-R1-CIVIL-IDENTITY-AND-OBJECT-FOUNDATION, type CIVIL_IDENTITY_AND_OBJECT_FOUNDATION. It records one Civil context and the object identities it owns, with tenant, workspace, project, object type, explicit relationships, cited lifecycle stage, provenance, and fingerprint. It does not record survey observations, surfaces, grading, roads, drainage, utility geometry, quantities, or calculations.

The remaining order is survey spatial and surface context, grading and earthworks context, roads and access context, drainage and stormwater context, Civil utility and corridor context, requirements assumptions and change, discipline interfaces and handoffs, review and validation governance, currentness and digital thread, the D9 source contract, and a bounded Civil closeout. This phase does not start the first of those phases.

## Next phase

The next phase is EOS-D2-R1-CIVIL-IDENTITY-AND-OBJECT-FOUNDATION. Civil runtime count remains zero.
