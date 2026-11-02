import { describe, expect, it } from "vitest";
import {
  externalLinkProps,
  isExpandable,
  itemLabel,
  visibleNav,
} from "@/blocks/app-sidebar/nav-access";
import type { AppSidebarNavItem } from "@/blocks/app-sidebar/types";

const section = (...items: AppSidebarNavItem[]) => [{ title: "Section", items }];
const home: AppSidebarNavItem = { title: "Home", url: "/home" };
const child = { title: "Child", url: "/child" };
const hiddenChild = { title: "Hidden child", url: "/hidden", access: "hidden" as const };
const blockedChild = {
  title: "Blocked child",
  url: "/blocked",
  access: "blocked" as const,
  badge: { label: "No access" },
};
const soon = { label: "Coming soon" };

describe("visibleNav", () => {
  it("drops hidden items", () => {
    const nav = section(home, { title: "Hidden", url: "/hidden", access: "hidden" });
    expect(visibleNav(nav)).toEqual(section(home));
  });

  it("drops hidden children and keeps the others", () => {
    const nav = section({ title: "Parent", url: "/p", items: [child, hiddenChild] });
    expect(visibleNav(nav)).toEqual(section({ title: "Parent", url: "/p", items: [child] }));
  });

  it("drops a parent whose children are all hidden", () => {
    const nav = section(home, { title: "Parent", url: "/p", items: [hiddenChild] });
    expect(visibleNav(nav)).toEqual(section(home));
  });

  it("keeps a parent whose children are all blocked", () => {
    const nav = section({ title: "Parent", url: "/p", items: [blockedChild] });
    expect(visibleNav(nav)).toEqual(nav);
  });

  it.each(["blocked", "gated"] as const)("keeps a %s parent with hidden children", (access) => {
    const nav = section({
      title: "Parent",
      url: "/p",
      access,
      badge: soon,
      items: [hiddenChild],
    });
    expect(visibleNav(nav)).toHaveLength(1);
    expect(visibleNav(nav)[0]?.items[0]?.access).toBe(access);
  });

  it("keeps a leaf with an empty items array", () => {
    const nav = section({ title: "Leaf", url: "/leaf", items: [] });
    expect(visibleNav(nav)).toEqual(nav);
  });

  it("drops a section left empty", () => {
    const nav = section({ title: "Hidden", url: "/hidden", access: "hidden" });
    expect(visibleNav(nav)).toEqual([]);
  });

  it("leaves data without access unchanged", () => {
    const nav = section(home, { title: "Parent", url: "/p", items: [child] });
    expect(visibleNav(nav)).toEqual(nav);
  });
});

describe("isExpandable", () => {
  it("expands a parent that is granted or has no access", () => {
    expect(isExpandable({ title: "P", url: "/p", items: [child] })).toBe(true);
    expect(isExpandable({ title: "P", url: "/p", access: "granted", items: [child] })).toBe(true);
  });

  it.each(["blocked", "gated"] as const)("doesn't expand a %s parent", (access) => {
    expect(isExpandable({ title: "P", url: "/p", access, badge: soon, items: [child] })).toBe(
      false,
    );
  });

  it("doesn't expand an item without children", () => {
    expect(isExpandable(home)).toBe(false);
    expect(isExpandable({ title: "P", url: "/p", items: [] })).toBe(false);
  });
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
