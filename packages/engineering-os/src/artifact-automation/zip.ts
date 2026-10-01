import { crc32, deflateRawSync, inflateRawSync } from "node:zlib";

function u16(n: number) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
}

function u32(n: number) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
}

export type ZipEntry = { name: string; data: Buffer };

export function writeZip(entries: ZipEntry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    if (entry.name.includes("..") || entry.name.startsWith("/") || entry.name.includes("\\")) {
      throw new Error("zip_path_traversal");
    }
    const name = Buffer.from(entry.name, "utf8");
    const raw = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const compressed = deflateRawSync(raw);
    const crc = crc32(raw) >>> 0;
    const local = Buffer.concat([
      Buffer.from("PK\u0003\u0004", "binary"),
      u16(20),
      u16(0),
      u16(8),
      u16(0),
      u16(0),
      u32(crc),
      u32(compressed.length),
      u32(raw.length),
      u16(name.length),
      u16(0),
      name,
      compressed,
    ]);
    const central = Buffer.concat([
      Buffer.from("PK\u0001\u0002", "binary"),
      u16(20),
      u16(20),
      u16(0),
      u16(8),
      u16(0),
      u16(0),
      u32(crc),
      u32(compressed.length),
      u32(raw.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    Buffer.from("PK\u0005\u0006", "binary"),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return Buffer.concat([...locals, centralDir, eocd]);
}

export function readZip(buffer: Buffer): ZipEntry[] {
  const sig = buffer.lastIndexOf(Buffer.from("PK\u0005\u0006", "binary"));
  if (sig < 0) throw new Error("invalid_zip");
  const count = buffer.readUInt16LE(sig + 10);
  const size = buffer.readUInt32LE(sig + 12);
  const offset = buffer.readUInt32LE(sig + 16);
  const entries: ZipEntry[] = [];
  let cursor = offset;
  for (let i = 0; i < count; i += 1) {
    if (buffer.toString("binary", cursor, cursor + 4) !== "PK\u0001\u0002") throw new Error("invalid_zip_central");
    const method = buffer.readUInt16LE(cursor + 10);
    const compSize = buffer.readUInt32LE(cursor + 20);
    const nameLen = buffer.readUInt16LE(cursor + 28);
    const extraLen = buffer.readUInt16LE(cursor + 30);
    const commentLen = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLen);
    if (name.includes("..") || name.startsWith("/")) throw new Error("zip_path_traversal");
    const nameLocalLen = buffer.readUInt16LE(localOffset + 26);
    const extraLocalLen = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + nameLocalLen + extraLocalLen;
    const payload = buffer.subarray(dataStart, dataStart + compSize);
    const data = method === 0 ? Buffer.from(payload) : inflateRawSync(payload);
    entries.push({ name, data });
    cursor += 46 + nameLen + extraLen + commentLen;
    void size;
  }
  return entries;
}

export function zipHasUnsafeParts(entries: ZipEntry[]) {
  return entries.some((row) =>
    /vbaProject|macrosheets|oleObject|\.exe$|\.js$|\.vbs$/i.test(row.name),
  );
}
