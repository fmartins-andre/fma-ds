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

## Preloading on hover (TanStack Router)

TanStack Router's own `<Link preload="intent">` loads a route's code and data when the pointer rests on the link. fma-ds links are react-aria links, so ask the router directly: call `router.preloadRoute({ href })` from `onHoverStart` and, for the keyboard, `onFocus`. It runs the route's loaders without navigating; pressing the link then navigates through `RouterProvider` as usual and reuses the preloaded data while it's fresh (`defaultPreloadStaleTime`, 30 seconds by default).

A small wrapper in your app does it for a whole `TabNav`:

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

The same goes for any other fma-ds link that takes react-aria's `onHoverStart` (`Link`, `LinkButton`, pagination and menu links). Wrapping `TabNavItem` with TanStack's `createLink` isn't needed: it adds its own click handling and `aria-current` on top of `TabNav`'s.

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
