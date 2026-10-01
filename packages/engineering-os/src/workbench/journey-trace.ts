/**
 * Machine-readable certification trace. Not a production data model.
 */

export type JourneyTraceEvent = {
  stage: string;
  experience?: string;
  objects: Array<{ type: string; id: string; title?: string }>;
  workPlanId?: string | null;
  information?: string[];
  decisions?: string[];
  interfaces?: string[];
  artifacts?: string[];
  reviews?: string[];
  changes?: string[];
  configuration?: string[];
  handover?: string[];
};

export type JourneyTrace = {
  system: string;
  synthetic: true;
  sourceOfTruth: false;
  events: JourneyTraceEvent[];
};

export function createJourneyTrace(system: string): JourneyTrace {
  return { system, synthetic: true, sourceOfTruth: false, events: [] };
}

export function appendJourneyTrace(trace: JourneyTrace, event: JourneyTraceEvent): JourneyTrace {
  trace.events.push(event);
  return trace;
}
