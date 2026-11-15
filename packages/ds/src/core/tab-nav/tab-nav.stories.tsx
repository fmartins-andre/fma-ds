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
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Card, CardContent, CardHeader } from "@/core/card/card";
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
    variant: { control: "radio", options: ["default", "line", "primary"] },
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

/** On the primary color, for the main sections of an area; the current page is a raised segment. */
export const Primary: Story = {
  args: { variant: "primary" },
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/contratos/comprar">Comprar contrato</TabNavItem>
      <TabNavItem href="/contratos">Contratos adquiridos</TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole("navigation", { name: "Contratos" });
    const current = within(nav).getByRole("link", { name: "Comprar contrato" });
    const other = within(nav).getByRole("link", { name: "Contratos adquiridos" });
    // the current page reads in the primary color over the background; the others over the primary
    const list = current.closest("ul");
    if (!list) throw new Error();
    await expect(getComputedStyle(current).color).toBe(getComputedStyle(list).backgroundColor);
    await expect(getComputedStyle(current).color).not.toBe(getComputedStyle(other).color);
  },
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

/**
 * In a narrow space the strip scrolls sideways and keeps the current page in view. The
 * side that hides items fades out and, with a pointer on larger screens, shows an arrow
 * that turns a page.
 */
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

    // at the end: only the start arrow, and it's out of the accessibility tree
    const arrow = (side: string) =>
      canvasElement.querySelector<HTMLElement>(
        `[data-slot=tab-nav-scroll-arrow][data-side=${side}]`,
      );
    await waitFor(() => expect(arrow("start")).not.toBeNull());
    await expect(arrow("end")).toBeNull();
    await expect(arrow("start")).toHaveAttribute("aria-hidden", "true");
    await expect(arrow("start")?.querySelector("button")).toHaveAttribute("tabindex", "-1");

    // a page back: the end arrow shows up; at the start, the start arrow goes away
    const before = scroller.scrollLeft;
    arrow("start")?.querySelector("button")?.click();
    await waitFor(() => expect(scroller.scrollLeft).toBeLessThan(before));
    await waitFor(() => expect(arrow("end")).not.toBeNull());
    scroller.scrollLeft = 0;
    await waitFor(() => expect(arrow("start")).toBeNull());

    // the keyboard reveals a hidden item on focus
    const pedidos = canvas.getByRole("link", { name: "Pedidos" });
    pedidos.focus();
    await waitFor(() =>
      expect(pedidos.getBoundingClientRect().right).toBeLessThanOrEqual(
        scroller.getBoundingClientRect().right + 1,
      ),
    );
  },
};

/** When everything fits, no arrow and no fade. */
export const ShouldNotShowArrowsWhenItFits: Story = {
  tags: ["!autodocs"],
  args: { "aria-label": "Contratos", className: "w-96" },
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/contratos/comprar">Comprar</TabNavItem>
      <TabNavItem href="/contratos">Adquiridos</TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector("ul")?.parentElement as HTMLElement;
    await expect(scroller).not.toHaveAttribute("data-overflow-start");
    await expect(scroller).not.toHaveAttribute("data-overflow-end");
    await expect(canvasElement.querySelector("[data-slot=tab-nav-scroll-arrow]")).toBeNull();
  },
};

/**
 * Tabs in a card header: a `line` strip on the header's bottom border, its items sharing
 * the width (`listClassName="min-w-full"`) while they fit, scrolling when they don't. A
 * `sticky` header keeps the tabs in view while the card scrolls; without its side, top
 * and bottom padding, the strip sits flush with the card's top, the label centered and
 * the underline on the border.
 */
