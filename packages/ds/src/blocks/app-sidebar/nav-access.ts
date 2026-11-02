import type {
  AppSidebarItemAccess,
  AppSidebarItemBadge,
  AppSidebarNavItem,
  AppSidebarNavSection,
} from "./types";

export function isExpandable(item: AppSidebarNavItem) {
  return Boolean(item.items?.length) && (item.access ?? "granted") === "granted";
}

function visibleItem(item: AppSidebarNavItem): AppSidebarNavItem[] {
  if (item.access === "hidden") return [];
  if (!isExpandable(item)) return [item];
  const items = item.items?.filter((subItem) => subItem.access !== "hidden");
  return items?.length ? [{ ...item, items }] : [];
}

/** Drops hidden items, then the parents and sections they leave empty. */
export function visibleNav(nav: AppSidebarNavSection[]) {
  return nav
    .map((section) => ({ ...section, items: section.items.flatMap(visibleItem) }))
    .filter((section) => section.items.length > 0);
}

/** The title with the badge, for texts that stand for the whole item. */
export function itemLabel({ title, badge }: { title: string; badge?: AppSidebarItemBadge }) {
  return badge ? `${title}, ${badge.label}` : title;
}

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
