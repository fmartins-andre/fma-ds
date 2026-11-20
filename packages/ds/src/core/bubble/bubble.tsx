import { cva } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/tone";

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  );
}

type BubbleVariant = Exclude<Variant, "ghost">;

// Variant recipes (fma-ds docs, "Tones and variants"): every variant reads the --tone-*
// variables that `toneVariants` sets on the root and paints the content slot; the content keeps
// its transparent border from the base so switching variants never changes the box.
const bubbleVariantsConfig = {
  variant: {
    solid:
      "*:data-[slot=bubble-content]:bg-(--tone) *:data-[slot=bubble-content]:text-(color:--tone-foreground) [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--tone)_85%,var(--tone-soft-base,var(--background)))]",
    soft: "*:data-[slot=bubble-content]:bg-(--tone-soft) *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-(--tone-soft-hover)",
    outline:
      "*:data-[slot=bubble-content]:border-(--tone-line) *:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:text-(color:--tone-text) [&>[data-slot=bubble-content]:is(button,a):hover]:bg-(--tone-hover)",
  },
} satisfies { variant: Record<BubbleVariant, string> };

const bubbleCva = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end",
  {
    variants: bubbleVariantsConfig,
    defaultVariants: {
      variant: "solid",
    },
  },
);

type BubbleVariantProps = {
  /** The surface: `solid` (the default), `soft` or `outline`. */
  variant?: BubbleVariant;
  /** Defaults to `defaultTone(variant)`: primary for solid, neutral otherwise. */
  tone?: Tone;
  className?: string;
};

function bubbleVariants({ variant = "solid", tone, className }: BubbleVariantProps = {}) {
  return cn(bubbleCva({ variant }), toneVariants[tone ?? defaultTone(variant)], className);
}

function Bubble({
  variant = "solid",
  tone,
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  Omit<BubbleVariantProps, "className"> & {
    align?: "start" | "end";
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-tone={tone ?? defaultTone(variant)}
      data-align={align}
      className={bubbleVariants({ variant, tone, className })}
      {...props}
    />
  );
}

function BubbleContent({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  render?: (props: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}) {
  if (render) {
    const renderProps = {
      ...props,
      "data-slot": "bubble-content",
      className: cn(
        "w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50",
        className,
      ),
      children,
    };

    return render(renderProps);
  }

  return (
    <div
      {...props}
      data-slot="bubble-content"
      className={cn(
        "w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card has-[button]:p-0",
  {
    variants: {
      side: {
        top: "top-0 -translate-y-3/4",
        bottom: "bottom-0 translate-y-3/4",
      },
      align: {
        start: "left-3",
        end: "right-3",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  },
);

function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end";
  side?: "top" | "bottom";
}) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  );
}

export {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  bubbleVariants,
  bubbleVariantsConfig,
};
