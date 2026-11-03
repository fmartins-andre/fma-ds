import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ColumnDef, useTable } from "@tanstack/react-table";
import {
  BanIcon,
  BellIcon,
  CircleCheckIcon,
  CreditCardIcon,
  FileTextIcon,
  HouseIcon,
  UserPlusIcon,
  UsersRoundIcon,
} from "lucide-react";
import * as React from "react";
import { RouterProvider, TextField } from "react-aria-components";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  AppSidebar,
  AppSidebarItem,
  AppSidebarLogo,
  AppSidebarSection,
  AppSidebarUser,
} from "@/blocks/app-sidebar/app-sidebar";
import {
  FilterQuickToggles,
  FilterSearch,
  FilterToolbar,
  FilterToolbarActions,
} from "@/blocks/filter-toolbar/filter-toolbar";
import {
  OrderSummary,
  OrderSummaryLine,
  OrderSummaryOption,
} from "@/blocks/order-summary/order-summary";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderNav,
  PageHeaderTitle,
} from "@/blocks/page-header/page-header";
import {
  SettingsForm,
  SettingsFormFooter,
  SettingsSection,
} from "@/blocks/settings-form/settings-form";
import {
  StatCard,
  StatCardGroup,
  StatCardToggle,
  StatGrid,
  StatIcon,
  StatLabel,
  StatValue,
} from "@/blocks/stat-cards/stat-cards";
import { Badge } from "@/core/badge/badge";
import { Button } from "@/core/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/card/card";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridContainer,
  type DataGridFeatures,
  DataGridPagination,
  DataGridRowActions,
  DataGridTable,
  dataGridFeatures,
} from "@/core/data-grid/data-grid";
import { DropdownMenuItem } from "@/core/dropdown-menu/dropdown-menu";
import { IconTile } from "@/core/icon-tile/icon-tile";
import { Input } from "@/core/input/input";
import { Label } from "@/core/label/label";
import { MaskedInput } from "@/core/masked-input/masked-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/select/select";
import { SidebarContent, SidebarFooter, SidebarHeader } from "@/core/sidebar/sidebar";
import {
  Slider,
  SliderControl,
  SliderFill,
  SliderLabel,
  SliderMarks,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/core/slider/slider";
import { TabNav, TabNavItem } from "@/core/tab-nav/tab-nav";
import { ToggleGroupItem } from "@/core/toggle-group/toggle-group";
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

// ---------------------------------------------------------------------------
// Whole pages: the app's frame with the blocks composed the way an app uses
// them. Each page is a component of its own, as it would be in the app.
// ---------------------------------------------------------------------------

/** The app's sidebar, with the current page's item marked. */
function ExampleSidebar({ current }: { current: string }) {
  return (
    <AppSidebar>
      <SidebarHeader>
        <AppSidebarLogo
          full={<span className="text-base font-semibold">Painel</span>}
          collapsed={<span className="text-base font-semibold">P</span>}
        />
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarSection title="Principal">
          <AppSidebarItem title="Início" href="/" icon={<HouseIcon />} isActive={current === "/"} />
          <AppSidebarItem
            title="Clientes"
            href="/clientes"
            icon={<UsersRoundIcon />}
            isActive={current === "/clientes"}
          />
          <AppSidebarItem
            title="Planos"
            href="/planos"
            icon={<CreditCardIcon />}
            isActive={current === "/planos"}
          />
        </AppSidebarSection>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser name="Ana Contabilidade" email="ana@contabil.com.br">
          <DropdownMenuItem href="/minha-conta">Minha conta</DropdownMenuItem>
        </AppSidebarUser>
      </SidebarFooter>
    </AppSidebar>
  );
}

type ClientStatus = "Ativo" | "Bloqueado";

type Client = {
  id: string;
  name: string;
  cnpj: string;
  regime: string;
  city: string;
  status: ClientStatus;
};

const CLIENTS: Client[] = [
  ["Padaria Pão Quente Ltda.", "12.345.678/0001-90", "MEI", "Goiânia", "Ativo"],
  ["Studio Silva Design", "23.456.789/0001-01", "Simples Nacional", "São Paulo", "Ativo"],
  ["Mercadinho Bom Preço", "34.567.890/0001-12", "Simples Nacional", "Porto Alegre", "Bloqueado"],
  ["Oficina do Zé ME", "45.678.901/0001-23", "MEI", "Curitiba", "Ativo"],
  ["Consultoria Andrade", "56.789.012/0001-34", "Lucro Presumido", "Belo Horizonte", "Ativo"],
  ["Doces da Vó Maria", "67.890.123/0001-45", "MEI", "Salvador", "Ativo"],
  ["Barbearia Navalha de Ouro", "78.901.234/0001-56", "MEI", "Recife", "Bloqueado"],
  ["Açaí do Porto", "89.012.345/0001-67", "MEI", "Belém", "Ativo"],
  ["Transportes Rápido Sul", "90.123.456/0001-78", "Lucro Presumido", "Joinville", "Ativo"],
  ["Clínica Sorriso", "01.234.567/0001-89", "Simples Nacional", "Brasília", "Ativo"],
].map(([name, cnpj, regime, city, status], index) => ({
  id: String(index + 1),
  name,
  cnpj,
  regime,
  city,
  status: status as ClientStatus,
}));

const header =
  (title: string): ColumnDef<DataGridFeatures, Client>["header"] =>
  ({ column }) => <DataGridColumnHeader column={column} title={title} />;

// Column widths follow the "Table column widths" guide: each column fits its
// header (minSize), the client column takes what's left, the actions column is fixed.
const CLIENT_COLUMNS: ColumnDef<DataGridFeatures, Client>[] = [
  {
    accessorKey: "name",
    header: header("Cliente"),
    minSize: 240,
    meta: { headerTitle: "Cliente", autoSize: true },
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{row.original.cnpj}</span>
      </div>
    ),
  },
  { accessorKey: "regime", header: header("Regime"), size: 170, minSize: 130 },
  { accessorKey: "city", header: header("Cidade"), size: 160, minSize: 120 },
  {
    accessorKey: "status",
    header: header("Situação"),
    size: 130,
    minSize: 130,
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Ativo" ? "success-light" : "warning-light"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    size: 60,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    header: () => <span className="sr-only">Ações</span>,
    cell: ({ row }) => (
      <DataGridRowActions rowLabel={row.original.name}>
        <DropdownMenuItem href={`/clientes/${row.original.id}`}>Abrir</DropdownMenuItem>
        <DropdownMenuItem id="block">Bloquear</DropdownMenuItem>
      </DataGridRowActions>
    ),
  },
];

