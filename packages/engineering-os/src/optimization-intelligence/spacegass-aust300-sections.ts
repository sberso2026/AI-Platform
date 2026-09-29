import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Verified names copied from the installed SPACE GASS 14.2 Trial library
 * `Standard Libraries/LIBRARY_SECTION_Aust300.sls` `<Name>` fields.
 * Colloquial compact names (310UC97 / 360UB45) are not the library identifiers.
 */
export const AUST300_LIBRARY_FILE = "LIBRARY_SECTION_Aust300.sls";

export type VerifiedSteelSection = {
  libraryName: string;
  massKgPerM: number;
  role: "column" | "beam";
  colloquial: string | null;
  source: string;
};

export const VERIFIED_AUST300_SECTIONS: readonly VerifiedSteelSection[] = [
  {
    libraryName: "200 UC 59.5",
    massKgPerM: 59.5,
    role: "column",
    colloquial: "200UC60",
    source: "SPACE GASS LIBRARY_SECTION_Aust300.sls Name",
  },
  {
    libraryName: "250 UC 72.9",
    massKgPerM: 72.9,
    role: "column",
    colloquial: "250UC73",
    source: "SPACE GASS LIBRARY_SECTION_Aust300.sls Name",
  },
  {
    libraryName: "310 UC 96.8",
    massKgPerM: 96.8,
    role: "column",
    colloquial: "310UC97",
    source: "SPACE GASS LIBRARY_SECTION_Aust300.sls Name",
  },
  {
    libraryName: "310 UB 40.4",
    massKgPerM: 40.4,
    role: "beam",
    colloquial: "310UB40",
    source: "SPACE GASS LIBRARY_SECTION_Aust300.sls Name",
  },
  {
    libraryName: "360 UB 44.7",
    massKgPerM: 44.7,
    role: "beam",
    colloquial: "360UB45",
    source: "SPACE GASS LIBRARY_SECTION_Aust300.sls Name",
  },
  {
    libraryName: "360 UB 50.7",
    massKgPerM: 50.7,
    role: "beam",
    colloquial: "360UB51",
    source: "SPACE GASS LIBRARY_SECTION_Aust300.sls Name",
  },
] as const;

export const PILOT_COLUMN_CANDIDATES = ["200 UC 59.5", "250 UC 72.9", "310 UC 96.8"] as const;
export const PILOT_BEAM_CANDIDATES = ["310 UB 40.4", "360 UB 44.7", "360 UB 50.7"] as const;
export const PILOT_BASELINE_COLUMN = "310 UC 96.8";
export const PILOT_BASELINE_BEAM = "360 UB 44.7";

export function parseNominalMassKgPerM(libraryName: string): number | null {
  const match = libraryName.trim().match(/(\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function findVerifiedSection(libraryName: string): VerifiedSteelSection | undefined {
  return VERIFIED_AUST300_SECTIONS.find((row) => row.libraryName === libraryName);
}

export function extractLibrarySectionNames(xmlOrBinary: string): string[] {
  const names = new Set<string>();
  const re = /<Name>([^<]+)<\/Name>/g;
  let match: RegExpExecArray | null = re.exec(xmlOrBinary);
  while (match) {
    names.add(match[1].trim());
    match = re.exec(xmlOrBinary);
  }
  return [...names].sort();
}

export function aust300LibraryPath(installDir: string): string {
  return join(installDir, "Standard Libraries", AUST300_LIBRARY_FILE);
}

export function readInstalledAust300Names(installDir: string): string[] | null {
  const path = aust300LibraryPath(installDir);
  if (!existsSync(path)) return null;
  const ascii = readFileSync(path);
  return extractLibrarySectionNames(ascii.toString("latin1"));
}

export function verifyPilotSectionsAgainstLibrary(installedNames: string[] | null): {
  verified: boolean;
  missing: string[];
  source: string;
} {
  const required = [...PILOT_COLUMN_CANDIDATES, ...PILOT_BEAM_CANDIDATES];
  if (!installedNames) {
    return {
      verified: false,
      missing: required,
      source: "installed Aust300 library not readable",
    };
  }
  const missing = required.filter((name) => !installedNames.includes(name));
  return {
    verified: missing.length === 0,
    missing,
    source: AUST300_LIBRARY_FILE,
  };
}
