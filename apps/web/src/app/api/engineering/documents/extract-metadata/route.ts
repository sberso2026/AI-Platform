import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  DOCUMENT_BUCKET,
  documentStorageClient,
  isScopedDocumentPath,
} from "@/lib/engineering/document-storage";
import {
  proposeDocumentMetadataFromFilename,
  proposeDocumentMetadataFromText,
  type ProposedDocumentMetadata,
} from "@rtb/engineering-os";

async function proposeFromStoredSource(input: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<ProposedDocumentMetadata> {
  const fromName = proposeDocumentMetadataFromFilename(input.fileName);
  if (input.bytes.byteLength === 0) return fromName;
  const lower = input.fileName.toLowerCase();
  if (input.mimeType === "text/plain" || lower.endsWith(".txt")) {
    return proposeDocumentMetadataFromText(new TextDecoder().decode(input.bytes), input.fileName);
  }
  try {
    const { proposeDocumentMetadataFromSource } = await import(
      "@rtb/project-intelligence/metadata-proposal"
    );
    return await proposeDocumentMetadataFromSource({
      fileName: input.fileName,
      mimeType: input.mimeType,
      bytes: input.bytes,
    });
  } catch {
    return { ...fromName, provenance: "filename_parse_failed", lowConfidence: true };
  }
}

export const POST = withEngineeringApi("documents", async ({ ctx, correlationId }, request) => {
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse("workspace_required", "Workspace required", 403, correlationId);
  }
  const body = (await request.json()) as {
    objectPath?: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  const objectPath = String(body.objectPath ?? "");
  const fileName = String(body.fileName ?? "document");
  const mimeType = String(body.mimeType ?? "application/octet-stream");
  const sizeBytes = Number(body.sizeBytes ?? 0);
  if (!isScopedDocumentPath(objectPath, ctx.tenantId, ctx.workspaceId)) {
    return lifecycleErrorResponse("forbidden", "File is outside this workspace", 403, correlationId);
  }

  const filenameFallback = proposeDocumentMetadataFromFilename(fileName);
  if (sizeBytes > 2 * 1024 * 1024) {
    return NextResponse.json({
      data: { ...filenameFallback, provenance: filenameFallback.provenance || "filename_size_limited" },
    });
  }
  const storage = await documentStorageClient();
  if (!storage) {
    return NextResponse.json({ data: filenameFallback });
  }
  try {
    const downloaded = await storage.storage.from(DOCUMENT_BUCKET).download(objectPath);
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json({ data: { ...filenameFallback, provenance: "filename_download_failed" } });
    }
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    const proposed = await proposeFromStoredSource({
      fileName,
      mimeType,
      bytes: bytes.byteLength > 2 * 1024 * 1024 ? bytes.slice(0, 2 * 1024 * 1024) : bytes,
    });
    return NextResponse.json({ data: proposed });
  } catch {
    return NextResponse.json({ data: filenameFallback });
  }
});
