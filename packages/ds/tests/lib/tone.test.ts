import { describe, expect, it } from "vitest";
import { softBase, TONE_MIX } from "@/lib/theme/contrast";
import { modeThemeVars } from "@/lib/theme/css";
import { defaultTone, TONES, toneVariants } from "@/lib/tone";
import { DEFAULT_THEME } from "@/themes/index";

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

  it.each(TONES)("%s switches the soft mix in dark mode", (t) => {
    expect(toneVariants[t]).toMatch(/dark:\[--tone-soft:/);
    expect(toneVariants[t]).toMatch(/dark:\[--tone-soft-hover:/);
  });

  it.each(COLORED)("%s switches the line mix in dark mode", (t) => {
    expect(toneVariants[t]).toMatch(/dark:\[--tone-line:/);
  });

  it.each(TONES)("%s uses the gated recipe percentages", (t) => {
    // Tailwind arbitrary values: spaces are written as underscores.
    const css = toneVariants[t];
    expect(css).toContain(`var(--tone-soft-mix,${pct(TONE_MIX.soft.light)}%)`);
    expect(css).toContain(`var(--tone-soft-mix,${pct(TONE_MIX.soft.dark)}%)`);
    expect(css).toContain(`_*_${TONE_MIX.softHover.light})`);
    expect(css).toContain(`_*_${TONE_MIX.softHover.dark})`);
    expect(css).toContain(`[--tone-text:var(--${t}-text)]`);
    expect(css).toContain(`var(--tone-icon-mix,${pct(TONE_MIX.icon)}%)`);
    expect(css).toContain(`[--tone:var(--${t})]`);
    expect(css).toContain(`[--tone-foreground:var(--${t}-foreground)]`);
    expect(css).toContain("[--tone-hover:var(--tone-soft)]");
  });

  it.each(TONES)("%s mixes the soft tints with the hue-less base, not the page", (t) => {
    const soft = toneVariants[t].split(" ").filter((c) => /--tone-soft(-hover)?:/.test(c));
    expect(soft).toHaveLength(4);
    for (const c of soft) expect(c).toContain(",var(--tone-soft-base,var(--background)))]");
  });

  it.each(COLORED)("%s mixes its outline line from the tone", (t) => {
    expect(toneVariants[t]).toContain(`var(--${t})_${pct(TONE_MIX.line.light)}%`);
    expect(toneVariants[t]).toContain(`var(--${t})_${pct(TONE_MIX.line.dark)}%`);
  });

  it("neutral has its own tokens and keeps --border as the outline line", () => {
    expect(toneVariants.neutral).not.toMatch(
      /--(muted|muted-foreground|accent|secondary|invert)\b/,
    );
    expect(toneVariants.neutral).toContain("[--tone-line:var(--border)]");
    expect(toneVariants.neutral).not.toMatch(/dark:\[--tone-line:/);
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

describe("softBase", () => {
  it("is the card's lightness with no chroma, in every theme var block", () => {
    const colors = { ...DEFAULT_THEME.light, card: "#0a1330" };
    expect(softBase(colors)).toMatch(/^oklch\([\d.]+ 0 0\)$/);
    const vars = modeThemeVars({ ...DEFAULT_THEME, light: colors }, "light");
    expect(vars["--tone-soft-base"]).toBe(softBase(colors));
  });
});
