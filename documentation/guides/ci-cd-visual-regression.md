# CI/CD Integration & Visual Regression Testing

## Overview

Phase 3.2 provides production-ready CI/CD pipelines, visual regression testing, and PR preview generation for design token projects. This guide covers:

- Storybook integration with live token documentation
- GitHub Actions workflows (validation, testing, coverage, publishing)
- Playwright-based visual regression testing
- Token change visualization for PRs
- PR preview deployment strategies
- Best practices and troubleshooting

---

## Storybook Integration

### Installation

```bash
npm install --save-dev @storybook/react @storybook/addon-docs @storybook/addon-toolbars
npm install --save-dev @tokiforge/react  # If using React tokens
```

### Configuration

**.storybook/main.ts**:

```typescript
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts?(x)", "../src/**/*.mdx"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-docs",
    "@storybook/addon-toolbars",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: true,
  },
};

export default config;
```

**.storybook/preview.ts**:

```typescript
import type { Preview, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { TokiForge } from "@tokiforge/react";
import tokens from "../tokens.json";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    docs: {
      theme: "light",
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Select a design token theme",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circlehollow", title: "Light" },
          { value: "dark", icon: "circle", title: "Dark" },
          { value: "high-contrast", icon: "bolt", title: "High Contrast" },
        ],
      },
    },
  },
};

export const decorators = [
  (Story, context) => {
    const selectedTheme = context.globals.theme || "light";

    return (
      <TokiForge tokens={tokens} theme={selectedTheme}>
        <Story />
      </TokiForge>
    );
  },
];

export default preview;
```

### Create Token Documentation Stories

**src/tokens.stories.mdx**:

```mdx
import { Canvas, Meta, ColorPalette, ColorItem } from "@storybook/addon-docs";
import tokens from "../tokens.json";

<Meta title="Design System/Tokens" />

# Design Tokens

Live documentation for all design tokens used in your application.

## Colors

<ColorPalette>
  {Object.entries(tokens.color || {}).map(([name, token]) => (
    <ColorItem
      key={name}
      title={name}
      subtitle={token.value}
      colors={[token.value]}
    />
  ))}
</ColorPalette>

## Typography

| Name                              | Font    | Weight                       | Size                | Line Height       |
| --------------------------------- | ------- | ---------------------------- | ------------------- | ----------------- | ------------------- | --- |
| {Object.entries(tokens.typography |         | {}).map(([name, token]) => ( |
| `                                 | ${name} | ${token.fontFamily}          | ${token.fontWeight} | ${token.fontSize} | ${token.lineHeight} | `   |

))}

## Spacing

| Name                           | Value   |
| ------------------------------ | ------- | ---------------------------- | --- |
| {Object.entries(tokens.spacing |         | {}).map(([name, token]) => ( |
| `                              | ${name} | ${token.value}               | `   |

))}
```

### Theme Switching Story

**src/components/ThemeSwitcher.stories.tsx**:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { useTheme } from "@tokiforge/react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Current Theme: {theme}</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => setTheme("light")}>Light</button>
        <button onClick={() => setTheme("dark")}>Dark</button>
        <button onClick={() => setTheme("high-contrast")}>High Contrast</button>
      </div>
    </div>
  );
};

const meta: Meta<typeof ThemeSwitcher> = {
  title: "Foundation/Theme Switcher",
  component: ThemeSwitcher,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

### Run Storybook

```bash
npm run storybook

# Static build for CI
npm run build-storybook
```

---

## GitHub Actions Workflows

### 1. Token Validation Workflow

**.github/workflows/validate-tokens.yml**:

```yaml
name: Validate Tokens

on:
  pull_request:
    paths:
      - "tokens.json"
      - "tokens/**"
      - "packages/*/tokens/**"
  push:
    branches: [main]
    paths:
      - "tokens.json"
      - "tokens/**"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Validate token structure
        run: npx tokiforge validate tokens.json

      - name: Check token consistency
        run: npx tokiforge validate --check-consistency

      - name: Validate semantic tokens
        run: npx tokiforge validate --semantic

      - name: Check for unused tokens
        run: npx tokiforge analytics --unused --format json > unused-tokens.json || true

      - name: Comment PR with validation results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const unusedFile = fs.existsSync('unused-tokens.json') 
              ? JSON.parse(fs.readFileSync('unused-tokens.json', 'utf8'))
              : null;

            let comment = '✅ Tokens validation passed!\n\n';
            if (unusedFile && unusedFile.unused.length > 0) {
              comment += '⚠️ Potentially unused tokens:\n';
              unusedFile.unused.forEach(token => {
                comment += `- \`${token}\`\n`;
              });
            }

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment,
            });
