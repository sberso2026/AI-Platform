# EOS-D1G-R3 Provider Selection and First Connector Architecture

## Decision

The first external structural-analysis provider selected for a future read-only connector is SPACE GASS. The product is SPACE GASS. The integration mode is a local REST read of an already available job. This is an integration decision. It does not make a SPACE GASS result trusted, a model validated, or an engineering approval. Provider brand is not result authority. No popularity or unsourced demand score was used.

The commercial connector is not implemented. The feature flag d1g.spaceGass.readOnlyConnector defaults to off. No vendor API, SDK, or command-line call exists in this phase. No solver runs and no model is edited.

Evidence was read on 2026-10-17 from the vendor pages listed below. Community pages were not used as governing evidence. Manual text is not copied into this repository. Plate-design calculations that appear in the vendor sign page are not reproduced and are not part of this connector.

## Candidate set

SPACE GASS is a candidate because the repository already has a fail-closed catalog entry, host discovery, and an uncertified solver boundary. The structural completion plan names a later live proof for that boundary. Those records are candidacy evidence. They are not certification and they are not a prior D1G connector.

ETABS, SAP2000, STAAD, Robot, RFEM, and Strand7 are named in the D1D external-solver boundary as uncertified unless independently certified later. That list is the source of their candidacy. It does not rank them.

## Evidence policy

Governing evidence is repository evidence plus official vendor documentation for the API, exports, versions, and licensing notes that were reachable. Blogs, forums, and unsourced memory are not governing evidence. A missing semantic is UNRESOLVED and the future mapping for that semantic fails closed.

## Official source register

SPACE GASS, product SPACE GASS, access date 2026-10-17.

Product page, title SPACE GASS API, https://spacegass.com/api. Describes a local REST service, Python and C# SDKs, OpenAPI, read-only model and result access for a registered user, and an API module for opening, running, creating, and automating. Pro tier subscriptions include the API module. Perpetual licences are described as a paid add-on. No legal conclusion is drawn from that commercial text.

Concepts, https://api.spacegass.com/docs/concepts. One active job. Nodes, members, plates, sections, materials, node restraints, load cases, and combination cases. Units come from the job and are read with GET /job/units. Analysis runs report Completed, Failed, or Cancelled. Result queries warn when a requested case was not analysed. Most entity ids are allocated by the product. Load-case ids are supplied by the user.

Versioning, https://api.spacegass.com/docs/versioning. Current HTTP paths use /api/v1. SDK package versions are documented to mirror desktop versions. The page gives 15.0.2 and 15.1.0 as pairing examples. It does not state a minimum desktop version. Versions outside a tested pairing fail closed.

Authentication, https://api.spacegass.com/docs/authentication. The documented local service currently uses no API key. A future key is mentioned only as a possible later change.

Result filters, https://api.spacegass.com/docs/examples/filter-results-by-case. LoadCases, Nodes, and Members filters. Node reaction rows expose node, case, and Fx, Fy, Fz in the example. A missing analysis is a warning, not an empty success.

Restrained reactions, https://api.spacegass.com/docs/examples/reactions-for-restrained-nodes. Support nodes can be filtered by restrained node type, then passed to the reaction query.

Simple beam example, https://api.spacegass.com/docs/examples/simple-beam. Members connect NodeA and NodeB. Station forces are returned as MemberIntermediateForce with case, member, station index, location distance, and Fx, Fy, Fz, Mx, My, Mz arrays.

Coordinate systems, https://www.spacegass.com/manual/Modelling_the_Structure/Coordinate_systems.htm. Global XYZ. Member local x runs from node A to node B. Local y is generally toward global Y. Local z completes the right-handed set. A vertical member uses a documented special case. A direction angle, node, or axis rolls the member about local x.

Sign conventions, https://www.spacegass.com/manual/Modelling_the_Structure/Sign_conventions.htm. Positive axial force is compression. Positive shear translates node A relative to node B along the positive local axis. Positive torsion rotates node A anti-clockwise relative to node B when viewed from node B. Positive moments compress the positive-axis side. Node reactions are positive along the positive global axes. These statements are the mapping source. They are not inferred from the product name.

Displacements, actions and reactions, https://www.spacegass.com/manual/Analysis/Static_Analysis/Displacements_actions_and_reactions.htm. Each member end has axial force, torsion, two shears, and two bending moments. Intermediate values are produced for diagrams and reports. Reactions are forces and moments on restrained nodes in global axes.

Unresolved on the public pages read here: the API name of a dedicated member-end result endpoint, the JSON names of reaction moment components, object-id stability across save, reopen, copy, or renumber, any minimum desktop version below the 15.x SDK examples, a nonlinear convergence flag separate from run status, and major versus minor assignment without the section transpose state. Those items stay unresolved. They are not guessed.

## Other candidates

