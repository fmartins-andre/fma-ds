# Padrão variant × tone

Decisões da padronização de variantes e tons. Preview usado para validar (privado):
https://claude.ai/artifact/QtDJvRcSYGA5PvPvqQqHYg

## Eixos

- `variant`: `solid` · `soft` · `outline` · `ghost`.
- `tone`: `brand` · `primary` · `neutral` · `success` · `warning` · `info` · `destructive`.
- Sem aliases dos nomes antigos (`default`, `secondary`, `destructive` como variante, `link`,
  `*-light`, `*-outline`, `*-dot`, `invert`, `tinted`, `muted`, `elevated`, `frame`).

## Suporte por componente

| componente | variantes | padrão |
|---|---|---|
| Badge | solid, soft, outline, ghost | solid / primary |
| Button (e LinkButton) | solid, soft, outline, ghost | solid / primary |
| IconTile | solid, soft, outline, ghost | outline / neutral |
| Alert | solid, soft, outline | outline / neutral |
| Bubble | solid, soft, outline | solid / primary |
| Glance (trigger) | solid, soft, outline | outline / neutral |

Todo tom vale em toda variante suportada.

**Tom padrão:** `primary` quando a variante é `solid`, `neutral` nas demais. Assim os usos
atuais de `variant="outline"` / `"ghost"` (Button, Badge) continuam neutros sem mudar o JSX, e
os padrões da tabela acima saem da mesma regra.

## Receitas

- **solid**: fundo no tom, texto `--tone-foreground`; hover com 85% do tom sobre o fundo.
- **soft**: só superfície, **sem borda** (borda transparente para manter as dimensões): mistura
  opaca do tom com `--background`, 10% no claro e 18% no escuro, igual em todos os componentes;
  texto no tom; hover = 1.8 × a tinta do soft. A tinta é a configuração opcional `softMix`
  (`{ light, dark }`, padrão 10% / 18%).
- **outline**: borda com 38% (claro) / 45% (escuro) do tom sobre o fundo, fundo da página,
  texto no tom; hover = superfície soft.
- **ghost**: sem superfície, texto no tom; hover = superfície soft.
  - Badge ghost = dot do tom antes do texto em `--foreground`.
  - IconTile ghost = só o ícone no tom, com o mesmo tamanho do tile.
- **Texto no tom** (soft, outline, ghost, título do Alert outline, texto do Bubble outline):
  token `--X-text` por tom colorido (`primary`, `brand`, `success`, `warning`, `info`,
  `destructive`). Valor inicial: 50% do tom com `--foreground` (oklab), movendo só o L quando
  reprova o gate (`deriveToneText`; usado pelo importador e pelo botão "derivar do tom" do editor).
- **Ícone e dot no tom**: `color-mix(in oklab, var(--X), var(--X-text) var(--tone-icon-mix, 42%))`,
  inclusive o brand (42% de `-text` ≈ 21% de `--foreground`). `iconMix` é configuração opcional
  do tema (como `spacing`): Supabase 62%, Cobalt e Kodama Grove 51%, Amber Minimal 45%.
- Gate: `--X-text` ≥ 4.5 sobre a página e o soft, ≥ 3 sobre o hover do soft; ícone e dot ≥ 3
  sobre a página e o soft.
- Alert solid: descrição em 78% de `--tone-foreground` sobre o tom.

## Neutral

> **Revisão de 2026-11-19, implementada no PR #81 (2026-11-20).** A versão mergeada (#76–#80)
> usava a família muted no tom neutral. A revisão cria tokens próprios e deixa o `--muted` só
> para superfícies estáticas. Preview com os 23 temas: ver "Preview da revisão do neutral".

### Por que sair do muted

O `--muted` é ajustado pelos autores de tema para zebra, skeleton e rodapé, não para hover.
Medido nos 46 tema×modo (ΔL do `--muted` em relação ao `--background`):

- Claro: de −0.015 a −0.099. Escuro: de **−0.047** a **+0.321**.
- 15 combinações em 14 temas falham como hover:
  - Claude escuro: o muted é **mais escuro** que o fundo, então o hover neutro afunda.
  - Soft Pop escuro: +0.32, o hover ghost vira quase um bloco cheio.
  - |ΔL| < 0.03, hover quase invisível: Amber Minimal, Clean Slate, Cobalt, Cosmic Night,
    Indigo, Kodama Grove, Modern Minimal, Plum, Soft Pop e Violet Bloom claros; Nature,
    Starry Night e Vintage Paper escuros.

O neutral derivado pela receita dos tons coloridos (`--neutral` a 10% / 18% sobre o fundo) fica
entre −0.033 e −0.075 no claro e entre +0.062 e +0.152 no escuro, em todos os temas, e herda o
matiz do tema.

Referências: Chakra, Joy UI e Radix Themes têm escala neutral própria, separada da superfície
muted. O shadcn é quem reaproveita o `--muted` (todos os 8 estilos usam `hover:bg-muted` nos
botões e `focus:bg-accent` nos itens de menu e select).

