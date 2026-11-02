import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeIcon, SettingsIcon } from "lucide-react";
import { RouterProvider } from "react-aria-components";
import { expect, fn, userEvent, within } from "storybook/test";
import meta from "./meta.json";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";

// Composed as one example rather than one story per sub-part — this is a
// compound component (provider + many slot pieces), not a single primitive.
const componentMeta = {
  title: "ds/Sidebar",
  component: SidebarProvider,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: meta.description } },
  },
} satisfies Meta<typeof SidebarProvider>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "A full provider + sidebar + inset composition, with a trigger to collapse it.",
      },
    },
  },
  render: () => (
    <SidebarProvider className="h-96">
      <Sidebar>
        <SidebarHeader>fma-ds</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <HomeIcon />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SettingsIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>v0.1.0</SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-4">
        <SidebarTrigger />
        <p className="mt-4 text-sm text-muted-foreground">Page content goes here.</p>
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
    await userEvent.click(trigger);
    expect(trigger).toBeVisible();
  },
};

const navigate = fn();

/** `isInactive` keeps an item visible and focusable, but it goes nowhere. */
export const InactiveItem: Story = {
  // The router only lets the play function assert on navigation; an app has its own.
  decorators: [
    (Story) => (
      <RouterProvider navigate={navigate}>
        <Story />
      </RouterProvider>
    ),
  ],
  render: () => (
    <SidebarProvider className="h-96">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/home">
                    <HomeIcon />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/billing" isInactive>
                    <SettingsIcon />
                    <span>Billing</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="/plans" isInactive>
                        <span>Plans</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4">
        <p className="text-sm text-muted-foreground">Page content goes here.</p>
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    navigate.mockClear();
    const canvas = within(canvasElement);
    const billing = canvas.getByRole("button", { name: "Billing" });
    const plans = canvas.getByRole("button", { name: "Plans" });
    for (const item of [billing, plans]) {
      await expect(item).toHaveAttribute("aria-disabled", "true");
      await expect(item).not.toHaveAttribute("href");
      await expect(getComputedStyle(item).pointerEvents).not.toBe("none");
      await userEvent.click(item);
    }

    canvas.getByRole("link", { name: "Home" }).focus();
    await userEvent.tab();
    await expect(billing).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.tab();
    await expect(plans).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(navigate).not.toHaveBeenCalled();
  },
};
