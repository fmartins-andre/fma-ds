import { Upload } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/core/button/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/dialog/dialog";
import { Input } from "@/core/input/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/tabs/tabs";
import { Textarea } from "@/core/textarea/textarea";
import { parseThemeInput, type Theme } from "@/lib/theme/index";
import { DEFAULT_THEME } from "@/themes/index";

const IDENTITY = { name: "custom", title: "Custom", description: "Imported in the theme editor." };

export function ImportDialog({ onImport }: { onImport: (theme: Theme) => void }) {
  const { t } = useTranslation("themeEditor");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const importText = (input: string) => {
    try {
      onImport(parseThemeInput(input, DEFAULT_THEME, IDENTITY));
      setError(null);
      setText("");
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button variant="outline">
        <Upload data-icon="inline-start" />
        {t(($) => $.import.action)}
      </Button>
      <Dialog className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(($) => $.import.title)}</DialogTitle>
          <DialogDescription>
            <Trans
              t={t}
              i18nKey={($) => $.import.description}
              values={{ id: "<id>" }}
              components={{ code: <code /> }}
            />
          </DialogDescription>
        </DialogHeader>
        <Tabs onSelectionChange={() => setError(null)}>
          <TabsList>
            <TabsTrigger id="paste">{t(($) => $.import.paste)}</TabsTrigger>
            <TabsTrigger id="url">{t(($) => $.import.url)}</TabsTrigger>
            <TabsTrigger id="file">{t(($) => $.import.file)}</TabsTrigger>
          </TabsList>
          <TabsContent id="paste" className="flex flex-col gap-3">
            <Textarea
              aria-label={t(($) => $.import.pasteLabel)}
              className="h-56 font-mono text-xs"
              placeholder={":root {\n  --background: oklch(1 0 0);\n  …\n}\n.dark { … }"}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <DialogFooter>
              <Button isDisabled={!text.trim()} onPress={() => importText(text)}>
                {t(($) => $.import.action)}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent id="url" className="flex flex-col gap-3">
            <Input
              aria-label={t(($) => $.import.urlLabel)}
              type="url"
              placeholder="https://tweakcn.com/r/themes/amethyst-haze.json"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <DialogFooter>
              <Button
                isDisabled={!url.trim() || busy}
                onPress={async () => {
                  setBusy(true);
                  try {
                    const response = await fetch(url.trim());
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    importText(await response.text());
                  } catch (cause) {
                    setError(
                      t(($) => $.import.fetchFailed, {
                        reason: cause instanceof Error ? cause.message : String(cause),
                      }),
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t(($) => (busy ? $.import.fetching : $.import.fetch))}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent id="file" className="flex flex-col gap-3">
            <Input
              aria-label={t(($) => $.import.fileLabel)}
              type="file"
              accept=".css,.json,text/css,application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) importText(await file.text());
              }}
            />
          </TabsContent>
        </Tabs>
        {error && (
          <p role="alert" className="text-sm text-destructive-foreground">
            {error}
          </p>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
