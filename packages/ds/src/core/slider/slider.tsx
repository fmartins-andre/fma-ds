import { cn } from "cn";
import * as React from "react";
import {
  SliderFill as SliderFillPrimitive,
  SliderOutput,
  Slider as SliderPrimitive,
  type SliderProps as SliderPrimitiveProps,
  type SliderState,
  SliderThumb as SliderThumbPrimitive,
  SliderTrack as SliderTrackPrimitive,
} from "react-aria-components";
import { Label } from "@/core/label/label";

type SliderValue = number | number[];

type SliderMark = number | { value: number; label?: React.ReactNode };

type SliderContextValue = {
  state: SliderState;
  /** The cap below `maxValue`, if any. */
  limit?: number;
  /** Where the cap sits on the track (0–100), when it's below `maxValue`. */
  limitPercent?: number;
  descriptionId: string;
  setHasDescription: (has: boolean) => void;
};

const SliderContext = React.createContext<SliderContextValue | null>(null);

function useSlider() {
  const context = React.useContext(SliderContext);
  if (!context) {
    throw new Error("Slider parts must be used within a Slider.");
  }
  return context;
}

type SliderProps<T extends SliderValue = SliderValue> = Omit<
  SliderPrimitiveProps<T>,
  "className" | "children"
> & {
  className?: string;
  /**
   * The parts: `SliderLabel`, `SliderValue`, `SliderControl` (with
   * `SliderTrack`, `SliderFill`, `SliderThumb`), `SliderMarks`,
   * `SliderDescription`. Omitted, it draws the track and thumbs only (name it
   * with `aria-label`).
   */
  children?: React.ReactNode;
  /**
   * A cap below `maxValue`: the scale and the marks still run to `maxValue`,
   * but the value stops here (dragging, keys and marks above it), and the part
   * of the track above it is drawn as unavailable. Say why in `SliderDescription`.
   */
  limit?: number;
};

const toMark = (mark: SliderMark) => (typeof mark === "number" ? { value: mark } : mark);

function clampTo<T extends SliderValue>(value: T, limit: number): T {
  return (
    Array.isArray(value) ? value.map((item) => Math.min(item, limit)) : Math.min(value, limit)
  ) as T;
}

const sameValue = (a: SliderValue, b: SliderValue) =>
  Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((item, index) => item === b[index])
    : a === b;

/** Moves the thumb closest to `value` there, reporting it as a finished change; returns its index. */
function moveNearestThumb(state: SliderState, value: number) {
  let nearest = 0;
  state.values.forEach((current, index) => {
    const best = state.values[nearest] ?? current;
    if (Math.abs(current - value) < Math.abs(best - value)) nearest = index;
  });
  state.setThumbDragging(nearest, true);
  state.setThumbValue(nearest, value);
  state.setThumbDragging(nearest, false);
  return nearest;
}

const positionStyle = (state: SliderState, percent: number): React.CSSProperties =>
  state.orientation === "vertical" ? { bottom: `${percent}%` } : { left: `${percent}%` };

/**
 * A draggable value (or range) built from parts. Holds the state and the
 * `limit`; the parts read them.
 */
function Slider<T extends SliderValue = SliderValue>({
  className,
  children,
  limit,
  ...props
}: SliderProps<T>) {
  const descriptionId = React.useId();
  const [hasDescription, setHasDescription] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);

  // With a limit the value is held here, so a change past it can be pulled back.
  let limitProps: Partial<SliderPrimitiveProps<T>> = {};
  if (limit !== undefined) {
    const { value, onChange, onChangeEnd } = props;
    const current = clampTo(value ?? uncontrolled ?? ((props.minValue ?? 0) as T), limit);
    limitProps = {
      defaultValue: undefined,
      value: current,
      onChange: (next) => {
        const clamped = clampTo(next, limit);
        if (sameValue(clamped, current)) return;
        if (value === undefined) setUncontrolled(clamped);
        onChange?.(clamped);
      },
      onChangeEnd: onChangeEnd && ((next) => onChangeEnd(clampTo(next, limit))),
    };
  }

  return (
    <SliderPrimitive
      className={cn(
        "group flex w-full touch-none flex-col gap-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-row",
        className,
      )}
      data-slot="slider"
      {...props}
      {...limitProps}
      aria-describedby={cn(props["aria-describedby"], hasDescription && descriptionId) || undefined}
    >
      {({ state }) => (
        <SliderContext.Provider
          value={{
            state,
            limit,
            limitPercent:
              limit !== undefined && limit < (props.maxValue ?? 100)
                ? state.getValuePercent(limit) * 100
                : undefined,
            descriptionId,
            setHasDescription,
          }}
        >
          {children ?? (
            <SliderControl>
              <SliderTrack>
                <SliderFill />
              </SliderTrack>
              <SliderThumb />
            </SliderControl>
          )}
        </SliderContext.Provider>
      )}
    </SliderPrimitive>
  );
}

/** Names the slider. A `FieldLabel` works here too. */
function SliderLabel(props: React.ComponentProps<typeof Label>) {
  return <Label data-slot="slider-label" {...props} />;
}

/**
 * The current value (or range, joined by " – "). `children` formats each value
 * ("200 orders"); without it, `formatOptions` applies, which is also what
 * screen readers announce.
 */
function SliderValue({
  className,
  children,
}: {
  className?: string;
  children?: (value: number) => React.ReactNode;
}) {
  const { state } = useSlider();
  return (
    <SliderOutput
      data-slot="slider-value"
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
    >
      {state.values.map((value, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: one entry per thumb, in thumb order
        <span key={index}>
          {index > 0 && " – "}
          {children ? children(value) : state.getFormattedValue(value)}
        </span>
      ))}
    </SliderOutput>
  );
}

