# Enhanced Figma ↔ Code Sync Guide

## Overview

Phase 2.3 provides comprehensive bidirectional token synchronization between Figma and your codebase with **Tokens Studio** integration, **conflict resolution**, and a dedicated **Figma plugin**.

This guide covers:

- Tokens Studio API integration
- Bidirectional sync with state tracking
- Conflict detection and resolution
- Figma plugin installation and usage
- CI/CD integration examples

---

## Architecture

The enhanced Figma integration consists of three main components:

```
┌─────────────────────────────────────────────────────────┐
│         TokiForge Figma Integration (Phase 2.3)         │
└─────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
    │ Figma   │      │ Tokens    │    │Conflict │
    │  Sync   │      │ Studio    │    │Resolver │
    │Enhanced │      │   API     │    │ System  │
    └─────────┘      └───────────┘    └─────────┘
         │                 │                 │
         │    ┌────────────┼────────────┐    │
         │    │            │            │    │
    Bidirectional Sync, Format Conversion, Conflict Handling
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install @tokiforge/figma
```

### 2. Configure Tokens Studio API

Create a `.env` file with your Tokens Studio credentials:

```env
TOKENS_STUDIO_API_URL=https://tokens.studio/api/v1
TOKENS_STUDIO_PROJECT_ID=your-project-id
TOKENS_STUDIO_ACCESS_TOKEN=your-access-token
```

### 3. Basic Usage

#### Pull tokens from Figma

```typescript
import { FigmaSync } from "@tokiforge/figma";

const sync = new FigmaSync({
  accessToken: process.env.FIGMA_ACCESS_TOKEN!,
  fileKey: "your-figma-file-key",
});

// Pull tokens
const tokens = await sync.pullTokens();
console.log(tokens);
```

#### Sync with Tokens Studio

```typescript
import { TokensStudioAPI, syncWithTokensStudio } from "@tokiforge/figma";

const api = new TokensStudioAPI({
  accessToken: process.env.TOKENS_STUDIO_ACCESS_TOKEN!,
  projectId: process.env.TOKENS_STUDIO_PROJECT_ID!,
});

// Get sync status
const status = await api.getSyncStatus(localTokens);
console.log(status);

// Perform bidirectional sync
const result = await api.bidirectionalSync(localTokens, {
  strategy: "merge",
});
```

---

## Core Features

### 1. Bidirectional Sync (FigmaSync)

#### State Tracking

The `FigmaSync` class tracks synchronization state:

```typescript
const sync = new FigmaSync(config);

const result = await sync.bidirectionalSync(localTokens, {
  strategy: "merge", // 'local-wins' | 'remote-wins' | 'merge' | 'manual'
  stateKey: "main-file", // Unique identifier for state tracking
});

console.log(result.state);
// {
//   fileKey: 'abc123',
//   lastSyncTime: 1704067200000,
//   localHash: 'a1b2c3d4',
//   remoteHash: 'x1y2z3w4',
//   pendingPush: false,
//   pendingPull: false,
// }
```

#### Change Detection

Get a summary of what would change without performing the sync:

```typescript
const status = await sync.getSyncStatus(localTokens);

console.log(status);
// {
//   inSync: false,
//   pendingPush: ['color.primary', 'color.secondary'],
//   pendingPull: ['spacing.lg'],
//   conflicts: [],
// }
```

#### Merge Strategies

**Local-Wins**: Keep all local changes, discard remote

```typescript
const result = await sync.bidirectionalSync(localTokens, {
  strategy: "local-wins",
});
```

**Remote-Wins**: Accept all remote changes

```typescript
const result = await sync.bidirectionalSync(localTokens, {
  strategy: "remote-wins",
});
```

**Merge**: Intelligently combine changes, remote wins on conflicts (default)

```typescript
const result = await sync.bidirectionalSync(localTokens, {
  strategy: "merge",
});
```

**Manual**: Use callback to resolve each conflict

```typescript
const result = await sync.bidirectionalSync(localTokens, {
  strategy: "manual",
  onConflict: (path, local, remote) => {
    // Return 'local', 'remote', or a custom TokenValue
    return local; // or remote, or { value: '...', type: '...' }
  },
});
```

---

### 2. Tokens Studio API Integration

#### Fetch Tokens

