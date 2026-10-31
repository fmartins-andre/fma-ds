import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhoneIcon } from "lucide-react";
import * as React from "react";
import { FieldError, Text, TextField } from "react-aria-components";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import {
  Field,
  FieldDescription,
  FieldError as FieldErrorText,
  FieldLabel,
} from "@/core/field/field";
import { Input } from "@/core/input/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/core/input-group/input-group";
import { Label } from "@/core/label/label";
import { Spinner } from "@/core/spinner/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/core/toggle-group/toggle-group";
import { useMask } from "@/hooks/use-mask";
import { cpfMaskRemover, makeStableMaskitoOptions } from "@/lib/input-masks";
import { MaskedInput } from "./masked-input";
import meta from "./meta.json";

const PRESETS = [
  "cpf",
  "cnpj",
  "cpf-cnpj",
  "cep",
  "phone",
  "credit-card",
  "date",
  "time",
  "date-time",
  "date-range",
  "decimal",
] as const;

const componentMeta = {
  title: "ds/MaskedInput",
  component: MaskedInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    mask: { control: "select", options: PRESETS },
  },
  args: {
    mask: "cpf",
    "aria-label": "CPF",
    className: "w-64",
  },
} satisfies Meta<typeof MaskedInput>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

// A preset story's play function: types `typed` and expects `expected`.
function typesAs(typed: string, expected: string): Story["play"] {
  return async ({ canvas, args }) => {
    const input = canvas.getByRole("textbox", { name: args["aria-label"] });
    await userEvent.type(input, typed);
    await expect(input).toHaveValue(expected);
  };
}

export const Default: Story = {
  play: typesAs("12345678901", "123.456.789-01"),
};

export const Cnpj: Story = {
  args: { mask: "cnpj", "aria-label": "CNPJ" },
  play: typesAs("12345678000199", "12.345.678/0001-99"),
};

/** Switches from CPF to CNPJ formatting as soon as digits go past the CPF length. */
export const CpfOrCnpj: Story = {
  args: { mask: "cpf-cnpj", "aria-label": "CPF or CNPJ", placeholder: "CPF ou CNPJ" },
  play: typesAs("12345678000199", "12.345.678/0001-99"),
};

/** Mobile and landline numbers share one preset. Opens the phone keypad on mobile. */
export const Phone: Story = {
  args: { mask: "phone", "aria-label": "Phone" },
  play: typesAs("1133224455", "(11) 3322-4455"),
};

export const Cep: Story = {
  args: { mask: "cep", "aria-label": "CEP" },
  play: typesAs("01001000", "01001-000"),
};

export const CreditCard: Story = {
  args: { mask: "credit-card", "aria-label": "Card number" },
  play: typesAs("1234567890123456", "1234 5678 9012 3456"),
};

/** The card mask follows the issuer: Amex 4-6-5, up to 19 digits for Visa. */
export const ShouldFollowCardIssuer: Story = {
  tags: ["!autodocs"],
  args: { mask: "credit-card", "aria-label": "Card number" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Card number" });
    await userEvent.type(input, "3782");
    await expect(input).toHaveValue("3782 ______ _____");
    await userEvent.type(input, "82246310005");
    await expect(input).toHaveValue("3782 822463 10005");
    await userEvent.type(input, "{backspace}{backspace}");
    await expect(input).toHaveValue("3782 822463 100__");

    await userEvent.clear(input);
    await userEvent.type(input, "41111111111111111");
    await expect(input).toHaveValue("4111 1111 1111 11111_");
    await userEvent.tab();
    await expect(input).toHaveValue("4111 1111 1111 11111");
  },
};

export const Decimal: Story = {
  args: { mask: "decimal", "aria-label": "Amount" },
  play: typesAs("123456", "123.456,00"),
};

/**
 * Parameterized presets are objects. They're compared by value, so writing
 * the object inline is fine.
 */
