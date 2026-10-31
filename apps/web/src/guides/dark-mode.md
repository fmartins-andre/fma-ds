Dark mode is on by a `dark` class on an ancestor, usually `<html>`. Every theme defines both palettes, so adding the class is all it takes.

Your stylesheet needs this variant, which the shadcn setup adds. With it, the tokens switch by themselves:

```css
@custom-variant dark (&:is(.dark *));
```

fma-ds doesn't ship a toggle or a provider, and it doesn't read `prefers-color-scheme` by itself: which mode applies is your app's decision.

## Avoid a flash on load

Set the class in an inline script in `<head>`, before the first paint. This one follows the saved choice and falls back to the system preference:

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

If your framework renders on the server, add `suppressHydrationWarning` to `<html>`: the class is set before React hydrates.

## Add a toggle

```tsx
function setMode(mode: "light" | "dark") {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem("mode", mode);
}
```

Portaled overlays render under `<body>`, so keep the class on `<html>` or they will stay in the other mode.
