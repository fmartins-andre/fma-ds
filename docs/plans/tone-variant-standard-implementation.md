# Padrão variant × tone: plano de implementação

> **Status:** executado e mergeado (PRs #76–#80, 2026-11-17). O neutral na família muted descrito
> aqui foi substituído por tokens próprios no PR #81; ver `neutral-tokens-implementation.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Badge, Button, IconTile, Alert, Bubble e Glance passam a expor `variant` × `tone`
com receitas únicas, `--X-foreground` passa a ser texto sobre a cor cheia em todos os tons, cada
tom colorido ganha o token `--X-text` (texto no tom), e `--secondary` / `--invert` deixam de
existir.

**Architecture:** Uma lib publicada (`@/lib/tone`) traduz cada tom num conjunto fixo de
variáveis CSS (`--tone-*`); os componentes só leem essas variáveis nas receitas de variante
e não conhecem tons. Os temas mudam primeiro (semântica do `-foreground`), depois os
componentes, por fim os tokens aposentados.

**Tech Stack:** React 19, react-aria-components, Tailwind v4 (CSS-first), class-variance-authority,
Vitest, Storybook (testes de interação), Biome.

**Spec:** [docs/plans/tone-variant-standard.md](tone-variant-standard.md)

## Global Constraints

- Tons, exatamente: `brand`, `primary`, `neutral`, `success`, `warning`, `info`, `destructive`.
- Variantes, exatamente: `solid`, `soft`, `outline`, `ghost`. Sem aliases dos nomes antigos.
- Soft: sem borda (`border-transparent`), mistura opaca com `--background`: 10% claro / 18% escuro
  por padrão (`softMix` do tema); hover = 1.8 × o soft.
- Outline: borda com 38% claro / 45% escuro do tom.
- Texto no tom: token `--X-text` (primary, brand, success, warning, info, destructive); valor
  inicial = 50% do tom com `--foreground` em oklab, ajustado só em L quando reprova o gate.
- Ícone e dot: `color-mix(in oklab, var(--X), var(--X-text) var(--tone-icon-mix, 42%))`; o tema
  pode definir `iconMix`.
- Os componentes leem sempre os tokens (`--X-foreground`, `--X-text`); nada deriva texto de
  `--background` / `--foreground` em runtime.
- Neutral nunca usa `--accent`, `--secondary` nem `--invert`.
- Contraste mínimo dos pares de cor cheia: 3:1 (`fill` em `contrast.ts`).
- Fluxo do AGENTS.md: um branch por PR, sem commit no meio; `pnpm check:changed` a cada task;
  `pnpm verify` + um commit no fim de cada PR; os PRs formam um stack (`gh stack`), porque
  cada um depende do anterior.
- `registry.json` e `apps/web/public/r/*` são gerados: regenerar com
  `pnpm --filter @fma-ds/ds build` e commitar junto.
- Componentes editados com `source: "shadcn"` viram `"customized"` no `meta.json`.
- Texto novo de interface do site entra em pt-BR e en (`tests/site-translations.test.ts`).

## Review Focus

1. **Alert soft dentro de um Card**: a mistura parte de `--background`; num Card de cor diferente
   o fundo do Alert destoa. Story `InsideCard` no Alert (Task 7) para checagem visual.
2. **Modo escuro das variáveis**: as porcentagens trocam no `.dark`; um esquecimento deixa o soft
   escuro com 10%. Teste da lib (Task 3) exige as versões `dark:` de cada porcentagem.
3. **Troca dinâmica de variante sem deslocar layout**: IconTile ghost ↔ soft e Button ghost ↔
   outline mantêm dimensões. Teste de contrato (Task 4 e Task 6).
4. **Tema importado do tweakcn sem nossos status nem `-text`**: os valores derivados precisam
   passar no gate. Teste em `parse.test.ts` (Task 2) usando `deriveToneText` (Task 1b).
6. **`--X-text` defasado depois de editar o tom no `/themes`**: o botão "derivar do tom" (Task 1b)
   recalcula; o gate mostra o par reprovado enquanto isso.
5. **Código vendorizado depois com `bg-secondary` / `bg-invert`**: a classe deixaria de pintar sem
   erro. Teste que proíbe esses tokens (Task 10).

---

## PR 1 · `feat/tone-tokens`: semântica do `-foreground` e revisão dos temas

Antes da Task 1: `git checkout main && git pull && git checkout -b feat/tone-tokens`.

### Task 1: `-foreground` de status sobre a cor cheia

**Files:**
- Modify: `packages/ds/src/lib/theme/contrast.ts`
- Modify: `packages/ds/src/styles.css` (`:root` e `.dark`, os quatro `--*-foreground` de status)
- Modify: `packages/ds/src/themes/*.json` (23 arquivos)
- Modify: `packages/ds/src/themes/THIRD_PARTY_NOTICES.md`
- Test: `packages/ds/tests/themes.test.ts`

**Interfaces:**
- Produces: em todo tema e modo, `X-foreground` legível sobre `X` (≥ 3:1) para X em
  success/warning/info/destructive. O valor é do tema: o padrão é o `background` do modo, mas
  um status claro pode ter `-foreground` escuro (e vice-versa). Os componentes leem sempre
  `--X-foreground`.

- [ ] **Step 1: Trocar os pares de status em `CONTRAST_PAIRS`**

Substituir os quatro `fill("background", "X-foreground")` por `fill("X", "X-foreground")` e
adicionar `fill("background", "X")` para os quatro status (borda e preenchimento contra a
página). Atualizar o comentário: o `-foreground` de status é texto sobre a cor cheia. Não há
teste de igualdade com `background`: o gate é a única regra, como no `primary-foreground`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- themes`
Expected: FAIL nos pares `X / X-foreground` da maioria dos temas (os valores atuais são texto
sobre o fundo tingido).

- [ ] **Step 3: Aplicar os valores**

Valor inicial de `X-foreground` em cada tema e modo: o `background` do mesmo modo, copiado
como valor (não `var(--background)`), para o token continuar independente e editável (também
no `default.json` e no `styles.css`, que precisam bater). Depois, exatamente estas 10 cores de
status mudam de luminosidade (croma e matiz iguais):

| tema | modo | status | antes | depois |
|---|---|---|---|---|
| cobalt | light | warning | `oklch(0.72 0.155 65.19)` | `oklch(0.665 0.155 65.19)` |
| cosmic-night | light | destructive | `oklch(0.686 0.206 14.994)` | `oklch(0.671 0.206 14.994)` |
| indigo | light | success | `oklch(0.644 0.175 146.88)` | `oklch(0.639 0.175 146.88)` |
| indigo | light | warning | `oklch(0.72 0.155 65.19)` | `oklch(0.665 0.155 65.19)` |
| kodama-grove | light | destructive | `oklch(0.714 0.098 29.983)` | `oklch(0.589 0.098 29.983)` |
| nature | dark | destructive | `oklch(0.539 0.194 26.725)` | `oklch(0.569 0.194 26.725)` |
| plum | light | success | `oklch(0.644 0.175 146.88)` | `oklch(0.639 0.175 146.88)` |
| plum | light | warning | `oklch(0.72 0.155 65.19)` | `oklch(0.665 0.155 65.19)` |
| supabase | dark | destructive | `oklch(0.312 0.085 29.788)` | `oklch(0.502 0.085 29.788)` |
| vintage-paper | dark | destructive | `oklch(0.547 0.144 32.915)` | `oklch(0.562 0.144 32.915)` |

E o `muted` que hoje some contra a página:

| tema | modo | antes | depois |
|---|---|---|---|
| elegant-luxury | dark | `oklch(0.229 0.006 56.071)` | `oklch(0.276 0.006 56.071)` |
| ocean-breeze | light | `oklch(0.967 0.003 264.542)` | `oklch(0.945 0.003 264.542)` |

Para cada tema `third-party` alterado, uma linha no `THIRD_PARTY_NOTICES.md` dizendo que os
`*-foreground` de status foram redefinidos e quais cores foram ajustadas (a linha é completada
nas Tasks 1b e 1c).

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @fma-ds/ds test -- themes`
Expected: PASS.

### Task 1b: tokens `--X-text`

Texto no tom (soft, outline, ghost, título do Alert outline, texto do Bubble outline) vira token
de cor, um por tom colorido: `primary-text`, `brand-text`, `success-text`, `warning-text`,
`info-text`, `destructive-text`. Neutral não tem (usa `--foreground`).

**Files:**
- Modify: `packages/ds/src/styles.css` (`:root`, `.dark`, `@theme inline` → `--color-X-text`)
- Modify: `packages/ds/src/lib/theme/schema.ts` (`COLOR_TOKENS`)
- Modify: `packages/ds/tests/required-tokens.ts`
- Modify: `packages/ds/src/lib/theme/editor-controls.ts` (`COLOR_GROUPS`: cada `X-text` no grupo do
  seu tom, ao lado de `X` e `X-foreground`)
- Modify: `packages/ds/src/lib/theme/color.ts` (`mixColors`)
- Create: `packages/ds/src/lib/theme/tone-text.ts` (`deriveToneText`)
- Modify: `packages/ds/src/lib/theme/contrast.ts` (pares do texto no tom)
- Modify: `apps/web/src/theme-editor/palette.tsx` (tabela lê os valores resolvidos)
- Modify: `apps/web/src/theme-editor/` (botão "derivar do tom" no controle de cor de cada
  `X-text`; textos em `i18n/en.ts` e `i18n/pt-BR.ts`)
- Modify: `packages/ds/src/themes/*.json` (23 arquivos) e `THIRD_PARTY_NOTICES.md`
- Test: `packages/ds/tests/lib/theme/tone-text.test.ts`, `packages/ds/tests/lib/theme/contrast.test.ts`,
  `packages/ds/tests/themes.test.ts`, `packages/ds/tests/theme-editor-coverage.test.ts`

**Interfaces:**
- Consumes: Task 1 (valores de status revisados).
- Produces (usados pelas Tasks 1c, 2 e 3):
  - `export function mixColors(a: string, b: string, shareOfB: number): string` em `color.ts`
    (oklab, como `color-mix(in oklab, a, b <share>)`).
  - Em `contrast.ts`: `export const TONE_MIX = { text: 0.5, icon: 0.42, soft: { light: 0.1,
    dark: 0.18 }, softHover: 1.8, line: { light: 0.38, dark: 0.45 } } as const` (`softHover` é o
    fator sobre o soft), fonte única das porcentagens (a lib `tone` da Task 3 é testada contra ela). `text` é a
    parcela de `--foreground` do valor inicial do `-text`; `icon` é o padrão da Task 1c.
  - `export const TEXT_TONES = ["primary","brand","success","warning","info","destructive"] as const`
    e `export type TextTone` em `tone-text.ts`.
  - `export function deriveToneText(colors: ThemeColors, tone: TextTone, mode: ThemeMode): string`:
    `mixColors(colors[tone], colors.foreground, TONE_MIX.text)`, convertido para
    `oklch(L C H)` com 3 casas; se reprovar o gate do texto no tom (tabela abaixo), move só o L
    em passos de 0.005, para longe do `background`, até passar. Usado pelo importador (Task 2),
    pelo botão do editor e para semear os temas.
  - `ContrastResult` ganha `backgroundValue: string` e `foregroundValue: string` (cores
    resolvidas); `background` / `foreground` passam a ser rótulos (`string`) para caber par
    calculado.

- [ ] **Step 1: Testes**

Em `tone-text.test.ts`:

```ts
it("starts from half tone, half foreground", () => {
  expect(deriveToneText(DEFAULT_THEME.light, "success", "light")).toBe("oklch(0.336 0.077 150.069)");
});
it("moves only L when the mix fails", () => {
  const kodama = THEMES.find((t) => t.name === "kodama-grove");
  expect(deriveToneText(kodama.light, "primary", "light")).toBe("oklch(0.461 0.062 106.4)");
});
```

Em `contrast.test.ts`:

```ts
it("checks in-tone text on the soft surface", () => {
  const results = checkContrast(DEFAULT_THEME, "light");
  expect(results.some((r) => r.foreground === "--success-text" && r.background === "soft(--success)")).toBe(true);
});
it("fails in-tone text that blends into its soft surface", () => {
  const theme = structuredClone(DEFAULT_THEME);
  theme.light["info-text"] = theme.light.info;
  expect(checkContrast(theme, "light").some((r) => r.background === "soft(--info)" && !r.passes)).toBe(true);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- tone-text contrast themes theme-editor-coverage`
Expected: FAIL (módulo e tokens inexistentes).

- [ ] **Step 3: Declarar os tokens** nos cinco lugares da regra 10 do AGENTS.md (`styles.css`,
  `COLOR_TOKENS`, `required-tokens.ts`, `COLOR_GROUPS`, temas), implementar `mixColors` e
  `deriveToneText`.

- [ ] **Step 4: Pares do texto no tom no gate**

Para X em `TEXT_TONES`, `checkContrast` acrescenta:

| par | frente | fundo | mínimo |
|---|---|---|---|
| sobre a página (outline, ghost) | `--X-text` | `--background` | 4.5 |
| sobre o soft | `--X-text` | `soft(--X)` = `mixColors(background, X, TONE_MIX.soft[mode])` | 4.5 |
| sobre o hover do soft | `--X-text` | `soft-hover(--X)` = `mixColors(background, X, TONE_MIX.soft[mode] * TONE_MIX.softHover)` | 3 |

Rótulos técnicos, sem tradução. A `palette.tsx` usa `backgroundValue` / `foregroundValue` na
amostra e no `ContrastBadge`.

- [ ] **Step 5: Valores dos temas**

Em todo tema e modo, `X-text = deriveToneText(colors, X, mode)` (com as cores já revisadas da
Task 1), gerado por um script avulso, não commitado. `default.json` e `styles.css` precisam
bater. Só 6 valores saem do mix puro, todos no Kodama Grove claro (o `foreground` dele continua
o original):

| token | mix 50% (L) | valor |
|---|---|---|
| primary-text / brand-text | 0.541 | `oklch(0.461 0.062 106.4)` |
| success-text | 0.477 | `oklch(0.447 0.078 138.655)` |
| warning-text | 0.491 | `oklch(0.466 0.097 50.626)` |
| info-text | 0.486 | `oklch(0.461 0.108 266.169)` |
| destructive-text | 0.507 | `oklch(0.462 0.063 36.886)` |

- [ ] **Step 6: Botão "derivar do tom" no editor**

No controle de cor de cada `X-text`, um botão que grava `deriveToneText(colors, X, mode)` no
modo atual. Rótulo em en ("Derive from tone") e pt-BR ("Derivar do tom").

- [ ] **Step 7: Rodar e ver passar**

Run: `pnpm --filter @fma-ds/ds test -- tone-text contrast themes theme-editor-coverage`
Expected: PASS.

### Task 1c: configurações `iconMix` e `softMix`

- Ícone e dot no tom: `color-mix(in oklab, var(--X), var(--X-text) var(--tone-icon-mix, 42%))`.
  Para os temas cujo `-text` é o mix puro, 42% de `-text` = 21% de `--foreground`, o valor
  validado no preview. Um valor para os dois modos.
- Tinta do soft: `softMix` com um valor por modo (padrão 10% claro / 18% escuro), no formato do
  `shadow` (`{ light, dark }`). O hover do soft acompanha: `calc(<soft> * 1.8)` (18% / 32,4%, no
  lugar dos 18% / 32% fixos).
- Ambos opcionais, como `spacing`: sem o campo, valem os padrões. A borda do outline (38% / 45%)
  continua fixa.

**Files:**
- Modify: `packages/ds/src/lib/theme/schema.ts` (`ThemeSchema`)
- Modify: `packages/ds/src/lib/theme/css.ts`
- Modify: `packages/ds/src/styles.css` (`:root`)
- Modify: `packages/ds/src/lib/theme/contrast.ts` (pares do ícone)
- Modify: `apps/web/src/theme-editor/other-panel.tsx` (+ `i18n/en.ts` e `i18n/pt-BR.ts`)
- Modify: `packages/ds/src/themes/{supabase,cobalt,kodama-grove,amber-minimal}.json`
- Test: `packages/ds/tests/lib/theme/css.test.ts`, `packages/ds/tests/lib/theme/contrast.test.ts`,
  `packages/ds/tests/themes.test.ts`, `packages/ds/tests/theme-editor-coverage.test.ts`

**Interfaces:**
- Consumes: `mixColors`, `TONE_MIX`, `TEXT_TONES` (Task 1b).
- Produces:
  - `ThemeSchema`, ao lado de `spacing`, com `const Percent = z.string().regex(/^\d+(\.\d+)?%$/)`:
    `iconMix: Percent.optional()` (ex.: `"51%"`) e
    `softMix: z.object({ light: Percent, dark: Percent }).optional()`.
  - Em `contrast.ts`: `export function iconMixOf(theme: Theme): number` e
    `export function softMixOf(theme: Theme, mode: ThemeMode): number` (0–1; padrões
    `TONE_MIX.icon` e `TONE_MIX.soft[mode]`). O hover é `softMixOf(...) * TONE_MIX.softHover`.
  - CSS: `--tone-icon-mix` e `--tone-soft-mix`, emitidos pelo `css.ts` só quando o tema define o
    campo (`--tone-soft-mix` no `:root` com o valor claro e no `.dark` com o escuro); `styles.css`
    declara `--tone-icon-mix: 42%` no `:root` e `--tone-soft-mix: 10%` / `18%` no `:root` / `.dark`.
    A lib `tone` (Task 3) usa `var(--tone-icon-mix, 42%)` e `var(--tone-soft-mix, 10%)` (no claro)
    / `var(--tone-soft-mix, 18%)` (no escuro).

- [ ] **Step 1: Testes**

`css.test.ts`: `iconMix: "51%"` gera `--tone-icon-mix: 51%`; `softMix: { light: "14%", dark: "22%" }`
gera `--tone-soft-mix: 14%` no bloco claro e `22%` no escuro; sem os campos, nenhuma variável.
`themes.test.ts`: o schema rejeita `iconMix: "51"` e `softMix` sem `dark`. `contrast.test.ts`:

```ts
it("measures icons with the theme's iconMix", () => {
  const pale = { ...structuredClone(DEFAULT_THEME), iconMix: "0%" };
  pale.light.primary = "oklch(0.9 0.1 140)";
  const icon = (t: Theme) => checkContrast(t, "light").find((r) => r.foreground === "icon(--primary)" && r.background === "--background");
  expect(icon(pale)?.passes).toBe(false);
  expect(icon({ ...pale, iconMix: "100%" })?.passes).toBe(true);
});
it("measures in-tone text on the theme's soft tint", () => {
  const strong = { ...structuredClone(DEFAULT_THEME), softMix: { light: "90%", dark: "90%" } };
  const onSoft = checkContrast(strong, "light").find((r) => r.foreground === "--info-text" && r.background === "soft(--info)");
  expect(onSoft?.passes).toBe(false);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- css themes contrast`
Expected: FAIL nos testes novos.

- [ ] **Step 3: Implementar** schema, `css.ts`, `styles.css` e os pares. Os pares de soft da
  Task 1b passam a usar `softMixOf(theme, mode)` (e `* 1.8` no hover). Ícone com
  `icon = mixColors(X, X-text, iconMixOf(theme))`:

| par | frente | fundo | mínimo |
|---|---|---|---|
| ícone e dot sobre a página | `icon(--X)` | `--background` | 3 |
| ícone e dot sobre o soft | `icon(--X)` | `soft(--X)` | 3 |

- [ ] **Step 4: Controles no editor**

Em `OTHER_SETTINGS`, `"iconMix"` e `"softMix"`, sliders de passo livre que mostram o valor, com
botão de voltar ao padrão (remove o campo):
- `iconMix`: 0% a 100%. en "Icon and dot: share of in-tone text" / pt-BR "Ícone e dot: % do texto
  no tom".
- `softMix`: dois sliders, claro (0% a 40%) e escuro (0% a 50%). en "Soft tint" / pt-BR "Tinta do
  soft", com "Light" / "Claro" e "Dark" / "Escuro".

O type-check do `apps/web` (`SETTINGS_COVERED`) falha se faltar.

- [ ] **Step 5: Valores dos temas curados**

Com 42%, quatro temas reprovam o ícone no modo claro; cada um declara o mínimo que passa (os
outros 19 ficam sem o campo):

| tema | `iconMix` |
|---|---|
| supabase | `"62%"` |
| cobalt | `"51%"` |
| kodama-grove | `"51%"` |
| amber-minimal | `"45%"` |

Nenhum tema curado declara `softMix`.

- [ ] **Step 6: Rodar e ver passar**

Run: `pnpm --filter @fma-ds/ds test -- css themes contrast theme-editor-coverage`
Expected: PASS.

### Task 2: consumidores do significado antigo e importador

**Files:**
- Modify: `packages/ds/src/core/badge/badge.tsx:21-42` (só as classes de status, sem mudar a API)
- Modify: `packages/ds/src/blocks/stat-cards/stat-cards.tsx:58-64`
- Modify: `apps/web/src/theme-editor/import-dialog.tsx:124`
- Modify: `packages/ds/src/design-tokens/color.stories.tsx:66-75`
- Modify: `packages/ds/src/core/description-list/description-list.stories.tsx:67`
- Modify: `packages/ds/src/lib/theme/parse.ts:57-85`
- Modify: `AGENTS.md` (regra 9) e `CONTRIBUTING.md` (trecho correspondente)
- Test: `packages/ds/tests/lib/theme/parse.test.ts:46-67`

**Interfaces:**
- Consumes: Task 1 (`X-foreground` = texto sobre a cor cheia).
- Produces: nenhum uso de `text-X-foreground` / `var(--X-foreground)` de status sobre a página.

- [ ] **Step 1: Reescrever o teste do importador**

No teste "derives our status tokens for sources that lack them", as asserções viram:

```ts
expect(theme.light["destructive-foreground"]).toBe(toOklch("#ffffff")); // o da fonte, como veio
expect(theme.light["success-foreground"]).toBe(theme.light.background); // padrão do fallback
expect(theme.dark["info-foreground"]).toBe(theme.dark.background);
expect(theme.light["success-text"]).toBe(deriveToneText(theme.light, "success", "light"));
expect(theme.dark["primary-text"]).toBe(deriveToneText(theme.dark, "primary", "dark"));
```

(É o padrão de quando a fonte não traz o status; um `-foreground` que a fonte traz é mantido.)

Remover as asserções de `invert` / `invert-foreground` (o mapeamento sai na Task 10; aqui
continuam derivados, sem teste novo).

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- parse`
Expected: FAIL nas asserções novas.

- [ ] **Step 3: Ajustar `colorsFrom` em `parse.ts`**

Fontes sem nossos status: `info`/`success`/`warning` vêm do fallback com
`X-foreground = colors.background`; `destructive-foreground` fica o da fonte (já significa
texto sobre a cor cheia); sem ele, `colors.background`. Os seis `X-text` saem de
`deriveToneText` depois que as cores estão completas. Remover `STATUS_FOREGROUND_SHIFT` e o
comentário das linhas 57-59, trocando pela regra nova.

- [ ] **Step 4: Trocar os consumidores**

- Badge: `text-X-foreground` (variantes `*-light` e `*-outline`) → `text-X-text`;
  `text-background` das variantes sólidas de status → `text-X-foreground`.
- stat-cards: `--stat-value` dos status → `var(--X-text)`.
- import-dialog: `text-destructive-foreground` → `text-destructive`.
- Stories de cor e do description-list: mostrar o par sobre a cor cheia e o `-text`.

- [ ] **Step 5: Reescrever a regra 9 do AGENTS.md**

"`*-foreground` é texto sobre a cor cheia em todos os tons, como `primary-foreground`; `*-text`
é texto no tom (sobre a página ou o soft), valor inicial de `deriveToneText`. Ícone no tom =
mistura do tom com o `-text` (`iconMix`). Componentes leem os tokens, nunca derivam de
`--background` / `--foreground`."

- [ ] **Step 6: Ciclo rápido e gate do PR**

Run: `pnpm check:changed` e depois `pnpm verify`
Expected: tudo verde; `registry.json` e `public/r` regenerados.

- [ ] **Step 7: Commit e PR (base do stack)**

```bash
git add -A
git commit -m "feat(ui): status foregrounds on solid color, in-tone text tokens"
gh stack init feat/tone-tokens
```

---

## PR 2 · `feat/tone-components`: lib de tons e os seis componentes

Antes da Task 3: `gh stack add feat/tone-components` (cria o branch sobre `feat/tone-tokens`).

### Task 3: lib `tone`

**Files:**
- Create: `packages/ds/src/lib/tone.ts`
- Create: `packages/ds/src/lib/tone.meta.json` (categoria existente de libs; descrição curta)
- Test: `packages/ds/tests/lib/tone.test.ts`

**Interfaces:**
- Consumes: `--X-text` (Task 1b), `--tone-icon-mix` e `--tone-soft-mix` (Task 1c). `TONE_MIX` de
  `@/lib/theme/contrast` (Task 1b), só no teste; `tone.ts` escreve as
  porcentagens literais no CSS (a lib `tone` é publicada e a `theme` não).
- Produces:
  - `export const TONES: readonly ["brand","primary","neutral","success","warning","info","destructive"]`
  - `export type Tone = (typeof TONES)[number]`
  - `export const VARIANTS: readonly ["solid","soft","outline","ghost"]`
  - `export type Variant = (typeof VARIANTS)[number]`
  - `export function defaultTone(variant: Variant): Tone`: `"primary"` para `solid`,
    `"neutral"` para as demais (regra da spec, "Tom padrão").
  - `export const toneVariants: Record<Tone, string>`: classes Tailwind que definem
    `--tone`, `--tone-foreground`, `--tone-soft`, `--tone-soft-hover`, `--tone-line`,
    `--tone-hover`, `--tone-text`, `--tone-icon`.

Valores (X = o tom; percentuais claro / escuro):

| var | colorido (X) | neutral |
|---|---|---|
| `--tone` | `var(--X)` | `var(--muted-foreground)` |
| `--tone-foreground` | `var(--X-foreground)` | `var(--background)` |
| `--tone-soft` | `color-mix(in oklab, var(--X) var(--tone-soft-mix, 10%), var(--background))` (escuro: reserva 18%) | `var(--muted)` |
| `--tone-soft-hover` | igual, com `calc(var(--tone-soft-mix, 10%) * 1.8)` (escuro: reserva 18%) | muted + 5% de `--foreground` |
| `--tone-line` | X 38% / 45% sobre `--background` | `var(--border)` |
| `--tone-hover` | igual a `--tone-soft` | `var(--muted)` |
| `--tone-text` | `var(--X-text)` | `var(--foreground)` |
| `--tone-icon` | `color-mix(in oklab, var(--X), var(--X-text) var(--tone-icon-mix, 42%))`, inclusive no brand; o dot do Badge ghost usa a mesma cor | `var(--muted-foreground)` |

Misturas em `oklab`. As versões escuras entram com `dark:`.

- [ ] **Step 1: Escrever os testes**

```ts
const VARS = ["--tone","--tone-foreground","--tone-soft","--tone-soft-hover","--tone-line","--tone-hover","--tone-text","--tone-icon"];
it("covers every tone", () => expect(Object.keys(toneVariants).sort()).toEqual([...TONES].sort()));
it.each(TONES)("%s sets every variable", (t) => {
  for (const v of VARS) expect(toneVariants[t]).toContain(`[${v}:`);
});
it.each(TONES.filter((t) => t !== "neutral"))("%s switches the soft and line mix in dark mode", (t) => {
  expect(toneVariants[t]).toMatch(/dark:\[--tone-soft:/);
  expect(toneVariants[t]).toMatch(/dark:\[--tone-line:/);
});
it("defaults solid to primary and the rest to neutral", () => {
  expect(defaultTone("solid")).toBe("primary");
  for (const v of ["soft", "outline", "ghost"] as const) expect(defaultTone(v)).toBe("neutral");
});
it.each(TONES.filter((t) => t !== "neutral"))("%s uses the gated recipe percentages", (t) => {
  // as porcentagens do CSS são as mesmas que o gate de contraste mede
  expect(toneVariants[t]).toContain(`var(--tone-soft-mix, ${TONE_MIX.soft.light * 100}%)`);
  expect(toneVariants[t]).toContain(`var(--tone-soft-mix, ${TONE_MIX.soft.dark * 100}%)`);
  expect(toneVariants[t]).toContain(`* ${TONE_MIX.softHover})`);
  expect(toneVariants[t]).toContain(`[--tone-text:var(--${t}-text)]`);
  expect(toneVariants[t]).toContain(`var(--tone-icon-mix, ${TONE_MIX.icon * 100}%)`);
});
it("neutral is built from the muted family", () => {
  expect(toneVariants.neutral).not.toMatch(/--(accent|secondary|invert)\b/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- tone`
Expected: FAIL (`Cannot find module '@/lib/tone'`).

- [ ] **Step 3: Implementar `tone.ts` com a tabela acima.** `"use client"` não é necessário (sem texto).

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @fma-ds/ds test -- tone`
Expected: PASS.

### Task 4: Button e LinkButton

**Files:**
- Modify: `packages/ds/src/core/button/button.tsx:124-200`
- Modify: `packages/ds/src/core/button/button.stories.tsx`, `meta.json`
- Modify consumidores: `core/calendar/calendar.tsx:177-201,674`, `core/color-picker/color-picker.tsx:657`,
  `core/questionnaire/questionnaire.tsx`, `core/confirm-dialog/confirm-dialog.tsx:129`,
  `blocks/payment-card/payment-card.tsx:205`, `apps/web/src/theme-editor/showcase.tsx:336-340`
  e todo uso de `variant=` em Button/LinkButton (o type-check aponta os restantes)
- Test: `packages/ds/tests/tone-variants.test.ts` (novo, compartilhado pelas Tasks 4-8)

**Interfaces:**
- Consumes: `Tone`, `Variant`, `toneVariants` (Task 3).
- Produces: `buttonVariants({ variant?: Variant, tone?: Tone, size? }): string`;
  `Button` / `LinkButton` com props `variant` (padrão `"solid"`) e `tone` (padrão
  `defaultTone(variant)`), e `data-variant` / `data-tone` no elemento.

- [ ] **Step 1: Escrever o contrato**

```ts
it("Button supports exactly the four variants", () => {
  expect(Object.keys(buttonVariantsConfig.variant)).toEqual(["solid", "soft", "outline", "ghost"]);
});
it("Button variants keep the same box", () => {
  for (const v of VARIANTS) expect(buttonVariants({ variant: v })).toMatch(/\bborder\b/);
});
```

`buttonVariantsConfig` passa a ser exportado, como em `badge.tsx`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- tone-variants`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`variant` com as receitas da spec, lendo `--tone-*`; o tom entra como
`toneVariants[tone ?? defaultTone(variant)]` concatenado no `cn`. Sai `link`. `size` não muda.
Mapeamento dos usos: `default` → (padrão), `secondary` → `soft` + `primary` (showcase) ou
`soft` + `neutral`, `destructive` → `solid` + `destructive`, `link` → `ghost` + `primary`,
`outline` / `ghost` mantêm o nome e, pelo `defaultTone`, continuam neutros sem mudar o JSX.

- [ ] **Step 4: Stories**: `Variants` (as 4 no tom padrão) e `Tones` (os 7 tons em solid e
  soft); o render é o exemplo do site. Testes de interação existentes continuam.

- [ ] **Step 5: Ciclo rápido**

Run: `pnpm check:changed`
Expected: verde, incluindo o Storybook do Button e dos consumidores tocados.

### Task 5: Badge

**Files:**
- Modify: `packages/ds/src/core/badge/badge.tsx`, `badge.stories.tsx`, `meta.json`
- Delete: `packages/ds/tests/badge-variants.test.ts` (substituído pelo contrato comum)
- Modify consumidores: `core/data-grid/data-grid.tsx:1827`, `apps/web/src/routes/_site/index.tsx:46`,
  `apps/web/src/site/item-page.tsx:332,420`, `core/description-list/description-list.stories.tsx:46`
- Test: `packages/ds/tests/tone-variants.test.ts`

**Interfaces:**
- Produces: `badgeVariants({ variant?, tone?, size?, radius? })`, `badgeVariantsConfig`;
  padrão `solid` / `primary`.

- [ ] **Step 1: Contrato**: `Object.keys(badgeVariantsConfig.variant)` igual às 4 variantes;
  `badgeVariants({ variant: "ghost" })` contém `before:bg-(--tone-icon)` (o dot).
- [ ] **Step 2: Rodar e ver falhar** (`pnpm --filter @fma-ds/ds test -- tone-variants`).
- [ ] **Step 3: Implementar**. Ghost = dot de 6px antes do texto em `--foreground`. Mapeamento:
  `X` → solid, `X-light` → soft, `X-outline` → outline, `X-dot` → ghost, `muted` /
  `secondary` → soft neutral, `muted-outline` → outline neutral, `link` / `invert*` saem.
  O ALLOWED do Badge em `interaction-tokens.test.ts` sai.
- [ ] **Step 4: Rodar e ver passar; `pnpm check:changed`.**

### Task 6: IconTile e Glance

**Files:**
- Modify: `packages/ds/src/core/icon-tile/icon-tile.tsx`, stories, `meta.json`
- Modify: `packages/ds/src/core/glance/glance.tsx`, stories, `meta.json`
- Modify consumidores de `IconTile` com `className="text-…"` para tom (o grep `IconTile` lista)
- Test: `packages/ds/tests/tone-variants.test.ts`

**Interfaces:**
- Produces: `IconTile` com `variant` (4, padrão `outline`) e `tone` (padrão `neutral`);
  `Glance` com `variant` (`solid`/`soft`/`outline`, padrão `outline`) e `tone` (padrão
  `neutral`) no contexto; `GlanceTone` vira re-export de `Tone`.

- [ ] **Step 1: Contrato**: IconTile tem as 4 variantes e nenhuma além delas (`elevated` e
  `frame` saem); toda variante herda `size-(--icon-tile-size)` da raiz e nenhuma usa `after:`;
  `glanceTriggerVariants` aceita `variant` com as 3 chaves.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar**. Soft sem anel interno. Ghost só pinta o ícone em `--tone-icon`.
  `GlanceMedia` renderiza `<IconTile variant="soft" tone={tone}>`; `toneTextClass` sai.
  Glance solid: rótulo em 78% de `--tone-foreground`.
- [ ] **Step 4: Rodar e ver passar; `pnpm check:changed`.**

### Task 7: Alert

**Files:**
- Modify: `packages/ds/src/core/alert/alert.tsx:306-334`, stories, `meta.json`
- Delete: `packages/ds/tests/alert.test.ts` (substituído pelo contrato comum)
- Test: `packages/ds/tests/tone-variants.test.ts`

**Interfaces:**
- Produces: `alertVariants({ variant?: "solid" | "soft" | "outline", tone? })`; padrão
  `outline` / `neutral`. `role="alert"` não muda.

- [ ] **Step 1: Contrato**: 3 variantes; `alertVariants({ variant: "outline" })` deixa o título
  em `--tone-text` (`**:data-[slot=alert-title]:text-(--tone-text)` ou equivalente).
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar**. Soft sem borda e com 10% / 18% (deixa de usar `from-X/4`).
  Ícone em `--tone-icon`. Solid: descrição em 78% de `--tone-foreground`, `--ring` =
  `--tone-foreground` (como o brand faz hoje).
- [ ] **Step 4: Story `InsideCard`** (Review Focus 1) e os usos de `variant=` em Alert.
- [ ] **Step 5: Rodar e ver passar; `pnpm check:changed`.**

### Task 8: Bubble

**Files:**
- Modify: `packages/ds/src/core/bubble/bubble.tsx:399-424`, stories, `meta.json`
- Modify: `packages/ds/src/core/message/message.tsx:63` (sai `group-has-data-[variant=ghost]/message:px-0`)
- Test: `packages/ds/tests/tone-variants.test.ts`

**Interfaces:**
- Produces: `Bubble` com `variant` (`solid`/`soft`/`outline`, padrão `solid`) e `tone`
  (padrão `primary`); `data-variant` e `data-tone` na raiz.

- [ ] **Step 1: Contrato**: 3 variantes; outline pinta o conteúdo em `--tone-text`; soft em
  `--foreground`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar**. Mapeamento: `default` → solid primary, `secondary` → soft
  neutral, `muted` → soft neutral, `tinted` → soft primary, `outline` → outline neutral,
  `destructive` → soft destructive, `ghost` sai.
- [ ] **Step 4: Rodar e ver passar; `pnpm check:changed`.**

### Task 9: regra 11 e gate de tokens de interação

**Files:**
- Modify: `packages/ds/tests/interaction-tokens.test.ts:1-30` (cabeçalho e ALLOWED)
- Modify: `AGENTS.md` (regra 11) e `CONTRIBUTING.md` ("Tokens de estado")

- [ ] **Step 1: Reescrever o cabeçalho do teste e a regra 11** com a redação da spec
  ("Regra 11, nova redação"). Entradas do ALLOWED que cobriam o hover em muted de controles
  neutros (menubar e navigation-menu) ficam, com o motivo atualizado para a regra nova.
- [ ] **Step 2: `pnpm verify`** (gate completo do PR 2). Expected: verde.
- [ ] **Step 3: Testes amplos** (mudança em componentes muito usados):
  `pnpm --filter @fma-ds/ds test:storybook` e `pnpm --filter web test:e2e`. Expected: verde.
- [ ] **Step 4: Commit e PR empilhado**

```bash
git add -A
git commit -m "feat(ui): variant × tone for badge, button, icon-tile, alert, bubble and glance"
```

---

## PR 3 · `chore/retire-secondary-invert`: tokens aposentados

Antes da Task 10: `gh stack add chore/retire-secondary-invert`.

### Task 10: remover `--secondary` e `--invert`

**Files:**
- Modify: `packages/ds/src/styles.css` (`@theme inline` linhas 49-50 e 63-64, `:root`, `.dark`)
- Modify: `packages/ds/src/lib/theme/schema.ts:18-19,32-33`, `packages/ds/tests/required-tokens.ts:18-19,32-33`
- Modify: `packages/ds/src/lib/theme/editor-controls.ts:31,52`, `packages/ds/src/lib/theme/contrast.ts`
- Modify: `packages/ds/src/lib/theme/parse.ts:83-84` (sem invert; `secondary` da fonte é ignorado)
- Modify: `packages/ds/src/themes/*.json` (23)
- Modify: `apps/web/src/theme-editor/{colors-panel,other-panel,sidebar-preview,showcase}.tsx` e i18n (`en.ts`, `pt-BR.ts`, `showcase-en.ts`, `showcase-pt-BR.ts`)
- Create: `packages/ds/tests/retired-tokens.test.ts`
- Modify: `packages/ds/tests/lib/theme/parse.test.ts`

- [ ] **Step 1: Escrever o teste que proíbe os tokens**

Varre `packages/ds/src/**/*.{ts,tsx,css}` e `apps/web/src/**/*.{ts,tsx,css}` e falha em
qualquer ocorrência de
`/\b(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|shadow)-(secondary|invert)(-foreground)?\b|var\(--(secondary|invert)(-foreground)?\)|--color-(secondary|invert)/`,
listando arquivo e linha. Comentário: código vendorizado precisa trocar para a família muted
ou um tom.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @fma-ds/ds test -- retired-tokens`
Expected: FAIL listando `styles.css`, editor e temas.

- [ ] **Step 3: Remover** o token de todos os elos da regra 10 e dos 23 temas. No `parse.test.ts`,
  um tema de entrada com `secondary` e `invert` produz um tema sem essas chaves.

- [ ] **Step 4: Rodar e ver passar; `pnpm verify`; e2e do editor**

Run: `pnpm verify` e `pnpm --filter web test:e2e`
Expected: verde (`theme-editor-coverage` e `SETTINGS_COVERED` incluídos).

- [ ] **Step 5: Commit e PR empilhado**

```bash
git add -A
git commit -m "chore(ui): retire the secondary and invert tokens"
gh stack submit --auto
```

---

## Depois deste plano (não incluído)

Item (`ghost/outline/soft`), Toggle (`ghost/outline`), Tabs (`variant="primary"` → tom),
EmptyMedia do panel-card como `IconTile` soft destructive, e a decisão de semear `--brand` com o
secondary colorido de Northern Lights, Soft Pop e Starry Night.
