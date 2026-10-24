import { describe, expect, it } from "vitest";
import { AnswerStatusSchema, DocumentProcessingStatusSchema } from "./types";

describe("document status enums on patched zod", () => {
  it("accepts declared statuses and rejects unknown values", () => {
    expect(DocumentProcessingStatusSchema.parse("ready")).toBe("ready");
    expect(DocumentProcessingStatusSchema.parse("superseded")).toBe("superseded");
    expect(AnswerStatusSchema.parse("answered")).toBe("answered");
    expect(DocumentProcessingStatusSchema.safeParse("current").success).toBe(false);
    expect(AnswerStatusSchema.safeParse("approved").success).toBe(false);
    expect(AnswerStatusSchema.safeParse(null).success).toBe(false);
  });
});
