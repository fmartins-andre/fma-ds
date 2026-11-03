// Gate: apps/web/public/r holds only what registry.json publishes. `shadcn build`
// never deletes, so an item removed from src/ would stay installable from the site.
import { describe, expect, it } from "vitest";
import { orphanOutputs, readOrphanOutputs } from "../scripts/prune-registry-output";

describe("registry output", () => {
  it("flags .json files that aren't registry items", () => {
    expect(
      orphanOutputs(["button"], ["button.json", "registry.json", "gone.json", ".gitkeep"]),
    ).toEqual(["gone.json"]);
  });

  it("apps/web/public/r has no orphan item (run pnpm --filter @fma-ds/ds build)", () => {
    expect(readOrphanOutputs()).toEqual([]);
  });
});
