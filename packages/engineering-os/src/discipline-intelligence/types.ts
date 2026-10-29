import type {
  CanonicalDisciplineCode,
  DisciplineCapabilityKey,
  DisciplineCapabilityStatus,
  DisciplineObjectKind,
  DisciplineParticipationRole,
  DisciplineReadiness,
  InterfaceInformationStatus,
} from "./catalog";

export type DisciplineCapabilityRecord = {
  key: DisciplineCapabilityKey;
  declaredStatus: DisciplineCapabilityStatus;
  effectiveStatus: DisciplineCapabilityStatus;
  toolIndependent: boolean;
  preferredToolCode: string | null;
  notes: string;
};

export type DisciplineStandardReference = {
  standardCode: string;
  edition: string | null;
  sourceReference: string;
  applicability: string;
  status: "CONFIGURED" | "PROPOSED" | "SUPERSEDED" | "WITHDRAWN";
  effectiveDate: string | null;
  knowledgeState?: "CONFIGURED" | "PROPOSED";
  engineState?: "NOT_IMPLEMENTED" | "IMPLEMENTED";
  certificationState?: "NOT_CERTIFIED" | "UNVALIDATED" | "IMPLEMENTED" | "BENCHMARKED" | "HUMAN_VALIDATED" | "PILOT" | "CERTIFIED";
};

export type DisciplineToolBinding = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  disciplineCode: CanonicalDisciplineCode;
  capabilityKey: DisciplineCapabilityKey;
  externalToolProfileId: string | null;
  toolCode: string;
  certificationStatus: DisciplineCapabilityStatus;
  priority: number;
};

export type DisciplineProfile = {
  id: string;
  tenantId: string | null;
  code: CanonicalDisciplineCode;
  disciplineKey: string;
  name: string;
  description: string;
  enabled: boolean;
  status: "active" | "disabled";
  ownerId: string | null;
  capabilities: DisciplineCapabilityRecord[];
  standards: DisciplineStandardReference[];
  toolBindings: DisciplineToolBinding[];
  readiness: DisciplineReadiness;
  createdAt: string;
  updatedAt: string;
};

export type DisciplineParticipation = {
  objectKind: DisciplineObjectKind;
  objectId: string;
  disciplineCode: CanonicalDisciplineCode;
  role: DisciplineParticipationRole;
};

export type InterfaceInformationRequirement = {
  id: string;
  interfaceId: string;
  sourceDiscipline: CanonicalDisciplineCode;
  receivingDiscipline: CanonicalDisciplineCode;
  informationKey: string;
  description: string;
  status: InterfaceInformationStatus;
};

export type ProjectDisciplineAssignment = {
  projectId: string;
  workspaceId: string;
  disciplineCode: CanonicalDisciplineCode;
  enabled: boolean;
  leadUserId: string | null;
  standards: DisciplineStandardReference[];
};

/** Tool fields that must never be copied onto discipline records. */
export const FORBIDDEN_DISCIPLINE_TOOL_FIELDS = [
  "executablePath",
  "executable_path",
  "licenceStatus",
  "licence_status",
  "installedVersion",
  "installed_version",
  "licenceExpiresAt",
  "licence_expires_at",
  "licenceType",
  "licence_type",
  "productionUsePermitted",
  "production_use_permitted",
] as const;
