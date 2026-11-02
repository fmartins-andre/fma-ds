# Plano: estados de acesso nos itens do `app-sidebar`

Issue: #3. Desenho combinado em 2026-11-02.

Objetivo: o `app-sidebar` representa como cada item se comporta para o usuário (normal, oculto,
bloqueado, liberado com aviso) e mostra badges, sem conhecer papéis, planos ou cobrança. A aplicação
decide o estado e os textos; o bloco só os exibe.

## Por quê

- Hoje um item é só "ativo ou não". Aplicações reais têm módulos ocultos, bloqueados, a contratar,
  com pagamento pendente, em breve e novos.
- O `isDisabled` do react-aria não serve para explicar um bloqueio: o `Link` desabilitado vira
  `<span role="link" aria-disabled>` sem `tabindex`, e a `core/sidebar` ainda desliga o hover com
  `aria-disabled:pointer-events-none`. O motivo ficaria fora do alcance do teclado e do tooltip.

## Decisões

| Decisão | Motivo |
| --- | --- |
| Escopo só do `app-sidebar` | Não há outro consumidor; o contrato fica em `types.ts`, sem lib nova |
| Sem provider, hook ou gate de rota | A aplicação decide e encapsula a lib de permissões dela |
| Comportamento (`access`) e aparência (`badge`) são campos separados | Um item pode ser "novo" e estar bloqueado; a aplicação escolhe o que mostrar |
| Texto dos badges é livre e sempre vem da aplicação | `title` e seções já vêm dela; o adapter da aplicação centraliza as traduções |
| `tone` fechado, não a `variant` do `Badge` | Precisa gerar também o ponto do modo recolhido, e mantém a sidebar coesa |
| `blocked` e `gated` exigem `badge` no tipo | Todo item restrito precisa de motivo; o erro aparece na compilação |
| `isInactive` na `core/sidebar`; contrato no bloco | O mecanismo serve à composição; a composição não herda domínio de negócio |
| `gated` não muda o destino | Navega para `item.url`, e a aplicação escolhe a rota e o que ela mostra |

`gated` só informa: a sidebar não bloqueia nada. A proteção real é da aplicação, no servidor.

## Contrato (`blocks/app-sidebar/types.ts`)

```ts
export type AppSidebarItemBadge = {
  label: string;
  /** Colors the badge and, while collapsed to icons, the dot on the item. */
  tone?: "neutral" | "primary" | "success" | "info" | "warning";
  icon?: React.ReactNode;
};

/**
 * What the item does; `badge` says why.
 * - `granted` (default): a normal link.
 * - `hidden`: not rendered.
 * - `blocked`: visible and focusable, goes nowhere. Requires a badge with the reason.
 * - `gated`: a normal link to `url`, which the app points at the page that resolves it (activate,
 *   upgrade, pay). Informative only: the app must guard the route.
 */
export type AppSidebarItemAccess =
  | { access?: "granted"; badge?: AppSidebarItemBadge }
  | { access: "hidden"; badge?: never }
  | { access: "blocked" | "gated"; badge: AppSidebarItemBadge };
```

`AppSidebarNavItem` e `AppSidebarNavSubItem` passam a ser os campos atuais, mais `external?: boolean`,
intersectados com `AppSidebarItemAccess`. Dados atuais continuam válidos.

Exemplo do adapter, na aplicação:

```ts
function reportsAccess(snapshot: AccessSnapshot, t: TFunction) {
  if (!snapshot.permissions.has("reports.read")) return { access: "hidden" } as const;
  if (snapshot.billing === "suspended") {
    return {
      access: "gated",
      badge: { label: t("nav.paymentDue"), tone: "warning", icon: <AlertTriangleIcon /> },
    } as const;
  }
  if (!snapshot.features.has("reports")) {
    return { access: "gated", badge: { label: t("nav.upgrade") } } as const;
  }
  return { access: "granted" } as const;
}
```

## Comportamento

| `access` | Aparece | Foco | Ao ativar | Visual | `tone` padrão |
| --- | --- | --- | --- | --- | --- |
| `granted` | Sim | Sim | Navega | Normal | `neutral` |
| `hidden` | Não | Não | Nada | Nada | Nenhum |
| `blocked` | Sim | Sim | Nada | Ícone e título atenuados; badge legível | `neutral` |
| `gated` | Sim | Sim | Navega para `url` | Normal | `primary` |

`tone` mapeia para o `Badge`: `muted`, `primary-light`, `success-light`, `info-light` e
`warning-light`. O ponto usa `bg-muted-foreground`, `bg-primary`, `bg-success`, `bg-info` e
`bg-warning`.

### Hierarquia

