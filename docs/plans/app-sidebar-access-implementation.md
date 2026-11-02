# Estados de acesso no `app-sidebar`: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado)
> ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox
> (`- [ ]`) para acompanhamento.

**Objetivo:** dar aos itens do `app-sidebar` os campos `access`, `badge` e `external`, com um
mecanismo genérico `isInactive` na `core/sidebar`.

**Arquitetura:** a core ganha só o mecanismo de item inativo, sem domínio. O bloco traduz o contrato:
`nav-access.ts` limpa os dados, `nav-item-status.tsx` desenha o estado, e `nav-section.tsx` trata pai
não `granted` como item simples.

**Stack:** React 19, react-aria-components, Tailwind v4, Storybook + vitest (`play`), Biome.

**Spec:** [app-sidebar-access.md](app-sidebar-access.md). Leia antes de começar.

## Restrições globais

- Comece de `main` atualizada, no branch `feat/app-sidebar-access`. Só abra PR depois de tudo
  verificado localmente.
- Commits em inglês, Conventional Commits, atômicos. Nunca use `--no-verify`.
- O pre-commit compara o registro: todo commit que toca `packages/ds/src/core` ou `src/blocks` roda
  antes `pnpm --filter @fma-ds/ds build` e inclui `packages/ds/registry.json` e `apps/web/public/r/`.
  Esses arquivos nunca são editados à mão.
- Sem `status`, `access`, `gated` ou `blocked` na `core/sidebar`.
- Nada de `bg-muted` ou `bg-foreground/N` como destaque de interação (regra 11).
- Sem inglês fixo no código publicado; o único texto do bloco é `opensInNewTab`.
- Stories: render é o exemplo copiável; `Should*` levam `tags: ["!autodocs"]`.
- `tests/site-translations.test.ts` falha a partir da Tarefa 3 por causa das stories novas. É
  esperado, e a Tarefa 5 resolve.

## Foco de revisão

Casos que a spec implica e que os testes pedidos não cobririam sozinhos. Cada um tem teste na tarefa
indicada:

1. `blocked` ativado por `Enter` ou `Espaço`, não só por clique: não pode navegar (Tarefa 1).
2. Item `blocked` com `isActive`: sem `aria-current` nem destaque de página atual (Tarefa 3).
3. Link `external` com `RouterProvider`: abre no browser, sem passar pelo `navigate` do app (Tarefa 3).
4. Pai `granted` com `badge`: continua expandindo, com o badge no nome do botão (Tarefa 4).
5. Pai `gated` com subitens, sidebar recolhida: é link direto, sem abrir dropdown (Tarefa 4).

---

### Tarefa 1: `isInactive` na `core/sidebar`

**Arquivos:**
- Modificar: `packages/ds/src/core/sidebar/sidebar.tsx` (`SidebarMenuButton`, `SidebarMenuSubButton`)
- Modificar: `packages/ds/src/core/sidebar/sidebar.stories.tsx`
- Modificar: `packages/ds/src/core/sidebar/meta.json`

**Interfaces:**
- Produz: `isInactive?: boolean` em `SidebarMenuButton` e `SidebarMenuSubButton`.

- [ ] **Passo 1: criar o branch**

```bash
git switch main && git pull && git switch -c feat/app-sidebar-access
git add docs/plans/app-sidebar-access.md docs/plans/app-sidebar-access-implementation.md
git commit -m "docs: plan the app-sidebar access states"
```

- [ ] **Passo 2: escrever a story `InactiveItem`, que falha**

Composição com um item `isInactive href="/billing"` ("Billing") e um `SidebarMenuSubButton` igual
("Plans"), e a mesma estrutura da `Default`, mais `SidebarMenuSub`. O `play`:

```tsx
const item = canvas.getByRole("button", { name: "Billing" });
await expect(item).toHaveAttribute("aria-disabled", "true");
await expect(item).not.toHaveAttribute("href");
await userEvent.tab(); // repita até chegar em `item`
await expect(item).toHaveFocus();
await userEvent.keyboard("{Enter}");
await userEvent.keyboard(" ");
await expect(navigate).not.toHaveBeenCalled();
await userEvent.click(item);
await expect(navigate).not.toHaveBeenCalled();
await expect(getComputedStyle(item).pointerEvents).not.toBe("none");
```

`navigate` é um `fn()` em um `RouterProvider` no `decorators`. Repita as asserções de `aria-disabled`
e `href` para "Plans".

- [ ] **Passo 3: confirmar a falha**

