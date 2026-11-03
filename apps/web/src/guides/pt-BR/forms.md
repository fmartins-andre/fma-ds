Os campos de formulário são campos do react-aria, então alguns hábitos de outras bibliotecas não se aplicam. Estes são os que mais pegam quem está montando um formulário.

## Largura do Select

O `Select` se dimensiona pelo valor (`w-fit`), como um botão. Num grid de formulário, dê `w-full` à raiz para ele ocupar a coluna; o trigger acompanha a raiz.

```tsx
<Select className="w-full" placeholder="Choose a state">
  <Label>State</Label>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem id="sp">São Paulo</SelectItem>
    <SelectItem id="rj">Rio de Janeiro</SelectItem>
  </SelectContent>
</Select>
```

## Rótulos de checkbox e rádio

Os filhos de `Checkbox` e `RadioGroupItem` são renderizados dentro da caixa de 16px, onde servem para um indicador personalizado. O rótulo é um `Label` irmão, ligado por `id` e `htmlFor`, numa linha:

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept the terms</Label>
</div>
```

Para um rótulo com descrição, use `Field orientation="horizontal"` com um `FieldContent`, ou as versões em cartão (`CheckboxCard`, `RadioCard`), cujos filhos são o conteúdo do cartão.

## Campo com máscara dentro de um TextField

Dentro de um `TextField` do react-aria, é o campo que controla o valor do input, então o `defaultValue` e o `value` do próprio `MaskedInput` são ignorados. Coloque o valor inicial no `TextField`, já com a máscara:

```tsx
<TextField defaultValue="123.456.789-01">
  <Label>CPF</Label>
  <MaskedInput mask="cpf" />
</TextField>
```

Leia o valor do mesmo jeito, pelo `onChange` do `TextField` ou pelos dados do formulário. Ele vem com a máscara, então tire-a antes de salvar ou validar. Fora de um `TextField`, o `MaskedInput` recebe `value` e `defaultValue` ele mesmo, e o `onValueChange` também entrega o valor bruto.
