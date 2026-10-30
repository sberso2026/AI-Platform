# EOS 3 Project Workspace — Information Architecture

## Principle

Grouped project-level navigation replaces the flat tab row. Existing usable registers remain reachable; EOS 3 capabilities become discoverable within ≤3 interactions from Overview.

## Groups

### PROJECT
- Overview
- Project Setup
- Lifecycle & Gates

### ENGINEERING DEFINITION
- Requirements
- Engineering Basis
- Assumptions
- Systems & Interfaces

### ENGINEERING EXECUTION
- Calculations
- Decisions
- Optimization
- Changes & Impact
- Technical Queries
- Risks

### DELIVERY
- Deliverables
- Documents
- Models
- Reviews
- Actions

### INTELLIGENCE
- Digital Thread
- Knowledge
- Impact Analysis
- Engineering AI

### PROJECT TO ASSET
- Assets
- Inspections
- Handover & Readiness
- Configuration History

### GOVERNANCE
- Evidence & Provenance
- Qualification
- Audit / Events
- Integrations & Solvers
- Trust / Release Status
- Migration Status
- Reports

## Routing

Base: `/engineering/projects/{projectId}`  
Capability: `/engineering/projects/{projectId}/{slug}`

Source of truth: `apps/web/src/lib/engineering/project-workspace-ia.ts`

## Navigation depth

Overview → sidebar group → capability link ≤ 3 interactions.  
`EOS_HIDDEN_ROUTE_ONLY_CORE_CAPABILITY_COUNT=0`
