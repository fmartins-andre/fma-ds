#!/usr/bin/env bash
# Fast local feedback while a batch of changes is still uncommitted: checks only
# what changed since main (commits on the branch, staged, unstaged and untracked).
#
#   pnpm check:changed            lint, types, registry, unit tests, and the
#                                 Storybook tests of the items you touched
#   pnpm check:changed --no-stories   skip the Storybook tests
#
# It's the inner loop, not the gate: before committing, run `pnpm verify`.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

run_stories=true
[[ "${1:-}" == "--no-stories" ]] && run_stories=false

base=$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main)
mapfile -t files < <(
  { git diff --name-only "$base"; git ls-files --others --exclude-standard; } |
    sort -u | while read -r file; do [[ -f "$file" ]] && echo "$file"; done
)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "Nothing changed since main."
  exit 0
fi

step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

mapfile -t lintable < <(printf '%s\n' "${files[@]}" | grep -E '\.(js|jsx|ts|tsx|json|jsonc|css)$' || true)
if [[ ${#lintable[@]} -gt 0 ]]; then
  step "lint (${#lintable[@]} files)"
  pnpm exec biome check --write --no-errors-on-unmatched "${lintable[@]}"
fi

# Turbo builds @fma-ds/ds before type-checking, so this also regenerates
# registry.json and public/r, which the unit tests read.
step "type-check (and registry)"
pnpm type-check --output-logs=errors-only

step "unit tests"
pnpm --filter @fma-ds/ds exec vitest run --project unit --reporter=dot --silent

if $run_stories; then
  # The Storybook project of each item (core or block) with a changed file.
  mapfile -t items < <(
    printf '%s\n' "${files[@]}" |
      sed -nE 's#^packages/ds/(src/(core|blocks)/[^/]+)/.*#\1#p' | sort -u
  )
  if [[ ${#items[@]} -gt 0 ]]; then
    step "storybook tests: ${items[*]//src\//}"
    pnpm --filter @fma-ds/ds exec vitest run --project storybook --reporter=dot "${items[@]}"
  fi
fi

printf '\n\033[32m✔ changed files check out\033[0m\n'
