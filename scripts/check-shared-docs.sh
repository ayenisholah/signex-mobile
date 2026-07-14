#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_REPOSITORY_OWNER:?GITHUB_REPOSITORY_OWNER is required}"
base="https://raw.githubusercontent.com/$GITHUB_REPOSITORY_OWNER/signex-backend/main"
files=(docs/PRODUCT_SPEC.md docs/OVERVIEW.md AGENTS.md docs/DECISION.md docs/MILESTONE.md)
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT

for file in "${files[@]}"; do
  mkdir -p "$temporary/$(dirname "$file")"
  curl --fail --silent --show-error "$base/$file" --output "$temporary/$file"
  cmp --silent "$file" "$temporary/$file" || {
    echo "shared document drift detected: $file" >&2
    exit 1
  }
done
