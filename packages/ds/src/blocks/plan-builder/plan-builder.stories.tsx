import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileSearchIcon, FileTextIcon, ReceiptTextIcon, UsersIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  OrderSummary,
  OrderSummaryLine,
  OrderSummaryOption,
} from "@/blocks/order-summary/order-summary";
import { Alert, AlertDescription, AlertTitle } from "@/core/alert/alert";
import { Button } from "@/core/button/button";
import { ConfirmDialog } from "@/core/confirm-dialog/confirm-dialog";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "@/core/description-list/description-list";
import { useDialogPromise } from "@/hooks/use-dialog-promise";
import meta from "./meta.json";
import {
  PlanBuilder,
  type PlanBuilderI18n,
  PlanPrice,
  PlanResource,
  PlanResourceAddon,
} from "./plan-builder";

const PT_BR: PlanBuilderI18n = { labels: { included: "O que está incluso" } };

const componentMeta = {
  title: "blocks/PlanBuilder",
  component: PlanBuilder,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: meta.description } },
  },
  args: { summary: null },
} satisfies Meta<typeof PlanBuilder>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/** Six evenly spaced marks from `min` to `max`. */
const marksFor = (min: number, max: number) =>
  Array.from({ length: 6 }, (_, index) => min + ((max - min) / 5) * index);

/** Stands in for the app's purchase request. */
const purchase = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

type CustomPlan = {
  orders: number;
  inbox: number;
  dataValidator: boolean;
  monthlyCustomers: number;
  registry: number;
};

const PRICES = {
  orders: 0.4,
  inbox: 0.05,
  dataValidator: 0.02,
  monthlyCustomers: 2,
  registry: 1.5,
};

const linePrices = (plan: CustomPlan) => ({
  orders: plan.orders * PRICES.orders,
  inbox: plan.inbox * PRICES.inbox,
  dataValidator: plan.dataValidator ? plan.inbox * PRICES.dataValidator : 0,
  monthlyCustomers: plan.monthlyCustomers * PRICES.monthlyCustomers,
  registry: plan.registry * PRICES.registry,
});

const monthly = (plan: CustomPlan) =>
  Object.values(linePrices(plan)).reduce((total, value) => total + value, 0);

/** Stands in for the app's price request: settles a moment after the last change. */
function useMonthlyPrice(plan: CustomPlan) {
  const [price, setPrice] = React.useState(() => monthly(plan));
  const [isCalculating, setIsCalculating] = React.useState(false);
  React.useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setPrice(monthly(plan));
      setIsCalculating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [plan]);
  return { price, isCalculating };
}

/**
 * A custom plan: one resource per feature, an add-on on the orders inbox and
 * the summary in the side column. Prices show a skeleton while the app
 * recalculates; subscribing asks first.
 */
