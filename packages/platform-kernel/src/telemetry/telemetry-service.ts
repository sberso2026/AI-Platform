import type { Json, SupabaseClient } from "@rtb/database";
import type { Sensor } from "@rtb/types";

export class TelemetryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async registerSensor(input: {
    tenantId: string;
    name: string;
    sensorType: string;
    digitalTwinId?: string;
    location?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<Sensor> {
    const { data, error } = await this.supabase
      .from("sensors")
      .insert({
        tenant_id: input.tenantId,
        name: input.name,
        sensor_type: input.sensorType,
        digital_twin_id: input.digitalTwinId ?? null,
        location: (input.location ?? null) as Json,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to register sensor: ${error?.message}`);
    return mapSensor(data);
  }

  async ingestEvent(input: {
    tenantId: string;
    streamId: string;
    value: Record<string, unknown>;
    recordedAt?: string;
  }): Promise<void> {
    await this.supabase.from("telemetry_events").insert({
      tenant_id: input.tenantId,
      stream_id: input.streamId,
      value: input.value as Json,
      recorded_at: input.recordedAt ?? new Date().toISOString(),
    });
  }

  async listSensors(tenantId: string): Promise<Sensor[]> {
    const { data, error } = await this.supabase
      .from("sensors")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list sensors: ${error.message}`);
    return (data ?? []).map(mapSensor);
  }
}

function mapSensor(row: Record<string, unknown>): Sensor {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    name: row.name as string,
    sensor_type: row.sensor_type as string,
    digital_twin_id: row.digital_twin_id as string | undefined,
    location: row.location as Record<string, unknown> | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    is_active: row.is_active as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
