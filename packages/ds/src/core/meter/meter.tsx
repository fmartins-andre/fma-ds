import { cva } from "class-variance-authority";
import { cn } from "cn";
import * as React from "react";
import {
  Label as LabelPrimitive,
  type LabelProps,
  Meter as MeterPrimitive,
  type MeterProps as MeterPrimitiveProps,
} from "react-aria-components";

// Thresholds on the fill follow the idea of Intent UI's meter (MIT), rebuilt on this registry's tokens.

type MeterLevel = "normal" | "warning" | "critical";

type MeterContextValue = {
  percentage: number;
  valueText?: string;
  level: MeterLevel;
};

const MeterContext = React.createContext<MeterContextValue | null>(null);

function useMeter() {
  const context = React.useContext(MeterContext);
  if (!context) {
    throw new Error("useMeter must be used within a Meter.");
  }

  return context;
}

function levelOf(percentage: number, warningAt?: number, criticalAt?: number): MeterLevel {
  if (criticalAt != null && percentage >= criticalAt) return "critical";
  if (warningAt != null && percentage >= warningAt) return "warning";
  return "normal";
}

function MeterContent({ children, ...value }: MeterContextValue & { children?: React.ReactNode }) {
  const { percentage, valueText, level } = value;
  const context = React.useMemo(
    () => ({ percentage, valueText, level }),
    [percentage, valueText, level],
  );

  return (
    <MeterContext value={context}>
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterContext>
  );
}

/**
 * A quantity within a known range (storage, seats, quota). Not a task's progress: that's
 * `Progress`. `warningAt` / `criticalAt` are percentages that tint the fill as it nears the limit.
 */
function Meter({
  className,
  children,
  warningAt,
  criticalAt,
  ...props
}: Omit<MeterPrimitiveProps, "children" | "className"> & {
  children?: React.ReactNode;
  className?: string;
  /** Percentage (0–100) from which the fill turns `warning`. */
  warningAt?: number;
  /** Percentage (0–100) from which the fill turns `destructive`. */
  criticalAt?: number;
}) {
  return (
    <MeterPrimitive data-slot="meter" className={cn("flex flex-wrap gap-3", className)} {...props}>
      {({ percentage, valueText }) => {
        const level = levelOf(percentage, warningAt, criticalAt);
        return (
          <MeterContent percentage={percentage} valueText={valueText} level={level}>
            {children}
          </MeterContent>
        );
      }}
    </MeterPrimitive>
  );
}

function MeterTrack({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-(--meter-track,var(--color-muted))",
        className,
      )}
      data-slot="meter-track"
      {...props}
    />
  );
}

const indicatorVariants = cva("h-full transition-all motion-reduce:transition-none", {
  variants: {
    level: {
      normal: "bg-(--meter-fill,var(--color-primary))",
      warning: "bg-warning",
      critical: "bg-destructive",
    },
  },
});

function MeterIndicator({ className, style, ...props }: React.ComponentProps<"span">) {
  const { percentage, level } = useMeter();

  return (
    <span
      data-slot="meter-indicator"
      data-level={level}
      className={cn(indicatorVariants({ level }), className)}
      style={{ ...style, width: `${percentage}%` }}
      {...props}
    />
  );
}

function MeterLabel({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive
      className={cn("text-sm font-medium", className)}
      data-slot="meter-label"
      {...props}
    />
  );
}

function MeterValue({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  children?: (value: string) => React.ReactNode;
}) {
  const { valueText } = useMeter();
  return (
    <span
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      data-slot="meter-value"
      {...props}
    >
      {children && valueText != null ? children(valueText) : valueText}
    </span>
  );
}

export { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue };
