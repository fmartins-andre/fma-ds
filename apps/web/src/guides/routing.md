Links in fma-ds are react-aria links. Without a router they do a full page load, so wrap your app in React Aria's `RouterProvider` to send them through your router.

It takes `navigate`, called when a link is pressed, and `useHref`, which turns a path into the real `href` (needed when the app runs under a base path).

## TanStack Router

Put it in the root route, around the `<Outlet />`. This site runs this same code:

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

Render it inside the router, because it uses the router's hooks:

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

## Current page

`RouterProvider` handles navigation only. For active states, pass `aria-current="page"` where the component takes it, or use components that already do, such as `TabNav` and `Pagination`.