export const Currency: Story = {
  args: { mask: { type: "decimal", prefix: "R$ " }, "aria-label": "Price" },
  play: typesAs("123456", "R$ 123.456,00"),
};

export const DateMask: Story = {
  args: { mask: "date", "aria-label": "Date" },
  play: typesAs("31122024", "31/12/2024"),
};

export const MonthYear: Story = {
  args: { mask: { type: "date", mode: "mm/yyyy" }, "aria-label": "Expiry" },
  play: typesAs("122024", "12/2024"),
};

/** Card expiry: two-digit year, read as 20yy in the raw value ("2030-06"). */
export const CardExpiry: Story = {
  args: { mask: { type: "date", mode: "mm/yy" }, "aria-label": "Validade" },
  play: typesAs("0630", "06/30"),
};

export const Time: Story = {
  args: { mask: "time", "aria-label": "Time" },
  play: typesAs("0930", "09:30"),
};

export const DateTime: Story = {
  args: { mask: "date-time", "aria-label": "Date and time" },
  play: typesAs("311220240930", "31/12/2024, 09:30"),
};

/** The separator is a non-breaking space, an en dash and another non-breaking space. */
export const DateRange: Story = {
  args: { mask: "date-range", "aria-label": "Period", className: "w-80" },
  play: typesAs("0101202431122024", "01/01/2024 – 31/12/2024"),
};

// Mercosul license plate: three letters, a digit, a letter or digit, two digits.
const plateMask = makeStableMaskitoOptions({
  mask: [/[A-Za-z]/, /[A-Za-z]/, /[A-Za-z]/, "-", /\d/, /[A-Za-z0-9]/, /\d/, /\d/],
  postprocessors: [({ value, selection }) => ({ value: value.toUpperCase(), selection })],
});

/**
 * Any Maskito options work too. Declare them at module scope (or memoize them):
 * new options on every render reset the mask. Their raw value is the masked text.
 */
export const CustomMask: Story = {
  args: { mask: plateMask, "aria-label": "License plate", placeholder: "AAA-0A00" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "License plate" });
    await userEvent.type(input, "abc1d23");
    await expect(input).toHaveValue("ABC-1D23");
  },
};

/** `onValueChange` reports the raw value (digits for documents), with the masked text alongside. */
export const RawValue: Story = {
  args: { onValueChange: fn() },
  render: function Render({ onValueChange, ...args }) {
    const [raw, setRaw] = React.useState("");
    return (
      <div className="flex flex-col gap-2">
        <MaskedInput
          {...args}
          onValueChange={(value, masked) => {
            setRaw(value);
            onValueChange?.(value, masked);
          }}
        />
        <output className="text-sm text-muted-foreground">Raw: {raw || "—"}</output>
      </div>
    );
  },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "CPF" });
    await userEvent.type(input, "12345678901");
    await expect(input).toHaveValue("123.456.789-01");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("12345678901", "123.456.789-01");
    await expect(canvas.getByText("Raw: 12345678901")).toBeInTheDocument();
  },
};

/**
 * The parent can store just the raw value and pass it back as `value`. Values set from
 * outside (raw or masked) are formatted; the input's own edits are left to Maskito.
 */
export const Controlled: Story = {
  render: function Render(args) {
    const [cpf, setCpf] = React.useState("");
    return (
      <div className="flex flex-col items-start gap-2">
        <MaskedInput {...args} value={cpf} onValueChange={setCpf} />
        <button type="button" className="text-sm underline" onClick={() => setCpf("98765432100")}>
          Fill
        </button>
        <output data-testid="raw">{cpf}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "CPF" });
    // Typing with a raw-controlled value keeps Maskito's placeholder and caret.
    await userEvent.type(input, "123");
    await expect(input).toHaveValue("123.___.___-__");
    await expect(canvas.getByTestId("raw")).toHaveTextContent("123");

    await userEvent.click(canvas.getByRole("button", { name: "Fill" }));
    await waitFor(() => expect(input).toHaveValue("987.654.321-00"));
  },
};

