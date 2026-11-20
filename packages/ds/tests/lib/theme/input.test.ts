import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/theme/color";
import { INPUT_CONTRAST, INPUT_MIX, inputMixOf, strengthenInput } from "@/lib/theme/input";
import { DEFAULT_THEME } from "@/themes/index";

describe("strengthenInput", () => {
  it("keeps a border that already reaches 3:1 on the page and the card", () => {
    expect(strengthenInput(DEFAULT_THEME.light)).toBe(DEFAULT_THEME.light.input);
    expect(strengthenInput(DEFAULT_THEME.dark)).toBe(DEFAULT_THEME.dark.input);
  });

  it("darkens a faint light border until it reaches 3:1, keeping chroma and hue", () => {
    const colors = { ...DEFAULT_THEME.light, input: "oklch(0.922 0.01 250)" };
    const input = strengthenInput(colors);
    expect(contrastRatio(input, colors.background)).toBeGreaterThanOrEqual(INPUT_CONTRAST);
    expect(contrastRatio(input, colors.card)).toBeGreaterThanOrEqual(INPUT_CONTRAST);
    expect(input).toMatch(/^oklch\(0\.\d+ 0\.01 250\)$/);
  });

  it("composites a translucent dark border over the page before lightening it", () => {
    const colors = { ...DEFAULT_THEME.dark, input: "oklch(1 0 0 / 15%)" };
    const input = strengthenInput(colors);
    expect(input).not.toContain("/");
    expect(contrastRatio(input, colors.background)).toBeGreaterThanOrEqual(INPUT_CONTRAST);
  });
});

describe("inputMixOf", () => {
  it("defaults to transparent light fields and a faint dark fill", () => {
    expect(inputMixOf(DEFAULT_THEME, "light")).toBe(INPUT_MIX.light);
    expect(inputMixOf(DEFAULT_THEME, "dark")).toBe(INPUT_MIX.dark);
    expect(INPUT_MIX.light).toBe(0);
  });

  it("reads the theme's inputMix as a 0-1 share", () => {
    const theme = { ...DEFAULT_THEME, inputMix: { light: "5%", dark: "15%" } };
    expect(inputMixOf(theme, "light")).toBeCloseTo(0.05);
    expect(inputMixOf(theme, "dark")).toBeCloseTo(0.15);
  });
});
