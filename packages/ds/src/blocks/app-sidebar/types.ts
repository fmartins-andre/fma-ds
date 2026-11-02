import type * as React from "react";

/**
 * Contract of the `app-sidebar` block: teams and the user are data, and the
 * menus are composed from `AppSidebarSection`, `AppSidebarItem` and
 * `AppSidebarSubItem`.
 */

export type AppSidebarUser = {
  name: string;
  email: string;
  avatar: string;
};

export type AppSidebarTeam = {
  name: string;
  logo: React.ReactNode;
  plan: string;
};

/**
 * `full` shows while the sidebar is expanded (and on mobile); `collapsed`
 * while it's retracted to icons. Swapped with CSS only.
 */
export type AppSidebarLogo = {
  full: React.ReactNode;
  collapsed: React.ReactNode;
};

/** Either a team switcher or a static logo fills the header. */
export type AppSidebarBranding =
  | { teams: AppSidebarTeam[]; logo?: never }
  | { teams?: never; logo: AppSidebarLogo };

/** The text comes from the app, like `title`. */
export type AppSidebarItemBadge = {
  label: string;
  /** Colors the badge and, while collapsed to icons, the dot on the item. */
  tone?: "neutral" | "primary" | "success" | "info" | "warning";
  icon?: React.ReactNode;
};

/**
 * What the item does; `badge` says why. To hide an item, don't render it.
 * - `granted` (default): a normal link.
 * - `blocked`: visible and focusable, goes nowhere. Requires a badge with the reason.
 * - `gated`: a normal link to `href`, which the app points at the page that resolves it (activate,
 *   upgrade, pay). Informative only: the app must guard the route.
 */
export type AppSidebarItemAccess =
  | { access?: "granted"; badge?: AppSidebarItemBadge }
  | { access: "blocked" | "gated"; badge: AppSidebarItemBadge };

export type AppSidebarSectionProps = {
  title: string;
  children?: React.ReactNode;
};

/**
 * Links are react-aria `Link`s: wrap the app in react-aria's `RouterProvider`
 * to route them client-side. `external` opens one in a new tab instead.
 */
export type AppSidebarSubItemProps = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
} & AppSidebarItemAccess;

/**
 * `variant` picks how a `granted` item opens its `children`: `"collapse"` (default) expands them
 * inline, `"dropdown"` opens a menu beside the item. While the sidebar is collapsed to icons every
 * item uses the dropdown. Only that item, which doesn't navigate, can leave out `href`.
 */
export type AppSidebarItemProps = {
  title: string;
  icon?: React.ReactNode;
  /** Marks the current page and starts a collapse item expanded. */
  isActive?: boolean;
  external?: boolean;
  variant?: "collapse" | "dropdown";
} & AppSidebarItemAccess &
  (
    | { href: string; children?: React.ReactNode }
    | { href?: undefined; access?: "granted"; children: React.ReactNode }
  );

export type AppSidebarData = {
  user: AppSidebarUser;
} & AppSidebarBranding;

export type AppSidebarConfig = {
  labels: { opensInNewTab: string };
};

/** Ids of the entries in the user menu, passed to `onUserAction`. */
export type AppSidebarUserAction = "upgrade" | "account" | "billing" | "notifications" | "logout";
