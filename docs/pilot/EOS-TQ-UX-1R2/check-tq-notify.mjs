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

const tqId = "70f5b643-0385-47ce-9b3a-a6fdfef96789"; // TQ-014

const r = await fetch(`${supabaseUrl}/rest/v1/notifications?link_target=like.*${tqId}*&select=*&order=created_at.asc`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
const data = await r.json();
console.log("Notifications for TQ-014:", JSON.stringify(data, null, 2));

// Also check notification_deliveries
const r2 = await fetch(`${supabaseUrl}/rest/v1/notification_deliveries?select=*&order=sent_at.desc&limit=20`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
console.log("notification_deliveries status:", r2.status);
const deliveries = await r2.json().catch(() => null);
console.log("deliveries:", JSON.stringify(deliveries?.slice(0, 5), null, 2));
