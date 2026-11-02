"use client";

import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/core/sidebar/sidebar";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";
import { visibleNav } from "./nav-access";
import { NavSection } from "./nav-section";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import type { AppSidebarData, AppSidebarTeam, AppSidebarUserAction } from "./types";

type AppSidebarConfig = {
  labels: { opensInNewTab: string };
};

declare global {
  interface FmaNamespaces {
    appSidebar: AppSidebarConfig;
  }
}

export const appSidebarEn: DictionaryNamespace<AppSidebarConfig> = {
  labels: { opensInNewTab: "opens in new tab" },
};

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
 * switcher or logo, one section per `data.nav` entry and a user menu.
 * Render it inside a `SidebarProvider`.
 */
export function AppSidebar({
  data,
  onTeamChange,
  onAddTeam,
  onUserAction,
  i18n,
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
        {visibleNav(data.nav).map((section) => (
          <NavSection key={section.title} section={section} externalLabel={labels.opensInNewTab} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onAction={onUserAction} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export type * from "./types";
export type { AppSidebarProps };
