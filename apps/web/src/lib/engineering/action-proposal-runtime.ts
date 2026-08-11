/**
 * Process-local proposal service for Ask action orchestration (E8).
 * Domain execution uses fixture adapter until register wiring is injected per request.
 * Does not create a second workflow engine.
 */
import {
  EngineeringActionProposalService,
  FixtureEngineeringDomainExecutor,
  InMemoryEngineeringActionProposalStore,
  emitMemoryCandidateFromCompletedAction,
  EngineeringMemoryCaptureService,
  InMemoryEngineeringMemoryStore,
} from "@rtb/engineering-os";

const store = new InMemoryEngineeringActionProposalStore();
const executor = new FixtureEngineeringDomainExecutor();
const memoryStore = new InMemoryEngineeringMemoryStore();
const memoryCapture = new EngineeringMemoryCaptureService(memoryStore);

export const engineeringActionProposalService = new EngineeringActionProposalService(
  store,
  executor,
  {
    publish: async () => undefined,
  },
);

export async function handoffCompletedProposalToMemory(
  proposal: Awaited<ReturnType<EngineeringActionProposalService["execute"]>>,
) {
  return emitMemoryCandidateFromCompletedAction({
    proposal,
    capture: memoryCapture,
  });
}
