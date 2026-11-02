import { cn } from "cn";
import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/core/badge/badge";
import { externalLinkProps } from "./nav-access";
import type { AppSidebarItemBadge, AppSidebarNavItem, AppSidebarNavSubItem } from "./types";

// A sidebar can be as strong as the primary color, so a badge can't use the page's tints: each tone
// is a pair that reads on any sidebar. `tests/app-sidebar-badge-contrast.test.ts` measures them.
export const TONE_BADGE = {
  neutral: "border-sidebar-border bg-sidebar text-sidebar-foreground",
  primary: "bg-sidebar-foreground text-sidebar",
  success: "border-success/30 bg-background text-success-foreground",
  info: "border-info/30 bg-background text-info-foreground",
  warning: "border-warning/30 bg-background text-warning-foreground",
} as const;

// A menu opens on the popover, so the sidebar's colors don't apply there. A focused item recolors
// its content, but a badge has its own surface: `!` and `**:text-inherit!` keep its text.
export const TONE_MENU_BADGE = {
  neutral: "border-border bg-popover text-popover-foreground!",
  primary: "border-primary bg-popover text-popover-foreground!",
  success: "border-success/30 bg-background text-success-foreground!",
  info: "border-info/30 bg-background text-info-foreground!",
  warning: "border-warning/30 bg-background text-warning-foreground!",
} as const;

// The ring keeps a dot visible on a sidebar close to its color.
export const TONE_DOT = {
  neutral: "bg-sidebar ring-1 ring-sidebar-foreground",
  primary: "bg-sidebar-foreground ring-1 ring-sidebar-foreground",
  success: "bg-success ring-1 ring-sidebar-foreground",
  info: "bg-info ring-1 ring-sidebar-foreground",
  warning: "bg-warning ring-1 ring-sidebar-foreground",
} as const;

type NavItemStatusProps = {
  item: AppSidebarNavItem | AppSidebarNavSubItem;
  /** Read after the title on an external link. */
  externalLabel: string;
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
  item,
  externalLabel,
  withDot = false,
  inMenu = false,
}: NavItemStatusProps) {
  const { badge } = item;
  const isExternal = externalLinkProps(item).target !== undefined;
  if (!badge && !isExternal) return null;

  const tone: NonNullable<AppSidebarItemBadge["tone"]> =
    badge?.tone ?? (item.access === "gated" ? "primary" : "neutral");
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
              inMenu ? [TONE_MENU_BADGE[tone], "**:text-inherit!"] : TONE_BADGE[tone],
              "[&_svg]:size-2.5!",
            )}
          >
            {badge.icon}
            {badge.label}
          </Badge>
        )}
        {isExternal && <ExternalLinkIcon className="size-4" />}
      </span>
      {badge && withDot && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 right-1 hidden size-1.5 rounded-full group-data-[collapsible=icon]:block",
            TONE_DOT[tone],
          )}
        />
      )}
    </>
  );
}
