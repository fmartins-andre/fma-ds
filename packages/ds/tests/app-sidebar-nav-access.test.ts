import { describe, expect, it } from "vitest";
import type { AppSidebarProps } from "@/blocks/app-sidebar/app-sidebar";
import { externalLinkProps, itemLabel } from "@/blocks/app-sidebar/nav-access";
import type { AppSidebarItemProps } from "@/blocks/app-sidebar/types";

const soon = { label: "Coming soon" };

// Checked by `tsc`: an item goes somewhere or runs something, never both.
const go = () => {};
const can = false as boolean;
const contract: AppSidebarItemProps[] = [
  { title: "Link", href: "/link" },
  { title: "Action", onPress: go },
  { title: "Gated action", access: "gated", badge: soon, onPress: go },
  { title: "Blocked", access: "blocked", badge: soon },
  { title: "Blocked link", access: "blocked", badge: soon, href: "/link", onPress: go },
  { title: "Parent", children: null },
  { title: "Dynamic parent", access: can ? "granted" : "blocked", badge: soon, children: null },
  { title: "Dynamic link", access: can ? "granted" : "blocked", badge: soon, href: "/link" },
  { title: "Dynamic action", access: can ? "granted" : "blocked", badge: soon, onPress: go },
  // @ts-expect-error both a link and an action
  { title: "Both", href: "/link", onPress: go },
  // @ts-expect-error neither a link, an action nor children
  { title: "Nothing" },
  // @ts-expect-error `gated` needs somewhere to go
  { title: "Gated", access: "gated", badge: soon },
  // @ts-expect-error `external` is about a link
  { title: "External", external: true, onPress: go },
];

const partialLabels: NonNullable<AppSidebarProps["i18n"]> = { labels: { team: "Time" } };

it("has its item contract checked by tsc", () => {
  expect(contract).toHaveLength(13);
  expect(partialLabels.labels?.team).toBe("Time");
});

describe("itemLabel", () => {
  it("names an item with its badge", () => {
    expect(itemLabel({ title: "Audit", badge: soon })).toBe("Audit, Coming soon");
  });

  it("is the title without a badge", () => {
    expect(itemLabel({ title: "Audit" })).toBe("Audit");
  });
});

describe("externalLinkProps", () => {
  it("opens external links in a new tab", () => {
    expect(externalLinkProps({ external: true })).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("leaves internal links alone", () => {
    expect(externalLinkProps({})).toEqual({});
  });

  it("ignores external on a blocked item", () => {
    expect(externalLinkProps({ external: true, access: "blocked" })).toEqual({});
  });
});
