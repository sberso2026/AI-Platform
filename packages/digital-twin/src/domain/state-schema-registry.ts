/**
 * Phase 12D — TwinStateSchemaRegistry (versioned schemas, no unrestricted blobs).
 */

export type TwinStateSchemaField = {
  name: string;
  valueType: "string" | "number" | "boolean" | "enum" | "reference";
  required: boolean;
  quantitative?: boolean;
  enumValues?: string[];
};

export type TwinStateSchema = {
  schemaId: string;
  schemaVersion: string;
  displayName: string;
  category: "observed" | "derived" | "operational";
  fields: TwinStateSchemaField[];
  allowsUnrestrictedBlob: false;
  storesTelemetryPayload: false;
};

const REGISTRY: TwinStateSchema[] = [
  {
    schemaId: "twin.observed.manual.v1",
    schemaVersion: "1.0.0",
    displayName: "Manual Observed State",
    category: "observed",
    fields: [
      { name: "observationLabel", valueType: "string", required: true },
      { name: "observedValue", valueType: "number", required: false, quantitative: true },
      { name: "observationRef", valueType: "reference", required: true },
    ],
    allowsUnrestrictedBlob: false,
    storesTelemetryPayload: false,
  },
  {
    schemaId: "twin.observed.asset_intelligence.v1",
    schemaVersion: "1.0.0",
    displayName: "Asset Intelligence Advisory Slice",
    category: "observed",
    fields: [
      { name: "advisoryRef", valueType: "reference", required: true },
      { name: "conditionScore", valueType: "number", required: false, quantitative: true },
      { name: "confidenceBand", valueType: "enum", required: false, enumValues: ["low", "medium", "high"] },
    ],
    allowsUnrestrictedBlob: false,
    storesTelemetryPayload: false,
  },
  {
    schemaId: "twin.observed.project_controls.v1",
    schemaVersion: "1.0.0",
    displayName: "Project Controls Advisory Slice",
    category: "observed",
    fields: [
      { name: "controlsRef", valueType: "reference", required: true },
      { name: "scheduleVarianceDays", valueType: "number", required: false, quantitative: true },
      { name: "costVariancePct", valueType: "number", required: false, quantitative: true },
    ],
    allowsUnrestrictedBlob: false,
    storesTelemetryPayload: false,
  },
  {
    schemaId: "twin.observed.telemetry_projection.v1",
    schemaVersion: "1.0.0",
    displayName: "Telemetry Projection Observed State",
    category: "observed",
    fields: [
      { name: "bindingId", valueType: "string", required: true },
      { name: "twinAttributeKey", valueType: "string", required: true },
      { name: "projectedValue", valueType: "number", required: false, quantitative: true },
      { name: "unit", valueType: "string", required: true },
      { name: "quality", valueType: "string", required: true },
      { name: "projectionMethod", valueType: "string", required: true },
      { name: "engineeringSeriesRef", valueType: "reference", required: false },
    ],
    allowsUnrestrictedBlob: false,
    storesTelemetryPayload: false,
  },
];

export class TwinStateSchemaRegistry {
  readonly kind = "twin_state_schema_registry" as const;

  listSchemas(): TwinStateSchema[] {
    return [...REGISTRY];
  }

  getSchema(schemaId: string): TwinStateSchema | undefined {
    return REGISTRY.find((s) => s.schemaId === schemaId);
  }

  assertSchemaRegistered(schemaId: string): TwinStateSchema {
    const schema = this.getSchema(schemaId);
    if (!schema) throw new Error(`state_schema_not_registered:${schemaId}`);
    return schema;
  }

  validatePayload(
    schemaId: string,
    payload: Record<string, unknown>,
  ): { ok: true; schema: TwinStateSchema } {
    const schema = this.assertSchemaRegistered(schemaId);
    if ("telemetryPayload" in payload || "sensorData" in payload || "timeSeries" in payload) {
      throw new Error("schema_payload_telemetry_forbidden");
    }
    for (const field of schema.fields) {
      if (field.required && !(field.name in payload)) {
        throw new Error(`schema_field_required:${field.name}`);
      }
      if (field.valueType === "enum" && field.name in payload) {
        const val = payload[field.name];
        if (typeof val === "string" && field.enumValues && !field.enumValues.includes(val)) {
          throw new Error(`schema_enum_invalid:${field.name}`);
        }
      }
    }
    return { ok: true, schema };
  }
}

export function createTwinStateSchemaRegistry(): TwinStateSchemaRegistry {
  return new TwinStateSchemaRegistry();
}
