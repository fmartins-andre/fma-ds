import { cn } from "cn";
import type * as React from "react";

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>[data-slot=card-content][data-bleed=end]]:pb-0 has-[>[data-slot=card-footer][data-sticky]]:overflow-visible has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

/**
 * `bleed` drops the side padding, so what's inside (a table, an image, a map) spans the
 * card's edges. `bleed="end"` is for content that closes the card: the card also drops
 * its bottom padding, as it does for a `CardFooter`.
 */
function CardContent({
  className,
  bleed = false,
  ...props
}: React.ComponentProps<"div"> & { bleed?: boolean | "end" }) {
  return (
    <div
      data-slot="card-content"
      data-bleed={bleed === "end" ? "end" : bleed ? "" : undefined}
      className={cn("px-(--card-spacing)", bleed && "px-0", className)}
      {...props}
    />
  );
}

/**
 * `sticky` keeps it at the bottom of the screen while a long card scrolls, on an
 * opaque surface (the same color), so what scrolls under it doesn't show. The card
 * stops clipping its overflow so the footer can stick.
 */
function CardFooter({
  className,
  sticky = false,
  ...props
}: React.ComponentProps<"div"> & { sticky?: boolean }) {
  return (
    <div
      data-slot="card-footer"
      data-sticky={sticky || undefined}
      className={cn(
        // mt-auto: in a card stretched taller than its content (a grid row), the footer
        // stays at the bottom instead of leaving a blank strip under it.
        "mt-auto flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        sticky && "sticky bottom-0 z-10 bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))]",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
