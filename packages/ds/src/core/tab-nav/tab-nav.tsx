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

const tabNavListVariants = cva("inline-flex w-max items-center gap-1 text-muted-foreground", {
  variants: {
    variant: {
      default: "h-8 rounded-lg bg-muted px-1 py-[3px]",
      // no padding: the underline sits on the strip's bottom edge (a card header's border)
      line: "h-9",
      primary: "h-8 rounded-lg bg-primary px-1 py-[3px]",
    },
  },
  defaultVariants: { variant: "default" },
});

/**
 * The current page: a segment behind its item (`default`, `primary`) or an underline
 * (`line`). One element for the whole nav, placed from the current item's layout box
 * (`--x`, `--y`, `--w`, `--h`), so it slides straight from item to item; `motion-reduce`
 * turns that off. Style it from `TabNav`'s `className`
 * (`[&_[data-slot=tab-nav-indicator]]:bg-primary`).
 */
const tabNavIndicatorVariants = cva(
  "pointer-events-none absolute top-0 left-0 z-0 transition-[translate,width,height] duration-200 ease-in-out motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default:
          "h-(--h) w-(--w) rounded-md bg-background shadow-sm [translate:var(--x)_var(--y)] dark:border dark:border-input dark:bg-input",
        primary: "h-(--h) w-(--w) rounded-md bg-background shadow-sm [translate:var(--x)_var(--y)]",
        // at the item's bottom, inset as the label
        line: "h-0.5 w-[calc(var(--w)-0.5rem)] rounded-full bg-foreground [translate:calc(var(--x)+0.25rem)_calc(var(--y)+var(--h)-2px)]",
      },
    },
  },
);

type ItemBox = { x: number; y: number; w: number; h: number };

const sameBox = (a: ItemBox, b: ItemBox) =>
  a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

/** Identifies a nav by its items, to hand the indicator over to its next instance. */
const itemsKey = (scroller: HTMLElement) =>
  Array.from(scroller.querySelectorAll("a[href]"), (link) => link.getAttribute("href")).join(" ");

/** How long a nav's indicator position waits for the next instance of the nav, in ms. */
const HANDOFF_MS = 1000;

/** The indicator of the last nav that unmounted (a route change), for the next instance. */
let departed: { items: string; box: ItemBox; at: number } | null = null;

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

  // Where the indicator goes: the current item's box inside the scroller (its offset
  // parent), which page scroll, surrounding layout shifts and ancestor transforms don't
  // change. Measured before paint, and again when the current item changes (by
  // `currentHref` or `isCurrent`), items come and go, or the strip resizes.
  const [currentBox, setCurrentBox] = React.useState<ItemBox | null>(null);
  React.useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    let last: { items: string; box: ItemBox } | null = null;
    let frame: number | null = null;
    const resizes = new ResizeObserver(() => measure());
    const measure = () => {
      if (frame !== null) return; // holding the previous nav's position for a frame
      const item = scroller.querySelector<HTMLElement>("[aria-current=page]");
      const box = item && {
        x: item.offsetLeft,
        y: item.offsetTop,
        w: item.offsetWidth,
        h: item.offsetHeight,
      };
      last = box && { items: itemsKey(scroller), box };
      setCurrentBox((prev) => (box && prev && sameBox(box, prev) ? prev : box));
      resizes.disconnect();
      resizes.observe(scroller);
      for (const element of scroller.querySelectorAll("ul, a")) resizes.observe(element);
    };

    // A route that renders its own nav mounts a new one: when it has the same items as the
    // nav just unmounted, its indicator starts where that one was and slides from there.
    const previous = departed;
    departed = null;
    if (
      previous &&
      performance.now() - previous.at < HANDOFF_MS &&
      previous.items === itemsKey(scroller)
    ) {
      setCurrentBox(previous.box);
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    } else {
      measure();
    }

    const mutations = new MutationObserver(measure);
    mutations.observe(scroller, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-current"],
    });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resizes.disconnect();
      mutations.disconnect();
      if (last) departed = { ...last, at: performance.now() };
    };
  }, []);

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
          {currentBox && (
            <span
              aria-hidden="true"
              data-slot="tab-nav-indicator"
              className={tabNavIndicatorVariants({ variant: resolvedVariant })}
              style={
                {
                  "--x": `${currentBox.x}px`,
                  "--y": `${currentBox.y}px`,
                  "--w": `${currentBox.w}px`,
                  "--h": `${currentBox.h}px`,
                } as React.CSSProperties
              }
            />
          )}
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
          "relative z-10 inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-[color,border-color,box-shadow] duration-200 ease-in-out outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          // the current page's segment or underline is the nav's indicator, behind (`z-10`)
          // line: the focus ring is drawn inside, as the list has no padding for it and the
          // scroller would clip it
          "group-data-[variant=line]/tab-nav:focus-visible:ring-inset",
          "aria-[current=page]:text-foreground",
          // primary: on the primary color, the current page is a raised segment in the primary text
          "group-data-[variant=primary]/tab-nav:px-4 group-data-[variant=primary]/tab-nav:text-primary-foreground/80 group-data-[variant=primary]/tab-nav:hover:text-primary-foreground group-data-[variant=primary]/tab-nav:aria-[current=page]:text-primary group-data-[variant=primary]/tab-nav:aria-[current=page]:hover:text-primary dark:group-data-[variant=primary]/tab-nav:text-primary-foreground/80 dark:group-data-[variant=primary]/tab-nav:hover:text-primary-foreground dark:group-data-[variant=primary]/tab-nav:aria-[current=page]:text-primary",
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
