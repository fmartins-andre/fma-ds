fma-ds is code you copy, so it runs on your project's toolchain. These are the versions it is built and tested against.

| Requirement | Version | How you get it |
| --- | --- | --- |
| React and React DOM | `{{react}}` | Your project |
| Tailwind CSS | `{{tailwindcss}}` | Your project; v3 doesn't work, tokens are CSS-first |
| shadcn CLI | `{{shadcn}}` | Run with `npx`, or as a dev dependency |
| react-aria-components | `{{react-aria-components}}` | Installed by the CLI with each item |

Each item lists the rest of its npm dependencies in its registry file, and the CLI installs them.

Node.js only matters to the shadcn CLI, so use a version it supports. The Node and pnpm versions in this repository's `package.json` apply to working on the registry itself, not to using it.

## Project setup

You need a project initialized for shadcn/ui: a `components.json` and a stylesheet with Tailwind v4. Then follow the [installation steps](/docs).
