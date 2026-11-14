import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../button/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import meta from "./meta.json";

const componentMeta = {
  title: "ds/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    // meta.json (packages/ds/src/core/card/meta.json) is the single source of
    // truth for this description — it also feeds registry.json.
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
  args: {
    size: "default",
  },
} satisfies Meta<typeof Card>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: { story: "Header, content, and footer slots — the common composition." },
    },
  },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Project alpha</CardTitle>
        <CardDescription>Last updated 2 hours ago</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Open</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Project alpha")).toBeVisible();
    expect(canvas.getByRole("button", { name: "Open" })).toBeVisible();
  },
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "CardAction places a control (e.g. a dismiss button) in the header's top-right corner.",
      },
    },
  },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Dismiss">
            ×
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Uses the CardAction slot.</p>
      </CardContent>
    </Card>
  ),
};

export const Compact: Story = {
  args: { size: "sm" },
  parameters: {
    docs: { description: { story: 'size="sm" tightens the spacing scale for denser layouts.' } },
  },
  render: (args) => (
    <Card {...args} className="w-72">
      <CardHeader>
        <CardTitle>Compact card</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">size=&quot;sm&quot; tightens the spacing scale.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * `bleed` drops the content's side padding, so a list or a table spans the card's edges;
 * `bleed="end"` also closes the card with it, without the card's bottom padding.
 */
export const Bleed: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Recent invoices</CardTitle>
      </CardHeader>
      <CardContent bleed="end">
        <ul className="divide-y border-t">
          <li className="flex justify-between px-4 py-2">
            <span>October</span>
            <span className="tabular-nums">$249.90</span>
          </li>
          <li className="flex justify-between px-4 py-2">
            <span>September</span>
            <span className="tabular-nums">$249.90</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>("[data-slot=card]");
    const list = canvasElement.querySelector<HTMLElement>("ul");
    if (!card || !list) throw new Error();
    const cardBox = card.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    await expect(Math.round(listBox.left)).toBe(Math.round(cardBox.left));
    await expect(Math.round(listBox.right)).toBe(Math.round(cardBox.right));
    await expect(Math.round(listBox.bottom)).toBe(Math.round(cardBox.bottom));
  },
};

/**
 * A card stretched by its grid row keeps the footer at the bottom: no blank strip
 * under it next to a taller neighbor.
 */
export const ShouldKeepTheFooterAtTheBottom: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <div className="grid w-160 grid-cols-2 gap-4">
      <Card {...args}>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
        </CardHeader>
        <CardContent>$341.22</CardContent>
        <CardFooter>
          <Button>Use now</Button>
        </CardFooter>
      </Card>
      <Card {...args}>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="h-64">Taller content</CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>("[data-slot=card]");
    const footer = canvasElement.querySelector<HTMLElement>("[data-slot=card-footer]");
    if (!card || !footer) throw new Error();
    await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(
      Math.round(card.getBoundingClientRect().bottom),
    );
  },
};

export const ShouldTouchTheFooterAfterBleedEndContent: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <div className="flex w-96 flex-col gap-4">
      <Card {...args}>
        <CardContent bleed="end" className="h-24 border-b">
          Table
        </CardContent>
        <CardFooter>Pagination</CardFooter>
      </Card>
      <Card {...args}>
        {/* a provider wrapping body and footer, out of the layout */}
        <div className="contents">
          <CardContent bleed="end" className="h-24 border-b">
            Table
          </CardContent>
          <CardFooter>Pagination</CardFooter>
        </div>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const contents = canvasElement.querySelectorAll<HTMLElement>("[data-slot=card-content]");
    const footers = canvasElement.querySelectorAll<HTMLElement>("[data-slot=card-footer]");
    await expect(contents).toHaveLength(2);
    for (const [i, content] of contents.entries()) {
      await expect(Math.round(footers[i].getBoundingClientRect().top)).toBe(
        Math.round(content.getBoundingClientRect().bottom),
      );
    }
  },
};
