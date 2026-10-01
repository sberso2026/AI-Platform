import type { AttentionAcknowledgement, AttentionPreference } from "./types";

export interface AttentionStore {
  listAcknowledgements(workspaceId: string, userId: string): Promise<AttentionAcknowledgement[]>;
  saveAcknowledgement(row: AttentionAcknowledgement): Promise<AttentionAcknowledgement>;
  getPreference(workspaceId: string, userId: string): Promise<AttentionPreference | null>;
  savePreference(row: AttentionPreference): Promise<AttentionPreference>;
}

export function createMemoryAttentionStore(): AttentionStore {
  const acks = new Map<string, AttentionAcknowledgement>();
  const prefs = new Map<string, AttentionPreference>();
  return {
    async listAcknowledgements(workspaceId, userId) {
      return [...acks.values()].filter((row) => row.workspaceId === workspaceId && row.userId === userId);
    },
    async saveAcknowledgement(row) {
      acks.set(`${row.workspaceId}:${row.userId}:${row.fingerprint}`, row);
      return row;
    },
    async getPreference(workspaceId, userId) {
      return prefs.get(`${workspaceId}:${userId}`) ?? null;
    },
    async savePreference(row) {
      prefs.set(`${row.workspaceId}:${row.userId}`, row);
      return row;
    },
  };
}
