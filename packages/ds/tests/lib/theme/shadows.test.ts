import { describe, expect, it } from "vitest";
import { SHADOW_SIZES, shadowScale, TAILWIND_SHADOWS } from "@/lib/theme/shadows";

const recipe = {
  color: "oklch(0 0 0)",
  opacity: 0.1,
  blur: "3px",
  spread: "0px",
  offsetX: "0px",
  offsetY: "1px",
};

const layers = (value: string) => value.split(/,\s+(?=-?\d)/);
const lengths = (layer: string) =>
  (layer.match(/(?<![\d.])-?[\d.]+(?:px)?(?=\s|$)/g) ?? []).slice(0, 4).map(Number.parseFloat);

describe("shadowScale", () => {
  it("reproduces Tailwind's scale from the default recipe", () => {
    const scale = shadowScale(recipe);
    for (const size of SHADOW_SIZES.filter((name) => name !== "2xs" && name !== "2xl")) {
      const expected = layers(TAILWIND_SHADOWS[size]).map((layer) =>
        (layer.match(/-?\d+(?:px)?(?= )/g) ?? []).slice(0, 4).map(Number.parseFloat),
      );
      expect(layers(scale[size]).map(lengths), size).toEqual(expected);
    }
  });

  it("layers every size from shadow-sm up", () => {
    const scale = shadowScale(recipe);
    const counts = SHADOW_SIZES.map((size) => layers(scale[size]).length);
    expect(counts).toEqual([1, 1, 2, 2, 2, 2, 2]);
  });

  it("makes the recipe itself shadow-sm", () => {
    const [first] = layers(shadowScale({ ...recipe, offsetY: "4px", blur: "8px" }).sm);
    expect(lengths(first ?? "")).toEqual([0, 4, 8, 0]);
  });

  it("has no blur in any size or layer when the blur is zero", () => {
    const scale = shadowScale({ ...recipe, blur: "0px" });
    for (const size of SHADOW_SIZES) {
      for (const layer of layers(scale[size])) expect(lengths(layer)[2], size).toBe(0);
    }
  });

  it("adds no negative spread to a hard shadow", () => {
    const scale = shadowScale({ ...recipe, blur: "0px", offsetY: "2px" });
    for (const size of SHADOW_SIZES) {
      for (const layer of layers(scale[size])) expect(lengths(layer)[3], size).toBe(0);
    }
  });

  it("has no vertical offset in any size or layer when the offset is zero", () => {
    const scale = shadowScale({ ...recipe, offsetY: "0px" });
    for (const size of SHADOW_SIZES) {
      for (const layer of layers(scale[size])) expect(lengths(layer)[1], size).toBe(0);
    }
  });

  it.each(["3px", "8px", "16px"])("grows from size to size with a blur of %s", (blur) => {
    const scale = shadowScale({ ...recipe, offsetY: "4px", blur });
    const first = SHADOW_SIZES.map((size) => lengths(layers(scale[size])[0] ?? ""));
    for (const [index, current] of first.entries()) {
      const next = first[index + 1];
      if (next) expect(next[2]).toBeGreaterThan(current[2] ?? 0);
    }
  });

  it("keeps large recipes near Tailwind's sizes", () => {
    const [first] = layers(shadowScale({ ...recipe, offsetY: "4px", blur: "8px" }).xl);
    expect(lengths(first ?? "").slice(1, 3)).toEqual([23, 30]);
  });

  it("keeps the direction of a negative offset", () => {
    const [first] = layers(shadowScale({ ...recipe, offsetY: "-2px" }).md);
    expect(lengths(first ?? "")[1]).toBe(-5);
  });

  it("gives shadow-2xs and shadow-xs different blurs", () => {
    const scale = shadowScale(recipe);
    expect(scale["2xs"]).not.toBe(scale.xs);
  });
});
