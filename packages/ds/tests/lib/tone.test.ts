import { describe, expect, it } from "vitest";
import { TONE_MIX } from "@/lib/theme/contrast";
import { defaultTone, TONES, toneVariants } from "@/lib/tone";

const VARS = [
  "--tone",
  "--tone-foreground",
  "--tone-soft",
  "--tone-soft-hover",
  "--tone-line",
  "--tone-hover",
  "--tone-text",
  "--tone-icon",
];
const COLORED = TONES.filter((t) => t !== "neutral");
const pct = (n: number) => Math.round(n * 100);

describe("toneVariants", () => {
  it("covers every tone", () => {
    expect(Object.keys(toneVariants).sort()).toEqual([...TONES].sort());
  });

  it.each(TONES)("%s sets every variable", (t) => {
    for (const v of VARS) expect(toneVariants[t]).toContain(`[${v}:`);
  });

  it.each(COLORED)("%s switches the soft and line mix in dark mode", (t) => {
    expect(toneVariants[t]).toMatch(/dark:\[--tone-soft:/);
    expect(toneVariants[t]).toMatch(/dark:\[--tone-soft-hover:/);
    expect(toneVariants[t]).toMatch(/dark:\[--tone-line:/);
  });

  it.each(COLORED)("%s uses the gated recipe percentages", (t) => {
    // Tailwind arbitrary values: spaces are written as underscores.
    const css = toneVariants[t];
    expect(css).toContain(`var(--tone-soft-mix,${pct(TONE_MIX.soft.light)}%)`);
    expect(css).toContain(`var(--tone-soft-mix,${pct(TONE_MIX.soft.dark)}%)`);
    expect(css).toContain(`_*_${TONE_MIX.softHover})`);
    expect(css).toContain(`[--tone-text:var(--${t}-text)]`);
    expect(css).toContain(`var(--tone-icon-mix,${pct(TONE_MIX.icon)}%)`);
    expect(css).toContain(`var(--${t})_${pct(TONE_MIX.line.light)}%`);
    expect(css).toContain(`var(--${t})_${pct(TONE_MIX.line.dark)}%`);
    expect(css).toContain(`[--tone:var(--${t})]`);
    expect(css).toContain(`[--tone-foreground:var(--${t}-foreground)]`);
  });

  it("neutral is built from the muted family", () => {
    expect(toneVariants.neutral).not.toMatch(/--(accent|secondary|invert)\b/);
    expect(toneVariants.neutral).toContain("[--tone:var(--muted-foreground)]");
    expect(toneVariants.neutral).toContain("[--tone-soft:var(--muted)]");
    expect(toneVariants.neutral).toContain("[--tone-foreground:var(--background)]");
    expect(toneVariants.neutral).toContain(
      "[--tone-soft-hover:color-mix(in_oklab,var(--muted),var(--foreground)_5%)]",
    );
    expect(toneVariants.neutral).toContain("[--tone-line:var(--border)]");
    expect(toneVariants.neutral).toContain("[--tone-hover:var(--muted)]");
    expect(toneVariants.neutral).toContain("[--tone-text:var(--foreground)]");
    expect(toneVariants.neutral).toContain("[--tone-icon:var(--muted-foreground)]");
  });

  it("emits no raw spaces inside class names", () => {
    for (const t of TONES) {
      for (const c of toneVariants[t].split(" "))
        expect(c).toMatch(/^(dark:)?\[--tone[a-z-]*:\S+\]$/);
    }
    for (const t of TONES) expect(toneVariants[t]).not.toMatch(/,\s/);
  });
});

describe("defaultTone", () => {
  it("defaults solid to primary and the rest to neutral", () => {
    expect(defaultTone("solid")).toBe("primary");
    for (const v of ["soft", "outline", "ghost"] as const) expect(defaultTone(v)).toBe("neutral");
  });
});
