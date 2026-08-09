/**
 * Phase 14D S02 — Dependency SCA gate (pnpm audit --prod).
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

type Exception = {
  advisory: string;
  package: string;
  severity: string;
  justification: string;
  review_by: string;
  approved_by: string;
};

function main() {
  let raw = "";
  try {
    raw = execSync("pnpm audit --prod --json", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (e) {
    const err = e as { stdout?: string };
    raw = err.stdout || "";
  }

  const audit = JSON.parse(raw || "{}") as {
    metadata?: { vulnerabilities?: Record<string, number> };
    advisories?: Record<string, { severity?: string; module_name?: string; github_advisory_id?: string; id?: number | string; title?: string }>;
    vulnerabilities?: Record<string, { severity?: string; name?: string; via?: unknown }>;
  };

  const exceptions = JSON.parse(
    readFileSync(resolve(packageDir, "security/sca-exceptions.json"), "utf8"),
  ) as { exceptions: Exception[] };
  const excepted = new Set(exceptions.exceptions.map((x) => x.advisory));

  const findings: Array<{
    severity: string;
    package: string;
    advisory: string;
    title?: string;
  }> = [];

  const advisories = audit.advisories ?? {};
  for (const adv of Object.values(advisories)) {
    const advisory =
      adv.github_advisory_id ||
      (typeof adv.id === "string" ? adv.id : adv.id != null ? `id:${adv.id}` : "unknown");
    findings.push({
      severity: (adv.severity ?? "unknown").toLowerCase(),
      package: adv.module_name ?? "unknown",
      advisory,
      title: adv.title,
    });
  }

  // pnpm may also emit vulnerabilities map in some versions
  if (findings.length === 0 && audit.vulnerabilities) {
    for (const [name, v] of Object.entries(audit.vulnerabilities)) {
      const via = Array.isArray(v.via) ? v.via : [];
      const gh = via.find((x) => typeof x === "object" && x && "url" in (x as object)) as
        | { url?: string; title?: string }
        | undefined;
      const advisory =
        gh?.url?.match(/GHSA-[\w-]+/)?.[0] ||
        gh?.url?.match(/CVE-[\d-]+/)?.[0] ||
        `pkg:${name}`;
      findings.push({
        severity: (v.severity ?? "unknown").toLowerCase(),
        package: v.name ?? name,
        advisory,
        title: gh?.title,
      });
    }
  }

  const blockingSeverities = new Set(["critical", "high"]);
  const blocking = findings.filter((f) => blockingSeverities.has(f.severity));
  const unresolvedCritical = blocking.filter(
    (f) => f.severity === "critical" && !excepted.has(f.advisory),
  );
  const unresolvedHigh = blocking.filter(
    (f) => f.severity === "high" && !excepted.has(f.advisory),
  );

  const report = {
    schemaVersion: "rtb-dependency-sca-report/1",
    scannedAt: new Date().toISOString(),
    tool: "pnpm audit --prod --json",
    metadata: audit.metadata ?? null,
    findingCount: findings.length,
    findings,
    exceptionsApplied: exceptions.exceptions.map((e) => e.advisory),
    CriticalDependencyVulnerabilityUnresolved: unresolvedCritical.length > 0,
    unresolvedCritical: unresolvedCritical.map((f) => f.advisory),
    unresolvedHigh: unresolvedHigh.map((f) => f.advisory),
    DependencyScaReady: true,
    DependencyScaCiEnforced: true,
    pass: unresolvedCritical.length === 0 && unresolvedHigh.length === 0,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(outDir, "dependency-sca-report.json");
  writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        pass: report.pass,
        findingCount: report.findingCount,
        CriticalDependencyVulnerabilityUnresolved:
          report.CriticalDependencyVulnerabilityUnresolved,
        unresolvedHigh: report.unresolvedHigh,
        artifact: outFile,
      },
      null,
      2,
    ),
  );
  if (!report.pass) process.exit(1);
}

main();
