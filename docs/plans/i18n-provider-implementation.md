# Provider de i18n: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development
> (recomendado) ou superpowers:executing-plans para executar tarefa a tarefa. Os passos usam
> checkbox (`- [ ]`).

**Objetivo:** um provider opcional que põe todos os componentes do registro no idioma escolhido
(en embutido, pt-BR por pacote), com overrides, detecção, idioma por rota, SSR, máscaras sensíveis
a locale e uma ponte para o i18next, que fica com os textos do app (modelo híbrido).

**Arquitetura:** uma `registry:lib` `i18n` (store sem React + camada React + tipos e inglês de
todos os componentes), um `registry:lib` por idioma (`i18n-pt-br`) que só importa a lib, e cada
componente lendo seu namespace por `useFmaMessages`. O store é enxuto e criado por instância do
provider. Os textos do app ficam com o i18next, e a `registry:lib` `i18n-i18next` faz o provider
seguir o idioma dele.

**Stack:** React 19, react-aria-components (`I18nProvider`, `useLocale`), `Intl`, Maskito
(máscaras), i18next + react-i18next (só na ponte e no `apps/web`), vitest (unit em node/happy-dom; stories no browser), TanStack Start (`apps/web`).

**Spec:** [`docs/plans/i18n-provider.md`](i18n-provider.md). Leia antes de qualquer tarefa; este
plano decide nomes, arquivos e testes, o spec decide o comportamento.

## Restrições globais

- Regras do `AGENTS.md` valem integralmente (registro gerado, `meta.json`, imports, stories como
  exemplo, `pnpm` só, Biome, Conventional Commits em inglês, PRs empilhados com `gh stack`).
- A lib `i18n` só depende de `react` e `react-aria-components` (para o `I18nProvider`). Nada de
  zod, date-fns-compat, i18next, `@internationalized/string`. O i18next entra só no item
  `i18n-i18next` e no `apps/web`.
- Sem singleton: o store é por instância do provider. O único estado de módulo é o cache de
  promessas dos loaders.
- Nada de API só de Node em runtime; nada de `AsyncLocalStorage`.
- Sem provider, todo componente renderiza **exatamente** o texto de hoje (inglês), e as máscaras
  continuam brasileiras.
- A prop `i18n`/`labels` atual de cada item continua aceitando o mesmo formato de hoje.
- O pacote de idioma importa só `@/lib/i18n/index` (nunca componentes).
- Precedência de texto: prop do componente > `overrides` > idioma ativo > fallback > inglês.
- Precedência de locale: `locale` controlado > `initialLocale` > detectado > `defaultLocale`. Com
  a ponte, o `locale` controlado é o `resolvedLanguage` do i18next.
- Precedência de máscara: parâmetro explícito > locale do provider > `pt-BR`.
- Mensagens dos componentes são só `string` ou funções que devolvem `string`.
- Nomes de namespace: camelCase do nome do item do registro (`data-grid` → `dataGrid`,
  `use-file-upload` → `useFileUpload`).
- Nenhum nome de marca ou de app em código, commits e PRs.

## Foco de revisão

1. **Hidratação com SSR**: HTML do servidor em pt-BR (Accept-Language) e cliente com
   `navigator.languages` em inglês → nenhum mismatch nem troca no primeiro paint; o locale do
   servidor vence. Teste na Task 4 e e2e na Task 15.
2. **Duas renderizações de servidor simultâneas em idiomas diferentes**, com o provider sozinho ou
   com duas instâncias do i18next pela ponte, não podem vazar idioma entre si. Testes na Task 4 e
   na Task 13.
3. **Override de um label em `overrides` chega às `functions` de um pacote de idioma** (ex.:
   `eventCalendar.labels.today` sobrescrito muda o título formatado em pt-BR). Teste na Task 2 e
   na Task 7.
4. **Trocar de idioma com valor digitado num campo decimal/data**: o texto é refeito a partir do
   valor bruto, sem perder o valor (`1.234,50` → `1,234.50`, bruto `"1234.50"` intacto). Teste na
   Task 11.
5. **Pacote de idioma desatualizado** (namespace faltando) não quebra type-check nem runtime: o
   namespace cai no inglês. Teste na Task 12.

---

## Mapa de arquivos

`packages/ds/src/lib/i18n/` (novo, `registry:lib` `i18n`; importado sempre por
`@/lib/i18n/index`):

| Arquivo | Responsabilidade |
|---|---|
| `meta.json` | metadata (`source: "original"`, categoria/tags) |
| `index.ts` | re-exports públicos |
| `types.ts` | tipos de dicionário, overrides, pacote, `DeepPartial`, `FmaMessages` |
| `format.ts` | `plural`, `number`, `currency`, `date` com cache de `Intl` |
| `negotiate.ts` | `negotiateLocale`, `parseAcceptLanguage`, `getBrowserLocales` |
| `merge.ts` | `resolveNamespace` (camadas + fábrica de `functions`) |
| `store.ts` | núcleo sem React: cache de loaders, `loadFmaMessages`, store por instância (locale, troca, detecção) |
| `react.tsx` | contexto, `FmaI18nProvider`, `useFmaMessages`, `useFmaLocale`, `I18nProvider` do react-aria |
| `messages/<namespace>.ts` | tipo `XConfig` + inglês de cada componente (movidos dos componentes) |
| `messages/en.ts` | `en: FmaMessages` agregando os `messages/*` |

