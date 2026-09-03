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

const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.silvestre.berso@rtbea.com.au&select=id,full_name,email,metadata`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
const profiles = await profileRes.json();
console.log("profiles:", JSON.stringify(profiles, null, 2));

// Patch full_name if it looks like a local-part (no space, all lowercase)
const needsPatch = profiles.length > 0 && (
  !profiles[0].full_name || /^[a-z0-9][a-z0-9._-]+$/.test(profiles[0].full_name)
);
if (needsPatch) {
  const patchRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profiles[0].id}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ full_name: "Silvestre Berso" }),
  });
  const patched = await patchRes.json();
  console.log("patched:", JSON.stringify(patched, null, 2));
}
