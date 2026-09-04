# Architecture

Project Intelligence remains the reasoning / management intelligence layer over existing canonical records.

Preserved:

- Engineering Core projects, assets, documents
- Project Intelligence canonical application
- Kernel, AI Director, Model Registry, Prompt Registry
- Knowledge Graph, Memory, Workflow Engine, Event Bus
- RBAC, Audit, Commerce, Notifications, Integrations, Reporting
- Shared UI primitives (`@rtb/ui`)

Not created:

- Second project model
- Second project-controls system
- Second AI stack (Ask Project Intelligence still uses `kernel.aiDirector.run` and Command Centre composition)
- Second graph, workflow engine, or reporting stack
- Duplicate schedule / cost / document truth

Overview, Schedule, Cost, Risk & Change, Engineering, Decisions, and Reports read published Command Centre, Schedule, Cost, Query/Decision, Findings, Documents, and Meetings APIs. Documents still list Engineering Core documents. Findings list `project_intelligence_findings`. Meetings still create through the existing meetings service.
