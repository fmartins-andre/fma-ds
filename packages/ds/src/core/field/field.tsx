import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { InfoIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, type PopoverProps } from "react-aria-components";
import { Button } from "@/core/button/button";
import { Label } from "@/core/label/label";
import { Popover } from "@/core/popover/popover";
import { Separator } from "@/core/separator/separator";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-0.5 leading-snug", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-data-selected:border-primary/30 has-data-selected:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-accent has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 dark:has-data-selected:border-primary/20 dark:has-data-selected:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const HELP_OPEN_DELAY = 200;
const HELP_CLOSE_DELAY = 150;

/**
 * An ⓘ button that opens help about a field or a column in a popover: unlike
 * a tooltip, it opens with touch and keyboard and fits a couple of sentences.
 * Hovering opens it as a preview (it stays while the pointer is over the
 * button or the popover); pressing pins it open until Escape or a press
 * outside. `icon` swaps the ⓘ, e.g. an alert icon with `tone="destructive"`
 * for the reason behind a failed row. Place it BESIDE the `FieldLabel` or
 * column header, never inside, where it would nest one interactive element in
 * another.
 */
function FieldHelp({
  label,
  placement = "bottom start",
  icon,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "aria-label"> & {
  /** Names the subject, e.g. "More information: CIB". Also names the popover. */
  label: string;
  placement?: PopoverProps["placement"];
  /** The trigger's icon; ⓘ by default. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<"hover" | "pinned" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const schedule = (next: "hover" | null, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setOpen((current) => (current === "pinned" ? current : next)),
      delay,
    );
  };
  const keepHoverOpen = () => clearTimeout(timer.current);
  const closeHover = () => schedule(null, HELP_CLOSE_DELAY);
  return (
    <>
      <Button
        ref={triggerRef}
        data-slot="field-help"
        variant="ghost"
        size="icon-xs"
        aria-label={label}
        aria-expanded={open !== null}
        className={cn(props.tone === undefined && "text-muted-foreground", className)}
        onHoverStart={() => (open ? keepHoverOpen() : schedule("hover", HELP_OPEN_DELAY))}
        onHoverEnd={closeHover}
        onPress={() => {
          clearTimeout(timer.current);
          // a press pins a hover preview; a second press closes it
          setOpen((current) => (current === "pinned" ? null : "pinned"));
        }}
        {...props}
      >
        {icon ?? <InfoIcon />}
      </Button>
      <Popover
        triggerRef={triggerRef}
        isOpen={open !== null}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        // the hover preview doesn't trap focus nor block the page; pinned, it's a regular popover
        isNonModal={open === "hover"}
        placement={placement}
      >
        <Dialog
          aria-label={label}
          className="outline-none"
          onMouseEnter={open === "hover" ? keepHoverOpen : undefined}
          onMouseLeave={open === "hover" ? closeHover : undefined}
        >
          {children}
        </Dialog>
      </Popover>
    </>
  );
}

/**
 * The card surface of a choice card (`CheckboxCard`, `RadioCard`): the
 * react-aria control is the card itself, so its label isn't nested in a
 * `FieldLabel`. Same look as a `FieldLabel` wrapping a `Field`.
 */
const choiceCardClassName = cn(
  "group/choice-card relative flex w-full items-start gap-3 rounded-lg border p-3 text-sm transition-colors outline-none",
  "not-data-selected:not-data-disabled:data-hovered:bg-accent",
  "data-selected:border-primary/30 data-selected:bg-primary/5 dark:data-selected:border-primary/20 dark:data-selected:bg-primary/10",
  "data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50",
  "data-invalid:border-destructive data-disabled:cursor-not-allowed data-disabled:opacity-50",
);

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={error?.message ?? index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  choiceCardClassName,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldHelp,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