```typescript
const api = new TokensStudioAPI(config);

// Fetch all tokens
const allTokens = await api.fetchTokens();

// Fetch specific token set
const colorTokens = await api.fetchTokens("color-set");
```

#### Sync Status with Conflict Detection

```typescript
const status = await api.getSyncStatus(localTokens);

console.log(status);
// {
//   status: 'conflicts', // 'in-sync' | 'needs-pull' | 'needs-push' | 'conflicts'
//   conflicts: [
//     {
//       path: 'color.primary',
//       local: { value: '#FF0000', type: 'color' },
//       remote: { value: '#00FF00', type: 'color' },
//       localModifiedAt: 1704067200000,
//       remoteModifiedAt: 1704067100000,
//     },
//   ],
//   changes: {
//     added: ['color.tertiary'],
//     modified: ['color.primary'],
//     deleted: [],
//   },
// }
```

#### Bidirectional Sync with Resolution

```typescript
const result = await api.bidirectionalSync(localTokens, {
  strategy: "merge",
  onConflict: (conflict) => {
    // Use more recent value
    if (conflict.remoteModifiedAt! > conflict.localModifiedAt!) {
      return "remote";
    }
    return "local";
  },
});

console.log(result.merged); // Merged tokens
console.log(result.conflicts); // Unresolved conflicts
```

#### Format Conversion

Tokens Studio ↔ DesignTokens automatic conversion:

```typescript
// Tokens Studio format (input)
const tokensStudioFormat = {
  "primary-color": {
    value: "#7C3AED",
    type: "color",
    description: "Primary brand color",
  },
  spacing: {
    sm: {
      value: "8px",
      type: "dimension",
    },
  },
};

// Automatically converted to DesignTokens structure
const api = new TokensStudioAPI(config);
const designTokens = api.convertToDesignTokens(tokensStudioFormat);

// Result:
// {
//   color: {
//     'primary-color': { value: '#7C3AED', type: 'color', ... },
//   },
//   spacing: {
//     sm: { value: '8px', type: 'dimension', ... },
//   },
// }
```

---

### 3. Conflict Resolution System

#### Conflict Types

The system detects and classifies conflicts:

```typescript
import {
  ConflictType,
  detectConflictType,
  calculateSeverity,
} from "@tokiforge/figma";

// Automatically detect conflict type
const type = detectConflictType(localValue, remoteValue);

console.log(type);
// ConflictType.VALUE_CHANGE
// ConflictType.TYPE_CHANGE
// ConflictType.METADATA_CHANGE
// ConflictType.DELETED_LOCAL
// ConflictType.DELETED_REMOTE
// ConflictType.BOTH_ADDED

// Calculate severity
const severity = calculateSeverity(type);
console.log(severity); // 'low' | 'medium' | 'high'
```

#### ConflictResolver Class

```typescript
import { ConflictResolver, ConflictType } from "@tokiforge/figma";

const resolver = new ConflictResolver();

// Add conflicts
resolver.addConflict({
  path: "color.primary",
  type: ConflictType.VALUE_CHANGE,
  localValue: { value: "#FF0000", type: "color" },
  remoteValue: { value: "#00FF00", type: "color" },
  localModifiedAt: Date.now(),
  remoteModifiedAt: Date.now() - 1000,
  severity: "medium",
});

// Resolve with strategy
const resolutions = resolver.resolveConflicts("merge");

// Or with custom callback
const resolutions = resolver.resolveConflicts("manual", (conflict) => {
  if (conflict.remoteModifiedAt! > conflict.localModifiedAt!) {
    return "remote";
  }
  return "local";
});

// Get summary
const summary = resolver.generateSummary();
console.log(summary);
// {
//   total: 1,
//   resolved: 1,
//   unresolved: 0,
//   byType: { 'value-change': 1 },
//   bySeverity: { medium: 1, high: 0, low: 0 },
// }

// Export report
const report = resolver.exportReport();
```

---

## Figma Plugin

### Installation

1. **Get Plugin ID**: The plugin is identified as `tokiforge-sync`

2. **Install in Figma**:

   - Open Figma
   - Go to Plugins → Development → Manage plugins
   - Create new plugin linking to manifest.json

3. **Configure**: Set your Tokens Studio credentials in plugin UI

### Usage

The plugin provides a UI for:

