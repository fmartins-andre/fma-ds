import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/accordion/accordion";
import { COLOR_GROUPS, type Theme, type ThemeMode } from "@/lib/theme/index";
import { ColorField } from "./fields";
import type { themeEditor } from "./i18n/en";

type ColorGroupId = keyof typeof themeEditor.groups;

export function ColorsPanel({
  theme,
  mode,
  edit,
  checkpoint,
}: {
  theme: Theme;
  mode: ThemeMode;
  edit: (update: (theme: Theme) => Theme) => void;
  /** Ends the undo step when a color pick finishes. */
  checkpoint: () => void;
}) {
  const { t } = useTranslation("themeEditor");
  const colors = theme[mode];
  return (
    <Accordion allowsMultipleExpanded defaultExpandedKeys={["primary", "secondary", "base"]}>
      {COLOR_GROUPS.map((group) => (
        <AccordionItem key={group.id} id={group.id}>
          <AccordionTrigger>{t(($) => $.groups[group.id as ColorGroupId])}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pb-1">
              {group.hint && (
                <p className="text-xs text-muted-foreground">
                  {t(($) => $.hints[group.id as keyof typeof $.hints])}
                </p>
              )}
              {group.colors.map(({ token, label, on }) => (
                <ColorField
                  key={token}
                  label={`${t(($) => $.colors[label as keyof typeof $.colors])} (--${token})`}
                  value={colors[token]}
                  contrastWith={on ? colors[on] : undefined}
                  onChangeEnd={checkpoint}
                  onChange={(value) =>
                    edit((current) => ({
                      ...current,
                      [mode]: { ...current[mode], [token]: value },
                    }))
                  }
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
