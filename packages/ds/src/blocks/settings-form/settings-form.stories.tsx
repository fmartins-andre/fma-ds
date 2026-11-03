import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextField } from "react-aria-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Card, CardContent, CardFooter } from "@/core/card/card";
import { Field, FieldContent, FieldDescription } from "@/core/field/field";
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
import { Switch } from "@/core/switch/switch";
import meta from "./meta.json";
import {
  SettingsForm,
  SettingsFormFooter,
  type SettingsFormI18n,
  SettingsSection,
} from "./settings-form";

const PT_BR: SettingsFormI18n = {
  labels: {
    save: "Salvar alterações",
    discard: "Descartar",
    saving: "Salvando…",
    unsaved: "Há alterações não salvas",
    saved: "Nenhuma alteração",
  },
};

const componentMeta = {
  title: "blocks/SettingsForm",
  component: SettingsForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: { description: { component: meta.description } },
  },
} satisfies Meta<typeof SettingsForm>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

type Company = {
  legalName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  emailAlerts: boolean;
  dueDateReminders: boolean;
};

const SAVED_COMPANY: Company = {
  legalName: "Silva & Souza Arquitetura Ltda.",
  tradeName: "Silva Estúdio",
  cnpj: "12345678000195",
  email: "contato@silvaestudio.com.br",
  phone: "11987654321",
  emailAlerts: true,
  dueDateReminders: false,
};

/** Stands in for the app's save request. */
const saveCompany = (company: Company) =>
  new Promise<Company>((resolve) => setTimeout(() => resolve(company), 800));

/**
 * The company settings: the app keeps the saved and edited values (here with
 * `useState`; with react-hook-form, `formState.isDirty` and `reset`) and the
 * form shows the state in the save bar.
 */
export const Default: Story = {
  render: () => {
    const [saved, setSaved] = useState(SAVED_COMPANY);
    const [values, setValues] = useState(SAVED_COMPANY);
    const [isPending, setIsPending] = useState(false);
    const isDirty = JSON.stringify(values) !== JSON.stringify(saved);
    const set = (patch: Partial<Company>) => setValues((current) => ({ ...current, ...patch }));

    return (
      <SettingsForm
        i18n={PT_BR}
        isDirty={isDirty}
        isPending={isPending}
        onReset={() => setValues(saved)}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsPending(true);
          setSaved(await saveCompany(values));
          setIsPending(false);
        }}
        className="max-w-4xl"
      >
        <SettingsSection
          title="Dados da empresa"
          description="Aparecem nos pedidos registrados e nos documentos enviados aos clientes."
        >
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
          <TextField isReadOnly className="flex flex-col gap-2">
            <Label>CNPJ</Label>
            <MaskedInput mask="cnpj" value={values.cnpj} readOnly />
          </TextField>
        </SettingsSection>
        <SettingsSection title="Contato" description="Para onde enviamos avisos e faturas.">
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
        <SettingsSection title="Notificações">
          <Field orientation="horizontal" className="col-span-full">
            <FieldContent>
              <Label htmlFor="email-alerts">Alertas por e-mail</Label>
              <FieldDescription>Pedidos recusados e contratos perto de vencer.</FieldDescription>
            </FieldContent>
            <Switch
              id="email-alerts"
              isSelected={values.emailAlerts}
              onChange={(emailAlerts) => set({ emailAlerts })}
            />
          </Field>
          <Field orientation="horizontal" className="col-span-full">
            <FieldContent>
              <Label htmlFor="due-date-reminders">Lembretes de vencimento</Label>
              <FieldDescription>Relatórios e faturas, três dias antes.</FieldDescription>
            </FieldContent>
            <Switch
              id="due-date-reminders"
              isSelected={values.dueDateReminders}
              onChange={(dueDateReminders) => set({ dueDateReminders })}
            />
          </Field>
        </SettingsSection>
        <SettingsFormFooter />
      </SettingsForm>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole("button", { name: "Salvar alterações" });
    const discard = canvas.getByRole("button", { name: "Descartar" });
    const tradeName = canvas.getByRole("textbox", { name: "Nome fantasia" });
    await expect(canvas.getByRole("group", { name: "Dados da empresa" })).toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent("Nenhuma alteração");
    await expect(save).toBeDisabled();
    await expect(discard).toBeDisabled();

    await userEvent.type(tradeName, " ME");
    await expect(canvas.getByRole("status")).toHaveTextContent("Há alterações não salvas");
    await userEvent.click(discard);
    await expect(tradeName).toHaveValue("Silva Estúdio");
    await expect(save).toBeDisabled();

    await userEvent.click(canvas.getByRole("switch", { name: "Lembretes de vencimento" }));
    await userEvent.click(save);
    await expect(canvas.getByRole("status")).toHaveTextContent("Salvando…");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Nenhuma alteração"));
    await expect(canvas.getByRole("switch", { name: "Lembretes de vencimento" })).toBeChecked();
  },
};

