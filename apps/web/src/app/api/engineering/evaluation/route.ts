import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { buildEvaluationReport } from "@rtb/engineering-os";

/**
 * Admin-oriented evaluation report (benchmark fixtures).
 * Marked adminOnly in payload; commerce product seat still required.
 */
export const GET = withEngineeringApi("settings", async () => {
  const report = buildEvaluationReport({ now: new Date() });
  return NextResponse.json({
    data: {
      ...report,
      accessNote: "Evaluation surface is intended for admins/operators — benchmark ≠ live ROI.",
    },
  });
});
