import type { SupabaseClient } from "@rtb/database";
import type { CanonicalEvidenceSource, CanonicalHarvestBundle, CanonicalHarvestRecord, HarvestQuery } from "./harvest";
import type { LifecycleCompleteness } from "./types";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function uuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function record(
  query: HarvestQuery,
  objectType: string,
  objectId: string,
  state: string,
  fields: Record<string, unknown>,
  extra: Partial<CanonicalHarvestRecord> = {},
): CanonicalHarvestRecord {
  return {
    tenantId: query.tenantId,
    workspaceId: query.workspaceId,
    projectId: query.projectId,
    scopeId: extra.scopeId ?? (query.scopeType === "PROJECT" ? query.scopeId : query.scopeId),
    objectType,
    objectId,
    state,
    fields,
    stale: extra.stale,
    superseded: extra.superseded,
    version: extra.version ?? null,
  };
}

async function selectRows(
  client: SupabaseClient,
  table: string,
  query: HarvestQuery,
  options?: { projectColumn?: boolean },
): Promise<{ rows: Record<string, unknown>[]; failed: boolean; reason?: string }> {
  let q = db(client).from(table).select("*").eq("tenant_id", query.tenantId).eq("workspace_id", query.workspaceId);
  if (options?.projectColumn !== false && uuidLike(query.projectId)) q = q.eq("project_id", query.projectId);
  const { data, error } = await q.limit(500);
  if (error) return { rows: [], failed: true, reason: `${table}:${error.message}` };
  return { rows: (data ?? []) as Record<string, unknown>[], failed: false };
}

