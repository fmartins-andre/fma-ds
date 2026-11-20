import { describe, expect, it } from "vitest";

import { mixColors } from "@/lib/theme/color";
import { TONE_MIX } from "@/lib/theme/contrast";
import { deriveToneText } from "@/lib/theme/tone-text";
import { DEFAULT_THEME, THEMES } from "@/themes/index";

describe("deriveToneText", () => {
  it("starts from half tone, half foreground", () => {
    expect(deriveToneText(DEFAULT_THEME.light, "success", "light")).toBe(
      "oklch(0.336 0.077 150.069)",
    );
  });

  it("measures the soft surfaces with a custom softMix", () => {
    const colors = { ...DEFAULT_THEME.light, success: "oklch(0.6 0.2 150)" };
    const defaultSoft = deriveToneText(colors, "success", "light");
    expect(deriveToneText(colors, "success", "light", TONE_MIX.soft.light)).toBe(defaultSoft);
    expect(deriveToneText(colors, "success", "light", 0.6)).not.toBe(defaultSoft);
  });

  it("moves only L when the mix fails", () => {
    const kodama = THEMES.find((theme) => theme.name === "kodama-grove");
    if (!kodama) throw new Error("kodama-grove missing");
    expect(deriveToneText(kodama.light, "primary", "light")).toBe("oklch(0.471 0.062 106.4)");
  });

  it("moves lighter on a dark page when the plain mix fails", () => {
    const colors = {
      ...DEFAULT_THEME.dark,
      info: "oklch(0.35 0.15 260)",
      foreground: "oklch(0.6 0.02 260)",
    };
    const plain = mixColors(colors.info, colors.foreground, TONE_MIX.text);
    expect(plain).toBe("oklch(0.475 0.085 260)");
    expect(deriveToneText(colors, "info", "dark")).toBe("oklch(0.625 0.085 260)");
  });
});
