import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("ERA-5 Engineering Review MUP", () => {
  it("exposes only the minimum /review routes", () => {
    const home = readApp("src/app/(platform)/review/page.tsx");
    const project = readApp("src/app/(platform)/review/projects/[projectId]/page.tsx");
    const pkg = readApp("src/app/(platform)/review/projects/[projectId]/packages/[packageId]/page.tsx");
    expect(home).toContain("/api/review/projects");
    expect(project).toContain("/api/review/projects/");
    expect(project).toContain("Create review package");
    expect(pkg).toContain("Run review");
    expect(pkg).toContain("Review Register");
    expect(pkg).toContain("Open source document");
  });

  it("keeps client pages free of service-role and secret material", () => {
    const files = [
      "src/app/(platform)/review/page.tsx",
      "src/app/(platform)/review/projects/[projectId]/page.tsx",
      "src/app/(platform)/review/projects/[projectId]/packages/[packageId]/page.tsx",
      "src/lib/review/labels.ts",
    ];
    for (const file of files) {
      const body = readApp(file);
      expect(body, file).not.toMatch(/SERVICE_ROLE|createServiceClient|COMMERCE_AUTH_SECRET|encryptPlaceholder/);
      expect(body, file).not.toContain("from \"@/lib/review/runtime\"");
    }
  });

  it("requires authentication and does not trust browser-supplied tenant/workspace", () => {
    const guard = readApp("src/lib/review/with-review-api.ts");
    const runtime = readApp("src/lib/review/runtime.ts");
    const create = readApp("src/app/api/review/projects/[projectId]/packages/route.ts");
    expect(guard).toContain("getAuthContext");
    expect(guard).toContain("unauthenticatedResponse");
    expect(guard).toContain("identity_assurance_insufficient");
    expect(guard).toContain("evaluateReviewIdentityPolicy");
    expect(runtime).toContain('kind: "authenticated"');
    expect(runtime).toContain("bindTrustedReviewAudit");
    expect(runtime).toContain("assertReviewSecuritySchemaOrThrow");
    expect(runtime).toContain("createServiceClient");
    expect(runtime).toContain(".eq(\"workspace_id\", actor.workspaceId)");
    expect(create).not.toMatch(/tenantId:\s*body/);
    expect(create).not.toMatch(/workspaceId:\s*body/);
  });

  it("renders readiness, disclaimer, zero-finding, and distinct confidence/severity", () => {
    const labels = readApp("src/lib/review/labels.ts");
    const pkg = readApp("src/app/(platform)/review/projects/[projectId]/packages/[packageId]/page.tsx");
    expect(labels).toContain("READY");
    expect(labels).toContain("OCR REQUIRED");
    expect(labels).toContain("UNSUPPORTED");
    expect(labels).toContain("No findings were identified within the selected review scope.");
    expect(labels).not.toMatch(/Design is safe|Design complies|Design approved|No engineering issues exist/);
    expect(pkg).toContain("not a risk rating");
    expect(pkg).toContain("Code compliance");
    expect(pkg).not.toContain("autonomous signoff");
  });

  it("does not use platform placeholder secret encryption on Review production paths", () => {
    const runtime = readApp("src/lib/review/runtime.ts");
    const secrets = readFileSync(
      resolve(WEB_ROOT, "../../packages/platform-intelligence/src/secret-management/secret-management-service.ts"),
      "utf8",
    );
    expect(secrets).toContain("encryptPlaceholder");
    expect(runtime).not.toContain("encryptPlaceholder");
    expect(runtime).not.toContain("SecretManagementService");
    expect(runtime).not.toContain("COMMERCE_AUTH_SECRET");
    expect(runtime).toContain("createServiceClient");
    expect(runtime).toContain("defaultReviewFileIngestionPolicy");
  });
});
