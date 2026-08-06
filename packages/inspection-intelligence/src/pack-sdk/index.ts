/**
 * Inspection Pack SDK — packs extend the engine; they never modify engine behaviour.
 */
import {
  GENERIC_INSPECTION_PACK,
  InspectionPackRegistry,
  type InspectionPackManifest,
} from "../architecture/inspection-pack";

export type InspectionPackSdkManifest = InspectionPackManifest & {
  supportedInspectionTypes: string[];
  templateLibrary: string[];
  measurementLibrary: string[];
  acceptanceCriteriaLibrary: string[];
  workflowExtensions: string[];
  aiPromptTemplates: string[];
  reportTemplates: string[];
  permissions: string[];
  featureFlags: Record<string, boolean>;
  migrationVersion: string;
};

export function toPackSdkManifest(
  base: InspectionPackManifest,
  extras?: Partial<InspectionPackSdkManifest>,
): InspectionPackSdkManifest {
  return {
    ...base,
    supportedInspectionTypes: extras?.supportedInspectionTypes ?? ["generic_visual"],
    templateLibrary: extras?.templateLibrary ?? ["generic_visual_v1"],
    measurementLibrary: extras?.measurementLibrary ?? ["manual_numeric"],
    acceptanceCriteriaLibrary: extras?.acceptanceCriteriaLibrary ?? ["tolerance_absolute"],
    workflowExtensions: extras?.workflowExtensions ?? [],
    aiPromptTemplates: extras?.aiPromptTemplates ?? [],
    reportTemplates: extras?.reportTemplates ?? ["executive_summary"],
    permissions: extras?.permissions ?? ["inspection.read", "inspection.write"],
    featureFlags: extras?.featureFlags ?? { reporting: true, aiVision: false },
    migrationVersion: extras?.migrationVersion ?? "batch_44",
  };
}

export const GENERIC_INSPECTION_PACK_SDK = toPackSdkManifest(GENERIC_INSPECTION_PACK);

/** Scaffold only — not a commercial industry pack. */
export const COATINGS_PACK_SCAFFOLD = toPackSdkManifest(
  {
    packId: "coatings",
    version: "0.0.1-scaffold",
    displayName: "Coatings Inspection Pack (scaffold)",
    taxonomyExtensions: ["coating", "dft"],
    checklistItemTypes: ["dft_reading", "visual_coating"],
    measurementMethods: ["dft_gauge"],
    evidenceTypes: ["photo", "dft_log"],
    targetKinds: ["asset", "equipment"],
    visionAdapters: [],
    predictiveAdapters: [],
  },
  {
    supportedInspectionTypes: ["coating_visual", "dft"],
    templateLibrary: ["coating_visual_v1"],
    measurementLibrary: ["dft_micron"],
    migrationVersion: "batch_44_scaffold",
    featureFlags: { reporting: true, aiVision: false, commercial: false },
  },
);

export class InspectionPackSdk {
  private registry: InspectionPackRegistry;
  private manifests = new Map<string, InspectionPackSdkManifest>();

  constructor(initial: InspectionPackSdkManifest[] = [GENERIC_INSPECTION_PACK_SDK]) {
    this.registry = new InspectionPackRegistry([]);
    for (const m of initial) this.register(m);
  }

  register(manifest: InspectionPackSdkManifest): void {
    if (!this.manifests.has(manifest.packId)) {
      this.registry.register({
        packId: manifest.packId,
        version: manifest.version,
        displayName: manifest.displayName,
        taxonomyExtensions: manifest.taxonomyExtensions,
        checklistItemTypes: manifest.checklistItemTypes,
        measurementMethods: manifest.measurementMethods,
        evidenceTypes: manifest.evidenceTypes,
        targetKinds: manifest.targetKinds,
        visionAdapters: manifest.visionAdapters,
        predictiveAdapters: manifest.predictiveAdapters,
      });
    } else {
      this.manifests.set(manifest.packId, manifest);
      return;
    }
    this.manifests.set(manifest.packId, manifest);
  }

  get(packId: string): InspectionPackSdkManifest | undefined {
    return this.manifests.get(packId);
  }

  list(): InspectionPackSdkManifest[] {
    return [...this.manifests.values()];
  }
}

export const INSPECTION_PACK_SDK_VERSION = "0.3.0" as const;
