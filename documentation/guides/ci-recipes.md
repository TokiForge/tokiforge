---
title: CI/CD Recipes | Guides
description: Complete CI/CD integration recipes for TokiForge. Learn how to automate token validation, testing, building, and releasing with GitHub Actions, GitLab CI, and other platforms.
---

# CI/CD Recipes for TokiForge

Complete recipes for integrating TokiForge into your continuous integration and deployment pipelines.

## GitHub Actions

### Basic CI Pipeline

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  ci:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint tokens
        run: tokiforge lint

      - name: Validate tokens
        run: tokiforge validate --strict

      - name: Build exports
        run: tokiforge build

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Release Pipeline

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build tokens
        run: tokiforge build

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Version packages
        run: npm run version

      - name: Publish to npm
        run: npm run publish:ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Build documentation
        run: npm run docs:build

      - name: Deploy documentation
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./documentation/dist
```

### Automated Changesets

Create `.github/workflows/changesets.yml`:

```yaml
name: Changesets

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  changesets:
    runs-on: ubuntu-latest

    permissions:
      pull-requests: write
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          version: npm run version
          publish: npm run publish:ci
          commit: "chore: release"
          title: "Versioning: Release PR"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Token Validation on PRs

Create `.github/workflows/validate-tokens.yml`:

```yaml
name: Validate Tokens

on:
  pull_request:
    paths:
      - "tokens.json"
      - "src/**/*.json"

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Validate token changes
        run: tokiforge validate --strict

      - name: Check accessibility
        run: tokiforge validate --min-accessibility AAA

      - name: Generate token report
        run: tokiforge analyze > token-report.md

      - name: Comment PR with report
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('token-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Token Analysis Report\n\n${report}`
            });
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - validate
  - test
  - build
  - release

cache:
  paths:
    - node_modules/

validate:tokens:
  stage: validate
  image: node:20
  script:
    - npm ci
    - tokiforge lint
    - tokiforge validate --strict
  only:
    - merge_requests
    - main

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run test
  coverage: '/Coverage: \d+\.\d+%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - tokiforge build
    - npm run build
  artifacts:
    paths:
      - dist/
      - build/
    expire_in: 1 day

release:
  stage: release
  image: node:20
  script:
    - npm ci
    - npm run version
    - npm run publish:ci
  only:
    - main
  environment:
    name: production
  variables:
    NPM_TOKEN: $CI_JOB_TOKEN
```

## Bitbucket Pipelines

Create `bitbucket-pipelines.yml`:

```yaml
image: node:20

pipelines:
  pull-requests:
    "**":
      - step:
          name: Validate Tokens
          script:
            - npm ci
            - npm run lint
            - tokiforge validate --strict

      - step:
          name: Run Tests
          script:
            - npm test
          after-script:
            - pipe: atlassian/codecov-reporter:1.0.0

  branches:
    main:
      - step:
          name: Build and Test
          script:
            - npm ci
            - npm run lint
            - tokiforge validate --strict
            - npm test
            - npm run build

      - step:
          name: Release
          trigger: manual
          script:
            - npm ci
            - npm run version
            - npm run publish:ci
          environment:
            name: production
