import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public build identity probe for deployment certification.
 * Never includes secrets or tokens beyond a non-sensitive build hash of public env markers.
 */
export async function GET() {
  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.GITHUB_SHA?.trim() ||
    process.env.NEXT_PUBLIC_BUILD_SHA?.trim() ||
    "unknown";
  const branch =
    process.env.VERCEL_GIT_COMMIT_REF?.trim() ||
    process.env.GITHUB_REF_NAME?.trim() ||
    "unknown";
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim() || null;
  const buildTimestamp = process.env.BUILD_TIMESTAMP?.trim() || new Date().toISOString();

  return NextResponse.json({
    ok: true,
    service: "rtb-ai-os",
    phase: "6C-3E.0",
    commitSha,
    branch,
    deploymentId,
    buildTimestamp,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    region: process.env.VERCEL_REGION ?? null,
  });
}
