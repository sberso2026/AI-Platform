/**
 * EOS-A15A-V4D: classify Crusher certification MTO snapshots.
 * Never deletes. Never prints secrets, JWTs, or connection strings.
 */
import { classifyMtoSnapshotHygiene } from "../../engineering-os/src/lifecycle-intelligence/quantity-mto-hygiene.ts";
import {
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "../src/env";
import { restFetch } from "../src/live-http";

const CRUSHER_PROJECT = "5ff80da9-1414-4db3-b1f0-e9a7827920d4";
const WORK_PLAN = "c2e4cb45-c531-49b3-b56f-52187d4fc800";
const KNOWN_FAILED_SEEDS = new Set([
  "ba02df50-2608-4867-ad50-17287326a625",
]);

type SnapshotRow = {
  id: string;
  revision: string;
  status: string;
  verification_state: string;
  snapshot_fingerprint: string;
  work_plan_id: string | null;
  created_at: string;
  supersedes_snapshot_id: string | null;
};

type ArtifactRow = { id: string; status: string; provenance: { mtoSnapshotId?: string | null } | null };
type LinkRow = { from_id: string; to_id: string; relationship: string };

async function main() {
  loadLocalEnv();
  const url = resolveSupabaseUrl();
  const anon = resolveSupabaseAnonKey();
  const service = resolveServiceRoleKey();
  if (!url || !anon || !service) {
    console.log(JSON.stringify({ ok: false, reason: "hosted_credentials_missing" }));
    process.exit(1);
  }
  const rest = (path: string) => restFetch(url, anon, service, path, {}, service);
  const snapshots = await rest(
    `engineering_mto_snapshots?select=id,revision,status,verification_state,snapshot_fingerprint,work_plan_id,created_at,supersedes_snapshot_id&project_id=eq.${CRUSHER_PROJECT}&work_plan_id=eq.${WORK_PLAN}&order=created_at.desc`,
  );
  const artifacts = await rest(
    `engineering_generated_artifacts?select=id,status,provenance&project_id=eq.${CRUSHER_PROJECT}&work_plan_id=eq.${WORK_PLAN}`,
  );
  const snapshotRows = Array.isArray(snapshots.body) ? snapshots.body as SnapshotRow[] : [];
  const artifactRows = Array.isArray(artifacts.body) ? artifacts.body as ArtifactRow[] : [];
  const ids = snapshotRows.map((row) => row.id);
  const links = ids.length === 0
    ? { body: [] as LinkRow[] }
    : await rest(
      `engineering_object_links?select=from_id,to_id,relationship&or=(${ids.map((id) => `from_id.eq.${id}`).join(",")},${ids.map((id) => `to_id.eq.${id}`).join(",")})`,
    );
  const linkRows = Array.isArray(links.body) ? links.body as LinkRow[] : [];
  const current = snapshotRows.find((row) => row.status !== "SUPERSEDED") ?? snapshotRows[0] ?? null;
  const inventory = snapshotRows.map((row) => {
    const referencedByArtifactIds = artifactRows
      .filter((art) => art.provenance?.mtoSnapshotId === row.id)
      .map((art) => art.id);
    const referencedByObjectLinkCount = linkRows.filter((link) => link.from_id === row.id || link.to_id === row.id).length;
    const classified = classifyMtoSnapshotHygiene({
      id: row.id,
      status: row.status,
      revision: row.revision,
      workPlanId: row.work_plan_id,
      snapshotFingerprint: row.snapshot_fingerprint,
      currentSnapshotId: current?.id ?? null,
      referencedByArtifactIds,
      referencedByObjectLinkCount,
      referencedByChangeImpact: false,
      referencedByReview: false,
      knownFailedSeed: KNOWN_FAILED_SEEDS.has(row.id),
    });
    return {
      ...classified,
      revision: row.revision,
      status: row.status,
      verification_state: row.verification_state,
      fingerprint: row.snapshot_fingerprint,
      created_at: row.created_at,
      supersedes_snapshot_id: row.supersedes_snapshot_id,
      referencedByArtifactIds,
      referencedByObjectLinkCount,
    };
  });
  console.log(JSON.stringify({
    ok: true,
    deleted: false,
    snapshots: inventory,
    currentSnapshotId: current?.id ?? null,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.log(JSON.stringify({ ok: false, reason: error instanceof Error ? error.message : "inventory_failed" }));
  process.exit(1);
});
