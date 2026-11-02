import { cn } from "cn";
import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/core/badge/badge";
import { externalLinkProps } from "./nav-access";
import type { AppSidebarItemAccess, AppSidebarItemBadge } from "./types";

// A sidebar can be as strong as the primary color, so a badge can't use the page's tints: each
// variant reads on any sidebar. `tests/app-sidebar-badge-contrast.test.ts` measures them. `ghost`
// has no surface of its own, so it follows the item, which also turns it on hover.
export const VARIANT_BADGE = {
  ghost: "border-transparent px-0",
  outline: "border-sidebar-foreground bg-sidebar text-sidebar-foreground",
  primary: "bg-sidebar-primary text-sidebar-primary-foreground",
  invert: "bg-sidebar-foreground text-sidebar",
} as const;

// A menu opens on the popover, so the sidebar's colors don't apply there. A focused item recolors
// its content, but a badge with a surface keeps its text: that's `!` and `**:text-inherit!`.
export const VARIANT_MENU_BADGE = {
  ghost: "border-transparent px-0 text-popover-foreground",
  outline: "border-popover-foreground bg-popover text-popover-foreground!",
  primary: "bg-sidebar-primary text-sidebar-primary-foreground!",
  invert: "bg-popover-foreground text-popover!",
} as const;

// The ring keeps a dot visible on any sidebar.
export const VARIANT_DOT = {
  ghost: "bg-sidebar ring-1 ring-sidebar-foreground",
  outline: "bg-sidebar ring-1 ring-sidebar-foreground",
  primary: "bg-sidebar-primary ring-1 ring-sidebar-foreground",
  invert: "bg-sidebar-foreground ring-1 ring-sidebar-foreground",
} as const;

const DEFAULT_VARIANT = { granted: "outline", blocked: "ghost", gated: "invert" } as const;

type NavItemStatusProps = {
  access?: AppSidebarItemAccess["access"];
  badge?: AppSidebarItemBadge;
  external?: boolean;
  /** Read after the title on an external link. */
  externalLabel?: string;
  /** Marks the item with a dot while the sidebar is collapsed to icons. */
  withDot?: boolean;
  /** Rendered in a menu, on the popover instead of the sidebar. */
  inMenu?: boolean;
};

/**
 * What the item says after its title. The screen reader text is one element in every layout: the
 * badge leaves the page when the sidebar collapses, and it would take the reason with it.
 */
export function NavItemStatus({
  access,
  badge,
  external,
  externalLabel,
  withDot = false,
  inMenu = false,
}: NavItemStatusProps) {
  const isExternal = externalLinkProps({ external, access }).target !== undefined;
  if (!badge && !isExternal) return null;

  const variant = badge?.variant ?? DEFAULT_VARIANT[access ?? "granted"];
  return (
    <>
      {badge && <span className="sr-only">{` ${badge.label}`}</span>}
      {isExternal && <span className="sr-only">{` ${externalLabel}`}</span>}
      <span
        aria-hidden="true"
        className="ml-auto flex shrink-0 items-center gap-2 group-data-[collapsible=icon]:hidden"
      >
        {badge && (
          <Badge
            variant={null}
            size="xs"
            className={cn(
              inMenu ? [VARIANT_MENU_BADGE[variant], "**:text-inherit!"] : VARIANT_BADGE[variant],
              // A blocked item dims its title, but the reason has to stay legible.
              !inMenu && variant === "ghost" && access === "blocked" && "text-sidebar-foreground",
              "[&_svg]:size-2.5!",
            )}
          >
            {badge.icon}
            {badge.label}
          </Badge>
        )}
        {isExternal && (
          <ExternalLinkIcon className="size-2.5! opacity-60 transition-opacity in-[a:focus]:opacity-100 in-[a:hover]:opacity-100" />
        )}
      </span>
      {badge && withDot && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 right-1 hidden size-1.5 rounded-full group-data-[collapsible=icon]:block",
            VARIANT_DOT[variant],
          )}
        />
      )}
    </>
  );
}