Rejeitado: usar a paleta `neutral-*` do Tailwind. Degraus fixos não conhecem o fundo do tema:
`neutral-100` fica mais claro que o fundo em 4 temas claros e quase invisível em 13;
`neutral-800` fica abaixo do fundo em 5 temas escuros; `neutral-500` não chega a 3:1 em Cobalt,
Indigo e Kodama escuros. Além disso não tem matiz e não é editável (regra 10).

### Tokens

| token | papel | valor inicial (importador e temas atuais) |
|---|---|---|
| `--neutral` | cor cheia do tom (solid, ícone, base das misturas) | `--muted-foreground` |
| `--neutral-foreground` | texto sobre o solid | `--background` |
| `--neutral-text` | texto no tom (soft, outline, ghost) | `--foreground` |

Com esses valores iniciais o solid fica igual ao de hoje; o que muda é soft e hover.

### Receita

O neutral passa a seguir a receita padrão dos tons coloridos (seção "Receitas"), com uma única
exceção:

| | valor |
|---|---|
| solid | fundo `--neutral`, texto `--neutral-foreground`; hover 85% do tom sobre o fundo |
| soft | `--neutral` a 10% (claro) / 18% (escuro) sobre o fundo; hover 1.8 × |
| outline | **borda `--border`** (exceção); hover = superfície soft |
| ghost | hover = superfície soft |
| texto / ícone | `--neutral-text` / mistura do tom com o `-text` por `iconMix` (decidido) |

Exceção da borda: pela receita (38% / 45%) a borda neutral sairia por volta de ΔL −0.17 no
claro, bem mais escura que a borda dos inputs. O outline neutro tem de casar com os campos, e
casa: por padrão `--input` tem o mesmo valor do `--border` (seção "Campos").

Ícone: hoje é `--muted-foreground` puro. Pela receita fica 42% mais perto do `-text` (mais
escuro). Contraste do ícone sobre o soft: ≥ 4.04:1 em todos os temas (Kodama Grove claro é o
menor). **Decidido em 2026-11-20 (preview):** o ícone segue a receita com `iconMix`, sem
segunda exceção.

Gate: `--neutral` ≥ 3:1 com `--neutral-foreground` e com o fundo; `--neutral-text` ≥ 4.5 sobre
a página e o soft. Hoje o `--muted-foreground` tem ≥ 3.46:1 com o fundo em todos os temas.

### Nome e paleta do Tailwind

`--color-neutral`, `--color-neutral-foreground` e `--color-neutral-text` convivem com a paleta
`neutral-50…950` (verificado no compilador do Tailwind v4: `bg-neutral` lê `var(--neutral)`,
`bg-neutral-100` lê `var(--color-neutral-100)`; o Tailwind não define `--color-neutral` sem
número). O risco é de leitura, não técnico. Mitigação: gate novo (seção "Gate de paleta fixa").
DaisyUI também define `--color-neutral`; quem usar as duas libs fica com a que carregar por
último. Documentar no `theming.md`.

### O que muda em volta

- `src/lib/tone.ts`: `neutral` vira um bloco igual aos coloridos, com `--tone-line:var(--border)`.
- Tokens: `styles.css` (`:root`, `.dark`, `@theme inline`), `COLOR_TOKENS`,
  `tests/required-tokens.ts`, grupo novo em `COLOR_GROUPS` (`editor-controls.ts`), os 23
  `src/themes/*.json`, `default.json` batendo com `styles.css`.
- Importador (`lib/theme/parse.ts`): temas shadcn/tweakcn não trazem `--neutral*`; preencher com
  os valores iniciais da tabela.
- `contrast.ts`: pares `neutral`/`neutral-foreground`, `background`/`neutral`, `neutral-text`
  sobre página e soft.
- Allowlist do `tests/interaction-tokens.test.ts`: menubar, navigation-menu e toggle passam a
  usar as variáveis do tom neutral (`toneVariants.neutral` + `bg-(--tone-hover)`), e as
  entradas saem. date-field (realce do segmento focado): vira `accent`, ou fica como exceção
  com motivo.
- `DataGridRowDragHandle` (`data-hovered:bg-muted`; `third-party`, fora do teste): controle
  neutro, passa a usar o tom neutral. Procurar outros `bg-muted` interativos em itens
  `third-party` e `shadcn`, que o teste não cobre.
- Guias `theming.md` e `tones.md` (en + pt-BR).

## Tokens

- `--X-foreground` = texto **sobre a cor cheia** em todos os tons, como `--primary-foreground`.
  Os componentes confiam no token: o texto sobre a cor cheia é sempre `var(--X-foreground)`,
  nunca `text-background` nem outro token. O valor é do tema; o padrão inicial dos status é o
  valor do `--background` do mesmo modo, mas um status claro pode ter `-foreground` escuro. A
  única regra é o contraste.
- Contraste mínimo de cor cheia com o seu `-foreground`: **3:1** (o mesmo dos outros pares de
  preenchimento em `contrast.ts`). Quando não atinge, só a luminosidade (L) do status muda.