type Preferences = { displayName: string; timezone: string; weeklySummary: boolean };

const SAVED_PREFERENCES: Preferences = {
  displayName: "Ana Souza",
  timezone: "America/Sao_Paulo",
  weeklySummary: true,
};

/** Stands in for the app's save request. */
const savePreferences = (preferences: Preferences) =>
  new Promise<Preferences>((resolve) => setTimeout(() => resolve(preferences), 800));

/**
 * Uncontrolled fields, with a `name` and a default value each: without
 * `isDirty`, the form compares its data with the data it started with, and
 * Discard puts the defaults back. After saving, a new `key` makes the saved
 * values the new defaults.
 */
export const UncontrolledFields: Story = {
  render: () => {
    const [saved, setSaved] = useState(SAVED_PREFERENCES);
    const [version, setVersion] = useState(0);
    const [isPending, setIsPending] = useState(false);

    return (
      <SettingsForm
        key={version}
        i18n={PT_BR}
        isPending={isPending}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setIsPending(true);
          setSaved(
            await savePreferences({
              displayName: String(data.get("displayName")),
              timezone: String(data.get("timezone")),
              weeklySummary: data.has("weeklySummary"),
            }),
          );
          setIsPending(false);
          setVersion((current) => current + 1);
        }}
        className="max-w-4xl"
      >
        <SettingsSection title="Perfil" description="Como seu nome e seus horários aparecem.">
          <TextField
            name="displayName"
            defaultValue={saved.displayName}
            className="flex flex-col gap-2"
          >
            <Label>Nome de exibição</Label>
            <Input />
          </TextField>
          <Select
            name="timezone"
            defaultValue={saved.timezone}
            className="flex w-full flex-col gap-2"
          >
            <Label>Fuso horário</Label>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
              <SelectItem id="America/Manaus">Manaus (GMT-4)</SelectItem>
              <SelectItem id="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
            </SelectContent>
          </Select>
          <Field orientation="horizontal" className="col-span-full">
            <FieldContent>
              <Label htmlFor="weekly-summary">Resumo semanal</Label>
              <FieldDescription>Um e-mail às segundas com os pedidos da semana.</FieldDescription>
            </FieldContent>
            <Switch
              id="weekly-summary"
              name="weeklySummary"
              defaultSelected={saved.weeklySummary}
            />
          </Field>
        </SettingsSection>
        <SettingsFormFooter />
      </SettingsForm>
    );
  },
};

