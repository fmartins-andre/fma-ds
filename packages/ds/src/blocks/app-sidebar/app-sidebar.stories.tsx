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
import {
  AppSidebar,
  type AppSidebarData,
  AppSidebarItem,
  type AppSidebarItemProps,
  AppSidebarSection,
  AppSidebarSubItem,
} from "./app-sidebar";
import meta from "./meta.json";

const USER = { name: "Ada Lovelace", email: "ada@example.com", avatar: "" };

const TEAMS_DATA: AppSidebarData = {
  user: USER,
  teams: [
    { name: "Acme Inc", plan: "Enterprise", logo: <GalleryVerticalEndIcon className="size-4" /> },
    { name: "Acme Corp.", plan: "Startup", logo: <BuildingIcon className="size-4" /> },
  ],
};

const REPORTS: AppSidebarItemProps = {
  title: "Reports",
  href: "/reports",
  icon: <ChartColumnIcon />,
  access: "blocked",
  badge: { label: "No access", icon: <LockIcon /> },
};
const AUDIT: AppSidebarItemProps = {
  title: "Audit",
  href: "/audit",
  icon: <ShieldCheckIcon />,
  access: "blocked",
  badge: { label: "Coming soon" },
  isActive: true,
};
const AUTOMATIONS: AppSidebarItemProps = {
  title: "Automations",
  href: "/automations",
  icon: <WorkflowIcon />,
  access: "gated",
  badge: { label: "Upgrade", icon: <SparklesIcon /> },
};
const INVOICES: AppSidebarItemProps = {
  title: "Invoices",
  href: "/invoices",
  icon: <ReceiptIcon />,
  access: "gated",
  badge: { label: "Payment due", tone: "warning", icon: <TriangleAlertIcon /> },
};
const CHANGELOG: AppSidebarItemProps = {
  title: "Changelog",
  href: "/changelog",
  icon: <ScrollTextIcon />,
  badge: { label: "New", tone: "info" },
};
const HELP: AppSidebarItemProps = {
  title: "Help",
  href: "https://example.com/help",
  icon: <CircleHelpIcon />,
  external: true,
};

const MODEL_SUB_ITEMS = (
  <>
    <AppSidebarSubItem title="Genesis" href="/models/genesis" />
    <AppSidebarSubItem title="Explorer" href="/models/explorer" />
  </>
);

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
    (Story, { parameters }) => (
      <RouterProvider navigate={navigate}>
        <SidebarProvider
          defaultOpen={parameters.sidebarDefaultOpen ?? true}
          className="h-[560px] min-h-0"
        >
          <Story />
          <SidebarInset className="p-4">
            <SidebarTrigger />
            <p className="mt-4 text-sm text-muted-foreground">Page content goes here.</p>
          </SidebarInset>
        </SidebarProvider>
      </RouterProvider>
    ),
  ],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Platform">
        <AppSidebarItem title="Home" href="/home" icon={<HomeIcon />} isActive />
        <AppSidebarItem title="Models" icon={<BotIcon />} isActive>
          <AppSidebarSubItem title="Genesis" href="/models/genesis" />
          <AppSidebarSubItem title="Explorer" href="/models/explorer" />
        </AppSidebarItem>
        <AppSidebarItem title="Docs" icon={<BookOpenIcon />} variant="dropdown">
          <AppSidebarSubItem title="Introduction" href="/docs/intro" />
          <AppSidebarSubItem title="Changelog" href="/docs/changelog" />
        </AppSidebarItem>
        <AppSidebarItem title="Settings" icon={<Settings2Icon />}>
          <AppSidebarSubItem title="General" href="/settings/general" />
          <AppSidebarSubItem title="Billing" href="/settings/billing" />
        </AppSidebarItem>
      </AppSidebarSection>
      <AppSidebarSection title="Projects">
        <AppSidebarItem title="Design Engineering" href="/projects/design" icon={<FrameIcon />} />
      </AppSidebarSection>
    </AppSidebar>
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
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...REPORTS} />
        <AppSidebarItem {...AUDIT} />
      </AppSidebarSection>
    </AppSidebar>
  ),
};

/** `gated` is a normal link: point `href` at the page that resolves it, and guard that route. */
export const Gated: Story = {
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...AUTOMATIONS} />
        <AppSidebarItem {...INVOICES} />
      </AppSidebarSection>
    </AppSidebar>
  ),
};

/** A `badge` alone doesn't change what the item does. */
export const Badges: Story = {
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...CHANGELOG} />
        <AppSidebarItem
          title="Assistant"
          href="/assistant"
          icon={<BotIcon />}
          badge={{ label: "Beta" }}
        />
      </AppSidebarSection>
    </AppSidebar>
  ),
};

/** `external` opens the link in a new tab and says so. */
export const ExternalLink: Story = {
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...HELP} />
      </AppSidebarSection>
    </AppSidebar>
  ),
};

