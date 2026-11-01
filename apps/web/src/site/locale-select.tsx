import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/select/select";
import { changeLanguage } from "@/lib/i18n-i18next/i18n-i18next";
import { cn } from "@/lib/utils";
import { fmaLocales, LOCALE_COOKIE } from "../i18n";

function Flag({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 14"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
      className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-foreground/10"
    >
      {children}
    </svg>
  );
}

// SVG, not emoji: Windows has no flag emoji and shows the letters instead.
const LANGUAGES = [
  {
    id: "en",
    title: "English",
    flag: (
      <>
        <rect width="20" height="14" fill="#fff" />
        <path
          d="M0 1h20M0 3.2h20M0 5.3h20M0 7.5h20M0 9.6h20M0 11.8h20M0 13.9h20"
          stroke="#b22234"
          strokeWidth="1.1"
        />
        <rect width="9" height="7.5" fill="#3c3b6e" />
      </>
    ),
  },
  {
    id: "pt-BR",
    title: "Português",
    flag: (
      <>
        <rect width="20" height="14" fill="#009739" />
        <path d="M10 1.5 18.5 7 10 12.5 1.5 7z" fill="#fedd00" />
        <circle cx="10" cy="7" r="3.3" fill="#012169" />
      </>
    ),
  },
];

/** The site's language: the flag when closed, flag and name in the list. A cookie keeps it. */
export function LocaleSelect({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const current = LANGUAGES.find(({ id }) => id === i18n.resolvedLanguage);
  return (
    <Select
      aria-label={t(($) => $.header.language)}
      selectedKey={i18n.resolvedLanguage}
      onSelectionChange={async (key) => {
        const lng = String(key);
        // biome-ignore lint/suspicious/noDocumentCookie: the server reads it on the next request.
        document.cookie = `${LOCALE_COOKIE}=${lng}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = lng;
        await changeLanguage(i18n, lng, fmaLocales);
        // Page titles come from the routes' head, which reads the language from the root loader.
        await router.invalidate();
      }}
    >
      <SelectTrigger className={cn("w-fit bg-background", className)}>
        <SelectValue>
          {() => current && <Flag label={current.title}>{current.flag}</Flag>}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(({ id, title, flag }) => (
          <SelectItem key={id} id={id} textValue={title}>
            <span className="flex items-center gap-2">
              <Flag>{flag}</Flag>
              {title}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