export function createSupabaseCanonicalSource(client: SupabaseClient): CanonicalEvidenceSource {
  return {
    async load(query: HarvestQuery): Promise<CanonicalHarvestBundle> {
      const records: CanonicalHarvestRecord[] = [];
      const failures: string[] = [];
      let truncated = false;

      const requirements = await selectRows(client, "engineering_requirements", query);
      if (requirements.failed) failures.push(requirements.reason ?? "requirements");
      const links = await selectRows(client, "engineering_object_links", query, { projectColumn: false });
      const allocated = new Set(
        (links.rows ?? [])
          .filter((row) => String(row.relationship ?? "") === "ALLOCATED_TO" && String(row.from_type ?? "") === "requirement")
          .map((row) => String(row.from_id)),
      );
      for (const row of requirements.rows) {
        records.push(record(query, "requirement", String(row.id), String(row.status ?? "draft"), {
          allocated: allocated.has(String(row.id)),
          status: String(row.status ?? "draft"),
          verificationStatus: row.verification_status,
        }, { superseded: String(row.status) === "superseded" }));
      }
      if (requirements.rows.length >= 500) truncated = true;

      const assumptions = await selectRows(client, "engineering_assumptions", query);
      if (assumptions.failed) failures.push(assumptions.reason ?? "assumptions");
      const now = Date.now();
      for (const row of assumptions.rows) {
        const expires = row.expires_at ? Date.parse(String(row.expires_at)) : NaN;
        const validation = String(row.validation_status ?? "");
        records.push(record(query, "assumption", String(row.id), String(row.status ?? "draft"), {
          materiality: String(row.materiality ?? "").toUpperCase(),
          validationStatus: validation,
          expired: validation === "invalidated" || (!Number.isNaN(expires) && expires < now),
          reviewed: ["validated", "accepted_risk", "partially_validated"].includes(validation),
        }));
      }

      const iirs = await selectRows(client, "engineering_interface_information_requirements", query, { projectColumn: false });
      if (iirs.failed) failures.push(iirs.reason ?? "interfaces");
      for (const row of iirs.rows) {
        records.push(record(query, "interface", String(row.id), String(row.status ?? "REQUIRED"), {
          informationKey: String(row.information_key ?? ""),
          status: String(row.status ?? "REQUIRED"),
          sourceDiscipline: row.source_discipline_code,
          receivingDiscipline: row.receiving_discipline_code,
        }, { superseded: String(row.status) === "SUPERSEDED" }));
      }

      const baselines = await selectRows(client, "engineering_configuration_baselines", query);
      if (baselines.failed) failures.push(baselines.reason ?? "baselines");
      for (const row of baselines.rows) {
        records.push(record(query, "configuration_baseline", String(row.id), String(row.status ?? "draft"), {
          baselineType: String(row.baseline_type ?? ""),
          status: String(row.status ?? "draft"),
        }, { superseded: String(row.status) === "superseded" }));
      }

      const analyses = await selectRows(client, "engineering_analysis_results", query);
      if (analyses.failed) failures.push(analyses.reason ?? "analyses");
      for (const row of analyses.rows) {
        records.push(record(query, "analysis_result", String(row.id), String(row.status ?? "FAILED"), {
          applicable: true,
          valid: Boolean(row.result_valid),
          reviewed: ["in_review", "accepted"].includes(String(row.review_state ?? "")),
          accepted: String(row.acceptance_state) === "ACCEPTED",
          stale: Boolean(row.stale),
        }, { stale: Boolean(row.stale) }));
      }

      const reviews = await selectRows(client, "engineering_review_packages", query);
      if (reviews.failed) failures.push(reviews.reason ?? "reviews");
      for (const row of reviews.rows) {
        records.push(record(query, "review_package", String(row.id), String(row.status ?? "draft"), {
          status: String(row.status ?? "draft") === "completed" ? "complete" : String(row.status ?? "draft"),
        }));
      }

      const decisions = await selectRows(client, "engineering_decisions", query);
      if (decisions.failed) failures.push(decisions.reason ?? "decisions");
      for (const row of decisions.rows) {
        records.push(record(query, "decision", String(row.id), String(row.status ?? "draft"), {
          status: String(row.status ?? "draft"),
          decisionClass: row.decision_class ?? row.decision_type ?? null,
        }, { superseded: String(row.status) === "superseded" }));
      }

      const changes = await selectRows(client, "engineering_changes", query);
      if (changes.failed) failures.push(changes.reason ?? "changes");
      for (const row of changes.rows) {
        records.push(record(query, "change", String(row.id), String(row.status ?? "open"), {
          status: String(row.status ?? "open"),
          material: String(row.materiality ?? "").toLowerCase() === "high" || String(row.materiality ?? "").toLowerCase() === "critical" || Boolean(row.material),
        }));
      }

      const conditions = await selectRows(client, "engineering_assurance_conditions", query);
      if (conditions.failed) failures.push(conditions.reason ?? "assurance_conditions");
      for (const row of conditions.rows) {
        records.push(record(query, "assurance_condition", String(row.id), String(row.status ?? "OPEN"), {
          conditionType: String(row.condition_type ?? ""),
          materiality: String(row.materiality ?? "UNASSESSED"),
          status: String(row.status ?? "OPEN"),
        }));
      }

      const runs = await db(client)
        .from("engineering_assurance_evaluation_runs")
        .select("completeness,truncated,completed_at")
        .eq("tenant_id", query.tenantId)
        .eq("workspace_id", query.workspaceId)
        .order("completed_at", { ascending: false })
        .limit(1);
      let assuranceCompleteness: LifecycleCompleteness = "COMPLETE";
      if (runs.error) {
        failures.push(`assurance_runs:${runs.error.message}`);
        assuranceCompleteness = "FAILED";
      } else if (!runs.data?.length) {
        assuranceCompleteness = "PARTIAL";
      } else {
        const latest = runs.data[0] as { completeness?: string; truncated?: boolean };
        if (latest.truncated || latest.completeness !== "COMPLETE") {
          assuranceCompleteness = (latest.completeness as LifecycleCompleteness) ?? "PARTIAL";
        }
      }

      const studies = await selectRows(client, "engineering_optimization_studies", query);
      const optRuns = await selectRows(client, "engineering_optimization_runs", query);
      const optimizationPresent = studies.rows.length > 0 || optRuns.rows.length > 0;
      for (const row of [...studies.rows, ...optRuns.rows]) {
        records.push(record(query, "optimization_study", String(row.id), String(row.status ?? "open"), { status: row.status }));
      }

      const documents = await selectRows(client, "engineering_documents", query, { projectColumn: false });
      if (documents.failed) failures.push(documents.reason ?? "documents");
      for (const row of documents.rows) {
        const status = String(row.status ?? "draft");
        records.push(
          record(
            query,
            "document",
            String(row.id),
            status,
            {
              documentNumber: String(row.document_number ?? ""),
              revision: String(row.revision ?? ""),
              status,
              titleHidden: true,
            },
            {
              version: String(row.revision ?? ""),
              superseded: status === "superseded" || status === "obsolete",
            },
          ),
        );
      }

      const items = await selectRows(client, "engineering_configuration_items", query, { projectColumn: false });
      if (items.failed) failures.push(items.reason ?? "configuration_items");
      const baselineById = new Map(records.filter((row) => row.objectType === "configuration_baseline").map((row) => [row.objectId, row]));
      for (const row of items.rows) {
        const baseline = baselineById.get(String(row.baseline_id ?? ""));
        records.push(
          record(query, "configuration_item", String(row.id), String(baseline?.state ?? "unknown"), {
            baselineId: String(row.baseline_id ?? ""),
            baselineStatus: baseline?.state ?? null,
            objectType: String(row.object_type ?? ""),
            objectId: String(row.object_id ?? ""),
            objectCode: row.object_code_snapshot,
            revisionRef: row.revision_ref,
          }, { version: row.revision_ref ? String(row.revision_ref) : null }),
        );
      }

      return {
        records,
        truncated,
        failed: failures.length > 0,
        failureReason: failures.length ? failures.join(";") : null,
        assuranceCompleteness,
        optimizationPolicy: "OPTIONAL",
        optimizationPresent,
      };
    },
  };
}
