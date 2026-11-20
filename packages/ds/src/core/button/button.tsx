import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";
import {
  Button as ButtonPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
  Link as LinkPrimitive,
  type LinkProps as LinkPrimitiveProps,
} from "react-aria-components";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/tone";

// Variant recipes (fma-ds docs, "Tones and variants"): every variant reads the
// --tone-* variables that `toneVariants` sets, and keeps the transparent border from
// the base so switching variants never changes the box.
const buttonVariantsConfig = {
  variant: {
    solid:
      "bg-(--tone) text-(color:--tone-foreground) hover:bg-[color-mix(in_oklab,var(--tone)_85%,var(--tone-soft-base,var(--background)))] aria-expanded:bg-[color-mix(in_oklab,var(--tone)_85%,var(--tone-soft-base,var(--background)))]",
    soft: "bg-(--tone-soft) text-(color:--tone-text) hover:bg-(--tone-soft-hover) aria-expanded:bg-(--tone-soft-hover)",
    outline:
      "border-(--tone-line) bg-background text-(color:--tone-text) hover:bg-(--tone-hover) aria-expanded:bg-(--tone-hover)",
    ghost: "text-(color:--tone-text) hover:bg-(--tone-hover) aria-expanded:bg-(--tone-hover)",
  },
  size: {
    default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
    xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
    sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
    lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
    icon: "size-8",
    "icon-xs":
      "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
    "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
    "icon-lg": "size-9",
  },
} satisfies { variant: Record<Variant, string>; size: Record<string, string> };

const buttonCva = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: buttonVariantsConfig,
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  },
);

type ButtonVariantProps = Omit<VariantProps<typeof buttonCva>, "variant"> & {
  variant?: Variant;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
  className?: string;
};

function buttonVariants({ variant = "solid", tone, size, className }: ButtonVariantProps = {}) {
  return cn(buttonCva({ variant, size }), toneVariants[tone ?? defaultTone(variant)], className);
}

function Button({
  className,
  variant = "solid",
  tone,
  size = "default",
  ...props
}: Omit<ButtonPrimitiveProps, "className"> &
  React.RefAttributes<HTMLButtonElement> &
  ButtonVariantProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-tone={tone ?? defaultTone(variant)}
      data-size={size}
      className={buttonVariants({ variant, tone, size, className })}
      {...props}
    />
  );
}

function LinkButton({
  className,
  variant = "solid",
  tone,
  size = "default",
  ...props
}: Omit<LinkPrimitiveProps, "className"> & ButtonVariantProps) {
  return (
    <LinkPrimitive
      data-slot="button"
      data-variant={variant}
      data-tone={tone ?? defaultTone(variant)}
      data-size={size}
      className={buttonVariants({ variant, tone, size, className })}
      {...props}
    />
  );
}

export { Button, buttonVariants, buttonVariantsConfig, LinkButton };