| Situação | Comportamento |
| --- | --- |
| Pai `hidden` | Some com todos os filhos |
| Pai `blocked` | Item simples inativo, sem expandir |
| Pai `gated` | Link para `item.url`, sem expandir |
| Pai `granted` | Expande, e cada filho tem estado próprio |
| Todos os filhos `hidden` | O pai some |
| Todos os filhos `blocked` | O pai continua, e os filhos aparecem bloqueados |
| Todos os itens da seção somem | A seção some |
| `blocked` com `isActive` | `isActive` é ignorado |
| `gated` com `isActive` | Continua ativo |
| Filho com estado, pai `granted` | O pai não ganha indicador |
| `blocked` com `external` | `external` é ignorado |

### Layout

- **Expandida e mobile:** ícone, título, badge e, em itens com subitens, a seta. O título trunca; o
  badge, não.
- **Recolhida:** o badge some e um ponto com a cor do `tone` aparece sobre o ícone. O tooltip mostra
  `${title}, ${badge.label}`.
- **Link externo:** `target="_blank"`, `rel="noopener noreferrer"`, ícone `ExternalLinkIcon` e o texto
  `opensInNewTab` para leitor de tela.

### Acessibilidade

- O motivo fica em um único `sr-only` dentro do item, em todos os modos, e o badge visual e o ponto
  ficam em `aria-hidden`. Assim ele não se perde ao recolher nem é lido duas vezes.
- O nome acessível fica `"<title> <badge.label>"`; a cor nunca é o único sinal.

## Mudanças

### `core/sidebar`

`SidebarMenuButton` e `SidebarMenuSubButton` ganham `isInactive`. Com ele, o item:

- renderiza como botão, ignorando `href` e `onPress`;
- mantém `tabindex`, tem `aria-disabled="true"` e `data-inactive`;
- mantém `pointer-events` (para o tooltip) e neutraliza hover e active;
- atenua ícone e título, não o badge.

`SidebarMenuBadge` não muda: é irmão do botão, posicionado de forma absoluta e estável na API. O
`source` já é `customized`. Sem `status` ou `access` na core.

### Bloco `app-sidebar`

- `nav-access.ts`: função pura que remove `hidden`, pais sem filhos visíveis e seções vazias.
- `nav-item-status.tsx`: `tone` → `Badge`, ponto e `sr-only`. Usa `Badge` da core, sem novo visual.
- `nav-section.tsx`: pai que não é `granted` renderiza como item simples, então o estado só é tratado
  em item simples e subitem.
- `app-sidebar.tsx`: aplica `nav-access` e aceita `i18n`.

Cuidados com as classes da core: `[&_svg]:size-4` afeta o ícone do badge, e
`[&>span:last-child]:truncate` deixa de alcançar o título, que precisa de `truncate` próprio.

### Dropdown

`MenuItem` descarta `aria-disabled`, e com `isDisabled` sai do foco; `Menu` não tem `disabledBehavior`.
Por isso, subitem `blocked` no dropdown é um `DropdownMenuItem` sem `href`, com
`shouldCloseOnSelect={false}`, `textValue` com o motivo e aparência atenuada. Limitação aceita: ele
não é anunciado como desabilitado, só pelo texto.

### Textos

O único texto do bloco é `opensInNewTab` ("opens in new tab"), no namespace `appSidebar`, lido com
`useFmaMessages`. A tradução fica em `app-sidebar-i18n/app-sidebar-pt-BR.ts` ("abre em nova aba") e
entra no pacote `i18n-pt-br`.

## Fora do escopo

- Lib de permissões, provider, `useAccess`, gate de rota e guia.
- Inglês fixo que já existe em `nav-user.tsx` e `team-switcher.tsx` (regra 13): mudança à parte.
- Indicador agregado no pai.

## Testes

- **`core/sidebar`:** story de `isInactive` com foco, `aria-disabled`, ausência de navegação e
  `pointer-events` ativo. O tooltip recolhido é testado no bloco.
- **Unit:** `tests/app-sidebar-nav-access.test.ts`, com as regras de remoção da hierarquia.
- **Stories do bloco:** `Blocked`, `Gated`, `Badges`, `ExternalLink`, `CollapsedAccess` e
  `AccessCombinations`. `hidden` fica nos testes de regressão, e `granted` na `Default`.
- **Regressão (`Should*`, `tags: ["!autodocs"]`):**
  - `gated` navega para `url`;
  - `blocked` recebe foco por teclado, não navega e tem o motivo no nome acessível;
  - `hidden` não renderiza, e pai e seção vazios somem;
  - pai `gated` não expande;
  - subitem `blocked` no dropdown é alcançável e não navega;
  - tooltip recolhido mostra o motivo;
  - link externo tem `target`, `rel` e o aviso.

## Critérios de pronto

- [ ] Contrato documentado em `types.ts`, com `gated` descrito como informativo.
- [ ] `isInactive` nos dois botões da `core/sidebar`.
- [ ] Hierarquia, layout e acessibilidade como descritos acima.
- [ ] Descrições nos `meta.json` e em `items-pt-BR.json`; exemplos nos dicionários `story-text-*` e
      `story-names-pt-BR.json`.
- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm --filter @fma-ds/ds test:storybook` e
      `pnpm --filter @fma-ds/ds build`, com o registro gerado incluído no commit.
