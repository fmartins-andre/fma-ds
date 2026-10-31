import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FmaI18nProvider } from "@/lib/i18n/i18n";
import meta from "./meta.json";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

const componentMeta = {
  title: "ds/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
} satisfies Meta<typeof Pagination>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Previous/next controls, numbered links, current page, and a collapsed-range ellipsis.",
      },
    },
  },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByRole("link", { name: "2" });
    expect(current).toHaveAttribute("aria-current", "page");
  },
};

export const ShouldUseProviderMessages: Story = {
  tags: ["!autodocs"],
  decorators: [
    (Story) => (
      <FmaI18nProvider
        locale="pt-BR"
        locales={{
          "pt-BR": {
            pagination: { labels: { next: "Próxima", goToNext: "Ir para a próxima página" } },
          },
        }}
      >
        <Story />
      </FmaI18nProvider>
    ),
  ],
  render: () => <PaginationNext href="#" />,
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Ir para a próxima página" });
    await expect(link).toHaveTextContent("Próxima");
  },
};
