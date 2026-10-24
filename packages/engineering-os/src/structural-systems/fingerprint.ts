import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1F_FINGERPRINT_SUBJECTS } from "@rtb/types";

export type D1fFingerprintSubject = (typeof D1F_FINGERPRINT_SUBJECTS)[number];

export function fingerprintStructuralSubject(subject: D1fFingerprintSubject, identity: Record<string, unknown>): string {
  return fingerprintCanonical({ subject, identity });
}