`packages/ds/src/lib/i18n-pt-br/` (novo, `registry:lib` `i18n-pt-br`): `meta.json`, `index.ts`
(agregador) e um arquivo por namespace.

`packages/ds/src/lib/i18n-i18next/` (novo, `registry:lib` `i18n-i18next`): `meta.json`,
`index.tsx` (`FmaI18nextProvider`, `changeLanguage`).

Testes: `packages/ds/tests/lib/i18n/*.test.ts(x)`, `tests/lib/i18n-pt-br.test.ts`,
`tests/lib/i18n-i18next.test.tsx`, `tests/i18n-coverage.test.ts` (gate).

---

## PR 1: plano (`docs/i18n-plan`)

### Task 0: publicar o plano

**Files:** `docs/plans/i18n-provider.md`, `docs/plans/i18n-provider-implementation.md`

- [ ] **Step 1:** `pnpm lint` passa (só `.md` mudou).
- [ ] **Step 2:** Commits: `docs: plan the i18n provider and the per-feature message injection`
  (feito) e `docs: switch the i18n plan to the i18next hybrid model`.
- [ ] **Step 3:** Push e PR contra `main` (corpo: resumo do spec + link do plano). `gh stack init`
  quando o PR 2 for criado em cima.

## PR 2: núcleo da lib (`feat/i18n-core`, empilhado no PR 1)

### Task 1: tipos, formatação e negociação

**Files:**
- Create: `src/lib/i18n/{types,format,negotiate}.ts`, `src/lib/i18n/index.ts`
- Test: `tests/lib/i18n/format.test.ts`, `tests/lib/i18n/negotiate.test.ts`

**Interfaces (produz):**
```ts
// types.ts
type DeepPartial<T>;
/** A namespace config as components consume it: sections like labels/formats/functions. */
type NamespaceConfig = Record<string, object>;
/** In a dictionary, `functions` is a factory over the merged sibling sections. */
type DictionaryNamespace<C extends NamespaceConfig> = {
  [K in keyof C]: K extends "functions" ? (sections: Omit<C, "functions">) => C[K] : C[K];
};
type NamespaceOverrides<C extends NamespaceConfig> = { [K in keyof C]?: Partial<C[K]> };
interface FmaNamespaces {}                       // preenchido na Task 5+ (carousel: CarouselConfig, …)
type FmaMessages = { [K in keyof FmaNamespaces]: DictionaryNamespace<FmaNamespaces[K]> };
type FmaMessagesPack = { [K in keyof FmaNamespaces]?: DeepPartial<FmaMessages[K]> };  // tolerante
type FmaOverrides = { [K in keyof FmaNamespaces]?: NamespaceOverrides<FmaNamespaces[K]> };
function defineFmaMessages<const T extends FmaMessagesPack>(m: T): T;

// format.ts
function plural(locale: string, n: number, forms: { other: string; one?: string; zero?: string; two?: string; few?: string; many?: string } & Record<`=${number}`, string>): string;
function number(locale: string, value: number, options?: Intl.NumberFormatOptions): string;
function currency(locale: string, value: number, currency: string, options?: Intl.NumberFormatOptions): string;
function date(locale: string, value: Date | number, options?: Intl.DateTimeFormatOptions): string;

// negotiate.ts
function negotiateLocale(requested: string | readonly string[], available: readonly string[], fallback: string): string;
function parseAcceptLanguage(header: string | null | undefined): string[];   // ordenado por q, sem "*"
function getBrowserLocales(): string[];          // [] fora do browser
```
`FmaNamespaces` é uma interface (não type) para que cada `messages/<ns>.ts` a estenda por
declaration merging *dentro da lib*; nada de augmentation no app.

- [ ] **Step 1: testes que falham**
  - `plural("pt-BR", 0, { "=0": "Nenhuma", one: "1 nota", other: "# notas" })` → `"Nenhuma"`;
    `plural("pt-BR", 1, …)` → `"1 nota"`; `plural("en", 2, { one: "a", other: "b" })` → `"b"`.
    (`#` não é interpolado: o `other` vem pronto da função; o teste usa template string.)
  - `number("pt-BR", 1234.5)` → `"1.234,5"`; `currency("pt-BR", -50, "BRL")` → `"-R$ 50,00"`
    (compare com `Intl` direto para não depender do espaço especial); mesmo `Intl.*` reaproveitado
    (espie o construtor: 2 chamadas iguais → 1 construção).
  - `negotiateLocale("pt-BR", ["pt-BR","en"], "en")` → `"pt-BR"`; `"pt-PT"` → `"pt-BR"`; `"pt"` →
    `"pt-BR"`; `"es-AR"` → `"en"`; `["es","en-GB"]` → `"en"`; `"sr-Latn-RS"` com
    `["sr-Latn","sr"]` → `"sr-Latn"`; case-insensitive (`"PT-br"`).
  - `parseAcceptLanguage("en-US,en;q=0.9,pt-BR;q=0.95,*;q=0.1")` →
    `["en-US","pt-BR","en"]`; `null`/`""`/lixo → `[]`.
  - `getBrowserLocales()` em node → `[]`.
- [ ] **Step 2:** `pnpm --filter @fma-ds/ds exec vitest run --project unit tests/lib/i18n` → FAIL.
- [ ] **Step 3:** implementar. Negociação igual à do react-aria (exato → idioma+script → idioma
  → qualquer `idioma-*` → fallback). Caches de `Intl` em `Map` por `locale+JSON(options)`.
