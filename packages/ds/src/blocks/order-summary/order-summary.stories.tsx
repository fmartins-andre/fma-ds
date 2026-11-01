import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BarcodeIcon,
  CircleCheckIcon,
  CreditCardIcon,
  DownloadIcon,
  QrCodeIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test";
import {
  PaymentCardCodeField,
  PaymentCardExpiryField,
  PaymentCardFields,
  PaymentCardForm,
  PaymentCardNameField,
  PaymentCardNumberField,
  PaymentCardPreview,
} from "@/blocks/payment-card/payment-card";
import { Alert, AlertDescription, AlertTitle } from "@/core/alert/alert";
import { Button, LinkButton } from "@/core/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/card/card";
import { CopyButton } from "@/core/copy-button/copy-button";
import { FieldContent, FieldDescription, FieldTitle } from "@/core/field/field";
import { IconTile } from "@/core/icon-tile/icon-tile";
import { Label } from "@/core/label/label";
import { RadioCard, RadioGroup } from "@/core/radio-group/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/select/select";
import { Spinner } from "@/core/spinner/spinner";
import meta from "./meta.json";
import {
  OrderSummary,
  type OrderSummaryI18n,
  OrderSummaryLine,
  OrderSummaryOption,
} from "./order-summary";

const PT_BR: OrderSummaryI18n = { labels: { details: "Ver detalhes" } };

const componentMeta = {
  title: "blocks/OrderSummary",
  component: OrderSummary,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: meta.description } },
  },
  args: { title: "", totalLabel: "", total: "", action: null },
} satisfies Meta<typeof OrderSummary>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/** Stands in for the app's purchase request. */
const purchase = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

const PLAN = 1990;
const ANNUAL_DISCOUNT = 398;
const CASHBACK = 32;

/**
 * Buying a plan, with the summary in the side column: an annual discount and
 * the cashback balance the user can apply. On small screens the total and the
 * action stay in a bar at the bottom.
 */
