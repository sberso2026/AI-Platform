# EOS-D1G-R2 Provider-Neutral Result Package Ingestion

## Purpose

This phase ingests one external structural-analysis result package into the existing D1G-R1 adapter and the existing D1F-R2 raw-result and normalization path. The package is data. It is not a governed result, not a verified model, and not engineering acceptance. A declaration inside the file does not become EOS authority.

The bounded product claim is PROVIDER_NEUTRAL_EXTERNAL_RESULT_PACKAGE_INGESTION. This phase does not claim a commercial solver connection, a live solver integration, automated structural analysis, or general structural design.

## Version 1 container

Version 1 is a single UTF-8 JSON file. The format marker is EOS_STRUCTURAL_RESULT_PACKAGE and the schema version is the string 1. Unknown format markers are rejected. Unknown or future schema versions are rejected. EOS does not attempt a best-effort reading of a later schema.

ZIP, TAR, RAR, 7Z, directory packages, embedded executables, embedded scripts, embedded plugins, remote URL fetches, local filesystem paths, symbolic links, and external entities are outside this version. Archive support is not implemented. An external resource reference is not resolved.

The machine-readable schema artifact is packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.schema.json. Runtime validation is the bounded parser in result-package.ts. No new schema library was added. The synthetic example is packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.example.json and is test-only.

## Identity, fingerprints, and canonicalization

Package identity carries the package id, format marker, schema version, raw-file fingerprint, semantic fingerprint, the package createdAt value as the ingestion timestamp, producer identity when declared, provider identity, and the adapter and mapping expectation.

The raw-file fingerprint is the SHA-256 of the original bytes, taken before semantic parsing. An optional UTF-8 BOM is accepted and removed only for parsing. The raw fingerprint still covers the original bytes, including the BOM. Invalid UTF-8 is rejected.

The semantic fingerprint is a separate SHA-256 of the canonical package after a successful schema read. It is not equal to the raw-file fingerprint. Object keys are ordered by the canonical serializer. Insignificant whitespace is ignored. Numeric text is parsed without rounding, so equivalent numeric spellings share a semantic fingerprint while keeping distinct raw fingerprints. Identity-bearing arrays are treated as id-keyed sets for the semantic fingerprint and for the adapter handoff: results, objects, cases, combinations, warnings, and capability names are ordered by id. The preserved raw bytes are not rewritten. Order is not a second copy of identity. Arrays whose order would change engineering meaning are not given a hidden default.

Duplicate JSON object keys are rejected before JSON.parse. Last-key-wins is not an engineering interpretation.

## Resource limits and numeric safety

Parsing is bounded. The default limits are 262144 file bytes, nesting depth 8, 64 results, 64 objects, 32 warnings, 32 cases, 32 combinations, string length 512, identifier length 128, and array length 64. Callers may tighten these limits. A limit failure stops ingestion. Depth is checked with an explicit stack, not unbounded recursion.

NaN, Infinity, and -Infinity cannot govern. A non-numeric engineering value cannot govern. Ingestion does not round engineering values. An absent value is not zero. A missing component is not invented as zero. An explicit zero remains zero.

## Trust separation

The file may declare provider id, provider name, and provider version. That declaration is not trusted. EOS selects an installed adapter from the caller-supplied registry by provider id and supported provider version. The recorded adapter version is the registry adapter version. A version declared in package metadata is ignored. An unknown provider or an unsupported provider version is retained as unsupported evidence and does not enter the D1F normalized chain.

The file may name an expected mapping manifest id, version, and fingerprint. It cannot supply governing mapping tables. If an expected fingerprint differs from the fingerprint of the manifest resolved from EOS configuration, ingestion fails closed. Object-mapping approval is likewise resolved from the governed registry. A package list of approved objects does not create a mapping.

Ingestion requires an authorized tenant, workspace, project, and profile supplied by the caller. A project id, tenant id, or profile id carried in the file does not grant access and does not replace the authorized context. Cross-project and cross-tenant binding is rejected. The package cannot override the governed design profile.

The package cannot promote a result to verified-governed, engineer-validated, or conformance-validated. A model-validated flag in metadata does not satisfy model-validation evidence. Ingestion success is not result authority. Schema validity is not a governed result. A successful JSON parse is not engineering validity.

Filename, file extension, and caller MIME type are advisory. They do not select the provider, the schema, package validity, or trust.

## Model, run, cases, objects, and results

