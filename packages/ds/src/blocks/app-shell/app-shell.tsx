"use client";

import { cn } from "cn";
import * as React from "react";
import type { AppSidebar } from "@/blocks/app-sidebar/app-sidebar";
import { type PageHeaderBreadcrumb, PageHeaderBreadcrumbs } from "@/blocks/page-header/page-header";
import { Separator } from "@/core/separator/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/core/sidebar/sidebar";

type AppShellContextValue = {
  breadcrumbs: PageHeaderBreadcrumb[];
  setBreadcrumbs: (items: PageHeaderBreadcrumb[]) => void;
};

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * The frame of an app's pages: the `AppSidebar`, a top bar (`AppShellHeader`) and
 * the page (`AppShellMain`, with a sticky `PageHeader` and `AppShellContent`).
 *
 * It sets the measures the parts share, as CSS variables: `--app-shell-header-h` (the
 * top bar) and `--app-shell-gutter` (the page's padding), handed to a sticky
 * `PageHeader` as `--sticky-offset` and `--page-gutter`. `AppShellMain` adds
 * `--sticky-top`, where other sticky parts stop (an `OrderSummary` stays under both bars).
 */
function AppShell({
  sidebar,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SidebarProvider>, "children"> & {
  /** An `AppSidebar`. */
  sidebar: React.ReactElement<React.ComponentProps<typeof AppSidebar>>;
  /** The top bar and the page: `AppShellHeader` and `AppShellMain`. */
  children?: React.ReactNode;
}) {
  const [breadcrumbs, setBreadcrumbs] = React.useState<PageHeaderBreadcrumb[]>([]);
  const value = React.useMemo(() => ({ breadcrumbs, setBreadcrumbs }), [breadcrumbs]);

  return (
    <AppShellContext.Provider value={value}>
      <SidebarProvider className={className} {...props}>
        {sidebar}
        <SidebarInset
          data-app-shell=""
          className={cn(
            "[--app-shell-gutter:--spacing(4)] [--app-shell-header-h:--spacing(12)] md:[--app-shell-gutter:--spacing(8)]",
            "[--page-gutter:var(--app-shell-gutter)] [--sticky-offset:var(--app-shell-header-h)]",
          )}
        >
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AppShellContext.Provider>
  );
}

/**
 * Sets the trail the top bar shows after the sidebar trigger. Call it from each page,
 * from the app's home down to the page itself; the last item is the current page.
 */
function useAppShellBreadcrumbs(items: PageHeaderBreadcrumb[]) {
  const context = React.useContext(AppShellContext);
  const setBreadcrumbs = context?.setBreadcrumbs;
  // The trail is compared by its text and links, so a new array each render doesn't loop.
  const key = items
    .map((item) => `${typeof item.label === "string" ? item.label : ""}\u0000${item.href ?? ""}`)
    .join("\u0001");
  const latest = React.useRef(items);
  latest.current = items;

  // Runs when the trail's text or links change (`key`), not on every new array.
  useIsomorphicLayoutEffect(() => {
    if (!setBreadcrumbs) return;
    setBreadcrumbs(latest.current);
    return () => setBreadcrumbs([]);
  }, [key, setBreadcrumbs]);
}

/**
 * The top bar: the sidebar trigger, the trail the page set with `useAppShellBreadcrumbs`
 * (hidden on narrow screens) and, at the end, its `children` — glances, notifications.
 * It sticks to the top while the page scrolls.
 */
function AppShellHeader({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"header">) {
  const breadcrumbs = React.useContext(AppShellContext)?.breadcrumbs ?? [];

  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "sticky top-0 z-20 flex h-(--app-shell-header-h) shrink-0 items-center gap-2 border-b bg-background px-4",
        className,
      )}
      {...props}
    >
      <SidebarTrigger className="-ms-1" />
      {breadcrumbs.length > 0 && (
        <>
          <Separator orientation="vertical" className="me-2 h-4 self-center max-sm:hidden" />
          <PageHeaderBreadcrumbs
            items={breadcrumbs}
            aria-label={ariaLabel}
            className="min-w-0 max-sm:hidden"
          />
        </>
      )}
      {children && (
        <div data-slot="app-shell-header-actions" className="ms-auto flex items-center gap-2">
          {children}
        </div>
      )}
    </header>
  );
}

/**
 * The page: a sticky `PageHeader`, then `AppShellContent`, inside the shell's gutter.
 * The shell is already the page's `<main>` landmark, so this is a plain container.
 *
 * It measures its sticky `PageHeader` (`--page-header-h`) and sets `--sticky-top` below
 * both bars, for other sticky parts.
 */
function AppShellMain({ className, ref, ...props }: React.ComponentProps<"div">) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const setRef = (node: HTMLDivElement | null) => {
    setElement(node);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  React.useEffect(() => {
    if (!element) return;
    let header: HTMLElement | null = null;
    const resize = new ResizeObserver(() => {
      if (header) element.style.setProperty("--page-header-h", `${header.offsetHeight}px`);
    });
    // The page's header can change (a route, `sticky` toggled): track the current one.
    const track = () => {
      const next = element.querySelector<HTMLElement>(
        ":scope > [data-slot=page-header][data-sticky]",
      );
      if (next === header) return;
      if (header) resize.unobserve(header);
      header = next;
      if (header) resize.observe(header);
      else element.style.removeProperty("--page-header-h");
    };
    track();
    const mutations = new MutationObserver(track);
    mutations.observe(element, {
      childList: true,
      subtree: true,
      attributeFilter: ["data-sticky"],
    });
    return () => {
      mutations.disconnect();
      resize.disconnect();
      element.style.removeProperty("--page-header-h");
    };
  }, [element]);

  return (
    <div
      ref={setRef}
      data-slot="app-shell-main"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-4 p-(--app-shell-gutter)",
        "[--sticky-top:calc(var(--app-shell-header-h)+var(--page-header-h,0px)+--spacing(4))]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The page's content, below its header: a column with the same spacing between its
 * children. Each child sits on a surface — a `Card`, `PanelCard` or a settings form —
 * except the ones that are already surfaces themselves: a `StatGrid`
 * and a `NotificationList`.
 */
function AppShellContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-content"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    />
  );
}

export { AppShell, AppShellContent, AppShellHeader, AppShellMain, useAppShellBreadcrumbs };
