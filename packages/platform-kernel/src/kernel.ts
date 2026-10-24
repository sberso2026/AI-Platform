import type { SupabaseClient } from "@rtb/database";
import { createPlatformIntelligence, type PlatformIntelligence } from "@rtb/platform-intelligence";
import { AIDirectorService } from "./ai-director";
import { AzureOpenAIModelAdapter, OpenAIModelAdapter } from "./ai-director/adapters/openai-adapter";
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

export function createPlatformKernel(supabase: SupabaseClient, notificationClient?: SupabaseClient): PlatformKernel {
  const eventBus = new EventBusService(supabase);
  // Use a privileged client for notification inserts so that cross-user notifications (e.g. notifying
  // the assignee when the initiator submits) are not blocked by RLS on the session client.
  const notifications = new NotificationService(notificationClient ?? supabase, eventBus);
  const intelligence = createPlatformIntelligence(supabase);
  const aiDirector = new AIDirectorService(supabase, eventBus, intelligence);
  aiDirector.registerAdapter(new OpenAIModelAdapter());
  aiDirector.registerAdapter(new AzureOpenAIModelAdapter());

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
  };
}