- [ ] **Step 4:** testes passam.
- [ ] **Step 5:** commit `feat(ui): add i18n types, Intl formatters and locale negotiation`.

### Task 2: resolução de namespace (camadas e fábrica de `functions`)

**Files:** Create `src/lib/i18n/merge.ts`; Test `tests/lib/i18n/merge.test.ts`

**Interfaces:**
```ts
/** Layers from weakest to strongest; undefined layers are skipped. */
function resolveNamespace<C extends NamespaceConfig>(
  dictionaries: readonly (DeepPartial<DictionaryNamespace<C>> | undefined)[],  // en, fallback, active
  overrides: readonly (NamespaceOverrides<C> | undefined)[],                    // provider overrides, prop
): C;
```
Regras: cada seção (exceto `functions`) é mesclada rasa, camada a camada. `functions` = a fábrica
da camada de dicionário mais forte que tiver uma, chamada com as seções **já mescladas (incluindo
overrides)**, e por cima as `functions` simples dos overrides, na ordem. Memoizar por identidade
das camadas (WeakMap) para os componentes não refazerem a cada render.

- [ ] **Step 1: testes que falham**
  - seção parcial do override só troca as chaves dadas (`{labels:{next:"Avançar"}}` mantém
    `previous`).
  - fábrica pt-BR chamada com `labels.today` vindo do override → a função formatada usa o texto do
    override (Foco de revisão 3).
  - `functions` explícita na prop vence a fábrica.
  - camada `active` sem o namespace → usa `fallback`, depois `en`.
  - mesmas camadas (mesmas referências) → mesmo objeto de saída (`toBe`).
- [ ] **Step 2–4:** rodar (FAIL), implementar, rodar (PASS).
- [ ] **Step 5:** commit `feat(ui): resolve i18n namespaces across dictionary and override layers`.

### Task 3: store sem React e carregamento de pacotes

**Files:** Create `src/lib/i18n/store.ts`; Test `tests/lib/i18n/store.test.ts`

**Interfaces:**
```ts
type FmaLoader = () => Promise<{ default: FmaMessagesPack }>;
/** Locale → pack or loader. "en" is always available (the lib's English). */
type FmaLocales = Record<string, FmaMessagesPack | FmaLoader>;
/** Loads the pack (and the fallback's) once per loader; resolves the negotiated locale. */
function loadFmaMessages(locales: FmaLocales, requested: string | readonly string[], fallbackLocale?: string): Promise<string>;
/** Sync read: the pack if it is an object or already loaded, else undefined. */
function readFmaMessages(locales: FmaLocales, locale: string): FmaMessagesPack | undefined;
type StoreOptions = {
  locales: FmaLocales;
  defaultLocale?: string;                  // padrão "en"
  fallbackLocale?: string;                 // padrão defaultLocale
  initialLocale?: string | readonly string[];
  detect?: boolean;                        // padrão true; ignorado com initialLocale
};
interface FmaI18nStore {
  getSnapshot(): { locale: string; isPending: boolean };
  subscribe(listener: () => void): () => void;
  setLocale(locale: string): Promise<void>;
}
function createStore(options: StoreOptions): FmaI18nStore;   // um por instância de provider
```
Cache de promessas em `WeakMap<FmaLoader, Promise>`: dicionários imutáveis, então compartilhar
entre requisições é seguro.

- [ ] **Step 1: testes que falham**
  - `loadFmaMessages(locales, "pt-PT")` resolve `"pt-BR"` e carrega o pacote de pt-BR **e** o do
    fallback. Loaders são chamados uma vez só (cache de promessa, também em chamadas concorrentes).
    `readFmaMessages` devolve o pacote depois disso e `undefined` antes.
  - `"en"` sem entrada em `locales` é aceito e não chama loader.
  - `setLocale("en")`: `isPending` fica true até o pacote carregar e `locale` só muda no commit.
    Listeners são notificados no início (pending) e no commit. Nenhum snapshot tem o locale novo
    com o pacote ainda ausente.
  - `setLocale` para locale fora de `locales` → negocia; sem match → fallback + `console.warn` em
    dev.
  - `detect` (padrão): com `navigator.languages = ["en-US"]` (stub de `globalThis.navigator`) e
    `defaultLocale:"pt-BR"`, o `locale` inicial é `"en"`. `detect:false` → `"pt-BR"`.
    `initialLocale:"pt-BR"` vence a detecção.
  - dois stores criados com `initialLocale` diferentes não se afetam.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5:** commit `feat(ui): add the i18n store and message pack loading`.

### Task 4: camada React e `FmaI18nProvider`

**Files:** Create `src/lib/i18n/react.tsx`; Test `tests/lib/i18n/react.test.tsx`
(`// @vitest-environment happy-dom`, padrão de `tests/hooks/use-dialog-promise.test.ts`; SSR com
`react-dom/server` `renderToString`). Ajuste o `include` do projeto unit em `vitest.config.ts`
para `tests/**/*.test.{ts,tsx}`.

