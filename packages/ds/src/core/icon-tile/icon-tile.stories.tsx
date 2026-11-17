import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheckIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react";
import { expect } from "storybook/test";
import { TONES, VARIANTS } from "@/lib/tone";
import { IconTile } from "./icon-tile";
import meta from "./meta.json";

const SIZES = ["xs", "sm", "default", "lg", "xl"] as const;

const componentMeta = {
  title: "ds/IconTile",
  component: IconTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    tone: { control: "select", options: TONES },
    size: { control: "select", options: SIZES },
    radius: { control: "radio", options: ["default", "full"] },
  },
  args: {
    variant: "outline",
    size: "default",
    radius: "default",
    children: <SparklesIcon />,
  },
} satisfies Meta<typeof IconTile>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {};

/**
 * `solid`, `soft`, `outline` and `ghost` share one footprint: `ghost` is only the icon, at
 * the tile's size, so switching variants never moves the layout.
 */
export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {VARIANTS.map((variant) => (
        <IconTile key={variant} {...args} variant={variant} aria-label={variant} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const variant of VARIANTS) {
      const tile = canvas.getByLabelText(variant);
      await expect(tile).toHaveAttribute("data-variant", variant);
      const { width, height } = tile.getBoundingClientRect();
      await expect([width, height]).toEqual([40, 40]);
    }
  },
};

/** The glyph scales with the tile through `--icon-tile-icon-size`. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-3">
      {SIZES.map((size) => (
        <IconTile key={size} {...args} size={size} data-testid={size} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const width = (size: string) => canvas.getByTestId(size).getBoundingClientRect().width;
    // xs → xl: 24, 32, 40, 48, 56px.
    await expect(SIZES.map(width)).toEqual([24, 32, 40, 48, 56]);
  },
};

/** `full` makes the tile circular. */
export const RadiusFull: Story = {
  args: { radius: "full", variant: "soft", tone: "primary" },
};

/** `tone` colors any variant: here `soft` and `solid` in status tones. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconTile {...args} variant="soft" tone="success">
        <CircleCheckIcon />
      </IconTile>
      <IconTile {...args} variant="soft" tone="warning">
        <TriangleAlertIcon />
      </IconTile>
      <IconTile {...args} variant="solid" tone="success">
        <CircleCheckIcon />
      </IconTile>
      <IconTile {...args} variant="solid" tone="destructive">
        <TriangleAlertIcon />
      </IconTile>
    </div>
  ),
};
