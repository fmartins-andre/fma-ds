"use client";

import * as React from "react";
import type { DictionaryNamespace } from "@/lib/i18n/i18n";
import type { AppSidebarConfig } from "./types";

declare global {
  interface FmaNamespaces {
    appSidebar: AppSidebarConfig;
  }
}

export const appSidebarEn: DictionaryNamespace<AppSidebarConfig> = {
  labels: {
    opensInNewTab: "opens in new tab",
    team: "Team",
    teams: "Teams",
    account: "Account",
  },
};

/** The block's own texts, in the active language; `AppSidebar` provides them. */
export const AppSidebarLabelsContext = React.createContext(appSidebarEn.labels);