/**
 * Inside a react-aria `TextField` the label, description, error message and validation
 * are wired as usual. The field's value is the masked text, so validate its raw form.
 */
export const InTextField: Story = {
  render: () => (
    <TextField
      isRequired
      validate={(value) => (cpfMaskRemover(value).length === 11 ? null : "Enter all 11 digits.")}
      className="flex w-64 flex-col gap-1.5"
    >
      <Label>CPF</Label>
      <MaskedInput mask="cpf" />
      <Text slot="description" className="text-sm text-muted-foreground">
        Only digits are stored.
      </Text>
      <FieldError className="text-sm text-destructive" />
    </TextField>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText(/CPF/);
    await expect(input).toBeRequired();
    await expect(input).toHaveAccessibleDescription("Only digits are stored.");

    await userEvent.type(input, "123456");
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    await expect(canvas.getByText("Enter all 11 digits.")).toBeInTheDocument();

    await userEvent.click(input);
    await userEvent.type(input, "78901");
    await userEvent.tab();
    await expect(input).toHaveValue("123.456.789-01");
    await waitFor(() => expect(input).not.toHaveAttribute("aria-invalid"));
  },
};

function PhoneGroup() {
  const phone = useMask({ mask: "phone" });
  return (
    <InputGroup>
      <InputGroupAddon>
        <PhoneIcon />
      </InputGroupAddon>
      <InputGroupInput {...phone.inputProps} aria-label="Phone" />
    </InputGroup>
  );
}

function PriceGroup() {
  const price = useMask({ mask: "decimal" });
  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput {...price.inputProps} aria-label="Amount" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>BRL</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

/**
 * For other inputs, `useMask` returns the props to spread: here onto `InputGroupInput`,
 * which keeps the group's borderless control styling and focus ring.
 */
export const WithInputGroup: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <PhoneGroup />
      <PriceGroup />
    </div>
  ),
  play: async ({ canvas }) => {
    const phone = canvas.getByRole("textbox", { name: "Phone" });
    await expect(phone).toHaveAttribute("inputmode", "tel");
    await userEvent.type(phone, "11987654321");
    await expect(phone).toHaveValue("(11) 98765-4321");

    // Clicking an addon focuses the masked input.
    const amount = canvas.getByRole("textbox", { name: "Amount" });
    await userEvent.click(canvas.getByText("BRL"));
    await expect(amount).toHaveFocus();
    await userEvent.keyboard("123456");
    await expect(amount).toHaveValue("123.456,00");
  },
};

type DiscountFormat = "amount" | "percent";

