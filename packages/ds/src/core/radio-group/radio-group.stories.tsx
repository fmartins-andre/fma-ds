import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarcodeIcon, CreditCardIcon, QrCodeIcon } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../button/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog/dialog";
import { FieldContent, FieldDescription, FieldLegend, FieldSet, FieldTitle } from "../field/field";
import { IconTile } from "../icon-tile/icon-tile";
import { Label } from "../label/label";
import meta from "./meta.json";
import { RadioCard, RadioGroup, RadioGroupItem } from "./radio-group";

const componentMeta = {
  title: "ds/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
  args: {
    defaultValue: "default",
    onChange: fn(),
  },
} satisfies Meta<typeof RadioGroup>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

// RadioGroupItem's own children slot is for a custom indicator override, not
// label text — passing long text there crams it into the fixed size-4 box.
// The real pattern pairs each item with an external Label via id/htmlFor,
// laid out as a flex row.
export const Default: Story = {
  parameters: {
    docs: { description: { story: "Three mutually-exclusive options, one selected by default." } },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="r-default" />
        <Label htmlFor="r-default">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="r-comfortable" />
        <Label htmlFor="r-comfortable">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="compact" id="r-compact" />
        <Label htmlFor="r-compact">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  parameters: {
    docs: { description: { story: "isDisabled on the whole group blocks every item." } },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="rd-default" />
        <Label htmlFor="rd-default">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="rd-comfortable" />
        <Label htmlFor="rd-comfortable">Comfortable</Label>
      </div>
    </RadioGroup>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: { description: { story: "Verifies onChange fires with the newly selected value." } },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="ri-default" />
        <Label htmlFor="ri-default">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="ri-comfortable" />
        <Label htmlFor="ri-comfortable">Comfortable</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Comfortable" }));
    expect(args.onChange).toHaveBeenCalledWith("comfortable");
  },
};

/**
 * Choice cards: `RadioCard` makes the whole card the radio, for a few options
 * that need an icon and a description (the payment method).
 */
export const ChoiceCard: Story = {
  args: { defaultValue: "pix" },
  render: (args) => (
    <RadioGroup {...args} className="w-96">
      <Label>Forma de pagamento</Label>
      <RadioCard value="card">
        <IconTile variant="soft" size="sm">
          <CreditCardIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Cartão de crédito</FieldTitle>
          <FieldDescription>Pagamento automático todo mês.</FieldDescription>
        </FieldContent>
      </RadioCard>
      <RadioCard value="pix">
        <IconTile variant="soft" size="sm">
          <QrCodeIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Pix</FieldTitle>
          <FieldDescription>Aprovação na hora.</FieldDescription>
        </FieldContent>
      </RadioCard>
      <RadioCard value="boleto">
        <IconTile variant="soft" size="sm">
          <BarcodeIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Boleto</FieldTitle>
          <FieldDescription>Compensação em até 3 dias úteis.</FieldDescription>
        </FieldContent>
      </RadioCard>
    </RadioGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: /Pix/ })).toBeChecked();
    await userEvent.click(canvas.getByText("Compensação em até 3 dias úteis."));
    await expect(canvas.getByRole("radio", { name: /Boleto/ })).toBeChecked();
    expect(args.onChange).toHaveBeenCalledWith("boleto");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("radio", { name: /Pix/ })).toBeChecked();
    await expect(canvasElement.querySelector("label label")).toBeNull();
  },
};

const CLASSIFICATIONS = [
  {
    value: "p01",
    title: "P01 · Plano padrão",
    description: "Cobertura padrão de suporte.",
    details: "Inclui suporte em horário comercial e atualizações, sem desconto.",
  },
  {
    value: "p02",
    title: "P02 · Plano essencial",
    description: "Desconto de 100% na adesão.",
    details: "Para quem começa agora: os recursos principais, sem taxa de adesão.",
  },
  {
    value: "p03",
    title: "P03 · Plano estendido",
    description: "Desconto de 60% na adesão.",
    details: "Para equipes maiores: mais usuários e suporte estendido.",
  },
];

