import * as React from "react";

export type ScrollSide = "start" | "end";

export type ScrollOverflow = {
  /** Content is hidden before the visible area (left in LTR, right in RTL). */
  canScrollStart: boolean;
  /** Content is hidden after the visible area. */
  canScrollEnd: boolean;
  /**
   * Turns a page toward `side`, aligned to the items: the first item not fully visible
   * on that side becomes the first one shown, clear of the scroller's `scroll-padding`.
   */
  scrollToward: (side: ScrollSide) => void;
  /**
   * Brings `element` fully into view inside the scroller, without scrolling the page.
   * Whatever takes focus inside the scroller is revealed on its own.
   */
  reveal: (element: Element) => void;
};

/** Slack for sub-pixel scroll positions. */
const EPSILON = 1;

function isRtl(element: HTMLElement) {
  return getComputedStyle(element).direction === "rtl";
}

function canOverflow(element: HTMLElement) {
  const { overflowX } = getComputedStyle(element);
  return overflowX === "auto" || overflowX === "scroll";
}

/** The visible box, minus the `scroll-padding` the edges keep clear (arrows, fades). */
function viewport(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    left: box.left + (Number.parseFloat(style.scrollPaddingLeft) || 0),
    right: box.right - (Number.parseFloat(style.scrollPaddingRight) || 0),
  };
}

function behavior(): ScrollBehavior {
  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/**
 * Horizontal overflow of a scroller: whether there is hidden content on each side, a
 * page turn toward a side, and revealing one element. The items are the children of
 * the scroller's first child (the list it wraps). Follows the writing direction.
 * Nothing overflows unless the scroller has `overflow-x: auto | scroll`.
 */
export function useScrollOverflow(ref: React.RefObject<HTMLElement | null>): ScrollOverflow {
  const [canScrollStart, setCanScrollStart] = React.useState(false);
  const [canScrollEnd, setCanScrollEnd] = React.useState(false);

  React.useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    const update = () => {
      if (!canOverflow(scroller)) {
        setCanScrollStart(false);
        setCanScrollEnd(false);
        return;
      }
      // in RTL scrollLeft runs from 0 down to negative values
      const position = Math.abs(scroller.scrollLeft);
      const max = scroller.scrollWidth - scroller.clientWidth;
      setCanScrollStart(position > EPSILON);
      setCanScrollEnd(position < max - EPSILON);
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    for (const element of [scroller, scroller.firstElementChild]) {
      if (element) observer?.observe(element);
    }
    return () => {
      scroller.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [ref]);

  const scrollToward = React.useCallback(
    (side: ScrollSide) => {
      const scroller = ref.current;
      if (!scroller) return;
      // the physical direction: right is toward the end in LTR, toward the start in RTL
      const right = (side === "end") !== isRtl(scroller);
      const view = viewport(scroller);
      const items = Array.from(scroller.firstElementChild?.children ?? [])
        .map((item) => item.getBoundingClientRect())
        .filter((box) => box.width > 0);
      let delta = 0;
      if (right) {
        const next = items.find((box) => box.right > view.right + EPSILON);
        if (!next) return;
        delta = next.left - view.left;
        // an item wider than the view: just bring its far edge in
        if (delta <= EPSILON) delta = next.right - view.right;
      } else {
        const next = [...items].reverse().find((box) => box.left < view.left - EPSILON);
        if (!next) return;
        delta = next.right - view.right;
        if (delta >= -EPSILON) delta = next.left - view.left;
      }
      scroller.scrollBy({ left: delta, behavior: behavior() });
    },
    [ref],
  );

  const reveal = React.useCallback(
    (element: Element) => {
      const scroller = ref.current;
      if (!scroller?.contains(element)) return;
      const view = viewport(scroller);
      const box = element.getBoundingClientRect();
      if (box.left < view.left) scroller.scrollLeft -= view.left - box.left;
      else if (box.right > view.right) scroller.scrollLeft += box.right - view.right;
    },
    [ref],
  );

  // keyboard focus moving to a hidden item (react-aria focuses without scrolling)
  React.useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Element) reveal(event.target);
    };
    scroller.addEventListener("focusin", onFocusIn);
    return () => scroller.removeEventListener("focusin", onFocusIn);
  }, [ref, reveal]);

  return { canScrollStart, canScrollEnd, scrollToward, reveal };
}
