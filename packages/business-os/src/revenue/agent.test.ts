import { describe, expect, it } from "vitest";
import {
  BUSINESS_DEVELOPMENT_AGENT_PASSPORT,
  agentMay,
  assertAgentAction,
  assertNotProhibited,
  requiredAuthority,
} from "./agent";
import { createBusinessOS, implementsOwnAiStack } from "../index";
import { createPlatformKernel } from "@rtb/platform-kernel";

describe("BOS-4 AI Business Development Agent authority", () => {
  it("registers an A2 passport on the Platform Agent contract", () => {
    expect(BUSINESS_DEVELOPMENT_AGENT_PASSPORT.authorityMax).toBe("A2");
    expect(BUSINESS_DEVELOPMENT_AGENT_PASSPORT.modelPolicy.implementsOwnAiStack).toBe(false);
    expect(implementsOwnAiStack).toBe(false);
    expect(BUSINESS_DEVELOPMENT_AGENT_PASSPORT.prohibitedActions).toEqual(
      expect.arrayContaining(["external_send", "crm_write", "proposal_submit", "autonomous_approval"]),
    );
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.revenueExecution.agentPassport.id).toBe("business-development-agent");
  });

  it("allows A0-A2 and forbids A3/A4", () => {
    expect(requiredAuthority("read")).toBe("A0");
    expect(requiredAuthority("prepare")).toBe("A2");
    expect(agentMay("read")).toBe(true);
    expect(agentMay("recommend")).toBe(true);
    expect(agentMay("prepare")).toBe(true);
    expect(agentMay("send")).toBe(false);
    expect(agentMay("approve_autonomous")).toBe(false);
    expect(() => assertAgentAction("send")).toThrow("external_send_forbidden");
    expect(() => assertAgentAction("approve_autonomous")).toThrow("autonomous_approval_forbidden");
    expect(() => assertNotProhibited("crm_write")).toThrow("agent_action_prohibited:crm_write");
  });

  it("does not expose an external send method that succeeds", () => {
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(() => bos.revenueExecution.sendExternally()).toThrow("external_send_forbidden");
    expect(() => bos.revenueExecution.submitProposalExternally()).toThrow("external_submit_forbidden");
  });
});
