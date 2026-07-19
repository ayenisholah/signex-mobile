#!/usr/bin/env bash
set -euo pipefail

required=(README.md AGENTS.md docs/PRODUCT_SPEC.md docs/OVERVIEW.md docs/CHANGELOG.md docs/DECISION.md docs/IMPLEMENTATION.md docs/MILESTONE.md docs/PROGRESS.md docs/TRACEABILITY.md docs/TESTING.md docs/DEPLOYMENT.md .github/CONTRIBUTING.md .github/SECURITY.md)
for file in "${required[@]}"; do
  test -s "$file" || { echo "missing required document: $file" >&2; exit 1; }
done

while IFS= read -r file; do
  name="$(basename "$file")"
  stem="${name%.md}"
  test "$stem" = "$(printf '%s' "$stem" | tr '[:lower:]' '[:upper:]')" || {
    echo "Markdown basename must be uppercase: $file" >&2
    exit 1
  }
done < <(find . -type f -name '*.md' -not -path './node_modules/*' -not -path './.npm-cache/*' -not -path './.git/*')

if grep -R --exclude-dir=node_modules --exclude-dir=.npm-cache --include='*.md' -n 'NotifyHub' .; then
  echo "NotifyHub is not the product name; use Signex" >&2
  exit 1
fi

if [[ -n "${GITHUB_BASE_REF:-}" && "${GITHUB_HEAD_REF:-}" != automation/shared-docs-* ]]; then
  git fetch --no-tags --depth=1 origin "$GITHUB_BASE_REF"
  if git diff --quiet "origin/$GITHUB_BASE_REF...HEAD" -- docs/CHANGELOG.md; then
    echo "Every ordinary pull request must update docs/CHANGELOG.md" >&2
    exit 1
  fi
fi
