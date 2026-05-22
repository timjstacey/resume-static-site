#!/usr/bin/env bash
# Wait for the Cloudflare Pages check_run on $HEAD_SHA to complete, then
# print the commit-pinned preview URL to $GITHUB_OUTPUT as `url=...`.
#
# Required env: GH_TOKEN, HEAD_SHA, REPO, GITHUB_OUTPUT
# Optional env: PREVIEW_HOST (default: resume-static-site.pages.dev)
#               TIMEOUT_SECONDS (default: 600)
#               POLL_SECONDS (default: 15)

set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN required}"
: "${HEAD_SHA:?HEAD_SHA required}"
: "${REPO:?REPO required}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT required}"

PREVIEW_HOST="${PREVIEW_HOST:-resume-static-site.pages.dev}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-600}"
POLL_SECONDS="${POLL_SECONDS:-15}"

deadline=$(( $(date +%s) + TIMEOUT_SECONDS ))
url_pattern="https://[a-f0-9]{8}\.${PREVIEW_HOST//./\\.}"

while :; do
  run=$(gh api "repos/$REPO/commits/$HEAD_SHA/check-runs" \
    --jq '.check_runs[] | select(.name=="Cloudflare Pages") | {status, conclusion, summary: .output.summary} | @json' \
    | head -1)

  if [ -n "$run" ]; then
    status=$(printf '%s' "$run" | jq -r 'fromjson | .status')
    conclusion=$(printf '%s' "$run" | jq -r 'fromjson | .conclusion')

    if [ "$status" = "completed" ]; then
      if [ "$conclusion" != "success" ]; then
        echo "::error::Cloudflare Pages check finished with conclusion=$conclusion"
        exit 1
      fi
      summary=$(printf '%s' "$run" | jq -r 'fromjson | .summary')
      url=$(printf '%s' "$summary" | grep -oE "$url_pattern" | head -1)
      if [ -z "$url" ]; then
        echo "::error::Could not extract preview URL from Cloudflare check run summary"
        printf '%s\n' "$summary"
        exit 1
      fi
      echo "url=$url" >> "$GITHUB_OUTPUT"
      echo "Preview URL: $url"
      exit 0
    fi
    echo "Cloudflare Pages check status=$status, waiting..."
  else
    echo "Cloudflare Pages check not yet registered for $HEAD_SHA, waiting..."
  fi

  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "::error::Timed out waiting for Cloudflare Pages check on $HEAD_SHA"
    exit 1
  fi
  sleep "$POLL_SECONDS"
done