Rode: `pnpm --filter @fma-ds/ds exec vitest run --project storybook src/core/sidebar`
Esperado: FALHA, porque `isInactive` ainda não existe e o item é link.

- [ ] **Passo 4: implementar `isInactive` nos dois botões**

- Com `isInactive`, renderiza sempre `ButtonPrimitive`, removendo `href`, `target`, `rel` e `onPress`
  das props.
- Passa `aria-disabled="true"` e `data-inactive={isInactive || undefined}`.
- Uma constante compartilhada de classes faz o trabalho:
  `aria-disabled:pointer-events-auto aria-disabled:opacity-100 data-inactive:text-sidebar-foreground/50`,
  mais hover e active neutros (`data-inactive:hover:bg-transparent`,
  `data-inactive:hover:text-sidebar-foreground/50` e os equivalentes de `active:`).
- A atenuação é por cor, herdada por ícone e título, e o `Badge` mantém a própria cor. No subitem,
  inclua `data-inactive:[&>svg]:text-sidebar-foreground/50`.
- Sem `tooltip` ativo, nada muda; `isInactive` não afeta o `TooltipTrigger`.

- [ ] **Passo 5: confirmar que passa**

Rode: `pnpm --filter @fma-ds/ds exec vitest run --project storybook src/core/sidebar`
Esperado: PASSA.

- [ ] **Passo 6: documentar em `meta.json`**

Acrescente à descrição uma frase sobre `isInactive`: visível e focável, mas não navega.

- [ ] **Passo 7: regenerar e fazer commit**

```bash
pnpm --filter @fma-ds/ds build
git add packages/ds/src/core/sidebar packages/ds/registry.json apps/web/public/r
git commit -m "feat(ui): add an inactive state to the sidebar menu buttons"
```

### Tarefa 2: contrato e `nav-access.ts`

**Arquivos:**
- Modificar: `packages/ds/src/blocks/app-sidebar/types.ts`
- Criar: `packages/ds/src/blocks/app-sidebar/nav-access.ts`
- Testar: `packages/ds/tests/app-sidebar-nav-access.test.ts`

**Interfaces:**
- Produz, em `types.ts`: `AppSidebarItemBadge` e `AppSidebarItemAccess`, exatamente como na spec, e
  `external?: boolean` nos dois tipos de item, que viram `Base & AppSidebarItemAccess`.
- Produz, em `nav-access.ts`:
  - `visibleNav(nav: AppSidebarNavSection[]): AppSidebarNavSection[]`
  - `isExpandable(item: AppSidebarNavItem): boolean`: tem subitens e `access` é `granted` ou omitido.
  - `itemLabel(item: { title: string; badge?: AppSidebarItemBadge }): string`: `"Audit, Coming soon"`,
    ou só o título.
  - `externalLinkProps(item): { target?: "_blank"; rel?: string }`: vazio sem `external` ou com
    `blocked`.

- [ ] **Passo 1: escrever os testes, que falham**

Importe de `@/blocks/app-sidebar/nav-access`. Casos, com `s = (...items) => [{ title: "S", items }]`:

```ts
it("drops hidden items", ...); // Home + {access:"hidden"} => só Home
it("drops a parent whose children are all hidden", ...);
it("keeps a parent whose children are all blocked", ...);
it("keeps a blocked or gated parent even with hidden children", ...);
it("drops hidden children and keeps the others", ...);
it("keeps a leaf with an empty items array", ...);
it("drops a section left empty", ...); // resultado: []
it("leaves data without access unchanged", ...); // toEqual na entrada
it("only expands a granted parent", ...); // isExpandable: undefined/granted true; blocked/gated false; sem subitens false
it("names an item with its badge", ...); // "Audit, Coming soon"; sem badge: "Audit"
it("opens external links in a new tab", ...); // {target:"_blank", rel:"noopener noreferrer"}
it("ignores external on a blocked item", ...); // {}
```

- [ ] **Passo 2: confirmar a falha**

Rode: `pnpm exec vitest run --project unit packages/ds/tests/app-sidebar-nav-access.test.ts`
Esperado: FALHA ao resolver `@/blocks/app-sidebar/nav-access`.

- [ ] **Passo 3: implementar `types.ts` e `nav-access.ts`**

Copie o comentário do contrato da spec, incluindo que `gated` só informa. `visibleNav` não muda a
ordem nem cria objetos para itens sem subitens filtrados.

- [ ] **Passo 4: confirmar que passa**

Rode o comando do Passo 2 e `pnpm type-check`. Esperado: tudo PASSA.

