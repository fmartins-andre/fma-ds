import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import meta from "./meta.json";
import { Separator } from "./separator";

const componentMeta = {
  title: "ds/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Separator>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Horizontal: Story = {
  parameters: {
    docs: { description: { story: "The default orientation — a full-width horizontal rule." } },
  },
  render: () => (
    <div className="w-64">
      <p className="text-sm">Above</p>
      <Separator className="my-4" />
      <p className="text-sm">Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: { description: { story: 'orientation="vertical" for dividing inline content.' } },
  },
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <p className="text-sm">Left</p>
      <Separator orientation="vertical" />
      <p className="text-sm">Right</p>
    </div>
  ),
};

/**
 * Inside a taller row, give it a height and center it: classes in `className`
 * win over the orientation's defaults.
 */
export const VerticalWithHeight: Story = {
  render: () => (
    <div className="flex h-12 items-stretch gap-2 rounded-lg border px-3">
      <span className="self-center text-sm">Clients</span>
      <Separator orientation="vertical" className="h-4 self-center" />
      <span className="self-center text-sm text-muted-foreground">Acme Inc.</span>
    </div>
  ),
};

export const ShouldLetClassNameSetVerticalSize: Story = {
  ...VerticalWithHeight,
  tags: ["!autodocs"],
  play: async ({ canvas }) => {
    const separator = canvas.getByRole("separator");
    const style = getComputedStyle(separator);
    await expect(style.alignSelf).toBe("center");
    await expect(separator.getBoundingClientRect().height).toBe(16);
  },
};
