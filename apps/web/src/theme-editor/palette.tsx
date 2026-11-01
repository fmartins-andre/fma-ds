import { Trans, useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/table/table";
import { COLOR_GROUPS, checkContrast, type Theme, type ThemeMode } from "@/lib/theme/index";
import { ContrastBadge } from "./fields";
import type { themeEditor } from "./i18n/en";
import { themeInstall } from "./install";

export function Palette({ theme, mode }: { theme: Theme; mode: ThemeMode }) {
  const { t } = useTranslation("themeEditor");
  const colors = theme[mode];
  const results = checkContrast(theme, mode);
  const failing = results.filter((result) => !result.passes);
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-medium">
            {t(($) => $.contrast.title, { mode: t(($) => $.modes[mode]) })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              ($) =>
                failing.length === 0
                  ? $.contrast.allPass
                  : failing.length === 1
                    ? $.contrast.oneFails
                    : $.contrast.manyFail,
              { count: failing.length },
            )}
          </p>
        </div>
        <Table aria-label={t(($) => $.contrast.pairs)}>
          <TableHeader>
            <TableHead isRowHeader>{t(($) => $.contrast.sample)}</TableHead>
            <TableHead>{t(($) => $.contrast.text)}</TableHead>
            <TableHead>{t(($) => $.contrast.on)}</TableHead>
            <TableHead>{t(($) => $.contrast.minimum)}</TableHead>
            <TableHead className="text-right">{t(($) => $.contrast.ratio)}</TableHead>
          </TableHeader>
          <TableBody>
            {results.map(({ background: bg, foreground: fg, minimum, passes }) => {
              return (
                <TableRow
                  key={`${bg}/${fg}`}
                  id={`${bg}/${fg}`}
                  data-failing={!passes || undefined}
                >
                  <TableCell>
                    <span
                      className="inline-flex rounded-md px-2 py-1 text-sm font-medium ring-1 ring-foreground/10"
                      style={{ background: colors[bg], color: colors[fg] }}
                    >
                      Aa
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">--{fg}</TableCell>
                  <TableCell className="font-mono text-xs">--{bg}</TableCell>
                  <TableCell className="text-xs">{minimum}:1</TableCell>
                  <TableCell className="text-right">
                    <ContrastBadge background={colors[bg]} foreground={colors[fg]} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
      {COLOR_GROUPS.map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h2 className="font-heading text-sm font-medium text-muted-foreground">
            {t(($) => $.groups[group.id as keyof typeof themeEditor.groups])}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {group.colors.map(({ token }) => (
              <div key={token} className="flex items-center gap-3">
                <div
                  className="size-10 shrink-0 rounded-md ring-1 ring-foreground/10"
                  style={{ background: colors[token] }}
                />
                <div className="flex min-w-0 flex-col">
                  <code className="truncate text-xs">--{token}</code>
                  <code className="truncate text-xs text-muted-foreground">{colors[token]}</code>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TypographySample({ theme }: { theme: Theme }) {
  const { t } = useTranslation("showcase");
  return (
    <article className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        {t(($) => $.typography.pangram)}
      </h1>
      <p className="text-lg text-muted-foreground">
        <Trans
          t={t}
          i18nKey={($) => $.typography.lead}
          components={{ code: <code className="font-mono" /> }}
        />
      </p>
      <h2 className="font-heading text-2xl font-semibold">{t(($) => $.typography.sans)}</h2>
      <p className="leading-7">{t(($) => $.typography.sansText)}</p>
      <h2 className="font-heading text-2xl font-semibold">{t(($) => $.typography.serif)}</h2>
      <blockquote className="border-l-2 pl-4 font-serif text-lg italic">
        {t(($) => $.typography.quote)}
      </blockquote>
      <h2 className="font-heading text-2xl font-semibold">{t(($) => $.typography.mono)}</h2>
      <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm">
        {`${themeInstall(theme).command}\n\nconst ratio = contrastRatio(bg, fg); // 4.5:1`}
      </pre>
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-light">{t(($) => $.typography.light)}</span>
        <span className="font-normal">{t(($) => $.typography.regular)}</span>
        <span className="font-medium">{t(($) => $.typography.medium)}</span>
        <span className="font-semibold">{t(($) => $.typography.semibold)}</span>
        <span className="font-bold">{t(($) => $.typography.bold)}</span>
      </div>
    </article>
  );
}
