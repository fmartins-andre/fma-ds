// Every published item states its license, so an app can tell what it copied
// without reading the repository. Themes adapted from tweakcn stay Apache-2.0.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const registry = JSON.parse(readFileSync(join(__dirname, "..", "registry.json"), "utf8")) as {
  items: { name: string; type: string; meta: { source: string; license?: string } }[];
};

describe("item licenses", () => {
  it.each(registry.items.map((item) => [item.name, item] as const))("%s", (_name, item) => {
    const adaptedTheme = item.type === "registry:theme" && item.meta.source === "third-party";
    expect(item.meta.license).toBe(adaptedTheme ? "Apache-2.0" : "MIT");
  });
});
