// The app-sidebar block (packages/ds/src/blocks/app-sidebar) under the theme
// being edited: the only place the --sidebar-* tokens show up.

import {
  BookOpenIcon,
  BotIcon,
  BuildingIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  HomeIcon,
  MapIcon,
  Settings2Icon,
} from "lucide-react";
import { useState } from "react";
import { RouterProvider } from "react-aria-components";
import { Trans, useTranslation } from "react-i18next";
import {
  AppSidebar,
  type AppSidebarData,
  AppSidebarItem,
  AppSidebarSection,
  AppSidebarSubItem,
} from "@/blocks/app-sidebar/app-sidebar";
import { Badge } from "@/core/badge/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/card/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/core/sidebar/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/core/toggle-group/toggle-group";

type Variant = "sidebar" | "floating" | "inset";

// Links only move a "current page" marker; nothing leaves the editor.
function useFakeRouter() {
  const [path, setPath] = useState("/home");
  return { path, navigate: (href: string) => setPath(href) };
}

export function SidebarPreview() {
  const [variant, setVariant] = useState<Variant>("sidebar");
  const { path, navigate } = useFakeRouter();
  const { t } = useTranslation("showcase");
  const data: AppSidebarData = {
    user: { name: "Ada Lovelace", email: "ada@example.com", avatar: "" },
    teams: [
      { name: "Acme Inc", plan: "Enterprise", logo: <GalleryVerticalEndIcon className="size-4" /> },
      { name: "Acme Corp.", plan: "Startup", logo: <BuildingIcon className="size-4" /> },
    ],
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <Trans
            t={t}
            i18nKey={($) => $.sidebar.lead}
            components={{ code: <code className="font-mono" /> }}
          />
        </p>
        <ToggleGroup
          aria-label={t(($) => $.sidebar.variant)}
          selectionMode="single"
          disallowEmptySelection
          variant="outline"
          size="sm"
          spacing={0}
          selectedKeys={[variant]}
          onSelectionChange={(keys) => {
            const [key] = [...keys];
            if (key) setVariant(key as Variant);
          }}
        >
          <ToggleGroupItem id="sidebar">{t(($) => $.sidebar.sidebar)}</ToggleGroupItem>
          <ToggleGroupItem id="floating">{t(($) => $.sidebar.floating)}</ToggleGroupItem>
          <ToggleGroupItem id="inset">{t(($) => $.sidebar.inset)}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {/*
        The sidebar is fixed to the viewport (h-svh) in a real app shell; here it's
        pinned inside this frame instead. transform makes the frame the containing
        block for anything still fixed.
      */}
      <div className="relative h-[620px] transform-gpu overflow-hidden rounded-xl border [&_[data-slot=sidebar-container]]:absolute! [&_[data-slot=sidebar-container]]:h-full!">
        <RouterProvider navigate={navigate}>
          <SidebarProvider className="h-full min-h-0">
            <AppSidebar data={data} variant={variant}>
              <AppSidebarSection title={t(($) => $.sidebar.platform)}>
                <AppSidebarItem
                  title={t(($) => $.sidebar.home)}
                  href="/home"
                  icon={<HomeIcon />}
                  isActive
                />
                <AppSidebarItem title={t(($) => $.sidebar.models)} icon={<BotIcon />} isActive>
                  <AppSidebarSubItem title="Genesis" href="/models/genesis" />
                  <AppSidebarSubItem title="Explorer" href="/models/explorer" />
                </AppSidebarItem>
                <AppSidebarItem
                  title={t(($) => $.sidebar.docs)}
                  icon={<BookOpenIcon />}
                  variant="dropdown"
                >
                  <AppSidebarSubItem title={t(($) => $.sidebar.introduction)} href="/docs/intro" />
                  <AppSidebarSubItem title={t(($) => $.sidebar.changelog)} href="/docs/changelog" />
                </AppSidebarItem>
                <AppSidebarItem title={t(($) => $.sidebar.settings)} icon={<Settings2Icon />}>
                  <AppSidebarSubItem title={t(($) => $.sidebar.general)} href="/settings/general" />
                  <AppSidebarSubItem title={t(($) => $.sidebar.billing)} href="/settings/billing" />
                </AppSidebarItem>
              </AppSidebarSection>
              <AppSidebarSection title={t(($) => $.sidebar.projects)}>
                <AppSidebarItem
                  title={t(($) => $.sidebar.design)}
                  href="/projects/design"
                  icon={<FrameIcon />}
                />
                <AppSidebarItem
                  title={t(($) => $.sidebar.travel)}
                  href="/projects/travel"
                  icon={<MapIcon />}
                />
              </AppSidebarSection>
            </AppSidebar>
            <SidebarInset className="min-w-0">
              <header className="flex h-12 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground">Acme Inc</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="font-mono text-sm">{path}</span>
              </header>
              <div className="grid gap-4 overflow-auto p-4 sm:grid-cols-3">
                {[
                  { title: t(($) => $.sidebar.revenue), value: "R$ 45.231", delta: "+20.1%" },
                  { title: t(($) => $.sidebar.subscriptions), value: "2.350", delta: "+180" },
                  { title: t(($) => $.sidebar.active), value: "573", delta: "+12" },
                ].map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader>
                      <CardDescription>{stat.title}</CardDescription>
                      <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="success-light">{stat.delta}</Badge>
                    </CardContent>
                  </Card>
                ))}
                <div className="h-56 rounded-xl bg-muted/50 sm:col-span-3" />
              </div>
            </SidebarInset>
          </SidebarProvider>
        </RouterProvider>
      </div>
    </div>
  );
}