**Interfaces:**
```ts
type FmaI18nProviderProps = StoreOptions & {    // locales opcional aqui (padrão {}: só inglês)
  children: ReactNode;
  locale?: string;                              // controlado (rota, outra lib, ponte)
  overrides?: FmaOverrides;
  onLocaleChange?: (locale: string) => void;
};
function FmaI18nProvider(props: FmaI18nProviderProps): ReactNode;

// para componentes do registro:
function useFmaMessages<K extends keyof FmaNamespaces>(
  namespace: K,
  prop?: NamespaceOverrides<FmaNamespaces[K]>,
): FmaNamespaces[K];
// para componentes e para o seletor do app; null sem provider
function useFmaLocale(): { locale: string; locales: string[]; isPending: boolean; setLocale(l: string): void } | null;
```
O contexto é único: `{ locale, layers: { active?, fallback? }, overrides, … }`.

- O provider cria o store com `useState(() => createStore(...))` e o assina com
  `useSyncExternalStore`. Renderiza `<I18nProvider locale={locale}>` e o contexto.
- Modo controlado (`locale` presente): `setLocale` só chama `onLocaleChange`. Quando a prop muda,
  o provider carrega o pacote novo antes de trocar e mantém o anterior com `isPending`.
- Pacote do locale inicial não carregado: suspende com React `use` em `loadFmaMessages`.
- No modo não controlado, `onLocaleChange` é chamado depois de cada troca.

- [ ] **Step 1: testes que falham**
  - sem provider: `useFmaMessages("testNs")` (namespace de teste registrado no próprio teste via
    declaration merging de `FmaNamespaces`) devolve o inglês; `useFmaLocale()` → `null`.
  - prop vence overrides, que vencem o dicionário.
  - `renderToString` de dois providers com `initialLocale` `"pt-BR"` e `"en"` em paralelo
    (`Promise.all`) → cada HTML no seu idioma (Foco 2).
  - hidratação: HTML gerado com `initialLocale:"pt-BR"`, cliente com `navigator.languages =
    ["en"]` e o mesmo `initialLocale` → `hydrateRoot` sem `onRecoverableError` e texto pt-BR
    (Foco 1).
  - controlado: `locale="en"` vence `initialLocale` e detecção; `setLocale("pt-BR")` chama
    `onLocaleChange("pt-BR")` e não muda o texto até a prop mudar; `locale="pt"` negocia para
    `"pt-BR"`; `locale="xx"` cai no fallback com `console.warn`.
  - loader não carregado no primeiro render: o fallback do `Suspense` aparece e depois o texto
    resolve. Com `loadFmaMessages` antes, não suspende.
  - não controlado: `setLocale` → `isPending` true durante a troca, nenhum render com textos
    misturados, `onLocaleChange` chamado no commit.
  - `useLocale` do react-aria dentro do provider devolve o locale do provider.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5:** commit `feat(ui): add the i18n React provider and hooks`.

### Task 5: publicar a lib e migrar o `carousel` como prova

**Files:**
- Create: `src/lib/i18n/meta.json`, `src/lib/i18n/messages/carousel.ts`, `src/lib/i18n/messages/en.ts`
- Modify: `src/core/carousel/carousel.tsx` (tipos/inglês saem; lê `useFmaMessages("carousel", i18n)`)
- Modify: `src/core/carousel/carousel.stories.tsx` só se algum import de tipo mudar
- Generated: `registry.json`, `apps/web/public/r/*.json`

**Interfaces:**
- `messages/carousel.ts`: `type CarouselConfig = { labels: CarouselLabels }`, exporta
  `CarouselLabels`, `carouselEn: DictionaryNamespace<CarouselConfig>` e estende
  `FmaNamespaces { carousel: CarouselConfig }`.
- O componente continua exportando `CarouselI18n` com o mesmo formato (`{ labels?: Partial<…> }`),
  agora como `NamespaceOverrides<CarouselConfig>`.

Padrão de migração (usado nas Tasks 6–8): tipo + inglês vão para `messages/<ns>.ts`; o
componente troca `defaultXLabels`/`mergeXI18n` por `useFmaMessages("<ns>", props.i18n)`; os
`mergeXI18n` exportados hoje passam a ser wrappers de `resolveNamespace([en], [overrides])` para
não quebrar quem importa.

- [ ] **Step 1:** story nova `ShouldUseProviderMessages` (`tags: ["!autodocs"]`) em
  `carousel.stories.tsx`: decorator com
  `<FmaI18nProvider locale="pt-BR" locales={{ "pt-BR": { carousel: { labels: { next: "Próximo slide" } } } }}>`;
  `play` verifica o botão "Próximo slide" e, sem provider, "Next slide" nas stories existentes.
- [ ] **Step 2:** `pnpm --filter @fma-ds/ds test:storybook -- carousel` → FAIL.
- [ ] **Step 3:** migrar. `meta.json` da lib: `name: "i18n"`, `source: "original"`, descrição
  curta (provider, precedência, pacotes de idioma), tags `["i18n", "locale"]`.
- [ ] **Step 4:** `pnpm lint && pnpm type-check && pnpm test && pnpm --filter @fma-ds/ds build`;
  storybook do carousel passa; `registry.json` mostra `carousel` com `registryDependencies`
  contendo `@fma-ds/i18n`.
- [ ] **Step 5:** commit `feat(ui): read carousel labels from the i18n provider` (com os gerados).
- [ ] **Step 6:** push, PR empilhado (`gh stack add` / `submit`).

## PR 3: migração dos componentes (`feat/i18n-components`, empilhado)

### Task 6: core com prop `i18n`/`labels`

