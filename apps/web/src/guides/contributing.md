fma-ds is a personal registry, developed in the open. Issues are welcome, and new components start from a real need in an app.

## Proposing a change

1. Open an [issue](https://github.com/fmartins-andre/fma-ds/issues) describing the need: what the app has to do, not how it should look.
2. Check that no existing item covers it. Prefer a variant or a prop over a new component.
3. Wait for agreement before opening a pull request, unless it's a small fix.

## What a new item needs

- A folder in `packages/ds/src/core/<name>/` with the component, `meta.json` and a story.
- React Aria for interaction, and the existing tokens: hover, focus and selection use `accent`.
- English default text, overridable through props.
- Stories that show real usage, because they are the examples on this site, with `play` functions for interaction tests.
- Accessible names, keyboard support and no automated accessibility violations.

The generated registry files are committed with the change. Before opening a pull request, run:

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm --filter @fma-ds/ds build
```

## Going deeper

[`CONTRIBUTING.md`](https://github.com/fmartins-andre/fma-ds/blob/main/CONTRIBUTING.md) covers the environment, the anatomy of a component, themes and the Git workflow.
