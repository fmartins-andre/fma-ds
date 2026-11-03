Form fields are react-aria fields, so a few habits from other libraries don't carry over. These are the ones that catch people out when building a form.

## Select width

`Select` sizes itself to its value (`w-fit`), like a button. In a form grid, give the root `w-full` so it fills its column; the trigger follows the root.

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

## Checkbox and radio labels

The children of `Checkbox` and `RadioGroupItem` render inside the 16px box, where they make room for a custom indicator. The label is a sibling `Label`, tied by `id` and `htmlFor`, in a row:

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept the terms</Label>
</div>
```

For a label with a description, use `Field orientation="horizontal"` with a `FieldContent`, or the card versions (`CheckboxCard`, `RadioCard`), whose children are the card's content.

## Masked input in a TextField

Inside a react-aria `TextField`, the field owns the input's value, so `MaskedInput`'s own `defaultValue` and `value` are ignored. Put the initial value on the `TextField`, already masked:

```tsx
<TextField defaultValue="123.456.789-01">
  <Label>CPF</Label>
  <MaskedInput mask="cpf" />
</TextField>
```

Read the value the same way, from the `TextField`'s `onChange` or the form data. It is the masked text, so strip the mask before saving or validating it. Outside a `TextField`, `MaskedInput` takes `value` and `defaultValue` itself, and `onValueChange` gives you the raw value too.
