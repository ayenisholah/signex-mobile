#!/usr/bin/env bash
set -euo pipefail

repo="${1:?usage: configure-github.sh OWNER/REPOSITORY}"
gh repo edit "$repo" --enable-issues --enable-wiki=false --enable-projects=false --delete-branch-on-merge
gh api --method PUT "repos/$repo/branches/main/protection" --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["documentation", "mobile"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_linear_history": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON
gh api --method PUT "repos/$repo/actions/permissions/workflow" -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