- [ ] **Passo 5: fazer commit**

```bash
pnpm --filter @fma-ds/ds build
git add packages/ds/src/blocks/app-sidebar packages/ds/tests/app-sidebar-nav-access.test.ts packages/ds/registry.json apps/web/public/r
git commit -m "feat(ui): add the access contract to the app-sidebar items"
```

### Tarefa 3: estado em itens simples e subitens

**Arquivos:**
- Criar: `packages/ds/src/blocks/app-sidebar/nav-item-status.tsx`
- Criar: `packages/ds/src/blocks/app-sidebar/app-sidebar-i18n/app-sidebar-pt-BR.ts`
- Modificar: `packages/ds/src/blocks/app-sidebar/nav-section.tsx`, `app-sidebar.tsx`
- Modificar: `packages/ds/src/lib/i18n-pt-br/i18n-pt-br.ts`
- Modificar: `packages/ds/src/blocks/app-sidebar/app-sidebar.stories.tsx`

**Interfaces:**
- Consome: `isInactive` (Tarefa 1); `visibleNav`, `itemLabel`, `externalLinkProps` (Tarefa 2).
- Produz: `NavItemStatus({ item, externalLabel, withDot }: { item: AppSidebarNavItem |
  AppSidebarNavSubItem; externalLabel: string; withDot?: boolean })`.
- Produz: `AppSidebarProps["i18n"]`, `appSidebarEn` e `NavSection({ section, externalLabel })`.

- [ ] **Passo 1: escrever as stories, que falham**

Crie em `app-sidebar.stories.tsx` a constante `ACCESS_NAV`, com uma seção "Workspace":

| title | url | Campos |
| --- | --- | --- |
| Reports | `/reports` | `access: "blocked"`, badge "No access" com `LockIcon` |
| Audit | `/audit` | `access: "blocked"`, badge "Coming soon", `isActive: true` |
| Automations | `/automations` | `access: "gated"`, badge "Upgrade" com `SparklesIcon` |
| Invoices | `/invoices` | `access: "gated"`, badge "Payment due", `tone: "warning"`, `TriangleAlertIcon` |
| Changelog | `/changelog` | badge "New", `tone: "info"` |
| Help | `https://example.com/help` | `external: true` |
| Internal | `/internal` | `access: "hidden"` |

Stories `Blocked`, `Gated`, `Badges` e `ExternalLink` mostram cada grupo. Regressões:

```tsx
export const ShouldNotNavigateBlockedItem: Story = {
  tags: ["!autodocs"],
  args: { data: ACCESS_DATA },
  play: async ({ canvas }) => {
    navigate.mockClear();
    const reports = canvas.getByRole("button", { name: "Reports No access" });
    await expect(reports).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(reports);
    await expect(navigate).not.toHaveBeenCalled();
    const audit = canvas.getByRole("button", { name: "Audit Coming soon" });
    await expect(audit).not.toHaveAttribute("aria-current");
    await expect(audit).not.toHaveAttribute("data-active", "true");
  },
};
```

- `ShouldNavigateGatedItem`: `link` "Automations Upgrade" e `navigate` chamado com
  `("/automations", undefined)`.
- `ShouldHideHiddenItem`: `queryByText("Internal")` nulo.
- `ShouldOpenExternalLink`: o link com nome `/^Help/` tem `target="_blank"`,
  `rel="noopener noreferrer"` e nome contendo "opens in new tab". Clique não chama `navigate`.
- `ShouldShowBlockedSubItem`: em um pai `granted` expandido, subitem `blocked` é `button` com
  `aria-disabled` e não navega.

- [ ] **Passo 2: confirmar a falha**

Rode: `pnpm --filter @fma-ds/ds exec vitest run --project storybook src/blocks/app-sidebar`
Esperado: as stories novas FALHAM.

- [ ] **Passo 3: implementar `NavItemStatus`**

Renderiza, nesta ordem e quando houver `badge`:

- `<span className="sr-only">{badge.label}</span>`;
- `Badge` com `aria-hidden`, `size="xs"` e `className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden [&_svg]:size-2.5!"`;
- com `withDot`, um `<span aria-hidden>` `absolute top-1 right-1 hidden size-1.5 rounded-full group-data-[collapsible=icon]:block`.

Com `external` válido, renderiza `ExternalLinkIcon` em `aria-hidden` com `ml-auto`, e `externalLabel`
em `sr-only`.

