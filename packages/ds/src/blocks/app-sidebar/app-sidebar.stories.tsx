import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BookOpenIcon,
  BotIcon,
  BuildingIcon,
  ChartColumnIcon,
  CircleHelpIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  HomeIcon,
  LockIcon,
  ReceiptIcon,
  ScrollTextIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleAlertIcon,
  WorkflowIcon,
} from "lucide-react";
import { RouterProvider } from "react-aria-components";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/core/sidebar/sidebar";
import { AppSidebar, type AppSidebarData } from "./app-sidebar";
import meta from "./meta.json";

const NAV: AppSidebarData["nav"] = [
  {
    title: "Platform",
    items: [
      { title: "Home", url: "/home", icon: <HomeIcon />, isActive: true },
      {
        title: "Models",
        url: "/models",
        icon: <BotIcon />,
        isActive: true,
        items: [
          { title: "Genesis", url: "/models/genesis" },
          { title: "Explorer", url: "/models/explorer" },
        ],
      },
      {
        title: "Docs",
        url: "/docs",
        icon: <BookOpenIcon />,
        variant: "dropdown",
        items: [
          { title: "Introduction", url: "/docs/intro" },
          { title: "Changelog", url: "/docs/changelog" },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: <Settings2Icon />,
        items: [
          { title: "General", url: "/settings/general" },
          { title: "Billing", url: "/settings/billing" },
        ],
      },
    ],
  },
  {
    title: "Projects",
    items: [{ title: "Design Engineering", url: "/projects/design", icon: <FrameIcon /> }],
  },
];

const USER = { name: "Ada Lovelace", email: "ada@example.com", avatar: "" };

const TEAMS_DATA: AppSidebarData = {
  user: USER,
  nav: NAV,
  teams: [
    { name: "Acme Inc", plan: "Enterprise", logo: <GalleryVerticalEndIcon className="size-4" /> },
    { name: "Acme Corp.", plan: "Startup", logo: <BuildingIcon className="size-4" /> },
  ],
};

type NavItem = AppSidebarData["nav"][number]["items"][number];

const REPORTS: NavItem = {
  title: "Reports",
  url: "/reports",
  icon: <ChartColumnIcon />,
  access: "blocked",
  badge: { label: "No access", icon: <LockIcon /> },
};
const AUDIT: NavItem = {
  title: "Audit",
  url: "/audit",
  icon: <ShieldCheckIcon />,
  access: "blocked",
  badge: { label: "Coming soon" },
  isActive: true,
};
const AUTOMATIONS: NavItem = {
  title: "Automations",
  url: "/automations",
  icon: <WorkflowIcon />,
  access: "gated",
  badge: { label: "Upgrade", icon: <SparklesIcon /> },
};
const INVOICES: NavItem = {
  title: "Invoices",
  url: "/invoices",
  icon: <ReceiptIcon />,
  access: "gated",
  badge: { label: "Payment due", tone: "warning", icon: <TriangleAlertIcon /> },
};
const CHANGELOG: NavItem = {
  title: "Changelog",
  url: "/changelog",
  icon: <ScrollTextIcon />,
  badge: { label: "New", tone: "info" },
};
const HELP: NavItem = {
  title: "Help",
  url: "https://example.com/help",
  icon: <CircleHelpIcon />,
  external: true,
};
const INTERNAL: NavItem = {
  title: "Internal",
  url: "/internal",
  icon: <FrameIcon />,
  access: "hidden",
};

const withItems = (...items: NavItem[]): AppSidebarData => ({
  ...TEAMS_DATA,
  nav: [{ title: "Workspace", items }],
});

const navigate = fn();

const componentMeta = {
  title: "blocks/AppSidebar",
  component: AppSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: meta.description } },
  },
  args: {
    data: TEAMS_DATA,
    onTeamChange: fn(),
    onAddTeam: fn(),
    onUserAction: fn(),
  },
  // The router only lets the play functions assert on navigation; an app has its own.
  decorators: [
    (Story) => (
      <RouterProvider navigate={navigate}>
        <Story />
      </RouterProvider>
    ),
  ],
  render: (args) => (
    <SidebarProvider className="h-[560px] min-h-0">
      <AppSidebar {...args} />
      <SidebarInset className="p-4">
        <SidebarTrigger />
        <p className="mt-4 text-sm text-muted-foreground">Page content goes here.</p>
      </SidebarInset>
    </SidebarProvider>
  ),
} satisfies Meta<typeof AppSidebar>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

