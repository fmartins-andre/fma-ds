O fma-ds é um registro pessoal, desenvolvido de forma aberta. Issues são bem-vindas, e novos componentes nascem de uma necessidade real em um app.

## Propondo uma mudança

1. Abra uma [issue](https://github.com/fmartins-andre/fma-ds/issues) descrevendo a necessidade: o que o app precisa fazer, não como deve parecer.
2. Confira se nenhum item existente já cobre isso. Prefira uma variante ou uma prop a um componente novo.
3. Espere um acordo antes de abrir um pull request, a menos que seja uma correção pequena.

## Escopo dos blocos

Os blocos vêm do que apps reais precisaram, em geral telas de SaaS como login, preços, cobrança e configurações. Eles não são um kit genérico de aplicação, então um bloco entra quando um app precisa dele, não para completar o catálogo. Os componentes continuam genéricos.

## O que um item novo precisa

- Uma pasta em `packages/ds/src/core/<name>/` com o componente, o `meta.json` e uma story.
- React Aria para interação e os tokens existentes: hover, foco e seleção usam `accent`.
- Texto padrão em inglês, que pode ser sobrescrito por props.
- Stories que mostrem uso real, porque elas são os exemplos deste site, com funções `play` para os testes de interação.
- Nomes acessíveis, suporte a teclado e nenhuma violação automática de acessibilidade.

Os arquivos gerados do registro são commitados junto com a mudança. Antes de abrir um pull request, rode:

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm --filter @fma-ds/ds build
```

## Para ir mais fundo

O [`CONTRIBUTING.md`](https://github.com/fmartins-andre/fma-ds/blob/main/CONTRIBUTING.md) cobre o ambiente, a anatomia de um componente, os temas e o fluxo de Git.
