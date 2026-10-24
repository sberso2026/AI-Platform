import { THREAD_KG_PROJECTION_FLAG, THREAD_KG_READS_FLAG, type ThreadProjectionFlags } from "./types";

export function resolveThreadProjectionFlags(override?: Partial<ThreadProjectionFlags>): ThreadProjectionFlags {
  const envWrites = process.env.ENGINEERING_DIGITAL_THREAD_KG_PROJECTION;
  const envReads = process.env.ENGINEERING_DIGITAL_THREAD_KG_READS;
  return {
    writesEnabled:
      override?.writesEnabled ??
      (envWrites == null || envWrites === "" ? true : envWrites === "1" || envWrites === "true"),
    readsEnabled: override?.readsEnabled ?? (envReads === "1" || envReads === "true"),
  };
}

export const THREAD_PROJECTION_FLAG_KEYS = [THREAD_KG_PROJECTION_FLAG, THREAD_KG_READS_FLAG] as const;