/** Collapsed to icons, a dot marks the item and the tooltip gives the reason. */
export const CollapsedAccess: Story = {
  parameters: { sidebarDefaultOpen: false },
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...REPORTS} />
        <AppSidebarItem {...AUDIT} />
        <AppSidebarItem {...AUTOMATIONS} />
        <AppSidebarItem {...INVOICES} />
        <AppSidebarItem {...CHANGELOG} />
        <AppSidebarItem {...HELP} />
      </AppSidebarSection>
    </AppSidebar>
  ),
};

/** Only a `granted` parent opens its sub-items, and each of them has its own state. */
export const AccessCombinations: Story = {
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem
          title="Models"
          icon={<BotIcon />}
          isActive
          badge={{ label: "New", tone: "info" }}
        >
          <AppSidebarSubItem title="Genesis" href="/models/genesis" />
          <AppSidebarSubItem
            title="Quantum"
            href="/models/quantum"
            access="blocked"
            badge={{ label: "Coming soon" }}
          />
          <AppSidebarSubItem
            title="Explorer"
            href="/models/explorer"
            access="gated"
            badge={{ label: "Upgrade" }}
          />
        </AppSidebarItem>
        <AppSidebarItem {...AUTOMATIONS}>{MODEL_SUB_ITEMS}</AppSidebarItem>
        <AppSidebarItem {...REPORTS}>{MODEL_SUB_ITEMS}</AppSidebarItem>
        <AppSidebarItem {...HELP} />
      </AppSidebarSection>
    </AppSidebar>
  ),
};

export const ShouldNotNavigateBlockedItem: Story = {
  ...Blocked,
  tags: ["!autodocs"],
  play: async ({ canvas }) => {
    navigate.mockClear();
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    await expect(reports).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(reports);
    await expect(navigate).not.toHaveBeenCalled();

    // A page you can't open isn't the current one, even if the app says so.
    const audit = canvas.getByRole("button", { name: "Audit Coming soon" });
    await expect(audit).not.toHaveAttribute("aria-current");
    await expect(audit).toHaveAttribute("data-active", "false");
  },
};

export const ShouldNavigateGatedItem: Story = {
  ...Gated,
  tags: ["!autodocs"],
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("link", { name: "Automations Upgrade" }));
    await expect(navigate).toHaveBeenLastCalledWith("/automations", undefined);
  },
};

const isAllowed = false as boolean;

export const ShouldSkipConditionalItems: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...CHANGELOG} />
        {isAllowed && <AppSidebarItem title="Internal" href="/internal" />}
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Changelog New" })).toBeInTheDocument();
    await expect(canvas.queryByText("Internal")).toBeNull();
  },
};

export const ShouldDropEmptyParent: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...CHANGELOG} />
        <AppSidebarItem title="Models" icon={<BotIcon />}>
          {isAllowed && <AppSidebarSubItem title="Genesis" href="/models/genesis" />}
        </AppSidebarItem>
        <AppSidebarItem title="Docs" icon={<BookOpenIcon />}>
          {isAllowed ? <AppSidebarSubItem title="Intro" href="/docs/intro" /> : undefined}
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Models")).toBeNull();
    await expect(canvas.queryByText("Docs")).toBeNull();
  },
};

export const ShouldDropEmptySection: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...CHANGELOG} />
      </AppSidebarSection>
      <AppSidebarSection title="Admin">
        {isAllowed && <AppSidebarItem title="Internal" href="/internal" />}
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Workspace")).toBeInTheDocument();
    await expect(canvas.queryByText("Admin")).toBeNull();
  },
};

export const ShouldOpenExternalLink: Story = {
  ...ExternalLink,
  tags: ["!autodocs"],
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

const blockedSubItem = (
  <AppSidebarSubItem
    title="Quantum"
    href="/models/quantum"
    access="blocked"
    badge={{ label: "Coming soon" }}
  />
);

export const ShouldShowBlockedSubItem: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Models" icon={<BotIcon />} isActive>
          <AppSidebarSubItem title="Genesis" href="/models/genesis" />
          {blockedSubItem}
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    navigate.mockClear();
    const quantum = canvas.getByRole("button", { name: "Quantum Coming soon" });
    await expect(quantum).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(quantum);
    await expect(navigate).not.toHaveBeenCalled();
  },
};

export const ShouldNotExpandGatedParent: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...AUTOMATIONS}>{MODEL_SUB_ITEMS}</AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("link", { name: "Automations Upgrade" }));
    await expect(navigate).toHaveBeenLastCalledWith("/automations", undefined);
    await expect(canvas.queryByText("Genesis")).toBeNull();
  },
};

export const ShouldNotOpenGatedParentWhileCollapsed: Story = {
  ...ShouldNotExpandGatedParent,
  parameters: { sidebarDefaultOpen: false },
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("link", { name: "Automations Upgrade" }));
    await expect(navigate).toHaveBeenLastCalledWith("/automations", undefined);
    await expect(body().queryByRole("menu")).toBeNull();
  },
};

