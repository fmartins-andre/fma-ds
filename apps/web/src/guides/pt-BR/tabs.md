As abas aparecem de duas formas: `Tabs` alterna visões dentro de uma página, e `TabNav` navega entre páginas com cara de abas. Este guia mostra qual usar, onde colocá-la no cabeçalho da página e qual variante escolher.

## Tabs ou TabNav

Use `Tabs` quando as visões pertencem a uma página e dividem a URL dela, como os períodos de um gráfico; cada aba tem um painel. Use `TabNav` quando cada aba é uma rota, como as informações, os endereços e os pedidos de um cliente: ela renderiza links, marca a página atual com `aria-current="page"` e não tem painéis. Com um roteador, envolva o app no `RouterProvider` (veja o guia de roteamento).

## Onde ficam

Com poucas seções e rótulos curtos (de duas a quatro), coloque a `TabNav` em `PageHeaderActions`, ao lado do título. Ela fica na linha do título enquanto couber e desce junto com as ações quando não cabe:

```tsx
<PageHeaderContent>
  <PageHeaderHeading>
    <PageHeaderTitle>Plans</PageHeaderTitle>
  </PageHeaderHeading>
  <PageHeaderActions>
    <TabNav aria-label="Plan sections" currentHref={pathname}>
      <TabNavItem href="/plans">Plans</TabNavItem>
      <TabNavItem href="/plans/invoices">Invoices</TabNavItem>
    </TabNav>
  </PageHeaderActions>
</PageHeaderContent>
```

Com mais seções, coloque-a em `PageHeaderNav`, abaixo do título. A faixa rola para o lado quando os itens não cabem e mantém a página atual visível:

```tsx
<PageHeaderNav>
  <TabNav aria-label="Client sections" currentHref={pathname}>
    <TabNavItem href="/clients/42/info">Info</TabNavItem>
    <TabNavItem href="/clients/42/addresses">Addresses</TabNavItem>
    <TabNavItem href="/clients/42/orders" matchPrefix>
      Orders
    </TabNavItem>
  </TabNav>
</PageHeaderNav>
```

## Muitas abas

Quando as abas não cabem, `Tabs` e `TabNav` rolam de lado e mantêm a aba selecionada (ou a página atual) à vista. O lado que esconde abas esmaece. Com ponteiro em telas maiores, uma seta desse lado vira uma página. As setas só aparecem quando há abas escondidas. Elas ficam fora da ordem do Tab e dos leitores de tela, porque o teclado já alcança cada aba e a revela. Em telas pequenas também ficam ocultas, porque ali se arrasta a faixa.

## No cabeçalho de um cartão

As subpáginas de um registro podem ficar no cabeçalho do cartão que as mostra, e o conteúdo da aba é o corpo desse cartão. Use uma faixa `line` sobre a borda inferior do cabeçalho, com os itens dividindo a largura enquanto cabem (`listClassName="min-w-full"` no `TabNav`, `min-w-full` no `TabsList`). Com `sticky`, as abas ficam à vista enquanto o cartão rola. Sem o padding lateral, de cima e de baixo do cabeçalho, a faixa encosta no topo do cartão, com o rótulo centralizado e o sublinhado sobre a borda:

```tsx
<Card>
  <CardHeader sticky className="px-0 pt-0 [.border-b]:pb-0">
    <TabNav aria-label="Client sections" variant="line" currentHref={pathname} listClassName="min-w-full">
      <TabNavItem href="/clients/42/info">Info</TabNavItem>
      <TabNavItem href="/clients/42/orders">Orders</TabNavItem>
    </TabNav>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

O conteúdo de cada aba vai no corpo desse cartão (`CardContent`, uma tabela, um rodapé), não num cartão próprio dentro dele.

## Variante

`Tabs` e `TabNav` têm as mesmas três variantes:

| Variante | Use para |
| --- | --- |
| `primary` | As seções principais de uma área, nas primeiras telas dela, onde as abas são a navegação principal da página |
| `default` | As subpáginas de um registro e outras navegações secundárias |
| `line` | Abas dentro de um cartão ou painel, onde uma faixa preenchida competiria com a superfície |

Mantenha uma variante por nível: se as seções da área são `primary`, as subpáginas abaixo delas são `default`.
