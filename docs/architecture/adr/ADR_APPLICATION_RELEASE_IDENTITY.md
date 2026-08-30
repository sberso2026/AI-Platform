# ADR — Application Release Identity

Status: Accepted · Date: 2026-08-30

## Context

RTB products have Production GA tags, frozen certification contracts, package
versions, module-registry versions, and public-contract pins. Those identities
were not previously separated by a platform-wide rule.

Observed primitives (not a single product’s local convention treated as law):

- GA tag pattern `{product-slug}-v{semver}` on Engineering OS, Business OS,
  Project Intelligence, Inspection Intelligence, Asset Intelligence, Project
  Controls, Digital Twin, Engineering Model Interoperability, and Security
  Assurance.
- GA tags are created once and never moved (`releaseTagMoved = false`;
  certification workflows create a tag only if missing; rollback runbooks
  require a new patch tag for repairs).
- Engineering OS already pins **historical** module GA tags and commits
  (`PROJECT_INTELLIGENCE_V1_TAG` / `V1_COMMIT`, and equivalents) separately
  from current OS version metadata, and already separates **module version**
  from **publicContractVersion** on the aggregate manifest.
- Inspection Intelligence documents PATCH / MINOR / MAJOR for a GA product
  (`docs/release/INSPECTION_INTELLIGENCE_VERSION_COMPATIBILITY.md`).
- Digital Twin / Project Controls / Interop public contracts use
  `semver_minor_additive_only`; a breaking contract change requires a new
  major contract version and a new certification phase.
- Customer Administration requires the production tag SHA to equal the
  certification artifact SHA.

The gap: no reusable rule for (1) advancing an already-GA application to a
later GA, (2) keeping an immutable historical certification contract after
that advancement, (3) classifying major / minor / patch for application
release identity across RTB products.

## Decision

This ADR is the canonical RTB application release-identity policy.

### 1. Immutable GA tags

- A Production GA tag is immutable. Do not move, delete, retarget, or
  force-update it.
- Do not rewrite historical certification evidence to pretend a prior GA
  never existed.
- A later release uses a **new** tag. Repair of a GA uses a new patch tag,
  not retargeting of the original.
- Force-push of a GA tag is forbidden.

### 2. Tag pattern

Production GA tags use `{product-slug}-v{semver}` (example:
`project-intelligence-v1.1.0`).

Release-candidate patterns, where a product already defines them, are not
Production GA tags and must not be invented ad hoc for products that have no
established RC convention.

### 3. Dual identity (historical certification vs current release)

An application MAY have both:

| Identity | Meaning | Mutability |
|---|---|---|
| Historical certification contract | The frozen prior Product GA (version, tag, certified commit, public contracts) | Immutable |
| Current release | The product version and declared GA tag of the code on HEAD | Advances per §4 |

These MAY differ. A release manifest or current package/module version does
**not** supersede an earlier immutable GA tag.

Current release metadata MAY declare the next GA version and tag name before
the git tag exists. Creating the git tag is a separate promotion operation.

### 4. Semantic version advancement (application release)

Apply to the **current application release version** of the same product
slug / application key:

| Level | Criterion |
|---|---|
| **PATCH** (`x.y.Z`) | Backward-compatible defect repair. No new product capability. No public-contract change. |
| **MINOR** (`x.Y.0`) | Backward-compatible additive product capabilities. Prior GA public contracts remain compatible. Schema additive or unchanged. Certified capabilities of the prior GA remain available. |
| **MAJOR** (`X.0.0`) | Breaking public-contract change, incompatible schema, or removal of a certified capability without a compatibility window. |

**Second-generation product line** is not a semver bump. It requires a new
application key and product slug. Same application key means same product line.

Public-contract version MAY remain on the prior GA (for example `1.0.0`) while
the application release version advances, when contracts stay compatible.
That is the existing Engineering OS `publicContractVersion` vs module version
split. Breaking a public contract requires a major **contract** version and a
new certification phase, in addition to the application major if the product
release is itself breaking.

### 5. Metadata locations

Canonical current application release identity lives in the product’s
`version.ts` (version + declared release tag) and MUST match that product’s
`package.json` version and Engineering OS module-registry module version.

Historical certification identity lives in explicitly named V1 (or prior-GA)
constants and in frozen OS pins. Certification of a prior GA MUST assert
those historical constants and the immutable tag target — not the current
application release version — unless the current release **is** still that
same GA.

### 6. Promotion

Declaring current release identity does not create the git tag. Promotion
creates the declared tag once, on a clean tree, pointing at the certified
commit. Promotion never retargets an existing GA tag.

## Consequences

- Phase/certification suites that meant “prior GA still exists” must pin
  historical certification constants and tag SHAs, not forever freeze current
  product version at the first GA.
- Products applying this ADR introduce dual-identity constants rather than
  overwriting historical version declarations.
- This policy is generic. Product-specific application records (for example
  `docs/release/PROJECT_INTELLIGENCE_RELEASE_IDENTITY.md`) classify a given
  delta under §4; they do not invent a competing version system.
