"use client";

import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";

type SpinnerConfig = {
  labels: {
    loading: string;
  };
};

declare global {
  interface FmaNamespaces {
    spinner: SpinnerConfig;
  }
}

export const spinnerEn: DictionaryNamespace<SpinnerConfig> = {
  labels: {
    loading: "Loading",
  },
};

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { labels } = useFmaMessages("spinner", spinnerEn);
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label={labels.loading}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
