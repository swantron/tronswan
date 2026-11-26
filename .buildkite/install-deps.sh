#!/usr/bin/env bash
# install-deps.sh
#
# Restores node_modules from the agent's local cache instead of running a full
# `yarn install` in every step. On the e2-micro agent a cold install costs ~2.5
# minutes per step; the yarn download cache alone doesn't help because the slow
# part is unpacking and linking ~60k files, not downloading them.
#
# The cache is keyed by yarn.lock + Node version, so any dependency change gets a
# fresh install. Restores use hard links (cp -al): near-instant and no extra disk.
# Tools only ever add files under node_modules (e.g. .vite), which doesn't touch
# the cached copy, so the links are safe. The two newest keys are kept.

set -euo pipefail

CACHE_ROOT=/var/cache/buildkite-agent/node_modules
KEY="$(sha256sum yarn.lock | cut -c1-16)-node$(node -v)"
DIR="${CACHE_ROOT}/${KEY}"

if [ -d "${DIR}/node_modules" ]; then
  echo "--- :package: node_modules from agent cache (${KEY})"
  rm -rf node_modules
  cp -al "${DIR}/node_modules" node_modules
  exit 0
fi

echo "--- :yarn: yarn install (nothing cached for ${KEY} yet)"
yarn install --frozen-lockfile

echo "--- :package: caching node_modules as ${KEY}"
mkdir -p "${CACHE_ROOT}"
tmp="$(mktemp -d "${CACHE_ROOT}/.tmp.XXXXXX")"
cp -al node_modules "${tmp}/node_modules"
# Atomic publish; if another step got there first, drop ours.
mv -T "${tmp}" "${DIR}" 2>/dev/null || rm -rf "${tmp}"

# Keep the two newest keys so a dependency bump doesn't grow the disk forever.
find "${CACHE_ROOT}" -mindepth 1 -maxdepth 1 -type d ! -name '.tmp.*' -printf '%T@ %p\n' \
  | sort -rn | tail -n +3 | cut -d' ' -f2- | xargs -r rm -rf
