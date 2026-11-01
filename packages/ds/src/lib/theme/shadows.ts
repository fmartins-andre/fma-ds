// Derives Tailwind's shadow-2xs … shadow-2xl from one base shadow, the recipe from tweakcn's
// utils/shadows.ts (https://github.com/jnsahaj/tweakcn, Apache-2.0). The layers are Tailwind's:
// the recipe is shadow-sm, the first layer grows with the size and the second stays as a tight
// contact shadow. Every control reaches every size, and colors are emitted as oklch.
// Opacity grows from shadow-sm up: the same alpha looks weaker across a larger blur.

import { alphaOf, withAlpha } from "./color";
import type { ThemeShadow } from "./schema";

export const SHADOW_SIZES = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;

export type ShadowSize = (typeof SHADOW_SIZES)[number];

/** Tailwind v4's default shadow scale, what styles.css falls back to without a theme shadow. */
export const TAILWIND_SHADOWS: Record<ShadowSize, string> = {
  "2xs": "0 1px rgb(0 0 0 / 0.05)",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

/**
 * The recipe that reproduces the lengths of Tailwind's scale, except for the blur of shadow-2xs
 * and the second layer of shadow-2xl, which Tailwind doesn't have.
 */
const REFERENCE = { y: 1, blur: 3 };

/** What a size does to the recipe: multiples of offset and blur, and spread to add. */
type Layer = { y: number; blur: number; spread: number };

const layer = (y: number, blur: number, spread = 0): Layer => ({ y, blur, spread });

const LAYERS: Record<ShadowSize, { opacity: number; layers: Layer[] }> = {
  "2xs": { opacity: 0.5, layers: [layer(1, 1 / 3)] },
  xs: { opacity: 0.5, layers: [layer(1, 2 / 3)] },
  sm: { opacity: 1, layers: [layer(1, 1), layer(1, 2 / 3, -1)] },
  md: { opacity: 1.25, layers: [layer(4, 2, -1), layer(2, 4 / 3, -2)] },
  lg: { opacity: 1.5, layers: [layer(10, 5, -3), layer(4, 2, -4)] },
  xl: { opacity: 1.75, layers: [layer(20, 25 / 3, -5), layer(8, 10 / 3, -6)] },
  "2xl": { opacity: 2, layers: [layer(25, 50 / 3, -12), layer(12, 14 / 3, -8)] },
};

/**
 * Proportional up to the reference, so zero stays zero in every size. Past it only the growth
 * of the reference is added: a recipe of 4px would otherwise reach 80px in shadow-xl.
 */
function grow(length: string, multiplier: number, reference: number) {
  const value = Number.parseFloat(length) || 0;
  const size = Math.abs(value);
  const grown = Math.min(size * multiplier, size + (multiplier - 1) * reference);
  return `${Number((Math.sign(value) * grown).toFixed(2))}px`;
}

export function shadowScale(shadow: ThemeShadow): Record<ShadowSize, string> {
  const { offsetX, offsetY, blur, spread } = shadow;
  // The color's own alpha is multiplied in, so "oklch(0 0 0 / 50%)" at opacity 0.2 is 0.1.
  const baseAlpha = alphaOf(shadow.color) * shadow.opacity;
  const color = (multiplier: number) =>
    withAlpha(shadow.color, Math.min(1, Number((baseAlpha * multiplier).toFixed(2))));

  const size = ({ opacity, layers }: (typeof LAYERS)[ShadowSize]) =>
    layers
      .map((each) => {
        const y = grow(offsetY, each.y, REFERENCE.y);
        // The negative spread hides the blur at the sides: with no blur it would leave a strip.
        const inset = each.spread * Math.min(1, (Number.parseFloat(blur) || 0) / REFERENCE.blur);
        const spreadOf = `${Number(((Number.parseFloat(spread) || 0) + inset).toFixed(2))}px`;
        return `${offsetX} ${y} ${grow(blur, each.blur, REFERENCE.blur)} ${spreadOf} ${color(opacity)}`;
      })
      .join(", ");

  return Object.fromEntries(SHADOW_SIZES.map((name) => [name, size(LAYERS[name])])) as Record<
    ShadowSize,
    string
  >;
}