/** A list page: totals that filter, a search and quick filters, and the table in a card. */
function ClientsListPage() {
  useAppShellBreadcrumbs([{ label: "Início", href: "/" }, { label: "Clientes" }]);
  const [status, setStatus] = React.useState<ClientStatus | "todos">("todos");
  const [search, setSearch] = React.useState("");
  const [regimes, setRegimes] = React.useState<string[]>([]);
  const term = search.trim().toLowerCase();
  const clients = CLIENTS.filter(
    (client) =>
      (status === "todos" || client.status === status) &&
      (regimes.length === 0 || regimes.includes(client.regime)) &&
      (!term || client.name.toLowerCase().includes(term) || client.cnpj.includes(term)),
  );
  const count = (value: ClientStatus) => CLIENTS.filter((client) => client.status === value).length;

  const table = useTable({
    features: dataGridFeatures,
    data: clients,
    columns: CLIENT_COLUMNS,
    getRowId: (client: Client) => client.id,
    initialState: {
      columnPinning: { start: ["name"], end: ["actions"] },
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });

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
        <StatCardGroup
          aria-label="Filtrar por situação"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[status]}
          onSelectionChange={(keys) => setStatus([...keys][0] as ClientStatus | "todos")}
        >
          <StatCardToggle id="todos">
            <StatLabel>Todos</StatLabel>
            <StatValue>{CLIENTS.length}</StatValue>
            <StatIcon>
              <UsersRoundIcon />
            </StatIcon>
          </StatCardToggle>
          <StatCardToggle id="Ativo" tone="success">
            <StatLabel>Ativos</StatLabel>
            <StatValue>{count("Ativo")}</StatValue>
            <StatIcon>
              <CircleCheckIcon />
            </StatIcon>
          </StatCardToggle>
          <StatCardToggle id="Bloqueado" tone="warning">
            <StatLabel>Bloqueados</StatLabel>
            <StatValue>{count("Bloqueado")}</StatValue>
            <StatIcon>
              <BanIcon />
            </StatIcon>
          </StatCardToggle>
        </StatCardGroup>
        <Card>
          <CardContent>
            <FilterToolbar>
              <FilterSearch
                value={search}
                onChange={setSearch}
                placeholder="CNPJ ou razão social"
                aria-label="Buscar clientes"
              />
              <FilterToolbarActions>
                <FilterQuickToggles
                  aria-label="Regime"
                  selectionMode="multiple"
                  size="sm"
                  selectedKeys={regimes}
                  onSelectionChange={(keys) => setRegimes([...keys].map(String))}
                >
                  <ToggleGroupItem id="MEI">MEI</ToggleGroupItem>
                  <ToggleGroupItem id="Simples Nacional">Simples</ToggleGroupItem>
                  <ToggleGroupItem id="Lucro Presumido">Presumido</ToggleGroupItem>
                </FilterQuickToggles>
              </FilterToolbarActions>
            </FilterToolbar>
          </CardContent>
          <CardContent bleed="end">
            <DataGrid
              table={table}
              recordCount={clients.length}
              emptyMessage="Nenhum cliente encontrado."
              tableLayout={{ headerBackground: true, columnsResizable: true }}
            >
              <DataGridContainer flush>
                <DataGridTable aria-label="Clientes" />
              </DataGridContainer>
              <DataGridPagination className="px-(--card-spacing) pb-(--card-spacing)" />
            </DataGrid>
          </CardContent>
        </Card>
      </AppShellContent>
    </AppShellMain>
  );
}

