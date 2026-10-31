import { describe, expect, it } from "vitest";
import * as brand from "@/lib/brand";

const CLASSES = Object.entries(brand) as [string, string][];

// Prefixes that would make the brand color read as a state.
const STATE_PREFIX =
  /(^|\s)(hover|focus|focus-visible|active|data-\[?selected|aria-selected|aria-current|data-pressed)[:-]/;

describe("brand classes", () => {
  it.each(CLASSES)("%s uses the brand token", (_, classes) => {
    expect(classes).toMatch(/brand/);
  });

  it.each(CLASSES)("%s has no state variant", (_, classes) => {
    expect(classes).not.toMatch(STATE_PREFIX);
  });

  it("keeps focus visible on the brand surface", () => {
    expect(brand.brandSurface).toContain("bg-brand");
    expect(brand.brandSurface).toContain("[--ring:var(--brand-foreground)]");
  });

  it("gradients run from primary to brand", () => {
    expect(brand.brandGradient).toContain("from-primary to-brand");
    expect(brand.brandGradientBorder).toContain("var(--primary),var(--brand)");
  });

  it("spins only when motion is allowed", () => {
    expect(brand.brandSpinningBorder).toContain("motion-safe:before:animate-spin");
    expect(brand.brandSpinningBorder).not.toMatch(/(^|\s)before:animate-spin/);
  });
});
