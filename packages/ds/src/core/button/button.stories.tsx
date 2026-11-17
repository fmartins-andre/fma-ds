import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TONES, VARIANTS } from "@/lib/tone";
import { Button, LinkButton } from "./button";
import meta from "./meta.json";

const componentMeta = {
  title: "ds/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    // meta.json (packages/ds/src/core/button/meta.json) is the single source
    // of truth for this description — it also feeds registry.json. Don't
    // duplicate the prose here.
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    tone: { control: "select", options: TONES },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    isDisabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "solid",
    size: "default",
    onPress: fn(),
  },
} satisfies Meta<typeof Button>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The four variants in their default tone: solid is primary, the quieter ones are neutral.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args} variant="solid">
        Solid
      </Button>
      <Button {...args} variant="soft">
        Soft
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: "Solid" })).toHaveAttribute("data-tone", "primary");
    for (const name of ["Soft", "Outline", "Ghost"]) {
      expect(canvas.getByRole("button", { name })).toHaveAttribute("data-tone", "neutral");
    }
  },
};

export const Tones: Story = {
  parameters: {
    docs: {
      description: {
        story: "tone picks the color of any variant: the seven tones in solid and soft.",
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button {...args} tone="brand">
          Brand
        </Button>
        <Button {...args} tone="primary">
          Primary
        </Button>
        <Button {...args} tone="neutral">
          Neutral
        </Button>
        <Button {...args} tone="success">
          Success
        </Button>
        <Button {...args} tone="warning">
          Warning
        </Button>
        <Button {...args} tone="info">
          Info
        </Button>
        <Button {...args} tone="destructive">
          Destructive
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button {...args} variant="soft" tone="brand">
          Brand
        </Button>
        <Button {...args} variant="soft" tone="primary">
          Primary
        </Button>
        <Button {...args} variant="soft" tone="neutral">
          Neutral
        </Button>
        <Button {...args} variant="soft" tone="success">
          Success
        </Button>
        <Button {...args} variant="soft" tone="warning">
          Warning
        </Button>
        <Button {...args} variant="soft" tone="info">
          Info
        </Button>
        <Button {...args} variant="soft" tone="destructive">
          Destructive
        </Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: { description: { story: "The size scale, from xs up to lg." } },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {(["xs", "sm", "default", "lg"] as const).map((size) => (
        <Button {...args} key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  parameters: {
    docs: {
      description: {
        story: "isDisabled blocks pointer and keyboard interaction — verified here, not disabled.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    // pointer-events: none (disabled:pointer-events-none) is real CSS here —
    // bypass Testing Library's clickability check, same as clicking would if
    // a user's mouse could somehow still land on it.
    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const Interactive: Story = {
  parameters: {
    docs: { description: { story: "Verifies onPress actually fires on click." } },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    expect(args.onPress).toHaveBeenCalledOnce();
  },
};

export const AsLink: Story = {
  parameters: {
    docs: {
      description: {
        story: "LinkButton — the same variants, rendered as a real <a> for link-as-button cases.",
      },
    },
  },
  render: () => (
    <LinkButton href="https://example.com" variant="outline">
      Visit site
    </LinkButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Visit site" });
    expect(link).toHaveAttribute("href", "https://example.com");
  },
};
