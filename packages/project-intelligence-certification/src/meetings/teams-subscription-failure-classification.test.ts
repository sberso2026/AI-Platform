import { describe, expect, it } from "vitest";
import { classifySubscriptionFailure } from "./teams-subscription-failure-classification";

describe("classifySubscriptionFailure", () => {
  it("classifies tenant transcript Graph access disabled before generic 403 permission", () => {
    expect(
      classifySubscriptionFailure({
        httpStatus: 403,
        graphCode: "ExtensionError",
        graphMessage:
          "Operation: Create; Exception: [Status Code: Forbidden; Reason: Graph API access to transcripts is disabled for this tenant.]",
        innerErrorCode: null,
      }),
    ).toBe("tenant transcript access disabled");
  });

  it("classifies GraphAccessToTranscriptsDisabled innerError", () => {
    expect(
      classifySubscriptionFailure({
        httpStatus: 403,
        graphCode: "Forbidden",
        graphMessage: "Graph API access to transcripts is disabled for this tenant.",
        innerErrorCode: "GraphAccessToTranscriptsDisabled",
      }),
    ).toBe("tenant transcript access disabled");
  });

  it("does not mask a real subscription 403 as consent when message is generic authorization", () => {
    expect(
      classifySubscriptionFailure({
        httpStatus: 403,
        graphCode: "Authorization_RequestDenied",
        graphMessage: "Insufficient privileges to complete the operation.",
      }),
    ).toBe("permission");
  });

  it("fails closed for unknown product defects", () => {
    expect(
      classifySubscriptionFailure({
        httpStatus: 500,
        graphCode: "UnknownError",
        graphMessage: "Something unexpected",
      }),
    ).toBe("product defect");
  });

  it("classifies unsupported resource", () => {
    expect(
      classifySubscriptionFailure({
        code: "TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED",
        message: "unknown resource",
      }),
    ).toBe("unsupported resource");
  });
});