```

### 2. Visual Regression Testing

**.github/workflows/visual-regression.yml**:

```yaml
name: Visual Regression Tests

on:
  pull_request:
    paths:
      - "tokens.json"
      - "tokens/**"
      - "src/**"
      - ".github/workflows/visual-regression.yml"
  push:
    branches: [main]
    paths:
      - "tokens.json"
      - "tokens/**"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Run Playwright visual tests
        run: npm run test:visual
        continue-on-error: true

      - name: Upload visual regression report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: visual-regression-report
          path: test-results/visual-regression/
          retention-days: 30

      - name: Comment with visual diff
        if: github.event_name == 'pull_request' && failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Visual regression detected! Check the artifact for details.',
            });
```

### 3. Coverage and Metrics

**.github/workflows/coverage.yml**:

```yaml
name: Coverage & Metrics

on:
  pull_request:
  push:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage

      - name: Generate analytics
        run: npx tokiforge analytics --format json --output metrics.json

      - name: Comment PR with metrics
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const metrics = JSON.parse(fs.readFileSync('metrics.json', 'utf8'));

            const comment = `
## Token Metrics 📊

- **Total Tokens**: ${metrics.totalTokens}
- **Bundle Impact**: ${metrics.estimatedBundleSize}
- **Coverage**: ${metrics.coverage}%
- **Types**: ${Object.keys(metrics.tokensByType).map(t => \`\${t} (\${metrics.tokensByType[t]})\`).join(', ')}

\`\`\`json
${JSON.stringify(metrics, null, 2)}
\`\`\`
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment,
            });
```

### 4. Automated Publishing

**.github/workflows/publish.yml**:

```yaml
name: Publish Tokens

on:
  push:
    branches: [main]
    paths:
      - "tokens.json"
      - "CHANGELOG.md"

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          registry-url: "https://npm.pkg.github.com"

      - name: Install dependencies
        run: npm ci

      - name: Run all validations
        run: |
          npm run validate
          npm test
          npm run test:visual

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Release
        uses: actions/github-script@v7
        with:
          script: |
            const { version } = require('./package.json');
            github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: \`v\${version}\`,
              name: \`Release v\${version}\`,
              draft: false,
              prerelease: false,
            });
```

---

## Visual Regression Testing Setup

### Configuration

