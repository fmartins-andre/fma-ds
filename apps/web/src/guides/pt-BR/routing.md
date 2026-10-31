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
