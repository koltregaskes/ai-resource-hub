#!/usr/bin/env bash
set -euo pipefail

# Scheduled writers share a queue, but reviewed PR merges can still advance main.
# Never force-push or resolve generated-data conflicts automatically.
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Refusing to publish with uncommitted changes." >&2
  exit 1
fi
for attempt in 1 2 3; do
  git fetch --no-tags origin main
  git rebase origin/main
  if git push origin HEAD:main; then
    exit 0
  fi
  if [[ "$attempt" == 3 ]]; then
    echo "Push failed after three attempts; no remote history was overwritten." >&2
    exit 1
  fi
done