- Status contra a página: ≥ 3:1 (ícones e bordas).
- Entram: `--X-text` (texto no tom) para os seis tons coloridos. Na revisão de 2026-11-19, o
  neutral ganha `--neutral`, `--neutral-foreground` e `--neutral-text` (seção "Neutral").
- Saem: `--secondary`, `--secondary-foreground`, `--invert`, `--invert-foreground`.
- `--accent` continua, para destaque de item em coleção (menu, listbox, combobox, calendário).

## Regra 11, nova redação

`--accent` / `--accent-foreground` = destaque de **item numa coleção** (hover, foco,
selecionado, hoje, intervalo). Família muted = hover de **controles neutros** (botões e
triggers do tom neutral). `muted` estático continua para zebra, footer, skeleton e texto
secundário.

**Revisão de 2026-11-19 (implementada no PR #81):** `--accent` continua igual. Hover, foco e pressionado de
controles neutros usam as variáveis do tom neutral (`--tone-hover` = superfície soft do
`--neutral`). A família muted fica **só estática** (zebra, footer, skeleton, texto secundário):
nenhum estado de interação usa `bg-muted`, sem exceção de tom. O `tests/interaction-tokens.test.ts`
perde a exceção do neutral.

**Decidido em 2026-11-20:** linha de tabela é item de coleção e fica em `accent`, ao contrário
do shadcn, que usa `hover:bg-muted` em `table-row`. O `Table` e o `DataGrid` já fazem isso
(`hover:bg-accent/50`, `data-selected:bg-accent`). `item` e link de navegação são controles
neutros (tom neutral).

## Gate de paleta fixa

Componentes publicados leem tokens. Teste novo proíbe classes da paleta fixa do Tailwind
(`(bg|text|border|ring|fill|stroke|outline|from|via|to)-(neutral|gray|zinc|slate|stone)-<n>`)
em `src/core`, `src/blocks` e `src/lib`. Hoje há uma ocorrência: `text-zinc-500` em
`src/core/file-type/file-type.tsx`. Regra entra no AGENTS.md e no `theming.md`.

## Campos (`--input`)

Decidido em 2026-11-20, no PR #81:

- **Borda**: `border-input`. Por padrão o `--input` tem o mesmo valor do `--border`, nos dois
  modos e nos 23 temas; o tema pode diferenciar.
- **Fundo**: `bg-input-background`, igual nos dois modos. É a cor derivada
  `--color-input-background` (`@theme inline`): `color-mix(in oklab, var(--input)
  var(--input-mix), transparent)`. A configuração de tema `inputMix` (`{ light, dark }`, como o
  `softMix`) gera `--input-mix`; padrão 0% no claro (campo transparente, como antes) e 30% no
  escuro (a tinta que o escuro já tinha). Editável em `/themes`. Cobalt declara 10% / 30%.
- Antes o campo era transparente no claro e `input/30` só no escuro, enquanto a busca do command
  era preenchida nos dois. Agora todo campo (input, textarea, input-group, input-otp, select,
  native-select, combobox, date-field, checkbox, radio, questionnaire, chip do filter-toolbar)
  usa a mesma fórmula; o hover só do escuro do select saiu.
- **Desabilitado**: mesmo fundo, esmaecido pelo `opacity-50` (sem `bg-input/50`).
- **Busca do command e do combobox**: campo comum, com borda (sem os `!` e sem cor própria).
- **Fora dos campos**: pílula escura das tabs e do tab-nav com `--border` e o fundo do campo;
  separador do button-group em `--border`.
- **Explorado e revertido**: borda a 3:1 (WCAG 1.4.11) com reforço automático do `--input`. O
  contraste borda/fundo subia de 1.18:1 para 2.8:1 no tema padrão, mas mudava o caráter dos
  temas; ficou a borda com o valor do `--border`.

## Preview da revisão do neutral

Atual (muted) × proposto (`--neutral`) nos 23 temas, claro e escuro, com os estados de hover
fixados: https://claude.ai/artifact/M7CAYei9mACAdTB78vJKAa (privado; gerado a partir de `src/themes/*.json`).

## Migração do `secondary`

- Button `secondary`: ação da mesma família → `soft` / `primary`; ação neutra → `soft` /
  `neutral`.
- Badge `secondary` (tags, contadores) → `soft` / `neutral`.
- Button `destructive` → `solid` / `destructive` (confirm-dialog, payment-card).
- Button/Badge `link` → sai; usos viram `ghost` / `primary`.

## Fora do escopo

- Seed de `--brand` a partir do secondary colorido (decisão em aberto).
- Indicadores fixos em primary (GlanceIndicator, Avatar, Progress, Stepper, Timeline).
- Estados de domínio (Meter `level`, Trace `status`, order-summary `tone="discount"`).
- `variant="destructive"` dos itens de menu (API do shadcn).
- App sidebar (`nav-item-status`): variantes próprias sobre tokens `sidebar-*`.
