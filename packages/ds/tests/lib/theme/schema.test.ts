import { describe, expect, it } from "vitest";

import { ThemeSchema } from "@/lib/theme/schema";
import { DEFAULT_THEME } from "@/themes/index";

describe("ThemeSchema percentages", () => {
  it("accepts 0% to 100% and rejects above", () => {
    expect(ThemeSchema.safeParse({ ...DEFAULT_THEME, iconMix: "100%" }).success).toBe(true);
    expect(ThemeSchema.safeParse({ ...DEFAULT_THEME, iconMix: "101%" }).success).toBe(false);
    const soft = { light: "14%", dark: "900%" };
    expect(ThemeSchema.safeParse({ ...DEFAULT_THEME, softMix: soft }).success).toBe(false);
  });
});
