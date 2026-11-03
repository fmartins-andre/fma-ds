"use client";

import { cn } from "cn";
import { CheckIcon, MinusIcon } from "lucide-react";
import * as React from "react";
import type { RadioGroupProps, RadioProps, ToggleButtonGroupProps } from "react-aria-components";
import { Badge } from "@/core/badge/badge";
import { RadioCard, RadioGroup } from "@/core/radio-group/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/core/toggle-group/toggle-group";
import { brandGlow } from "@/lib/brand";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";

type PricingPlansLabels = {
  /** Read before an included feature. */
  included: string;
  /** Read before a feature the plan doesn't have. */
  notIncluded: string;
};

export type PricingPlansConfig = { labels: PricingPlansLabels };

declare global {
  interface FmaNamespaces {
    pricingPlans: PricingPlansConfig;
  }
}

export const pricingPlansEn: DictionaryNamespace<PricingPlansConfig> = {
  labels: {
    included: "Included",
    notIncluded: "Not included",
  },
};

type PricingPlansI18n = { labels?: Partial<PricingPlansLabels> };

const PricingPlansContext = React.createContext<PricingPlansLabels | null>(null);

type PricingPlansProps = React.ComponentProps<"div"> & {
  /** The side column: an `OrderSummary` with the chosen plan and the action ("Continue"). */
  summary?: React.ReactNode;
  i18n?: PricingPlansI18n;
};

/**
 * Choose one of a few fixed plans, then confirm: the period (`PricingPeriod`)
 * and the plans (`PricingPlanGroup`) on the left, the `summary` on the right,
 * which sticks on large screens and becomes the `OrderSummary` bar fixed to
 * the bottom on smaller ones (the bottom padding leaves room for it). Prices,
 * periods and features come from the app.
 */
function PricingPlans({ summary, i18n, className, children, ...props }: PricingPlansProps) {
  const { labels } = useFmaMessages("pricingPlans", pricingPlansEn, i18n);

  return (
    <PricingPlansContext.Provider value={labels}>
      <div
        data-slot="pricing-plans"
        className={cn(
          "grid gap-6",
          summary && "pb-28 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:pb-0",
          className,
        )}
        {...props}
      >
        <div data-slot="pricing-plans-options" className="flex min-w-0 flex-col gap-4">
          {children}
        </div>
        {summary && <div data-slot="pricing-plans-summary">{summary}</div>}
      </div>
    </PricingPlansContext.Provider>
  );
}

type PricingPeriodProps = Omit<
  ToggleButtonGroupProps,
  "selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange" | "children"
> & {
  /** The selected period's `id`. One is always selected. */
  value: string;
  onChange: (value: string) => void;
  /** `PricingPeriodOption`s. */
  children: React.ReactNode;
};

/** The billing period (monthly, annual): a segmented toggle where one is always selected. */
function PricingPeriod({ value, onChange, className, children, ...props }: PricingPeriodProps) {
  return (
    <ToggleGroup
      data-slot="pricing-period"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [next] = keys;
        if (next != null) onChange(String(next));
      }}
      variant="outline"
      spacing={0}
      className={className}
      {...props}
    >
      {children}
    </ToggleGroup>
  );
}

/** One period; `id` is its value. A `Badge` inside can show the saving ("2 months free"). */
function PricingPeriodOption({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupItem> & { id: string }) {
  return (
    <ToggleGroupItem
      data-slot="pricing-period-option"
      className={cn("px-3", className)}
      {...props}
    />
  );
}

/**
 * The plans as a radio group (`value`/`onChange`, named by `aria-label` or a
 * `Label`). One list on small screens; side by side, in equal columns, once
 * its own width fits them.
 */
function PricingPlanGroup({
  className,
  children,
  ...props
}: Omit<RadioGroupProps, "className"> & { className?: string }) {
  return (
    <RadioGroup data-slot="pricing-plan-group" className={cn("@container", className)} {...props}>
      {(renderProps) => (
        <div className="grid gap-4 @2xl:auto-cols-fr @2xl:grid-flow-col">
          {typeof children === "function" ? children(renderProps) : children}
        </div>
      )}
    </RadioGroup>
  );
}

type PricingPlanProps = Omit<RadioProps, "children" | "aria-labelledby" | "aria-describedby"> & {
  /**
   * Highlights the plan with a brand glow and a `brand` badge (add a
   * `PricingPlanBadge`, so it isn't color alone). Not a border: the border
   * marks the selected plan.
   */
  isFeatured?: boolean;
  /**
   * The parts: `PricingPlanHeader` (with `PricingPlanName`, `PricingPlanBadge`,
   * `PricingPlanDescription`), `PricingPlanPrice` and `PricingPlanFeatures`.
   */
  children?: React.ReactNode;
};

type PricingPlanContextValue = {
  nameId: string;
  priceId: string;
  badgeId: string;
  isFeatured: boolean;
  setHasBadge: (has: boolean) => void;
};

const PricingPlanContext = React.createContext<PricingPlanContextValue | null>(null);

function usePricingPlan(part: string) {
  const context = React.useContext(PricingPlanContext);
  if (!context) throw new Error(`${part} must be used within PricingPlan`);
  return context;
}

/**
 * One plan as a card the user selects, built from its parts. The radio is
 * named by `PricingPlanName` and described by `PricingPlanPrice` and
 * `PricingPlanBadge`; the features stay readable in the card.
 */
function PricingPlan({ isFeatured = false, className, children, ...props }: PricingPlanProps) {
  const id = React.useId();
  const [hasBadge, setHasBadge] = React.useState(false);
  const nameId = `${id}-name`;
  const priceId = `${id}-price`;
  const badgeId = `${id}-badge`;

  return (
    <PricingPlanContext.Provider value={{ nameId, priceId, badgeId, isFeatured, setHasBadge }}>
      <RadioCard
        data-slot="pricing-plan"
        data-featured={isFeatured || undefined}
        aria-labelledby={nameId}
        aria-describedby={hasBadge ? `${priceId} ${badgeId}` : priceId}
        className={cn("h-full", isFeatured && brandGlow, className)}
        {...props}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
      </RadioCard>
    </PricingPlanContext.Provider>
  );
}

/** The name with its badge on one line and the description under them. */
function PricingPlanHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pricing-plan-header"
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}
      {...props}
    />
  );
}