- **Pull Tokens**: Extract from Figma → Code
- **Push Tokens**: Update Figma ← Code
- **Sync Status**: View pending changes
- **Settings**: Configure Tokens Studio API

#### Programmatic Plugin Usage

```typescript
// In your Figma plugin context

// Extract colors from current file
const colors = await extractColorsFromFigma();

// Apply colors to Figma styles
await applyColorsToFigma({
  primary: "#7C3AED",
  secondary: "#06B6D4",
});
```

---

## CLI Integration

### Fetch from Figma

```bash
tokiforge figma:pull \
  --access-token your-figma-token \
  --file-key your-file-key \
  --output tokens.json
```

### Sync with Tokens Studio

```bash
tokiforge figma:sync \
  --tokens-studio-api https://tokens.studio/api/v1 \
  --project-id your-project \
  --access-token your-token \
  --strategy merge
```

### Check Sync Status

```bash
tokiforge figma:status \
  --tokens-file tokens.json \
  --figma-token your-figma-token \
  --file-key your-file-key
```

---

## Workflow Examples

### Scenario 1: Design System Initial Setup

```typescript
// 1. Pull tokens from existing Figma file
const sync = new FigmaSync({
  accessToken: process.env.FIGMA_TOKEN,
  fileKey: "your-design-system-file",
});

const figmaTokens = await sync.pullTokens();

// 2. Convert and store locally
fs.writeFileSync("tokens.json", JSON.stringify(figmaTokens, null, 2));

// 3. Push to code repo
// ... (version control operations)

console.log("✅ Design system tokens initialized");
```

### Scenario 2: Designer Updates Figma, Dev Pulls Changes

```typescript
// Developer runs sync check
const status = await sync.getSyncStatus(currentTokens);

if (status.conflicts.length > 0) {
  console.log("⚠️  Conflicts detected:");
  status.conflicts.forEach((c) => {
    console.log(`  - ${c.path}: local vs remote`);
  });

  // Resolve with merge strategy
  const result = await sync.bidirectionalSync(currentTokens, {
    strategy: "merge",
    onConflict: (conflict) => {
      // Designer has priority
      return "remote";
    },
  });

  currentTokens = result.merged;
} else {
  console.log("✅ No conflicts, tokens in sync");
}
```

### Scenario 3: Developer Adds New Tokens Locally

```typescript
// New tokens added to codebase
const newTokens: DesignTokens = {
  ...currentTokens,
  color: {
    ...currentTokens.color,
    brand: { value: "#7C3AED", type: "color" },
  },
};

// Check what would push to Figma
const changes = await sync.getSyncChanges(newTokens);
console.log("Changes to push:", changes.added);

// Push to Figma
await sync.pushTokens("tokens.json"); // Requires plugin context
```

### Scenario 4: CI/CD Validation

```typescript
// In GitHub Actions or similar

const sync = new FigmaSync({
  accessToken: process.env.FIGMA_TOKEN,
  fileKey: process.env.FIGMA_FILE_KEY,
});

const status = await sync.getSyncStatus(localTokens);

if (!status.inSync) {
  console.error("❌ Tokens out of sync with Figma!");
  console.log("Push:", status.pendingPush);
  console.log("Pull:", status.pendingPull);
  process.exit(1);
}

console.log("✅ Tokens in sync");
```

---

## API Reference

### FigmaSync

```typescript
class FigmaSync {
  // Pull tokens from Figma
  async pullTokens(): Promise<DesignTokens>;

  // Push tokens to Figma (requires plugin)
  async pushTokens(tokensPath: string): Promise<void>;

  // Bidirectional sync with state tracking
  async bidirectionalSync(
    localTokens: DesignTokens,
    options?: {
      strategy?: "local-wins" | "remote-wins" | "merge" | "manual";
      onConflict?: (path: string, local: any, remote: any) => any;
      stateKey?: string;
    }
  ): Promise<{
    merged: DesignTokens;
    state: BidirectionalSyncState;
    changes: {
      remoteChanges: string[];
      localChanges: string[];
      conflicts: string[];
    };
  }>;

  // Get sync status without modifications
  async getSyncStatus(localTokens: DesignTokens): Promise<{
    inSync: boolean;
    pendingPush: string[];
    pendingPull: string[];
    conflicts: string[];
  }>;

  // Get all changes
  async getSyncChanges(localTokens: DesignTokens): Promise<{
    added: string[];
    modified: string[];
    removed: string[];
  }>;
}
```