**playwright.config.ts**:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "test-results/visual-regression" }],
    ["json", { outputFile: "test-results/visual-regression.json" }],
  ],
  use: {
    baseURL: "http://localhost:6006", // Storybook port
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run storybook",
    port: 6006,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
```

### Test Suite

**e2e/visual/tokens.spec.ts**:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Token Visual Regression", () => {
  test("should render color palette without changes", async ({ page }) => {
    await page.goto("/?path=/docs/design-system-tokens--page");
    await expect(page).toHaveScreenshot("color-palette.png", {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test("should render typography specimens", async ({ page }) => {
    await page.goto("/?path=/docs/design-system-tokens--page");
    const typographySection = page.locator('[data-testid="typography"]');
    await expect(typographySection).toHaveScreenshot("typography.png");
  });

  test("should render spacing scale", async ({ page }) => {
    await page.goto("/?path=/docs/design-system-tokens--page");
    const spacingSection = page.locator('[data-testid="spacing"]');
    await expect(spacingSection).toHaveScreenshot("spacing.png");
  });

  test.describe("Theme switching", () => {
    test("should render light theme", async ({ page }) => {
      await page.goto("/?globals=theme:light");
      await expect(page).toHaveScreenshot("theme-light.png");
    });

    test("should render dark theme", async ({ page }) => {
      await page.goto("/?globals=theme:dark");
      await expect(page).toHaveScreenshot("theme-dark.png");
    });

    test("should render high-contrast theme", async ({ page }) => {
      await page.goto("/?globals=theme:high-contrast");
      await expect(page).toHaveScreenshot("theme-high-contrast.png");
    });
  });

  test.describe("Component rendering", () => {
    test("should render buttons with token colors", async ({ page }) => {
      await page.goto("/?path=/story/components-button--primary");
      const button = page.locator("button").first();
      await expect(button).toHaveScreenshot("button-primary.png");
    });

    test("should render cards with spacing", async ({ page }) => {
      await page.goto("/?path=/story/components-card--default");
      const card = page.locator('[data-testid="card"]').first();
      await expect(card).toHaveScreenshot("card-default.png");
    });
  });
});
```

### Run Tests

```bash
# Run visual regression tests
npm run test:visual

# Update baselines (use with caution)
npm run test:visual -- --update-snapshots

# Run specific test
npm run test:visual -- --grep "color-palette"
```

---

## Token Change Visualization

### Utilities

**scripts/visualize-token-changes.ts**:

```typescript
import * as fs from "fs";
import * as path from "path";
import type { DesignTokens, TokenValue } from "@tokiforge/core";

interface TokenChange {
  path: string;
  type: "added" | "removed" | "modified";
  before?: TokenValue;
  after?: TokenValue;
  impact: "low" | "medium" | "high";
}

export function detectTokenChanges(
  before: DesignTokens,
  after: DesignTokens
): TokenChange[] {
  const changes: TokenChange[] = [];

  const beforePaths = new Set(getTokenPaths(before));
  const afterPaths = new Set(getTokenPaths(after));

  // Detect additions
  for (const path of afterPaths) {
    if (!beforePaths.has(path)) {
      changes.push({
        path,
        type: "added",
        after: getTokenByPath(after, path),
        impact: "low",
      });
    }
  }

  // Detect removals
  for (const path of beforePaths) {
    if (!afterPaths.has(path)) {
      changes.push({
        path,
        type: "removed",
        before: getTokenByPath(before, path),
        impact: "high",
      });
    }
  }

  // Detect modifications
  for (const path of Array.from(beforePaths).filter((p) => afterPaths.has(p))) {
    const beforeValue = getTokenByPath(before, path);
    const afterValue = getTokenByPath(after, path);

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      const impact = calculateImpact(beforeValue, afterValue, path);
      changes.push({
        path,
        type: "modified",
        before: beforeValue,
        after: afterValue,
        impact,
      });
    }
  }

  return changes;
}

export function generateChangeReport(changes: TokenChange[]): string {
  const byType = {
    added: changes.filter((c) => c.type === "added"),
    removed: changes.filter((c) => c.type === "removed"),
    modified: changes.filter((c) => c.type === "modified"),
  };

  let report = `# Token Changes\n\n`;
  report += `**Summary**: ${changes.length} total changes\n`;
  report += `- ✅ Added: ${byType.added.length}\n`;
  report += `- ❌ Removed: ${byType.removed.length}\n`;
  report += `- 🔄 Modified: ${byType.modified.length}\n\n`;

  if (byType.added.length > 0) {
    report += `## Added Tokens\n\n`;
    byType.added.forEach((change) => {
      report += `- ✅ \`${change.path}\`: \`${(change.after as any).value}\`\n`;
    });
    report += "\n";
  }

  if (byType.removed.length > 0) {
    report += `## Removed Tokens\n\n`;
    byType.removed.forEach((change) => {
      report += `- ❌ \`${change.path}\`: was \`${
        (change.before as any).value
      }\`\n`;
    });
    report += "\n";
  }

  if (byType.modified.length > 0) {
    report += `## Modified Tokens\n\n`;
    byType.modified.forEach((change) => {
      const before = (change.before as any).value;
      const after = (change.after as any).value;
      const impact =
        change.impact === "high"
          ? "🔴"
          : change.impact === "medium"
          ? "🟡"
          : "🟢";
      report += `- 🔄 \`${change.path}\`: ${impact}\n`;
      report += `  - Before: \`${before}\`\n`;
      report += `  - After: \`${after}\`\n`;
    });
    report += "\n";
  }

  return report;
}

function getTokenPaths(tokens: DesignTokens, prefix = ""): string[] {
  const paths: string[] = [];

  const traverse = (obj: any, path: string) => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if ("value" in value) {
          paths.push(currentPath);
        } else {
          traverse(value, currentPath);
        }
      }
    }
  };

  traverse(tokens, prefix);
  return paths;
}

