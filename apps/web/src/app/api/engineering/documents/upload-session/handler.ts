import { NextResponse } from "next/server";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import { createDocumentSignedUpload, inferDocumentMimeType } from "@/lib/engineering/document-storage";
import { validateDocumentStoragePolicy, DOCUMENT_MAX_UPLOAD_BYTES } from "@rtb/project-intelligence";
import { pilotFileIngestionEnabled } from "@/lib/pilot/pilot-controls";

const CLOSED_MESSAGE =
  "File upload is excluded from this controlled pilot until a hosted malware scan is available. The file was not accepted.";

async function handleUpload(
  { ctx, correlationId }: { ctx: { tenantId: string; workspaceId?: string }; correlationId: string },
  request: Request,
) {
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse("workspace_required", "Workspace required", 403, correlationId);
  }
  const body = (await request.json()) as {
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    documentId?: string;
    revision?: string;
  };
  const fileName = String(body.fileName ?? "").trim();
  if (!fileName) {
    return lifecycleErrorResponse("invalid_request", "File name is required", 422, correlationId);
  }
  const mimeType = inferDocumentMimeType(fileName, body.mimeType);
  validateDocumentStoragePolicy({
    mimeType,
    fileName,
    sizeBytes: Number(body.sizeBytes ?? 0),
  });

  try {
    const session = await createDocumentSignedUpload({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      documentId: body.documentId,
      revision: body.revision,
      fileName,
    });
    if (!session) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        "Document storage is not configured",
        503,
        correlationId,
      );
    }
    return NextResponse.json({
      data: {
        ...session,
        mimeType,
        fileName,
        maxBytes: DOCUMENT_MAX_UPLOAD_BYTES,
      },
    });
  } catch {
    return lifecycleErrorResponse(
      "document_storage_unavailable",
      "Could not store the file. Try again or contact support.",
      503,
      correlationId,
    );
  }
}

export async function POST(request: Request) {
  if (!pilotFileIngestionEnabled()) {
    return NextResponse.json(
      { error: { code: "pilot_file_upload_disabled", message: CLOSED_MESSAGE } },
      { status: 403 },
    );
  }
  const { withEngineeringApi } = await import("@/lib/commerce/engineering-api");
  return withEngineeringApi("documents", handleUpload as never)(request);
}
