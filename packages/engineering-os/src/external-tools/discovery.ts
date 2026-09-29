import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

/** Documented SPACE GASS HTTP API minimum from the existing live provider. Not an install claim. */
export const SPACE_GASS_API_MIN_VERSION = "14.5";
export const SPACE_GASS_DOCUMENTED_API_ENDPOINT = "http://localhost:34560/api/v1";
export const SPACE_GASS_DOCUMENTED_API_URLS = "http://localhost:34560";

export type SpaceGassInstallRecord = {
  installDir: string;
  executablePath: string | null;
  solverPath: string | null;
  apiExecutablePath: string | null;
  productVersion: string | null;
  fileVersion: string | null;
  labelledTrial: boolean;
  uninstallerName: string | null;
  documentedApiEndpoint: string | null;
};

export type SpaceGassApiProbe = {
  endpoint: string;
  reachable: boolean;
  status: "AVAILABLE" | "UNAVAILABLE";
  detail: string;
};

export type SpaceGassDiscoveryReport = {
  installed: boolean;
  installs: SpaceGassInstallRecord[];
  canonicalTrial: SpaceGassInstallRecord | null;
  apiInstall: SpaceGassInstallRecord | null;
  apiProbe: SpaceGassApiProbe;
  automationPermission: "REQUIRES_CONFIRMATION";
  automationEvidence:
    "Vendor or trial automation permission has not been independently evidenced. Executable or API presence is not permission.";
};

const PROGRAM_FILES = process.env.ProgramFiles ?? "C:\\Program Files";

function labelledTrialFromPath(installDir: string, uninstallerName: string | null): boolean {
  const haystack = `${installDir} ${uninstallerName ?? ""}`.toLowerCase();
  return haystack.includes("trial");
}

function findUninstaller(installDir: string): string | null {
  if (!existsSync(installDir)) return null;
  const names = readdirSync(installDir);
  const hit = names.find((name) => /^Uninstaller_.*\.exe$/i.test(name));
  return hit ?? null;
}

function windowsFileVersion(exePath: string): { fileVersion: string | null; productVersion: string | null } {
  if (process.platform !== "win32" || !existsSync(exePath)) {
    return { fileVersion: null, productVersion: null };
  }
  try {
    const script = [
      `$v = (Get-Item -LiteralPath '${exePath.replace(/'/g, "''")}').VersionInfo`,
      "Write-Output $v.FileVersion",
      "Write-Output $v.ProductVersion",
    ].join("; ");
    const out = execFileSync("powershell.exe", ["-NoProfile", "-Command", script], {
      encoding: "utf8",
      timeout: 8000,
      windowsHide: true,
    });
    const lines = out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return { fileVersion: lines[0] ?? null, productVersion: lines[1] ?? lines[0] ?? null };
  } catch {
    return { fileVersion: null, productVersion: null };
  }
}

function readDocumentedApiUrls(installDir: string): string | null {
  const settings = join(installDir, "appsettings.json");
  if (!existsSync(settings)) return null;
  try {
    const parsed = JSON.parse(readFileSync(settings, "utf8")) as { Urls?: string };
    return typeof parsed.Urls === "string" ? parsed.Urls : null;
  } catch {
    return null;
  }
}

export function inspectSpaceGassInstallDir(installDir: string): SpaceGassInstallRecord | null {
  if (!existsSync(installDir)) return null;
  const core = join(installDir, "SGCore.exe");
  const solver = join(installDir, "64", "SGSolver64.exe");
  const api = join(installDir, "SpaceGassAPI.exe");
  const uninstallerName = findUninstaller(installDir);
  const exe = existsSync(core) ? core : null;
  const versions = exe ? windowsFileVersion(exe) : { fileVersion: null, productVersion: null };
  const documentedUrls = readDocumentedApiUrls(installDir);
  return {
    installDir,
    executablePath: exe,
    solverPath: existsSync(solver) ? solver : null,
    apiExecutablePath: existsSync(api) ? api : null,
    productVersion: versions.productVersion,
    fileVersion: versions.fileVersion,
    labelledTrial: labelledTrialFromPath(installDir, uninstallerName),
    uninstallerName,
    documentedApiEndpoint: documentedUrls ? `${documentedUrls.replace(/\/$/, "")}/api/v1` : null,
  };
}

export function listCandidateSpaceGassDirs(programFiles = PROGRAM_FILES): string[] {
  const known = [
    join(programFiles, "SPACE GASS 14.2 (Trial)"),
    join(programFiles, "SPACE GASS 14.5"),
  ];
  const extra: string[] = [];
  if (existsSync(programFiles)) {
    for (const name of readdirSync(programFiles)) {
      if (/space\s*gass/i.test(name)) extra.push(join(programFiles, name));
    }
  }
  return [...new Set([...known, ...extra])];
}

/** Synchronous default: do not assume the API is up. Live callers use probeSpaceGassApiLive. */
export function probeSpaceGassApi(endpoint = SPACE_GASS_DOCUMENTED_API_ENDPOINT): SpaceGassApiProbe {
  return {
    endpoint,
    reachable: false,
    status: "UNAVAILABLE",
    detail: "live HTTP probe not performed in this path",
  };
}

export async function probeSpaceGassApiLive(
  endpoint = SPACE_GASS_DOCUMENTED_API_ENDPOINT,
): Promise<SpaceGassApiProbe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    return {
      endpoint,
      reachable: true,
      status: "AVAILABLE",
      detail: `http ${response.status}`,
    };
  } catch (error) {
    return {
      endpoint,
      reachable: false,
      status: "UNAVAILABLE",
      detail: error instanceof Error ? error.message : "unreachable",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function discoverSpaceGassInstalls(programFiles = PROGRAM_FILES): SpaceGassInstallRecord[] {
  return listCandidateSpaceGassDirs(programFiles)
    .map((dir) => inspectSpaceGassInstallDir(dir))
    .filter((row): row is SpaceGassInstallRecord => row != null);
}

export function buildSpaceGassDiscoveryReport(
  installs: SpaceGassInstallRecord[],
  apiProbe: SpaceGassApiProbe,
): SpaceGassDiscoveryReport {
  const canonicalTrial = installs.find((row) => row.labelledTrial) ?? null;
  const apiInstall = installs.find((row) => row.apiExecutablePath) ?? null;
  return {
    installed: installs.length > 0,
    installs,
    canonicalTrial,
    apiInstall,
    apiProbe: {
      ...apiProbe,
      status: apiProbe.reachable ? "AVAILABLE" : "UNAVAILABLE",
    },
    automationPermission: "REQUIRES_CONFIRMATION",
    automationEvidence:
      "Vendor or trial automation permission has not been independently evidenced. Executable or API presence is not permission.",
  };
}
