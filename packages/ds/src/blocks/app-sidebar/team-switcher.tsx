"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/core/dropdown-menu/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/core/sidebar/sidebar";
import { AppSidebarLabelsContext } from "./app-sidebar-labels";
import type {
  AppSidebarLogoProps,
  AppSidebarTeamProps,
  AppSidebarTeamSwitcherProps,
} from "./types";

/** The header's static alternative to a team switcher. */
export function AppSidebarLogo({ full, collapsed }: AppSidebarLogoProps) {
  // Same footprint as the switcher button, so collapsing behaves alike.
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          data-slot="app-sidebar-logo"
          className="flex h-12 w-full items-center justify-center overflow-hidden rounded-md group-data-[collapsible=icon]:size-8!"
        >
          <div className="flex size-full items-center justify-center group-data-[collapsible=icon]:hidden">
            {full}
          </div>
          <div className="hidden size-full items-center justify-center group-data-[collapsible=icon]:flex">
            {collapsed}
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** The app holds `activeTeam`: pass the entries as `children`, its own ones included. */
export function AppSidebarTeamSwitcher({ activeTeam, children }: AppSidebarTeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const labels = React.useContext(AppSidebarLabelsContext);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton
            size="lg"
            aria-label={`${labels.team}: ${activeTeam.name}`}
            className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
            <ChevronsUpDownIcon aria-hidden="true" className="ml-auto" />
          </SidebarMenuButton>
          <DropdownMenu
            placement={isMobile ? "bottom start" : "end top"}
            className="w-fit min-w-56"
          >
            <DropdownMenuLabel>{labels.teams}</DropdownMenuLabel>
            {children}
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** One team in `AppSidebarTeamSwitcher`. */
export function AppSidebarTeam({ name, logo, onAction }: AppSidebarTeamProps) {
  return (
    <DropdownMenuItem textValue={name} onAction={onAction} className="gap-2 p-2">
      <div className="flex size-6 items-center justify-center rounded-md border">{logo}</div>
      {name}
    </DropdownMenuItem>
  );
}
