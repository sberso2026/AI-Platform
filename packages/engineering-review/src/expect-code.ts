import { expect } from "vitest";
import { EngineeringReviewError } from "./errors";

export function expectCode(fn: () => unknown, code: string): void {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(EngineeringReviewError);
    expect((error as EngineeringReviewError).code).toBe(code);
    return;
  }
  throw new Error(`Expected EngineeringReviewError ${code}`);
}

export async function expectCodeAsync(fn: () => Promise<unknown> | unknown, code: string): Promise<void> {
  try {
    await fn();
  } catch (error) {
    expect(error).toBeInstanceOf(EngineeringReviewError);
    expect((error as EngineeringReviewError).code).toBe(code);
    return;
  }
  throw new Error(`Expected EngineeringReviewError ${code}`);
}
