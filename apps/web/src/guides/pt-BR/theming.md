Um tema é um conjunto de variáveis CSS em `:root` (claro) e `.dark` (escuro): cores, radius, fontes, espaçamento e sombras. Os componentes nunca fixam uma cor nem derivam uma da outra; eles leem essas variáveis, então trocar o tema muda o visual de tudo de uma vez.

## Instale um tema

Cada tema curado é um item do registro. Instalar um escreve as variáveis dele no seu stylesheet, substituindo as que estão lá:

```bash
npx shadcn@latest add @fma-ds/theme-<name>
```

As fontes do tema vêm junto, como pacotes `@fontsource`. Todo tema tem as duas paletas; veja [Modo escuro](/docs/dark-mode) para alternar entre elas.

## Os tokens

As cores vêm em pares: uma superfície e o texto que vai sobre ela.

| Tokens | Para |
| --- | --- |
| `background`, `foreground` | A página e o texto dela |
| `card`, `popover` (+ `-foreground`) | Superfícies elevadas |
| `primary` | A cor principal: ações principais, seleção, foco |
| `brand` | Uma segunda cor de identidade, para anúncios e rótulos, nunca para status |
| `neutral` | O tom neutro: ações discretas, badges neutros e o hover dos controles neutros |
| `success`, `warning`, `info`, `destructive` | Status |
| `muted`, `muted-foreground` | Superfícies estáticas discretas (zebra, rodapé, skeleton) e texto secundário. Nunca hover, foco ou seleção |
| `accent`, `accent-foreground` | O item em destaque numa coleção: menu, listbox, calendário, linha de tabela |
| `border`, `input`, `ring` | Linhas; borda dos campos e, a 30%, o fundo dos campos nos dois modos; o anel de foco |
| `sidebar-*` | A paleta própria da sidebar |

Cada tom (`primary`, `brand`, `neutral` e os quatro status) tem três tokens:

- `--<tom>`: a cor em si, para preenchimentos, bordas e ícones.
- `--<tom>-foreground`: texto sobre a cor cheia. Numa cor saturada costuma ser o fundo da página, mas um `warning` amarelo-claro pode usar texto escuro.
- `--<tom>-text`: texto no tom, sobre a página ou sobre a tinta do soft. É o tom puxado para o `--foreground` até ficar legível.

O `--neutral` começa com a cor do texto muted, com `--background` como `-foreground` e `--foreground` como `-text`. A tinta do soft e o hover saem da mistura dele, como em qualquer tom, então acompanham o fundo em todos os temas. Uma diferença: o outline neutro usa o `--border`, para casar com os campos. Veja [Tons e variantes](/docs/tones) para como os componentes os usam.

`bg-neutral` e `text-neutral` são o token do tema. O `neutral-50` a `neutral-950` do Tailwind é outra paleta, fixa, que ignora o tema: os componentes do fma-ds nunca a usam, nem outro cinza fixo (`gray`, `zinc`, `slate`, `stone`). A DaisyUI também define `--color-neutral`; se você usar as duas, vale a folha de estilo que carregar por último.

### Configurações

| Configuração | Variável | Padrão |
| --- | --- | --- |
| Radius | `--radius` | do tema |
| Fontes | `--font-sans`, `--font-serif`, `--font-mono`, `--font-heading` | as do Tailwind |
| Espaçamento | `--spacing` | `0.25rem` |
| Espaçamento entre letras | `--tracking-normal` | `0` |
| Sombras | `--shadow-*` | do tema |
| Mistura do ícone | `--tone-icon-mix` | `42%`: quanto ícones e pontos saem do tom em direção ao `-text` |
| Mistura do soft | `--tone-soft-mix` | `10%` no claro, `18%` no escuro: a força das tintas soft |

## Customize

O editor de temas em [/themes](/themes) é o caminho mais fácil. Carregue um tema curado ou importe o seu (um `styles.css` do shadcn, um tema do tweakcn ou a URL de um item de tema), e edite as cores de cada modo, fontes, radius, espaçamento, sombras e as misturas dos tons, com os componentes no preview ao vivo. Cada par de cores mostra o contraste e reprova abaixo do mínimo. Ao lado de cada token `-text`, **Derivar do tom** recalcula o valor depois que você muda o tom. Exporte o resultado como item de registro, para instalar com `shadcn add`, ou como CSS para colar.

Ao importar um tema sem os tokens do fma-ds, como um do tweakcn, os status que faltam vêm do tema padrão, o tom neutro começa no texto muted, e o editor deriva os tokens `-text` e a mistura do ícone para passarem no contraste.

Você também pode editar as variáveis à mão. Mude o tom e o `-text` juntos, nos dois modos:

```css
:root {
  --primary: oklch(0.55 0.2 260);
  --primary-foreground: oklch(0.98 0 0);
  --primary-text: oklch(0.45 0.18 260);
}
.dark {
  --primary: oklch(0.7 0.15 260);
  --primary-foreground: oklch(0.15 0 0);
  --primary-text: oklch(0.8 0.1 260);
}
```

Respeite estes mínimos de contraste, que os temas curados cumprem:

- 4.5:1 para texto corrido, inclusive o `-text` sobre a página e sobre a tinta do soft.
- 3:1 para toda cor cheia com o seu `-foreground`, e para ícones e bordas contra a página.

## Vindo do shadcn

Os temas do fma-ds usam os nomes de token do shadcn e acrescentam `brand`, `neutral`, os status e os tokens `-text`. Eles não definem `--secondary` nem `--invert`. Um tema padrão do shadcn não tem os tokens do fma-ds, então os componentes do fma-ds precisam de um tema do fma-ds, ou de um tema importado no editor e exportado de novo. Um componente oficial do shadcn que usa `bg-secondary` precisa desse token no seu tema, ou de uma troca para a família muted ou para um tom. Os componentes oficiais também fazem o hover dos controles neutros com `bg-muted`; no fma-ds o `muted` é estático, então use o tom neutro (`toneVariants.neutral` com `hover:bg-(--tone-hover)`).
