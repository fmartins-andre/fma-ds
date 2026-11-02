import type * as React from "react";

/**
 * Data contract for the `app-sidebar` block: adding or removing a team,
 * section, item or sub-item is a change to this data, not to the block.
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
 * What the item does; `badge` says why.
 * - `granted` (default): a normal link.
 * - `hidden`: not rendered.
 * - `blocked`: visible and focusable, goes nowhere. Requires a badge with the reason.
 * - `gated`: a normal link to `url`, which the app points at the page that resolves it (activate,
 *   upgrade, pay). Informative only: the app must guard the route.
 */
export type AppSidebarItemAccess =
  | { access?: "granted"; badge?: AppSidebarItemBadge }
  | { access: "hidden"; badge?: never }
  | { access: "blocked" | "gated"; badge: AppSidebarItemBadge };

/**
 * Links are react-aria `Link`s: wrap the app in react-aria's `RouterProvider`
 * to route them client-side. `external` opens one in a new tab instead.
 */
export type AppSidebarNavSubItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  external?: boolean;
} & AppSidebarItemAccess;

/**
 * `variant` picks how an item with sub-items opens: `"collapse"` (default)
 * expands them inline, `"dropdown"` opens a menu beside the item. While the
 * sidebar is collapsed to icons every item uses the dropdown.
 */
export type AppSidebarNavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  /** Marks the current page and starts a collapse item expanded. */
  isActive?: boolean;
  external?: boolean;
  variant?: "collapse" | "dropdown";
  /** Only a `granted` item opens them; any other access renders it as a plain item. */
  items?: AppSidebarNavSubItem[];
} & AppSidebarItemAccess;

/** A sidebar section, rendered as a `SidebarGroup`. */
export type AppSidebarNavSection = {
  title: string;
  items: AppSidebarNavItem[];
};

export type AppSidebarData = {
  user: AppSidebarUser;
  nav: AppSidebarNavSection[];
} & AppSidebarBranding;

/** Ids of the entries in the user menu, passed to `onUserAction`. */
export type AppSidebarUserAction = "upgrade" | "account" | "billing" | "notifications" | "logout";