/**
 * A list page in the app's frame: stat cards that filter by status, a search and quick
 * filters on a card, and the table spanning the card's edges with its pagination.
 */
export const ListPage: Story = {
  render: () => (
    <AppShell className="h-[760px] min-h-0" sidebar={<ExampleSidebar current="/clientes" />}>
      <AppShellHeader>
        <Button variant="outline" size="icon-sm" aria-label="Notificações">
          <BellIcon />
        </Button>
      </AppShellHeader>
      <ClientsListPage />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("grid", { name: "Clientes" });
    const rows = () => within(grid).getAllByRole("row").length - 1;
    await expect(rows()).toBe(5);

    await userEvent.click(canvas.getByRole("radio", { name: /Bloqueados/ }));
    await waitFor(() => expect(rows()).toBe(2));
    await userEvent.click(canvas.getByRole("radio", { name: /Todos/ }));

    await userEvent.click(canvas.getByRole("button", { name: "MEI" }));
    await waitFor(() => expect(rows()).toBe(5));

    const search = canvas.getByRole("searchbox", { name: "Buscar clientes" });
    await userEvent.type(search, "açaí{Enter}");
    await waitFor(() => expect(within(grid).getByText("Açaí do Porto")).toBeVisible());
    await expect(rows()).toBe(1);
  },
};

type CompanyData = {
  legalName: string;
  tradeName: string;
  email: string;
  phone: string;
  regime: string;
};

const SAVED_CLIENT: CompanyData = {
  legalName: "Padaria Pão Quente Ltda.",
  tradeName: "Pão Quente",
  email: "contato@paoquente.com.br",
  phone: "62987654321",
  regime: "MEI",
};

/** Stands in for the app's save request. */
const saveClient = (client: CompanyData) =>
  new Promise<CompanyData>((resolve) => setTimeout(() => resolve(client), 600));

/**
 * A record page: the trail back to the list, the status beside the title, the record's
 * sub-pages as tabs, and a settings form on a card. The app owns the values and works
 * out `isDirty`; the form shows it in the card's sticky footer.
 */
