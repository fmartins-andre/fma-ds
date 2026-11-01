"use client";

import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import type * as React from "react";
import { LinkButton } from "@/core/button/button";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";

type PaginationConfig = {
  labels: {
    previous: string;
    next: string;
    goToPrevious: string;
    goToNext: string;
    morePages: string;
  };
};

declare global {
  interface FmaNamespaces {
    pagination: PaginationConfig;
  }
}

export const paginationEn: DictionaryNamespace<PaginationConfig> = {
  labels: {
    previous: "Previous",
    next: "Next",
    goToPrevious: "Go to previous page",
    goToNext: "Go to next page",
    morePages: "More pages",
  },
};

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Omit<React.ComponentProps<typeof LinkButton>, "variant">;

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <LinkButton
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const { labels } = useFmaMessages("pagination", paginationEn);
  return (
    <PaginationLink
      aria-label={labels.goToPrevious}
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text ?? labels.previous}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const { labels } = useFmaMessages("pagination", paginationEn);
  return (
    <PaginationLink
      aria-label={labels.goToNext}
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text ?? labels.next}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  const { labels } = useFmaMessages("pagination", paginationEn);
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">{labels.morePages}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
