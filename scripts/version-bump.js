#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionType = process.argv[2] || 'patch'; // patch, minor, major

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

// Get current version from root package.json
const rootPackagePath = path.join(__dirname, '..', 'package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const currentVersion = rootPackage.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version from ${currentVersion} to ${newVersion} (${versionType})`);

// List of packages to update
const packages = [
  'packages/core',
  'packages/react',
  'packages/vue',
  'packages/angular',
  'packages/svelte',
  'packages/tailwind',
  'packages/figma',
  'packages/cli',
];

// Update root package.json
rootPackage.version = newVersion;
fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');
console.log(`✓ Updated root package.json`);

// Update all package package.json files
packages.forEach((pkgPath) => {
  const packageJsonPath = path.join(__dirname, '..', pkgPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`⚠ Package not found: ${pkgPath}`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;

  // Update peerDependencies and dependencies that reference @tokiforge packages
  if (packageJson.peerDependencies) {
    Object.keys(packageJson.peerDependencies).forEach((dep) => {
      if (dep.startsWith('@tokiforge/')) {
        packageJson.peerDependencies[dep] = `^${newVersion}`;
      }
    });
  }

  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach((dep) => {
      if (dep.startsWith('@tokiforge/')) {
        packageJson.dependencies[dep] = `^${newVersion}`;
      }
    });
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ Updated ${pkgPath}/package.json`);
});

// Update CHANGELOG.md if it exists
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const date = new Date().toISOString().split('T')[0];
  const newChangelogEntry = `## [${newVersion}] - ${date}\n\n### Changed\n- Automated release\n\n`;
  
  // Insert at the beginning after the header
  const lines = changelog.split('\n');
  const headerEnd = lines.findIndex((line) => line.startsWith('## ['));
  if (headerEnd === -1) {
    fs.writeFileSync(changelogPath, changelog + '\n' + newChangelogEntry);
  } else {
    lines.splice(headerEnd, 0, newChangelogEntry);
    fs.writeFileSync(changelogPath, lines.join('\n'));
  }
  console.log(`✓ Updated CHANGELOG.md`);
}

console.log(`\n✅ Version bumped successfully to ${newVersion}`);
console.log(`\nNext steps:`);
console.log(`1. Review the changes`);
console.log(`2. Commit: git add . && git commit -m "chore: bump version to ${newVersion}"`);
console.log(`3. Tag: git tag -a v${newVersion} -m "Release v${newVersion}"`);
console.log(`4. Push: git push && git push --tags`);