**Files (Modify + `messages/<ns>.ts` cada):** `core/data-grid` (`dataGrid`),
`core/emoji-picker` (`emojiPicker`), `core/file-upload` (`fileUpload`),
`hooks/use-file-upload.ts` (`useFileUpload`, seção `messages`), `core/time-picker`
(`timePicker`, com fábrica de `functions`), `core/copy-button` (`copyButton`), `core/color-picker`
(`colorPicker`), `core/credit-card` (`creditCard`), `core/code-block` (`codeBlock`).

Props `labels` (copy-button, color-picker, credit-card, code-block) viram a seção `labels` do
namespace: `useFmaMessages("copyButton", { labels: props.labels })`.

- [ ] **Step 1:** para cada um, uma story `ShouldUseProviderMessages` como na Task 5 (um label
  trocado pelo provider aparece; um label da prop vence o provider).
- [ ] **Step 2:** FAIL; **Step 3:** migrar seguindo o padrão; time-picker:
  `functions` vira fábrica em `messages/time-picker.ts` e `mergeTimePickerI18n` vira wrapper.
- [ ] **Step 4:** checklist completo (lint, type-check, test, build, `test:storybook`); stories
  existentes intactas.
- [ ] **Step 5:** commit por componente, `feat(ui): read <name> texts from the i18n provider`.

### Task 7: blocos

**Files:** `blocks/event-calendar` (`eventCalendar`: `labels`, `viewNames`, `formats`,
`functions` fábrica; `event-calendar-i18n.tsx` vira re-export/wrapper), `blocks/auth`
(`auth`: seção `resendCode`), `collection-field`, `error-pages` (`errorPages`: seções
`errorDetails`, `notFound`, `forbidden`, `unexpectedError`), `filter-toolbar`, `form-wizard`,
`notification-center` (`notificationCenter`), `order-summary`, `panel-card`,
`payment-card` (seções `details`, `remove`), `plan-builder`, `pricing-plans`, `settings-form`,
`stat-cards`.

Itens com várias partes: cada parte é uma **seção** do namespace, e a prop `i18n.labels` da parte
mapeia para a sua seção.

Locale de formatação do `event-calendar`: prop `locale` > `useLocale()` do react-aria (o Provider
já alimenta) > ambiente. Troque o `resolveDefaultLocale` que lê `Intl` direto por
`useLocale().locale` quando não houver prop.

- [ ] **Step 1:** stories `ShouldUseProviderMessages` (uma por bloco). No event-calendar, uma
  story com `FmaI18nProvider` recebendo um dicionário inline cuja seção `functions` é uma fábrica
  que usa `labels.today`, mais `overrides` trocando `labels.today`: o texto formatado mostra o
  override (Foco 3).
- [ ] **Step 2–4:** FAIL → migrar → checklist completo.
- [ ] **Step 5:** commit por bloco.

### Task 8: strings fixas sem prop

**Files (Modify):** `core/breadcrumb` ("More"), `core/calendar` ("Choose month/year",
"Previous/Next year/decade"), `core/combobox` ("Clear"), `core/command` ("Search…", "Search"),
`core/dialog` ("Close" ×2), `core/loading-overlay` ("Loading…"), `core/pagination`
("Previous"/"Next", "Go to previous/next page", "More pages"), `core/questionnaire`
("Previous"/"Next"), `core/sheet` ("Close"), `core/sidebar` ("Toggle Sidebar"), `core/spinner`
("Loading"), e o que o gate da Task 9 encontrar a mais.

Cada um ganha `messages/<ns>.ts`, uma prop `i18n?: NamespaceOverrides<XConfig>` (onde fizer
sentido para a peça) e lê `useFmaMessages`. Props de texto que já existem (`text` da pagination,
`label` do loading-overlay, `children` do questionnaire) continuam vencendo. Componentes
`source: "shadcn"` tocados viram `"customized"` (e passam a cair no gate de
`interaction-tokens`; corrija o que ele apontar ou registre exceção com motivo).

- [ ] **Step 1:** story `ShouldUseProviderMessages` por componente (aria-label traduzido pelo
  provider).
- [ ] **Step 2–4:** FAIL → migrar → checklist completo.
- [ ] **Step 5:** commit por componente.

### Task 9: gate de cobertura

**Files:** Create `tests/i18n-coverage.test.ts`

Verifica, para `src/core/**` e `src/blocks/**` (exceto stories) e `src/hooks/**`:
1. arquivo que declara prop `i18n?:`/`labels?:`/`messages?:` chama `useFmaMessages(`;
2. cada chave de `en` (`messages/en.ts`) corresponde a um item existente (camelCase do nome) — e
   vice-versa para os que usam `useFmaMessages`;
3. regex de strings fixas em inglês em JSX (`aria-label="[A-Z]`, `title="[A-Z]`,
   `placeholder="[A-Z]`, `sr-only">[A-Z]`, defaults de parâmetro `= "[A-Z][a-z]`) falha, salvo
   `ALLOWED` com motivo (estilo `interaction-tokens.test.ts`).

- [ ] **Step 1:** escrever o teste; rodar; corrigir o que aparecer (volta à Task 8) até passar.
- [ ] **Step 2:** commit `test(ui): gate i18n coverage of component texts`.
- [ ] **Step 3:** push, PR empilhado.

## PR 4: máscaras (`feat/i18n-masks`, empilhado)

### Task 10: funções puras com locale

