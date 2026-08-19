import type { BusinessWorkCapacityFact } from "@rtb/types";
import { BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS } from "@rtb/types";
import { parseMinor } from "../finance/money";

export function computeCapacityMetrics(input: {
  availableHoursMinor?: string | number | null;
  committedHoursMinor?: string | number | null;
  overcommitUtilizationBps?: number;
}): {
  utilizationBps: string | null;
  capacityStatus: BusinessWorkCapacityFact["capacityStatus"];
  unknownReasons: string[];
} {
  const available = parseMinor(input.availableHoursMinor ?? null);
  const committed = parseMinor(input.committedHoursMinor ?? null);
  const overcommit = input.overcommitUtilizationBps ?? BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS.overcommitUtilizationBps;
  const unknownReasons: string[] = [];
  if (available === null) unknownReasons.push("available_hours_unknown");
  if (committed === null) unknownReasons.push("committed_hours_unknown");
  if (available === null || committed === null) {
    return { utilizationBps: null, capacityStatus: "unknown", unknownReasons };
  }
  if (available === 0n) {
    return {
      utilizationBps: null,
      capacityStatus: committed > 0n ? "overcommitted" : "unknown",
      unknownReasons: committed > 0n ? [] : ["zero_available_hours"],
    };
  }
  const utilizationBps = (committed * 10000n) / available;
  if (committed > available || utilizationBps >= BigInt(overcommit)) {
    return { utilizationBps: utilizationBps.toString(), capacityStatus: "overcommitted", unknownReasons: [] };
  }
  if (utilizationBps >= 8500n) {
    return { utilizationBps: utilizationBps.toString(), capacityStatus: "watch", unknownReasons: [] };
  }
  return { utilizationBps: utilizationBps.toString(), capacityStatus: "ok", unknownReasons: [] };
}
