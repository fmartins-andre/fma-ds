import { describe, expect, it } from "vitest";

import { checkContrast, iconMixOf, softMixOf, TONE_MIX } from "@/lib/theme/contrast";
import type { Theme } from "@/lib/theme/schema";
import { DEFAULT_THEME } from "@/themes/index";

describe("checkContrast", () => {
  it("passes the default theme in both modes", () => {
    expect(checkContrast(DEFAULT_THEME, "light").every((pair) => pair.passes)).toBe(true);
    expect(checkContrast(DEFAULT_THEME, "dark").every((pair) => pair.passes)).toBe(true);
  });

  it("flags pairs under their minimum", () => {
    const unreadable = {
      ...DEFAULT_THEME,
      light: { ...DEFAULT_THEME.light, foreground: DEFAULT_THEME.light.background },
    };
    const failing = checkContrast(unreadable, "light").filter((pair) => !pair.passes);
    expect(failing.map((pair) => pair.foreground)).toEqual(["--foreground"]);
    expect(failing[0]?.ratio).toBeCloseTo(1);
    expect(failing[0]?.minimum).toBe(4.5);
  });

  it("checks in-tone text on the soft surface", () => {
    const results = checkContrast(DEFAULT_THEME, "light");
    expect(
      results.some((r) => r.foreground === "--success-text" && r.background === "soft(--success)"),
    ).toBe(true);
    expect(results.some((r) => r.background === "soft-hover(--success)")).toBe(true);
    expect(
      results.some((r) => r.foreground === "--primary-text" && r.background === "--background"),
    ).toBe(true);
  });

  it("fails in-tone text that blends into its soft surface", () => {
    const theme = structuredClone(DEFAULT_THEME);
    theme.light["info-text"] = "oklch(0.93 0.03 262.881)";
    expect(
      checkContrast(theme, "light").some((r) => r.background === "soft(--info)" && !r.passes),
    ).toBe(true);
  });

  it("measures icons with the theme's iconMix", () => {
    const pale: Theme = { ...structuredClone(DEFAULT_THEME), iconMix: "0%" };
    pale.light.primary = "oklch(0.9 0.1 140)";
    const icon = (t: Theme) =>
      checkContrast(t, "light").find(
        (r) => r.foreground === "icon(--primary)" && r.background === "--background",
      );
    expect(icon(pale)?.passes).toBe(false);
    expect(icon({ ...pale, iconMix: "100%" })?.passes).toBe(true);
  });

  it("checks icons on the page and on the soft tint of all six tones", () => {
    const results = checkContrast(DEFAULT_THEME, "light");
    for (const tone of ["primary", "brand", "success", "warning", "info", "destructive"]) {
      const backgrounds = results
        .filter((r) => r.foreground === `icon(--${tone})`)
        .map((r) => r.background);
      expect(backgrounds).toEqual(["--background", `soft(--${tone})`]);
    }
    expect(
      results.filter((r) => r.foreground.startsWith("icon(")).every((r) => r.minimum === 3),
    ).toBe(true);
  });

  it("measures in-tone text on the theme's soft tint", () => {
    const strong: Theme = {
      ...structuredClone(DEFAULT_THEME),
      softMix: { light: "90%", dark: "90%" },
    };
    const onSoft = checkContrast(strong, "light").find(
      (r) => r.foreground === "--info-text" && r.background === "soft(--info)",
    );
    expect(onSoft?.passes).toBe(false);
  });
});

describe("iconMixOf and softMixOf", () => {
  it("default to the shared recipe and read the theme's fields as 0-1 shares", () => {
    expect(iconMixOf(DEFAULT_THEME)).toBe(TONE_MIX.icon);
    expect(softMixOf(DEFAULT_THEME, "light")).toBe(TONE_MIX.soft.light);
    expect(softMixOf(DEFAULT_THEME, "dark")).toBe(TONE_MIX.soft.dark);
    const set = { ...DEFAULT_THEME, iconMix: "51%", softMix: { light: "14%", dark: "22%" } };
    expect(iconMixOf(set)).toBeCloseTo(0.51);
    expect(softMixOf(set, "light")).toBeCloseTo(0.14);
    expect(softMixOf(set, "dark")).toBeCloseTo(0.22);
  });
});