const body = () => within(document.body);

export const Default: Story = {
  play: async ({ canvas }) => {
    navigate.mockClear();
    await expect(canvas.getByText("Platform")).toBeInTheDocument();
    const home = canvas.getByRole("link", { name: "Home" });
    await expect(home).toHaveAttribute("aria-current", "page");
    await userEvent.click(home);
    await expect(navigate).toHaveBeenLastCalledWith("/home", undefined);

    // An active collapse item starts expanded; the others start collapsed.
    await expect(canvas.getByRole("link", { name: "Genesis" })).toBeVisible();
    const settings = canvas.getByRole("button", { name: "Settings" });
    await expect(settings).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(settings);
    await expect(settings).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
  },
};

/** `variant: "dropdown"` opens the sub-items in a menu beside the item. */
export const DropdownItem: Story = {
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Docs" }));
    const menu = await body().findByRole("menu", { name: "Docs" });
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Changelog" }));
    await expect(navigate).toHaveBeenLastCalledWith("/docs/changelog", undefined);
  },
};

export const TeamSwitcher: Story = {
  // Menus are named by their trigger.
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Team: Acme Inc" }));
    let menu = await body().findByRole("menu", { name: /^Team:/ });
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Acme Corp\./ }));
    await expect(args.onTeamChange).toHaveBeenLastCalledWith(TEAMS_DATA.teams?.[1]);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Team: Acme Corp." })).toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Team: Acme Corp." }));
    menu = await body().findByRole("menu", { name: /^Team:/ });
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Add team" }));
    await expect(args.onAddTeam).toHaveBeenCalledOnce();
  },
};

export const UserMenu: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account: Ada Lovelace" }));
    const menu = await body().findByRole("menu", { name: "Account: Ada Lovelace" });
    await expect(within(menu).getByText("ada@example.com")).toBeInTheDocument();
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Log out" }));
    await expect(args.onUserAction).toHaveBeenLastCalledWith("logout");
  },
};

