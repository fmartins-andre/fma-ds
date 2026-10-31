Controls meet WCAG 2.2 AA for pointer targets (2.5.8): at least 24 by 24 CSS pixels, or spaced far enough apart that a 24px circle on one doesn't touch the next. They are sized for desktop density, so an app used mostly by touch should pick larger sizes.

This was measured in the browser across every Storybook story, counting the invisible hit areas below.

## Sizes

| Control | Hit area |
| --- | --- |
| `Button` | 32px tall; `lg` is 36px, `sm` 28px, `xs` 24px |
| `Input`, `Select` and other fields | 32px tall |
| `Checkbox`, `Radio` | 16px box, 40 by 32px hit area |
| `Slider` thumb | 12px thumb, 28px hit area |

The hit area of the small controls is an `::after` pseudo-element, so give them room: a neighboring control placed inside it takes the press.

## Spaced instead of sized

These stay under 24px and rely on spacing: `Carousel` dots, `CodeBlock` fold toggles, `ColorPicker` swatches and `EmojiPicker` category tabs. Links inside a sentence are exempt, as in `Breadcrumb`.

## Larger targets

For touch-first screens, aim for the 44px of WCAG 2.5.5 (AAA). No size prop reaches it, so set the height where you use the component:

```tsx
<Button className="h-11 px-4">Pay now</Button>
```