ETABS and SAP2000 have official CSI documentation for an API and for frame-force output conventions, including docs.csiamerica.com help for results arrays, database-table export, and frame internal-force signs. They are deferred. The repository has no CSI product requirement that outranks the existing SPACE GASS boundary, and the first route would be a versioned desktop COM or .NET API rather than the local read API already documented for SPACE GASS.

STAAD.Pro has official OpenSTAAD and openstaadpy documentation on docs.bentley.com, including an output class that can report whether results exist and can read member results. The full sign convention was not established from the pages read in this pass. STAAD.Pro is deferred, not rejected as incapable.

Robot Structural Analysis has an Autodesk support article stating that product documentation exists and that the SDK is part of the installation. A public non-forum semantic register sufficient to map signs, units, and result locations was not retrieved. Forum attachments were not used. Robot is deferred.

RFEM and Strand7 remain repository names only. No official source was gathered for them in this phase, so they are not assessed as a first provider.

## Mandatory gates and selection matrix

SPACE GASS passes the bounded gate for provider and product identity, API URL version, model file and job identity, run terminal status, load cases, combination cases, member and node ids, station forces, restrained-node reaction forces, job units, documented global and member axes, documented sign directions, station location distance, and analysis warnings.

ETABS and SAP2000 also show an official route that could pass a similar gate, and they are deferred for the architecture-fit reason above rather than a failed semantic gate. STAAD.Pro is deferred with an incomplete public sign register. Robot, RFEM, and Strand7 are deferred or not assessed because the governing semantic register is incomplete.

Among passing or near-passing options, SPACE GASS has explicit official units, axes, signs, case filters, station forces, and reaction forces; object-id stability is UNKNOWN; version discoverability is the URL v1 contract plus SDK-to-desktop pairing; official integration support is the published REST API; automation requires a user-owned local licence and is not assumed in the cloud; testability is high because synthetic JSON can follow the documented fields without a vendor sample file; EOS fit is the existing uncertified boundary plus R1 and R2; implementation complexity of a read-only filtered read is lower than a versioned COM bridge. Market share and customer demand are UNKNOWN. Pilot relevance is only the repository statement that live execution remains uncertified.

## Version strategy

The HTTP contract in scope is URL version v1. Desktop and SDK versions must be recorded from the service response and compared with a versioned mapping manifest. Documented pairing examples are desktop 15.0.2 with package 15.0.2, and 15.1.0 with 15.1.0. The minimum supported desktop version is UNKNOWN. The maximum known compatible version is not claimed beyond those examples. An unknown or untested future version fails closed. One mapping is not assumed valid for every desktop version.

## Licensing and deployment

The vendor describes read-only result access for a registered user and an API module for opening, running, and editing. Whether a particular read requires the job to already be open is a commercial and technical boundary. Licensing review is required before R4 calls anything other than a user-initiated read. This phase does not conclude that a licence can or cannot be used on a server. License bypass, key extraction, and undocumented licence automation are prohibited.

The recommended deployment is a user-machine agent. The user starts the licensed local service. EOS does not assume the solver can run in the cloud. The agent preserves response snapshots. EOS ingests those snapshots through the existing package and adapter path. A server-side API connector that launches the solver is not the recommendation.

## R2 scale

The current package limits are exactly 262144 file bytes, 64 results, 64 objects, 32 warnings, 32 cases, 32 combinations, nesting depth 8, string length 512, identifier length 128, and array length 64. They are security and test bounds. They are not production solver capacity. A realistic station-force response for more than a fixture exceeds them. The scale class of the current package is FIXTURE_ONLY.

R4 must not remove the limits. The official API already filters by load case and member and describes collection paging. R4 should add a bounded multi-package manifest: one chunk per bounded case or member family, each chunk inside a fixed limit, with a manifest that does not itself carry unbounded result arrays.

## Connector architecture

The flow is the native API response snapshot, then the SPACE GASS read-only connector, then the D1G-R1 adapter contract, then D1G-R2 chunk serialization where a package is needed, then D1F normalization and D1F result authority.

There is one semantic mapping. The connector produces R1 provider-neutral records. A version-1 package chunk is a serialization of those same records, not a second mapping.

The immutable native source is the exact JSON bytes of the read responses used for metadata, units, members, nodes, restraints, cases, combinations, station forces, reaction forces, warnings, and run status. A model path may be stored as inert display text. The package cannot cause EOS to read an arbitrary file.

Model identity uses the service and job identity fields that the response actually contains, the API v1 marker, the desktop version reported by the service, and the snapshot hash. Missing identity fails closed.

Object identity uses the job's node id, member id, and NodeA or NodeB references. Those ids are not globally unique. They map to EOS analytical elements, nodes, and supports only through a governed object mapping. Stability across save, reopen, revision, copy, and renumber is UNKNOWN, so a changed native id is a new mapping problem rather than a silent reuse.

Member orientation follows the cited axis page: local x from node A to node B, with the documented y and z rules and optional roll. Station origin is the location distance in the job length unit. A station index is not treated as an end.