export const CustomPlan: Story = {
  render: function CustomPlanExample() {
    const [plan, setPlan] = React.useState<CustomPlan>({
      orders: 120,
      inbox: 400,
      dataValidator: false,
      monthlyCustomers: 10,
      registry: 0,
    });
    const [isSubscribed, setIsSubscribed] = React.useState(false);
    const { price, isCalculating } = useMonthlyPrice(plan);
    const lines = linePrices(plan);
    const confirmation = useDialogPromise();
    const set = (patch: Partial<CustomPlan>) => setPlan((current) => ({ ...current, ...patch }));

    async function subscribe() {
      const result = await confirmation.open();
      if (result.status === "confirmed") setIsSubscribed(true);
    }

    return (
      <div className="mx-auto max-w-6xl p-6">
        <PlanBuilder
          i18n={PT_BR}
          isCalculating={isCalculating}
          summary={
            <OrderSummary
              i18n={{ labels: { details: "Ver detalhes" } }}
              title="Resumo do plano"
              totalLabel="Mensal"
              total={<PlanPrice>{brl(price)}</PlanPrice>}
              totalDescription={<PlanPrice>{brl(price * 12)} por ano</PlanPrice>}
              action={
                <Button size="lg" isDisabled={isCalculating || isSubscribed} onPress={subscribe}>
                  {isSubscribed ? "Plano assinado" : "Assinar plano"}
                </Button>
              }
            >
              <OrderSummaryLine
                label="Pedidos"
                description={`${plan.orders} por mês`}
                value={<PlanPrice>{brl(lines.orders)}</PlanPrice>}
              />
              <OrderSummaryLine
                label="Análise de vendas"
                description={`${plan.inbox} por mês`}
                value={<PlanPrice>{brl(lines.inbox)}</PlanPrice>}
              />
              {plan.dataValidator && (
                <OrderSummaryLine
                  label="Validador de dados"
                  value={<PlanPrice>{brl(lines.dataValidator)}</PlanPrice>}
                />
              )}
              <OrderSummaryLine
                label="Clientes mensais"
                description={`${plan.monthlyCustomers} clientes`}
                value={<PlanPrice>{brl(lines.monthlyCustomers)}</PlanPrice>}
              />
              <OrderSummaryLine
                label="Cadastro Certo"
                description={`${plan.registry} clientes`}
                value={<PlanPrice>{brl(lines.registry)}</PlanPrice>}
              />
            </OrderSummary>
          }
        >
          <Alert variant="success">
            <AlertTitle>Primeira fatura com desconto</AlertTitle>
            <AlertDescription>
              Os dias que restam do plano atual são abatidos da primeira fatura.
            </AlertDescription>
          </Alert>
          <PlanResource
            icon={<FileTextIcon />}
            title="Pedidos"
            description="Registro de pedidos de produtos e serviços para os seus clientes."
            label="Pedidos por mês"
            formatValue={(value) => `${value} pedidos`}
            minValue={0}
            maxValue={300}
            step={10}
            marks={marksFor(0, 300)}
            value={plan.orders}
            onChange={(orders) => set({ orders })}
            included={
              <ul className="list-disc space-y-1 pl-4">
                <li>Cancelamentos e correções ilimitados</li>
                <li>Envio automático do recibo ao cliente</li>
              </ul>
            }
          />
          <PlanResource
            icon={<FileSearchIcon />}
            title="Análise de vendas"
            description="Captura automática dos pedidos feitos pelos seus clientes."
            label="Pedidos por mês"
            formatValue={(value) => `${value} pedidos`}
            minValue={0}
            maxValue={1000}
            step={50}
            marks={marksFor(0, 1000)}
            value={plan.inbox}
            onChange={(inbox) => set({ inbox, dataValidator: inbox > 0 && plan.dataValidator })}
            included={
              <p>Download de relatórios, confirmação do cliente e alertas de divergência.</p>
            }
          >
            {plan.inbox > 0 && (
              <PlanResourceAddon
                label="Validador de dados"
                description={`Validação automática dos dados até o limite de ${plan.inbox} pedidos.`}
                isSelected={plan.dataValidator}
                onChange={(dataValidator) => set({ dataValidator })}
              />
            )}
          </PlanResource>
          <PlanResource
            icon={<ReceiptTextIcon />}
            title="Clientes mensais"
            description="Mensalidades geradas e enviadas todo mês."
            label="Clientes"
            formatValue={(value) => `${value} clientes`}
            minValue={0}
            maxValue={100}
            step={5}
            marks={marksFor(0, 100)}
            value={plan.monthlyCustomers}
            onChange={(monthlyCustomers) => set({ monthlyCustomers })}
          />
          <PlanResource
            icon={<UsersIcon />}
            title="Cadastro Certo"
            description="Consulta e atualização cadastral dos clientes."
            label="Clientes"
            formatValue={(value) => `${value} clientes`}
            minValue={0}
            maxValue={50}
            step={5}
            marks={marksFor(0, 50)}
            value={plan.registry}
            onChange={(registry) => set({ registry })}
          />
        </PlanBuilder>
        <ConfirmDialog
          controller={confirmation}
          title="Confirmar assinatura"
          description={`Você passa a pagar ${brl(price)} por mês, a partir da próxima fatura.`}
          confirmLabel="Assinar"
          cancelLabel="Voltar"
          pendingLabel="Assinando…"
          onConfirm={purchase}
        >
          <DescriptionList>
            <DescriptionItem>
              <DescriptionTerm>Pedidos</DescriptionTerm>
              <DescriptionDetails>{plan.orders} por mês</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Análise de vendas</DescriptionTerm>
              <DescriptionDetails>
                {plan.inbox} por mês{plan.dataValidator && " + validador"}
              </DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Clientes mensais</DescriptionTerm>
              <DescriptionDetails>{plan.monthlyCustomers}</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Cadastro Certo</DescriptionTerm>
              <DescriptionDetails>{plan.registry}</DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </ConfirmDialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const summary = within(
      canvasElement.querySelector<HTMLElement>(
        "[data-slot=card]:has([data-slot=order-summary-total])",
      ) ?? canvasElement,
    );
    const total = () =>
      canvasElement.querySelector("[data-slot=card] [data-slot=order-summary-total]");
    await waitFor(() => expect(total()).toHaveTextContent("R$ 88,00"));

    // A mark sets the quantity; the summary recalculates.
    const orders = canvas.getAllByRole("slider", { name: "Pedidos por mês" })[0];
    const ordersCard = within(
      orders?.closest<HTMLElement>("[data-slot=plan-resource]") ?? canvasElement,
    );
    await userEvent.click(ordersCard.getByRole("button", { name: "240" }));
    await expect(ordersCard.getByText("240 pedidos")).toBeInTheDocument();
    await waitFor(() => expect(total()).toHaveTextContent("R$ 136,00"));

    await userEvent.click(canvas.getByRole("switch", { name: "Validador de dados" }));
    await waitFor(() => expect(total()).toHaveTextContent("R$ 144,00"));

    await userEvent.click(summary.getByRole("button", { name: "Assinar plano" }));
    const dialog = await page.findByRole("alertdialog", { name: "Confirmar assinatura" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Assinar" }));
    await waitFor(() =>
      expect(summary.getByRole("button", { name: "Plano assinado" })).toBeVisible(),
    );
  },
};

const UNIT_PRICE = 0.5;
const CASHBACK = 4;

/**
 * Buying a quantity of one item: the scale runs to 60 but only 20 are left
 * this cycle, so the slider stops at its `limit` and the `hint` says why.
 */
export const QuantityPurchase: Story = {
  render: function QuantityPurchaseExample() {
    const [quantity, setQuantity] = React.useState(10);
    const [useCashback, setUseCashback] = React.useState(false);
    const subtotal = quantity * UNIT_PRICE;
    const discount = useCashback ? Math.min(CASHBACK, subtotal) : 0;

    return (
      <div className="mx-auto max-w-5xl p-6">
        <PlanBuilder
          i18n={PT_BR}
          summary={
            <OrderSummary
              i18n={{ labels: { details: "Ver detalhes" } }}
              title="Resumo da compra"
              totalLabel="Total"
              total={<PlanPrice>{brl(subtotal - discount)}</PlanPrice>}
              action={
                <Button size="lg" isDisabled={quantity === 0}>
                  Comprar
                </Button>
              }
            >
              <OrderSummaryLine
                label="Pedidos adicionais"
                description={`${quantity} × ${brl(UNIT_PRICE)}`}
                value={<PlanPrice>{brl(subtotal)}</PlanPrice>}
              />
              <OrderSummaryOption
                label="Usar saldo de cashback"
                description={`Disponível: ${brl(CASHBACK)}`}
                value={`− ${brl(Math.min(CASHBACK, subtotal))}`}
                isSelected={useCashback}
                onChange={setUseCashback}
              />
            </OrderSummary>
          }
        >
          <PlanResource
            icon={<FileTextIcon />}
            title="Pedidos adicionais"
            description="Pedidos extras além do seu plano neste ciclo."
            label="Quantidade"
            formatValue={(value) => `${value} pedidos`}
            minValue={0}
            maxValue={60}
            step={10}
            limit={20}
            hint="Só 20 disponíveis neste ciclo."
            marks={[0, 10, 20, 30, 40, 50, 60]}
            value={quantity}
            onChange={setQuantity}
          />
        </PlanBuilder>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = within(
      canvasElement.querySelector<HTMLElement>(
        "[data-slot=card]:has([data-slot=order-summary-total])",
      ) ?? canvasElement,
    );
    const total = () =>
      canvasElement.querySelector("[data-slot=card] [data-slot=order-summary-total]");
    const slider = canvas.getByRole("slider", { name: "Quantidade" });
    await expect(slider).toHaveAccessibleDescription("Só 20 disponíveis neste ciclo.");
    await expect(canvas.getByRole("button", { name: "40" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "20" }));
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveValue("20");
    await expect(total()).toHaveTextContent("R$ 10,00");

    await userEvent.click(summary.getByRole("switch", { name: "Usar saldo de cashback" }));
    await expect(total()).toHaveTextContent("R$ 6,00");
  },
};

/** Nothing can be bought now: the slider is disabled and the hint says why. */
export const Blocked: Story = {
  render: () => (
    <div className="mx-auto max-w-5xl p-6">
      <PlanBuilder
        i18n={PT_BR}
        summary={
          <OrderSummary
            i18n={{ labels: { details: "Ver detalhes" } }}
            title="Resumo da compra"
            totalLabel="Total"
            total={<PlanPrice>{brl(0)}</PlanPrice>}
            action={
              <Button size="lg" isDisabled>
                Comprar
              </Button>
            }
          >
            <OrderSummaryLine label="Pedidos adicionais" value={<PlanPrice>{brl(0)}</PlanPrice>} />
          </OrderSummary>
        }
      >
        <PlanResource
          icon={<FileTextIcon />}
          title="Pedidos adicionais"
          description="Pedidos extras além do seu plano neste ciclo."
          label="Quantidade"
          formatValue={(value) => `${value} pedidos`}
          minValue={0}
          maxValue={60}
          step={10}
          marks={[0, 10, 20, 30, 40, 50, 60]}
          defaultValue={0}
          isDisabled
          hint="Bloqueado por atraso de pagamento."
        />
      </PlanBuilder>
    </div>
  ),
};
