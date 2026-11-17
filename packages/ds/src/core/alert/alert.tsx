import { cva } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/tone";

type AlertVariant = Exclude<Variant, "ghost">;

// Variant recipes (docs/plans/tone-variant-standard.md): every variant reads the --tone-*
// variables that `toneVariants` sets, and keeps the transparent border from the base so
// switching variants never changes the box. All three surfaces are opaque (the soft tint is
// mixed with --background), so a colored container behind the alert doesn't bleed through.
const alertVariantsConfig = {
  variant: {
    // The ring and link hover follow the text so they stay visible on the tone surface.
    solid:
      "bg-(--tone) text-(color:--tone-foreground) [--ring:var(--tone-foreground)] [--alert-link-hover:var(--tone-foreground)] [&_[data-slot=alert-description]]:text-[color-mix(in_oklab,var(--tone-foreground)_78%,transparent)]",
    soft: "bg-(--tone-soft) text-foreground [&>svg]:text-(color:--tone-icon) [&_[data-slot=alert-description]]:text-foreground/80",
    outline:
      "border-(--tone-line) bg-background text-foreground [&_[data-slot=alert-title]]:text-(color:--tone-text) [&>svg]:text-(color:--tone-icon)",
  },
} satisfies { variant: Record<AlertVariant, string> };

const alertCva = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: alertVariantsConfig,
    defaultVariants: {
      variant: "outline",
    },
  },
);

type AlertVariantProps = {
  /** The surface: `solid`, `soft` or `outline` (the default). */
  variant?: AlertVariant;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
  className?: string;
};

function alertVariants({ variant = "outline", tone, className }: AlertVariantProps = {}) {
  return cn(alertCva({ variant }), toneVariants[tone ?? defaultTone(variant)], className);
}

function Alert({
  className,
  variant = "outline",
  tone,
  ...props
}: React.ComponentProps<"div"> & Omit<AlertVariantProps, "className">) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      data-tone={tone ?? defaultTone(variant)}
      role="alert"
      className={alertVariants({ variant, tone, className })}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-[color:var(--alert-link-hover,var(--foreground))]",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-[color:var(--alert-link-hover,var(--foreground))] [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-action" className={cn("absolute top-2 right-2", className)} {...props} />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants, alertVariantsConfig };
