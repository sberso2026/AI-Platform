import { describe, expect, it } from "vitest";
import {
  assertDocumentTransition,
  buildTransitionAudit,
  canTransitionDocumentStatus,
  isAuthoritativeAnswerAllowed,
} from "../src/documents/ingestion-state-machine";
import { DocumentIntelligenceError } from "../src/documents/errors";

describe("document ingestion state machine", () => {
  it("allows the happy-path processing transitions", () => {
    expect(canTransitionDocumentStatus("registered", "queued")).toBe(true);
    expect(canTransitionDocumentStatus("validating_output", "ready")).toBe(true);
    expect(canTransitionDocumentStatus("ready", "superseded")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransitionDocumentStatus("registered", "ready")).toBe(false);
    expect(() => assertDocumentTransition("failed", "ready")).toThrow(DocumentIntelligenceError);
  });

  it("builds audited transitions with event ids", () => {
    const audit = buildTransitionAudit("queued", "fetching", "evt-1", { actorId: "user-1" });
    expect(audit).toMatchObject({
      action: "status_transition",
      fromStatus: "queued",
      toStatus: "fetching",
      eventId: "evt-1",
      actorId: "user-1",
    });
  });

  it("only ready statuses may back authoritative answers", () => {
    expect(isAuthoritativeAnswerAllowed("ready")).toBe(true);
    expect(isAuthoritativeAnswerAllowed("ready_with_warnings")).toBe(true);
    expect(isAuthoritativeAnswerAllowed("failed")).toBe(false);
    expect(isAuthoritativeAnswerAllowed("chunking")).toBe(false);
  });
});