export const InCardHeader: Story = {
  parameters: { layout: "padded" },
  args: { "aria-label": "Cliente", variant: "line" },
  decorators: [withRouter("/clientes/42/info")],
  render: (args) => (
    <Card className="w-full max-w-3xl">
      <CardHeader sticky className="px-0 pt-0 [.border-b]:pb-0">
        <TabNav {...args} listClassName="min-w-full">
          <TabNavItem href="/clientes/42/info">Informações</TabNavItem>
          <TabNavItem href="/clientes/42/modulos">Módulos</TabNavItem>
          <TabNavItem href="/clientes/42/notas">Notas fiscais</TabNavItem>
          <TabNavItem href="/clientes/42/certificado">Certificado digital</TabNavItem>
        </TabNav>
      </CardHeader>
      <CardContent>Dados cadastrais do cliente.</CardContent>
    </Card>
  ),
  play: async ({ canvas }) => {
    // the items share the strip's width
    const nav = canvas.getByRole("navigation", { name: "Cliente" });
    const items = within(nav).getAllByRole("link");
    const width = (element: Element) => element.getBoundingClientRect().width;
    const total = items.reduce((sum, item) => sum + width(item), 0);
    await expect(total).toBeGreaterThan(width(nav) - items.length * 8);
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

/**
 * The current page's underline (or segment) is one indicator for the whole nav, styled
 * from `className`: here an underline and label in the primary color.
 */
export const IndicatorColor: Story = {
  args: {
    variant: "line",
    className: "[&_[aria-current=page]]:text-primary [&_[data-slot=tab-nav-indicator]]:bg-primary",
  },
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/contratos/comprar">Comprar contrato</TabNavItem>
      <TabNavItem href="/contratos">Contratos adquiridos</TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const indicator = canvasElement.querySelector("[data-slot=tab-nav-indicator]");
    const current = within(canvasElement).getByRole("link", { name: "Comprar contrato" });
    if (!indicator) throw new Error("no indicator");
    await expect(getComputedStyle(indicator).backgroundColor).toBe(getComputedStyle(current).color);
  },
};

/** The indicator slides straight to the new page: sideways only, then under it. */
export const ShouldMoveIndicator: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <TabNav {...args}>
      <TabNavItem href="/contratos/comprar">Comprar contrato</TabNavItem>
      <TabNavItem href="/contratos">Contratos adquiridos</TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buy = canvas.getByRole("link", { name: "Comprar contrato" });
    const bought = canvas.getByRole("link", { name: "Contratos adquiridos" });
    const indicator = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>("[data-slot=tab-nav-indicator]");
      if (!element) throw new Error("no indicator");
      return element;
    });
    const rect = (element: Element) => element.getBoundingClientRect();
    // settled on the current page (it may arrive sliding from a nav with the same items
    // just unmounted)
    await waitFor(() => {
      expect(indicator.getAnimations()).toHaveLength(0);
      expect(rect(indicator).left).toBeCloseTo(rect(buy).left, 0);
      expect(rect(indicator).top).toBeCloseTo(rect(buy).top, 0);
    });
    const offset = rect(indicator).top - rect(buy).top;

    await userEvent.click(bought);
    // while it moves, it stays on the items' row
    for (let frame = 0; frame < 6; frame++) {
      await new Promise(requestAnimationFrame);
      await expect(rect(indicator).top - rect(bought).top).toBeCloseTo(offset, 0);
    }
    await waitFor(() => expect(rect(indicator).left).toBeCloseTo(rect(bought).left, 0));
    await expect(rect(indicator).width).toBeCloseTo(rect(bought).width, 0);
    await expect(canvasElement.querySelectorAll("[data-slot=tab-nav-indicator]")).toHaveLength(1);
  },
};

/**
 * Each route renders its own nav (here keyed by the path, as a page would): the new
 * instance's indicator starts where the old one was and slides to the current page.
 */
export const ShouldSlideAcrossRouteRemounts: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <TabNav key={args.currentHref} {...args}>
      <TabNavItem href="/contratos/comprar">Comprar contrato</TabNavItem>
      <TabNavItem href="/contratos">Contratos adquiridos</TabNavItem>
    </TabNav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator = () => canvasElement.querySelector("[data-slot=tab-nav-indicator]");
    const buy = canvas.getByRole("link", { name: "Comprar contrato" });
    await waitFor(() => {
      expect(indicator()?.getAnimations()).toHaveLength(0);
      expect(indicator()?.getBoundingClientRect().left).toBeCloseTo(
        buy.getBoundingClientRect().left,
        0,
      );
    });
    const before = indicator()?.getBoundingClientRect().left ?? 0;

    await userEvent.click(canvas.getByRole("link", { name: "Contratos adquiridos" }));
    const bought = canvas.getByRole("link", { name: "Contratos adquiridos" });
    await expect(bought).toHaveAttribute("aria-current", "page");
    // a new nav, its indicator still on its way from the old position
    await new Promise(requestAnimationFrame);
    const left = indicator()?.getBoundingClientRect().left ?? 0;
    await expect(left).toBeLessThan(bought.getBoundingClientRect().left - 2);
    await expect(left).toBeGreaterThanOrEqual(before - 1);
    await waitFor(() =>
      expect(indicator()?.getBoundingClientRect().left).toBeCloseTo(
        bought.getBoundingClientRect().left,
        0,
      ),
    );
  },
};
