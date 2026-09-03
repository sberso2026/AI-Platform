import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(file) {
  const env = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 1) continue;
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).replace(/^"|"$/g, "");
    }
  } catch { return env; }
  return env;
}

const env = { ...loadEnv(resolve("apps/web/.env.local")), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Check auth.users for RTB Pilot Launch Admin
const pilotAdminId = "86f21420-0e2c-493d-a44b-fa58630a0968";
const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${pilotAdminId}`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
console.log("auth user status:", authRes.status);
const authUser = await authRes.json().catch(() => null);
console.log("auth user:", JSON.stringify(authUser, null, 2));

// Try to insert a test notification for pilot admin
const testInsert = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    tenant_id: "8195e176-5f9f-449a-a1d3-2aedaf403989",
    user_id: pilotAdminId,
    type: "task.assigned",
    title: "Test notification for RTB Pilot Launch Admin",
    body: "Test",
    priority: "normal",
    link_target: "/test",
    metadata: {},
  }),
});
console.log("test notification insert status:", testInsert.status);
const testData = await testInsert.json().catch(() => null);
console.log("test notification result:", JSON.stringify(testData, null, 2));
