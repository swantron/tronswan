# CI/CD Setup for TronSwan

This project includes automated testing that runs after deployment to verify the deployment was successful.

## 🚀 Deployment Verification

### GitHub Actions Workflows

**`cicd.yml`** - Complete CI/CD pipeline:

- Unit tests with coverage
- Build verification
- DigitalOcean deployment polling
- Playwright tests after deployment
- Runs on main branch pushes and PRs

### Local Testing

You can run tests locally against any URL:

```bash
# Run Playwright tests against production
PLAYWRIGHT_BASE_URL=https://tronswan.com yarn test:e2e

# Run all tests locally
yarn test:all
```

## 🔧 Configuration

### Environment Variables

- `PLAYWRIGHT_BASE_URL` - Override the base URL for tests (defaults to https://tronswan.com)

### Test Scripts

- `yarn test:run` - Run unit tests only
- `yarn test:e2e` - Run Playwright tests
- `yarn test:e2e:ci` - Run Playwright tests with CI-friendly reporting
- `yarn test:all` - Run both unit and e2e tests

## 📊 Test Reports

Test results are automatically uploaded as artifacts in GitHub Actions:

- `playwright-report/` - HTML test report
- `test-results/` - Screenshots and videos (on failure)

## 🎯 When Tests Run

### Automatic Triggers

- **Every push to main**: Full CI/CD pipeline with deployment verification
- **Pull requests**: Unit tests, build verification, and coverage

### Post-Deployment Verification Process

1. Poll DigitalOcean API for deployment completion
2. Run Playwright tests against production URL
3. Upload test results as artifacts
4. Fail the workflow if tests fail

## 🚨 Failure Handling

If post-deployment tests fail:

1. Check the GitHub Actions logs
2. Download the test artifacts to see screenshots/videos
3. Fix the issue and push again
4. The tests will automatically re-run

## 🔍 Monitoring

The CI pipeline provides:

- ✅ Real-time test results in GitHub Actions
- 📊 Coverage reports via Codecov
- 🖼️ Screenshots and videos on test failures
- 📧 Notifications on failure (if configured)

## 🛠️ Customization

### Adding New Tests

1. Add tests to the appropriate directory in `tests/`
2. Tests will automatically run in CI

### Changing Deployment URL

Update the `DEPLOYMENT_URL` in the GitHub Actions workflows or use environment variables.

### Adjusting Timeouts

Modify the `MAX_WAIT_TIME` in the verification script or GitHub Actions workflows.
