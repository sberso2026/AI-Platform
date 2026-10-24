import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function issueHandoffSecret() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashHandoffToken(token) };
}

export function hashHandoffToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function tokensEqual(presented: string, storedHash: string) {
  const presentedHash = Buffer.from(hashHandoffToken(presented), "hex");
  const stored = Buffer.from(storedHash, "hex");
  if (presentedHash.length !== stored.length) return false;
  return timingSafeEqual(presentedHash, stored);
}

export function isUnsafeLaunchPayload(input: Record<string, unknown>) {
  const keys = ["executablePath", "command", "shell", "cmd", "powershell", "argv", "commandLine"];
  return keys.some((key) => key in input && input[key] != null && String(input[key]).trim() !== "");
}

export function isPathTraversal(value: string) {
  return value.includes("..") || value.includes("\\..") || value.startsWith("/") || /^[a-zA-Z]:\\/.test(value) && /Personal\\Mortgage/i.test(value);
}

export function isPersonalUnmanagedPath(value: string) {
  return /Documents\\Personal\\Mortgage\.xlsx/i.test(value) || /Personal[/\\]Mortgage/i.test(value);
}