```ts
const TONE_VARIANT = { neutral: "muted", primary: "primary-light", success: "success-light",
  info: "info-light", warning: "warning-light" } as const;
const TONE_DOT = { neutral: "bg-muted-foreground", primary: "bg-primary", success: "bg-success",
  info: "bg-info", warning: "bg-warning" } as const;
```

O `tone` padrão é `primary` para `gated` e `neutral` para os demais.

- [ ] **Passo 4: ligar em `nav-section.tsx` e `app-sidebar.tsx`**

- `app-sidebar.tsx` declara `AppSidebarConfig = { labels: { opensInNewTab: string } }`, `appSidebarEn`
  (`"opens in new tab"`) e `declare global { interface FmaNamespaces { appSidebar: AppSidebarConfig } }`,
  lê com `useFmaMessages("appSidebar", appSidebarEn, i18n)` e passa `externalLabel` a `NavSection`.
  O texto segue por prop comum porque o gate exige que quem aceita `i18n` leia o provider.
- `AppSidebar` itera `visibleNav(data.nav)`, com `useMemo`.
- Item simples: `isInactive={item.access === "blocked"}`, `isActive` e `aria-current` falsos se
  `blocked`, `tooltip={itemLabel(item)}`, `{...externalLinkProps(item)}`, título com
  `className="truncate"`, seguido de `<NavItemStatus withDot />`.
- `SidebarMenuSubButton` em `CollapseItem`: mesmo tratamento, sem `withDot`.

- [ ] **Passo 5: adicionar a tradução**

```ts
export const appSidebarPtBR = defineFmaNamespace("appSidebar", {
  labels: { opensInNewTab: "abre em nova aba" },
});
```

Importe e inclua `appSidebar: appSidebarPtBR` em `i18n-pt-br.ts`.

- [ ] **Passo 6: confirmar que passa**

Rode o comando do Passo 2 e `pnpm exec vitest run --project unit packages/ds/tests/i18n-coverage.test.ts`.
Esperado: PASSAM, incluindo as stories que já existiam, com nomes como `"Home"` inalterados.

- [ ] **Passo 7: fazer commit**

```bash
pnpm --filter @fma-ds/ds build
git add packages/ds/src/blocks/app-sidebar packages/ds/src/lib/i18n-pt-br packages/ds/registry.json apps/web/public/r
git commit -m "feat(ui): show access states on app-sidebar items"
```

### Tarefa 4: pais, dropdown e modo recolhido

**Arquivos:**
- Modificar: `packages/ds/src/blocks/app-sidebar/nav-section.tsx`
- Modificar: `packages/ds/src/blocks/app-sidebar/app-sidebar.stories.tsx`

**Interfaces:**
- Consome: `isExpandable`, `itemLabel` (Tarefa 2); `NavItemStatus` (Tarefa 3).

- [ ] **Passo 1: escrever as stories, que falham**

`CollapsedAccess` (autodocs) recolhe a sidebar com o trigger, como `CollapsedToIcons`, e restaura ao
final. `AccessCombinations` (autodocs) mistura pais e filhos em todos os estados. Regressões:

- `ShouldNotExpandGatedParent`: pai `gated` com subitens é `link`, nenhum subitem aparece, e o clique
  navega para o `url` do pai. O mesmo, depois de recolher: não abre `menu`.
- `ShouldNotExpandBlockedParent`: pai `blocked` com subitens é `button` sem `aria-expanded`.
- `ShouldExpandGrantedParentWithBadge`: botão "Models New" tem `aria-expanded="false"` e passa a
  `"true"` ao clicar.
- `ShouldReachBlockedDropdownItem`: em pai `variant: "dropdown"`, abra o menu, use `{ArrowDown}` até o
  subitem "Audit Coming soon", confira `toHaveFocus`, pressione `{Enter}`; `navigate` não foi chamado
  e o menu continua aberto.
- `ShouldShowReasonInCollapsedTooltip`: recolhida, foco por teclado em "Reports"; `findByRole("tooltip")`
  tem o texto `"Reports, No access"`.

- [ ] **Passo 2: confirmar a falha**

Rode: `pnpm --filter @fma-ds/ds exec vitest run --project storybook src/blocks/app-sidebar`
Esperado: as stories novas FALHAM.

- [ ] **Passo 3: implementar em `nav-section.tsx`**

- O ramo de item simples passa a ser `if (!isExpandable(item))`.
- `CollapseItem` e `DropdownItem`: `<span className="truncate">` no título, `<NavItemStatus withDot />`
  antes da seta e `tooltip={itemLabel(item)}`.
