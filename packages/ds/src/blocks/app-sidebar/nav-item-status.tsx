import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/core/badge/badge";
import { externalLinkProps } from "./nav-access";
import type { AppSidebarItemBadge, AppSidebarNavItem, AppSidebarNavSubItem } from "./types";

const TONE_VARIANT = {
  neutral: "muted",
  primary: "primary-light",
  success: "success-light",
  info: "info-light",
  warning: "warning-light",
} as const;

const TONE_DOT = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
} as const;

type NavItemStatusProps = {
  item: AppSidebarNavItem | AppSidebarNavSubItem;
  /** Read after the title on an external link. */
  externalLabel: string;
  /** Marks the item with a dot while the sidebar is collapsed to icons. */
  withDot?: boolean;
};

/**
 * What the item says after its title. The screen reader text is one element in every layout: the
 * badge leaves the page when the sidebar collapses, and it would take the reason with it.
 */
export function NavItemStatus({ item, externalLabel, withDot = false }: NavItemStatusProps) {
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
          <Badge variant={TONE_VARIANT[tone]} size="xs" className="[&_svg]:size-2.5!">
            {badge.icon}
            {badge.label}
          </Badge>
        )}
        {isExternal && <ExternalLinkIcon />}
      </span>
      {badge && withDot && (
        <span
          aria-hidden="true"
          className={`absolute top-1 right-1 hidden size-1.5 rounded-full group-data-[collapsible=icon]:block ${TONE_DOT[tone]}`}
        />
      )}
    </>
  );
}
