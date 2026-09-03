import { describe, expect, it } from "vitest";
import { mapTechnicalQueryStatus } from "./technical-query-status";
import {
  describeTechnicalQueryNextAction,
  displayPersonName,
  displayWorkflowStatus,
  isRawUuid,
  matchesRegisterView,
  presentTechnicalQuery,
} from "./technical-query-workflow";

describe("technical query workflow presentation", () => {
  it("never presents a raw UUID as a person name", () => {
    const uuid = "6f1a2c3e-4b5d-6789-abcd-ef0123456789";
    expect(isRawUuid(uuid)).toBe(true);
    expect(displayPersonName({ fullName: uuid, email: "jane.smith@example.com" })).toBe("jane.smith");
    expect(displayPersonName({ fullName: "Jane Smith", fallback: uuid })).toBe("Jane Smith");
  });

  it("maps operational statuses without using Pending", () => {
    expect(displayWorkflowStatus("open")).toBe("Awaiting Response");
    expect(displayWorkflowStatus("responded")).toBe("Response Submitted");
    expect(displayWorkflowStatus("draft")).toBe("Draft");
    expect(displayWorkflowStatus("clarification_required")).toBe("Clarification Required");
    expect(displayWorkflowStatus("closed")).toBe("Closed");
  });

  it("describes the next action for awaiting response", () => {
    const next = describeTechnicalQueryNextAction({
      status: "awaiting_response",
      initiatorName: "Silvestre Berso",
      actionByName: "Jane Smith",
      due: "2026-09-07",
      assigned: true,
    });
    expect(next.currentStatus).toBe("Awaiting Response");
    expect(next.actionRequired).toBe("Jane Smith to provide technical response");
    expect(next.nextStep).toContain("Silvestre Berso");
  });

  it("does not imply a TQ was sent when Action By is missing", () => {
    const next = describeTechnicalQueryNextAction({
      status: "open",
      initiatorName: "Silvestre Berso",
      assigned: false,
    });
    expect(next.actionRequired).toMatch(/Nobody is currently assigned/i);
  });

  it("presents suggested solution and client response from canonical fields", () => {
    const presented = presentTechnicalQuery({
      row: {
        tq_number: "TQ-006",
        title: "Sealant suitability",
        question: "Is Flamex XT acceptable?",
        response: "Use Flamex XT subject to specification confirmation.",
        status: "response_submitted",
        priority: "medium",
        requester_id: "user-1",
        assigned_to: "user-2",
        response_due: "2026-09-07",
        metadata: { suggested_solution: "Use Flamex XT subject to confirmation." },
      },
      people: new Map([
        ["user-1", { id: "user-1", name: "Silvestre Berso", role: "Engineering" }],
        ["user-2", { id: "user-2", name: "Jane Smith", role: "Lead Civil Engineer", company: "ABC Engineering" }],
      ]),
    });
    expect(presented.suggestedSolution).toMatch(/Flamex XT/);
    expect(presented.clientResponse).toMatch(/Flamex XT/);
    expect(presented.initiator?.name).toBe("Silvestre Berso");
    expect(presented.actionBy?.name).toBe("Jane Smith");
    expect(presented.priority).toBe("Normal");
    expect(presented.queryLocked).toBe(true);
  });

  it("filters My Actions and overdue queues", () => {
    const mine = {
      assigned_to: "actor-1",
      status: "awaiting_response",
      response_due: "2099-01-01",
    };
    expect(matchesRegisterView(mine, "mine", "actor-1")).toBe(true);
    expect(matchesRegisterView(mine, "mine", "other")).toBe(false);
    expect(matchesRegisterView({ ...mine, status: "closed" }, "closed", "actor-1")).toBe(true);
  });
});

describe("legacy TQ status mapper compatibility", () => {
  it("keeps canonical persist aliases", () => {
    expect(mapTechnicalQueryStatus(undefined)).toBe("responded");
    expect(mapTechnicalQueryStatus("open")).toBe("open");
    expect(mapTechnicalQueryStatus("awaiting_response")).toBe("awaiting_response");
    expect(mapTechnicalQueryStatus("response_submitted")).toBe("response_submitted");
  });
});
