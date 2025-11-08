# Release Process

This document describes the automated release process for TokiForge.

## Overview

When code is merged to the `main`, `master`, or `release` branch, an automated release workflow will:

1. Determine the version bump type (patch, minor, or major)
2. Update version numbers across all packages
3. Build all packages
4. Run tests
5. Create a git tag
6. Publish packages to npm
7. Create a GitHub release

## Version Bump Types

The workflow automatically determines the version bump type based on commit messages:

- **Major** (`x.0.0`): Commit messages containing `BREAKING CHANGE:`
- **Minor** (`x.y.0`): Commit messages starting with `feat:` or `feature:`
- **Patch** (`x.y.z`): Commit messages starting with `fix:` or `bugfix:`, or any other commit

## Manual Release

You can also trigger a manual release via GitHub Actions:

1. Go to the **Actions** tab in GitHub
2. Select the **Release** workflow
3. Click **Run workflow**
4. Choose the version type (patch, minor, or major)
5. Click **Run workflow**

## Release Workflow Steps

### 1. Automatic Version Detection

The workflow analyzes commit messages since the last tag to determine the version bump:

```bash
# Major version (2.0.0)
git commit -m "feat: new API

BREAKING CHANGE: Old API removed"

# Minor version (1.1.0)
git commit -m "feat: add new feature"

# Patch version (1.0.1)
git commit -m "fix: bug fix"
```

### 2. Version Update

The `scripts/version-bump.js` script:
- Updates version in root `package.json`
- Updates version in all package `package.json` files
- Updates `@tokiforge/*` dependencies in peerDependencies and dependencies
- Updates `CHANGELOG.md` (if it exists)

### 3. Build and Test

- Builds all packages
- Runs tests (continues on failure for now)

### 4. Git Operations

- Creates a commit with version changes
- Creates a git tag (e.g., `v1.0.1`)
- Pushes changes and tags to the repository

### 5. NPM Publishing

Publishes all packages to npm:
- `@tokiforge/core`
- `@tokiforge/react`
- `@tokiforge/vue`
- `@tokiforge/angular`
- `@tokiforge/svelte`
- `@tokiforge/tailwind`
- `@tokiforge/figma`
- `tokiforge-cli`

### 6. GitHub Release

Creates a GitHub release with:
- Release notes
- List of published packages
- Installation instructions

## Configuration

### Required Secrets

Set up the following secrets in GitHub repository settings:

- `NPM_TOKEN`: npm authentication token with publish permissions
  - Generate at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Required permissions: `Read and Publish`

### Branch Configuration

The release workflow triggers on pushes to:
- `main`
- `master`
- `release`

To skip a release, include `[skip release]` in your commit message:

```bash
git commit -m "docs: update README [skip release]"
```

## Local Testing

You can test the version bump script locally:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm run version:bump patch

# Minor version (1.0.0 -> 1.1.0)
npm run version:bump minor

# Major version (1.0.0 -> 2.0.0)
npm run version:bump major
```

## Package Version Synchronization

All packages maintain the same version number. When a release is made:
- Root `package.json`: `1.0.1`
- `packages/core/package.json`: `1.0.1`
- `packages/react/package.json`: `1.0.1`
- All other packages: `1.0.1`

Dependencies between packages are automatically updated:
- `@tokiforge/react` depends on `@tokiforge/core@^1.0.1`
- All peer dependencies are updated to match

## Troubleshooting

### Release Fails to Trigger

- Check that the branch is `main`, `master`, or `release`
- Verify the commit message doesn't contain `[skip release]`
- Check GitHub Actions workflow logs

### NPM Publish Fails

- Verify `NPM_TOKEN` secret is set correctly
- Check that the token has publish permissions
- Ensure the package name is available on npm
- Check that the version doesn't already exist on npm

### Version Not Updating

- Check that `scripts/version-bump.js` exists and is executable
- Verify all package.json files are in the expected locations
- Check workflow logs for errors

### Git Tag Already Exists

- Delete the tag: `git tag -d v1.0.1 && git push origin :refs/tags/v1.0.1`
- Re-run the release workflow

## Best Practices

1. **Use Conventional Commits**: Follow the conventional commit format for automatic version detection
2. **Test Before Release**: Ensure all tests pass before merging to the release branch
3. **Review Changes**: Review the version bump before it's published
4. **Changelog**: Manually update `CHANGELOG.md` with meaningful release notes
5. **Tag Verification**: Verify the git tag is created correctly
6. **NPM Verification**: Check npm to confirm packages are published

## Related Files

- `.github/workflows/release.yml` - Release workflow definition
- `scripts/version-bump.js` - Version bump script
- `package.json` - Root package configuration
- `packages/*/package.json` - Individual package configurations

## Support

For issues or questions about the release process:
- Open an issue on GitHub
- Check workflow logs in GitHub Actions
- Review this documentation

---

**Last Updated**: 2025-01-08