/**
 * An option with a secondary action ("Details" opens a dialog).
 *
 * The button is a **sibling** of the `RadioCard`, positioned over its corner, never inside it:
 * the card is a `<label>`, so a button inside would be nested interactive content and pressing it
 * would also select the option.
 *
 * The text leaves room for the button, which `aria-describedby` ties to the option's title.
 */
export const ChoiceCardWithAction: Story = {
  args: { defaultValue: "p01" },
  render: (args) => (
    <RadioGroup {...args} className="w-[28rem]">
      <Label>Modalidade do plano</Label>
      {CLASSIFICATIONS.map((option) => (
        <div key={option.value} className="relative">
          <RadioCard value={option.value}>
            <FieldContent className="pe-20">
              <FieldTitle id={`classification-${option.value}`}>{option.title}</FieldTitle>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
          </RadioCard>
          <DialogTrigger>
            <Button
              variant="ghost"
              size="xs"
              aria-describedby={`classification-${option.value}`}
              className="absolute end-10 top-2.5"
            >
              Detalhes
            </Button>
            <Dialog>
              <DialogHeader>
                <DialogTitle>{option.title}</DialogTitle>
                <DialogDescription>{option.details}</DialogDescription>
              </DialogHeader>
            </Dialog>
          </DialogTrigger>
        </div>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvas, args }) => {
    const body = within(document.body);
    const details = canvas.getAllByRole("button", { name: "Detalhes" });
    await expect(details[1]).toHaveAccessibleDescription("P02 · Plano essencial");

    await userEvent.click(details[1] as HTMLElement);
    const dialog = await body.findByRole("dialog", { name: "P02 · Plano essencial" });
    await expect(dialog).toHaveTextContent(/sem taxa de adesão/);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());

    // "Detalhes" doesn't select the option.
    await expect(canvas.getByRole("radio", { name: /Plano essencial/ })).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByText("Desconto de 100% na adesão."));
    await expect(canvas.getByRole("radio", { name: /Plano essencial/ })).toBeChecked();
  },
};

const CLASSIFICATION_GROUPS = [
  {
    code: "a",
    title: "Grupo A · Plano padrão",
    options: [{ value: "p01", title: "P01 · Plano padrão", description: "Cobertura padrão." }],
  },
  {
    code: "b",
    title: "Grupo B · Planos com desconto",
    options: [
      { value: "p02", title: "P02 · Plano essencial", description: "Desconto de 100%." },
      { value: "p03", title: "P03 · Plano estendido", description: "Desconto de 60%." },
    ],
  },
];

/**
 * Options grouped under titles: a `FieldSet` with a `FieldLegend` per group,
 * inside one `RadioGroup`. Each group is named by its legend, and the arrow
 * keys move across groups.
 */
export const ChoiceCardGroups: Story = {
  args: { defaultValue: "p01" },
  render: (args) => (
    <RadioGroup {...args} className="w-[28rem] gap-6">
      <Label>Modalidade do plano</Label>
      {CLASSIFICATION_GROUPS.map((group) => (
        <FieldSet key={group.code} className="gap-3">
          <FieldLegend variant="label">{group.title}</FieldLegend>
          {group.options.map((option) => (
            <RadioCard key={option.value} value={option.value}>
              <FieldContent>
                <FieldTitle>{option.title}</FieldTitle>
                <FieldDescription>{option.description}</FieldDescription>
              </FieldContent>
            </RadioCard>
          ))}
        </FieldSet>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvas }) => {
    const reduced = canvas.getByRole("group", { name: "Grupo B · Planos com desconto" });
    await expect(within(reduced).getAllByRole("radio")).toHaveLength(2);

    await userEvent.click(canvas.getByText("Cobertura padrão."));
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(reduced).getByRole("radio", { name: /Plano essencial/ })).toBeChecked();
  },
};
