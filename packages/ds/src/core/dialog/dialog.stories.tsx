import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ColumnDef, useTable } from "@tanstack/react-table";
import {
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  SendIcon,
} from "lucide-react";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Badge } from "@/core/badge/badge";
import { Checkbox } from "@/core/checkbox/checkbox";
import { ConfirmDialog } from "@/core/confirm-dialog/confirm-dialog";
import {
  DataGrid,
  DataGridContainer,
  type DataGridFeatures,
  DataGridTable,
  dataGridFeatures,
} from "@/core/data-grid/data-grid";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "@/core/description-list/description-list";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/dropdown-menu/dropdown-menu";
import { EmptyMedia } from "@/core/empty/empty";
import { Field, FieldError } from "@/core/field/field";
import { Label } from "@/core/label/label";
import { Progress } from "@/core/progress/progress";
import { Skeleton } from "@/core/skeleton/skeleton";
import { Spinner } from "@/core/spinner/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/tabs/tabs";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/core/timeline/timeline";
import { type DialogController, useDialogPromise } from "@/hooks/use-dialog-promise";
import { Button, LinkButton } from "../button/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import meta from "./meta.json";

const componentMeta = {
  title: "ds/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  // `render` builds its own JSX children below — this placeholder only
  // satisfies Dialog's required `children` prop type for CSF3.
  args: { children: null },
  render: (args) => (
    <DialogTrigger>
      <Button variant="outline">Open</Button>
      <Dialog {...args}>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button>Continue</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  ),
} satisfies Meta<typeof Dialog>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {};

export const NoCloseButton: Story = {
  args: { showCloseButton: false },
};

