A page's `DataGrid` reads best when no column cuts its header and the table fits the screen without scrolling sideways. Three rules get there: every column is as wide as its header or its content, whichever is wider; the column that names the row takes the leftover width; and the actions column has a fixed width.

## Width and minimum

Give each column a `size` that fits its widest usual content, and a `minSize` that fits its header. A header holds more than its label: the sort icon and the button around it, plus the cell padding, add about 60px (about 50px with `dense`). A width below that cuts the header without warning, while resizing can't go under `minSize`.

```tsx
const header =
  (title: string) =>
  ({ column }) => <DataGridColumnHeader column={column} title={title} />;

const columns = [
  { accessorKey: "document", header: header("Document"), size: 150, minSize: 140 },
  { accessorKey: "status", header: header("Status"), size: 130, minSize: 110 },
  { accessorKey: "createdAt", header: header("Created on"), size: 140, minSize: 140 },
];
```

Columns without text in the header, such as the selection checkbox, a drag handle or an expand toggle, are 48px wide and not resizable (`enableResizing: false`).

## The identity column

The column that names the row (client, product, file) takes the width the others leave: `meta.autoSize`, with a `minSize` so it never gets too narrow. Pin it to the start, so the name stays in view when the table scrolls sideways.

```tsx
const nameColumn = {
  accessorKey: "name",
  header: header("Client"),
  minSize: 220,
  meta: { headerTitle: "Client", autoSize: true },
};

const table = useTable({
  features: dataGridFeatures,
  columns,
  data,
  initialState: { columnPinning: { start: ["name"], end: ["actions"] } },
});
```

When the user resizes a column, the `autoSize` column keeps the width it had, so the table grows and scrolls instead of squeezing it.

## The actions column

The row menu (`DataGridRowActions`) goes in a column of fixed width, pinned to the end. It has no sortable header, only a name for screen readers:

```tsx
const actionsColumn = {
  id: "actions",
  size: 60,
  enableSorting: false,
  enableResizing: false,
  enableHiding: false,
  header: () => <span className="sr-only">Actions</span>,
  cell: ({ row }) => (
    <DataGridRowActions rowLabel={row.original.name}>
      <DropdownMenuItem id="edit">Edit</DropdownMenuItem>
    </DataGridRowActions>
  ),
};
```

## Checking the fit

Add up the `size` of every column but the identity one, plus the identity column's `minSize`. If the total fits the content area at the smallest width you support (for example 1280px minus the sidebar and the page padding), the table doesn't scroll there. If it doesn't, hide the least useful columns by default (`initialState.columnVisibility`) and let `DataGridColumnVisibility` bring them back.