function ClientRecordPage() {
  useAppShellBreadcrumbs([
    { label: "Início", href: "/" },
    { label: "Clientes", href: "/clientes" },
    { label: SAVED_CLIENT.legalName },
  ]);
  const [saved, setSaved] = React.useState(SAVED_CLIENT);
  const [values, setValues] = React.useState(SAVED_CLIENT);
  const [isPending, setIsPending] = React.useState(false);
  const isDirty = JSON.stringify(values) !== JSON.stringify(saved);
  const set = (patch: Partial<CompanyData>) => setValues((current) => ({ ...current, ...patch }));

  return (
    <AppShellMain>
      <PageHeader sticky density="compact">
        <PageHeaderContent>
          <PageHeaderHeading className="sm:flex-row sm:items-center sm:gap-3">
            <PageHeaderTitle>{saved.legalName}</PageHeaderTitle>
            <Select aria-label="Situação" defaultValue="ativo" className="w-36">
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="ativo">Ativo</SelectItem>
                <SelectItem id="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </PageHeaderHeading>
          <PageHeaderActions>
            <Button variant="outline">
              <FileTextIcon />
              Ver notas
            </Button>
          </PageHeaderActions>
        </PageHeaderContent>
        <PageHeaderNav>
          <TabNav aria-label="Seções do cliente" currentHref="/clientes/1/dados">
            <TabNavItem href="/clientes/1/dados">Dados</TabNavItem>
            <TabNavItem href="/clientes/1/enderecos">Endereços</TabNavItem>
            <TabNavItem href="/clientes/1/modulos">Módulos</TabNavItem>
            <TabNavItem href="/clientes/1/pedidos">Pedidos</TabNavItem>
          </TabNav>
        </PageHeaderNav>
      </PageHeader>
      <AppShellContent>
        <SettingsForm
          isDirty={isDirty}
          isPending={isPending}
          onReset={() => setValues(saved)}
          onSubmit={async (event) => {
            event.preventDefault();
            setIsPending(true);
            setSaved(await saveClient(values));
            setIsPending(false);
          }}
        >
          <Card>
            <CardContent>
              <SettingsSection title="Dados da empresa" description="Aparecem nas notas emitidas.">
                <TextField
                  value={values.legalName}
                  onChange={(legalName) => set({ legalName })}
                  isRequired
                  className="col-span-full flex flex-col gap-2"
                >
                  <Label>Razão social</Label>
                  <Input />
                </TextField>
                <TextField
                  value={values.tradeName}
                  onChange={(tradeName) => set({ tradeName })}
                  className="flex flex-col gap-2"
                >
                  <Label>Nome fantasia</Label>
                  <Input />
                </TextField>
                <Select
                  value={values.regime}
                  onChange={(regime) => set({ regime: String(regime) })}
                  className="flex w-full flex-col gap-2"
                >
                  <Label>Regime tributário</Label>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="MEI">MEI</SelectItem>
                    <SelectItem id="Simples Nacional">Simples Nacional</SelectItem>
                    <SelectItem id="Lucro Presumido">Lucro Presumido</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsSection>
              <SettingsSection title="Contato" description="Para onde enviamos avisos e guias.">
                <TextField
                  type="email"
                  value={values.email}
                  onChange={(email) => set({ email })}
                  className="flex flex-col gap-2"
                >
                  <Label>E-mail</Label>
                  <Input />
                </TextField>
                <TextField className="flex flex-col gap-2">
                  <Label>Telefone</Label>
                  <MaskedInput
                    mask="phone"
                    value={values.phone}
                    onValueChange={(phone) => set({ phone })}
                  />
                </TextField>
              </SettingsSection>
            </CardContent>
            <CardFooter sticky>
              <SettingsFormFooter framed={false} />
            </CardFooter>
          </Card>
        </SettingsForm>
      </AppShellContent>
    </AppShellMain>
  );
}

/** A record page in the app's frame: tabs under the title and an edit form on a card. */
export const RecordPage: Story = {
  render: () => (
    <AppShell className="h-[760px] min-h-0" sidebar={<ExampleSidebar current="/clientes" />}>
      <AppShellHeader>
        <Button variant="outline" size="icon-sm" aria-label="Notificações">
          <BellIcon />
        </Button>
      </AppShellHeader>
      <ClientRecordPage />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvasElement.querySelector<HTMLElement>("[data-slot=app-shell-header]");
    if (!header) throw new Error();
    await expect(within(header).getByRole("link", { name: "Clientes" })).toBeVisible();
    const tabs = canvas.getByRole("navigation", { name: "Seções do cliente" });
    await expect(within(tabs).getByRole("link", { name: "Dados" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const save = canvas.getByRole("button", { name: "Save changes" });
    await expect(save).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: "Nome fantasia" }), " Gourmet");
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await waitFor(() => expect(save).toBeDisabled());
  },
};

