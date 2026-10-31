import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartBarIcon, FileTextIcon, ReceiptIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import * as z from "zod";
import { Button } from "../button/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldTitle } from "../field/field";
import { IconTile } from "../icon-tile/icon-tile";
import { Label } from "../label/label";
import { Checkbox, CheckboxCard, CheckboxGroup } from "./checkbox";
import meta from "./meta.json";

const componentMeta = {
  title: "ds/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

// Checkbox's own children slot is for a custom indicator/icon override, not
// label text — passing long text there crams it into the fixed size-4 box.
// The real pattern pairs Checkbox with an external Label via id/htmlFor,
// laid out as a flex row.
export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="terms-disabled" />
      <Label htmlFor="terms-disabled">Accept terms and conditions</Label>
    </div>
  ),
};

// isIndeterminate is a controlled prop, not user-toggleable by clicking — set
// programmatically (e.g. a "select all" checkbox whose children are only
// partially selected).
export const Indeterminate: Story = {
  args: { isIndeterminate: true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="select-all" />
      <Label htmlFor="select-all">Select all</Label>
    </div>
  ),
};

export const Interactive: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="terms-interactive" />
      <Label htmlFor="terms-interactive">Accept terms and conditions</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  },
};

/** Several options under one label; the group's value is the array of checked `value`s. */
export const Group: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["pedidos"]}>
      <Label>Módulos</Label>
      <div className="flex items-center gap-2">
        <Checkbox value="pedidos" id="module-pedidos" />
        <Label htmlFor="module-pedidos">Gestor de pedidos</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox value="vendas" id="module-vendas" />
        <Label htmlFor="module-vendas">Análise de vendas</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox value="validador" id="module-validador" />
        <Label htmlFor="module-validador">Validador de dados</Label>
      </div>
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Módulos" });
    const vendas = within(group).getByRole("checkbox", { name: "Análise de vendas" });
    await expect(within(group).getByRole("checkbox", { name: "Gestor de pedidos" })).toBeChecked();
    await userEvent.click(vendas);
    await expect(vendas).toBeChecked();
  },
};

/**
 * Choice cards: `CheckboxCard` makes the whole card the checkbox, for a few options that need an
 * icon and a description (the modules a customer uses).
 *
 * For an option with a secondary action, or options grouped under titles, see RadioGroup's
 * `ChoiceCardWithAction` and `ChoiceCardGroups`: the same composition works with `CheckboxCard`
 * in a `CheckboxGroup`.
 */
export const ChoiceCard: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["pedidos"]} className="w-96">
      <Label>Módulos do cliente</Label>
      <CheckboxCard value="pedidos">
        <IconTile variant="soft" size="sm">
          <ReceiptIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Gestor de pedidos</FieldTitle>
          <FieldDescription>Registro de pedidos de produtos e serviços.</FieldDescription>
        </FieldContent>
      </CheckboxCard>
      <CheckboxCard value="vendas">
        <IconTile variant="soft" size="sm">
          <ChartBarIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Análise de vendas</FieldTitle>
          <FieldDescription>Pedidos feitos no CNPJ, reunidos num só relatório.</FieldDescription>
        </FieldContent>
      </CheckboxCard>
      <CheckboxCard value="das" isDisabled>
        <IconTile variant="soft" size="sm">
          <FileTextIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Relatórios mensais</FieldTitle>
          <FieldDescription>Disponível só para clientes anuais.</FieldDescription>
        </FieldContent>
      </CheckboxCard>
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pedidos = canvas.getByRole("checkbox", { name: /Gestor de pedidos/ });
    const vendas = canvas.getByRole("checkbox", { name: /Análise de vendas/ });
    await expect(pedidos).toBeChecked();
    // A click anywhere on the card toggles it.
    await userEvent.click(canvas.getByText("Pedidos feitos no CNPJ, reunidos num só relatório."));
    await expect(vendas).toBeChecked();
    await userEvent.click(canvas.getByText("Gestor de pedidos"));
    await expect(pedidos).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: /Relatórios mensais/ })).toBeDisabled();
    // No label nested in another label.
    await expect(canvasElement.querySelector("label label")).toBeNull();
  },
};

const acceptanceSchema = z.object({
  acceptedTerms: z.boolean().refine(Boolean, "Aceite os termos de compra para continuar."),
});

type AcceptanceValues = z.infer<typeof acceptanceSchema>;

const finishPurchase = fn(async (_values: AcceptanceValues) => {});

function AcceptanceForm() {
  const form = useForm<AcceptanceValues>({
    resolver: zodResolver(acceptanceSchema),
    defaultValues: { acceptedTerms: false },
  });

  return (
    <form
      onSubmit={form.handleSubmit(finishPurchase)}
      className="flex w-96 flex-col gap-4"
      noValidate
    >
      <Controller
        control={form.control}
        name="acceptedTerms"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-start gap-2">
              <Checkbox
                id="accept-terms"
                inputRef={field.ref}
                name={field.name}
                isSelected={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "accept-terms-error" : undefined}
                className="mt-0.5"
              />
              <Label htmlFor="accept-terms" className="font-normal">
                <span>
                  Li e aceito os{" "}
                  <a
                    href="https://example.com/termos-de-compra"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    termos de compra
                  </a>
                </span>
              </Label>
            </div>
            {fieldState.invalid && (
              <FieldError id="accept-terms-error" errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Button type="submit" isPending={form.formState.isSubmitting}>
        Finalizar compra
      </Button>
    </form>
  );
}

/**
 * Accepting terms: a required `Checkbox` in a React Hook Form + Zod form.
 *
 * - **Submit**: the button stays enabled; submitting without the check shows a `FieldError` and
 *   focuses the checkbox.
 * - **Link**: the link in the label opens the terms without checking the box.
 * - **Pending**: only while the purchase runs.
 */
export const Acceptance: Story = {
  render: () => <AcceptanceForm />,
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: /Li e aceito os termos de compra/ });
    const submit = canvas.getByRole("button", { name: "Finalizar compra" });
    await expect(submit).toBeEnabled();

    await userEvent.click(submit);
    await expect(
      await canvas.findByText("Aceite os termos de compra para continuar."),
    ).toBeVisible();
    await waitFor(() => expect(checkbox).toHaveFocus());
    await expect(checkbox).toHaveAccessibleDescription(
      "Aceite os termos de compra para continuar.",
    );
    await expect(finishPurchase).not.toHaveBeenCalled();

    // The link opens the terms; it doesn't check the box.
    const link = canvas.getByRole("link", { name: "termos de compra" });
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await userEvent.click(link);
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.click(submit);
    await waitFor(() =>
      expect(finishPurchase).toHaveBeenCalledWith({ acceptedTerms: true }, expect.anything()),
    );
  },
};
