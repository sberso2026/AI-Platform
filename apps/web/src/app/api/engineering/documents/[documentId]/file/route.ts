import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLOSED_MESSAGE =
  "Request a signed upload session instead of posting the file to this route. multipart/form-data is not accepted.";

export async function GET(request: Request, context: { params: Promise<{ documentId: string }> }) {
  const handler = await import("./handler");
  return handler.GET(request, context);
}

export async function POST() {
  return NextResponse.json(
    { error: { code: "document_direct_upload_required", message: CLOSED_MESSAGE } },
    { status: 422 },
  );
}
