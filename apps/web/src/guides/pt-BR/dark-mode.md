O modo escuro é ligado por uma classe `dark` em um elemento ancestral, normalmente o `<html>`. Todo tema define as duas paletas, então adicionar a classe é tudo o que precisa.

Sua folha de estilos precisa desta variante, que a configuração do shadcn adiciona. Com ela, os tokens mudam sozinhos:

```css
@custom-variant dark (&:is(.dark *));
```

O fma-ds não traz um alternador nem um provider, e não lê `prefers-color-scheme` por conta própria: qual modo se aplica é decisão do seu app.

## Evite o piscar ao carregar

Defina a classe em um script inline no `<head>`, antes da primeira pintura. Este segue a escolha salva e, sem ela, a preferência do sistema:

```html
<script>
  try {
    const saved = localStorage.getItem("mode");
    const dark =
      saved === "dark" ||
      (!saved && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
</script>
```

Se o seu framework renderiza no servidor, adicione `suppressHydrationWarning` ao `<html>`: a classe é definida antes de o React hidratar.

## Adicione um alternador

```tsx
function setMode(mode: "light" | "dark") {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem("mode", mode);
}
```

Sobreposições com portal renderizam sob o `<body>`, então mantenha a classe no `<html>`, ou elas ficarão no outro modo.
