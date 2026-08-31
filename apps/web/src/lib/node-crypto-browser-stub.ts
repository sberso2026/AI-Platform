/** Client-bundle stand-in for `node:crypto`. Server bundles keep the Node module. */
export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

function serverOnly(name: string): never {
  throw new Error(`node:crypto ${name} is not available in the browser bundle`);
}

export function createHash(): never {
  return serverOnly("createHash");
}

export function randomBytes(): never {
  return serverOnly("randomBytes");
}

export function createHmac(): never {
  return serverOnly("createHmac");
}

export function timingSafeEqual(): never {
  return serverOnly("timingSafeEqual");
}
