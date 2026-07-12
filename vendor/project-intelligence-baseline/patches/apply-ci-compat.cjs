/**
 * Apply documented Phase 6C-1 CI compatibility patches to an extracted frozen PI baseline.
 * Does not modify the frozen git tag; patches are recorded deviations.
 */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "pi-baseline";
const target = path.join(root, "lib/engineering/g1DocumentDiscovery.ts");
let source = fs.readFileSync(target, "utf8");
const eol = source.includes("\r\n") ? "\r\n" : "\n";

const before =
  `  // Use node:path.basename which handles both forward and back slashes.${eol}` +
  `  const base = path.basename(trimmed);`;

const after =
  `  // Normalize Windows separators before basename. On POSIX, path.basename does${eol}` +
  `  // not treat "\\\\" as a separator, which breaks frozen Windows-path fixtures.${eol}` +
  `  const normalized = trimmed.replace(/\\\\/g, "/");${eol}` +
  `  const base = path.basename(normalized);`;

if (!source.includes(before)) {
  console.error("0001-posix-backslash-basename: expected snippet not found in", target);
  process.exit(1);
}

source = source.replace(before, after);
fs.writeFileSync(target, source);
console.log("Applied 0001-posix-backslash-basename to", target);
