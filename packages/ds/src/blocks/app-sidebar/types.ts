import type * as React from "react";

/**
 * Contract of the `app-sidebar` block: it's composed, so these are the props of
 * its parts. What's atomic stays a prop; what the app lists goes in `children`.
 */

export type AppSidebarTeamSummary = {
  name: string;
  logo: React.ReactNode;
  plan: string;
};

export type AppSidebarTeamSwitcherProps = {
  activeTeam: AppSidebarTeamSummary;
  children?: React.ReactNode;
};

export type AppSidebarTeamProps = {
  name: string;
  logo: React.ReactNode;
  /** Unused here, so a team's whole object can be spread on it. */
  plan?: string;
  onAction?: () => void;
};

/**
 * `full` shows while the sidebar is expanded (and on mobile); `collapsed`
 * while it's retracted to icons. Swapped with CSS only.
 */
export type AppSidebarLogoProps = {
  full: React.ReactNode;
  collapsed: React.ReactNode;
};

export type AppSidebarUserProps = {
  name: string;
  email: string;
  avatar?: string;
  children?: React.ReactNode;
};

/** The text comes from the app, like `title`. */
export type AppSidebarItemBadge = {
  label: string;
  /**
   * `text` has no surface and follows the item's color, `outlined` has a border and `contained`
   * inverts the sidebar. Defaults to `contained` on `gated`, `text` on `blocked`, or `outlined`.
   */
  variant?: "text" | "outlined" | "contained";
  icon?: React.ReactNode;
};

/**
 * An item goes somewhere or runs something. A `href` is a link: an app route, or any URL, which
 * `external` opens in a new tab. An `onPress` makes it a button.
 */
type AppSidebarItemTarget =
  | { href: string; external?: boolean; onPress?: never }
  | { onPress: () => void; href?: never; external?: never };

/**
 * What the item does; `badge` says why. To hide an item, don't render it.
 * - `granted` (default): follows its target.
 * - `blocked`: visible and focusable, goes nowhere. Requires a badge with the reason, and accepts a
 *   target it won't use, so `access` can change alone.
 * - `gated`: follows its target, which the app points at what resolves it (activate, upgrade, pay).
 *   Informative only: the app must guard the route.
 */
export type AppSidebarItemAccess =
  | ({ access?: "granted"; badge?: AppSidebarItemBadge } & AppSidebarItemTarget)
  | ({ access: "gated"; badge: AppSidebarItemBadge } & AppSidebarItemTarget)
  | {
      access: "blocked";
      badge: AppSidebarItemBadge;
      href?: string;
      external?: boolean;
      onPress?: () => void;
    };

export type AppSidebarSectionProps = {
  title: string;
  children?: React.ReactNode;
};

/**
 * Links are react-aria `Link`s: wrap the app in react-aria's `RouterProvider`
 * to route them client-side.
 */
export type AppSidebarSubItemProps = {
  title: string;
  icon?: React.ReactNode;
} & AppSidebarItemAccess;

/**
 * `variant` picks how a `granted` item opens its `children`: `"collapse"` (default) expands them
 * inline, `"dropdown"` opens a menu beside the item. While the sidebar is collapsed to icons every
 * item uses the dropdown. That item only opens them, so it needs no target and ignores one.
 */
export type AppSidebarItemProps = {
  title: string;
  icon?: React.ReactNode;
  /** Marks the current page and starts a collapse item expanded. */
  isActive?: boolean;
  variant?: "collapse" | "dropdown";
} & (
  | (AppSidebarItemAccess & { children?: React.ReactNode })
  | {
      access?: "granted";
      badge?: AppSidebarItemBadge;
      href?: undefined;
      external?: undefined;
      onPress?: undefined;
      children: React.ReactNode;
    }
  | {
      access: "granted" | "blocked";
      badge: AppSidebarItemBadge;
      href?: undefined;
      external?: undefined;
      onPress?: undefined;
      children: React.ReactNode;
    }
);

export type AppSidebarConfig = {
  labels: { opensInNewTab: string; team: string; teams: string; account: string };
};
