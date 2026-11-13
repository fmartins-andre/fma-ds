"use client";

import { cn } from "cn";
import type * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/core/breadcrumb/breadcrumb";
import { Skeleton } from "@/core/skeleton/skeleton";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";

type PageHeaderConfig = {
  labels: {
    breadcrumb: string;
  };
};

declare global {
  interface FmaNamespaces {
    pageHeader: PageHeaderConfig;
  }
}

export const pageHeaderEn: DictionaryNamespace<PageHeaderConfig> = {
  labels: {
    breadcrumb: "Breadcrumb",
  },
};

/**
 * The top of a page: breadcrumbs, title, description, actions and, for areas
 * with sub-pages, a `TabNav` in `PageHeaderNav`. The actions wrap below the
 * heading only when they don't fit beside it.
 *
 * `sticky` keeps it at the top while the page scrolls, on a translucent, blurred
 * surface that fades into the content instead of a border. It reads two variables
 * from the page around it: `--sticky-offset`, where it stops (below a top bar), and
 * `--page-gutter`, the page's padding, which it spans. Both default to 0 (an
 * `AppShell` sets them).
 */
function PageHeader({
  className,
  sticky = false,
  density = "default",
  ...props
}: React.ComponentProps<"header"> & {
  sticky?: boolean;
  /** `compact`: a smaller title and tighter spacing, for headers that stay on screen. */
  density?: "default" | "compact";
}) {
  return (
    <header
      data-slot="page-header"
      data-density={density}
      data-sticky={sticky || undefined}
      className={cn(
        "group/page-header flex min-w-0 flex-col gap-3 data-[density=compact]:gap-2",
        sticky && [
          // Below what's above it (a top bar), across the page's padding.
          "sticky top-(--sticky-offset,0px) z-10",
          "-mx-(--page-gutter,0px) -mt-(--page-gutter,0px) px-(--page-gutter,0px) py-3",
          // Translucent and blurred: the content scrolling under it shows faintly.
          "bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
          // A fade into the content in place of a bottom border.
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6",
          "after:bg-linear-to-b after:from-background/80 after:to-transparent",
        ],
        className,
      )}
      {...props}
    />
  );
}

type PageHeaderBreadcrumb = { label: React.ReactNode; href?: string };

/** The trail to this page; the last item is the current page and isn't a link. */
function PageHeaderBreadcrumbs({
  items,
  className,
  "aria-label": ariaLabel,
}: {
  items: PageHeaderBreadcrumb[];
  className?: string;
  "aria-label"?: string;
}) {
  const { labels } = useFmaMessages("pageHeader", pageHeaderEn);
  return (
    <Breadcrumb aria-label={ariaLabel ?? labels.breadcrumb} className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: a breadcrumb trail is positional
            <BreadcrumbItem key={index}>
              {isLast || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Holds the heading on one side and the actions on the other. */
function PageHeaderContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-content"
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-x-6 gap-y-3",
        className,
      )}
      {...props}
    />
  );
}

/** Title, description and anything that sits beside the title (e.g. a status select). */
function PageHeaderHeading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-heading"
      className={cn("flex min-w-0 flex-[1_1_16rem] flex-col gap-1", className)}
      {...props}
    />
  );
}

/** The page's `<h1>`. `isLoading` shows a skeleton while the name loads. */
function PageHeaderTitle({
  className,
  isLoading = false,
  children,
  ...props
}: React.ComponentProps<"h1"> & { isLoading?: boolean }) {
  return (
    <h1
      data-slot="page-header-title"
      aria-busy={isLoading || undefined}
      className={cn(
        "min-w-0 font-heading text-2xl leading-tight font-semibold tracking-tight group-data-[density=compact]/page-header:text-xl",
        className,
      )}
      {...props}
    >
      {isLoading ? <Skeleton className="h-8 w-48 max-w-full" /> : children}
    </h1>
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("max-w-prose text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Page actions; they wrap, and stretch to the full width on narrow screens. */
function PageHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2 max-sm:basis-full max-sm:*:[[data-slot=button]]:flex-1",
        className,
      )}
      {...props}
    />
  );
}

/** Navigation between the area's sub-pages, under the heading — usually a `TabNav`. */
function PageHeaderNav({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="page-header-nav" className={cn("min-w-0 pt-1", className)} {...props} />;
}

export type { PageHeaderBreadcrumb };
export {
  PageHeader,
  PageHeaderActions,
  PageHeaderBreadcrumbs,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderNav,
  PageHeaderTitle,
};