**Files:** Modify `src/lib/input-masks/{decimal-mask,date-mask,date-time-mask,date-range-mask,presets}.ts`;
Create `src/lib/input-masks/locale.ts`; Create `src/lib/i18n/messages/masked-input.ts`
(namespace `maskedInput`, seção `labels` do tipo `MaskedInputLabels = { day; month; year; hour; minute }`); Test
`tests/lib/input-masks/locale.test.ts` + casos novos nos testes existentes.

**Interfaces:**
```ts
// locale.ts
function getNumberSeparators(locale: string): { decimal: string; thousand: string };
function getDateOrder(locale: string): "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy/mm/dd";
function getDateSeparator(locale: string): string;
// decimal-mask.ts
function decimalMaskRemover(value: string | null | undefined, separators?: { decimal: string; thousand: string }): string;
// demais create*/formatter ganham `locale?: string` (padrão "pt-BR") no objeto de opções
// presets.ts
type MaskLocaleOptions = { locale?: string; labels?: MaskedInputLabels };
function resolveMask(mask: MaskSpec | StableMaskitoOptions, options?: MaskLocaleOptions): ResolvedMask;
```
Placeholder de data: monta a partir de `labels` (`dd`/`mm`/`aaaa` no pt-BR, `dd`/`mm`/`yyyy` em
inglês) e da ordem/separador do locale. Sem `labels`, mantém os placeholders de hoje (pt-BR).
`maskedInput` no `en` da lib usa as letras em inglês, mas o hook só as usa **com provider**.
Hora continua 24h (o spec deixa o `hourCycle` a critério; fica fora desta entrega).

- [ ] **Step 1: testes que falham**
  - `getNumberSeparators("pt-BR")` → `{ decimal: ",", thousand: "." }`; `"en"` → `"."`/`","`.
  - `getDateOrder("en-US")` → `"mm/dd/yyyy"`; `"en-GB"`/`"pt-BR"` → `"dd/mm/yyyy"`.
  - `decimalMaskRemover("1,234.50", { decimal: ".", thousand: "," })` → `"1234.50"`;
    sem separadores → comportamento de hoje (`"1.234,50"` → `"1234.50"`).
  - `resolveMask({ type: "decimal" }, { locale: "en" }).format("1234.5")` → `"1,234.50"`;
    `unmask` de volta → `"1234.50"`.
  - `resolveMask("date", { locale: "en-US", labels: en }).placeholder` → `"mm/dd/yyyy"`; sem
    opções → `"dd/mm/aaaa"` (hoje).
  - parâmetro explícito vence locale: `{ type: "decimal", decimalSeparator: "," }` com
    `locale:"en"` usa `,` (adicione `decimalSeparator`/`thousandSeparator` aos `DecimalParams`).
  - CPF/CNPJ/CEP/telefone/cartão: mesmas saídas com `locale:"en"`.
- [ ] **Step 2–4:** FAIL → implementar → PASS (todos os testes de `tests/lib/input-masks` antigos
  continuam verdes).
- [ ] **Step 5:** commit `feat(ui): make decimal and date masks locale-aware`.

### Task 11: `useMask` e `MaskedInput` seguem o provider

**Files:** Modify `src/hooks/use-mask.ts`, `src/core/masked-input/*.tsx` (se resolver máscara lá);
Test `tests/hooks/use-mask.test.ts`, story `ShouldFollowProviderLocale` em `masked-input`.

`useMask` lê `useFmaLocale()` e `useFmaMessages("maskedInput")`; sem provider passa nada (pt-BR de
hoje). O `maskKey` inclui o locale. Quando o locale muda, o estado é refeito a partir de
`state.raw` com a máscara nova (`format(raw)`), nunca do texto exibido.

- [ ] **Step 1: testes que falham** (happy-dom): campo decimal com `1.234,50` digitado sob
  provider pt-BR; troca para `en` → valor exibido `1,234.50`, `onValueChange` não recebe bruto
  diferente de `"1234.50"` (Foco 4). Mesmo para data (`29/10/2026` → `10/29/2026`, bruto ISO
  igual). Sem provider → igual a hoje.
- [ ] **Step 2–4:** FAIL → implementar → PASS + `test:storybook` do masked-input.
- [ ] **Step 5:** commit `feat(ui): follow the provider locale in useMask`; push, PR empilhado.

## PR 5: pacote pt-BR (`feat/i18n-pt-br`, empilhado)

### Task 12: `@fma-ds/i18n-pt-br`

**Files:** Create `src/lib/i18n-pt-br/{meta.json,index.ts,<namespace>.ts…}`; Test
`tests/lib/i18n-pt-br.test.ts`

- `index.ts`: `export default defineFmaMessages({ carousel, dataGrid, … })` — tipo público
  `FmaMessagesPack` (tolerante).
- Textos: comece pelos pt-BR que já existem nas stories (`grep -rn "i18n={{" src --include=*.stories.tsx`)
  e alinhe a terminologia entre componentes (um termo por conceito: "Próximo", "Anterior",
  "Limpar", "Fechar", "Carregando…", "Pesquisar"). Funções com plural usam `plural("pt-BR", …)`.
- `meta.json`: `name: "i18n-pt-br"`, `source: "original"`, descrição dizendo como usar com o
  provider.

