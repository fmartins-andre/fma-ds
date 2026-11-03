import type { Meta, StoryObj } from "@storybook/react-vite";
import { BellIcon, HouseIcon, UserPlusIcon, UsersRoundIcon } from "lucide-react";
import { RouterProvider } from "react-aria-components";
import { expect, fn, waitFor, within } from "storybook/test";
import {
  AppSidebar,
  AppSidebarItem,
  AppSidebarLogo,
  AppSidebarSection,
  AppSidebarUser,
} from "@/blocks/app-sidebar/app-sidebar";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/blocks/page-header/page-header";
import { StatCard, StatGrid, StatIcon, StatLabel, StatValue } from "@/blocks/stat-cards/stat-cards";
import { Button } from "@/core/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/card/card";
import { DropdownMenuItem } from "@/core/dropdown-menu/dropdown-menu";
import { SidebarContent, SidebarFooter, SidebarHeader } from "@/core/sidebar/sidebar";
import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  useAppShellBreadcrumbs,
} from "./app-shell";
import meta from "./meta.json";

const navigate = fn();

const componentMeta = {
  title: "blocks/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: meta.description } },
  },
  args: { sidebar: <></> },
  // The router only lets the play functions assert on navigation; an app has its own.
  decorators: [
    (Story) => (
      <RouterProvider navigate={navigate}>
        <Story />
      </RouterProvider>
    ),
  ],
} satisfies Meta<typeof AppShell>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

/** A page publishes its trail; the top bar shows it after the sidebar trigger. */
function ClientsPage() {
  useAppShellBreadcrumbs([{ label: "Início", href: "/" }, { label: "Clientes" }]);
  return (
    <AppShellMain>
      <PageHeader sticky density="compact">
        <PageHeaderContent>
          <PageHeaderHeading>
            <PageHeaderTitle>Clientes</PageHeaderTitle>
            <PageHeaderDescription>Todos os clientes cadastrados.</PageHeaderDescription>
          </PageHeaderHeading>
          <PageHeaderActions>
            <Button>
              <UserPlusIcon />
              Cadastrar cliente
            </Button>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>
      <AppShellContent>
        <StatGrid>
          <StatCard>
            <StatLabel>Clientes ativos</StatLabel>
            <StatValue>342</StatValue>
            <StatIcon>
              <UsersRoundIcon />
            </StatIcon>
          </StatCard>
          <StatCard tone="warning">
            <StatLabel>Clientes bloqueados</StatLabel>
            <StatValue>9</StatValue>
          </StatCard>
        </StatGrid>
        <Card>
          <CardHeader>
            <CardTitle>Últimos cadastros</CardTitle>
            <CardDescription>Os clientes cadastrados nesta semana.</CardDescription>
          </CardHeader>
          <CardContent className="h-[480px] text-sm text-muted-foreground">
            A lista dos clientes fica aqui.
          </CardContent>
        </Card>
      </AppShellContent>
    </AppShellMain>
  );
}

/**
 * The whole frame: the sidebar, the top bar with the page's trail and the app's actions,
 * and the page — a sticky, compact `PageHeader` and the content, each part on a surface
 * except the stat cards.
 */
export const Default: Story = {
  render: () => (
    <AppShell
      className="h-[640px] min-h-0"
      sidebar={
        <AppSidebar>
          <SidebarHeader>
            <AppSidebarLogo
              full={<span className="text-base font-semibold">Painel</span>}
              collapsed={<span className="text-base font-semibold">P</span>}
            />
          </SidebarHeader>
          <SidebarContent>
            <AppSidebarSection title="Principal">
              <AppSidebarItem title="Início" href="/" icon={<HouseIcon />} />
              <AppSidebarItem
                title="Clientes"
                href="/clientes"
                icon={<UsersRoundIcon />}
                isActive
              />
            </AppSidebarSection>
          </SidebarContent>
          <SidebarFooter>
            <AppSidebarUser name="Ana Contabilidade" email="ana@contabil.com.br">
              <DropdownMenuItem href="/minha-conta">Minha conta</DropdownMenuItem>
            </AppSidebarUser>
          </SidebarFooter>
        </AppSidebar>
      }
    >
      <AppShellHeader>
        <Button variant="outline" size="icon-sm" aria-label="Notificações">
          <BellIcon />
        </Button>
      </AppShellHeader>
      <ClientsPage />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvasElement.querySelector<HTMLElement>("[data-slot=app-shell-header]");
    if (!header) throw new Error();
    const trail = within(header).getByRole("navigation");
    await expect(within(trail).getByRole("link", { name: "Início" })).toBeVisible();
    await expect(within(trail).getByText("Clientes")).toHaveAttribute("aria-current", "page");
    await expect(within(header).getByRole("button", { name: "Notificações" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 1, name: "Clientes" })).toBeVisible();

    // The page measures its sticky header, so other sticky parts stop below it.
    const main = canvasElement.querySelector<HTMLElement>("[data-slot=app-shell-main]");
    if (!main) throw new Error();
    const pageHeader = canvasElement.querySelector<HTMLElement>("[data-slot=page-header]");
    if (!pageHeader) throw new Error();
    await expect(pageHeader).toHaveAttribute("data-sticky", "true");
    await waitFor(() =>
      expect(main.style.getPropertyValue("--page-header-h")).toBe(`${pageHeader.offsetHeight}px`),
    );
    // It stops below the top bar, across the page's gutter.
    const topBar = canvasElement.querySelector<HTMLElement>("[data-slot=app-shell-header]");
    if (!topBar) throw new Error();
    await expect(getComputedStyle(pageHeader).top).toBe(`${topBar.offsetHeight}px`);

    // The content's children sit 16px apart.
    const content = canvasElement.querySelector<HTMLElement>("[data-slot=app-shell-content]");
    if (!content) throw new Error();
    await expect(getComputedStyle(content).rowGap).toBe("16px");
  },
};
