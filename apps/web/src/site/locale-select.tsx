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

// Each language in its own name, so a reader can always find theirs.
const LANGUAGES = [
  { id: "en", title: "English" },
  { id: "pt-BR", title: "Português" },
];

/** The site's language; a cookie keeps it, so the server renders it next time. */
export function LocaleSelect({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  return (
    <Select
      aria-label={t(($) => $.header.language)}
      selectedKey={i18n.resolvedLanguage}
      onSelectionChange={(key) => {
        const lng = String(key);
        // biome-ignore lint/suspicious/noDocumentCookie: the server reads it on the next request.
        document.cookie = `${LOCALE_COOKIE}=${lng}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = lng;
        void changeLanguage(i18n, lng, fmaLocales);
      }}
    >
      <SelectTrigger className={cn("w-32 bg-background font-medium", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(({ id, title }) => (
          <SelectItem key={id} id={id}>
            {title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
