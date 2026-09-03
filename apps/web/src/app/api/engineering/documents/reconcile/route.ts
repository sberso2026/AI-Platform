import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";

const OPERATOR_ROLES = new Set(["owner", "admin", "operator"]);

export const POST = withEngineeringApi("documents", async ({ ctx, commerce, correlationId }, request) => {
  if (!OPERATOR_ROLES.has(ctx.roleSlug)) {
    return lifecycleErrorResponse("forbidden", "Document reconciliation is limited to operators", 403, correlationId);
  }
  const body = (await request.json()) as {
    canonicalDocumentId?: string;
    artifactIds?: string[];
    reason?: string;
    canonicalRevision?: string;
    canonicalNumber?: string;
  };
  const canonicalDocumentId = String(body.canonicalDocumentId ?? "");
  const artifactIds = Array.isArray(body.artifactIds) ? body.artifactIds.map(String) : [];
  if (!canonicalDocumentId || artifactIds.length === 0) {
    return lifecycleErrorResponse("invalid_request", "Canonical document and artifact ids are required", 422, correlationId);
  }
  const data = await ctx.engineering.documents.supersedeIdentityArtifacts(commerce, ctx.tenantId, {
    canonicalDocumentId,
    artifactIds,
    reason: String(body.reason ?? "eos-ai-doc-2 identity reconciliation"),
    canonicalRevision: body.canonicalRevision,
    canonicalNumber: body.canonicalNumber,
    extraCanonicalMetadata: {
      eos_ai_doc_2: true,
    },
  });
  return NextResponse.json({ data });
});
