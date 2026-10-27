import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { controlledPilotEnabled } from "../../../../packages/engineering-os/src/pilot/a14a-profile";
import {
  ENGINEERING_AUTHORITY_NOTICE,
  PILOT_DATA_NOTICE,
  PILOT_FILE_UPLOAD_REQUIRED,
  adminRoleIsEngineeringAuthority,
  buildPilotFeedbackRecord,
  currentUserFailureResponse,
  pilotFileIngestionEnabled,
  pilotKillSwitchSuspended,
} from "../lib/pilot/pilot-controls";

describe("EOS pilot operational readiness controls", () => {
  it("keeps the kill switch aligned with the existing pilot profile", () => {
    const suspended = { EOS_CONTROLLED_PILOT_ENABLED: "0" } as unknown as NodeJS.ProcessEnv;
    const unset = {} as unknown as NodeJS.ProcessEnv;
    expect(pilotKillSwitchSuspended(suspended)).toBe(true);
    expect(controlledPilotEnabled(suspended)).toBe(false);
    expect(pilotKillSwitchSuspended(unset)).toBe(false);
    expect(controlledPilotEnabled(unset)).toBe(true);
  });

  it("fails closed for file ingestion when no scanner is configured", () => {
    expect(PILOT_FILE_UPLOAD_REQUIRED).toBe(false);
    expect(pilotFileIngestionEnabled({} as unknown as NodeJS.ProcessEnv)).toBe(false);
  });

  it("returns an intentional authentication response without an error detail", () => {
    const denied = currentUserFailureResponse(false);
    expect(denied.status).toBe(401);
    expect(denied.body).toEqual({ error: "Unauthorized" });
    expect(JSON.stringify(denied.body)).not.toMatch(/stack|token|secret/i);
    expect(currentUserFailureResponse(true).status).toBe(500);
    expect(currentUserFailureResponse(true).body.error).toBe("Internal Server Error");
  });

  it("separates pilot admin and feedback from engineering authority", () => {
    for (const role of ["owner", "admin", "member", "viewer", "ai"]) {
      expect(adminRoleIsEngineeringAuthority(role)).toBe(false);
    }
    const record = buildPilotFeedbackRecord({
      category: "defect",
      severity: "high",
      description: "Synthetic pilot note",
    });
    expect(record.ok).toBe(true);
    if (!record.ok) return;
    expect(record.metadata.engineeringApproval).toBe(false);
    expect(record.metadata.certification).toBe(false);
    expect(record.metadata.qualifiedReviewer).toBe(false);
    expect(PILOT_DATA_NOTICE).toMatch(/controlled pilot/i);
    expect(PILOT_DATA_NOTICE).not.toMatch(/SOC 2|ISO 27001/i);
    expect(ENGINEERING_AUTHORITY_NOTICE).toMatch(/not engineering approval/);
    expect(ENGINEERING_AUTHORITY_NOTICE).toMatch(/D1G solver qualification is separate/);
    expect(ENGINEERING_AUTHORITY_NOTICE).toMatch(/D1L project certification is separate/);
  });

  it("wires the controls into the login, upload, and current-user surfaces", () => {
    const root = resolve(__dirname, "../../");
    const login = readFileSync(resolve(root, "src/app/(auth)/login/page.tsx"), "utf8");
    const currentUser = readFileSync(resolve(root, "src/app/api/platform/current-user/route.ts"), "utf8");
    const uploadSession = readFileSync(resolve(root, "src/app/api/engineering/documents/upload-session/route.ts"), "utf8");
    const users = readFileSync(resolve(root, "src/app/(platform)/users/page.tsx"), "utf8");
    expect(login).toContain("PilotDataNotice");
    expect(login).toContain("EngineeringAuthorityNotice");
    const notices = readFileSync(resolve(root, "src/components/pilot/pilot-notices.tsx"), "utf8");
    expect(notices).toContain("pilot-data-notice");
    expect(notices).toContain("engineering-authority-notice");
    expect(currentUser).toContain("currentUserFailureResponse");
    expect(uploadSession).toContain("pilot_file_upload_disabled");
    expect(users).toContain("not an engineering validator");
    const members = readFileSync(resolve(root, "src/app/api/platform/identity/members/route.ts"), "utf8");
    const membersHandler = readFileSync(resolve(root, "src/app/api/platform/identity/members/handler.ts"), "utf8");
    expect(members).toContain("Unauthorized");
    expect(membersHandler).toContain("membershipStatus");
    expect(membersHandler).toContain("getPilotSession");
    expect(membersHandler).not.toContain("from \"@/lib/kernel\"");
    expect(members).not.toContain("from \"@/lib/kernel\"");
    const migration = readFileSync(
      resolve(root, "../../supabase/migrations/20261027233000_eos_pilot_storage_writes_closed.sql"),
      "utf8",
    );
    expect(migration).toContain("DROP POLICY IF EXISTS tenant_documents_insert");
    expect(migration).toContain("tenant_documents_insert_closed");
    expect(migration).toContain("engineering_documents_insert_closed");
    expect(migration).not.toContain("DROP POLICY IF EXISTS tenant_documents_select");
    expect(migration).not.toMatch(/DROP TABLE|TRUNCATE|DELETE FROM/i);
    const middleware = readFileSync(resolve(root, "src/middleware.ts"), "utf8");
    expect(middleware).toContain("logPilotEdgeEvent");
  });
});
