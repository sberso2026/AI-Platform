import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "fixtures/retrieval/evaluation-set.json");
const raw = readFileSync(path, "utf8");
const data = JSON.parse(raw) as {
  fixtures: Array<{ id: string; content?: string; checksumSha256?: string }>;
};

for (const fixture of data.fixtures) {
  const content = fixture.content ?? "";
  fixture.checksumSha256 = createHash("sha256").update(content).digest("hex");
}

writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`[fixtures] updated checksums for ${data.fixtures.length} fixtures`);