const ORDER_AMOUNT = 1200;
const brl = (amount: number) =>
  amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * A value that can be an amount or a percentage, like a discount: one field, with the format as
 * a segmented `R$ | %` addon.
 *
 * - **Switching the format** clears the value (10 isn't the same discount in R$ and in %) and
 *   moves focus back to the input.
 * - **The label** names the format, and the description shows the equivalent amount.
 * - **Percent** stops at 100.
 *
 * Format and value stay two fields in the app's form (one `Controller` each).
 */
export const AmountOrPercent: Story = {
  render: function AmountOrPercentExample() {
    const [format, setFormat] = React.useState<DiscountFormat>("percent");
    const [value, setValue] = React.useState("");
    const isPercent = format === "percent";
    const discount = useMask({
      mask: isPercent
        ? { type: "decimal", postfix: " %", max: 100 }
        : { type: "decimal", prefix: "R$ ", max: ORDER_AMOUNT },
      value,
      onValueChange: setValue,
    });

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const maskRef = discount.inputProps.ref;
    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        maskRef(node);
        inputRef.current = node;
      },
      [maskRef],
    );

    const number = Number.parseFloat(value) || 0;
    const equivalent = isPercent ? (ORDER_AMOUNT * number) / 100 : number;

    return (
      <Field className="w-72">
        <FieldLabel htmlFor="discount">Desconto ({isPercent ? "%" : "R$"})</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <ToggleGroup
              aria-label="Formato do desconto"
              selectionMode="single"
              disallowEmptySelection
              size="sm"
              selectedKeys={[format]}
              onSelectionChange={(keys) => {
                const [next] = keys;
                if (next === undefined || next === format) return;
                setFormat(next as DiscountFormat);
                setValue("");
                inputRef.current?.focus();
              }}
            >
              <ToggleGroupItem id="amount">R$</ToggleGroupItem>
              <ToggleGroupItem id="percent">%</ToggleGroupItem>
            </ToggleGroup>
          </InputGroupAddon>
          <InputGroupInput
            {...discount.inputProps}
            ref={setRef}
            id="discount"
            aria-describedby="discount-equivalent"
          />
        </InputGroup>
        <FieldDescription id="discount-equivalent">
          = {brl(equivalent)} de {brl(ORDER_AMOUNT)}
        </FieldDescription>
      </Field>
    );
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Desconto (%)" });
    // Percent stops at 100.
    await userEvent.type(input, "150");
    await expect(input).toHaveValue("100,00 %");
    await userEvent.clear(input);
    await userEvent.type(input, "10");
    await expect(input).toHaveValue("10,00 %");
    await expect(input).toHaveAccessibleDescription(/^= R\$\s120,00 de R\$\s1\.200,00$/);

    // Another format clears the value and gives the input the focus back.
    await userEvent.click(canvas.getByRole("radio", { name: "R$" }));
    const amount = canvas.getByRole("textbox", { name: "Desconto (R$)" });
    await expect(amount).toHaveValue("");
    await expect(amount).toHaveFocus();
    await userEvent.keyboard("50");
    await expect(amount).toHaveValue("R$ 50,00");
    await expect(amount).toHaveAccessibleDescription(/^= R\$\s50,00 de R\$\s1\.200,00$/);
  },
};

type Address = { street: string; district: string; city: string; state: string };

const ADDRESSES: Record<string, Address> = {
  "01310100": {
    street: "Avenida Paulista",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  },
  "20040002": {
    street: "Avenida Rio Branco",
    district: "Centro",
    city: "Rio de Janeiro",
    state: "RJ",
  },
};

/** Stands in for the app's lookup (ViaCEP, BrasilAPI…): `null` when the CEP doesn't exist. */
async function lookupCep(cep: string): Promise<Address | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return ADDRESSES[cep] ?? null;
}

const EMPTY_ADDRESS: Address = { street: "", district: "", city: "", state: "" };

/**
 * A field that looks something up and fills others: CEP → address here, CNPJ → company name the
 * same way.
 *
 * - **When**: as soon as the mask is complete (8 digits), not on blur; typing another CEP looks
 *   it up again.
 * - **While**: a spinner in the group and `aria-busy`; the field stays editable and nothing
 *   blocks the screen.
 * - **Found**: the result overwrites the fields it fills, is announced, and focus moves to the
 *   first field it doesn't fill (Número).
 * - **Not found**: an error on the CEP; every field stays free to fill by hand.
 *
 * The lookup itself stays in the app.
 */