export const OpensAndClosesWithCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvasBody = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvasBody.findByRole("button", { name: /open/i }));
    expect(await canvasBody.findByRole("dialog")).toBeInTheDocument();

    await userEvent.click(await canvasBody.findByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(canvasBody.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};

export const OpensAndClosesWithX: Story = {
  play: async ({ canvasElement }) => {
    const canvasBody = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvasBody.findByRole("button", { name: /open/i }));
    expect(await canvasBody.findByRole("dialog")).toBeInTheDocument();

    await userEvent.click(await canvasBody.findByRole("button", { name: /close/i }));
    await waitFor(() => {
      expect(canvasBody.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};

type Receipt = { id: string; customer: string; amount: string; deadlinePassed: boolean };

const RECEIPTS: Receipt[] = [
  { id: "1042", customer: "Mercado Silva", amount: "R$ 189,90", deadlinePassed: false },
  { id: "0987", customer: "Padaria Pão Quente", amount: "R$ 42,00", deadlinePassed: true },
];

const CANCEL_STEPS = ["Conferir o prazo", "Estornar no cartão", "Atualizar o recebimento"];

/** Stands in for the app's API: reports each step and fails past the deadline. */
async function cancelReceipt(receipt: Receipt, onStep: (step: number) => void) {
  for (const [index] of CANCEL_STEPS.entries()) {
    onStep(index + 1);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (index === 0 && receipt.deadlinePassed) {
      throw new Error("O prazo para cancelar esta venda terminou em 12/10/2026.");
    }
  }
}

type Phase = "confirm" | "processing" | "success" | "error";

function CancelReceiptDialog({ controller }: { controller: DialogController<Receipt> }) {
  const receipt = controller.data;
  const [phase, setPhase] = React.useState<Phase>("confirm");
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState("");
  const [accepted, setAccepted] = React.useState(false);
  const [showAcceptError, setShowAcceptError] = React.useState(false);
  const acceptRef = React.useRef<HTMLInputElement>(null);

  // Every open starts over.
  React.useEffect(() => {
    if (!controller.isOpen) return;
    setPhase("confirm");
    setStep(0);
    setAccepted(false);
    setShowAcceptError(false);
  }, [controller.isOpen]);

  async function run() {
    if (!receipt) return;
    if (!accepted) {
      setShowAcceptError(true);
      acceptRef.current?.focus();
      return;
    }
    setPhase("processing");
    try {
      await cancelReceipt(receipt, setStep);
      setPhase("success");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setPhase("error");
    }
  }

  const announcement = {
    confirm: "",
    processing: "Cancelando o recebimento.",
    success: "Recebimento cancelado.",
    error: `Não foi possível cancelar o recebimento. ${error}`,
  }[phase];

  return (
    <Dialog
      {...controller.dialogProps}
      // Nothing closes it while the cancellation runs.
      isDismissable={phase !== "processing"}
      isKeyboardDismissDisabled={phase === "processing"}
      showCloseButton={phase !== "processing"}
    >
      <span role="status" className="sr-only">
        {announcement}
      </span>

      {phase === "confirm" && (
        <>
          <DialogHeader>
            <DialogTitle>Cancelar recebimento #{receipt?.id}</DialogTitle>
            <DialogDescription>
              {receipt?.amount} volta para {receipt?.customer} no cartão.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={showAcceptError}>
            <div className="flex items-start gap-2">
              <Checkbox
                id="cancel-receipt-accept"
                inputRef={acceptRef}
                isSelected={accepted}
                onChange={(isSelected) => {
                  setAccepted(isSelected);
                  if (isSelected) setShowAcceptError(false);
                }}
                isInvalid={showAcceptError}
                aria-describedby={showAcceptError ? "cancel-receipt-accept-error" : undefined}
                className="mt-0.5"
              />
              <Label htmlFor="cancel-receipt-accept" className="font-normal">
                Entendo que o cancelamento não pode ser desfeito.
              </Label>
            </div>
            {showAcceptError && (
              <FieldError id="cancel-receipt-accept-error">
                Confirme que entendeu para continuar.
              </FieldError>
            )}
          </Field>
          <DialogFooter>
            <Button variant="outline" onPress={controller.cancel}>
              Voltar
            </Button>
            <Button variant="destructive" onPress={run}>
              Cancelar recebimento
            </Button>
          </DialogFooter>
        </>
      )}

      {phase === "processing" && (
        <>
          <DialogHeader>
            <DialogTitle>Cancelando recebimento #{receipt?.id}</DialogTitle>
            <DialogDescription>Isso leva alguns segundos. Não feche esta janela.</DialogDescription>
          </DialogHeader>
          <Progress
            aria-label="Progresso do cancelamento"
            value={((step - 1) / CANCEL_STEPS.length) * 100}
            className="[&_[data-slot=progress-indicator]]:motion-reduce:transition-none"
          />
          <Timeline value={step}>
            {CANCEL_STEPS.map((title, index) => {
              const current = index + 1;
              return (
                <TimelineItem key={title} step={current}>
                  <TimelineIndicator className="flex items-center justify-center">
                    {current < step && <CheckIcon className="size-2.5" />}
                    {current === step && (
                      <Spinner aria-hidden="true" className="size-3 motion-reduce:animate-none" />
                    )}
                  </TimelineIndicator>
                  <TimelineSeparator />
                  <TimelineHeader>
                    <TimelineTitle>
                      {title}
                      <span className="sr-only">
                        {current < step
                          ? ", concluída"
                          : current === step
                            ? ", em andamento"
                            : ", pendente"}
                      </span>
                    </TimelineTitle>
                  </TimelineHeader>
                </TimelineItem>
              );
            })}
          </Timeline>
        </>
      )}

      {phase === "success" && (
        <>
          <DialogHeader className="items-center text-center">
            <EmptyMedia variant="icon">
              <CircleCheckIcon className="text-success" />
            </EmptyMedia>
            <DialogTitle>Recebimento cancelado</DialogTitle>
            <DialogDescription>
              {receipt?.amount} volta para {receipt?.customer} em até 2 dias úteis.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onPress={() => controller.confirm()}>Concluir</Button>
          </DialogFooter>
        </>
      )}

      {phase === "error" && (
        <>
          <DialogHeader className="items-center text-center">
            <EmptyMedia variant="icon">
              <CircleAlertIcon className="text-destructive" />
            </EmptyMedia>
            <DialogTitle>Não foi possível cancelar</DialogTitle>
            <DialogDescription>
              {error} O estorno ainda pode ser pedido ao suporte, que devolve o valor por Pix.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onPress={controller.cancel}>
              Fechar
            </Button>
            <LinkButton href="https://example.com/suporte/estorno" target="_blank">
              Pedir estorno ao suporte
            </LinkButton>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}

/**
 * A dialog in phases — confirm, processing, then success or error — driven by `useDialogPromise`.
 *
 * - **Confirm**: needs the acceptance; the button stays enabled and points to it.
 * - **Processing**: the steps show done, current and pending, and nothing closes the dialog.
 * - **Error**: offers another way out.
 *
 * Each phase is announced from a status region. No gradients, and the motion stops with
 * `prefers-reduced-motion`.
 */
export const Phases: Story = {
  render: function PhasesExample() {
    const cancel = useDialogPromise<Receipt>();
    const [cancelled, setCancelled] = React.useState<string[]>([]);

    async function handleCancel(receipt: Receipt) {
      const result = await cancel.open(receipt);
      if (result.status === "confirmed") setCancelled((ids) => [...ids, receipt.id]);
    }

    return (
      <div className="flex w-96 flex-col gap-2">
        {RECEIPTS.map((receipt) => (
          <div
            key={receipt.id}
            className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm"
          >
            <span>
              #{receipt.id} · {receipt.customer} · {receipt.amount}
            </span>
            {cancelled.includes(receipt.id) ? (
              <Badge variant="muted">Cancelado</Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                aria-label={`Cancelar recebimento #${receipt.id}`}
                onPress={() => handleCancel(receipt)}
              >
                Cancelar
              </Button>
            )}
          </div>
        ))}
        <CancelReceiptDialog controller={cancel} />
      </div>
    );
  },
  play: async ({ canvas }) => {
    const body = within(document.body);
    const status = () => body.getByRole("dialog").querySelector("[role=status]");

    await userEvent.click(canvas.getByRole("button", { name: "Cancelar recebimento #1042" }));
    await body.findByRole("dialog", { name: "Cancelar recebimento #1042" });
    await userEvent.click(body.getByRole("button", { name: "Cancelar recebimento" }));
    await expect(body.getByText("Confirme que entendeu para continuar.")).toBeVisible();
    await expect(body.getByRole("checkbox")).toHaveFocus();

    await userEvent.click(body.getByRole("checkbox"));
    await userEvent.click(body.getByRole("button", { name: "Cancelar recebimento" }));
    // The new phase fades in: wait until it's shown, not only mounted.
    const processing = await body.findByRole("dialog", { name: /Cancelando/ });
    await waitFor(() => expect(processing).toBeVisible());
    await expect(status()).toHaveTextContent("Cancelando o recebimento.");
    await expect(body.getByRole("listitem", { current: "step" })).toBeVisible();

    await body.findByRole("dialog", { name: "Recebimento cancelado" }, { timeout: 3000 });
    await expect(status()).toHaveTextContent("Recebimento cancelado.");
    await userEvent.click(body.getByRole("button", { name: "Concluir" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByText("Cancelado")).toBeVisible();

    // Past the deadline: the error offers another way out.
    await userEvent.click(canvas.getByRole("button", { name: "Cancelar recebimento #0987" }));
    await userEvent.click(await body.findByRole("checkbox"));
    await userEvent.click(body.getByRole("button", { name: "Cancelar recebimento" }));
    await body.findByRole("dialog", { name: "Não foi possível cancelar" }, { timeout: 3000 });
    await expect(status()).toHaveTextContent(/prazo para cancelar/);
    await expect(body.getByRole("link", { name: "Pedir estorno ao suporte" })).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Cancelar recebimento #0987" })).toBeVisible();
  },
};

type RecordEvent = { id: string; date: string; title: string; detail: string };
type EventColumn = ColumnDef<DataGridFeatures, RecordEvent>;

const EVENT_COLUMNS: EventColumn[] = [
  { accessorKey: "date", header: "Data e hora", size: 150 },
  { accessorKey: "title", header: "Evento", size: 150 },
  { accessorKey: "detail", header: "Detalhe", size: 220 },
];

const NOTIFICATIONS: RecordEvent[] = [
  { id: "n1", date: "05/11/2026 08:00", title: "E-mail entregue", detail: "maria@exemplo.com.br" },
  { id: "n2", date: "05/11/2026 08:00", title: "SMS enviado", detail: "(11) 98765-4321" },
];

/** A record's event list: the grid brings the loading rows and the empty message. */
function RecordEvents({
  label,
  rows,
  isLoading,
  emptyMessage,
}: {
  label: string;
  rows: RecordEvent[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  const table = useTable({
    features: dataGridFeatures,
    manualPagination: true,
    data: rows,
    columns: EVENT_COLUMNS,
    getRowId: (row: RecordEvent) => row.id,
  });
  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
    >
      <DataGridContainer>
        <DataGridTable aria-label={label} />
      </DataGridContainer>
    </DataGrid>
  );
}

type OrderStatus = "Em aberto" | "Cancelada";

/**
 * A record opened from a list, without leaving the page: an order with its data, history,
 * notifications and logs.
 *
 * - **Header**: who it's for as the title; amount, status and due date under it; the record's
 *   actions in one "Ações" menu instead of a row of icon buttons.
 * - **Tabs**: only the panel scrolls, the header stays in view.
 * - **Loading**: skeletons in place of the values, no overlay.
 * - **Stacked dialogs**: a destructive action confirms in a dialog over this one (another
 *   record — an order from a subscription's list — opens over it the same way), and focus
 *   returns here when it closes.
 */
export const RecordDetails: Story = {
  render: function RecordDetailsExample() {
    const [isOpen, setOpen] = React.useState(false);
    const [isLoading, setLoading] = React.useState(true);
    const [status, setStatus] = React.useState<OrderStatus>("Em aberto");
    const cancelOrder = useDialogPromise();

    // The record loads after the dialog opens.
    React.useEffect(() => {
      if (!isOpen) return;
      setLoading(true);
      const timer = window.setTimeout(() => setLoading(false), 400);
      return () => window.clearTimeout(timer);
    }, [isOpen]);

    async function handleAction(key: React.Key) {
      if (key !== "cancel") return;
      const result = await cancelOrder.open();
      if (result.status === "confirmed") setStatus("Cancelada");
    }

    const value = (content: React.ReactNode, width: string) =>
      isLoading ? <Skeleton className={`h-4 ${width}`} /> : content;

    return (
      <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <Button variant="outline">Ver pagamento de Maria Silva</Button>
        <Dialog className="sm:max-w-3xl">
          <DialogHeader className="pr-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <DialogTitle>Maria Silva</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-base font-medium text-foreground tabular-nums">
                  R$ 1.227,60
                </span>
                <Badge variant={status === "Cancelada" ? "muted-outline" : "info-dot"}>
                  {status}
                </Badge>
                <span>Vencimento 15/11/2026</span>
              </DialogDescription>
            </div>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="self-start">
                Ações
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
              <DropdownMenu placement="bottom end" className="w-48" onAction={handleAction}>
                <DropdownMenuItem id="edit">Editar</DropdownMenuItem>
                <DropdownMenuItem id="clone">Clonar</DropdownMenuItem>
                <DropdownMenuItem id="receive">Registrar pagamento</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="cancel" variant="destructive">
                  Cancelar pagamento
                </DropdownMenuItem>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </DialogHeader>

          <Tabs>
            <TabsList variant="line" aria-label="Seções do pagamento">
              <TabsTrigger id="data">Dados</TabsTrigger>
              <TabsTrigger id="history">Histórico</TabsTrigger>
              <TabsTrigger id="notifications">Notificações</TabsTrigger>
              <TabsTrigger id="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent id="data" className="max-h-[min(50dvh,24rem)] overflow-y-auto pt-2">
              <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="font-medium">Pagamento</h3>
                  <DescriptionList layout="stacked" className="sm:grid-cols-3">
                    <DescriptionItem>
                      <DescriptionTerm>Valor</DescriptionTerm>
                      <DescriptionDetails>{value("R$ 1.200,00", "w-20")}</DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem>
                      <DescriptionTerm>Multa</DescriptionTerm>
                      <DescriptionDetails>{value("R$ 24,00", "w-16")}</DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem>
                      <DescriptionTerm>Juros</DescriptionTerm>
                      <DescriptionDetails>{value("R$ 3,60", "w-14")}</DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem className="sm:col-span-3">
                      <DescriptionTerm>Descrição</DescriptionTerm>
                      <DescriptionDetails>
                        {value("Mensalidade de novembro", "w-48")}
                      </DescriptionDetails>
                    </DescriptionItem>
                  </DescriptionList>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-medium">Cliente</h3>
                  <DescriptionList layout="stacked" className="sm:grid-cols-3">
                    <DescriptionItem>
                      <DescriptionTerm>CPF</DescriptionTerm>
                      <DescriptionDetails>{value("123.456.789-09", "w-28")}</DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem>
                      <DescriptionTerm>Telefone</DescriptionTerm>
                      <DescriptionDetails>{value("(11) 98765-4321", "w-28")}</DescriptionDetails>
                    </DescriptionItem>
                    <DescriptionItem>
                      <DescriptionTerm>E-mail</DescriptionTerm>
                      <DescriptionDetails>
                        {value("maria@exemplo.com.br", "w-36")}
                      </DescriptionDetails>
                    </DescriptionItem>
                  </DescriptionList>
                </div>
              </section>
            </TabsContent>

            <TabsContent id="history" className="max-h-[min(50dvh,24rem)] overflow-y-auto pt-2">
              <Timeline value={status === "Cancelada" ? 3 : 2}>
                {[
                  { date: "02/11/2026 09:14", title: "Prevista", note: "Criada pela assinatura." },
                  {
                    date: "05/11/2026 08:00",
                    title: "Em aberto",
                    note: "Enviada por e-mail e SMS.",
                  },
                  ...(status === "Cancelada"
                    ? [{ date: "Agora", title: "Cancelada", note: "Cancelada por você." }]
                    : []),
                ].map((event, index) => (
                  <TimelineItem key={event.title} step={index + 1}>
                    <TimelineHeader>
                      <TimelineDate>{event.date}</TimelineDate>
                      <TimelineTitle>{event.title}</TimelineTitle>
                      <TimelineIndicator />
                    </TimelineHeader>
                    <TimelineSeparator />
                    <TimelineContent>{event.note}</TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </TabsContent>

            <TabsContent
              id="notifications"
              className="flex max-h-[min(50dvh,24rem)] flex-col gap-3 overflow-y-auto pt-2"
            >
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <SendIcon data-icon="inline-start" />
                  Reenviar SMS
                </Button>
                <Button variant="outline" size="sm">
                  <SendIcon data-icon="inline-start" />
                  Reenviar e-mail
                </Button>
              </div>
              <RecordEvents
                label="Notificações"
                rows={NOTIFICATIONS}
                isLoading={isLoading}
                emptyMessage="Nenhuma notificação enviada."
              />
            </TabsContent>

            <TabsContent id="logs" className="max-h-[min(50dvh,24rem)] overflow-y-auto pt-2">
              <RecordEvents
                label="Logs"
                rows={[]}
                isLoading={isLoading}
                emptyMessage="Nenhuma alteração registrada."
              />
            </TabsContent>
          </Tabs>
        </Dialog>

        <ConfirmDialog
          controller={cancelOrder}
          tone="destructive"
          title="Cancelar este pagamento?"
          description="Maria Silva deixa de poder pagá-la. Dá para reativá-la depois."
          confirmLabel="Cancelar pagamento"
          cancelLabel="Voltar"
        />
      </DialogTrigger>
    );
  },
  play: async ({ canvas }) => {
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Ver pagamento de Maria Silva" }));
    const dialog = await body.findByRole("dialog", { name: "Maria Silva" });

    // Values show once the record loads.
    await within(dialog).findByText("R$ 1.200,00");

    await userEvent.click(within(dialog).getByRole("tab", { name: "Notificações" }));
    await expect(within(dialog).getByRole("grid", { name: "Notificações" })).toBeVisible();
    await expect(within(dialog).getByText("E-mail entregue")).toBeVisible();
    await userEvent.click(within(dialog).getByRole("tab", { name: "Logs" }));
    await expect(within(dialog).getByText("Nenhuma alteração registrada.")).toBeVisible();

    // The destructive action confirms over the record and comes back to it.
    await userEvent.click(within(dialog).getByRole("button", { name: "Ações" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Cancelar pagamento" }));
    const confirm = await body.findByRole("alertdialog", { name: "Cancelar este pagamento?" });
    await userEvent.click(within(confirm).getByRole("button", { name: "Cancelar pagamento" }));
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(within(dialog).getByText("Cancelada")).toBeVisible();

    await userEvent.click(within(dialog).getByRole("tab", { name: "Histórico" }));
    await expect(within(dialog).getByText("Cancelada por você.")).toBeVisible();
  },
};
