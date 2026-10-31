// Design-system gate: categories are a closed list, because the site groups its
// navigation by them and a typo or the "uncategorized" stub from add:shadcn
// would become a group of its own. A new category is a decision: add it here and
// to CATEGORY_TITLES in apps/web/src/site/registry.ts.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const COMPONENT_CATEGORIES = [
  "buttons",
  "chat",
  "data-display",
  "disclosure",
  "feedback",
  "forms",
  "layout",
  "navigation",
  "overlay",
];
const MODULE_CATEGORIES = ["code", "color", "date", "forms", "utils"];

const ALLOWED: Record<string, string[]> = {
  "registry:ui": COMPONENT_CATEGORIES,
  "registry:block": ["blocks"],
  "registry:lib": MODULE_CATEGORIES,
  "registry:hook": MODULE_CATEGORIES,
  "registry:theme": ["theme"],
};

const registry = JSON.parse(readFileSync(join(__dirname, "..", "registry.json"), "utf8")) as {
  items: { name: string; type: string; categories?: string[] }[];
};

describe("item categories", () => {
  it.each(registry.items.map((item) => [item.name, item] as const))("%s", (_name, item) => {
    expect(ALLOWED[item.type]).toContain(item.categories?.[0]);
  });

  it("the site has a title for every component category", () => {
    const site = readFileSync(
      join(__dirname, "..", "..", "..", "apps", "web", "src", "site", "registry.ts"),
      "utf8",
    );
    const titles = /CATEGORY_TITLES[^{]*\{([^}]*)\}/.exec(site)?.[1] ?? "";
    const keys = [...titles.matchAll(/^\s*"?([a-z-]+)"?:/gm)].map((match) => match[1]);
    expect(keys.sort()).toEqual([...COMPONENT_CATEGORIES].sort());
  });
});
