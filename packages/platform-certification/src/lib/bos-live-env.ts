import { BosLiveRlsEnvironmentError, liveRlsEnvironmentAvailable } from "@rtb/business-os";

/**
 * Module-load helper for skipIf(live denial).
 * Incomplete live-RLS configuration fails closed in assessBosLiveRlsEnvironment;
 * this wrapper prevents import-time throws from skipping honesty tests.
 * Callers must still assert bos.liveRlsCertified=false and must not treat skip as certification.
 */
export function ambientBosLiveRlsReady(): boolean {
  try {
    return liveRlsEnvironmentAvailable();
  } catch (error) {
    if (error instanceof BosLiveRlsEnvironmentError) return false;
    throw error;
  }
}
