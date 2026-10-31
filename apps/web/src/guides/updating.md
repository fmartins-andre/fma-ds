The code lives in your project, so nothing updates by itself: you choose when to pull changes and which ones to keep.

Items have no version numbers. Each one has a content hash, which changes whenever its published code does:

```bash
curl -s https://<registry>/r/button.json | jq -r .meta.contentHash
```

Save the hash when you install an item, in a comment or a commit message, and a different value later means there is something new. The CLI rewrites imports on install, so hashing your local copy won't match. To see what changed, open the **Changelog** link on the item's page: it is the Git history of that item.

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