export const Default: Story = {
  render: () => {
    const [useCashback, setUseCashback] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const total = PLAN - ANNUAL_DISCOUNT - (useCashback ? CASHBACK : 0);

    return (
      <div className="mx-auto grid max-w-5xl gap-6 p-6 pb-28 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Plano Pro</CardTitle>
            <CardDescription>
              Até 500 pedidos por mês, 5 usuários e análise de vendas.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            O pagamento anual vence todo dia 10 de outubro. Você pode cancelar a renovação a
            qualquer momento nas configurações da conta.
          </CardContent>
        </Card>
        <OrderSummary
          i18n={PT_BR}
          title="Resumo da compra"
          totalLabel="Total"
          total={brl(total)}
          totalDescription="cobrado anualmente"
          action={
            <Button
              size="lg"
              isPending={isPending}
              onPress={async () => {
                setIsPending(true);
                await purchase();
                setIsPending(false);
              }}
            >
              {isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
              Confirmar compra
            </Button>
          }
        >
          <OrderSummaryLine label="Plano Pro anual" value={brl(PLAN)} />
          <OrderSummaryLine
            label="Desconto do plano anual"
            description="20% sobre o mensal"
            value={`− ${brl(ANNUAL_DISCOUNT)}`}
            tone="discount"
          />
          <OrderSummaryOption
            label="Usar saldo de cashback"
            description={`Disponível: ${brl(CASHBACK)}`}
            value={`− ${brl(CASHBACK)}`}
            isSelected={useCashback}
            onChange={setUseCashback}
          />
        </OrderSummary>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // Large screens: the card in the side column.
    const card = within(
      canvasElement.querySelector<HTMLElement>(
        "[data-slot=card]:has([data-slot=order-summary-total])",
      ) ?? canvasElement,
    );
    await expect(card.getByText(/1\.592,00/)).toBeVisible();

    await userEvent.click(card.getByRole("switch", { name: "Usar saldo de cashback" }));
    await expect(card.getByText(/1\.560,00/)).toBeVisible();

    await userEvent.click(card.getByRole("button", { name: "Confirmar compra" }));
    await waitFor(() =>
      expect(card.getByRole("button", { name: "Confirmar compra" })).toHaveAttribute(
        "aria-disabled",
        "true",
      ),
    );
  },
};

/** Who the order is for, on top: buying a contract for a selected customer. */
export const SelectedEntity: Story = {
  render: () => (
    <div className="mx-auto max-w-sm p-6 pb-28 lg:pb-6">
      <OrderSummary
        i18n={PT_BR}
        title="Resumo do pedido"
        totalLabel="Total"
        total={brl(149.9)}
        action={<Button size="lg">Ir para o pagamento</Button>}
      >
        <OrderSummaryLine
          label="Cliente"
          value="Padaria Pão Quente"
          description="CNPJ 12.345.678/0001-95"
        />
        <OrderSummaryLine label="Contrato anual (1 ano)" value={brl(189.9)} />
        <OrderSummaryLine
          label="Brinde do plano"
          description="Primeiro contrato com desconto"
          value={`− ${brl(40)}`}
          tone="discount"
        />
      </OrderSummary>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(/149,90/)[0]).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Ir para o pagamento" })).toBeVisible();
  },
};

// Stand-ins for what the app's API returns: the QR as an image, the Pix code and the boleto's
// typeable line and barcode image.
const PIX_QR_CODE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 21'><path fill='white' d='M0 0h21v21H0z'/><path d='M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0zM2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2zM9 1h2v2H9zM8 5h3v2H8zM9 9h3v3H9zM14 9h2v2h-2zM17 12h3v2h-3zM9 15h2v4H9zM13 15h2v2h-2zM16 17h3v3h-3z'/><path fill='white' d='M1 1h5v5H1zM15 1h5v5h-5zM1 15h5v5H1z'/><path d='M2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2z'/></svg>",
)}`;
const PIX_CODE =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913EMPRESA LTDA6009SAO PAULO62070503***63041D3D";
const BOLETO_LINE = "23793.38128 60000.000003 00000.000400 1 98760000122760";
const BOLETO_BARCODE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 20'>${Array.from(
    { length: 40 },
    (_, bar) => `<rect x='${bar * 3}' width='${1 + (bar % 3 === 0 ? 1 : 0)}' height='20'/>`,
  ).join("")}</svg>`,
)}`;

const ORDER = { amount: 1200, fine: 24, interest: 3.6 };
const ORDER_TOTAL = ORDER.amount + ORDER.fine + ORDER.interest;

/** Stands in for the app's payment request (the card is tokenized by the gateway first). */
const pay = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

type Method = "pix" | "card" | "boleto";

/**
 * The page the customer pays on: what they owe in the summary, and how to pay beside it.
 *
 * - **Status first**: an overdue order says so (the fine and interest are in the total);
 *   once paid, the methods go away and only the confirmation stays.
 * - **Method** as `RadioCard`s, each with its panel:
 *   - Pix: the QR image from the server, the copy-and-paste code and "waiting for payment".
 *   - Card: `payment-card` (first and last name apart, as gateways like Iugu ask) plus
 *     installments.
 *   - Boleto: the typeable line with copy, the barcode image and how long it takes.
 * - **The summary's action is each method's main step**: copy the Pix code (on a phone the QR
 *   can't be scanned from the same screen), pay with the card, download the boleto.
 * - **Terms** in the text, with a link: paying is accepting them.
 *
 * On small screens the total and the action stay in a bar at the bottom.
 */
export const Checkout: Story = {
  render: () => {
    const [method, setMethod] = useState<Method>("pix");
    const [isPending, setIsPending] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    async function handleCardSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setIsPending(true);
      await pay();
      setIsPending(false);
      setIsPaid(true);
    }

    return (
      <div className="mx-auto grid max-w-5xl gap-6 p-6 pb-28 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:pb-6">
        <div className="flex min-w-0 flex-col gap-6">
          {isPaid ? (
            <Alert variant="success" role="status">
              <CircleCheckIcon />
              <AlertTitle>Pagamento aprovado</AlertTitle>
              <AlertDescription>O recibo foi enviado para maria@exemplo.com.br.</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning">
              <TriangleAlertIcon />
              <AlertTitle>Esta fatura venceu em 15/11/2026</AlertTitle>
              <AlertDescription>A multa e os juros já estão no total.</AlertDescription>
            </Alert>
          )}

          {!isPaid && (
            <Card>
              <CardHeader>
                <CardTitle>Como você quer pagar?</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <RadioGroup
                  value={method}
                  onChange={(value) => setMethod(value as Method)}
                  className="sm:grid-cols-3"
                >
                  <Label className="sr-only">Forma de pagamento</Label>
                  <RadioCard value="pix">
                    <IconTile variant="soft" size="sm">
                      <QrCodeIcon />
                    </IconTile>
                    <FieldContent>
                      <FieldTitle>Pix</FieldTitle>
                      <FieldDescription>Aprovação na hora.</FieldDescription>
                    </FieldContent>
                  </RadioCard>
                  <RadioCard value="card">
                    <IconTile variant="soft" size="sm">
                      <CreditCardIcon />
                    </IconTile>
                    <FieldContent>
                      <FieldTitle>Cartão</FieldTitle>
                      <FieldDescription>Em até 3x.</FieldDescription>
                    </FieldContent>
                  </RadioCard>
                  <RadioCard value="boleto">
                    <IconTile variant="soft" size="sm">
                      <BarcodeIcon />
                    </IconTile>
                    <FieldContent>
                      <FieldTitle>Boleto</FieldTitle>
                      <FieldDescription>Até 3 dias úteis.</FieldDescription>
                    </FieldContent>
                  </RadioCard>
                </RadioGroup>

                {method === "pix" && (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={PIX_QR_CODE}
                      alt="QR Code do Pix"
                      className="size-44 rounded-md border"
                    />
                    <div className="flex w-full max-w-sm flex-col gap-1.5">
                      <span className="text-sm font-medium">Pix copia e cola</span>
                      <div className="flex items-center gap-1 rounded-md border ps-3">
                        <span className="min-w-0 flex-1 truncate font-mono text-xs">
                          {PIX_CODE}
                        </span>
                        <CopyButton
                          value={PIX_CODE}
                          tooltip
                          labels={{
                            copy: "Copiar código Pix",
                            copied: "Código Pix copiado",
                            failed: "Não foi possível copiar",
                          }}
                        />
                      </div>
                    </div>
                    <p
                      role="status"
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Spinner aria-hidden="true" />
                      Aguardando o pagamento
                    </p>
                  </div>
                )}

                {method === "card" && (
                  <PaymentCardForm id="checkout-card" onSubmit={handleCardSubmit}>
                    <PaymentCardPreview
                      labels={{ validThru: "válido até", namePlaceholder: "NOME DO TITULAR" }}
                    />
                    <PaymentCardFields>
                      <PaymentCardNumberField name="number" label="Número do cartão" isRequired />
                      <PaymentCardNameField
                        part="first"
                        name="first_name"
                        label="Nome"
                        isRequired
                      />
                      <PaymentCardNameField
                        part="last"
                        name="last_name"
                        label="Sobrenome"
                        isRequired
                      />
                      <PaymentCardExpiryField
                        name="expiry"
                        label="Validade"
                        placeholder="MM/AA"
                        isRequired
                      />
                      <PaymentCardCodeField name="cvc" label="CVV" isRequired />
                      <Select
                        defaultSelectedKey="1"
                        name="installments"
                        className="col-span-2 w-full"
                      >
                        <Label>Parcelas</Label>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem id="1">À vista, {brl(ORDER_TOTAL)}</SelectItem>
                          <SelectItem id="2">2x de {brl(ORDER_TOTAL / 2)}</SelectItem>
                          <SelectItem id="3">3x de {brl(ORDER_TOTAL / 3)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </PaymentCardFields>
                  </PaymentCardForm>
                )}

                {method === "boleto" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">Linha digitável</span>
                      <div className="flex items-center gap-1 rounded-md border ps-3">
                        <span className="min-w-0 flex-1 truncate font-mono text-xs">
                          {BOLETO_LINE}
                        </span>
                        <CopyButton
                          value={BOLETO_LINE}
                          tooltip
                          labels={{
                            copy: "Copiar linha digitável",
                            copied: "Linha digitável copiada",
                            failed: "Não foi possível copiar",
                          }}
                        />
                      </div>
                    </div>
                    <img
                      src={BOLETO_BARCODE}
                      alt="Código de barras do boleto"
                      className="h-14 w-full max-w-md object-fill"
                    />
                    <p className="text-sm text-muted-foreground">
                      A compensação leva de 2 a 3 dias úteis.
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Ao pagar, você aceita os{" "}
                  <a
                    href="https://example.com/termos"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-3 hover:text-foreground"
                  >
                    Termos de compra
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <OrderSummary
          i18n={PT_BR}
          title="Fatura de Maria Silva"
          totalLabel="Total"
          total={brl(ORDER_TOTAL)}
          totalDescription={isPaid ? "pago" : "vencida em 15/11/2026"}
          action={
            isPaid
              ? null
              : {
                  pix: (
                    <CopyButton value={PIX_CODE} variant="default" size="lg">
                      Copiar código Pix
                    </CopyButton>
                  ),
                  card: (
                    <Button size="lg" type="submit" form="checkout-card" isPending={isPending}>
                      {isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
                      Pagar {brl(ORDER_TOTAL)}
                    </Button>
                  ),
                  boleto: (
                    <LinkButton size="lg" href={BOLETO_BARCODE} download="boleto.pdf">
                      <DownloadIcon data-icon="inline-start" />
                      Baixar boleto (PDF)
                    </LinkButton>
                  ),
                }[method]
          }
        >
          <OrderSummaryLine label="Mensalidade de novembro" value={brl(ORDER.amount)} />
          <OrderSummaryLine
            label="Multa"
            description="2% após o vencimento"
            value={brl(ORDER.fine)}
          />
          <OrderSummaryLine label="Juros" description="1% ao mês" value={brl(ORDER.interest)} />
        </OrderSummary>
      </div>
    );
  },
  play: async ({ canvas }) => {
    // Pix by default: the code is copied with one press.
    await expect(canvas.getByRole("img", { name: "QR Code do Pix" })).toBeVisible();
    const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    // The inline copy button and the summary's action both copy it.
    for (const button of canvas.getAllByRole("button", { name: "Copiar código Pix" })) {
      await userEvent.click(button);
    }
    await expect(writeText).toHaveBeenCalledTimes(2);
    await expect(writeText).toHaveBeenCalledWith(PIX_CODE);

    await userEvent.click(canvas.getByText("Até 3 dias úteis."));
    await userEvent.click(canvas.getByRole("button", { name: "Copiar linha digitável" }));
    await expect(writeText).toHaveBeenCalledWith(BOLETO_LINE);
    await expect(canvas.getByRole("link", { name: "Baixar boleto (PDF)" })).toHaveAttribute(
      "download",
      "boleto.pdf",
    );
    writeText.mockRestore();

    // Card: the summary's action submits the card form.
    await userEvent.click(canvas.getByText("Em até 3x."));
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Número do cartão" }),
      "4111111111111111",
    );
    await userEvent.type(canvas.getByRole("textbox", { name: "Nome" }), "Maria");
    await userEvent.type(canvas.getByRole("textbox", { name: "Sobrenome" }), "Silva");
    await userEvent.type(canvas.getByRole("textbox", { name: "Validade" }), "1230");
    await userEvent.type(canvas.getByRole("textbox", { name: "CVV" }), "123");
    const [pay] = canvas.getAllByRole("button", { name: /Pagar R\$/ });
    if (pay) await userEvent.click(pay);
    await canvas.findByText("Pagamento aprovado");
    await expect(canvas.queryByRole("radio", { name: /Pix/ })).not.toBeInTheDocument();
  },
};
