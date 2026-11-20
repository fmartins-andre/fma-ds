Os componentes coloridos compartilham duas props: `variant` escolhe a superfície e `tone` escolhe a cor. Todo tom funciona em toda variante que o componente aceita, então `<Badge variant="soft" tone="success">` e `<Alert variant="soft" tone="success">` mostram o mesmo status.

## Variantes e tons

| `variant` | Aparência | Hover |
| --- | --- | --- |
| `solid` | Preenchida com o tom, texto no `-foreground` do tom | 85% do tom |
| `soft` | Uma tinta clara do tom, sem borda, texto no tom | Uma tinta mais forte |
| `outline` | Borda no tom, sem preenchimento (aparece a superfície de trás), texto no tom | A tinta do soft |
| `ghost` | Sem superfície, texto no tom | A tinta do soft |

A tinta do soft e a borda do outline mantêm o matiz do tom: elas misturam o tom com um cinza sem matiz na luz do card (`--tone-base`, calculado pelo tema), e não com o fundo da página, então uma página azulada ou quente não deixa um aviso laranja bege. A tinta do soft é opaca; o outline não tem preenchimento.

`tone` é um de `brand`, `primary`, `neutral`, `success`, `warning`, `info` ou `destructive`. Sem ele, o tom é `primary` para `solid` e `neutral` para as outras variantes, então `<Button variant="outline">` continua neutro.

| Componente | Variantes | Padrão |
| --- | --- | --- |
| Button, LinkButton | solid, soft, outline, ghost | solid / primary |
| Badge | solid, soft, outline, ghost | solid / primary |
| IconTile | solid, soft, outline, ghost | outline / neutral |
| Alert | solid, soft, outline | outline / neutral |
| Glance | solid, soft, outline | outline / neutral |
| Bubble | solid, soft, outline | solid / primary |

O Badge ghost é um ponto colorido antes do texto, e o IconTile ghost é só o ícone, no tamanho do tile. Trocar de variante nunca muda o tamanho do componente, então dá para alternar no hover ou na seleção sem mexer no layout.

As cores vêm do seu tema: cada tom tem a sua cor, um `-foreground` para texto sobre a cor cheia e um `-text` para texto no tom. Veja [Temas](/docs/theming) para os tokens e como ajustá-los.

## Qual escolher

- **Ação principal**: `solid`, em `primary`. Uma por área.
- **Outras ações**: `outline` ou `ghost`, neutras. `soft` com `tone="primary"` para uma segunda ação da mesma família.
- **Ação destrutiva**: `solid` com `tone="destructive"` numa confirmação; `ghost` ou `outline` com o mesmo tom quando fica entre outras ações.
- **Status** (badges, alerts): `soft` no tom do status. Badges ghost para listas densas e itens de select.
- **Brand**: a segunda cor de identidade do tema, para anúncios e rótulos como "Novo" ou "Pro", nunca para status.

## Vindo das variantes antigas

Os nomes antigos saíram, sem aliases. Atualizar um componente significa atualizar os lugares que o usam:

| Antes | Agora |
| --- | --- |
| `variant="default"` | `variant="solid"`, ou sem `variant` |
| Button `secondary` | `variant="soft"`, com `tone="primary"` para uma ação da mesma família |
| Button `destructive` | `variant="solid" tone="destructive"` |
| Button ou Badge `link` | `variant="ghost" tone="primary"` |
| Badge `secondary`, `muted` | `variant="soft"` |
| Badge `muted-outline` | `variant="outline"` |
| Badge `success`, `info`… | `tone="success"`, `tone="info"`… |
| Badge `success-light`… | `variant="soft" tone="success"`… |
| Badge `success-outline`… | `variant="outline" tone="success"`… |
| Badge `success-dot`… | `variant="ghost" tone="success"`… |
| Alert `default` | sem `variant` (outline) |
| Alert `success`, `warning`, `info`, `destructive` | `variant="soft"` com esse tom |
| Alert `brand` | `variant="solid" tone="brand"` |
| Alert ou Badge `invert` | `variant="solid" tone="neutral"` |
| IconTile `soft` | `variant="soft" tone="primary"` (`soft` sozinho agora é neutro) |
| IconTile `className="text-success"`, `bg-*` | `tone="success"` |
| IconTile `elevated`, `frame` | `outline` ou `soft` |
| Glance `tone="default"` | sem `tone` |
| Bubble `secondary`, `muted` | `variant="soft" tone="neutral"` |
| Bubble `tinted` | `variant="soft" tone="primary"` |
| Bubble `destructive` | `variant="soft" tone="destructive"` |

Atualize o tema junto com os componentes (veja [Atualizando itens](/docs/updating)): as variantes novas leem tokens que os temas antigos não têm. O tom neutro agora tem tokens próprios (`--neutral`, `--neutral-foreground`, `--neutral-text`); a tinta do soft e os hovers dele não usam mais o `--muted`.

## Seus próprios componentes

Instale `@fma-ds/tone` para dar a mesma API aos seus componentes. `toneVariants[tone]` define as variáveis CSS `--tone-*`, e as classes das suas variantes as leem:

```tsx
import { cn } from "cn";
import { defaultTone, type Tone, toneVariants, type Variant } from "@/lib/fma-ds/tone";

const surface: Record<Variant, string> = {
  solid:
    "bg-(--tone) text-(color:--tone-foreground) hover:bg-[color-mix(in_oklab,var(--tone)_85%,var(--background))]",
  soft: "bg-(--tone-soft) text-(color:--tone-text) hover:bg-(--tone-soft-hover)",
  outline: "border-(--tone-line) text-(color:--tone-text) hover:bg-(--tone-hover)",
  ghost: "text-(color:--tone-text) hover:bg-(--tone-hover)",
};

export function Chip({
  variant = "soft",
  tone,
  className,
  ...props
}: React.ComponentProps<"span"> & { variant?: Variant; tone?: Tone }) {
  return (
    <span
      className={cn(
        "border border-transparent",
        surface[variant],
        toneVariants[tone ?? defaultTone(variant)],
        className,
      )}
      {...props}
    />
  );
}
```

Mantenha a borda transparente em todas as variantes, para o tamanho não mudar. `--tone-icon` colore ícones e pontos.
