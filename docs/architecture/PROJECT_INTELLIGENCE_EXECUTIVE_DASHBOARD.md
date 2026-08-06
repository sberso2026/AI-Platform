# Reporting Intelligence — Executive Intelligence Dashboard

**Feature:** `reporting_intelligence`  
**Surface:** `/engineering/apps/project-intelligence/reports/executive`  
**Marker:** `data-testid="executive-intelligence-dashboard-ready"`

## Ownership

Live aggregation only. Widgets read from Document Intelligence, Meeting Intelligence,
Findings Intelligence, Engineering Core, and shared Engineering Services.
Reporting Intelligence does **not** create duplicate register storage.

## Widgets

Project Health, Open Findings, Converted Findings, Risks, Issues, Actions,
Technical Queries, Lessons Learned, Meeting Activity, Document Processing Status,
AI Executive Summary, Approval Queue, KPI Trends, Timeline, Evidence Coverage,
Audit Activity.

## AI executive summary

- Generated via Platform AI Runtime (no private model client)
- Draft requires `humanReviewRequired=true`
- Publish requires human reviewer identity
- Citations retained from originating features
