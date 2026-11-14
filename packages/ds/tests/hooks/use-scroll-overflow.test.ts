// @vitest-environment happy-dom
import { act, createElement, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type ScrollOverflow, useScrollOverflow } from "@/hooks/use-scroll-overflow";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** happy-dom has no layout: fake the boxes the hook reads. */
function box(element: Element, left: number, right: number) {
  element.getBoundingClientRect = () =>
    ({ left, right, width: right - left, top: 0, bottom: 10, height: 10 }) as DOMRect;
}

let root: Root;
let container: HTMLElement;
let result: ScrollOverflow;
let scroller: HTMLDivElement;
let items: HTMLElement[];
let scrollLeft = 0;

function Harness({ rtl = false, overflow = "auto" }: { rtl?: boolean; overflow?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  result = useScrollOverflow(ref);
  return createElement(
    "div",
    { ref, style: { overflowX: overflow, direction: rtl ? "rtl" : "ltr" } },
    createElement(
      "ul",
      null,
      ["a", "b", "c", "d"].map((id) => createElement("li", { key: id, id }, id)),
    ),
  );
}

/** A 100px view over 4 items of 60px (240px of content). */
function mount(props: { rtl?: boolean; overflow?: string } = {}) {
  act(() => root.render(createElement(Harness, props)));
  scroller = container.firstElementChild as HTMLDivElement;
  items = Array.from(scroller.querySelectorAll("li"));
  Object.defineProperty(scroller, "scrollWidth", { configurable: true, value: 240 });
  Object.defineProperty(scroller, "clientWidth", { configurable: true, value: 100 });
  Object.defineProperty(scroller, "scrollLeft", {
    configurable: true,
    get: () => scrollLeft,
    set: (value: number) => {
      scrollLeft = value;
    },
  });
  box(scroller, 0, 100);
  layout();
  scroller.scrollBy = vi.fn() as typeof scroller.scrollBy;
  // re-measure now that the boxes exist
  scrollTo(scrollLeft);
}

/** Lays the items out for the current scroll position (LTR). */
function layout() {
  items.forEach((item, index) => {
    box(item, index * 60 - Math.abs(scrollLeft), index * 60 + 60 - Math.abs(scrollLeft));
  });
}

function scrollTo(value: number) {
  scrollLeft = value;
  layout();
  act(() => {
    scroller.dispatchEvent(new Event("scroll"));
  });
}

beforeEach(() => {
  scrollLeft = 0;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useScrollOverflow", () => {
  it("reports hidden content on each side as it scrolls", () => {
    mount();
    expect(result).toMatchObject({ canScrollStart: false, canScrollEnd: true });
    scrollTo(70);
    expect(result).toMatchObject({ canScrollStart: true, canScrollEnd: true });
    scrollTo(140);
    expect(result).toMatchObject({ canScrollStart: true, canScrollEnd: false });
  });

  it("reports nothing when the element doesn't scroll sideways", () => {
    mount({ overflow: "visible" });
    expect(result).toMatchObject({ canScrollStart: false, canScrollEnd: false });
  });

  it("follows the writing direction (RTL scrollLeft runs negative)", () => {
    mount({ rtl: true });
    expect(result).toMatchObject({ canScrollStart: false, canScrollEnd: true });
    scrollTo(-140);
    expect(result).toMatchObject({ canScrollStart: true, canScrollEnd: false });
  });

  it("turns a page toward the end: the first item not fully shown comes first", () => {
    mount();
    result.scrollToward("end");
    // item b (60–120) is cut at 100: it moves to the start of the view
    expect(scroller.scrollBy).toHaveBeenCalledWith({ left: 60, behavior: "smooth" });
  });

  it("turns a page toward the start: the last item not fully shown comes last", () => {
    mount();
    scrollTo(140);
    result.scrollToward("start");
    // item c sits at -20–40: it moves to the end of the view
    expect(scroller.scrollBy).toHaveBeenCalledWith({ left: -60, behavior: "smooth" });
  });

  it("does nothing toward a side with nothing hidden", () => {
    mount();
    result.scrollToward("start");
    expect(scroller.scrollBy).not.toHaveBeenCalled();
  });

  it("in RTL, the end is to the left", () => {
    mount({ rtl: true });
    scrollTo(-140);
    result.scrollToward("end");
    // physical left: the last item cut on the left (c, at -20–40) comes last
    expect(scroller.scrollBy).toHaveBeenCalledWith({ left: -60, behavior: "smooth" });
  });

  it("reveals an element inside the scroller, and whatever takes focus", () => {
    mount();
    result.reveal(items[3] as HTMLElement);
    expect(scrollLeft).toBe(140);
    scrollTo(140);
    act(() => {
      items[0]?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    expect(scrollLeft).toBe(0);
  });
});