- `DropdownItem`, subitem `blocked`: sem `href`, `shouldCloseOnSelect={false}`,
  `textValue={itemLabel(subItem)}` e `className="text-muted-foreground"`. Os demais subitens mantêm
  `href`, com `{...externalLinkProps(subItem)}` e `textValue={itemLabel(subItem)}`.
- `NavItemStatus` no subitem do dropdown fica visível: como o badge usa
  `group-data-[collapsible=icon]:hidden` e o menu abre em portal, confirme isso na story.

- [ ] **Passo 4: confirmar que passa**

Rode o comando do Passo 2. Esperado: PASSA.

- [ ] **Passo 5: fazer commit**

```bash
pnpm --filter @fma-ds/ds build
git add packages/ds/src/blocks/app-sidebar packages/ds/registry.json apps/web/public/r
git commit -m "feat(ui): apply access states to app-sidebar parents and menus"
```

### Tarefa 5: documentação, traduções do site e verificação final

**Arquivos:**
- Modificar: `packages/ds/src/blocks/app-sidebar/meta.json`
- Modificar: `apps/web/src/site/i18n/items-pt-BR.json`, `story-names-pt-BR.json`, `stories-pt-BR.json`,
  `story-text-pt-BR.json`, `story-text-en.json`

- [ ] **Passo 1: atualizar a descrição do bloco**

Acrescente em `meta.json` um item **Acesso**: `access`, `badge` e `external`, com a frase de que
`gated` só informa e a aplicação guarda a rota. Traduza para o mesmo item em `items-pt-BR.json`.
Sincronize a descrição de `sidebar` (Tarefa 1).

- [ ] **Passo 2: listar o que falta**

Rode: `pnpm exec vitest run --project unit packages/ds/tests/site-translations.test.ts`
Esperado: FALHA, listando os textos, descrições e nomes das stories novas.

- [ ] **Passo 3: completar os dicionários**

Em pt-BR, use os rótulos: "Sem acesso", "Em breve", "Upgrade", "Pagamento pendente", "Novo". Em
`story-names-pt-BR.json`: "Bloqueado", "Liberado com aviso", "Badges", "Link externo", "Acesso com a
barra recolhida" e "Combinações de acesso".

