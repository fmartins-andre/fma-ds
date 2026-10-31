import { type CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2Icon, UserIcon } from "lucide-react";
import * as React from "react";
import { I18nProvider, Text } from "react-aria-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DateInput } from "../date-field/date-field";
import { DatePicker, DatePickerContent, DatePickerTrigger } from "../date-picker/date-picker";
import { IconTile } from "../icon-tile/icon-tile";
import { Input } from "../input/input";
import { InputGroup, InputGroupAddon } from "../input-group/input-group";
import { Label } from "../label/label";
import { MaskedInput } from "../masked-input/masked-input";
import { RadioCard, RadioGroup, RadioGroupItem } from "../radio-group/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/select";
import { Spinner } from "../spinner/spinner";
import { Switch } from "../switch/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldHelp,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import meta from "./meta.json";

const componentMeta = {
  title: "ds/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal", "responsive"] },
  },
} satisfies Meta<typeof Field>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: "A single field with a label, input, and helper description." } },
  },
  render: (args) => (
    <Field {...args} className="w-80">
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" type="email" placeholder="you@example.com" />
      <FieldDescription>We'll never share your email.</FieldDescription>
    </Field>
  ),
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  parameters: {
    docs: {
      description: {
        story: "The label and description sit beside the control instead of above it.",
      },
    },
  },
  render: (args) => (
    <Field {...args} className="w-96">
      <FieldContent>
        <FieldLabel htmlFor="notifications">Notifications</FieldLabel>
        <FieldDescription>Receive email updates about your account.</FieldDescription>
      </FieldContent>
      <Switch id="notifications" />
    </Field>
  ),
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: { story: "FieldError renders validation messages under an invalid field." },
    },
  },
  render: () => (
    <Field className="w-80" data-invalid="true">
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" defaultValue="a" />
      <FieldError errors={[{ message: "Username must be at least 3 characters." }]} />
    </Field>
  ),
};

/**
 * `FieldHelp` sits beside the label, never inside it, and opens a popover:
 * it works with touch and keyboard, unlike a tooltip. Its label names the subject.
 */
export const WithHelp: Story = {
  render: () => (
    <Field className="w-80">
      <div className="flex items-center gap-1">
        <FieldLabel htmlFor="cib">CIB</FieldLabel>
        <FieldHelp label="More information: CIB">
          The property's code in the Brazilian Real Estate Registry, printed on the property tax
          bill.
        </FieldHelp>
      </div>
      <Input id="cib" placeholder="0000000-0" />
    </Field>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const help = canvas.getByRole("button", { name: "More information: CIB" });
    await userEvent.click(help);
    const dialog = await body.findByRole("dialog", { name: "More information: CIB" });
    await expect(dialog).toHaveTextContent(/Real Estate Registry/);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(help).toHaveFocus());
    // The label still focuses the input: the button isn't inside it.
    await userEvent.click(canvas.getByText("CIB"));
    await expect(canvas.getByRole("textbox", { name: "CIB" })).toHaveFocus();
  },
};

/** Beside a switch's label, in a horizontal field. */
export const WithHelpAndSwitch: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <Field {...args} className="w-96">
      <FieldContent>
        <div className="flex items-center gap-1">
          <FieldLabel htmlFor="personal-operation">Personal operation</FieldLabel>
          <FieldHelp label="More information: Personal operation">
            Marks sales to individuals, which change how the tax is calculated.
          </FieldHelp>
        </div>
        <FieldDescription>The buyer is an individual, not a company.</FieldDescription>
      </FieldContent>
      <Switch id="personal-operation" />
    </Field>
  ),
};

