# Inspection Intelligence — Evidence Framework

**Phase:** 9A · Architecture only · No implementation

## Evidence types (generic)

Photo, Video, Audio, Drawing, PDF, Document, Thermal Image, Ultrasound, Point Cloud, LiDAR, Laser Scan, Drone Image, Robot Image, 3D Mesh, AI Inference, Voice Note, External URL, Sensor Data.

## Integrity & chain

| Concern | Approach |
|---------|----------|
| Evidence Version | Immutable versions; new capture = new version |
| Evidence Integrity | Hash at ingest; store hash with metadata |
| Evidence Chain | Link parent/child and session/observation refs |
| Evidence Hash | Content hash (algorithm recorded) |
| Evidence Approval | Via Platform Workflow / inspection_approval |
| Blob storage | **Platform Files** only |
| Optional future | Blockchain anchoring — optional, not required for v1 |

## Rules

- II stores evidence **metadata and links**, not a private blob store.
- Document evidence may reference Engineering document revisions by ID.
- AI Inference evidence cites Platform AI Runtime run IDs when present.
- No private embedding store for evidence search — reuse Platform Knowledge Intelligence patterns.
