import { describe, expect, it } from "vitest";
import { INPUT_MIX, inputMixOf } from "@/lib/theme/input";
import { THEMES } from "@/themes/index";

describe("inputMixOf", () => {
  const theme = THEMES[0];
  if (!theme) throw new Error("no curated theme");

  it("defaults to transparent light fields and a faint dark fill", () => {
    expect(inputMixOf({ ...theme, inputMix: undefined }, "light")).toBe(INPUT_MIX.light);
    expect(inputMixOf({ ...theme, inputMix: undefined }, "dark")).toBe(INPUT_MIX.dark);
    expect(INPUT_MIX.light).toBe(0);
  });

  it("reads the theme's inputMix as a 0-1 share", () => {
    const set = { ...theme, inputMix: { light: "5%", dark: "15%" } };
    expect(inputMixOf(set, "light")).toBeCloseTo(0.05);
    expect(inputMixOf(set, "dark")).toBeCloseTo(0.15);
  });
});