/**
 * Lays out the track and thumbs, and marks where a `limit` cuts the scale.
 */
function SliderControl({ className, children, ...props }: React.ComponentProps<"div">) {
  const { state, limitPercent } = useSlider();
  return (
    <div
      data-slot="slider-control"
      className={cn(
        "relative flex w-full items-center group-data-vertical:h-full group-data-vertical:w-auto group-data-vertical:flex-col",
        className,
      )}
      {...props}
    >
      {children}
      {limitPercent !== undefined && (
        <span
          aria-hidden="true"
          data-slot="slider-limit"
          style={positionStyle(state, limitPercent)}
          className="absolute rounded-full bg-muted-foreground/60 group-data-horizontal:h-3 group-data-horizontal:w-0.5 group-data-horizontal:-translate-x-1/2 group-data-vertical:h-0.5 group-data-vertical:w-3 group-data-vertical:translate-y-1/2"
        />
      )}
    </div>
  );
}

/** The rail; draws the part above a `limit` as unavailable. Holds the `SliderFill`. */
function SliderTrack({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { state, limitPercent } = useSlider();
  return (
    <SliderTrackPrimitive
      data-slot="slider-track"
      className={cn(
        "relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
        className,
      )}
    >
      {children}
      {limitPercent !== undefined && (
        <div
          aria-hidden="true"
          data-slot="slider-unavailable"
          style={positionStyle(state, limitPercent)}
          className="absolute bg-[repeating-linear-gradient(90deg,var(--muted-foreground)_0_2px,transparent_2px_5px)] opacity-40 group-data-horizontal:inset-y-0 group-data-horizontal:right-0 group-data-vertical:inset-x-0 group-data-vertical:top-0 group-data-vertical:bg-[repeating-linear-gradient(0deg,var(--muted-foreground)_0_2px,transparent_2px_5px)]"
        />
      )}
    </SliderTrackPrimitive>
  );
}

/** The selected part of the track. */
function SliderFill({ className }: { className?: string }) {
  return (
    <SliderFillPrimitive
      data-slot="slider-range"
      className={cn(
        "absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full",
        className,
      )}
    />
  );
}

/**
 * The handle. Without `index` it draws one per value, so a range gets its two
 * thumbs. `children` goes inside (an icon, a logo); a function gets the index.
 */
function SliderThumb({
  className,
  index,
  children,
}: {
  className?: string;
  index?: number;
  children?: React.ReactNode | ((index: number) => React.ReactNode);
}) {
  const { state } = useSlider();
  const indexes = index === undefined ? state.values.map((_, i) => i) : [index];
  return indexes.map((i) => (
    <SliderThumbPrimitive
      data-slot="slider-thumb"
      key={i}
      index={i}
      className={cn(
        "relative flex size-3 shrink-0 items-center justify-center rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none group-data-horizontal:top-[50%] group-data-vertical:left-[50%] after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {typeof children === "function" ? children(i) : children}
    </SliderThumbPrimitive>
  ));
}

/**
 * Labelled stops under the track (`number` or `{ value, label }`). Clicking
 * one moves the nearest thumb there; the keyboard keeps using the thumb. Marks
 * above a `limit` are disabled.
 */
function SliderMarks({ marks, className }: { marks: SliderMark[]; className?: string }) {
  const { state, limit } = useSlider();
  return (
    <div
      data-slot="slider-marks"
      className={cn(
        "relative text-xs text-muted-foreground group-data-horizontal:h-5 group-data-horizontal:w-full group-data-vertical:min-w-8",
        className,
      )}
    >
      {marks.map(toMark).map(({ value, label }) => {
        const percent = state.getValuePercent(value) * 100;
        return (
          <button
            key={value}
            type="button"
            // The thumb is the keyboard path; marks are a pointer shortcut.
            tabIndex={-1}
            data-slot="slider-mark"
            disabled={state.isDisabled || (limit !== undefined && value > limit)}
            // Hand focus to the moved thumb, so the arrow keys pick up from there.
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              const index = moveNearestThumb(state, value);
              event.currentTarget
                .closest("[data-slot=slider]")
                ?.querySelectorAll<HTMLInputElement>("input[type=range]")
                [index]?.focus();
            }}
            style={positionStyle(state, percent)}
            className={cn(
              "absolute rounded-sm px-1 whitespace-nowrap tabular-nums transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
              "group-data-horizontal:top-0 group-data-vertical:left-0",
              percent <= 0
                ? "group-data-horizontal:-translate-x-1 group-data-vertical:translate-y-0"
                : percent >= 100
                  ? "group-data-horizontal:-translate-x-[calc(100%-0.25rem)] group-data-vertical:translate-y-full"
                  : "group-data-horizontal:-translate-x-1/2 group-data-vertical:translate-y-1/2",
            )}
          >
            {label ?? state.getFormattedValue(value)}
          </button>
        );
      })}
    </div>
  );
}

/** Text under the track ("Only 20 left"); screen readers read it with the value. */
function SliderDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { descriptionId, setHasDescription } = useSlider();
  React.useLayoutEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);
  return (
    <p
      id={descriptionId}
      data-slot="slider-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export type { SliderMark, SliderProps };
export {
  Slider,
  SliderControl,
  SliderDescription,
  SliderFill,
  SliderLabel,
  SliderMarks,
  SliderThumb,
  SliderTrack,
  SliderValue,
};