/** Collapsed to icons, items with sub-items open as menus labelled with their title. */
export const CollapsedToIcons: Story = {
  play: async ({ canvasElement, canvas }) => {
    // The rail is also a "Toggle Sidebar" button; use the trigger.
    const trigger = canvasElement.querySelector<HTMLElement>("[data-slot=sidebar-trigger]");
    const sidebar = canvasElement.querySelector("[data-slot=sidebar]");
    if (!trigger) throw new Error("No sidebar trigger");
    await userEvent.click(trigger);
    await waitFor(() => expect(sidebar).toHaveAttribute("data-collapsible", "icon"));

    await userEvent.click(canvas.getByRole("button", { name: "Settings" }));
    const menu = await body().findByRole("menu", { name: "Settings" });
    await expect(within(menu).getByText("Settings")).toBeInTheDocument();
    await expect(within(menu).getByRole("menuitem", { name: "General" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    // Leave the sidebar expanded for the next story.
    await userEvent.click(trigger);
  },
};

/** Without teams, a static logo fills the header (full, or compact when collapsed). */
export const WithLogo: Story = {
  args: {
    data: {
      user: USER,
      nav: NAV,
      logo: {
        full: <span className="text-base font-semibold">fma-ds</span>,
        collapsed: <span className="text-base font-semibold">f</span>,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("fma-ds")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /^Team:/ })).toBeNull();
  },
};

/** `blocked` keeps the item visible and focusable, but it goes nowhere; the badge says why. */
export const Blocked: Story = {
  args: { data: withItems(REPORTS, AUDIT) },
};

/** `gated` is a normal link: point `url` at the page that resolves it, and guard that route. */
export const Gated: Story = {
  args: { data: withItems(AUTOMATIONS, INVOICES) },
};

/** A `badge` alone doesn't change what the item does. */
export const Badges: Story = {
  args: {
    data: withItems(CHANGELOG, {
      title: "Assistant",
      url: "/assistant",
      icon: <BotIcon />,
      badge: { label: "Beta" },
    }),
  },
};

/** `external` opens the link in a new tab and says so. */
export const ExternalLink: Story = {
  args: { data: withItems(HELP) },
};

export const ShouldNotNavigateBlockedItem: Story = {
  tags: ["!autodocs"],
  args: { data: withItems(REPORTS, AUDIT) },
  play: async ({ canvas }) => {
    navigate.mockClear();
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    await expect(reports).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(reports);
    await expect(navigate).not.toHaveBeenCalled();

    // A page you can't open isn't the current one, even if the data says so.
    const audit = canvas.getByRole("button", { name: "Audit Coming soon" });
    await expect(audit).not.toHaveAttribute("aria-current");
    await expect(audit).toHaveAttribute("data-active", "false");
  },
};

export const ShouldNavigateGatedItem: Story = {
  tags: ["!autodocs"],
  args: { data: withItems(AUTOMATIONS) },
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("link", { name: "Automations Upgrade" }));
    await expect(navigate).toHaveBeenLastCalledWith("/automations", undefined);
  },
};

export const ShouldHideHiddenItem: Story = {
  tags: ["!autodocs"],
  args: { data: withItems(CHANGELOG, INTERNAL) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Changelog New" })).toBeInTheDocument();
    await expect(canvas.queryByText("Internal")).toBeNull();
  },
};

export const ShouldOpenExternalLink: Story = {
  tags: ["!autodocs"],
  args: { data: withItems(HELP) },
  play: async ({ canvas }) => {
    navigate.mockClear();
    const help = canvas.getByRole("link", { name: "Help opens in new tab" });
    await expect(help).toHaveAttribute("target", "_blank");
    await expect(help).toHaveAttribute("rel", "noopener noreferrer");
    // Stay on the page: the browser would open a real tab.
    help.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await userEvent.click(help);
    await expect(navigate).not.toHaveBeenCalled();
  },
};

export const ShouldShowBlockedSubItem: Story = {
  tags: ["!autodocs"],
  args: {
    data: withItems({
      title: "Models",
      url: "/models",
      icon: <BotIcon />,
      isActive: true,
      items: [
        { title: "Genesis", url: "/models/genesis" },
        {
          title: "Quantum",
          url: "/models/quantum",
          access: "blocked",
          badge: { label: "Coming soon" },
        },
      ],
    }),
  },
  play: async ({ canvas }) => {
    navigate.mockClear();
    const quantum = canvas.getByRole("button", { name: "Quantum Coming soon" });
    await expect(quantum).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(quantum);
    await expect(navigate).not.toHaveBeenCalled();
  },
};

const PARENT_ITEMS = [
  { title: "Genesis", url: "/models/genesis" },
  { title: "Explorer", url: "/models/explorer" },
];

/** Collapsed to icons, a dot marks the item and the tooltip gives the reason. */
export const CollapsedAccess: Story = {
  args: { data: withItems(REPORTS, AUDIT, AUTOMATIONS, INVOICES, CHANGELOG, HELP) },
  render: (args) => (
    <SidebarProvider defaultOpen={false} className="h-[560px] min-h-0">
      <AppSidebar {...args} />
      <SidebarInset className="p-4">
        <SidebarTrigger />
        <p className="mt-4 text-sm text-muted-foreground">Page content goes here.</p>
      </SidebarInset>
    </SidebarProvider>
  ),
};

