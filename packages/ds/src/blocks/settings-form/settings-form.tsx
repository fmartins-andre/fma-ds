"use client";

import { cn } from "cn";
import * as React from "react";
import { Form } from "react-aria-components";
import { Button } from "@/core/button/button";
import { Spinner } from "@/core/spinner/spinner";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";

type SettingsFormLabels = {
  save: string;
  discard: string;
  /** Status line while `isPending`. */
  saving: string;
  /** Status line while `isDirty`. */
  unsaved: string;
  /** Status line with nothing to save. */
  saved: string;
};

export type SettingsFormConfig = { labels: SettingsFormLabels };

declare global {
  interface FmaNamespaces {
    settingsForm: SettingsFormConfig;
  }
}

export const settingsFormEn: DictionaryNamespace<SettingsFormConfig> = {
  labels: {
    save: "Save changes",
    discard: "Discard",
    saving: "Saving…",
    unsaved: "You have unsaved changes",
    saved: "No unsaved changes",
  },
};

type SettingsFormI18n = { labels?: Partial<SettingsFormLabels> };

type SettingsFormContextValue = {
  isDirty: boolean;
  isPending: boolean;
  onReset?: () => void;
  /** Without `isDirty`, Discard is a native reset button. */
  isDetected: boolean;
  labels: SettingsFormLabels;
};

const SettingsFormContext = React.createContext<SettingsFormContextValue | null>(null);

function useSettingsForm() {
  const context = React.useContext(SettingsFormContext);
  if (!context) throw new Error("SettingsForm parts must be used within a SettingsForm.");
  return context;
}

type SettingsFormProps = Omit<React.ComponentProps<typeof Form>, "onReset"> & {
  /**
   * Whether anything changed since the last save; enables Save and Discard.
   * Leave it out for uncontrolled fields: the form compares its data with the
   * data it started with.
   */
  isDirty?: boolean;
  /** While saving: Save shows a spinner and both actions wait. */
  isPending?: boolean;
  /**
   * Shows a Discard button that calls it (restore the saved values here).
   * Without `isDirty`, Discard is always there and resets the fields to their
   * default values; this is then called after that reset.
   */
  onReset?: () => void;
  i18n?: SettingsFormI18n;
};

/** The form's data as a string, to compare with the data it started with. */
function serializeForm(form: HTMLFormElement) {
  return JSON.stringify(
    [...new FormData(form)].map(([name, value]) => [
      name,
      typeof value === "string" ? value : value.name,
    ]),
  );
}

// Events that can change a field: typing, picking (react-aria's pickers live in a
// portal, but React events still reach the form) and keys. The check waits a frame
// so the field's own state is in the DOM.
const CHANGE_EVENTS = [
  "onInputCapture",
  "onChangeCapture",
  "onClickCapture",
  "onKeyUpCapture",
] as const;

/**
 * Without `isDirty`, compares the form's data with the data it had on mount.
 * Fields need a `name` to count; after saving, remount the form (a new `key`)
 * so the saved values become its defaults.
 */
function useDetectedDirty(isEnabled: boolean) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const initial = React.useRef<string | null>(null);
  const frame = React.useRef(0);
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    if (isEnabled && formRef.current) initial.current = serializeForm(formRef.current);
    return () => cancelAnimationFrame(frame.current);
  }, [isEnabled]);

  const check = React.useCallback(() => {
    if (!isEnabled) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const form = formRef.current;
      if (form && initial.current !== null) setIsDirty(serializeForm(form) !== initial.current);
    });
  }, [isEnabled]);

  return { formRef, isDirty, check };
}

/**
 * A long edit form split into sections, saved as a whole. The state stays in
 * the app (react-hook-form's `formState.isDirty`, a mutation's `isPending`);
 * the form only shows it. Without `isDirty`, the form works it out by itself
 * for uncontrolled fields. Put `SettingsSection`s inside and end with a
 * `SettingsFormFooter`.
 */
