# Release v2.0.1 - Patch Release (2026-03-04)

## Overview

Patch release with frontend audit fixes, new plugin and provider options, and documentation updates. All packages updated to 2.0.1. See [CHANGELOG.md](CHANGELOG.md) for full 2.0.1 details.

---

# Release v2.0.0 - Major Release

## Overview

TokiForge 2.0.0 is a major milestone release marking the production-ready status of the design token and theming engine. This release consolidates all features from v1.x series and introduces comprehensive framework support, advanced accessibility features, and enterprise-grade developer tools.

## Changes Implemented

### 1. Release Automation with Changesets

- **Configuration**: [.changeset/config.json](.changeset/config.json)
  - GitHub changelog integration
  - Public access for all packages
  - Automatic version bumping with patch strategy
- **Scripts Added** (root [package.json](package.json)):
  - `npm run changeset` - Create new changeset
  - `npm run version` - Apply changesets and bump versions
  - `npm run release` - Publish to npm (manual)
  - `npm run publish:ci` - Publish via CI (automated)

### 2. CI/CD Workflows

#### CI Workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml))

- **Triggers**: Push to main, pull requests
- **Matrix**: Node 18/20 × Ubuntu/Windows/macOS
- **Steps**: typecheck → lint → test → build
- **Purpose**: Catch issues before merge

#### Release Workflow ([.github/workflows/release.yml](.github/workflows/release.yml))

- **Triggers**: Push to main
- **Actions**:
  - Applies changesets (version bumps)
  - Creates release PR when changesets present
  - Auto-publishes when release PR is merged
- **Requires**: `NPM_TOKEN` secret for publishing

### 3. Testing Infrastructure

#### Fixed Dependencies

- Added `jsdom` to root devDependencies
- All workspace tests now pass:
  - ✅ @tokiforge/core (37 tests)
  - ✅ @tokiforge/vue (14 tests)
  - ✅ tokiforge-cli (7 tests)
  - ⚠️ @tokiforge/angular (placeholder tests)
  - ⚠️ @tokiforge/tailwind (no tests yet)

#### E2E Visual Regression Tests

- **Config**: [playwright.config.ts](playwright.config.ts)
- **Tests**: [e2e/visual.spec.ts](e2e/visual.spec.ts)
- **Scripts**:
  - `npm run test:e2e` - Run e2e tests
  - `npm run test:e2e:ui` - Interactive UI mode
  - `npm run test:e2e:debug` - Debug mode
- **Coverage**: Playground theme switching, visual regression

### 4. Version Bumps (v1.2.0 → v1.2.1)

All packages bumped to 1.2.1 with changelogs:

- @tokiforge/core
- @tokiforge/react
- @tokiforge/vue
- @tokiforge/svelte
- @tokiforge/angular
- @tokiforge/tailwind
- @tokiforge/figma
- tokiforge-cli

### 5. Documentation

- Updated [documentation/README.md](documentation/README.md) with release process
- Documented Changesets workflow and CI requirements

## Test Results

### Unit Tests ✅

```
@tokiforge/core      37 passed
@tokiforge/vue       14 passed
tokiforge-cli         7 passed
@tokiforge/tailwind  0 (passWithNoTests)
@tokiforge/angular   placeholder only
```

### Builds ✅

All packages built successfully with `npm run build:all`

## Publishing Checklist

### Prerequisites

- [ ] Add `NPM_TOKEN` to GitHub repository secrets
  - Go to: Settings → Secrets and variables → Actions
  - Create secret: `NPM_TOKEN` with your npm access token
- [ ] Verify default branch is `main`

### Commit and Push

```powershell
# Stage all changes
git add .

# Commit with conventional commit message
git commit -m "chore: setup Changesets automation and bump to v1.2.1

- Add Changesets for automated versioning
- Add CI workflows for lint/test/build
- Add Release workflow for automated publishing
- Fix test dependencies (jsdom)
- Add Playwright config for e2e tests
- Bump all packages to v1.2.1"

# Push to trigger CI and release
git push origin main
```

### What Happens Next

1. **CI Workflow** runs: typecheck, lint, test, build (5-10 min)
2. **Release Workflow** runs:
   - Since we already ran `npm run version`, packages are at 1.2.1
   - Will publish directly to npm if NPM_TOKEN is set
3. **Docs Workflow** (existing): deploys documentation site

### Manual Publish (Fallback)

If CI publishing fails or you prefer manual control:

```powershell
# Ensure everything is built
npm run build:all

# Publish all packages
npm run publish:all
```

## Future Workflow

### Adding Changes

```powershell
# Make your code changes...

# Create a changeset describing the change
npm run changeset
# Select packages affected
# Choose bump type: patch/minor/major
# Write summary

# Commit changeset with your code
git add .
git commit -m "feat: add new feature"
git push
```

### Releasing

```powershell
# CI will detect changesets and create a "Version Packages" PR
# Review and merge the PR → automatic publish to npm
```

## Next Steps (Optional)

### High Priority

1. **Add real tests** for @tokiforge/angular and adapters
2. **Expand docs**: CLI reference, SSR guides, Tailwind v4
3. **Implement roadmap CLI features**: generate:types, watch, migrate

### Pre-release Strategy

For major changes (semantic tokens revamp, Tailwind v4):

```powershell
# Enter pre-release mode
npx changeset pre enter beta

# Create changesets as usual
npm run changeset

# Version and publish betas
npm run version
git push

# Exit pre-release mode when ready for stable
npx changeset pre exit
```

## Package Versions

| Package             | Old   | New   |
| ------------------- | ----- | ----- |
| @tokiforge/core     | 1.2.0 | 1.2.1 |
| @tokiforge/react    | 1.2.0 | 1.2.1 |
| @tokiforge/vue      | 1.2.0 | 1.2.1 |
| @tokiforge/svelte   | 1.2.0 | 1.2.1 |
| @tokiforge/angular  | 1.2.0 | 1.2.1 |
| @tokiforge/tailwind | 1.2.0 | 1.2.1 |
| @tokiforge/figma    | 1.2.0 | 1.2.1 |
| tokiforge-cli       | 1.2.0 | 1.2.1 |

## Files Changed

- `.changeset/` (new directory)
- `.github/workflows/ci.yml` (new)
- `.github/workflows/release.yml` (new)
- `package.json` (scripts, devDeps)
- `playwright.config.ts` (new)
- `e2e/visual.spec.ts` (new)
- `documentation/README.md` (release docs)
- `packages/*/package.json` (version bumps)
- `packages/*/CHANGELOG.md` (new changelogs)

---

**Ready to publish!** Follow the commit instructions above to trigger the automated release pipeline.