export const Lookup: Story = {
  render: function LookupExample() {
    const [address, setAddress] = React.useState<Address>(EMPTY_ADDRESS);
    const [number, setNumber] = React.useState("");
    const [status, setStatus] = React.useState<"idle" | "loading" | "found" | "not-found">("idle");
    const numberRef = React.useRef<HTMLInputElement>(null);
    const lastLookup = React.useRef(0);

    async function handleCepChange(raw: string) {
      if (raw.length < 8) {
        setStatus("idle");
        return;
      }
      // Only the latest lookup counts when the CEP changes mid-request.
      const lookup = ++lastLookup.current;
      setStatus("loading");
      const found = await lookupCep(raw);
      if (lookup !== lastLookup.current) return;
      if (!found) {
        setStatus("not-found");
        return;
      }
      setAddress(found);
      setStatus("found");
      numberRef.current?.focus();
    }

    const cep = useMask({ mask: "cep", onValueChange: handleCepChange });
    const setField = (field: keyof Address) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((current) => ({ ...current, [field]: event.target.value }));

    return (
      <div className="grid w-96 grid-cols-6 gap-4">
        <Field className="col-span-3" data-invalid={status === "not-found"}>
          <FieldLabel htmlFor="lookup-cep">CEP</FieldLabel>
          <InputGroup aria-busy={status === "loading"}>
            <InputGroupInput
              {...cep.inputProps}
              id="lookup-cep"
              aria-invalid={status === "not-found"}
              aria-describedby={status === "not-found" ? "lookup-cep-error" : undefined}
            />
            {status === "loading" && (
              <InputGroupAddon align="inline-end">
                <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
              </InputGroupAddon>
            )}
          </InputGroup>
          {status === "not-found" && (
            <FieldErrorText id="lookup-cep-error">
              CEP não encontrado. Preencha o endereço.
            </FieldErrorText>
          )}
        </Field>
        <p role="status" className="col-span-6 -mt-2 min-h-5 text-sm text-muted-foreground">
          {status === "found" &&
            `Endereço encontrado: ${address.street}, ${address.district}, ${address.city}/${address.state}`}
        </p>
        <Field className="col-span-6">
          <FieldLabel htmlFor="lookup-street">Rua</FieldLabel>
          <Input id="lookup-street" value={address.street} onChange={setField("street")} />
        </Field>
        <Field className="col-span-2">
          <FieldLabel htmlFor="lookup-number">Número</FieldLabel>
          <Input
            id="lookup-number"
            ref={numberRef}
            value={number}
            onChange={(event) => setNumber(event.target.value)}
          />
        </Field>
        <Field className="col-span-4">
          <FieldLabel htmlFor="lookup-district">Bairro</FieldLabel>
          <Input id="lookup-district" value={address.district} onChange={setField("district")} />
        </Field>
        <Field className="col-span-4">
          <FieldLabel htmlFor="lookup-city">Cidade</FieldLabel>
          <Input id="lookup-city" value={address.city} onChange={setField("city")} />
        </Field>
        <Field className="col-span-2">
          <FieldLabel htmlFor="lookup-state">UF</FieldLabel>
          <Input id="lookup-state" value={address.state} onChange={setField("state")} />
        </Field>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const cep = canvas.getByRole("textbox", { name: "CEP" });
    const street = canvas.getByRole("textbox", { name: "Rua" });

    await userEvent.type(cep, "01310100");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Endereço encontrado: Avenida Paulista, Bela Vista, São Paulo/SP",
      ),
    );
    await expect(street).toHaveValue("Avenida Paulista");
    await expect(canvas.getByRole("textbox", { name: "Número" })).toHaveFocus();

    // A hand edit is overwritten by the next lookup.
    await userEvent.clear(street);
    await userEvent.type(street, "Rua digitada");
    await userEvent.clear(cep);
    await userEvent.type(cep, "20040002");
    await waitFor(() => expect(street).toHaveValue("Avenida Rio Branco"));
    await expect(canvas.getByRole("textbox", { name: "UF" })).toHaveValue("RJ");

    // Not found: an error on the CEP, the fields stay as they were.
    await userEvent.clear(cep);
    await userEvent.type(cep, "99999999");
    await expect(await canvas.findByText("CEP não encontrado. Preencha o endereço.")).toBeVisible();
    await expect(cep).toHaveAttribute("aria-invalid", "true");
    await expect(street).toHaveValue("Avenida Rio Branco");
  },
};
