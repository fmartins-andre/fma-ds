"use client";

import type * as React from "react";
import { Sidebar, SidebarRail } from "@/core/sidebar/sidebar";
import { type NamespaceOverrides, useFmaMessages } from "@/lib/i18n/i18n";
import { AppSidebarLabelsContext, appSidebarEn } from "./app-sidebar-labels";
import type { AppSidebarConfig } from "./types";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  i18n?: NamespaceOverrides<AppSidebarConfig>;
};

/**
 * App-shell sidebar (shadcn "sidebar-07"), collapsible to icons. Compose it from the core's
 * `SidebarHeader`, `SidebarContent` and `SidebarFooter`, with the parts below. Render it inside a
 * `SidebarProvider`.
 */
export function AppSidebar({ i18n, children, ...props }: AppSidebarProps) {
  const { labels } = useFmaMessages("appSidebar", appSidebarEn, i18n);
  return (
    <Sidebar collapsible="icon" {...props}>
      <AppSidebarLabelsContext.Provider value={labels}>{children}</AppSidebarLabelsContext.Provider>
      <SidebarRail />
    </Sidebar>
  );
}

export { appSidebarEn } from "./app-sidebar-labels";
export { AppSidebarItem, AppSidebarSection, AppSidebarSubItem } from "./nav-items";
export { AppSidebarUser } from "./nav-user";
export { AppSidebarLogo, AppSidebarTeam, AppSidebarTeamSwitcher } from "./team-switcher";
export type * from "./types";
export type { AppSidebarProps };