export const ShouldNotExpandBlockedParent: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...REPORTS}>{MODEL_SUB_ITEMS}</AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    await expect(reports).not.toHaveAttribute("aria-expanded");
    await userEvent.click(reports);
    await expect(canvas.queryByText("Genesis")).toBeNull();
  },
};

export const ShouldExpandGrantedParentWithBadge: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Models" icon={<BotIcon />} badge={{ label: "New", tone: "info" }}>
          {MODEL_SUB_ITEMS}
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    const models = canvas.getByRole("button", { name: "Models New" });
    await expect(models).toHaveAttribute("aria-expanded", "false");

    // The badge sits right next to the chevron, not halfway along the row.
    const badge = within(models).getByText("New", { ignore: ".sr-only" });
    const chevron = models.querySelector("svg:last-child");
    if (!chevron) throw new Error("No chevron");
    const gap = chevron.getBoundingClientRect().left - badge.getBoundingClientRect().right;
    await expect(gap).toBeLessThanOrEqual(8);

    await userEvent.click(models);
    await expect(models).toHaveAttribute("aria-expanded", "true");
  },
};

export const ShouldReachBlockedDropdownItem: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Docs" icon={<BookOpenIcon />} variant="dropdown">
          <AppSidebarSubItem title="Introduction" href="/docs/intro" />
          <AppSidebarSubItem
            title="Audit"
            href="/docs/audit"
            access="blocked"
            badge={{ label: "Coming soon" }}
          />
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    navigate.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Docs" }));
    const menu = await body().findByRole("menu", { name: "Docs" });
    const audit = within(menu).getByRole("menuitem", { name: "Audit Coming soon" });
    await expect(audit).not.toHaveAttribute("href");
    const badge = within(audit).getByText("Coming soon", { ignore: ".sr-only" });
    const color = getComputedStyle(badge).color;
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await expect(audit).toHaveFocus();
    // A focused item recolors its content; the badge keeps its own surface, so also its text.
    await expect(getComputedStyle(badge).color).toBe(color);
    await userEvent.keyboard("{Enter}");
    await expect(navigate).not.toHaveBeenCalled();
    await expect(menu).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};

export const ShouldShowReasonInCollapsedTooltip: Story = {
  tags: ["!autodocs"],
  parameters: { sidebarDefaultOpen: false },
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem {...REPORTS} />
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    for (let tabs = 0; tabs < 10 && document.activeElement !== reports; tabs++) {
      await userEvent.tab();
    }
    await expect(reports).toHaveFocus();
    await expect(await body().findByRole("tooltip")).toHaveTextContent("Reports, No access");
  },
};

export const ShouldSizeExternalSubItemIcon: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Models" icon={<BotIcon />} isActive>
          <AppSidebarSubItem title="Help" href="https://example.com/help" external />
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    const help = canvas.getByRole("link", { name: "Help opens in new tab" });
    const icon = help.querySelector("svg");
    if (!icon) throw new Error("No external icon");
    await expect(icon.getBoundingClientRect().width).toBe(16);
  },
};

export const ShouldNotAnnounceExternalOnExpandableParent: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Models" href="/models" icon={<BotIcon />} external>
          {MODEL_SUB_ITEMS}
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Models" })).toBeInTheDocument();
  },
};

export const ShouldOpenExternalDropdownItem: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Docs" icon={<BookOpenIcon />} variant="dropdown">
          <AppSidebarSubItem title="Help" href="https://example.com/help" external />
        </AppSidebarItem>
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Docs" }));
    const menu = await body().findByRole("menu", { name: "Docs" });
    const help = within(menu).getByRole("menuitem", { name: "Help opens in new tab" });
    await expect(help).toHaveAttribute("target", "_blank");
    await expect(help).toHaveAttribute("rel", "noopener noreferrer");
    await userEvent.keyboard("{Escape}");
  },
};

export const ShouldAlignSubItemsWithParent: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <AppSidebar {...args}>
      <AppSidebarSection title="Workspace">
        <AppSidebarItem title="Models" icon={<BotIcon />} isActive>
          {blockedSubItem}
        </AppSidebarItem>
        <AppSidebarItem {...AUTOMATIONS} />
      </AppSidebarSection>
    </AppSidebar>
  ),
  play: async ({ canvas }) => {
    const right = (element: Element) => element.getBoundingClientRect().right;
    const parent = canvas.getByRole("button", { name: "Models" });
    const subItem = canvas.getByRole("button", { name: "Quantum Coming soon" });
    const item = canvas.getByRole("link", { name: "Automations Upgrade" });
    await expect(right(subItem)).toBe(right(parent));
    await expect(right(within(subItem).getByText("Coming soon", { ignore: ".sr-only" }))).toBe(
      right(within(item).getByText("Upgrade", { ignore: ".sr-only" })),
    );
  },
};
