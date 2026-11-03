import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import meta from "./meta.json";
import { Meter, MeterLabel, MeterValue } from "./meter";

const componentMeta = {
  title: "ds/Meter",
  component: Meter,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
  },
  args: {
    value: 40,
  },
} satisfies Meta<typeof Meter>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: "MeterLabel names the quantity; MeterValue shows it." } },
  },
  render: (args) => (
    <Meter {...args} className="w-64">
      <MeterLabel>Storage</MeterLabel>
      <MeterValue />
    </Meter>
  ),
  play: async ({ canvas }) => {
    const meter = canvas.getByRole("meter", { name: "Storage" });
    await expect(meter).toHaveAttribute("aria-valuenow", "40");
    await expect(canvas.getByText("40%")).toBeInTheDocument();
  },
};

export const Quota: Story = {
  args: { value: 280, maxValue: 400, valueLabel: "280 of 400" },
  parameters: {
    docs: {
      description: {
        story: "`maxValue` sets the limit and `valueLabel` says it in the app's words.",
      },
    },
  },
  render: (args) => (
    <Meter {...args} className="w-64">
      <MeterLabel>Invoices this month</MeterLabel>
      <MeterValue />
    </Meter>
  ),
  play: async ({ canvas }) => {
    const meter = canvas.getByRole("meter", { name: "Invoices this month" });
    await expect(meter).toHaveAttribute("aria-valuetext", "280 of 400");
    await expect(canvas.getByText("280 of 400")).toBeInTheDocument();
  },
};

export const Thresholds: Story = {
  parameters: {
    docs: {
      description: {
        story: "`warningAt` and `criticalAt` are percentages: the fill turns amber, then red.",
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <Meter value={40} warningAt={75} criticalAt={90}>
        <MeterLabel>Seats</MeterLabel>
        <MeterValue />
      </Meter>
      <Meter value={80} warningAt={75} criticalAt={90}>
        <MeterLabel>Storage</MeterLabel>
        <MeterValue />
      </Meter>
      <Meter value={95} warningAt={75} criticalAt={90}>
        <MeterLabel>API calls</MeterLabel>
        <MeterValue />
      </Meter>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const levels = [...canvasElement.querySelectorAll("[data-slot=meter-indicator]")].map((el) =>
      el.getAttribute("data-level"),
    );
    await expect(levels).toEqual(["normal", "warning", "critical"]);
  },
};

export const CustomColor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`--meter-fill` and `--meter-track` recolor it, e.g. on a sidebar or a brand surface.",
      },
    },
  },
  render: (args) => (
    <Meter {...args} className="w-64 [--meter-fill:var(--color-brand)]">
      <MeterLabel>Credits</MeterLabel>
      <MeterValue />
    </Meter>
  ),
};
