import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "./bubble";
import meta from "./meta.json";

const componentMeta = {
  title: "ds/Bubble",
  component: Bubble,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "soft", "outline"],
    },
    tone: {
      control: "select",
      options: ["brand", "primary", "neutral", "success", "warning", "info", "destructive"],
    },
    align: { control: "select", options: ["start", "end"] },
  },
  args: {
    children: <BubbleContent>Hey, how's the new design system coming along?</BubbleContent>,
  },
} satisfies Meta<typeof Bubble>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {};

export const Sent: Story = {
  args: { align: "end", children: <BubbleContent>Almost there!</BubbleContent> },
};

export const Conversation: Story = {
  render: () => (
    <BubbleGroup className="w-80">
      <Bubble align="start">
        <BubbleContent>Hey, how's the new design system coming along?</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="soft" tone="primary">
        <BubbleContent>Almost there — just vendoring the last few components.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/almost there/i)).toBeVisible();
  },
};

export const Tones: Story = {
  render: () => (
    <BubbleGroup className="w-80">
      <Bubble variant="outline" tone="neutral">
        <BubbleContent>Neutral</BubbleContent>
      </Bubble>
      <Bubble variant="soft" tone="success">
        <BubbleContent>Success</BubbleContent>
      </Bubble>
      <Bubble variant="soft" tone="destructive">
        <BubbleContent>Error</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Success")).toBeVisible();
  },
};

export const WithReactions: Story = {
  render: () => (
    <Bubble className="relative">
      <BubbleContent>Ship it 🚀</BubbleContent>
      <BubbleReactions>👍 2</BubbleReactions>
    </Bubble>
  ),
};