Units are the active job unit set from GET /job/units. Display units are not assumed. A new API-created job may default to the vendor SI set, and that default is still read rather than assumed.

Global axes and member local axes are the documented systems above. Reaction axes are the global system stated by the sign page. If a response does not carry enough axis identity for a value, that value does not govern.

Signs use the cited member-action and reaction statements. The manifest stores explicit factors. The provider name does not select a factor.

Load cases use the load-case id from /job/loads/load-cases. Combinations use the combination-case id. Both enter D1C only through the explicit R1 mapping manifest.

Member station forces use MemberIntermediateForce. Native names Fx, Fy, Fz, Mx, My, and Mz stay native until the manifest maps them. Major and minor bending are not assigned unless the section transpose state is present. A dedicated member-end endpoint was not named by the pages read here, so ends are not invented from the first or last station index.

Support reactions use the node reaction query for Fx, Fy, and Fz, filtered to restrained nodes when that filter is present. Reaction moment field names are unresolved. The support id is the node id. The case id is the reaction load case. The location is the node. The coordinate statement is the global system from the manual, recorded on the result rather than implied.

Run status uses Completed, Failed, and Cancelled. Completed is not convergence proof for an analysis type whose convergence flag was not documented. Failed and not-analysed warnings remain provider evidence. They do not become EOS acceptance.

The mapping manifest is versioned by API v1 plus the tested desktop version. It versions categories, quantity names, units, axes, signs, ends, locations, cases, combinations, run states, warnings, and object types. A version change gets a new manifest revision.

The capability manifest for this provider is model metadata, nodes, analytical members, load cases, load combinations, member station forces, support reaction forces, warnings, and run terminal status. Modal, buckling, shell, design, editing, and solver execution are not claimed.

## R4 scope

R4 may implement a read-only connector for the version scope above. The minimum read is provider and model identity, version, run status, cases, combinations, station forces, reaction forces, warnings, units, axes, signs, locations, object ids, and the preserved native snapshot. Solver execution is out of scope. The connector does not create or edit the model.

Deferred features are model creation, geometry edits, load creation, analysis execution, design-code execution, section optimization, connection design, drawing extraction, modal ingestion, buckling ingestion, shell-stress ingestion, and nonlinear history.

## Security

R2 protections remain: no package self-authority, no path traversal, no arbitrary file read, no URL auto-fetch, no code execution, no unsafe deserialization, and no provider control of project, profile, mapping, or result authority.

Current documented access needs no API key, so the credential architecture is not applicable. If a later vendor version adds a key, that key uses existing secret storage and is absent from source, packages, manifests, and logs.

The local agent is user-initiated, limited to an allowlisted local service, forbidden from spawning the vendor process or loading a plugin, and limited in response size. The preserved snapshot is what EOS receives.

No network integration is implemented. A future call may use only the local allowlist, with timeout, no redirect, and response size limits. Widening the host is a new decision.

Provider errors, connector errors, mapping errors, and D1F validation errors stay distinct. The error codes include unavailable provider, unsupported version, invalid source, authentication, unavailable licence, model not analysed, run failed, run not converged, unsupported result type, object mapping failure, unit, axis, sign, and case mapping failure, unresolved location, source too large, and other provider error.

Provenance runs from the normalized result through the raw result, the neutral adapter, the connector, the native result, the model and run, the native snapshot, the provider version, the connector version, and the mapping-manifest version.

Fingerprints cover the native snapshot, connector execution, mapping manifest, object mapping, neutral adapter output, and each package chunk. A change to source, provider version, connector version, mapping, object mapping, or topology marks the dependent chain stale. Replay uses the preserved snapshot and the same mapping version. It does not require the commercial licence for the replay itself.

## Offline fixtures

Unit tests use synthetic JSON with the documented field names and synthetic numbers. They do not embed vendor sample models. The golden fixture needs two analytical members, at least two load states, station forces, support reaction forces, an explicit unit set, explicit axis and sign labels, one warning, and a run status. It is marked test-only.

## R4 contract

The provider is SPACE GASS. The version scope is API v1 with desktop and SDK versions tested against the documented pairing rule, failing closed otherwise. The integration mode is local REST read-only. The native source is the immutable response snapshot. The mapping manifest is a versioned SPACE GASS manifest, not a universal mapping. The required capabilities are the bounded list above. The security boundary is the R2 model plus the local allowlist and the read-only flag. The scale architecture is the bounded multi-package manifest. Deferred features are the list above.

## Maturity

Maturity is FIRST_PROVIDER_SELECTED_AND_CONNECTOR_ARCHITECTURE_DEFINED. The product claim is that the first connector architecture is defined. It is not that a commercial solver is connected. C10 remains pending qualified human review. D1F human validation is unchanged. Steel system dispatch remains D1D_EU_TENSION only. No database migration is required.
