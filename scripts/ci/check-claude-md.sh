#!/usr/bin/env bash
# Deterministic drift check: fail when CLAUDE.md falls out of sync with the
# repo state we can mechanically verify. Catches the easy misses (new dep, new
# component file, new workflow) — the scoped triggers in CLAUDE.md's "Keeping
# CLAUDE.md in sync" section cover the rest.
#
# Run from repo root: ./scripts/ci/check-claude-md.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

DOC="CLAUDE.md"
missing=()

check() {
  local kind="$1" name="$2"
  if ! grep -qF "$name" "$DOC"; then
    missing+=("$kind: $name")
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

# --- 2. pnpm scripts ---
mapfile -t scripts < <(jq -r '.scripts | keys[]' package.json)
for s in "${scripts[@]}"; do
  # `prepare` is a husky bootstrap script — not user-facing, skip.
  [ "$s" = "prepare" ] && continue
  if ! grep -qE "pnpm $s( |$)" "$DOC"; then
    missing+=("script: pnpm $s")
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
  echo "::error::CLAUDE.md is out of sync with the repo. Missing entries:"
  printf '  - %s\n' "${missing[@]}"
  echo
  echo "Update CLAUDE.md in the same PR — see the 'Keeping CLAUDE.md in sync' section."
  exit 1
fi

echo "CLAUDE.md sync check passed."
