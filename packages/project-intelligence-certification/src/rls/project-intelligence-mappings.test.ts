import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

describe.skipIf(!enabled)("Gate C — real-JWT Project Intelligence mapping RLS", () => {
  it("requires a real user JWT and hosted endpoint in certification mode", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fixturesPath = resolve(process.cwd(), "../installation-certification/artifacts/cert-fixtures.json");
    expect(existsSync(fixturesPath), "installation certification must provision real JWT fixtures").toBe(true);
    const fixtures = JSON.parse(readFileSync(fixturesPath, "utf8")) as {
      tenantA: { users: { owner: { jwt: string } } };
    };
    const jwt = fixtures.tenantA.users.owner.jwt;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(jwt, "real certification JWT").toBeTruthy();

    const response = await fetch(`${url}/rest/v1/project_intelligence_project_mappings?select=id&limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        Authorization: `Bearer ${jwt}`,
      },
    });
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(500);
  });
});
