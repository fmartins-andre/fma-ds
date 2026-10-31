import { readFileSync } from "node:fs";
import type { RegistryItem } from "@fma-ds/registry";
import { describe, expect, it } from "vitest";
import { contentHash } from "../scripts/gen-registry-json";

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: RegistryItem[] };

describe("item content hashes", () => {
  it.each(registry.items.map((item) => [item.name, item] as const))("%s", (_name, item) => {
    expect(item.meta?.contentHash).toBe(contentHash(item));
  });

  it("is unique to the content", () => {
    const hashes = registry.items.map((item) => item.meta?.contentHash);
    expect(new Set(hashes).size).toBe(hashes.length);
  });
});
