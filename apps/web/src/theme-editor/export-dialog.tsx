import { Check, Copy, Download } from "lucide-react";
import { useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/core/button/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/dialog/dialog";
import { Input } from "@/core/input/input";
import { Label } from "@/core/label/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/tabs/tabs";
import {
  generateIndexCss,
  generateThemeCss,
  type Theme,
  themeFontPackages,
  themeRegistryItem,
} from "@/lib/theme/index";
import baseCss from "@/styles.css?raw";
import { SHADCN_ADD } from "../site/shadcn";
import { themeInstall } from "./install";

function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}

function CopyButton({ text }: { text: string }) {
  const { t } = useTranslation("themeEditor");
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      onPress={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {t(($) => (copied ? $.export.copied : $.export.copy))}
    </Button>
  );
}

function Command({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 py-1 pr-1 pl-3">
      <code className="min-w-0 flex-1 truncate font-mono text-xs">{children}</code>
      <CopyButton text={children} />
    </div>
  );
}

export function ExportDialog({
  theme,
  edit,
}: {
  theme: Theme;
  edit: (update: (theme: Theme) => Theme) => void;
}) {
  const { t } = useTranslation("themeEditor");
  const nameId = useId();
  const titleId = useId();
  const { published, itemName, command } = themeInstall(theme);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const fontPackages = themeFontPackages(theme);

  const files = [
    {
      id: "index",
      label: "index.css",
      hint: t(($) => $.export.indexHint),
      filename: "index.css",
      type: "text/css",
      text: generateIndexCss(theme, baseCss),
    },
    {
      id: "vars",
      label: t(($) => $.export.variables),
      hint: t(($) => $.export.varsHint),
      filename: `${theme.name}.css`,
      type: "text/css",
      text: generateThemeCss(theme),
    },
    {
      id: "registry",
      label: t(($) => $.export.registryItem),
      hint: t(($) => $.export.registryHint),
      filename: `${itemName}.json`,
      type: "application/json",
      text: `${JSON.stringify(themeRegistryItem(theme), null, 2)}\n`,
    },
    {
      id: "json",
      label: t(($) => $.export.themeJson),
      hint: t(($) => $.export.jsonHint),
      filename: `${theme.name}.json`,
      type: "application/json",
      text: `${JSON.stringify(theme, null, 2)}\n`,
    },
  ];

  return (
    <DialogTrigger>
      <Button>
        <Download data-icon="inline-start" />
        {t(($) => $.export.action)}
      </Button>
      <Dialog className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t(($) => $.export.title)}</DialogTitle>
          <DialogDescription>{t(($) => $.export.description)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={nameId}>{t(($) => $.export.name)}</Label>
            <Input
              id={nameId}
              value={theme.name}
              onChange={(event) => {
                const name = event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                edit((current) => ({ ...current, name: name || "custom" }));
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleId}>{t(($) => $.export.nameTitle)}</Label>
            <Input
              id={titleId}
              value={theme.title}
              onChange={(event) => {
                const title = event.target.value;
                edit((current) => ({ ...current, title: title || "Custom" }));
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{t(($) => $.export.install)}</h3>
          {published ? (
            <>
              <Command>{command}</Command>
              <p className="text-xs text-muted-foreground">
                <Trans
                  t={t}
                  i18nKey={($) => $.export.needs}
                  values={{ registry: `"@fma-ds": "${origin}/r/{name}.json"` }}
                  components={{ code: <code /> }}
                />
              </p>
              <Command>{`${SHADCN_ADD} ${origin}/r/${itemName}.json`}</Command>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{t(($) => $.export.notHosted)}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    download(
                      `${itemName}.json`,
                      `${JSON.stringify(themeRegistryItem(theme), null, 2)}\n`,
                      "application/json",
                    )
                  }
                >
                  <Download data-icon="inline-start" />
                  {itemName}.json
                </Button>
              </div>
              <Command>{command}</Command>
            </>
          )}
        </div>
        <Tabs defaultSelectedKey="index" className="min-w-0">
          <TabsList>
            {files.map((file) => (
              <TabsTrigger key={file.id} id={file.id}>
                {file.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {files.map((file) => (
            <TabsContent key={file.id} id={file.id} className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{file.hint}</p>
                <div className="flex shrink-0 gap-1.5">
                  <CopyButton text={file.text} />
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => download(file.filename, file.text, file.type)}
                  >
                    <Download data-icon="inline-start" />
                    {file.filename}
                  </Button>
                </div>
              </div>
              {file.id === "index" && fontPackages.dependencies.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground">{t(($) => $.export.fontsNote)}</p>
                  <Command>{`npm install ${fontPackages.dependencies.join(" ")}`}</Command>
                </>
              )}
              {file.id === "index" && fontPackages.unpackaged.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t(($) => $.export.unpackaged, { fonts: fontPackages.unpackaged.join(", ") })}
                </p>
              )}
              <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs">
                {file.text}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </Dialog>
    </DialogTrigger>
  );
}
