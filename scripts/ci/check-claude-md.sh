#!/usr/bin/env bash
# Deterministic drift check: fail when CLAUDE.md or README.md falls out of
# sync with the repo state we can mechanically verify. Catches the easy
# misses (new dep, new component file, new workflow, missing README) — the
# scoped triggers in CLAUDE.md's "Keeping CLAUDE.md and README.md in sync"
# section cover the rest.
#
# Run from repo root: ./scripts/ci/check-claude-md.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

DOC="CLAUDE.md"
README="README.md"
missing=()

if [ ! -f "$README" ]; then
  missing+=("file: README.md (must exist at repo root)")
fi

check() {
  local kind="$1" name="$2"
  if ! grep -qF "$name" "$DOC"; then
    missing+=("$kind: $name (CLAUDE.md)")
  fi
}

check_readme() {
  local kind="$1" name="$2"
  [ -f "$README" ] || return 0
  if ! grep -qF "$name" "$README"; then
    missing+=("$kind: $name (README.md)")
  fi
}

# --- 1. Dependencies + devDependencies ---
mapfile -t deps < <(jq -r '(.dependencies // {}) + (.devDependencies // {}) | keys[]' package.json)
for dep in "${deps[@]}"; do
  # Match the table cell prefix so we don't false-positive on prose mentions.
  if ! grep -qE "^\| ${dep} " "$DOC"; then
    missing+=("dep: $dep")
  fi
done

# --- 2. pnpm scripts (both docs) ---
mapfile -t scripts < <(jq -r '.scripts | keys[]' package.json)
for s in "${scripts[@]}"; do
  # `prepare` is a husky bootstrap script — not user-facing, skip.
  [ "$s" = "prepare" ] && continue
  if ! grep -qE "pnpm $s( |\`|$)" "$DOC"; then
    missing+=("script: pnpm $s (CLAUDE.md)")
  fi
  if [ -f "$README" ] && ! grep -qE "pnpm $s( |\`|$)" "$README"; then
    missing+=("script: pnpm $s (README.md)")
  fi
done

# --- 3. Source files under tracked dirs ---
src_globs=(
  "src/components/*.astro"
  "src/layouts/*.astro"
  "src/pages/*.astro"
  "src/styles/*.css"
  "src/data/*.yml"
)
for glob in "${src_globs[@]}"; do
  for f in $glob; do
    [ -e "$f" ] || continue
    check "file" "$(basename "$f")"
  done
done

# --- 4. lib/*.ts (excluding test files) ---
for f in src/lib/*.ts; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  [[ "$base" == *.test.ts ]] && continue
  check "file" "$base"
done

# --- 5. GitHub workflows ---
for f in .github/workflows/*.yml .github/workflows/*.yaml; do
  [ -e "$f" ] || continue
  check "workflow" "$(basename "$f")"
done

# --- 6. Husky hooks ---
for f in .husky/*; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  case "$base" in
    _|*.sh) continue ;;
  esac
  check "hook" "$base"
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "::error::Docs are out of sync with the repo. Missing entries:"
  printf '  - %s\n' "${missing[@]}"
  echo
  echo "Update CLAUDE.md and/or README.md in the same PR — see the 'Keeping CLAUDE.md and README.md in sync' section of CLAUDE.md."
  exit 1
fi

echo "Docs sync check passed (CLAUDE.md + README.md)."
