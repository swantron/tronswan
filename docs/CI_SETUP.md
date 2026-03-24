# CI/CD Setup for TronSwan

This project uses two CI systems with distinct responsibilities:

- **Buildkite** — fast, file-aware pre-merge feedback on a self-hosted GCP agent
- **GitHub Actions** — post-merge deployment gating and E2E validation against the live site

## System Overview

```
Push / PR to main
  │
  ├── Buildkite (all branches, pre-merge)
  │     └── generate-pipeline.sh | buildkite-agent pipeline upload
  │           └── Emits steps based on git diff:
  │                 ├── src/** changed        → Lint + Type-check (Tier 1)
  │                 ├── components/hooks/     → Unit tests + coverage (Tier 2)
  │                 │   services/utils
  │                 ├── config/deps or main   → Build (Tier 3)
  │                 └── Always               → Annotate result
  │
  └── GitHub Actions (main branch pushes only for deploy)
        ├── build-test-coverage (all triggers)
        │     ├── yarn build
        │     ├── yarn test:coverage
        │     └── Upload coverage artifact
        └── deploy-and-validate (main push only, after build-test-coverage)
              ├── Poll DigitalOcean API until deploy succeeds
              └── Run Playwright E2E suite against live site
```

---

## Buildkite

### Dynamic pipeline

The entry point is `.buildkite/pipeline.yml`, which does one thing: run `.buildkite/generate-pipeline.sh | buildkite-agent pipeline upload`.

The generator script diffs changed files against the PR base branch (or `HEAD~1` on direct push) and emits only the relevant steps. This avoids running the full suite on every commit.

### Step tiers

| Tier | Steps | Triggers |
|------|-------|----------|
| 1 | Lint, Type-check | Any `src/` or config change |
| 2 | Unit tests + coverage annotation | `src/components/`, `hooks/`, `services/`, `utils/` |
| 3 | Build | Config/dependency changes (`vite.config`, `tsconfig`, `package.json`, `yarn.lock`) or push to `main` |
| — | Annotate result | Always (`continue_on_failure: true`) |

Coverage is extracted from `coverage/coverage-summary.json` and posted as a Buildkite annotation. The coverage artifact is also uploaded for download.

### Why E2E tests are not here

Playwright tests run against the live DigitalOcean deployment. Buildkite agents don't have production access — that boundary is intentional. E2E ownership lives in GHA's `deploy-and-validate` job.

### Agent setup

All steps (including dynamically generated ones) explicitly target `agents: queue: gcp`. Dynamically uploaded pipelines don't reliably inherit top-level agent config across all Buildkite versions, so each step declares it directly.

The GCP agent is provisioned by [buildkite-gcp-agent](https://github.com/swantron/buildkite-gcp-agent).

### Pipeline setup

Connect the repo via Buildkite → New Pipeline → point at `github.com/swantron/tronswan`. Buildkite reads `.buildkite/pipeline.yml` automatically on each push.

---

## GitHub Actions

Defined in `.github/workflows/cicd.yml`. Triggers on push and PRs to `main`.

### `build-test-coverage` (all triggers)

1. Checkout + Node 20 + Yarn install
2. `yarn build`
3. `yarn test:coverage`
4. Extracts line coverage % via `jq`, writes to step summary
5. Uploads coverage artifact (30-day retention)

### `deploy-and-validate` (main pushes only)

Runs after `build-test-coverage` passes. Only fires on `push` to `main` (not PRs).

1. Polls DigitalOcean App Platform API — up to 30 attempts × 15s (7.5 min max) — until the deploy step status is `SUCCESS`
2. Runs the full Playwright E2E suite against the live site

If the DO deployment doesn't complete in time or Playwright tests fail, the job fails and the push is flagged.

### Required secret

- `DIGITALOCEAN_ACCESS_TOKEN` — used to poll the DO API for deployment status

---

## Local testing

```bash
# Unit tests
yarn test:run

# Unit tests with coverage
yarn test:coverage

# Playwright E2E against production
PLAYWRIGHT_BASE_URL=https://tronswan.com yarn test:e2e

# Run both unit and E2E
yarn test:all
```

---

## Failure handling

**Buildkite failure**: Check the Buildkite build. Coverage and build artifacts are available for download from the failed step.

**GHA `build-test-coverage` failure**: Check Actions logs. Coverage artifact is uploaded even on failure.

**GHA `deploy-and-validate` failure**:
1. Check if DO deployment timed out (extend retries or check DO dashboard)
2. Download Playwright artifacts (screenshots/videos on test failure)
3. Fix and push — the workflow re-runs automatically
