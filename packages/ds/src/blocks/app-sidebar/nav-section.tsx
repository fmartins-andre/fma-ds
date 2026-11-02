"use client";

import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/core/collapsible/collapsible";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/dropdown-menu/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/core/sidebar/sidebar";
import { externalLinkProps, isExpandable, itemLabel } from "./nav-access";
import { NavItemStatus } from "./nav-item-status";
import type { AppSidebarNavItem, AppSidebarNavSection } from "./types";

export function NavSection({
  section,
  externalLabel,
}: {
  section: AppSidebarNavSection;
  externalLabel: string;
}) {
  const { isMobile, state } = useSidebar();
  const isIconCollapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
      <SidebarMenu>
        {section.items.map((item) => {
          if (!isExpandable(item)) {
            const isBlocked = item.access === "blocked";
            const isActive = item.isActive && !isBlocked;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  href={item.url}
                  isInactive={isBlocked}
                  isActive={isActive}
                  aria-current={isActive ? "page" : undefined}
                  tooltip={itemLabel(item)}
                  {...externalLinkProps(item)}
                >
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                  <NavItemStatus item={item} externalLabel={externalLabel} withDot />
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }
          // Icon-only sidebars have no room for inline sub-items.
          const variant = isIconCollapsed ? "dropdown" : (item.variant ?? "collapse");
          return variant === "dropdown" ? (
            <DropdownItem
              key={item.title}
              item={item}
              withLabel={isIconCollapsed}
              externalLabel={externalLabel}
            />
          ) : (
            <CollapseItem key={item.title} item={item} externalLabel={externalLabel} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function CollapseItem({ item, externalLabel }: { item: AppSidebarNavItem; externalLabel: string }) {
  return (
    <SidebarMenuItem>
      <Collapsible defaultExpanded={item.isActive} className="group/collapsible">
        <SidebarMenuButton slot="trigger" tooltip={itemLabel(item)}>
          {item.icon}
          <span className="flex-1 truncate">{item.title}</span>
          <NavItemStatus item={item} externalLabel={externalLabel} withDot />
          <ChevronRightIcon
            aria-hidden="true"
            className="ml-auto shrink-0 transition-transform duration-200 group-data-expanded/collapsible:rotate-90"
          />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  href={subItem.url}
                  isInactive={subItem.access === "blocked"}
                  className="w-full"
                  {...externalLinkProps(subItem)}
                >
                  {subItem.icon}
                  <span className="truncate">{subItem.title}</span>
                  <NavItemStatus item={subItem} externalLabel={externalLabel} />
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function DropdownItem({
  item,
  withLabel,
  externalLabel,
}: {
  item: AppSidebarNavItem;
  withLabel: boolean;
  externalLabel: string;
}) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <DropdownMenuTrigger>
        <SidebarMenuButton
          tooltip={itemLabel(item)}
          className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
        >
          {item.icon}
          <span className="flex-1 truncate">{item.title}</span>
          <NavItemStatus item={item} externalLabel={externalLabel} withDot />
          <MoreHorizontalIcon aria-hidden="true" className="ml-auto shrink-0" />
        </SidebarMenuButton>
        <DropdownMenu
          aria-label={item.title}
          placement={isMobile ? "bottom start" : "end top"}
          className="w-fit min-w-40"
        >
          {withLabel && (
            <>
              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {item.items?.map((subItem) => {
            const content = (
              <>
                {subItem.icon}
                <span className="truncate">{subItem.title}</span>
                <NavItemStatus item={subItem} externalLabel={externalLabel} />
              </>
            );
            // A disabled menu item can't take focus, and the reason would be out of reach.
            return subItem.access === "blocked" ? (
              <DropdownMenuItem
                key={subItem.title}
                id={subItem.title}
                textValue={itemLabel(subItem)}
                shouldCloseOnSelect={false}
                className="text-muted-foreground"
              >
                {content}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={subItem.title}
                id={subItem.title}
                href={subItem.url}
                textValue={itemLabel(subItem)}
                {...externalLinkProps(subItem)}
              >
                {content}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenu>
      </DropdownMenuTrigger>
    </SidebarMenuItem>
  );
}
