import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const defaultTarget = path.join(rootDir, "js", "products.json");

function help() {
  console.log(`Usage:
  node tools/sync-products.mjs <source> [target]

Examples:
  node tools/sync-products.mjs exported-products.json
  node tools/sync-products.mjs exported-products.json js/products.json
`);
}

function resolveArg(value, fallback) {
  if (!value) return fallback;
  return path.isAbsolute(value) ? value : path.join(rootDir, value);
}

async function main() {
  const [, , sourceArg, targetArg, ...rest] = process.argv;

  if (
    !sourceArg ||
    sourceArg === "--help" ||
    sourceArg === "-h" ||
    rest.includes("--help") ||
    rest.includes("-h")
  ) {
    help();
    return;
  }

  const sourcePath = resolveArg(sourceArg);
  const targetPath = resolveArg(targetArg, defaultTarget);

  const raw = await fs.readFile(sourcePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Source JSON must be an array of products.");
  }

  const normalized = JSON.stringify(parsed, null, 2) + "\n";
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, normalized, "utf8");

  console.log(`Synced ${parsed.length} products:`);
  console.log(`  from: ${path.relative(rootDir, sourcePath)}`);
  console.log(`  to:   ${path.relative(rootDir, targetPath)}`);
}

main().catch((error) => {
  console.error(`Sync failed: ${error.message}`);
  process.exitCode = 1;
});
