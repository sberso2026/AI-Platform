# Meeting Provider Strategy

**Phase:** 7A  
**Principle:** Connectors are shared Platform capabilities, not mandatory OS dependencies.

## Provider-neutral ingestion

Supported source kinds:

- Manual transcript
- Uploaded audio
- Uploaded video
- Microsoft Teams
- Zoom
- Google Meet
- Future providers

All sources normalize into one transcript + evidence contract consumed by applications (e.g. Project Intelligence Meetings).

## Certification stance

| Provider | Status |
|----------|--------|
| Manual | **Certified** — primary production path |
| Microsoft Teams (fixture) | Preserved regression evidence |
| Microsoft Teams (live Graph) | **conditionally_deferred** — see Teams connector status |
| Zoom / Google Meet | Unavailable until live certification |

Project Intelligence Meetings must remain usable without Teams.

## Non-blocking rule

Platform and Engineering OS **release eligibility must not** depend on Teams live certification.