Model metadata carries provider model id, model revision, analysis type, unit context, coordinate context, and source reference. Run metadata carries provider run id, run state, convergence state, run revision, timestamp, warnings, and case or combination references. Load cases carry provider case id, name, and optional type. Load combinations carry provider combination id, name, and optional type. Provider objects carry provider object id, type, and model id. Provider object ids are not treated as globally unique.

Each result carries provider result id, provider object id, category, quantity name, raw value, raw unit, coordinate system, sign convention, result location, case or combination reference, run reference, optional warning references, and optional station metadata. Result ids must be unique within the package run. A result that names an unknown object, run, case, or combination is rejected. A warning that names an unknown result is rejected.

Case, combination, category, and quantity meaning come from the R1 mapping manifest. A quantity label alone does not define semantics. A dimensioned result without a unit cannot govern. A directional result without a coordinate system cannot govern. A missing sign convention cannot govern. A missing result location cannot govern. A member-end result keeps the provider end identity through the R1 end map. A station result requires station value, unit, origin, and orientation.

Warnings are preserved, including warning codes the mapping does not already name. Unknown warnings are not dropped.

Unknown engineering fields outside the version 1 object are rejected. The extensions object is preserved as non-governing metadata and cannot change units, axes, signs, authority, project, profile, or mapping.

A package may be partial, for example member forces without reactions, but it must say so. A partial package cannot imply a complete result set. If the file claims completeness and the adapter's required scope is missing, the ingestion completeness stays partial.

Terminal validation states are schema-valid, semantically valid, partial, unsupported, invalid, and stale. Parsed is the intermediate state after JSON is read and before those outcomes.

## Pipeline, provenance, replay, and staleness

The pipeline is file received, raw-byte fingerprint, encoding validation, duplicate-key validation, JSON parse, resource-limit validation, schema validation, referential validation, authorized context resolution, adapter resolution, mapping-manifest resolution, object-mapping resolution, R1 adapter execution, D1F raw handoff, D1F normalization, and ingestion result.

The ingestion result records ingestion id, package id, both fingerprints, schema version, provider id and version, actual adapter id and version, mapping manifest id, version, and fingerprint, object-mapping fingerprint, authorized project and profile, package completeness, adapter execution fingerprint, D1F source payload id, analysis model and run refs, result-set ref, warnings, findings, status, authority state, provenance, and the ingestion fingerprint.

The ingestion fingerprint covers the raw fingerprint, semantic fingerprint, schema version, adapter version, mapping fingerprint, object-mapping fingerprint, authorized context, and the ingestion limits. The same bytes, schema, adapter, mappings, and authorized context reproduce the same fingerprint. Re-ingestion does not overwrite the prior result object. A later ingestion is a successor. A change of package bytes, semantic content, adapter version, mapping manifest, object mapping, or authorized topology is a different ingestion. Topology or mapping drift is passed through the R1 adapter so D1F staleness still applies.

Provenance runs from the normalized result through the raw result, the R1 adapter execution, this ingestion, the semantic package, the immutable raw file, the provider run and result, the mapping manifest, the object mapping, and the adapter version.

## Security boundary

The parser does not read a path from the package, write a path from the package, fetch a URL, or execute script, template, or dynamic code. Path-like strings and URLs may appear only as inert text. Non-finite numbers, duplicate keys, malformed JSON, invalid UTF-8, oversized files, deep nesting, long identifiers, and oversized arrays fail closed.

## What this phase does not do

No commercial connector is implemented for ETABS, SAP2000, STAAD, Robot, or SPACE GASS. No structural solver runs. No new engineering formula is added. Member design, connection design, foundation design, and geotechnical design are not executed. D1F maturity and C10 maturity are unchanged. C10 remains PENDING_QUALIFIED_HUMAN_REVIEW. D1F system steel dispatch remains D1D_EU_TENSION only. No database migration is required. The package schema is a file contract, not a persistence migration.

## R3 handoff

The neutral package and the R1 adapter contract are stable enough to choose a first provider. This phase does not select that provider. The next phase is EOS-D1G-R3-PROVIDER-SELECTION-AND-FIRST-CONNECTOR-ARCHITECTURE. Its scope is to select the first external structural analysis provider using explicit technical and business criteria and to design its bounded connector against the R1 and R2 contracts, without general multi-provider support and without bypassing D1F.

## Maturity

D1G-R2 maturity is PROVIDER_NEUTRAL_RESULT_PACKAGE_INGESTION_IMPLEMENTED. External result package ingestion is IMPLEMENTED_PROVIDER_NEUTRAL_V1. The commercial solver connector remains NOT_IMPLEMENTED. General availability remains blocked by the existing EOS-A16D security debt.
