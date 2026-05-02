---
title: Visual regression testing | Guide
description: Combine Storybook, Playwright, and CI to catch unintended visual changes when tokens or themes change.
---

# Visual regression testing

Visual regression tests compare screenshots of your UI **before and after** changes. When design tokens drive styles, token edits can shift colors, spacing, or typography across many components—automated screenshots help catch regressions early.

## Recommended stack

| Piece | Role |
|-------|------|
| **Storybook** | Isolated stories per component, stable canvas for screenshots. |
| **Playwright** | Capture screenshots and compare to baselines (this repo includes Playwright for e2e). |
| **CI** | Fail PRs when snapshots differ; store baselines in Git LFS or artifact cache if needed. |

See also [Storybook integration](/guide/storybook) for TokiForge theme switching inside stories.

## Workflow

1. **Theme wrapper**: Wrap stories with your TokiForge provider so each story can mount with light/dark or brand themes.
2. **Stable viewport**: Fix viewport size and disable animations for deterministic captures.
3. **Baseline images**: Commit approved screenshots per story + theme variant.
4. **PR check**: Run Playwright `expect(page).toHaveScreenshot()` (or pixelmatch workflows) in CI.

## Token-change awareness

Pair visual tests with **`tokiforge diff`** or **`tokiforge validate`** on token JSON so PRs show **both** structural token changes and visual deltas.

## CI sketch

```yaml
- run: pnpm run build
- run: pnpm exec playwright test --update-snapshots=false
```

Adjust for your monorepo layout; cache Playwright browsers between runs.

## Flake reduction

- Wait for fonts and webfonts to load before screenshots.
- Use `data-testid` selectors, not brittle CSS.
- For themed components, wait until CSS variables from TokiForge are applied (e.g. `page.waitForFunction` on a known variable or class).

## Further reading

- [Playwright screenshot assertions](https://playwright.dev/docs/test-snapshots)
- [Storybook test runner](https://storybook.js.org/docs/writing-tests/test-runner) (optional complement to Playwright)
