"use client";

import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/core/sidebar/sidebar";
import { useFmaMessages } from "@/lib/i18n/i18n";
import { appSidebarEn, ExternalLabelContext } from "./nav-items";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import type {
  AppSidebarConfig,
  AppSidebarData,
  AppSidebarTeam,
  AppSidebarUserAction,
} from "./types";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: AppSidebarData;
  onTeamChange?: (team: AppSidebarTeam) => void;
  /** Shows an "Add team" entry in the team switcher. */
  onAddTeam?: () => void;
  onUserAction?: (action: AppSidebarUserAction) => void;
  i18n?: Partial<AppSidebarConfig>;
};

/**
 * App-shell sidebar (shadcn "sidebar-07"): collapsible to icons, with a team
 * switcher or logo, the menus composed in `children` and a user menu. Render it
 * inside a `SidebarProvider`.
 */
export function AppSidebar({
  data,
  onTeamChange,
  onAddTeam,
  onUserAction,
  i18n,
  children,
  ...props
}: AppSidebarProps) {
  const { labels } = useFmaMessages("appSidebar", appSidebarEn, i18n);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={data.teams}
          logo={data.logo}
          onTeamChange={onTeamChange}
          onAddTeam={onAddTeam}
        />
      </SidebarHeader>
      <SidebarContent>
        <ExternalLabelContext.Provider value={labels.opensInNewTab}>
          {children}
        </ExternalLabelContext.Provider>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onAction={onUserAction} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebarItem, AppSidebarSection, AppSidebarSubItem, appSidebarEn } from "./nav-items";
export type * from "./types";
export type { AppSidebarProps };
