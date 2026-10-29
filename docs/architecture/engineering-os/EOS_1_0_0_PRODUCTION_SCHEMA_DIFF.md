# EOS 1.0.0 production schema diff

Path: docs/architecture/engineering-os/EOS_1_0_0_PRODUCTION_SCHEMA_DIFF.md

Read-only comparison on 2026-10-27. Production wcydlhqiqdwgoaqrlget. Staging rntonzigxwxcjlcsadip. No schema was changed.

## Catalog

Production: 102 applied migration versions, maximum 20261007190000, 478 public tables, 478 with row security, 1120 public policies, 60 engineering tables, 174 engineering policies.

Staging: 131 applied migration versions, maximum 20261007140000, 669 public tables, 669 with row security, 1798 public policies, 146 engineering tables, 516 engineering policies.

Staging is ahead on Engineering OS feature tables. Production is ahead on the security versions 20261007160000, 20261007180000, and 20261007190000. Those three are not a reason to replay staging.

## Object classes

TABLE: production lacks the later engineering tables checked live, including engineering_work_plans, engineering_generated_artifacts, engineering_pre_issue_reviews, engineering_m365_connections, engineering_external_tool_profiles, engineering_information_refs, engineering_requirements, and engineering_structural_calculations. engineering_decisions and knowledge_nodes and model_registry are present. Staging has the missing engineering tables. security_assurance_controls is present on staging and absent on production.

COLUMN: licence_type is absent on production because engineering_external_tool_profiles is absent. storage_kind is absent because engineering_generated_artifacts is absent. Staging has both columns.

INDEX: idx_knowledge_nodes_eos_thread_source is absent on production and present on staging. knowledge_nodes exists on both.

CONSTRAINT, FOREIGN_KEY, VIEW, ENUM, EXTENSION: not separately enumerated. No production object in those classes was altered.

FUNCTION: public.handle_new_user exists on both. Both definitions contain the invite-tenant variable. The production definition is longer. Production already has 20260901013000, which replaces the earlier invite function and forbids a signup from creating a tenant.

TRIGGER: not changed. The handle_new_user function remains the auth signup trigger target. It was not replaced.

RLS_POLICY: every production engineering policy name and command also exists on staging. Count in common: 174. Policies present only on staging: 342. Policies present only on production: 0. Tables with engineering policies only on staging: 86.

STORAGE_POLICY: not rewritten. No storage policy was changed.

The RLS-1 classification table rtb_public_table_security_classification exists on production because 20261007160000 created it. It does not depend on replaying 20261007120000.
