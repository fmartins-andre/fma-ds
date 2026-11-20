# Tokens do tom neutral: plano de implementação

Spec: `docs/plans/tone-variant-standard.md`, seção "Neutral" (revisão de 2026-11-19, decisões de
2026-11-20). Preview: https://claude.ai/artifact/M7CAYei9mACAdTB78vJKAa

**Status:** implementado no PR #81 (2026-11-20), junto com a correção do showcase de temas, a
padronização dos campos (`--input` = `--border` por padrão, `inputMix`, `bg-input-background`;
ver a seção "Campos" da spec) e a atualização do tema Cobalt.

Um PR contra a `main`, branch `feat/neutral-tokens`. As tarefas seguem a ordem das dependências:
tokens antes da receita, receita antes dos componentes.

## 1. Tokens

- `src/styles.css`: `--neutral`, `--neutral-foreground`, `--neutral-text` em `:root` e `.dark`
  (valores de `--muted-foreground`, `--background`, `--foreground` do mesmo modo) e
  `--color-neutral*` no `@theme inline`.
- `COLOR_TOKENS` (`lib/theme/schema.ts`) e `tests/required-tokens.ts`.
- Grupo `neutral` em `COLOR_GROUPS` (`lib/theme/editor-controls.ts`), com `tonePair`.
- Os 23 `src/themes/*.json`: mesmos valores iniciais, por script (sem mudança visual no solid).
- `design-tokens/color.stories.tsx`: os três tokens na story.

## 2. Importador e contraste

- `lib/theme/parse.ts`: fonte sem `--neutral` recebe `muted-foreground` / `background` /
  `foreground` do mesmo modo.
- `lib/theme/contrast.ts`: pares `fill("neutral", "neutral-foreground")` e
  `fill("background", "neutral")`; o gate de texto no tom e de ícone passa a incluir o neutral
  (`GATED_TONES`). `TEXT_TONES` continua só com os tons cujo `-text` é derivado do tom.
- Testes em `tests/lib/theme/` para os dois.

## 3. Receita

- `lib/tone.ts`: `neutral` vira bloco igual aos coloridos, com `--tone-line:var(--border)`.
- `tests/lib/tone.test.ts`: ajustar o que fixava o neutral na família muted.

## 4. Componentes que usavam muted como hover

- `menubar`, `navigation-menu`, `toggle`: hover/foco/pressionado pelas variáveis do tom neutral
  (`toneVariants.neutral` + `bg-(--tone-hover)` / `bg-(--tone-soft-hover)`).
- `date-field`: segmento focado em `accent` (é seleção de um item, o segmento).
- `DataGridRowDragHandle`: tom neutral.
- `tests/interaction-tokens.test.ts`: sai a exceção do neutral; a allowlist fica vazia ou só com
  casos com motivo próprio.
- Procurar outros `bg-muted` interativos em itens `shadcn` / `third-party`.

## 5. Gate de paleta fixa

- Teste novo `tests/fixed-palette.test.ts`: nada de
  `(bg|text|border|ring|fill|stroke|outline|from|via|to|divide|placeholder|decoration|shadow|caret|accent)-(neutral|gray|zinc|slate|stone)-<n>`
  em `src/core`, `src/blocks`, `src/lib`, `src/hooks`.
- `file-type.tsx`: `text-zinc-500` vira token.

## 6. Documentação

- `theming.md` e `tones.md` (en + pt-BR): tokens do neutral, muted só estático, nota sobre a
  paleta do Tailwind e a DaisyUI.
- AGENTS.md: regras 9, 10, 11 e 15; regra nova do gate de paleta fixa.
- `THIRD_PARTY_NOTICES.md`: os tokens do neutral são novos nos temas de terceiros.

## 7. Verificação

`pnpm check:changed` a cada etapa; no fim, Storybook dos componentes tocados, `pnpm verify` e
`pnpm --filter web test:e2e` (mexe em tokens e no editor). Um commit, um PR.
