Os controles atendem à WCAG 2.2 AA para alvos de ponteiro (2.5.8): pelo menos 24 por 24 pixels CSS, ou espaçados o bastante para que um círculo de 24px sobre um não toque o vizinho. Eles são dimensionados para a densidade do desktop, então um app usado principalmente por toque deve escolher tamanhos maiores.

Isso foi medido no navegador em todas as stories do Storybook, contando as áreas de toque invisíveis descritas abaixo.

## Tamanhos

| Controle | Área de toque |
| --- | --- |
| `Button` | 32px de altura; `lg` tem 36px, `sm` 28px, `xs` 24px |
| `Input`, `Select` e outros campos | 32px de altura |
| `Checkbox`, `Radio` | Caixa de 16px, área de toque de 40 por 32px |
| Polegar do `Slider` | Polegar de 12px, área de toque de 28px |

A área de toque dos controles pequenos é um pseudoelemento `::after`, então dê espaço a eles: um controle vizinho dentro dela recebe o toque.

## Espaçados em vez de maiores

Estes ficam abaixo de 24px e dependem do espaçamento: pontos do `Carousel`, alternadores de dobra do `CodeBlock`, amostras do `ColorPicker` e abas de categoria do `EmojiPicker`. Links dentro de uma frase são isentos, como no `Breadcrumb`.

## Alvos maiores

Para telas voltadas ao toque, mire nos 44px da WCAG 2.5.5 (AAA). Nenhuma prop de tamanho chega lá, então defina a altura onde usar o componente:

```tsx
<Button className="h-11 px-4">Pay now</Button>
```