export const ShouldDetectChangesInUncontrolledFields: Story = {
  ...UncontrolledFields,
  tags: ["!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const status = () => canvas.getByRole("status");
    // Discard remounts the fields, so look them up each time.
    const name = () => canvas.getByRole("textbox", { name: "Nome de exibição" });
    const summary = canvas.getByRole("switch", { name: "Resumo semanal" });
    await expect(status()).toHaveTextContent("Nenhuma alteração");
    await expect(canvas.getByRole("button", { name: "Descartar" })).toBeDisabled();

    // A change and its undo: the form compares data, it doesn't just flag edits.
    await userEvent.click(summary);
    await waitFor(() => expect(status()).toHaveTextContent("Há alterações não salvas"));
    await userEvent.click(summary);
    await waitFor(() => expect(status()).toHaveTextContent("Nenhuma alteração"));

    // A picker in a portal counts too.
    await userEvent.click(canvas.getByRole("button", { name: /Fuso horário/ }));
    await userEvent.click(await body.findByRole("option", { name: "Manaus (GMT-4)" }));
    await waitFor(() => expect(status()).toHaveTextContent("Há alterações não salvas"));

    await userEvent.type(name(), " Lima");
    await userEvent.click(canvas.getByRole("button", { name: "Descartar" }));
    await waitFor(() => expect(status()).toHaveTextContent("Nenhuma alteração"));
    await expect(name()).toHaveValue("Ana Souza");
    await expect(canvas.getByRole("button", { name: /Fuso horário/ })).toHaveTextContent(
      "Brasília (GMT-3)",
    );

    await userEvent.type(name(), " Lima");
    await userEvent.click(canvas.getByRole("button", { name: "Salvar alterações" }));
    await expect(status()).toHaveTextContent("Salvando…");
    await waitFor(() => expect(status()).toHaveTextContent("Nenhuma alteração"));
    await expect(canvas.getByRole("textbox", { name: "Nome de exibição" })).toHaveValue(
      "Ana Souza Lima",
    );

    // Discarding with a Select left alone keeps its value, also in the submitted data.
    await userEvent.click(canvas.getByRole("switch", { name: "Resumo semanal" }));
    await waitFor(() => expect(status()).toHaveTextContent("Há alterações não salvas"));
    await userEvent.click(canvas.getByRole("button", { name: "Descartar" }));
    await waitFor(() => expect(status()).toHaveTextContent("Nenhuma alteração"));
    const form = canvasElement.querySelector("form");
    if (!form) throw new Error();
    await expect(new FormData(form).get("timezone")).toBe("America/Sao_Paulo");
    await expect(canvas.getByRole("switch", { name: "Resumo semanal" })).toBeChecked();

    // After Discard, a change and its undo still compare against the defaults.
    await userEvent.click(canvas.getByRole("switch", { name: "Resumo semanal" }));
    await waitFor(() => expect(status()).toHaveTextContent("Há alterações não salvas"));
    await userEvent.click(canvas.getByRole("switch", { name: "Resumo semanal" }));
    await waitFor(() => expect(status()).toHaveTextContent("Nenhuma alteração"));
  },
};

/** Without `onReset` there's no Discard; `children` add a note before Save. */
export const WithoutDiscard: Story = {
  args: { i18n: PT_BR, isDirty: true },
  render: (args) => (
    <SettingsForm {...args} className="max-w-4xl">
      <SettingsSection title="Senha" description="Use ao menos 8 caracteres.">
        <TextField type="password" className="flex flex-col gap-2">
          <Label>Nova senha</Label>
          <Input />
        </TextField>
        <TextField type="password" className="flex flex-col gap-2">
          <Label>Confirmar senha</Label>
          <Input />
        </TextField>
      </SettingsSection>
      <SettingsFormFooter>
        <span className="text-sm text-muted-foreground">Alterada há 3 meses</span>
      </SettingsFormFooter>
    </SettingsForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Descartar" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
  },
};

/**
 * The form on a page's card: the `SettingsForm` goes around the `Card`, so the buttons stay in
 * the form, and the save bar goes in the card's sticky `CardFooter`, without its own bar
 * (`framed={false}`).
 */
export const InACard: Story = {
  render: () => {
    const [saved, setSaved] = useState(SAVED_COMPANY);
    const [values, setValues] = useState(SAVED_COMPANY);
    const [isPending, setIsPending] = useState(false);
    const isDirty = JSON.stringify(values) !== JSON.stringify(saved);

    return (
      <SettingsForm
        i18n={PT_BR}
        isDirty={isDirty}
        isPending={isPending}
        onReset={() => setValues(saved)}
        onSubmit={async (event) => {
          event.preventDefault();
          setIsPending(true);
          setSaved(await saveCompany(values));
          setIsPending(false);
        }}
        className="max-w-4xl"
      >
        <Card>
          <CardContent>
            <SettingsSection title="Dados da empresa">
              <TextField
                value={values.tradeName}
                onChange={(tradeName) => setValues({ ...values, tradeName })}
                className="flex flex-col gap-2"
              >
                <Label>Nome fantasia</Label>
                <Input />
              </TextField>
            </SettingsSection>
          </CardContent>
          <CardFooter sticky>
            <SettingsFormFooter framed={false} />
          </CardFooter>
        </Card>
      </SettingsForm>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector<HTMLElement>("[data-slot=card]");
    const footer = canvasElement.querySelector<HTMLElement>("[data-slot=card-footer]");
    if (!card || !footer) throw new Error();
    await expect(footer).toHaveAttribute("data-sticky", "true");
    await expect(getComputedStyle(footer).position).toBe("sticky");
    // The card lets the footer stick, and the footer closes the card.
    await expect(getComputedStyle(card).overflow).toBe("visible");
    await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(
      Math.round(card.getBoundingClientRect().bottom),
    );

    await userEvent.type(canvas.getByRole("textbox", { name: "Nome fantasia" }), " ME");
    await userEvent.click(canvas.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Nenhuma alteração"));
  },
};