export const FieldSetExample: Story = {
  parameters: {
    docs: {
      description: {
        story: "FieldSet/FieldLegend/FieldGroup group several fields under one heading.",
      },
    },
  },
  render: () => (
    <FieldSet className="w-96">
      <FieldLegend>Address</FieldLegend>
      <FieldGroup>
        <Field>
          <Label htmlFor="street">Street</Label>
          <Input id="street" />
        </Field>
        <FieldSeparator>or</FieldSeparator>
        <Field>
          <Label htmlFor="zip">ZIP code</Label>
          <Input id="zip" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/**
 * Choice cards: few options with an icon and a description.
 *
 * The card is the control itself (`RadioCard`, or `CheckboxCard` for several), filled with
 * `FieldContent`, `FieldTitle` and `FieldDescription`. Wrapping a react-aria control in a
 * `FieldLabel` would nest one label in another.
 */
export const ChoiceCard: Story = {
  render: () => (
    <RadioGroup defaultValue="pj" className="w-[30rem] grid-cols-2">
      <Label className="col-span-2">Tipo de pessoa</Label>
      <RadioCard value="pf">
        <IconTile variant="soft" size="sm">
          <UserIcon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Pessoa física</FieldTitle>
          <FieldDescription>Cadastro pelo CPF.</FieldDescription>
        </FieldContent>
      </RadioCard>
      <RadioCard value="pj">
        <IconTile variant="soft" size="sm">
          <Building2Icon />
        </IconTile>
        <FieldContent>
          <FieldTitle>Pessoa jurídica</FieldTitle>
          <FieldDescription>Cadastro pelo CNPJ.</FieldDescription>
        </FieldContent>
      </RadioCard>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Pessoa física"));
    await expect(canvas.getByRole("radio", { name: /Pessoa física/ })).toBeChecked();
  },
};

type Frequency = "daily" | "weekly" | "monthly" | "yearly";
type Duration = "never" | "count";

const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: "daily", label: "Diariamente" },
  { id: "weekly", label: "Semanalmente" },
  { id: "monthly", label: "Mensalmente" },
  { id: "yearly", label: "Anualmente" },
];

// Day and month names from Intl, not a hard-coded list (1 Jan 2023 was a Sunday).
const WEEKDAYS = Array.from({ length: 7 }, (_, day) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date(2023, 0, 1 + day)),
);
const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(2023, month, 1)),
);
const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, index) => index + 1);

const formatDate = (date: CalendarDate) =>
  new Intl.DateTimeFormat("pt-BR").format(date.toDate(getLocalTimeZone()));
const weekdayOf = (date: CalendarDate) => date.toDate(getLocalTimeZone()).getDay();
const withDay = (date: CalendarDate, day: number) =>
  date.set({ day: Math.min(day, date.calendar.getDaysInMonth(date)) });

type DueDay = { weekday: number; day: number; month: number };

/** The first due date on or after `start`, and the `n`-th after it. */
function dueDate(start: CalendarDate, frequency: Frequency, due: DueDay, n: number) {
  switch (frequency) {
    case "daily":
      return start.add({ days: n });
    case "weekly":
      return start.add({ days: (due.weekday - weekdayOf(start) + 7) % 7, weeks: n });
    case "monthly": {
      const first = withDay(start, due.day).compare(start) < 0 ? start.add({ months: 1 }) : start;
      return withDay(first.add({ months: n }), due.day);
    }
    case "yearly": {
      const inYear = withDay(start.set({ month: due.month, day: 1 }), due.day);
      const first = inYear.compare(start) < 0 ? inYear.add({ years: 1 }) : inYear;
      return withDay(first.add({ years: n }).set({ day: 1 }), due.day);
    }
  }
}

function describeRepetition(frequency: Frequency, due: DueDay) {
  switch (frequency) {
    case "daily":
      return "Todos os dias";
    case "weekly":
      // "sábado" and "domingo" are masculine.
      return `${due.weekday === 0 || due.weekday === 6 ? "Todo" : "Toda"} ${WEEKDAYS[due.weekday]}`;
    case "monthly":
      return `Todo dia ${due.day} de cada mês`;
    case "yearly":
      return `Todo dia ${due.day} de ${MONTHS[due.month - 1]}`;
  }
}

type RecurrenceFieldsProps = {
  /** Asks for the due day apart from the start date, instead of taking the start's. */
  chooseDueDay?: boolean;
  /** The app's API works out the last due date, so the summary waits for it. */
  calculatesOnServer?: boolean;
  /** An existing subscription: how it repeats can't change any more. */
  isLocked?: boolean;
};