function getTokenByPath(tokens: any, path: string): any {
  const parts = path.split(".");
  let current = tokens;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

function calculateImpact(
  before: TokenValue,
  after: TokenValue,
  path: string
): "low" | "medium" | "high" {
  // Type changes are high impact
  if ((before as any).type !== (after as any).type) {
    return "high";
  }

  // Color/brand tokens are high impact
  if (path.includes("color.primary") || path.includes("color.brand")) {
    return "high";
  }

  // Typography changes are medium impact
  if (path.includes("typography")) {
    return "medium";
  }

  // Spacing changes are low impact
  return "low";
}

// CLI usage
if (require.main === module) {
  const beforePath = process.argv[2];
  const afterPath = process.argv[3];

  if (!beforePath || !afterPath) {
    console.error(
      "Usage: npx ts-node scripts/visualize-token-changes.ts <before.json> <after.json>"
    );
    process.exit(1);
  }

  const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
  const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));

  const changes = detectTokenChanges(before, after);
  const report = generateChangeReport(changes);

  console.log(report);
  fs.writeFileSync("token-changes.md", report);
}
```

---

## PR Preview Generation

### Netlify Deployment

**.github/workflows/preview.yml**:

```yaml
name: Preview Deployment

on:
  pull_request:
    paths:
      - "tokens.json"
      - "src/**"
      - ".storybook/**"

env:
  NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
  NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Generate token changes
        run: |
          git fetch origin main
          npx ts-node scripts/visualize-token-changes.ts \
            <(git show origin/main:tokens.json) \
            tokens.json > token-changes.md || true

      - name: Deploy preview
        id: deploy
        run: |
          npm install -g netlify-cli
          DEPLOY=$(netlify deploy \
            --dir=storybook-static \
            --message="PR #${{ github.event.pull_request.number }}" \
            --alias="pr-${{ github.event.pull_request.number }}")
          PREVIEW_URL=$(echo "$DEPLOY" | grep "Website URL" | awk '{print $NF}')
          echo "preview_url=$PREVIEW_URL" >> $GITHUB_OUTPUT

      - name: Comment with preview link
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const tokenChanges = fs.existsSync('token-changes.md')
              ? fs.readFileSync('token-changes.md', 'utf8')
              : '';

            let comment = '## 🎨 Preview Deployment\n\n';
            comment += `[View Preview](${{ steps.deploy.outputs.preview_url }})\n\n`;

            if (tokenChanges) {
              comment += '### Token Changes\n\n';
              comment += tokenChanges;
            }

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment,
            });
```

---

## CI/CD Best Practices

### 1. Error Handling

```yaml
# Graceful failure handling
- name: Run optional validation
  run: npx tokiforge validate --strict || true
  continue-on-error: true

# Status checks
- name: Check critical validations
  run: |
    set -e
    npx tokiforge validate tokens.json
    npm test
    npm run build
```

### 2. Performance Optimization

```yaml
# Cache dependencies
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Parallel jobs
jobs:
  validate:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  visual:
    runs-on: ubuntu-latest
```

### 3. Security

```yaml
# Token security
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
permissions:
  contents: read
  pull-requests: write

# Dependency scanning
- name: Run Dependabot
  uses: dependabot/fetch-metadata@v1
```

### 4. Notifications

```yaml
# Slack notifications
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "CI/CD Pipeline Failed",
        "blocks": [
          {"type": "section", "text": {"type": "mrkdwn", "text": "Workflow: ${{ github.workflow }}\nBranch: ${{ github.ref }}"}}
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Troubleshooting

### Visual Tests Failing Intermittently

**Solution**: Increase timeouts and add retries

```yaml
test.setTimeout(60000); // Increase timeout
test.beforeEach(async ({ page }) => {
await page.goto(url);
await page.waitForLoadState('networkidle');
});
```

### Baseline Snapshot Mismatches

**Solution**: Update baselines carefully

```bash
# Review changes before updating
git diff test-results/
npm run test:visual -- --update-snapshots
git add test-results/
```

### Workflow Timeouts

**Solution**: Optimize workflow steps

```yaml
# Split long workflows
- name: Run quick validation
  run: npx tokiforge validate tokens.json

- name: Run slow tests
  timeout-minutes: 10
  run: npm run test:visual
```

---

## Integration Examples

### Monorepo Setup

```
.github/workflows/
├── validate-tokens.yml
├── visual-regression.yml
├── coverage.yml
└── publish.yml

packages/
├── core/
├── react/
└── design-system/
```

### Single Package Setup

```
.github/workflows/
└── ci.yml (combined validation + testing)

src/
├── components/
└── tokens.json
```

---

## Related Documentation

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Playwright Visual Testing](https://playwright.dev/docs/test-snapshots)
- [Token Validation Guide](../guide/advanced-features.md)

---

_Last updated: January 2025_
_Version: 3.2.0_
