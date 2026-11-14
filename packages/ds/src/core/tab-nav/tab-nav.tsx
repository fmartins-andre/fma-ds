"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { Link, type LinkProps } from "react-aria-components";
import { Button } from "@/core/button/button";
import { type ScrollSide, useScrollOverflow } from "@/hooks/use-scroll-overflow";

type TabNavVariant = "default" | "line" | "primary";

const TabNavContext = React.createContext<{ variant: TabNavVariant; currentHref?: string }>({
  variant: "default",
});

const tabNavListVariants = cva("inline-flex w-max items-center text-muted-foreground", {
  variants: {
    variant: {
      default: "h-8 rounded-lg bg-muted p-[3px]",
      line: "h-9 gap-1",
      primary: "h-8 gap-1 rounded-lg bg-primary px-1.5 py-[3px]",
    },
  },
  defaultVariants: { variant: "default" },
});

/**
 * Route navigation that looks like tabs: a `<nav>` of links where the current
 * page carries `aria-current="page"`. Unlike `Tabs`, there are no panels — each
 * item is a page. Overflowing items scroll sideways, keeping the current one
 * in view; an arrow on each side that hides items turns a page (pointer only, as
 * the keyboard reaches every item, and not on small screens, where the strip is
 * swiped). `listClassName="min-w-full"` spreads the items over the whole width
 * while they fit. Wrap the app in react-aria's `RouterProvider` for client routing.
 */
function TabNav({
  className,
  listClassName,
  variant = "default",
  currentHref,
  children,
  ...props
}: React.ComponentProps<"nav"> &
  VariantProps<typeof tabNavListVariants> & {
    /** The current path; an item whose `href` equals it is the current page. */
    currentHref?: string;
    listClassName?: string;
  }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const resolvedVariant = variant ?? "default";
  const value = React.useMemo(
    () => ({ variant: resolvedVariant, currentHref }),
    [resolvedVariant, currentHref],
  );

  const { canScrollStart, canScrollEnd, scrollToward, reveal } = useScrollOverflow(scrollRef);

  // Bring the current item into view inside the strip, without scrolling the
  // page; again whenever the strip resizes (e.g. once web fonts load).
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the current page changes
  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const revealCurrent = () => {
      const current = scroller.querySelector("[aria-current=page]");
      if (current) reveal(current);
    };
    revealCurrent();
    const observer = new ResizeObserver(revealCurrent);
    for (const element of [scroller, scroller.firstElementChild]) {
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [currentHref, reveal]);

  return (
    <TabNavContext.Provider value={value}>
      <nav
        data-slot="tab-nav"
        data-variant={resolvedVariant}
        className={cn("group/tab-nav relative min-w-0", className)}
        {...props}
      >
        <div
          ref={scrollRef}
          data-overflow-start={canScrollStart || undefined}
          data-overflow-end={canScrollEnd || undefined}
          className={cn("relative max-w-full", scrollerClassName)}
        >
          <ul
            data-slot="tab-nav-list"
            className={cn(tabNavListVariants({ variant: resolvedVariant }), listClassName)}
          >
            {children}
          </ul>
        </div>
        {canScrollStart && <ScrollArrow side="start" onPress={() => scrollToward("start")} />}
        {canScrollEnd && <ScrollArrow side="end" onPress={() => scrollToward("end")} />}
      </nav>
    </TabNavContext.Provider>
  );
}

/**
 * Scrolls sideways with no scrollbar; the side that hides items fades out (a mask, so
 * it works on any surface), clear under the arrow, and keeps
 * clear of it (`scroll-padding`).
 */
const scrollerClassName =
  "scroll-px-12 overflow-x-auto [scrollbar-width:none] [--fade-dir:right] [--fade-end:0px] [--fade-start:0px] [mask-image:linear-gradient(to_var(--fade-dir),transparent_calc(var(--fade-start)*0.6),#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent_calc(100%-var(--fade-end)*0.6))] data-overflow-end:[--fade-end:--spacing(12)] data-overflow-start:[--fade-start:--spacing(12)] rtl:[--fade-dir:left] [&::-webkit-scrollbar]:hidden";

/**
 * Turns a page toward its side. Hidden from assistive tech and the tab order: the
 * keyboard already reaches (and reveals) every item.
 */
function ScrollArrow({ side, onPress }: { side: ScrollSide; onPress: () => void }) {
  return (
    <div
      aria-hidden="true"
      data-slot="tab-nav-scroll-arrow"
      data-side={side}
      className={cn(
        "absolute inset-y-0 flex items-center max-sm:hidden",
        side === "start" ? "start-0" : "end-0",
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        excludeFromTabOrder
        preventFocusOnPress
        onPress={onPress}
        className="rtl:[&_svg]:rotate-180"
      >
        {side === "start" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    </div>
  );
}

/**
 * One page. It's current when `isCurrent` is set, or when its `href` matches
 * the `TabNav`'s `currentHref` (exactly, or as a prefix with `matchPrefix`).
 */
function TabNavItem({
  className,
  href,
  isCurrent,
  matchPrefix = false,
  ...props
}: Omit<LinkProps, "className"> & {
  className?: string;
  isCurrent?: boolean;
  /** Also current on sub-paths of `href`. */
  matchPrefix?: boolean;
}) {
  const { currentHref } = React.useContext(TabNavContext);
  const current =
    isCurrent ??
    (!!href &&
      !!currentHref &&
      (currentHref === href || (matchPrefix && currentHref.startsWith(`${href}/`))));

  return (
    // flex-1: with a `min-w-full` list, the items share the width; otherwise a no-op
    <li data-slot="tab-nav-item" className="flex h-full flex-1">
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        className={cn(
          "relative inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          // default: the current page is a raised segment
          "group-data-[variant=default]/tab-nav:aria-[current=page]:bg-background group-data-[variant=default]/tab-nav:aria-[current=page]:shadow-sm dark:group-data-[variant=default]/tab-nav:aria-[current=page]:border-input dark:group-data-[variant=default]/tab-nav:aria-[current=page]:bg-input",
          // line: the current page is underlined; the focus ring is drawn inside, as the
          // list has no padding for it and the scroller would clip it
          "group-data-[variant=line]/tab-nav:focus-visible:ring-inset",
          "after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity group-data-[variant=line]/tab-nav:aria-[current=page]:after:opacity-100",
          "aria-[current=page]:text-foreground",
          // primary: on the primary color, the current page is a raised segment in the primary text
          "group-data-[variant=primary]/tab-nav:px-4 group-data-[variant=primary]/tab-nav:text-primary-foreground/80 group-data-[variant=primary]/tab-nav:hover:text-primary-foreground group-data-[variant=primary]/tab-nav:aria-[current=page]:bg-background group-data-[variant=primary]/tab-nav:aria-[current=page]:text-primary group-data-[variant=primary]/tab-nav:aria-[current=page]:shadow-sm group-data-[variant=primary]/tab-nav:aria-[current=page]:hover:text-primary dark:group-data-[variant=primary]/tab-nav:text-primary-foreground/80 dark:group-data-[variant=primary]/tab-nav:hover:text-primary-foreground dark:group-data-[variant=primary]/tab-nav:aria-[current=page]:text-primary",
          className,
        )}
        {...props}
      />
    </li>
  );
}

/** A divider between groups of items. */
function TabNavSeparator({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      data-slot="tab-nav-separator"
      className={cn("mx-1 h-4 w-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}

export { TabNav, TabNavItem, TabNavSeparator, tabNavListVariants };
