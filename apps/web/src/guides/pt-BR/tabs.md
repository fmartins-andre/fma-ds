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

## Variante

`Tabs` e `TabNav` têm as mesmas três variantes:

| Variante | Use para |
| --- | --- |
| `primary` | As seções principais de uma área, nas primeiras telas dela, onde as abas são a navegação principal da página |
| `default` | As subpáginas de um registro e outras navegações secundárias |
| `line` | Abas dentro de um cartão ou painel, onde uma faixa preenchida competiria com a superfície |

Mantenha uma variante por nível: se as seções da área são `primary`, as subpáginas abaixo delas são `default`.
