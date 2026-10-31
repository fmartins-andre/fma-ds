import { useNavigate } from "@tanstack/react-router";
import { BoxIcon, FileTextIcon, LayoutTemplateIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/core/button/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/command/command";
import { Kbd, KbdGroup } from "@/core/kbd/kbd";
import { GUIDES } from "../guides";
import { BLOCKS, COMPONENTS } from "./registry";

const usePages = () => {
  const { t } = useTranslation();
  return [
    { id: "/docs", title: t(($) => $.nav.introduction) },
    ...GUIDES.map((guide) => ({ id: `/docs/${guide.slug}`, title: guide.title })),
    { id: "/components", title: t(($) => $.nav.components) },
    { id: "/blocks", title: t(($) => $.nav.blocks) },
    { id: "/themes", title: t(($) => $.nav.themeEditor) },
  ];
};

/** ⌘K / Ctrl+K search over the pages, components and blocks. */
export function SiteSearch() {
  const { t } = useTranslation();
  const pages = usePages();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    void navigate({ to: href });
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 text-muted-foreground sm:w-56 lg:w-64"
        onPress={() => setOpen(true)}
      >
        <SearchIcon />
        <span className="flex-1 truncate text-left">{t(($) => $.search.button)}</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t(($) => $.search.title)}
        description={t(($) => $.search.description)}
      >
        <Command>
          <CommandInput placeholder={t(($) => $.search.placeholder)} />
          <CommandList
            aria-label={t(($) => $.search.results)}
            onAction={(key) => go(String(key))}
            renderEmptyState={() => <CommandEmpty>{t(($) => $.search.empty)}</CommandEmpty>}
          >
            <CommandGroup heading={t(($) => $.search.pages)}>
              {pages.map((page) => (
                <CommandItem key={page.id} id={page.id} textValue={page.title}>
                  <FileTextIcon />
                  {page.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={t(($) => $.nav.components)}>
              {COMPONENTS.map((item) => (
                <CommandItem key={item.name} id={`/components/${item.name}`} textValue={item.title}>
                  <BoxIcon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={t(($) => $.nav.blocks)}>
              {BLOCKS.map((item) => (
                <CommandItem key={item.name} id={`/blocks/${item.name}`} textValue={item.title}>
                  <LayoutTemplateIcon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
