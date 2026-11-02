import type { AppSidebarItemAccess, AppSidebarItemBadge } from "./types";

/** The title with the badge, for texts that stand for the whole item. */
export function itemLabel({ title, badge }: { title: string; badge?: AppSidebarItemBadge }) {
  return badge ? `${title}, ${badge.label}` : title;
}

/** A blocked item goes nowhere, so it isn't a link at all. */
export function externalLinkProps({
  external,
  access,
}: {
  external?: boolean;
  access?: AppSidebarItemAccess["access"];
}) {
  return external && access !== "blocked"
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};
}