/** The plan's name; it names the radio. */
function PricingPlanName({ className, ...props }: React.ComponentProps<"span">) {
  const { nameId } = usePricingPlan("PricingPlanName");
  return (
    <span
      data-slot="pricing-plan-name"
      className={cn("text-base font-medium", className)}
      {...props}
      id={nameId}
    />
  );
}

/** A `Badge` ("Most popular"), `brand` on a featured plan; read with the price. */
function PricingPlanBadge(props: Omit<React.ComponentProps<typeof Badge>, "id">) {
  const { badgeId, isFeatured, setHasBadge } = usePricingPlan("PricingPlanBadge");
  React.useEffect(() => {
    setHasBadge(true);
    return () => setHasBadge(false);
  }, [setHasBadge]);
  return (
    <Badge
      data-slot="pricing-plan-badge"
      variant={isFeatured ? "brand" : "default"}
      {...props}
      id={badgeId}
    />
  );
}

/** What the plan is for; takes its own line under the name. */
function PricingPlanDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-plan-description"
      className={cn("basis-full text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * The price, formatted by the app ("R$ 59,90"), with its `period` after it
 * ("/month") and a `note` under it (the equivalent per year, a condition).
 * It describes the radio.
 */
function PricingPlanPrice({
  period,
  note,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { period?: React.ReactNode; note?: React.ReactNode }) {
  const { priceId } = usePricingPlan("PricingPlanPrice");
  return (
    <div
      data-slot="pricing-plan-price"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
      id={priceId}
    >
      <span>
        <span className="text-2xl font-semibold tabular-nums">{children}</span>
        {period && <span className="text-muted-foreground"> {period}</span>}
      </span>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  );
}

/** The `PricingPlanFeature`s, under a rule. */
function PricingPlanFeatures({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pricing-plan-features"
      className={cn("flex flex-col gap-2 border-t pt-4", className)}
      {...props}
    />
  );
}

/**
 * A feature of a plan: a check when included, a dash and muted text when not.
 * The state is read too ("Not included: …"), not only drawn.
 */
function PricingPlanFeature({
  isIncluded = true,
  className,
  children,
  ...props
}: React.ComponentProps<"li"> & { isIncluded?: boolean }) {
  const { labels: standalone } = useFmaMessages("pricingPlans", pricingPlansEn);
  const labels = React.useContext(PricingPlansContext) ?? standalone;
  return (
    <li
      data-slot="pricing-plan-feature"
      data-included={isIncluded}
      className={cn("flex items-start gap-2", !isIncluded && "text-muted-foreground", className)}
      {...props}
    >
      {isIncluded ? (
        <CheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
      ) : (
        <MinusIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      )}
      <span>
        <span className="sr-only">{isIncluded ? labels.included : labels.notIncluded}: </span>
        {children}
      </span>
    </li>
  );
}

export type { PricingPlanProps, PricingPlansI18n, PricingPlansLabels, PricingPlansProps };
export {
  PricingPeriod,
  PricingPeriodOption,
  PricingPlan,
  PricingPlanBadge,
  PricingPlanDescription,
  PricingPlanFeature,
  PricingPlanFeatures,
  PricingPlanGroup,
  PricingPlanHeader,
  PricingPlanName,
  PricingPlanPrice,
  PricingPlans,
};
