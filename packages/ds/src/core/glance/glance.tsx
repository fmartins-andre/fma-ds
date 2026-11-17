import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import * as React from "react";
import {
  Button as ButtonPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
  Dialog,
  type DialogProps,
  type DialogTriggerProps,
  Heading,
} from "react-aria-components";
import { IconTile } from "@/core/icon-tile/icon-tile";
import { Popover, PopoverTrigger } from "@/core/popover/popover";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/tone";

type GlanceTone = Tone;
type GlanceVariant = Exclude<Variant, "ghost">;

const GlanceContext = React.createContext<{ variant: GlanceVariant; tone: Tone }>({
  variant: "outline",
  tone: "neutral",
});

// Variant recipes (fma-ds docs, "Tones and variants"): every variant reads the --tone-*
// variables that `toneVariants` sets, and keeps the transparent border from the base so
// switching variants never changes the box.
const glanceTriggerVariantsConfig = {
  variant: {
    solid:
      "bg-(--tone) text-(color:--tone-foreground) hover:bg-[color-mix(in_oklab,var(--tone)_85%,var(--background))] aria-expanded:bg-[color-mix(in_oklab,var(--tone)_85%,var(--background))] [&_[data-slot=glance-label]]:text-[color-mix(in_oklab,var(--tone-foreground)_78%,transparent)]",
    soft: "bg-(--tone-soft) text-(color:--tone-text) hover:bg-(--tone-soft-hover) aria-expanded:bg-(--tone-soft-hover) [&>svg]:text-(color:--tone-icon)",
    outline:
      "border-(--tone-line) bg-background text-(color:--tone-text) hover:bg-(--tone-hover) aria-expanded:bg-(--tone-hover) [&>svg]:text-(color:--tone-icon)",
  },
  size: {
    default: "h-10 px-3",
    sm: "h-8 px-2.5 [&_[data-slot=glance-label]]:sr-only",
    icon: "size-10 justify-center",
    "icon-sm": "size-8 justify-center [&_svg:not([class*='size-'])]:size-4",
  },
} satisfies { variant: Record<GlanceVariant, string>; size: Record<string, string> };

const glanceTriggerCva = cva(
  "group/glance-trigger relative inline-flex shrink-0 items-center gap-2 rounded-lg border border-transparent text-left text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: glanceTriggerVariantsConfig,
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

type GlanceTriggerVariantProps = Omit<VariantProps<typeof glanceTriggerCva>, "variant"> & {
  variant?: GlanceVariant;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
  className?: string;
};

function glanceTriggerVariants({
  variant = "outline",
  tone,
  size,
  className,
}: GlanceTriggerVariantProps = {}) {
  return cn(
    glanceTriggerCva({ variant, size }),
    toneVariants[tone ?? defaultTone(variant)],
    className,
  );
}

/**
 * Root: wires the trigger to the panel and shares the `variant` and `tone` with both.
 * Wraps react-aria's `DialogTrigger`, so `isOpen`/`onOpenChange` control it.
 */
function Glance({
  variant = "outline",
  tone,
  ...props
}: DialogTriggerProps & {
  /** The trigger's surface: `solid`, `soft` or `outline`. */
  variant?: GlanceVariant;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
}) {
  const resolvedTone = tone ?? defaultTone(variant);
  const value = React.useMemo(() => ({ variant, tone: resolvedTone }), [variant, resolvedTone]);
  return (
    <GlanceContext.Provider value={value}>
      <PopoverTrigger {...props} />
    </GlanceContext.Provider>
  );
}

function GlanceTrigger({
  className,
  size = "default",
  ...props
}: Omit<ButtonPrimitiveProps, "className"> &
  Pick<GlanceTriggerVariantProps, "size"> & {
    className?: string;
  }) {
  const { variant, tone } = React.useContext(GlanceContext);
  return (
    <ButtonPrimitive
      data-slot="glance-trigger"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={glanceTriggerVariants({ variant, tone, size, className })}
      {...props}
    />
  );
}

/** Stacks a `GlanceLabel` over a `GlanceValue` inside the trigger. */
function GlanceText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="glance-text"
      className={cn("flex min-w-0 flex-col items-start leading-tight", className)}
      {...props}
    />
  );
}

/** The small caption on top: what the value is about. Visually hidden at `size="sm"`. */
function GlanceLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="glance-label"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The quick information itself. */
function GlanceValue({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="glance-value"
      className={cn("max-w-[20ch] truncate font-medium", className)}
      {...props}
    />
  );
}

/**
 * A dot (no children) or a count pinned to the trigger's corner. Decorative:
 * put the meaning in the trigger's accessible name (e.g. `aria-label`).
 */
function GlanceIndicator({ className, children, ...props }: React.ComponentProps<"span">) {
  const hasContent = children !== undefined && children !== null && children !== false;
  return (
    <span
      data-slot="glance-indicator"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground ring-2 ring-background",
        hasContent ? "h-4 min-w-4 px-1 text-[0.625rem] leading-none tabular-nums" : "size-2.5",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * The panel opened by the trigger: a popover holding a dialog, so focus moves
 * in, Escape closes it and focus returns to the trigger. Children can be a
 * function of `{ close }` to close it from an action.
 */
function GlanceContent({
  className,
  placement = "bottom end",
  children,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<typeof Popover>, "children"> & {
  children?: DialogProps["children"];
  "aria-label"?: string;
}) {
  const { tone } = React.useContext(GlanceContext);
  return (
    <Popover
      data-slot="glance-content"
      data-tone={tone}
      placement={placement}
      className={cn("w-80 p-0", className)}
      {...props}
    >
      <Dialog aria-label={ariaLabel} className="flex min-h-0 flex-col gap-3 p-3 outline-none">
        {children}
      </Dialog>
    </Popover>
  );
}

function GlanceHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glance-header"
      className={cn("flex items-start gap-3 [&>[data-slot=glance-media]+div]:flex-1", className)}
      {...props}
    />
  );
}

/** An icon in a `soft` `IconTile` in the root's `tone`. */
function GlanceMedia(props: React.ComponentProps<typeof IconTile>) {
  const { tone } = React.useContext(GlanceContext);
  return (
    <IconTile data-slot="glance-media" variant="soft" tone={tone} aria-hidden="true" {...props} />
  );
}

/** The panel's heading; names the dialog for assistive tech. */
function GlanceTitle({ className, ...props }: React.ComponentProps<typeof Heading>) {
  return (
    <Heading
      slot="title"
      data-slot="glance-title"
      className={cn("text-base leading-snug font-medium", className)}
      {...props}
    />
  );
}

function GlanceDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glance-description"
      className={cn("text-sm text-muted-foreground [&_p:not(:last-child)]:mb-2", className)}
      {...props}
    />
  );
}

/** Actions, set apart at the bottom of the panel. */
function GlanceFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glance-footer"
      className={cn(
        "-mx-3 -mb-3 flex items-center justify-end gap-2 border-t p-3 *:[[data-slot=button]]:flex-1",
        className,
      )}
      {...props}
    />
  );
}

export type { GlanceTone, GlanceVariant };
export {
  Glance,
  GlanceContent,
  GlanceDescription,
  GlanceFooter,
  GlanceHeader,
  GlanceIndicator,
  GlanceLabel,
  GlanceMedia,
  GlanceText,
  GlanceTitle,
  GlanceTrigger,
  GlanceValue,
  glanceTriggerVariants,
  glanceTriggerVariantsConfig,
};
