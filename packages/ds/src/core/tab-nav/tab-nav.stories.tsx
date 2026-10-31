import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import {
  BadgeCheckIcon,
  BuildingIcon,
  ChartColumnIcon,
  FileBoxIcon,
  FileTextIcon,
  LandmarkIcon,
  PowerIcon,
  ReceiptIcon,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";
import * as React from "react";
import { RouterProvider } from "react-aria-components";
import { expect, userEvent, within } from "storybook/test";
import meta from "./meta.json";
import { TabNav, TabNavItem, TabNavSeparator } from "./tab-nav";

/** A tiny in-memory router: links navigate and the current path feeds `currentHref`. */
const withRouter =
  (initial: string): Decorator =>
  (Story, context) => {
    const [path, setPath] = React.useState(initial);
    return (
      <RouterProvider navigate={setPath}>
        <Story args={{ ...context.args, currentHref: path }} />
      </RouterProvider>
    );
  };

const componentMeta = {
  title: "ds/TabNav",
  component: TabNav,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    variant: { control: "radio", options: ["default", "line"] },
  },
  args: { "aria-label": "Contratos" },
  decorators: [withRouter("/contratos/comprar")],
} satisfies Meta<typeof TabNav>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

/** Two pages of an area; the current one comes from `currentHref` (the router's path). */
export const Default: Story = {
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/contratos/comprar">Comprar contrato</TabNavItem>
      <TabNavItem href="/contratos">Contratos adquiridos</TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Contratos" });
    const buy = within(nav).getByRole("link", { name: "Comprar contrato" });
    const bought = within(nav).getByRole("link", { name: "Contratos adquiridos" });
    await expect(buy).toHaveAttribute("aria-current", "page");
    await userEvent.click(bought);
    await expect(bought).toHaveAttribute("aria-current", "page");
    await expect(buy).not.toHaveAttribute("aria-current");
  },
};

export const Line: Story = {
  args: { variant: "line" },
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/contratos/comprar">Comprar contrato</TabNavItem>
      <TabNavItem href="/contratos">Contratos adquiridos</TabNavItem>
    </TabNav>
  ),
};

/**
 * A separator between groups that are really apart (the module's pages, then
 * its setup); it reads best on `line`. Short navs don't need one: order the
 * items by group instead.
 */
export const Grouped: Story = {
  args: { "aria-label": "Análise de Vendas", variant: "line" },
  decorators: [withRouter("/vendas/dashboard")],
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/vendas/dashboard">
        <ChartColumnIcon />
        Dashboard
      </TabNavItem>
      <TabNavItem href="/vendas/importar-documentos">
        <UploadIcon />
        Importar documentos
      </TabNavItem>
      <TabNavSeparator />
      <TabNavItem href="/vendas/configuracoes">
        <SettingsIcon />
        Configurações
      </TabNavItem>
      <TabNavItem href="/vendas/habilitacao">
        <PowerIcon />
        Habilitação
      </TabNavItem>
    </TabNav>
  ),
};

/** In a narrow space the strip scrolls sideways and keeps the current page in view. */
export const Overflow: Story = {
  args: { "aria-label": "Cliente", className: "w-72" },
  decorators: [withRouter("/clientes/42/mensalidades")],
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/clientes/42/info">
        <BuildingIcon />
        Informações
      </TabNavItem>
      <TabNavItem href="/clientes/42/enderecos">
        <LandmarkIcon />
        Endereços
      </TabNavItem>
      <TabNavItem href="/clientes/42/modulos">
        <FileBoxIcon />
        Módulos
      </TabNavItem>
      <TabNavItem href="/clientes/42/contrato">
        <BadgeCheckIcon />
        Contrato de serviço
      </TabNavItem>
      <TabNavItem href="/clientes/42/pedidos">
        <FileTextIcon />
        Pedidos
      </TabNavItem>
      <TabNavItem href="/clientes/42/mensalidades">
        <ReceiptIcon />
        Mensalidades
      </TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByRole("link", { name: "Mensalidades" });
    const scroller = current.closest("ul")?.parentElement as HTMLElement;
    await expect(scroller.scrollLeft).toBeGreaterThan(0);
    const box = current.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();
    await expect(box.right).toBeLessThanOrEqual(view.right + 1);
  },
};

/** `matchPrefix` keeps an item current on its sub-pages. */
export const MatchPrefix: Story = {
  args: { "aria-label": "Minha conta" },
  decorators: [withRouter("/minha-conta/plano-e-faturas/2026-09")],
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/minha-conta/dados-conta">Dados da conta</TabNavItem>
      <TabNavItem href="/minha-conta/plano-e-faturas" matchPrefix>
        Plano e faturas
      </TabNavItem>
    </TabNav>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Plano e faturas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};
