O `DataGrid` de uma página fica melhor quando nenhuma coluna corta o cabeçalho e a tabela cabe na tela sem rolar para o lado. Três regras levam a isso: cada coluna tem a largura do cabeçalho ou do conteúdo, o que for maior; a coluna que identifica a linha ocupa a sobra; e a coluna de ações tem largura fixa.

## Largura e mínimo

Dê a cada coluna um `size` que caiba o conteúdo mais largo de costume e um `minSize` que caiba o cabeçalho. Um cabeçalho tem mais que o rótulo: o ícone de ordenação e o botão em volta, mais o padding da célula, somam cerca de 60px (cerca de 50px com `dense`). Uma largura abaixo disso corta o cabeçalho sem aviso, e o redimensionamento não passa do `minSize`.

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

Colunas sem texto no cabeçalho, como o checkbox de seleção, a alça de arrastar ou o botão de expandir, têm 48px e não são redimensionáveis (`enableResizing: false`).

## A coluna de identificação

A coluna que identifica a linha (cliente, produto, arquivo) ocupa a largura que as outras deixam: `meta.autoSize`, com um `minSize` para nunca ficar estreita demais. Fixe-a no início, para o nome continuar visível quando a tabela rola para o lado.

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

Quando o usuário redimensiona uma coluna, a coluna `autoSize` mantém a largura que tinha, então a tabela cresce e rola em vez de espremê-la.

## A coluna de ações

O menu da linha (`DataGridRowActions`) fica numa coluna de largura fixa, fixada no fim. Ela não tem cabeçalho ordenável, só um nome para leitores de tela:

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

## Conferindo o encaixe

Some o `size` de todas as colunas menos a de identificação, mais o `minSize` dela. Se o total cabe na área de conteúdo na menor largura que você suporta (por exemplo, 1280px menos a sidebar e o padding da página), a tabela não rola ali. Se não cabe, esconda por padrão as colunas menos úteis (`initialState.columnVisibility`) e deixe o `DataGridColumnVisibility` trazê-las de volta.
