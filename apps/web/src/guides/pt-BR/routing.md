Os links do fma-ds são links do react-aria. Sem um roteador, eles recarregam a página inteira, então envolva seu app no `RouterProvider` do React Aria para que passem pelo seu roteador.

Ele recebe `navigate`, chamado quando um link é pressionado, e `useHref`, que transforma um caminho no `href` real (necessário quando o app roda sob um caminho base).

## TanStack Router

Coloque-o na rota raiz, em volta do `<Outlet />`. Este site roda este mesmo código:

```tsx
import { Outlet, useRouter } from "@tanstack/react-router";
import { RouterProvider } from "react-aria-components";

// Links outside the app go through the browser.
const isPlainLink = (href: string) => /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);

function RootComponent() {
  const router = useRouter();
  return (
    <RouterProvider
      navigate={(href) => {
        if (isPlainLink(href)) window.location.assign(href);
        else void router.navigate({ href });
      }}
      useHref={(href) =>
        isPlainLink(href) ? href : router.buildLocation({ href } as never).href
      }
    >
      <Outlet />
    </RouterProvider>
  );
}
```

## Pré-carregar ao passar o mouse (TanStack Router)

O `<Link preload="intent">` do próprio TanStack Router carrega o código e os dados de uma rota quando o ponteiro para sobre o link. Os links do fma-ds são links do react-aria, então peça direto ao roteador: chame `router.preloadRoute({ href })` no `onHoverStart` e, para o teclado, no `onFocus`. Ele roda os loaders da rota sem navegar; ao pressionar o link, a navegação passa pelo `RouterProvider` como sempre e reaproveita os dados pré-carregados enquanto estão frescos (`defaultPreloadStaleTime`, 30 segundos por padrão).

Um wrapper pequeno no seu app faz isso para um `TabNav` inteiro:

```tsx
import { useRouter } from "@tanstack/react-router";
import type * as React from "react";
import { TabNav, TabNavItem } from "@/components/fma-ds/tab-nav";

function PreloadTabNavItem(props: React.ComponentProps<typeof TabNavItem>) {
  const router = useRouter();
  const preload = () => {
    // a full href (query string included); typed routers want `to`, hence the cast, as in `useHref`
    if (props.href) void router.preloadRoute({ href: props.href } as never);
  };
  return <TabNavItem {...props} onHoverStart={preload} onFocus={preload} />;
}

export function CustomerTabs({ id, path }: { id: string; path: string }) {
  return (
    <TabNav aria-label="Customer" currentHref={path}>
      <PreloadTabNavItem href={`/customers/${id}`}>Info</PreloadTabNavItem>
      <PreloadTabNavItem href={`/customers/${id}/orders`}>Orders</PreloadTabNavItem>
    </TabNav>
  );
}
```

O mesmo vale para qualquer outro link do fma-ds que aceite o `onHoverStart` do react-aria (`Link`, `LinkButton`, links de paginação e de menu). Não é preciso envolver o `TabNavItem` com o `createLink` do TanStack: ele acrescenta o próprio tratamento de clique e o próprio `aria-current` por cima dos do `TabNav`.

## React Router

Renderize-o dentro do roteador, porque ele usa os hooks do roteador:

```tsx
import { Outlet, useHref, useNavigate } from "react-router";
import { RouterProvider } from "react-aria-components";

export function RootLayout() {
  const navigate = useNavigate();
  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
}
```

## Página atual

O `RouterProvider` cuida só da navegação. Para estados ativos, passe `aria-current="page"` onde o componente aceita, ou use componentes que já fazem isso, como `TabNav` e `Pagination`.
