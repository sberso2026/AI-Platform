import { describe, expect, it } from "vitest";
import {
  CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
  requiredApplicationRolesForSubscriptionResource,
  tokenRolesSatisfySubscriptionResource,
  isInvalidGenericSubscriptionRoleName,
  normalizeGraphSubscriptionResource,
} from "../src/meetings/teams/teams-subscription-resource-permissions";

describe("teams subscription resource permissions", () => {
  it("maps transcript getAllTranscripts to OnlineMeetingTranscript.Read.All", () => {
    expect(requiredApplicationRolesForSubscriptionResource("communications/onlineMeetings/getAllTranscripts")).toEqual([
      "OnlineMeetingTranscript.Read.All",
    ]);
    expect(
      requiredApplicationRolesForSubscriptionResource(`/${CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE}`),
    ).toEqual(["OnlineMeetingTranscript.Read.All"]);
  });

  it("maps parameterized transcript resources", () => {
    expect(
      requiredApplicationRolesForSubscriptionResource(
        "communications/onlineMeetings/abc123/transcripts",
      ),
    ).toEqual(["OnlineMeetingTranscript.Read.All"]);
    expect(
      requiredApplicationRolesForSubscriptionResource(
        "users/user-oid/onlineMeetings/getAllTranscripts",
      ),
    ).toEqual(["OnlineMeetingTranscript.Read.All"]);
  });

  it("fails closed for unknown resources", () => {
    expect(() =>
      requiredApplicationRolesForSubscriptionResource("/communications/onlineMeetings"),
    ).toThrow(/TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED/);
  });

  it("validates token roles against the exact resource map", () => {
    const ok = tokenRolesSatisfySubscriptionResource(
      CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
      ["OnlineMeetings.Read.All", "OnlineMeetingTranscript.Read.All"],
    );
    expect(ok.ok).toBe(true);
    expect(ok.missing).toEqual([]);

    const missing = tokenRolesSatisfySubscriptionResource(
      CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
      ["OnlineMeetings.Read.All"],
    );
    expect(missing.ok).toBe(false);
    expect(missing.missing).toEqual(["OnlineMeetingTranscript.Read.All"]);
  });

  it("does not treat Subscription.ReadWrite.All as a required role", () => {
    expect(isInvalidGenericSubscriptionRoleName("Subscription.ReadWrite.All")).toBe(true);
    expect(isInvalidGenericSubscriptionRoleName("Subscriptions.ReadWrite.All")).toBe(true);
    const roles = requiredApplicationRolesForSubscriptionResource(
      normalizeGraphSubscriptionResource(CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE),
    );
    expect(roles).not.toContain("Subscription.ReadWrite.All");
    expect(roles).not.toContain("Subscriptions.ReadWrite.All");
  });
});
