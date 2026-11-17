import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/tone";

// Variant recipes (fma-ds docs, "Tones and variants"): every variant reads the --tone-*
// variables that `toneVariants` sets. The root owns the footprint (size, radius and the
// transparent border), so switching variants (ghost ↔ soft, for instance) never moves the
// layout. `ghost` has no surface: only the icon, in the tone.
const iconTileVariantsConfig = {
  variant: {
    solid: "bg-(--tone) text-(color:--tone-foreground)",
    soft: "bg-(--tone-soft) text-(color:--tone-icon)",
    outline: "border-(--tone-line) bg-background text-(color:--tone-icon)",
    ghost: "text-(color:--tone-icon)",
  },
  size: {
    xs: "[--icon-tile-icon-size:--spacing(3.5)] [--icon-tile-size:--spacing(6)]",
    sm: "[--icon-tile-icon-size:--spacing(4)] [--icon-tile-size:--spacing(8)]",
    default: "[--icon-tile-icon-size:--spacing(4.5)] [--icon-tile-size:--spacing(10)]",
    lg: "[--icon-tile-icon-size:--spacing(5.5)] [--icon-tile-size:--spacing(12)]",
    xl: "[--icon-tile-icon-size:--spacing(7)] [--icon-tile-size:--spacing(14)]",
  },
  radius: {
    // Clamped to a third of the tile, so small tiles keep their corner
    // ratio instead of turning into circles (which is what `full` is for).
    default: "[--icon-tile-radius:min(var(--radius-md),calc(var(--icon-tile-size)/3))]",
    full: "[--icon-tile-radius:calc(infinity*1px)]",
  },
} satisfies {
  variant: Record<Variant, string>;
  size: Record<string, string>;
  radius: Record<string, string>;
};

/**
 * The root owns three variables so every part of the tile stays in proportion
 * and is overridable from `className`:
 *
 *   --icon-tile-size       tile width/height
 *   --icon-tile-icon-size  glyph size applied to child svgs
 *   --icon-tile-radius     corner radius
 */
const iconTileCva = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center align-middle",
    "size-(--icon-tile-size) rounded-(--icon-tile-radius) border border-transparent",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-(--icon-tile-icon-size)",
  ],
  {
    variants: iconTileVariantsConfig,
    defaultVariants: {
      variant: "outline",
      size: "default",
      radius: "default",
    },
  },
);

type IconTileVariantProps = Omit<VariantProps<typeof iconTileCva>, "variant"> & {
  variant?: Variant;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
  className?: string;
};

function iconTileVariants({
  variant = "outline",
  tone,
  size,
  radius,
  className,
}: IconTileVariantProps = {}) {
  return cn(
    iconTileCva({ variant, size, radius }),
    toneVariants[tone ?? defaultTone(variant)],
    className,
  );
}

type IconTileProps = Omit<React.ComponentProps<"span">, "className"> & IconTileVariantProps;

function IconTile({
  className,
  variant = "outline",
  tone,
  size = "default",
  radius = "default",
  ...props
}: IconTileProps) {
  const resolvedTone = tone ?? defaultTone(variant);
  return (
    <span
      data-slot="icon-tile"
      data-variant={variant}
      data-tone={resolvedTone}
      data-size={size}
      className={iconTileVariants({ variant, tone: resolvedTone, size, radius, className })}
      {...props}
    />
  );
}

export type { IconTileProps };
export { IconTile, iconTileVariants, iconTileVariantsConfig };
