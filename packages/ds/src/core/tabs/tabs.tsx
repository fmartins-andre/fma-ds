"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import {
  TabList as TabListPrimitive,
  TabListStateContext,
  TabPanel as TabPanelPrimitive,
  Tab as TabPrimitive,
  Tabs as TabsPrimitive,
} from "react-aria-components";
import { Button } from "@/core/button/button";
import { type ScrollSide, useScrollOverflow } from "@/hooks/use-scroll-overflow";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive>) {
  return (
    <TabsPrimitive
      data-slot="tabs"
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
        primary: "gap-1 bg-primary px-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Horizontal tabs that don't fit scroll sideways, keeping the selected one in view; an
 * arrow on each side that hides tabs turns a page (pointer only, as the keyboard reaches
 * every tab, and not on small screens, where the strip is swiped). `min-w-full` spreads
 * the tabs over the whole width while they fit.
 */
function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabListPrimitive> & VariantProps<typeof tabsListVariants>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { canScrollStart, canScrollEnd, scrollToward, reveal } = useScrollOverflow(scrollRef);
  const selectedKey = React.useContext(TabListStateContext)?.selectedKey;

  // Bring the selected tab into view inside the strip, without scrolling the page;
  // again whenever the strip resizes (e.g. once web fonts load).
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the selection changes
  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const revealSelected = () => {
      const selected = scroller.querySelector("[role=tab][data-selected]");
      if (selected) reveal(selected);
    };
    revealSelected();
    const observer = new ResizeObserver(revealSelected);
    for (const element of [scroller, scroller.firstElementChild]) {
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [selectedKey, reveal]);

  return (
    <div data-slot="tabs-list-container" className="relative flex max-w-full min-w-0">
      <div
        ref={scrollRef}
        data-overflow-start={canScrollStart || undefined}
        data-overflow-end={canScrollEnd || undefined}
        className={cn(
          "flex min-w-0 flex-1",
          // the vertical padding (pulled back by the margin) leaves room for what the
          // scroller would clip: focus rings and the line variant's underline
          "group-data-horizontal/tabs:-my-1 group-data-horizontal/tabs:overflow-x-auto group-data-horizontal/tabs:py-1",
          // no scrollbar; the side that hides tabs fades out (a mask, so it works on any
          // surface), clear under the arrow, and keeps clear of it (`scroll-padding`)
          "scroll-px-12 [scrollbar-width:none] [--fade-dir:right] [--fade-end:0px] [--fade-start:0px] [mask-image:linear-gradient(to_var(--fade-dir),transparent_calc(var(--fade-start)*0.6),#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent_calc(100%-var(--fade-end)*0.6))] data-overflow-end:[--fade-end:--spacing(12)] data-overflow-start:[--fade-start:--spacing(12)] rtl:[--fade-dir:left] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <TabListPrimitive
          data-slot="tabs-list"
          data-variant={variant}
          className={cn(tabsListVariants({ variant }), className)}
          {...props}
        />
      </div>
      {canScrollStart && <ScrollArrow side="start" onPress={() => scrollToward("start")} />}
      {canScrollEnd && <ScrollArrow side="end" onPress={() => scrollToward("end")} />}
    </div>
  );
}

/**
 * Turns a page toward its side. Hidden from assistive tech and the tab order: the
 * keyboard already reaches (and reveals) every tab.
 */
function ScrollArrow({ side, onPress }: { side: ScrollSide; onPress: () => void }) {
  return (
    <div
      aria-hidden="true"
      data-slot="tabs-scroll-arrow"
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

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabPrimitive>) {
  return (
    <TabPrimitive
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 cursor-default items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-selected:shadow-sm group-data-[variant=line]/tabs-list:data-selected:shadow-none group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-selected:bg-transparent dark:group-data-[variant=line]/tabs-list:data-selected:border-transparent dark:group-data-[variant=line]/tabs-list:data-selected:bg-transparent",
        "data-selected:bg-background data-selected:text-foreground dark:data-selected:border-input dark:data-selected:bg-input dark:data-selected:text-foreground",
        // primary: on the primary color, the selected tab is a raised segment in the primary text
        "group-data-[variant=primary]/tabs-list:px-4 group-data-[variant=primary]/tabs-list:text-primary-foreground/80 group-data-[variant=primary]/tabs-list:hover:text-primary-foreground group-data-[variant=primary]/tabs-list:data-selected:text-primary group-data-[variant=primary]/tabs-list:data-selected:hover:text-primary dark:group-data-[variant=primary]/tabs-list:text-primary-foreground/80 dark:group-data-[variant=primary]/tabs-list:hover:text-primary-foreground dark:group-data-[variant=primary]/tabs-list:data-selected:border-transparent dark:group-data-[variant=primary]/tabs-list:data-selected:bg-background dark:group-data-[variant=primary]/tabs-list:data-selected:text-primary group-data-[variant=primary]/tabs-list:data-selected:shadow-sm",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-selected:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabPanelPrimitive>) {
  return (
    <TabPanelPrimitive
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