function SettingsForm({
  isDirty: isDirtyProp,
  isPending = false,
  onReset,
  i18n,
  className,
  ref,
  ...props
}: SettingsFormProps) {
  const { labels } = useFmaMessages("settingsForm", settingsFormEn, i18n);
  const isDetected = isDirtyProp === undefined;
  const detected = useDetectedDirty(isDetected);
  const isDirty = isDetected ? detected.isDirty : isDirtyProp;
  const context = React.useMemo(
    () => ({ isDirty, isPending, onReset, isDetected, labels }),
    [isDirty, isPending, onReset, isDetected, labels],
  );

  const { formRef, check } = detected;
  const setRef = React.useCallback(
    (node: HTMLFormElement | null) => {
      formRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [formRef, ref],
  );

  // react-aria's Form passes every DOM prop to the <form>, though its type lists
  // only some of them.
  type Handler = (event: React.SyntheticEvent) => void;
  const detectionProps: Record<string, Handler> = {};
  if (isDetected) {
    for (const name of CHANGE_EVENTS) {
      const own = (props as Record<string, unknown>)[name] as Handler | undefined;
      detectionProps[name] = (event) => {
        own?.(event);
        check();
      };
    }
    detectionProps.onReset = () => {
      check();
      onReset?.();
    };
  }

  return (
    <SettingsFormContext.Provider value={context}>
      <Form
        data-slot="settings-form"
        aria-busy={isPending || undefined}
        className={cn("@container/settings-form flex w-full min-w-0 flex-col", className)}
        ref={setRef}
        {...props}
        {...detectionProps}
      />
    </SettingsFormContext.Provider>
  );
}

/**
 * One group of settings: title and description above its fields, which sit
 * in a two-column grid when there's room; give a field `col-span-full` to
 * take the whole row.
 */
function SettingsSection({
  title,
  description,
  headingLevel = 2,
  className,
  contentClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  headingLevel?: 2 | 3 | 4;
  contentClassName?: string;
}) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-slot="settings-section"
      className={cn("grid gap-4 border-b py-8 first:pt-0 last-of-type:border-b-0", className)}
      {...props}
    >
      <div data-slot="settings-section-header" className="flex flex-col gap-1">
        <Heading id={titleId} className="text-base font-medium">
          {title}
        </Heading>
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="@container/settings-section min-w-0">
        <div
          data-slot="settings-section-content"
          className={cn("grid gap-4 @md/settings-section:grid-cols-2", contentClassName)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The save bar, stuck to the bottom of the viewport while the form scrolls:
 * the save state (announced politely), Discard when the form has `onReset`
 * or works out `isDirty` by itself,
 * and Save. `children` go before the buttons (a "last saved" note, a help link).
 */
function SettingsFormFooter({
  className,
  children,
  framed = true,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * `false` drops its own bar (sticky, separator, background), so it fits a footer that
   * frames it (a sticky `CardFooter`): it only takes the full width there.
   */
  framed?: boolean;
}) {
  const { isDirty, isPending, onReset, isDetected, labels } = useSettingsForm();
  const status = isPending ? labels.saving : isDirty ? labels.unsaved : labels.saved;

  return (
    <div
      data-slot="settings-form-footer"
      data-framed={framed || undefined}
      className={cn(
        "flex w-full flex-wrap items-center gap-3",
        framed && "sticky bottom-0 z-10 border-t bg-background py-3",
        className,
      )}
      {...props}
    >
      <p
        role="status"
        data-dirty={isDirty || undefined}
        className="mr-auto text-sm text-muted-foreground data-dirty:text-foreground"
      >
        {status}
      </p>
      {children}
      <div className="ml-auto flex items-center gap-2">
        {isDetected ? (
          <Button variant="outline" type="reset" isDisabled={!isDirty || isPending}>
            {labels.discard}
          </Button>
        ) : (
          onReset && (
            <Button variant="outline" isDisabled={!isDirty || isPending} onPress={onReset}>
              {labels.discard}
            </Button>
          )
        )}
        <Button type="submit" isDisabled={!isDirty} isPending={isPending}>
          {isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
          {labels.save}
        </Button>
      </div>
    </div>
  );
}

export type { SettingsFormI18n, SettingsFormLabels, SettingsFormProps };
export { SettingsForm, SettingsFormFooter, SettingsSection };
