import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRightIcon, MenuIcon, MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button, LinkButton } from "@/core/button/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/core/navigation-menu/navigation-menu";
import { Separator } from "@/core/separator/separator";
import { Sheet, SheetHeader, SheetTitle, SheetTrigger } from "@/core/sheet/sheet";
import { cn } from "@/lib/utils";
import { DocsNav } from "./docs-nav";
import { LocaleSelect } from "./locale-select";
import { plainSummaryOf } from "./markdown";
import type { Mode } from "./mode";
import { BLOCKS, REPO_URL, STORYBOOK_URL } from "./registry";
import { SiteSearch } from "./search";
import { ThemeSelect } from "./theme-select";
import { useComponentsByCategory } from "./use-categories";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex shrink-0 items-center gap-2 font-heading font-semibold whitespace-nowrap",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-6 place-items-center rounded-md bg-primary text-xs text-primary-foreground"
      >
        fm
      </span>
      fma-ds
    </Link>
  );
}

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}

function ComponentsMenu() {
  const { t } = useTranslation();
  const groups = useComponentsByCategory();
  return (
    <NavigationMenuContent aria-label={t(($) => $.header.components)}>
      <div className="max-h-[70vh] w-[min(52rem,calc(100vw-2rem))] columns-2 gap-4 overflow-y-auto p-2 md:columns-4">
        {groups.map((group) => (
          <div key={group.category} className="mb-3 flex break-inside-avoid flex-col">
            <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {group.title}
            </span>
            {group.items.map((item) => (
              <NavigationMenuLink
                key={item.name}
                href={`/components/${item.name}`}
                className="py-1"
              >
                {item.title}
              </NavigationMenuLink>
            ))}
          </div>
        ))}
      </div>
      <Separator />
      <NavigationMenuLink href="/components" className="m-1 font-medium">
        {t(($) => $.header.browseComponents)}
      </NavigationMenuLink>
    </NavigationMenuContent>
  );
}

function BlocksMenu() {
  const { t } = useTranslation();
  return (
    <NavigationMenuContent aria-label={t(($) => $.header.blocks)}>
      <ul className="grid w-96 gap-1">
        {BLOCKS.map((item) => (
          <li key={item.name}>
            <NavigationMenuLink href={`/blocks/${item.name}`} className="items-start">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{item.title}</span>
                <span className="line-clamp-2 text-muted-foreground">
                  {plainSummaryOf(item.description)}
                </span>
              </span>
            </NavigationMenuLink>
          </li>
        ))}
        <li>
          <Separator className="my-1" />
          <NavigationMenuLink href="/blocks" className="font-medium">
            {t(($) => $.header.browseBlocks)}
          </NavigationMenuLink>
        </li>
      </ul>
    </NavigationMenuContent>
  );
}

function MainNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;
  return (
    <NavigationMenu aria-label={t(($) => $.header.main)} openOnHover className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/docs"
            aria-current={current("/docs")}
            className={navigationMenuTriggerStyle()}
          >
            {t(($) => $.header.docs)}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t(($) => $.header.components)}</NavigationMenuTrigger>
          <ComponentsMenu />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t(($) => $.header.blocks)}</NavigationMenuTrigger>
          <BlocksMenu />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/themes"
            aria-current={current("/themes")}
            className={navigationMenuTriggerStyle()}
          >
            {t(($) => $.header.themes)}
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href={STORYBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className={navigationMenuTriggerStyle()}
          >
            Storybook
            <ArrowUpRightIcon className="size-3 text-muted-foreground" aria-hidden="true" />
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <SheetTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t(($) => $.header.openMenu)}
        className="md:hidden"
      >
        <MenuIcon />
      </Button>
      <Sheet side="left" isDismissable className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <ThemeSelect className="mx-4 w-auto" />
        <LocaleSelect className="mx-4 w-auto" />
        <DocsNav className="px-2 pb-6" onNavigate={() => setOpen(false)} />
      </Sheet>
    </SheetTrigger>
  );
}

export function SiteHeader({
  mode,
  onModeChange,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 md:px-6">
        <MobileNav />
        <Logo className="mr-4" />
        <MainNav />
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1 md:flex-none">
          <div className="w-full min-w-0 flex-1 md:w-auto md:flex-none">
            <SiteSearch />
          </div>
          <ThemeSelect className="hidden md:flex" />
          <LocaleSelect className="hidden md:flex" />
          <LinkButton
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            size="icon"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-4" />
          </LinkButton>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t(($) => (mode === "dark" ? $.header.toLight : $.header.toDark))}
            onPress={() => onModeChange(mode === "dark" ? "light" : "dark")}
          >
            {mode === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-6">
        <p>
          <Trans
            t={t}
            i18nKey={($) => $.footer.builtOn}
            components={{
              aria: (
                // biome-ignore lint/a11y/useAnchorContent: Trans fills it.
                <a
                  href="https://react-spectrum.adobe.com/react-aria/"
                  className="underline underline-offset-4"
                />
              ),
              registry: (
                // biome-ignore lint/a11y/useAnchorContent: Trans fills it.
                <a
                  href="https://ui.shadcn.com/docs/registry"
                  className="underline underline-offset-4"
                />
              ),
            }}
          />
        </p>
        <div className="flex gap-4">
          <a href={`${REPO_URL}/blob/main/LICENSE`} className="underline underline-offset-4">
            {t(($) => $.footer.license)}
          </a>
          <a href="/llms.txt" className="underline underline-offset-4">
            llms.txt
          </a>
          <a href={REPO_URL} className="underline underline-offset-4">
            {t(($) => $.footer.source)}
          </a>
        </div>
      </div>
    </footer>
  );
}
