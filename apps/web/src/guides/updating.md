The code lives in your project, so nothing updates by itself: you choose when to pull changes and which ones to keep.

Items aren't versioned yet, so there is no installed version to compare with. Compare the code instead.

## Check before overwriting

```bash
npx shadcn@latest add @fma-ds/button --dry-run
npx shadcn@latest add @fma-ds/button --diff
```

`--dry-run` lists what would change, and `--diff` shows the difference for a file. Neither writes anything.

## Apply an update

```bash
npx shadcn@latest add @fma-ds/button --overwrite
```

This replaces your copy, including local edits. Commit first, then review the diff in git and bring your changes back. Keeping customizations in wrapper components, instead of editing the files, makes updates much easier.
