import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { TONES, VARIANTS } from "@/lib/tone";
import { Badge } from "./badge";
import meta from "./meta.json";

const SIZES = ["xs", "sm", "default", "lg", "xl"] as const;

const componentMeta = {
  title: "ds/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    tone: { control: "select", options: TONES },
    size: { control: "radio", options: SIZES },
    radius: { control: "radio", options: ["default", "full"] },
  },
  args: {
    variant: "solid",
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The four variants in their default tone: solid is primary, the quieter ones are neutral. ghost is a dot before plain text, with no surface.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Badge {...args} variant="solid">
        Solid
      </Badge>
      <Badge {...args} variant="soft">
        Soft
      </Badge>
      <Badge {...args} variant="outline">
        Outline
      </Badge>
      <Badge {...args} variant="ghost">
        Ghost
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Solid")).toHaveAttribute("data-tone", "primary");
    for (const name of ["Soft", "Outline", "Ghost"]) {
      expect(canvas.getByText(name)).toHaveAttribute("data-tone", "neutral");
    }
  },
};

export const Tones: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'tone picks the color of any variant: the seven tones in each. brand is the theme\'s second identity color, for labels ("New", "Pro"), never for status.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap gap-2">
          {TONES.map((tone) => (
            <Badge {...args} key={tone} variant={variant} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * `ghost` puts a colored dot before plain text, with no surface — for select
 * items, dense lists and table cells. The text carries the status, not the color.
 */
export const Dot: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-1">
      <Badge {...args} variant="ghost" tone="success">
        Ativo
      </Badge>
      <Badge {...args} variant="ghost" tone="warning">
        Próximo do vencimento
      </Badge>
      <Badge {...args} variant="ghost" tone="destructive">
        Bloqueado
      </Badge>
      <Badge {...args} variant="ghost" tone="info">
        Em processamento
      </Badge>
      <Badge {...args} variant="ghost" tone="primary">
        Novo
      </Badge>
      <Badge {...args} variant="ghost" tone="neutral">
        Cancelado
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      {SIZES.map((size) => (
        <Badge {...args} key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

export const Radius: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <Badge {...args} radius="default">
        default
      </Badge>
      <Badge {...args} radius="full">
        full
      </Badge>
    </div>
  ),
};

export const AsLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A badge is not interactive. When you render it as a link, add your own hover and focus styling.",
      },
    },
  },
  render: (args) => (
    <Badge
      {...args}
      className="hover:bg-accent"
      render={(props) => <a href="https://example.com" {...props} />}
    >
      Clickable
    </Badge>
  ),
};
