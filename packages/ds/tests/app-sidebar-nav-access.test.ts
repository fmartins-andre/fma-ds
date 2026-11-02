import { describe, expect, it } from "vitest";
import { externalLinkProps, itemLabel } from "@/blocks/app-sidebar/nav-access";

const soon = { label: "Coming soon" };

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