- [ ] **Step 1: testes que falham**
  - completude no repo: `const complete: FmaMessages = ptBR;` (type-check falha se faltar) e
    `expect(Object.keys(ptBR).sort()).toEqual(Object.keys(en).sort())`.
  - nenhuma string do pacote é igual à do `en` (salvo `ALLOWED` com motivo, ex.: "OK", "E-mail").
  - pacote parcial (`defineFmaMessages({ carousel: {...} })`) atribuível a `FmaMessagesPack`
    e, com `<FmaI18nProvider locale="pt-BR" locales={{ "pt-BR": parcial }}>`, `dataGrid` sai em
    inglês (Foco 5).
  - o arquivo só importa `@/lib/i18n/index` (leia o texto dos arquivos e cheque os imports).
- [ ] **Step 2–4:** FAIL → escrever o pacote → PASS; build do registro mostra
  `i18n-pt-br` com `registryDependencies: ["@fma-ds/i18n"]` e nenhum componente.
- [ ] **Step 5:** stories: nas stories que hoje passam `i18n={{…pt-BR…}}` só para mostrar
  português, mantenha-as (demonstram a prop); acrescente ao `.storybook/preview` um seletor de
  idioma na toolbar (global `locale`: en/pt-BR) com decorator
  `<FmaI18nProvider locale={globals.locale} locales={{ "pt-BR": ptBR }}>`.
  O decorator não aparece nos snippets (regra 7).
- [ ] **Step 6:** commit `feat(ui): add the pt-BR message pack`; push, PR empilhado.

## PR 6: ponte com o i18next (`feat/i18n-i18next`, empilhado)

### Task 13: `@fma-ds/i18n-i18next`

**Files:** Create `src/lib/i18n-i18next/{meta.json,index.tsx}`; Modify `packages/ds/package.json`
(`i18next`, `react-i18next` em `dependencies`, versões com mais de 7 dias, regra de supply
chain); Test `tests/lib/i18n-i18next.test.tsx` (happy-dom; SSR com `renderToString`)

**Interfaces:**
```ts
type FmaI18nextProviderProps = Pick<FmaI18nProviderProps, "children" | "locales" | "overrides"> & {
  i18n?: i18n;                       // padrão: useTranslation().i18n
};
function FmaI18nextProvider(props: FmaI18nextProviderProps): ReactNode;
/** Loads the fma pack first, then switches i18next: components and app texts change in the same frame. */
function changeLanguage(i18n: i18n, lng: string, locales: FmaLocales): Promise<void>;
```
- Renderiza `FmaI18nProvider` com:
  - `locale={i18n.resolvedLanguage ?? i18n.language}` (controlado);
  - `detect={false}`;
  - `fallbackLocale` = o `fallbackLng` quando é string, ou o primeiro item quando é array (senão
    `"en"`).
- Em efeito, assina `i18n.on("languageChanging", lng => loadFmaMessages(locales, lng))` para baixar
  em paralelo, e remove a assinatura no cleanup.
- O `setLocale` do `useFmaLocale()` chama `changeLanguage` (o `onLocaleChange` do modo
  controlado), para o seletor funcionar igual nos dois mundos.

- [ ] **Step 1: testes que falham**
  - instância do i18next com `lng:"en"` e recursos inline; `changeLanguage(i18n, "pt-BR", locales)`
    com loader atrasado → nenhum render com o texto do app (`useTranslation`) em pt-BR e o do
    componente em inglês; ao final, os dois em pt-BR.
  - `i18n.changeLanguage("pt-BR")` direto (sem o helper): o loader do nosso pacote é chamado no
    `languageChanging`, antes do `languageChanged`. Os componentes ficam em inglês com `isPending`
    até o pacote chegar e nunca mostram uma mistura dentro do componente.
  - `useFmaLocale().setLocale("pt-BR")` dentro da ponte troca o i18next.
  - `resolvedLanguage:"pt"` com `locales` `"pt-BR"` → componentes em pt-BR (negociação).
  - SSR: duas instâncias (`i18next.createInstance`) em `pt-BR` e `en` renderizadas em paralelo →
    cada HTML no seu idioma (Foco 2).
  - `fallbackLng: ["pt-BR"]` vira o fallback dos componentes.
  - o arquivo da lib não importa componentes (só `@/lib/i18n/index`, `i18next`, `react-i18next`).
- [ ] **Step 2–4:** FAIL → implementar → PASS. `meta.json`: `name: "i18n-i18next"`,
  `source: "original"`, descrição dizendo que liga o idioma do i18next aos componentes.
- [ ] **Step 5:** build do registro mostra `i18n-i18next` com `registryDependencies:
  ["@fma-ds/i18n"]` e `dependencies` com `i18next` e `react-i18next`; o `i18n` continua sem eles.
- [ ] **Step 6:** commit `feat(ui): add the i18next bridge for the i18n provider`; push, PR
  empilhado.

## PR 7: documentação (`docs/i18n-page`, empilhado)

### Task 14: página `/docs/i18n`

**Files:** Create `apps/web/src/routes/_site/_docs/docs.i18n.tsx` (padrão de `docs.tsx`: `H2`,
`P`, `C`, `CodeBlock`); Modify `apps/web/src/site/docs-nav.tsx` (link); e2e em
`apps/web/e2e/site.spec.ts` (página abre, título "Internationalization").

