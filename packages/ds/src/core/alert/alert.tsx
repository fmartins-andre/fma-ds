import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        // Status tints sit on an opaque card surface (the tint is a gradient layer over
        // it): a translucent background would mix with whatever is behind the alert
        // (a muted section, a colored panel) and lose its weight.
        destructive:
          "border-destructive/30 bg-card bg-linear-to-r from-destructive/4 to-destructive/4 text-card-foreground dark:from-destructive/15 dark:to-destructive/15 [&>svg]:text-destructive",
        info: "border-info/30 bg-card bg-linear-to-r from-info/4 to-info/4 text-card-foreground dark:from-info/15 dark:to-info/15 [&>svg]:text-info",
        success:
          "border-success/30 bg-card bg-linear-to-r from-success/4 to-success/4 text-card-foreground dark:from-success/15 dark:to-success/15 [&>svg]:text-success",
        warning:
          "border-warning/30 bg-card bg-linear-to-r from-warning/4 to-warning/4 text-card-foreground dark:from-warning/15 dark:to-warning/15 [&>svg]:text-warning",
        invert:
          "border-invert bg-invert text-invert-foreground [&_[data-slot=alert-description]]:text-invert-foreground/70",
        // Announcements and promos in the second identity color, not status. The
        // ring follows the text so focus stays visible on the brand surface.
        brand:
          "border-brand bg-brand text-brand-foreground [--ring:var(--brand-foreground)] [&_[data-slot=alert-description]]:text-brand-foreground/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
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
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
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

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
