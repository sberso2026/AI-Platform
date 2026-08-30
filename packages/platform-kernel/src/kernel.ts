import type { SupabaseClient } from "@rtb/database";
import { createPlatformIntelligence, type PlatformIntelligence } from "@rtb/platform-intelligence";
import { AIDirectorService } from "./ai-director";
import { tryCreateVendorChatAdapter } from "./ai-director/adapters/http-chat-adapter";
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
import { PlatformConnectorContextService } from "./connector-context";

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
  connectorContext: PlatformConnectorContextService;
}

export function createPlatformKernel(supabase: SupabaseClient): PlatformKernel {
  const eventBus = new EventBusService(supabase);
  const notifications = new NotificationService(supabase, eventBus);
  const intelligence = createPlatformIntelligence(supabase);
  const aiDirector = new AIDirectorService(supabase, eventBus, intelligence);
  const vendorAdapter = tryCreateVendorChatAdapter();
  if (vendorAdapter) aiDirector.registerAdapter(vendorAdapter);

  return {
    eventBus,
    notifications,
    intelligence,
    aiDirector,
    jobs: new JobService(supabase),
    workflow: new WorkflowService(supabase, eventBus),
    knowledgeGraph: new KnowledgeGraphService(supabase),
    memory: new MemoryService(supabase),
    digitalTwin: new DigitalTwinService(supabase),
    apiGateway: new ApiGatewayService(supabase),
    telemetry: new TelemetryService(supabase),
    plugins: new PluginLifecycleService(supabase, eventBus),
    connectorContext: new PlatformConnectorContextService(supabase),
  };
}
