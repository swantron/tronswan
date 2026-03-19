#!/usr/bin/env bash
# generate-pipeline.sh
#
# Dynamically generates a Buildkite pipeline based on which files changed.
#
# HOW IT WORKS
# ============
# 1. Determine the base commit to diff against (PR base branch or HEAD~1)
# 2. Classify changed files into source areas (components, services, hooks, config)
# 3. Emit pipeline YAML to stdout — Buildkite uploads it via pipeline.yml
#
# STEP TIERS
# ==========
# Tier 1 — Lint + Type-check: runs whenever any src/ file changes.
#           Fast feedback, catches the most common errors immediately.
#
# Tier 2 — Unit tests: runs when components, hooks, services, or utils change.
#           Vitest with coverage. Skipped for pure style/config changes.
#
# Tier 3 — Build: runs when tsconfig, vite.config, or package.json changes,
#           or on pushes to main. Catches compilation errors from config changes
#           that unit tests wouldn't surface.
#
# E2E tests are intentionally excluded. Playwright tests in this repo run
# against the live DigitalOcean deployment and are owned by the GitHub Actions
# deploy-and-validate workflow. Running them here would require access to the
# production environment — a boundary we deliberately keep in GHA.
#
# NOTE ON AGENT TARGETING
# =======================
# Each step explicitly declares agents: queue: gcp rather than relying on
# the top-level agents config. Dynamically uploaded pipelines don't reliably
# inherit top-level agent settings in all Buildkite versions.

set -euo pipefail

# ============================================================
# 1. Determine changed files
# ============================================================

# On a PR, diff against the base branch. On a direct push, diff HEAD~1.
if [ -n "${BUILDKITE_PULL_REQUEST_BASE_BRANCH:-}" ]; then
  BASE="origin/${BUILDKITE_PULL_REQUEST_BASE_BRANCH}"
  git fetch origin "${BUILDKITE_PULL_REQUEST_BASE_BRANCH}" --quiet
  CHANGED=$(git diff --name-only "${BASE}"...HEAD 2>/dev/null || git diff --name-only HEAD~1)
else
  CHANGED=$(git diff --name-only HEAD~1 2>/dev/null || echo "")
fi

echo "--- Changed files" >&2
echo "${CHANGED:-  (none detected, running full suite)}" >&2

# ============================================================
# 2. Classify changes
# ============================================================

has_changes() {
  echo "$CHANGED" | grep -qE "$1" && echo "true" || echo "false"
}

SRC_CHANGED=$(has_changes "^src/")
COMPONENTS_CHANGED=$(has_changes "^src/components/")
SERVICES_CHANGED=$(has_changes "^src/services/")
HOOKS_CHANGED=$(has_changes "^src/hooks/")
UTILS_CHANGED=$(has_changes "^src/utils/")
CONFIG_CHANGED=$(has_changes "^(vite\.config|tsconfig|package\.json|yarn\.lock)")

# If we can't detect changes (e.g. initial commit), run everything
if [ -z "$CHANGED" ]; then
  SRC_CHANGED="true"
  CONFIG_CHANGED="true"
fi

echo "--- Change classification" >&2
echo "  src=$SRC_CHANGED components=$COMPONENTS_CHANGED services=$SERVICES_CHANGED hooks=$HOOKS_CHANGED utils=$UTILS_CHANGED config=$CONFIG_CHANGED" >&2

# ============================================================
# 3. Emit pipeline YAML
# ============================================================

echo "steps:"

# ----------------------------------------------------------
# Tier 1: Lint + Type-check
# Runs whenever any src/ or config file changes.
# These are fast (~30s) and catch the most common errors.
# ----------------------------------------------------------
if [ "$SRC_CHANGED" = "true" ] || [ "$CONFIG_CHANGED" = "true" ]; then
  cat <<'STEP'

  - label: ":eslint: Lint"
    key: lint
    agents:
      queue: gcp
    command: |
      yarn install --frozen-lockfile
      yarn lint

  - label: ":typescript: Type Check"
    key: type-check
    agents:
      queue: gcp
    command: |
      yarn install --frozen-lockfile
      yarn type-check
STEP
fi

# ----------------------------------------------------------
# Tier 2: Unit tests with coverage
# Runs when logic-bearing source files change.
# Coverage report is uploaded as a Buildkite annotation.
# ----------------------------------------------------------
if [ "$COMPONENTS_CHANGED" = "true" ] || \
   [ "$SERVICES_CHANGED" = "true" ] || \
   [ "$HOOKS_CHANGED" = "true" ] || \
   [ "$UTILS_CHANGED" = "true" ] || \
   [ "$SRC_CHANGED" = "true" ]; then
  cat <<'STEP'

  - label: ":vitest: Unit Tests + Coverage"
    key: unit-tests
    agents:
      queue: gcp
    command: |
      yarn install --frozen-lockfile
      yarn test:coverage
      COVERAGE=$(cat coverage/coverage-summary.json | \
        node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); \
                 const j=JSON.parse(d); \
                 console.log(j.total.lines.pct + '%')")
      buildkite-agent annotate \
        "**Coverage: ${COVERAGE}** (lines) :bar_chart:" \
        --style "info" --context "coverage"
    artifact_paths:
      - "coverage/**/*"
STEP
fi

# ----------------------------------------------------------
# Tier 3: Build
# Runs on config/dependency changes or pushes to main.
# ----------------------------------------------------------
if [ "$CONFIG_CHANGED" = "true" ] || \
   [ "${BUILDKITE_BRANCH:-}" = "main" ]; then
  cat <<'STEP'

  - label: ":vite: Build"
    key: build
    agents:
      queue: gcp
    command: |
      yarn install --frozen-lockfile
      yarn build
    artifact_paths:
      - "build/**/*"
STEP
fi

# ----------------------------------------------------------
# Consolidated annotation — always runs
# ----------------------------------------------------------
cat <<'STEP'

  - wait: ~
    continue_on_failure: true

  - label: ":buildkite: Annotate Result"
    key: annotate
    agents:
      queue: gcp
    command: |
      buildkite-agent annotate \
        "**Branch:** ${BUILDKITE_BRANCH} — ${BUILDKITE_MESSAGE}" \
        --style "info" --context "build-info"
STEP
