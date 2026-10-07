import type { MigrationRecord } from "./types";

export type DriftReport = {
  readOnly: true;
  synchronizesEnvironments: false;
  counts: {
    inventoried: number;
    stagingApplied: number;
    productionApplied: number;
    stagingOnly: number;
    stagingValidated: number;
    development: number;
    productionApprovedNotApplied: number;
    securityBackports: number;
    blocked: number;
    superseded: number;
    unknownDrift: number;
  };
  stagingOnly: string[];
  productionApplied: string[];
  productionApprovedNotApplied: string[];
  unknownDrift: string[];
  blocked: string[];
  securityBackports: string[];
  superseded: string[];
  development: string[];
};

export function driftReport(records: MigrationRecord[]): DriftReport {
  const pick = (pred: (row: MigrationRecord) => boolean) =>
    records.filter(pred).map((row) => row.id);

  const stagingOnly = pick((row) => row.releaseState === "STAGING_ONLY");
  const productionApplied = pick((row) => row.productionApplied);
  const productionApprovedNotApplied = pick(
    (row) => row.releaseState === "PRODUCTION_APPROVED" && !row.productionApplied,
  );
  const unknownDrift = pick((row) => row.driftClass === "UNKNOWN_DRIFT");
  const blocked = pick((row) => row.releaseState === "BLOCKED");
  const securityBackports = pick((row) => row.driftClass === "SECURITY_BACKPORT");
  const superseded = pick((row) => row.releaseState === "SUPERSEDED");
  const development = pick((row) => row.releaseState === "DEVELOPMENT");
  const stagingValidated = pick((row) => row.releaseState === "STAGING_VALIDATED");

  return {
    readOnly: true,
    synchronizesEnvironments: false,
    counts: {
      inventoried: records.length,
      stagingApplied: records.filter((row) => row.stagingApplied).length,
      productionApplied: records.filter((row) => row.productionApplied).length,
      stagingOnly: stagingOnly.length,
      stagingValidated: stagingValidated.length,
      development: development.length,
      productionApprovedNotApplied: productionApprovedNotApplied.length,
      securityBackports: securityBackports.length,
      blocked: blocked.length,
      superseded: superseded.length,
      unknownDrift: unknownDrift.length,
    },
    stagingOnly,
    productionApplied,
    productionApprovedNotApplied,
    unknownDrift,
    blocked,
    securityBackports,
    superseded,
    development,
  };
}
