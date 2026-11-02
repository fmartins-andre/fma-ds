"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/dropdown-menu/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/core/sidebar/sidebar";
import { AppSidebarLabelsContext } from "./app-sidebar-labels";
import type { AppSidebarUserProps } from "./types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function UserSummary({ name, email, avatar }: Omit<AppSidebarUserProps, "children">) {
  return (
    <>
      <Avatar>
        {avatar && <AvatarImage src={avatar} alt="" />}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </>
  );
}

/** The account in the footer: pass the menu's entries as `children`. */
export function AppSidebarUser({ name, email, avatar, children }: AppSidebarUserProps) {
  const { isMobile } = useSidebar();
  const labels = React.useContext(AppSidebarLabelsContext);
  const summary = <UserSummary name={name} email={email} avatar={avatar} />;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton
            size="lg"
            aria-label={`${labels.account}: ${name}`}
            className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
          >
            {summary}
            <ChevronsUpDownIcon aria-hidden="true" className="ml-auto size-4" />
          </SidebarMenuButton>
          <DropdownMenu
            placement={isMobile ? "bottom end" : "end bottom"}
            className="w-fit min-w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 px-1 py-1.5 font-normal text-foreground">
                {summary}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {children}
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
