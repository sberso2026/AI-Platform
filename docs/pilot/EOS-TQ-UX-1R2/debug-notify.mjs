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

// Check all recent notifications
const r1 = await fetch(`${supabaseUrl}/rest/v1/notifications?select=*&order=created_at.desc&limit=30`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
const notifications = await r1.json();
console.log("All recent notifications:", JSON.stringify(notifications?.slice(0, 10), null, 2));

// Check if there's another notification table (e.g. kernel_notifications, platform_notifications)
const tables = ["kernel_notifications", "platform_notifications", "user_notifications", "notification_events"];
for (const table of tables) {
  const r = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=5`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  if (r.status === 200) {
    const data = await r.json();
    console.log(`Table ${table}:`, JSON.stringify(data?.slice(0, 3), null, 2));
  } else {
    console.log(`Table ${table}: ${r.status} (not found)`);
  }
}

// Check the kernel.notifications.create method — is it the same as supabase notifications table?
// Check how notifications table is structured
const schema = await fetch(`${supabaseUrl}/rest/v1/notifications?select=id,user_id,title,type,link_target,created_at&limit=5`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
const schemaData = await schema.json();
console.log("notifications schema check:", JSON.stringify(schemaData?.slice(0, 5), null, 2));