Seções, na ordem:
1. instalar (`shadcn add @fma-ds/i18n @fma-ds/i18n-pt-br`);
2. idioma fixo;
3. precedência;
4. overrides e "não edite a lib, sobrescreva ao atualizar";
5. idioma novo;
6. com i18next (`shadcn add @fma-ds/i18n-i18next`, `FmaI18nextProvider`, `changeLanguage`,
   pacotes estáticos vs. sob demanda, instância por requisição no SSR, um exemplo de namespaces
   por feature no i18next com `CustomTypeOptions`);
7. sem lib de i18n: idioma pela rota (`/$lang` + `locale` controlado + `onLocaleChange` navegando)
   e provider controlando o idioma (detecção, `detect={false}`, `useFmaLocale().setLocale`,
   `loadFmaMessages` + `initialLocale` no SSR com TanStack Start);
8. outras libs (Paraglide etc., `locale` controlado);
9. máscaras e formato;
10. receitas para zod 4 (`z.config(z.locales.ptBR())` no `languageChanged` ou no
    `onLocaleChange`) e `date-fns-compat` (`setDefaultLocale` no mesmo ponto).

- [ ] **Step 1:** e2e falha (rota não existe). **Step 2:** escrever a página.
- [ ] **Step 3:** `pnpm --filter web test:e2e` passa; `llms.txt` não muda (página não é item).
- [ ] **Step 4:** commit `docs(web): document the i18n provider`; push, PR empilhado.

## PR 8: o site como caso de uso (`feat/web-i18n`, empilhado)

### Task 15: interface do `apps/web` em pt-BR com seletor, via i18next + ponte

**Files:**
- Modify: `apps/web/package.json` (`i18next`, `react-i18next`, `i18next-resources-to-backend`;
  versões com mais de 7 dias)
- Create: `apps/web/src/i18n/index.ts`: `createI18n(lng)` faz `i18next.createInstance()` com
  `fallbackLng: "en"`, `supportedLngs: ["en", "pt-BR"]`, `defaultNS: "common"`, backend
  `resourcesToBackend((lng, ns) => import(...))` e `react: { useSuspense: true }`. Também exporta
  `fmaLocales = { "pt-BR": () => import("@/lib/i18n-pt-br/index") }`.
- Create: `apps/web/src/i18n/i18next.d.ts` (`CustomTypeOptions` com `resources` dos três
  namespaces em inglês e `enableSelector: true`)
- Create: namespaces como TS `as const` (para inferir os parâmetros):
  - `apps/web/src/i18n/locales/{en,pt-BR}/common.ts`;
  - `apps/web/src/site/i18n/{en,pt-BR}.ts` (`site`: header, nav, home, página de item, busca,
    404);
  - `apps/web/src/theme-editor/i18n/{en,pt-BR}.ts` (`themeEditor`: painéis, campos,
    import/export).

  Cada pt-BR usa `satisfies` sobre um tipo derivado do en, para o compilador checar a completude.
- Create: `apps/web/src/site/locale-select.tsx` (seletor no header, ao lado do `theme-select`,
  usando `changeLanguage(i18n, lng, fmaLocales)` e gravando o cookie)
- Modify: `routes/__root.tsx`:
  - `beforeLoad`/loader com `createServerFn` lendo o cookie `fma-ds-locale` e, sem ele,
    `Accept-Language` (`parseAcceptLanguage` + negociação);
  - `await loadFmaMessages(fmaLocales, lng)`;
  - o componente cria a instância com `useState(() => createI18n(lng))` (uma por requisição no
    servidor, uma no cliente com o mesmo `lng`);
  - renderiza `<I18nextProvider>` + `<FmaI18nextProvider locales={fmaLocales}>` e
    `<html lang={lng}>`.
- Modify: componentes do site e do editor, trocando textos fixos por
  `useTranslation("site" | "themeEditor")` com seletor (`t($ => $.header.docs)`)
- Test: `apps/web/e2e/site.spec.ts`, `apps/web/e2e/theme-editor.spec.ts`

Fora do escopo: descrições dos `meta.json`, páginas de `/docs` (inclusive a nova), nomes de
stories, `llms.txt`.

- [ ] **Step 1: e2e que falham**
  - contexto Playwright com `locale: "pt-BR"` (Accept-Language) → nav do header em português no
    HTML do servidor (`page.content()` antes da hidratação) e sem erro de hidratação no console.
  - trocar para English no seletor → textos do site e dos componentes (ex.: aria-label do
    carousel numa página de exemplo) em inglês no mesmo frame; recarregar mantém inglês (cookie).
  - contexto `locale: "en-US"` → inglês.
  - editor `/themes` em pt-BR: rótulos dos painéis traduzidos; e2e existentes do editor continuam
    passando (atualize seletores por texto para `getByRole` com o nome no idioma do contexto ou
    fixe `locale: "en-US"` neles).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. Cookie gravado no seletor (`document.cookie`,
  `path=/; max-age=31536000; samesite=lax`).
- [ ] **Step 4:** `pnpm build` e `pnpm --filter web test:e2e` passam. O Worker cresce só o
  i18next/react-i18next e o texto (os namespaces e o pacote pt-BR entram por `import()`). Compare
  o `.output/server` com o da `main` e registre o aumento no PR.
- [ ] **Step 5:** commit `feat(web): translate the site interface to pt-BR with a language switcher`;
  push, PR empilhado.

---

## Ao terminar cada PR

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm --filter @fma-ds/ds build
pnpm --filter @fma-ds/ds test:storybook   # PRs 2–6
pnpm --filter web test:e2e                # PRs 7–8
git status   # registry.json / public/r no commit
```