- [ ] **Passo 4: verificar tudo**

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm --filter @fma-ds/ds build && pnpm --filter @fma-ds/ds test:storybook
```

Esperado: tudo PASSA.

- [ ] **Passo 5: conferir no browser**

Com `pnpm storybook`, veja as stories de acesso expandidas e recolhidas, em tema claro e escuro, e em
largura de celular. Confira título longo com badge longo: o título trunca, o badge não.

- [ ] **Passo 6: fazer commit**

```bash
git add packages/ds/src/blocks/app-sidebar apps/web/src/site/i18n packages/ds/registry.json apps/web/public/r
git commit -m "docs(ui): document the app-sidebar access states"
```

---

## Fase 2: menus por composição

Revisão no topo da [spec](app-sidebar-access.md). As Tarefas 1 a 5 já estão feitas. Vale a seção
"Restrições globais", e o Foco de revisão continua coberto pelas stories reescritas.

### Tarefa 6: subcomponentes no lugar de `data.nav`

**Arquivos:**
- Criar: `packages/ds/src/blocks/app-sidebar/nav-items.tsx`
- Remover: `packages/ds/src/blocks/app-sidebar/nav-section.tsx`
- Modificar: `types.ts`, `nav-access.ts`, `nav-item-status.tsx`, `app-sidebar.tsx`
- Modificar: `app-sidebar.stories.tsx`, `packages/ds/tests/app-sidebar-nav-access.test.ts`

**Interfaces:**
- Produz, em `types.ts`: `AppSidebarData = { user: AppSidebarUser } & AppSidebarBranding`,
  `AppSidebarItemAccess` sem `hidden`, `AppSidebarSectionProps`, `AppSidebarItemProps` e
  `AppSidebarSubItemProps`. Saem `AppSidebarNavItem`, `AppSidebarNavSubItem` e `AppSidebarNavSection`.
- `AppSidebarItemProps`: `{ title; icon?; isActive?; external?; variant?; }`, mais
  `AppSidebarItemAccess`, mais `{ href: string; children?: undefined } | { href?: string; children: ReactNode }`.
- Produz, em `nav-items.tsx`: `AppSidebarSection`, `AppSidebarItem`, `AppSidebarSubItem`, reexportados
  por `app-sidebar.tsx` com `export { ... } from "./nav-items"`.
- Produz, em `nav-access.ts`: `itemLabel` (igual) e
  `externalLinkProps({ external, access, isExpandable })`. Saem `visibleNav` e `isExpandable`.
- `AppSidebar` perde `externalLabel` por prop: `AppSidebarItem` e `AppSidebarSubItem` leem
  `useFmaMessages("appSidebar", appSidebarEn)` por um contexto do bloco com `i18n`, e o namespace passa
  para `nav-items.tsx`. `AppSidebar` continua aceitando `i18n`.

- [ ] **Passo 1: reescrever as stories, que falham**

Cada story passa a ter `render` com a composição real, e `SidebarProvider`, `SidebarInset` e
`SidebarTrigger` vão para `decorators`. Mantenha os mesmos nomes e `play`, com estas mudanças:

- `ShouldHideHiddenItem` vira `ShouldSkipConditionalItems`: `{false && <AppSidebarItem />}` não aparece.
- Novas: `ShouldDropEmptyParent` e `ShouldDropEmptySection`.
- `AUTOMATIONS`, `REPORTS` e demais constantes viram props espalhadas (`<AppSidebarItem {...REPORTS} />`).

- [ ] **Passo 2: confirmar a falha**

Rode: `pnpm --filter @fma-ds/ds exec vitest run --project storybook src/blocks/app-sidebar`
Esperado: FALHA, porque `AppSidebarItem` ainda não existe.

- [ ] **Passo 3: ajustar os testes de `nav-access`**

Remova `visibleNav` e `isExpandable`; `externalLinkProps` testa `isExpandable: true`.

- [ ] **Passo 4: implementar `nav-items.tsx` e os tipos**

Mova a lógica de `nav-section.tsx`:

- `AppSidebarSection`: `SidebarGroup` e `SidebarMenu`, ou `null` sem filhos.
- `AppSidebarItem`: decide expansível com `children !== undefined && (access ?? "granted") === "granted"`.
  Expansível sem filhos em `Children.toArray` retorna `null`. Não expansível renderiza como item simples.
- `AppSidebarSubItem`: contexto `"collapse" | "menu"`, com padrão `"collapse"`. `DropdownItem` envolve
  `DropdownMenu` no provider com `"menu"`.

- [ ] **Passo 5: confirmar que passa**

Rode os comandos de Storybook do Passo 2 e, em unit, `tests/app-sidebar-nav-access.test.ts`,
`tests/app-sidebar-badge-contrast.test.ts` e `tests/i18n-coverage.test.ts`.
Esperado: PASSAM.

- [ ] **Passo 6: fazer commit**

```bash
pnpm --filter @fma-ds/ds build
git add packages/ds/src/blocks/app-sidebar packages/ds/tests packages/ds/registry.json apps/web/public/r
git commit -m "refactor(ui)!: compose the app-sidebar menus from sub-components"
```

### Tarefa 7: editor de temas, documentação e verificação

**Arquivos:**
- Modificar: `apps/web/src/theme-editor/sidebar-preview.tsx`
- Modificar: `packages/ds/src/blocks/app-sidebar/meta.json`
- Modificar: `apps/web/src/site/i18n/items-pt-BR.json` e os dicionários `story-*`

- [ ] **Passo 1: migrar `sidebar-preview.tsx`**

Troque `data.nav` pela composição, com o mesmo conteúdo.

- [ ] **Passo 2: atualizar `meta.json` e `items-pt-BR.json`**

Descreva `AppSidebarSection`, `AppSidebarItem` e `AppSidebarSubItem`, e o limite da contagem de filhos.

- [ ] **Passo 3: alinhar os dicionários**

Rode: `pnpm --filter @fma-ds/ds exec vitest run --project unit tests/site-translations.test.ts`
Esperado: PASSA depois de remover os textos perdidos (como "Internal") e incluir os novos.

- [ ] **Passo 4: verificar tudo**

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm --filter @fma-ds/ds build && pnpm --filter @fma-ds/ds test:storybook && pnpm --filter web test:e2e
```

Esperado: tudo PASSA. `test:e2e` entra porque o editor de temas mudou.

- [ ] **Passo 5: conferir no browser**

Veja `/themes` e as stories de acesso, expandidas e recolhidas, no tema padrão e no cobalt.

- [ ] **Passo 6: fazer commit**

```bash
git add apps/web/src packages/ds/src/blocks/app-sidebar packages/ds/registry.json apps/web/public/r docs/plans
git commit -m "docs(ui): document the composed app-sidebar menus"
```

