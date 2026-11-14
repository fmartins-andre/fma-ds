Tabs show up in two forms: `Tabs` switches views inside a page, and `TabNav` moves between pages that look like tabs. This guide covers which one to use, where to put it in the page header and which variant to pick.

## Tabs or TabNav

Use `Tabs` when the views belong to one page and share its URL, like the periods of a chart; each tab has a panel. Use `TabNav` when each tab is a route, like a client's info, addresses and orders: it renders links, marks the current page with `aria-current="page"` and has no panels. With a router, wrap the app in `RouterProvider` (see the routing guide).

## Where they go

With few sections and short labels (two to four), put the `TabNav` in `PageHeaderActions`, beside the title. It stays on the title's line while it fits and drops below with the actions when it doesn't:

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

With more sections, put it in `PageHeaderNav`, below the title. The strip scrolls sideways when the items don't fit and keeps the current page in view:

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

## Many tabs

When the tabs don't fit, both `Tabs` and `TabNav` scroll sideways and keep the selected tab (or the current page) in view. The side that hides tabs fades out. With a pointer on larger screens, an arrow on that side turns a page. The arrows only show up when tabs are hidden. They stay out of the tab order and away from screen readers, because the keyboard already reaches every tab and reveals it. On small screens they're hidden too, because there the strip is swiped.

## In a card header

A record's sub-pages can sit in the header of the card that shows them, so the tab's content is the card's body. Use a `line` strip on the header's bottom border, with its items sharing the width while they fit (`listClassName="min-w-full"` on `TabNav`, `min-w-full` on `TabsList`). With `sticky`, the tabs stay in view while the card scrolls. Without the header's side, top and bottom padding, the strip sits flush with the card's top, the label is centered and the underline sits on the border:

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

Each tab's content goes in that card's body (`CardContent`, a table, a footer), not in a card of its own inside it.

## Variant

`Tabs` and `TabNav` share three variants:

| Variant | Use it for |
| --- | --- |
| `primary` | The main sections of an area, on its first screens, where the tabs are the page's main navigation |
| `default` | A record's sub-pages and other secondary navigation |
| `line` | Tabs inside a card or a panel, where a filled strip would compete with the surface |

Keep one variant per level: if the area's sections are `primary`, the sub-pages below them are `default`.
