# EOS-SHELL-JARVIS-3 certification

Restore the premium dark JARVIS command shell on the certified operational baseline without regressing Commerce, Engineering Systems, or TQ workflows.

Preview only. Do not promote Production. Do not invite external users.

Baseline: `8132e356f466d10a2876efebf9867ca7591f8dcc`  
Visual lineage: EOS-SHELL-JARVIS-2 `b2f6c8788cf4dd3bb75313a4f8891ea61e487a48` (not an ancestor of HEAD)

Tenant: RTB Engineering Pilot LAUNCH-1  
Workspace: RTB Engineering  
Founder: `silvestre.berso@rtbea.com.au`

## Root cause

The authenticated shell was light because HEAD never inherited EOS-SHELL-JARVIS-2. Current `globals.css` was still the Batch 2.09 enterprise light theme (`#f4f6f8`, `html { color-scheme: light }`) with no `--eos-*` tokens. `PlatformShell` did not set `data-eos-theme="enterprise-dark"`. `ThemeProvider` used `defaultTheme="system"`, so a light OS applied `html.light`. JARVIS command primitives (`command-panel`, `command-visuals`, `eos-ai-core`) were absent on this branch.

The restore ports JARVIS tokens and primitives onto the certified operational baseline. It does not merge the PI-0 branch.

## Screenshot evidence

Authenticated founder captures at 1366×768, 1440×900, and 1920×1080 under `screenshots/`.

Work → Inspections uses the existing route `/engineering/apps/inspection-intelligence` (no new route).

Primary screenshot inner text: **0** raw UUIDs, **0** internal application keys, **0** certification/release jargon.

## Architecture freeze

No route, schema, domain, Commerce, registry, AI runtime, auth, or RBAC changes. No second UI framework.

## Findings

LOW: several operational screens still emit legacy `bg-white` / `slate-*` class names. Under `data-eos-theme="enterprise-dark"` those classes remap to `--eos-*` tokens. Computed authenticated canvas is dark.

LOW: Command Centre scope copy can still read `Selected project` while the header selector already shows the human project label. No raw project UUID is shown.

## Certification flags

```
FINAL_SHA=2d442985333e274f628b179504572aa96b64df30
PREVIEW_DEPLOYMENT_ID=dpl_FJAwAjymSidBL9rfrJXpD8zrgDks
WORKING_TREE_CLEAN=true
PREVIEW_MATCHES_FINAL_SHA=true

SHELL_VISUAL_REGRESSION_ROOT_CAUSE=HEAD never inherited EOS-SHELL-JARVIS-2; authenticated globals remained Batch 2.09 light tokens and ThemeProvider defaulted to system/light.

JARVIS_SHELL_RESTORED_PASS=true
COMMAND_CENTER_JARVIS_PASS=true
ENGINEERING_SYSTEMS_JARVIS_PASS=true
PROJECTS_JARVIS_PASS=true
ASSETS_JARVIS_PASS=true
INSPECTIONS_JARVIS_PASS=true
DOCUMENTS_JARVIS_PASS=true
TQ_JARVIS_PASS=true
PI_JARVIS_PASS=true
ASSET_INTELLIGENCE_JARVIS_PASS=true
DIGITAL_TWIN_JARVIS_PASS=true
ENGINEERING_MODELS_JARVIS_PASS=true
PROJECT_CONTROLS_JARVIS_PASS=true

AUTHENTICATED_LIGHT_SHELL_ROUTE_COUNT=0
EOS_SHELL_VISUAL_CONSISTENCY_PASS=true

ENGINEERING_MODULE_OPERATIONAL_CERTIFICATION_PASS=true
COMMERCE_APPLICATION_PROVISIONING_PASS=true
INSTALLED_APPLICATION_PROJECTION_PASS=true

ENGINEERING_SYSTEMS_NAV_VISIBLE_PASS=true
ENGINEERING_SYSTEMS_NAV_ROUTE_PASS=true
EOS_PRIMARY_NAVIGATION_PASS=true

TQ_CORE_WORKFLOW_REGRESSION_PASS=true
TQ_RICH_CONTENT_REGRESSION_PASS=true
TQ_PRINT_REGRESSION_PASS=true

SHELL_SCROLLING_PASS=true
SHELL_NO_FREEZE_PASS=true
SHELL_BACK_NAVIGATION_PASS=true
SHELL_RESPONSIVE_PASS=true
SHELL_ACCESSIBILITY_PASS=true
SHELL_REDUCED_MOTION_PASS=true

PRIMARY_UI_RAW_UUID_COUNT=0
PRIMARY_UI_INTERNAL_IDENTIFIER_COUNT=0
PRIMARY_UI_RELEASE_JARGON_COUNT=0

NO_ROUTE_ARCHITECTURE_CHANGE=true
NO_DATABASE_SCHEMA_CHANGE=true
NO_DOMAIN_MODEL_CHANGE=true
NO_COMMERCE_CHANGE=true
NO_APPLICATION_REGISTRY_CHANGE=true
NO_AI_RUNTIME_CHANGE=true
NO_SECOND_UI_FRAMEWORK=true
NO_SECOND_AI_STACK=true
NO_SECOND_GRAPH=true
NO_AUTH_CHANGE=true
NO_RBAC_CHANGE=true

BLOCKER_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=2

EOS_JARVIS_SHELL_CERTIFIED=true
FOUNDER_ACCEPTANCE_REQUIRED=true
PRODUCT_EXTERNAL_UAT_READY=false
PRODUCTION_GA_READY=false
```
