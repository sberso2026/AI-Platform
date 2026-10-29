/**
 * Phase 9K — production SLO model (operating objectives, not contractual SLA).
 */

export type SloDefinition = {
  id: string;
  sli: string;
  targetSlo: string;
  measurementSource: string;
  warningThreshold: string;
  criticalThreshold: string;
  alert: string;
  escalation: string;
  runbookRef: string;
  contractualSlaClaimed: false;
};

export const INSPECTION_V1_SLO_CATALOG: readonly SloDefinition[] = [
  {
    id: "api.availability",
    sli: "successful_slice_and_page_responses / total",
    targetSlo: "99.5% monthly (objective)",
    measurementSource: "platform_http_metrics",
    warningThreshold: "availability < 99.8%",
    criticalThreshold: "availability < 99.5%",
    alert: "ii_api_availability_warning",
    escalation: "engineering_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#api",
    contractualSlaClaimed: false,
  },
  {
    id: "session.operations",
    sli: "session_command_success_rate",
    targetSlo: "99% success (objective)",
    measurementSource: "ii_session_service_metrics",
    warningThreshold: "error_rate > 1%",
    criticalThreshold: "error_rate > 5%",
    alert: "ii_session_error_rate",
    escalation: "engineering_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_INCIDENT_RESPONSE.md#session",
    contractualSlaClaimed: false,
  },
  {
    id: "evidence.upload",
    sli: "evidence_upload_success_within_timeout",
    targetSlo: "p95 < 10s (objective)",
    measurementSource: "platform_files_metrics",
    warningThreshold: "p95 > 10s",
    criticalThreshold: "p95 > 30s or failure_rate > 5%",
    alert: "ii_evidence_upload_latency",
    escalation: "platform_files_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#evidence",
    contractualSlaClaimed: false,
  },
  {
    id: "sync.reconciliation",
    sli: "offline_queue_reconcile_success",
    targetSlo: "queue_depth drain within 15m (objective)",
    measurementSource: "ii_offline_sync_metrics",
    warningThreshold: "queue_depth > 100",
    criticalThreshold: "queue_depth > 500 or lag > 60m",
    alert: "ii_sync_backlog",
    escalation: "engineering_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#offline-sync",
    contractualSlaClaimed: false,
  },
  {
    id: "workflow.transitions",
    sli: "workflow_transition_success",
    targetSlo: "99% (objective)",
    measurementSource: "engineering_workflow_metrics",
    warningThreshold: "stuck > 10",
    criticalThreshold: "stuck > 50",
    alert: "ii_workflow_stuck",
    escalation: "engineering_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_INCIDENT_RESPONSE.md#workflow",
    contractualSlaClaimed: false,
  },
  {
    id: "reporting.generation",
    sli: "report_prep_success",
    targetSlo: "p95 < 30s (objective)",
    measurementSource: "ii_reporting_metrics",
    warningThreshold: "p95 > 30s",
    criticalThreshold: "failure_rate > 5%",
    alert: "ii_reporting_latency",
    escalation: "engineering_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#reporting",
    contractualSlaClaimed: false,
  },
  {
    id: "vision.analysis",
    sli: "vision_provider_success_or_abstain",
    targetSlo: "fail_closed; no silent fallback",
    measurementSource: "ii_vision_provider_metrics",
    warningThreshold: "outage > 5m",
    criticalThreshold: "outage > 30m",
    alert: "ii_vision_provider_unavailable",
    escalation: "ai_platform_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#ai-vision",
    contractualSlaClaimed: false,
  },
  {
    id: "events.processing",
    sli: "event_bus_delivery_ack",
    targetSlo: "p95 < 5s (objective)",
    measurementSource: "platform_event_bus_metrics",
    warningThreshold: "lag > 30s",
    criticalThreshold: "lag > 5m",
    alert: "ii_event_lag",
    escalation: "platform_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_INCIDENT_RESPONSE.md#events",
    contractualSlaClaimed: false,
  },
  {
    id: "notifications.delivery",
    sli: "notification_accept_rate",
    targetSlo: "98% (objective)",
    measurementSource: "platform_notifications_metrics",
    warningThreshold: "failure_rate > 2%",
    criticalThreshold: "failure_rate > 10%",
    alert: "ii_notification_failures",
    escalation: "platform_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#notifications",
    contractualSlaClaimed: false,
  },
  {
    id: "pack.registration",
    sli: "pack_install_validation_success",
    targetSlo: "100% of approved packs validate",
    measurementSource: "ii_pack_registry_metrics",
    warningThreshold: "validation_fail > 0",
    criticalThreshold: "incompatible_accepted",
    alert: "ii_pack_validation_fail",
    escalation: "engineering_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_ROLLBACK.md#pack",
    contractualSlaClaimed: false,
  },
  {
    id: "provider.health",
    sli: "approved_provider_availability",
    targetSlo: "fail closed when unavailable",
    measurementSource: "ii_provider_health",
    warningThreshold: "degraded",
    criticalThreshold: "unavailable",
    alert: "ii_provider_health",
    escalation: "ai_platform_oncall",
    runbookRef: "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md#providers",
    contractualSlaClaimed: false,
  },
] as const;

export function assertSloCatalogComplete(): {
  ok: true;
  count: number;
  contractualSlaClaimed: false;
} {
  if (INSPECTION_V1_SLO_CATALOG.length < 10) throw new Error("slo_catalog_incomplete");
  for (const s of INSPECTION_V1_SLO_CATALOG) {
    if (s.contractualSlaClaimed) throw new Error(`sla_claimed:${s.id}`);
  }
  return { ok: true, count: INSPECTION_V1_SLO_CATALOG.length, contractualSlaClaimed: false };
}
