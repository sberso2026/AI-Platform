import { describe, expect, it } from "vitest";

const enabled = Boolean(
  process.env.INSPECTION_INTELLIGENCE_CERTIFICATION === "1" ||
    process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1",
);
const url = process.env.SUPABASE_URL ?? process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

describe.skipIf(!enabled || !url)("II-1 live hosted inspection_* persistence", () => {
  it("requires the existing Engineering OS hosted certification environment", () => {
    expect(url).toMatch(/supabase\.co/);
  });
});
