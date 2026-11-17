import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CircleCheck, Info, Sparkles, TriangleAlert } from "lucide-react";
import { expect, within } from "storybook/test";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/card/card";
import { TONES } from "@/lib/tone";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import meta from "./meta.json";

const ALERT_VARIANTS = ["solid", "soft", "outline"] as const;

const componentMeta = {
  title: "ds/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    variant: { control: "radio", options: ALERT_VARIANTS },
    tone: { control: "select", options: TONES },
  },
  args: {
    variant: "outline",
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: "The default alert: outline in the neutral tone." } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("data-variant", "outline");
    await expect(alert).toHaveAttribute("data-tone", "neutral");
  },
};

/**
 * `variant` sets the surface: `solid`, `soft` or `outline` (the default). Without a `tone`,
 * solid is primary and the quieter ones are neutral. The box is the same in all three.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="solid">
        <Info />
        <AlertTitle>Solid</AlertTitle>
        <AlertDescription>The tone fills the surface.</AlertDescription>
      </Alert>
      <Alert variant="soft">
        <Info />
        <AlertTitle>Soft</AlertTitle>
        <AlertDescription>A light tint of the tone, with no border.</AlertDescription>
      </Alert>
      <Alert variant="outline">
        <Info />
        <AlertTitle>Outline</AlertTitle>
        <AlertDescription>A border and a title in the tone.</AlertDescription>
      </Alert>
    </div>
  ),
  play: async ({ canvas }) => {
    const alerts = canvas.getAllByRole("alert");
    await expect(alerts.map((alert) => alert.dataset.variant)).toEqual([
      "solid",
      "soft",
      "outline",
    ]);
    await expect(alerts.map((alert) => alert.dataset.tone)).toEqual([
      "primary",
      "neutral",
      "neutral",
    ]);
    const heights = alerts.map((alert) => alert.getBoundingClientRect().height);
    await expect(new Set(heights).size).toBe(1);
  },
};

/** `tone` picks the color of any variant: the seven tones in each. */
export const Tones: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-3">
      {ALERT_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          {TONES.map((tone) => (
            <Alert key={tone} variant={variant} tone={tone}>
              <Info />
              <AlertTitle>{tone}</AlertTitle>
              <AlertDescription>{variant}</AlertDescription>
            </Alert>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Status alerts: a `soft` surface in the status tone, with a matching icon. */
export const Status: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="soft" tone="info">
        <Info />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>A new version is available.</AlertDescription>
      </Alert>
      <Alert variant="soft" tone="success">
        <CircleCheck />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </Alert>
      <Alert variant="soft" tone="warning">
        <TriangleAlert />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Your trial ends in 3 days.</AlertDescription>
      </Alert>
      <Alert variant="soft" tone="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * An announcement or promo in the theme's second identity color: new features,
 * offers. Not for status. Same as primary unless the brand has a second color.
 */
export const Brand: Story = {
  render: () => (
    <Alert variant="solid" tone="brand">
      <Sparkles />
      <AlertTitle>Validação com IA</AlertTitle>
      <AlertDescription>Confira os dados do pedido antes de registrar.</AlertDescription>
    </Alert>
  ),
};

export const WithIcon: Story = {
  parameters: {
    docs: { description: { story: "A leading icon placed before the title." } },
  },
  render: (args) => (
    <Alert {...args}>
      <Info />
      <AlertTitle>Info</AlertTitle>
      <AlertDescription>
        Your profile is visible to other members of your organization.
      </AlertDescription>
    </Alert>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: { story: "AlertAction adds an inline control (link/button) to the alert." },
    },
  },
  render: (args) => (
    <Alert {...args}>
      <Info />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>Version 2.0 is ready to install. Restart to apply.</AlertDescription>
      <AlertAction>
        <button type="button" className="text-sm font-medium underline underline-offset-4">
          Restart now
        </button>
      </AlertAction>
    </Alert>
  ),
};

/**
 * Inside a `Card`: both alerts are drawn over the page background, not the card's: outline
 * keeps the page background and the soft tint is mixed with it, so on a card of a different
 * color each reads as its own surface.
 */
export const InsideCard: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Contrato</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Alert variant="soft" tone="warning">
          <TriangleAlert />
          <AlertTitle>Renovação pendente</AlertTitle>
          <AlertDescription>O contrato vence em 5 dias.</AlertDescription>
        </Alert>
        <Alert variant="outline" tone="warning">
          <TriangleAlert />
          <AlertTitle>Renovação pendente</AlertTitle>
          <AlertDescription>O contrato vence em 5 dias.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  ),
};

/**
 * A soft alert keeps its own surface: the tint is an opaque mix with the page background,
 * so a colored container behind it doesn't bleed through.
 */
export const ShouldNotBlendWithTheSurfaceBehind: Story = {
  tags: ["!autodocs"],
  args: { variant: "soft", tone: "warning" },
  render: (args) => (
    <div className="grid gap-4">
      <Alert {...args}>
        <TriangleAlert />
        <AlertTitle>On the page</AlertTitle>
      </Alert>
      <div className="bg-primary p-4">
        <Alert {...args}>
          <TriangleAlert />
          <AlertTitle>On a colored panel</AlertTitle>
        </Alert>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const [onPage, onPanel] = canvas.getAllByRole("alert");
    if (!onPage || !onPanel) throw new Error("missing alerts");
    const surface = getComputedStyle(onPanel).backgroundColor;
    // Opaque: no alpha channel in the computed color.
    await expect(surface).not.toMatch(/rgba|\/\s*0?\.\d|transparent/);
    await expect(surface).toBe(getComputedStyle(onPage).backgroundColor);
  },
};
