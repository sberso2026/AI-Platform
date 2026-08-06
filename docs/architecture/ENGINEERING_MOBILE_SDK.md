# Engineering Mobile SDK

**Version:** `0.6.0`  
**Location:** `packages/engineering-os/src/mobile-sdk`

## Purpose

Reusable mobile and field capability contracts for all Engineering OS modules.
Contains **no** Inspection Intelligence business rules.

## Capabilities

device capability detection, viewport classification, touch input, camera acquisition,
media capture, QR/barcode scanning, annotation, signature capture, authenticated attestation,
secure media staging, local temporary identifiers, connectivity state, sync-readiness contracts
(9G reserved for full offline), device permission handling, mobile telemetry, accessibility,
error states, capability health.

## Explicit failures

Unsupported or permission-denied capabilities throw; no silent unsafe fallbacks.

## Future consumers

Asset Intelligence, Project Controls, Digital Twin, SHM Intelligence, Construction and
Commissioning, Maintenance modules.