### TokensStudioAPI

```typescript
class TokensStudioAPI {
  // Fetch tokens from Tokens Studio
  async fetchTokens(tokenSetId?: string): Promise<DesignTokens>;

  // Push tokens to Tokens Studio
  async pushTokens(tokens: DesignTokens, tokenSetId?: string): Promise<void>;

  // Get sync status with conflict detection
  async getSyncStatus(
    localTokens: DesignTokens,
    tokenSetId?: string
  ): Promise<{
    status: "in-sync" | "needs-pull" | "needs-push" | "conflicts";
    conflicts: ConflictInfo[];
    changes: { added: string[]; modified: string[]; deleted: string[] };
  }>;

  // Bidirectional sync
  async bidirectionalSync(
    localTokens: DesignTokens,
    options?: {
      strategy?: "local-wins" | "remote-wins" | "merge" | "manual";
      onConflict?: (conflict: ConflictInfo) => "local" | "remote" | TokenValue;
      tokenSetId?: string;
    }
  ): Promise<{
    merged: DesignTokens;
    conflicts: ConflictInfo[];
    syncState: SyncState;
  }>;
}
```

### ConflictResolver

```typescript
class ConflictResolver {
  // Add conflict
  addConflict(conflict: Conflict): void

  // Resolve conflicts
  resolveConflicts(
    strategy: ConflictStrategy,
    callback?: (conflict: Conflict) => TokenValue | 'local' | 'remote'
  ): ConflictResolution[]

  // Get conflicts
  getConflicts(): Conflict[]
  getUnresolvedConflicts(): Conflict[]
  getAllResolutions(): ConflictResolution[]

  // Generate summary
  generateSummary(): { total: number; resolved: number; unresolved: number; ... }

  // Export report
  exportReport(): string

  // Clear all
  clear(): void
}
```

---

## Troubleshooting

### "Failed to fetch tokens from Tokens Studio"

**Solution**: Check API credentials and network connectivity

```bash
curl -H "Authorization: Bearer your-token" \
  https://tokens.studio/api/v1/projects/your-project/token-sets
```

### Conflicts on every sync

**Solution**: Ensure timestamps are consistent

```typescript
// Always include modification times
const conflicts = await resolver.generateSummary();
if (conflicts.unresolved > 0) {
  // Review and manually resolve
}
```

### Figma plugin not updating styles

**Solution**: Plugin requires Figma file edit permission

- Ensure access token has appropriate scopes
- Plugin must run in Figma desktop app context

### Token format mismatch

**Solution**: Verify Tokens Studio format compatibility

```typescript
// Use built-in converters
const converted = api.convertTokensStudioToDesignTokens(tokensStudioFormat);
```

---

## Best Practices

1. **Use Merge Strategy by Default**

   - Prevents data loss
   - Handles both sides of changes
   - Enable conflict callbacks for complex cases

2. **Track Sync State**

   - Monitor `pendingPush` and `pendingPull`
   - Implement in CI/CD to prevent out-of-sync deployments

3. **Resolve Conflicts Proactively**

   - Check status before making changes
   - Use `manual` strategy for important updates
   - Document resolution decisions

4. **Version Control**

   - Commit token changes with sync metadata
   - Track sync state in `.tokiforge-sync.json`

5. **Plugin Best Practices**
   - Keep plugin settings in Figma client storage
   - Use batch operations for performance
   - Handle network errors gracefully

---

## Migration from Phase 1

If you have existing Figma sync setup:

```typescript
// Old API
const tokens = await pullFromFigma(config);

// Now supported with bidirectional sync
const sync = new FigmaSync(config);
const result = await sync.bidirectionalSync(tokens, {
  strategy: "merge",
});
```

All existing code continues to work. Use new features for enhanced capabilities.

---

## Related Documentation

- [Token Versioning & Governance](../guide/advanced-features.md)
- [Design Tokens Guide](../guide/design-tokens.md)
- [CI/CD Integration](../guides/ci-recipes.md)
- [Tokens Studio Documentation](https://tokens.studio/docs)

---

_Last updated: January 2025_
_Version: 2.3.0_