```

## Jenkins

Create `Jenkinsfile`:

```groovy
pipeline {
  agent any

  environment {
    NODE_VERSION = '20.x'
    NPM_TOKEN = credentials('npm-token')
  }

  stages {
    stage('Setup') {
      steps {
        sh 'node --version'
        sh 'npm ci'
      }
    }

    stage('Validate Tokens') {
      steps {
        sh 'tokiforge lint'
        sh 'tokiforge validate --strict'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
        junit 'coverage/junit.xml'
        publishHTML([
          reportDir: 'coverage',
          reportFiles: 'index.html',
          reportName: 'Coverage Report'
        ])
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
        archiveArtifacts artifacts: 'dist/**/*'
      }
    }

    stage('Release') {
      when {
        branch 'main'
      }
      steps {
        sh 'npm run version'
        sh 'npm run publish:ci'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Pipeline succeeded!'
    }
    failure {
      emailext(
        subject: "Build failed: ${BUILD_URL}",
        to: '${DEFAULT_RECIPIENTS}',
        body: 'Check the build log for details'
      )
    }
  }
}
```

## Local Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Validating tokens..."
npm run lint -- --staged

echo "🧪 Running tests..."
npm test -- --bail

echo "✅ Pre-commit checks passed!"
```

Setup with:

```bash
npm install husky --save-dev
npx husky install
chmod +x .husky/pre-commit
```

## Pre-push Hook

Create `.husky/pre-push`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔐 Running pre-push checks..."
tokiforge validate --strict
npm run build
npm run test -- --coverage
```

## Common Recipes

### Token Backup Before Release

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp tokens.json "backups/tokens_$TIMESTAMP.json"
echo "✅ Backup created: backups/tokens_$TIMESTAMP.json"
```

### Automated Token Documentation

```bash
#!/bin/bash
# Generate token documentation
tokiforge build --format json > docs/tokens.json
tokiforge analyze > docs/analysis.md
git add docs/
git commit -m "docs: update token documentation"
```

### Figma Sync Check

```bash
#!/bin/bash
# Check for Figma token updates
tokiforge figma:diff \
  --token $FIGMA_TOKEN \
  --file-key $FIGMA_FILE_KEY > figma-diff.json

if [ -s figma-diff.json ]; then
  echo "⚠️  Figma tokens differ from code"
  exit 1
fi
```

### Bundle Size Analysis

```bash
#!/bin/bash
# Track bundle size changes
SIZE_NEW=$(wc -c < dist/tokens.js)
SIZE_OLD=$(git show HEAD:dist/tokens.js | wc -c)
SIZE_DIFF=$((SIZE_NEW - SIZE_OLD))

if [ $SIZE_DIFF -gt 1000 ]; then
  echo "⚠️  Bundle size increased by ${SIZE_DIFF} bytes"
fi
```

## Environment Variables

Set in CI/CD platform:

- `NPM_TOKEN` - NPM authentication token
- `FIGMA_TOKEN` - Figma access token (optional)
- `FIGMA_FILE_KEY` - Figma file key (optional)
- `GITHUB_TOKEN` - GitHub authentication (auto-provided)
- `SLACK_WEBHOOK` - Slack notifications (optional)

## Secret Management

### GitHub Secrets

```bash
# Set NPM token
gh secret set NPM_TOKEN --body "YOUR_TOKEN"

# List secrets
gh secret list
```

### GitLab CI Variables

```bash
# Set in project settings:
# Settings > CI/CD > Variables

# Add NPM_TOKEN as protected variable
# Mark as masked and protected
```

## Notifications

### Slack Notification on Release

```yaml
# GitHub Actions
- name: Notify Slack
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "TokiForge v${{ env.VERSION }} released!"
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Validate early** - Check tokens before any builds
2. **Test thoroughly** - Include accessibility checks
3. **Automate releases** - Use Changesets for versioning
4. **Cache dependencies** - Speed up CI pipelines
5. **Run on multiple Node** versions
6. **Use environment secrets** - Never commit tokens
7. **Generate reports** - Archive build artifacts
8. **Notify team** - Slack/email on failures
9. **Monitor bundle** size changes
10. **Backup tokens** before releases

## Troubleshooting

### Build Timeout

Increase timeout in CI configuration:

```yaml
jobs:
  build:
    timeout-minutes: 30
```

### Cache Issues

Clear cache and rebuild:

```bash
rm -rf node_modules
npm ci
```

### Token Not Found in CI

Ensure tokens.json is committed:

```bash
git add tokens.json
git commit -m "chore: add token configuration"
```

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [Bitbucket Pipelines Docs](https://bitbucket.org/product/features/pipelines)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Changesets Documentation](https://github.com/changesets/changesets)

## Next Steps

- Set up GitHub Actions workflows
- Configure environment secrets
- Test token validation
- Enable automated releases
- Monitor CI/CD performance