const UNIT_PRICE = 0.5;
const CASHBACK = 4;

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/**
 * A purchase page: the area's sections as tabs beside the title, the quantity on the
 * left and the summary on the right, which stays in view below the sticky page header.
 */
function BuyInvoicesPage() {
  useAppShellBreadcrumbs([{ label: "Início", href: "/" }, { label: "Planos" }]);
  const [quantity, setQuantity] = React.useState(100);
  const [useCashback, setUseCashback] = React.useState(false);
  const subtotal = quantity * UNIT_PRICE;
  const discount = useCashback ? Math.min(CASHBACK, subtotal) : 0;

  return (
    <AppShellMain>
      <PageHeader sticky density="compact">
        <PageHeaderContent>
          <PageHeaderHeading>
            <PageHeaderTitle>Notas adicionais</PageHeaderTitle>
            <PageHeaderDescription>
              Compre notas além das incluídas no seu plano.
            </PageHeaderDescription>
          </PageHeaderHeading>
          <PageHeaderActions>
            <TabNav aria-label="Seções de planos" currentHref="/planos/notas" variant="primary">
              <TabNavItem href="/planos">Meu plano</TabNavItem>
              <TabNavItem href="/planos/notas">Notas adicionais</TabNavItem>
            </TabNav>
          </PageHeaderActions>
        </PageHeaderContent>
      </PageHeader>
      <AppShellContent>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <Card>
            <CardHeader className="flex items-start gap-3">
              <IconTile variant="soft" className="shrink-0 text-primary">
                <FileTextIcon />
              </IconTile>
              <div className="flex min-w-0 flex-col gap-1">
                <CardTitle>Notas fiscais</CardTitle>
                <CardDescription>
                  Notas extras para este ciclo, além das do seu plano.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Slider minValue={0} maxValue={500} step={50} value={quantity} onChange={setQuantity}>
                <div className="flex items-center gap-3">
                  <SliderLabel>Quantidade</SliderLabel>
                  <SliderValue className="text-base font-semibold text-foreground">
                    {(value) => `${value} notas`}
                  </SliderValue>
                </div>
                <SliderControl>
                  <SliderTrack>
                    <SliderFill />
                  </SliderTrack>
                  <SliderThumb />
                </SliderControl>
                <SliderMarks marks={[0, 100, 200, 300, 400, 500]} />
              </Slider>
            </CardContent>
          </Card>
          {/* Spans the row, so the summary has room to stick while the page scrolls. */}
          <div className="lg:self-stretch">
            <OrderSummary
              title="Resumo da compra"
              totalLabel="Total"
              total={brl(subtotal - discount)}
              action={
                <Button size="lg" isDisabled={quantity === 0}>
                  Comprar
                </Button>
              }
            >
              <OrderSummaryLine
                label="Notas adicionais"
                description={`${quantity} × ${brl(UNIT_PRICE)}`}
                value={brl(subtotal)}
              />
              <OrderSummaryOption
                label="Usar saldo de cashback"
                description={`Disponível: ${brl(CASHBACK)}`}
                value={`− ${brl(Math.min(CASHBACK, subtotal))}`}
                isSelected={useCashback}
                onChange={setUseCashback}
              />
            </OrderSummary>
          </div>
        </div>
      </AppShellContent>
    </AppShellMain>
  );
}

/** A purchase page in the app's frame: tabs beside the title and a sticky order summary. */
export const PurchasePage: Story = {
  render: () => (
    <AppShell className="h-[760px] min-h-0" sidebar={<ExampleSidebar current="/planos" />}>
      <AppShellHeader>
        <Button variant="outline" size="icon-sm" aria-label="Notificações">
          <BellIcon />
        </Button>
      </AppShellHeader>
      <BuyInvoicesPage />
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const total = () => canvasElement.querySelector("[data-slot=order-summary-total]");
    await expect(total()).toHaveTextContent("R$ 50,00");
    await userEvent.click(canvas.getByRole("switch", { name: "Usar saldo de cashback" }));
    await expect(total()).toHaveTextContent("R$ 46,00");
    const tabs = canvas.getByRole("navigation", { name: "Seções de planos" });
    await expect(within(tabs).getByRole("link", { name: "Notas adicionais" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};
