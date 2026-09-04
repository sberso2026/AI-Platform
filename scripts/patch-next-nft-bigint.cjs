/**
 * Next 15.5.20's compiled @vercel/nft constant-folds mixed BigInt/Number
 * expressions and crashes production builds. Guard the evaluator so tracing
 * skips those expressions instead of failing the whole webpack compile.
 */
const fs = require("node:fs");
const path = require("node:path");

const MARKER = "/* rtb-nft-bigint-guard */";
const NEEDLE = "async function computePureStaticValue(e,t=true){";
const REPLACEMENT =
  "async function computePureStaticValue(e,t=true){" +
  MARKER +
  "try{return await computePureStaticValueGuarded(e,t)}catch(err){if(err&&/BigInt/i.test(String(err&&err.message||err)))return null;throw err}}async function computePureStaticValueGuarded(e,t=true){";

function resolveNft() {
  return require.resolve("next/dist/compiled/@vercel/nft/index.js", {
    paths: [path.join(__dirname, "..", "apps", "web")],
  });
}

const nftPath = resolveNft();
const source = fs.readFileSync(nftPath, "utf8");
if (source.includes(MARKER)) {
  process.stdout.write(`nft bigint guard already applied: ${nftPath}\n`);
  process.exit(0);
}
if (!source.includes(NEEDLE)) {
  process.stderr.write(`nft bigint guard: expected evaluator not found in ${nftPath}\n`);
  process.exit(1);
}
fs.writeFileSync(nftPath, source.replace(NEEDLE, REPLACEMENT));
process.stdout.write(`nft bigint guard applied: ${nftPath}\n`);
