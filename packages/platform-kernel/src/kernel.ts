import type { SupabaseClient } from "@rtb/database";
import { createPlatformIntelligence, type PlatformIntelligence } from "@rtb/platform-intelligence";
import { AIDirectorService } from "./ai-director";
import { ApiGatewayService } from "./api-gateway";
import { DigitalTwinService } from "./digital-twin";
import { EventBusService } from "./event-bus";
import { JobService } from "./jobs";
import { KnowledgeGraphService } from "./knowledge-graph";
import { MemoryService } from "./memory";
import { NotificationService } from "./notifications";
import { PluginLifecycleService } from "./plugins";
import { TelemetryService } from "./telemetry";
import { WorkflowService } from "./workflow";

export interface PlatformKernel {
  aiDirector: AIDirectorService;
  eventBus: EventBusService;
  jobs: JobService;
  workflow: WorkflowService;
  knowledgeGraph: KnowledgeGraphService;
  memory: MemoryService;
  digitalTwin: DigitalTwinService;
  apiGateway: ApiGatewayService;
  notifications: NotificationService;
  telemetry: TelemetryService;
  plugins: PluginLifecycleService;
  intelligence: PlatformIntelligence;
}

export function createPlatformKernel(supabase: SupabaseClient): PlatformKernel {
  const eventBus = new EventBusService(supabase);
  const notifications = new NotificationService(supabase, eventBus);
  const intelligence = createPlatformIntelligence(supabase);

  return {
    eventBus,
    notifications,
    intelligence,
    aiDirector: new AIDirectorService(supabase, eventBus, intelligence),
    jobs: new JobService(supabase),
    workflow: new WorkflowService(supabase, eventBus),
    knowledgeGraph: new KnowledgeGraphService(supabase),
    memory: new MemoryService(supabase),
    digitalTwin: new DigitalTwinService(supabase),
    apiGateway: new ApiGatewayService(supabase),
    telemetry: new TelemetryService(supabase),
    plugins: new PluginLifecycleService(supabase, eventBus),
  };
}