/** Only a `granted` parent opens its sub-items, and each of them has its own state. */
export const AccessCombinations: Story = {
  args: {
    data: withItems(
      {
        title: "Models",
        url: "/models",
        icon: <BotIcon />,
        isActive: true,
        badge: { label: "New", tone: "info" },
        items: [
          { title: "Genesis", url: "/models/genesis" },
          {
            title: "Quantum",
            url: "/models/quantum",
            access: "blocked",
            badge: { label: "Coming soon" },
          },
          {
            title: "Explorer",
            url: "/models/explorer",
            access: "gated",
            badge: { label: "Upgrade" },
          },
        ],
      },
      { ...AUTOMATIONS, items: PARENT_ITEMS },
      { ...REPORTS, items: PARENT_ITEMS },
      HELP,
    ),
  },
};

export const ShouldNotExpandGatedParent: Story = {
  tags: ["!autodocs"],
  args: { data: withItems({ ...AUTOMATIONS, items: PARENT_ITEMS }) },
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("link", { name: "Automations Upgrade" }));
    await expect(navigate).toHaveBeenLastCalledWith("/automations", undefined);
    await expect(canvas.queryByText("Genesis")).toBeNull();
  },
};

export const ShouldNotOpenGatedParentWhileCollapsed: Story = {
  tags: ["!autodocs"],
  args: { data: withItems({ ...AUTOMATIONS, items: PARENT_ITEMS }) },
  render: CollapsedAccess.render,
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("link", { name: "Automations Upgrade" }));
    await expect(navigate).toHaveBeenLastCalledWith("/automations", undefined);
    await expect(body().queryByRole("menu")).toBeNull();
  },
};

export const ShouldNotExpandBlockedParent: Story = {
  tags: ["!autodocs"],
  args: { data: withItems({ ...REPORTS, items: PARENT_ITEMS }) },
  play: async ({ canvas }) => {
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    await expect(reports).not.toHaveAttribute("aria-expanded");
    await userEvent.click(reports);
    await expect(canvas.queryByText("Genesis")).toBeNull();
  },
};

export const ShouldExpandGrantedParentWithBadge: Story = {
  tags: ["!autodocs"],
  args: {
    data: withItems({
      title: "Models",
      url: "/models",
      icon: <BotIcon />,
      badge: { label: "New", tone: "info" },
      items: PARENT_ITEMS,
    }),
  },
  play: async ({ canvas }) => {
    const models = canvas.getByRole("button", { name: "Models New" });
    await expect(models).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(models);
    await expect(models).toHaveAttribute("aria-expanded", "true");
  },
};

export const ShouldReachBlockedDropdownItem: Story = {
  tags: ["!autodocs"],
  args: {
    data: withItems({
      title: "Docs",
      url: "/docs",
      icon: <BookOpenIcon />,
      variant: "dropdown",
      items: [
        { title: "Introduction", url: "/docs/intro" },
        { title: "Audit", url: "/docs/audit", access: "blocked", badge: { label: "Coming soon" } },
      ],
    }),
  },
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Docs" }));
    const menu = await body().findByRole("menu", { name: "Docs" });
    const audit = within(menu).getByRole("menuitem", { name: "Audit Coming soon" });
    await expect(audit).not.toHaveAttribute("href");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await expect(audit).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(navigate).not.toHaveBeenCalled();
    await expect(menu).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};

export const ShouldShowReasonInCollapsedTooltip: Story = {
  tags: ["!autodocs"],
  args: { data: withItems(REPORTS) },
  render: CollapsedAccess.render,
  play: async ({ canvas }) => {
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    for (let tabs = 0; tabs < 10 && document.activeElement !== reports; tabs++) {
      await userEvent.tab();
    }
    await expect(reports).toHaveFocus();
    await expect(await body().findByRole("tooltip")).toHaveTextContent("Reports, No access");
  },
};
