// `shadcn build` only writes apps/web/public/r/<item>.json, never deletes. When
// an item leaves src/, its JSON would stay behind and keep it installable from
// the published site. Runs after `registry:build` and removes every .json in
// the output that isn't an item of registry.json (or registry.json itself).
//
// Run via `pnpm registry:prune` (packages/ds), part of `pnpm build`.

import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

export const OUTPUT_DIR = join(import.meta.dirname, "..", "..", "..", "apps", "web", "public", "r");
const REGISTRY_FILE = join(import.meta.dirname, "..", "registry.json");

export function orphanOutputs(itemNames: string[], files: string[]): string[] {
  const expected = new Set(["registry.json", ...itemNames.map((name) => `${name}.json`)]);
  return files.filter((file) => file.endsWith(".json") && !expected.has(file));
}

export function readOrphanOutputs(): string[] {
  const registry: { items: { name: string }[] } = JSON.parse(readFileSync(REGISTRY_FILE, "utf8"));
  return orphanOutputs(
    registry.items.map((item) => item.name),
    readdirSync(OUTPUT_DIR),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const file of readOrphanOutputs()) {
    rmSync(join(OUTPUT_DIR, file));
    console.log(`removed orphan ${file}`);
  }
}