/** The recurrence of a subscription or a recurring order, from the registry's primitives. */
function RecurrenceFields({ chooseDueDay, calculatesOnServer, isLocked }: RecurrenceFieldsProps) {
  const id = React.useId();
  const [frequency, setFrequency] = React.useState<Frequency>("monthly");
  const [start, setStart] = React.useState<CalendarDate>(parseDate("2026-11-15"));
  const [chosen, setChosen] = React.useState<DueDay>({ weekday: 1, day: 20, month: 1 });
  const [duration, setDuration] = React.useState<Duration>("count");
  const [count, setCount] = React.useState("12");
  const [isCalculating, setCalculating] = React.useState(false);

  // Without its own question, the due day is the start date's.
  const due: DueDay = chooseDueDay
    ? chosen
    : { weekday: weekdayOf(start), day: start.day, month: start.month };
  const total = Number.parseInt(count, 10) || 0;
  const last = total > 0 ? dueDate(start, frequency, due, total - 1) : undefined;

  // Stands in for the app asking its API for the last due date.
  const lastKey = last?.toString();
  React.useEffect(() => {
    if (!calculatesOnServer || lastKey === undefined) return;
    setCalculating(true);
    const timer = window.setTimeout(() => setCalculating(false), 400);
    return () => window.clearTimeout(timer);
  }, [calculatesOnServer, lastKey]);

  const repetition = describeRepetition(frequency, due);
  let ending: React.ReactNode = "sem data para terminar";
  if (duration === "count") {
    const charges = `${total} ${total === 1 ? "pagamento" : "pagamentos"}`;
    ending = isCalculating ? (
      <>
        {charges} · <Spinner aria-hidden="true" className="inline size-3.5" /> calculando a última
        data…
      </>
    ) : (
      `${charges} · última em ${last ? formatDate(last) : "—"}`
    );
  }

  return (
    <FieldSet className="w-[28rem]">
      <FieldLegend>Recorrência</FieldLegend>
      {isLocked && (
        <FieldDescription>
          Como a assinatura se repete não muda depois de criada; dá para mudar o início.
        </FieldDescription>
      )}
      <FieldGroup>
        <RadioGroup
          value={frequency}
          onChange={(value) => setFrequency(value as Frequency)}
          isDisabled={isLocked}
          orientation="horizontal"
          className="flex flex-wrap gap-x-4 gap-y-2"
        >
          <Label className="w-full">Repetir</Label>
          {FREQUENCIES.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
              <Label htmlFor={`${id}-${option.id}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            value={start}
            onChange={(value) => value && setStart(value)}
            minValue={today(getLocalTimeZone())}
          >
            <Label>Início</Label>
            <InputGroup>
              <DateInput />
              <InputGroupAddon align="inline-end">
                <DatePickerTrigger />
              </InputGroupAddon>
            </InputGroup>
            {!chooseDueDay && frequency !== "daily" && (
              <Text slot="description" className="text-sm text-muted-foreground">
                O vencimento segue o início: {repetition.toLowerCase()}.
              </Text>
            )}
            <DatePickerContent />
          </DatePicker>

          {chooseDueDay && frequency === "weekly" && (
            <Select
              selectedKey={chosen.weekday}
              onSelectionChange={(key) => setChosen({ ...chosen, weekday: Number(key) })}
              className="w-full"
            >
              <Label>Dia do vencimento</Label>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((name, weekday) => (
                  <SelectItem key={name} id={weekday}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {chooseDueDay && (frequency === "monthly" || frequency === "yearly") && (
            <div className={frequency === "yearly" ? "col-span-2 flex gap-2" : "flex"}>
              <Select
                selectedKey={chosen.day}
                onSelectionChange={(key) => setChosen({ ...chosen, day: Number(key) })}
                className={frequency === "yearly" ? "w-36" : "w-full"}
              >
                <Label>Dia do vencimento</Label>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_MONTH.map((day) => (
                    <SelectItem key={day} id={day}>
                      {String(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {frequency === "yearly" && (
                <Select
                  selectedKey={chosen.month}
                  onSelectionChange={(key) => setChosen({ ...chosen, month: Number(key) })}
                  className="w-40"
                >
                  <Label>Mês</Label>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((name, index) => (
                      <SelectItem key={name} id={index + 1}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <RadioGroup
          value={duration}
          onChange={(value) => setDuration(value as Duration)}
          isDisabled={isLocked}
          orientation="horizontal"
          className="flex flex-wrap gap-x-4 gap-y-2"
        >
          <Label className="w-full">Duração</Label>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="never" id={`${id}-never`} />
            <Label htmlFor={`${id}-never`} className="font-normal">
              Sem data para terminar
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="count" id={`${id}-count`} />
            <Label htmlFor={`${id}-count`} className="font-normal">
              Número de pagamentos
            </Label>
          </div>
        </RadioGroup>

        {duration === "count" && (
          <Field className="w-32">
            <FieldLabel htmlFor={`${id}-charges`}>Pagamentos</FieldLabel>
            <MaskedInput
              id={`${id}-charges`}
              mask={{
                type: "decimal",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                min: 1,
                max: 999,
              }}
              value={count}
              onValueChange={setCount}
              disabled={isLocked}
            />
          </Field>
        )}

        <p role="status" className="text-sm text-muted-foreground">
          {repetition} · {ending}
        </p>
      </FieldGroup>
    </FieldSet>
  );
}

const ptBR = (Story: React.ComponentType) => (
  <I18nProvider locale="pt-BR">
    <Story />
  </I18nProvider>
);

/**
 * How a subscription or recurring order repeats: how often, from when, and for how long, with
 * a summary that says it in words — "Todo dia 15 de cada mês · 12 pagamentos · última em
 * 15/10/2027" — announced as it changes.
 *
 * Here the due day is the start date's (the start drives the summary) and the last date is
 * worked out in the browser. How the app stores it (enums, days) stays in the app.
 */
export const Recurrence: Story = {
  decorators: [ptBR],
  render: () => <RecurrenceFields />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent(
      "Todo dia 15 de cada mês · 12 pagamentos · última em 15/10/2027",
    );
    await expect(
      canvas.getByText("O vencimento segue o início: todo dia 15 de cada mês."),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("radio", { name: "Semanalmente" }));
    // 15/11/2026 is a Sunday: "domingo" takes "Todo".
    await expect(status).toHaveTextContent("Todo domingo · 12 pagamentos · última em 31/01/2027");

    await userEvent.click(canvas.getByRole("radio", { name: "Sem data para terminar" }));
    await expect(canvas.queryByRole("textbox", { name: "Pagamentos" })).not.toBeInTheDocument();
    await expect(status).toHaveTextContent("Todo domingo · sem data para terminar");
  },
};

/**
 * The due day asked apart from the start date: the question follows the frequency (a weekday,
 * a day of the month, a day and month) and goes away for daily. The last date comes from the
 * app's API, so the summary says it's being worked out meanwhile.
 */
export const RecurrenceWithDueDay: Story = {
  decorators: [ptBR],
  render: () => <RecurrenceFields chooseDueDay calculatesOnServer />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("calculando a última data…");
    await waitFor(() =>
      expect(status).toHaveTextContent(
        "Todo dia 20 de cada mês · 12 pagamentos · última em 20/10/2027",
      ),
    );

    await userEvent.click(canvas.getByRole("radio", { name: "Anualmente" }));
    await expect(canvas.getByRole("button", { name: /Mês/ })).toBeVisible();
    await waitFor(() =>
      expect(status).toHaveTextContent(
        "Todo dia 20 de janeiro · 12 pagamentos · última em 20/01/2038",
      ),
    );

    await userEvent.click(canvas.getByRole("radio", { name: "Diariamente" }));
    await expect(
      canvas.queryByRole("button", { name: /Dia do vencimento/ }),
    ).not.toBeInTheDocument();
  },
};

/** Editing an existing subscription: how it repeats is locked, and the reason is in the text. */
export const RecurrenceLocked: Story = {
  decorators: [ptBR],
  render: () => <RecurrenceFields chooseDueDay isLocked />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Mensalmente" })).toBeDisabled();
    await expect(canvas.getByRole("radio", { name: "Número de pagamentos" })).toBeDisabled();
    await expect(
      canvas.getByText(/não muda depois de criada; dá para mudar o início/),
    ).toBeVisible();
  },
};
