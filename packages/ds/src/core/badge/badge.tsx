import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/tone";

// Variant recipes (docs/plans/tone-variant-standard.md): every variant reads the --tone-*
// variables that `toneVariants` sets, and keeps the transparent border from the base so
// switching variants never changes the box. `ghost` is a colored dot before plain text,
// with no surface, so it sits in lists, select items and table cells; the text carries the
// meaning, not the color.
const badgeVariantsConfig = {
  variant: {
    solid: "bg-(--tone) text-(color:--tone-foreground)",
    soft: "bg-(--tone-soft) text-(color:--tone-text)",
    outline: "border-(--tone-line) bg-background text-(color:--tone-text)",
    ghost:
      "text-foreground before:size-1.5 before:shrink-0 before:rounded-full before:bg-(--tone-icon)",
  },
  size: {
    xs: "px-1 py-0.25 text-[0.6rem] leading-none h-4 min-w-4 gap-1",
    sm: "px-1.5 py-0.25 text-[0.625rem] leading-none h-4.5 min-w-4.5 gap-1",
    default: "px-1.75 py-0.5 text-xs h-5 min-w-5 gap-1",
    lg: "px-2 py-0.5 text-xs h-5.5 min-w-5.5 gap-1",
    xl: "px-2.25 py-0.75 text-sm h-6 min-w-6 gap-1.5",
  },
  radius: {
    default: "rounded-md",
    full: "rounded-full",
  },
} satisfies {
  variant: Record<Variant, string>;
  size: Record<string, string>;
  radius: Record<string, string>;
};

const badgeCva = cva(
  "group/badge relative inline-flex w-fit shrink-0 items-center justify-center overflow-hidden border border-transparent font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3",
  {
    variants: badgeVariantsConfig,
    defaultVariants: {
      variant: "solid",
      size: "default",
      radius: "default",
    },
  },
);

type BadgeVariantProps = Omit<VariantProps<typeof badgeCva>, "variant"> & {
  /** `null` drops the variant and tone, for a caller that paints the badge itself. */
  variant?: Variant | null;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
  className?: string;
};

function badgeVariants({
  variant = "solid",
  tone,
  size,
  radius,
  className,
}: BadgeVariantProps = {}) {
  if (variant === null) return cn(badgeCva({ variant: null, size, radius }), className);
  return cn(
    badgeCva({ variant, size, radius }),
    toneVariants[tone ?? defaultTone(variant)],
    className,
  );
}

function Badge({
  className,
  variant = "solid",
  tone,
  size,
  radius,
  render,
  ...props
}: Omit<React.ComponentProps<"span">, "className"> &
  BadgeVariantProps & {
    render?: (props: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
  }) {
  const resolvedTone = variant === null ? undefined : (tone ?? defaultTone(variant));
  const renderProps = {
    "data-slot": "badge",
    "data-variant": variant ?? undefined,
    "data-tone": resolvedTone,
    className: badgeVariants({ variant, tone, size, radius, className }),
    ...props,
  };

  if (render) return render(renderProps);
  return <span {...renderProps} />;
}

export { Badge, badgeVariants, badgeVariantsConfig };
