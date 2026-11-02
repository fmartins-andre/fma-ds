"use client";

import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import * as React from "react";
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
import type { DictionaryNamespace } from "@/lib/i18n/i18n";
import { externalLinkProps, itemLabel } from "./nav-access";
import { NavItemStatus } from "./nav-item-status";
import type {
  AppSidebarConfig,
  AppSidebarItemProps,
  AppSidebarSectionProps,
  AppSidebarSubItemProps,
} from "./types";

declare global {
  interface FmaNamespaces {
    appSidebar: AppSidebarConfig;
  }
}

export const appSidebarEn: DictionaryNamespace<AppSidebarConfig> = {
  labels: { opensInNewTab: "opens in new tab" },
};

/** Read after the title on an external link; `AppSidebar` provides the active language's. */
export const ExternalLabelContext = React.createContext(appSidebarEn.labels.opensInNewTab);

/** A sub-item's parent decides what it renders as: a sidebar row, or a menu item. */
const SubItemPlacementContext = React.createContext<"sidebar" | "menu">("sidebar");

const isEmpty = (children: React.ReactNode) => React.Children.toArray(children).length === 0;

/** A section of the sidebar. It isn't rendered without items. */
export function AppSidebarSection({ title, children }: AppSidebarSectionProps) {
  if (isEmpty(children)) return null;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>{children}</SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * With `children`, a `granted` item opens its sub-items, and isn't rendered without any. Any other
 * access ignores them: a `gated` item links to `href`, and a `blocked` one goes nowhere.
 */
export function AppSidebarItem(props: AppSidebarItemProps) {
  const { isMobile, state } = useSidebar();
  const isIconCollapsed = state === "collapsed" && !isMobile;

  const isGranted = (props.access ?? "granted") === "granted";
  // JSX passes `children` even when the only child is `undefined`: that's an empty parent.
  if (!isGranted || (!("children" in props) && props.href !== undefined)) {
    return <LeafItem {...props} />;
  }
  if (isEmpty(props.children)) return null;
  // Icon-only sidebars have no room for inline sub-items.
  const variant = isIconCollapsed ? "dropdown" : (props.variant ?? "collapse");
  return variant === "dropdown" ? (
    <DropdownItem {...props} withLabel={isIconCollapsed} />
  ) : (
    <CollapseItem {...props} />
  );
}

function LeafItem({ title, href, icon, isActive, external, access, badge }: AppSidebarItemProps) {
  const externalLabel = React.useContext(ExternalLabelContext);
  const isBlocked = access === "blocked";
  const isCurrent = isActive && !isBlocked;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        href={href ?? ""}
        isInactive={isBlocked}
        isActive={isCurrent}
        aria-current={isCurrent ? "page" : undefined}
        tooltip={itemLabel({ title, badge })}
        {...externalLinkProps({ external, access })}
      >
        {icon}
        <span className="truncate">{title}</span>
        <NavItemStatus
          access={access}
          badge={badge}
          external={external}
          externalLabel={externalLabel}
          withDot
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CollapseItem({ title, icon, isActive, badge, children }: AppSidebarItemProps) {
  return (
    <SidebarMenuItem>
      <Collapsible defaultExpanded={isActive} className="group/collapsible">
        <SidebarMenuButton slot="trigger" tooltip={itemLabel({ title, badge })}>
          {icon}
          <span className="flex-1 truncate">{title}</span>
          <NavItemStatus badge={badge} withDot />
          <ChevronRightIcon
            aria-hidden="true"
            className="ml-auto shrink-0 transition-transform duration-200 group-data-expanded/collapsible:rotate-90"
          />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">{children}</SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function DropdownItem({
  title,
  icon,
  badge,
  children,
  withLabel,
}: AppSidebarItemProps & { withLabel: boolean }) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <DropdownMenuTrigger>
        <SidebarMenuButton
          tooltip={itemLabel({ title, badge })}
          className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
        >
          {icon}
          <span className="flex-1 truncate">{title}</span>
          <NavItemStatus badge={badge} withDot />
          <MoreHorizontalIcon aria-hidden="true" className="ml-auto shrink-0" />
        </SidebarMenuButton>
        <SubItemPlacementContext.Provider value="menu">
          <DropdownMenu
            aria-label={title}
            placement={isMobile ? "bottom start" : "end top"}
            className="w-fit min-w-40"
          >
            {withLabel && (
              <>
                <DropdownMenuLabel>{title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            {children}
          </DropdownMenu>
        </SubItemPlacementContext.Provider>
      </DropdownMenuTrigger>
    </SidebarMenuItem>
  );
}

/** Each sub-item has its own access, inline or in a menu. */
export function AppSidebarSubItem({
  title,
  href,
  icon,
  external,
  access,
  badge,
}: AppSidebarSubItemProps) {
  const placement = React.useContext(SubItemPlacementContext);
  const externalLabel = React.useContext(ExternalLabelContext);
  const isBlocked = access === "blocked";
  const inMenu = placement === "menu";
  const content = (
    <>
      {icon}
      <span className="truncate">{title}</span>
      <NavItemStatus
        access={access}
        badge={badge}
        external={external}
        externalLabel={externalLabel}
        inMenu={inMenu}
      />
    </>
  );
  if (!inMenu) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          href={href}
          isInactive={isBlocked}
          className="w-full"
          {...externalLinkProps({ external, access })}
        >
          {content}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }
  // A disabled menu item can't take focus, and the reason would be out of reach.
  return isBlocked ? (
    <DropdownMenuItem
      textValue={itemLabel({ title, badge })}
      shouldCloseOnSelect={false}
      className="text-muted-foreground"
    >
      {content}
    </DropdownMenuItem>
  ) : (
    <DropdownMenuItem
      href={href}
      textValue={itemLabel({ title, badge })}
      {...externalLinkProps({ external, access })}
    >
      {content}
    </DropdownMenuItem>
  );
}
