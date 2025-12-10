---
title: Integrations | TokiForge
description: Learn how to integrate TokiForge with Storybook, Figma, Sketch, Adobe XD, CMS platforms, and design system tools like Zeroheight and InVision DSM.
---

# Integrations

TokiForge integrates with popular design tools, CMS platforms, and design system tools.

## Storybook Integration

View and switch themes directly in Storybook.

### Installation

```bash
npm install @tokiforge/storybook @tokiforge/core
```

### Setup

**`.storybook/main.js`:**

```js
export default {
  addons: [
    '@tokiforge/storybook',
  ],
};
```

**`.storybook/preview.js`:**

```js
import { withTokiForge, tokiforgeParameters } from '@tokiforge/storybook';
import { themeConfig } from '../src/themes';

export const decorators = [
  withTokiForge({
    config: themeConfig,
    enableThemeSwitcher: true,
    enableTokenViewer: true,
  }),
];

export const parameters = {
  ...tokiforgeParameters({
    config: themeConfig,
  }),
};
```

### Features

- Theme switcher in toolbar
- Token viewer in addon panel
- Automatic theme initialization

## Figma Integration

Enhanced Figma sync with conflict resolution.

### Basic Usage

```typescript
import { FigmaSync } from '@tokiforge/figma';

const sync = new FigmaSync({
  accessToken: 'your-token',
  fileKey: 'your-file-key',
});

// Pull tokens from Figma
const tokens = await sync.pullTokens();

// Push tokens to Figma
await sync.pushTokens('./tokens.json');
```

### Conflict Resolution

```typescript
// Check sync status
const status = await sync.getSyncStatus(localTokens);
console.log('Added:', status.added);
console.log('Modified:', status.modified);
console.log('Removed:', status.removed);

// Sync with conflict resolution
const merged = await sync.syncWithConflictResolution(localTokens, {
  strategy: 'merge', // 'local' | 'remote' | 'merge'
  onConflict: (path, local, remote) => {
    // Custom conflict resolution
    return local; // or remote, or merged value
  },
});
```

## Design Tool Integrations

### Sketch

```typescript
import { SketchAdapter } from '@tokiforge/design-tools/sketch';

const adapter = new SketchAdapter({
  pluginContext: sketchPluginContext,
});

// Export tokens to Sketch
await adapter.exportToSketch(tokens);

// Import tokens from Sketch
const tokens = await adapter.importFromSketch();
```

### Adobe XD

```typescript
import { AdobeXDAdapter } from '@tokiforge/design-tools/adobe-xd';

const adapter = new AdobeXDAdapter({
  pluginContext: xdPluginContext,
});

// Export tokens to Adobe XD
await adapter.exportToXD(tokens);

// Import tokens from Adobe XD
const tokens = await adapter.importFromXD();
```

## CMS Integration

Manage tokens in headless CMS platforms.

### Contentful

```typescript
import { ContentfulAdapter } from '@tokiforge/cms';

const adapter = new ContentfulAdapter({
  spaceId: 'your-space-id',
  accessToken: 'your-access-token',
});

// Fetch tokens
const tokens = await adapter.fetchTokens();

// Watch for changes
const unwatch = adapter.watchTokens((tokens) => {
  console.log('Tokens updated:', tokens);
});
```

### Strapi

```typescript
import { StrapiAdapter } from '@tokiforge/cms';

const adapter = new StrapiAdapter({
  apiUrl: 'https://your-strapi-instance.com',
  apiToken: 'your-api-token',
});

// Fetch tokens
const tokens = await adapter.fetchTokens();

// Push tokens
await adapter.pushTokens(tokens);
```

### Sanity

```typescript
import { SanityAdapter } from '@tokiforge/cms';

const adapter = new SanityAdapter({
  projectId: 'your-project-id',
  dataset: 'production',
  token: 'your-token',
});

// Fetch tokens
const tokens = await adapter.fetchTokens();
```

## Design System Tools

### Zeroheight

```typescript
import { ZeroheightAdapter } from '@tokiforge/design-systems/zeroheight';

const adapter = new ZeroheightAdapter({
  apiToken: 'your-api-token',
  spaceId: 'your-space-id',
  designSystemId: 'your-ds-id',
});

// Push tokens
await adapter.pushTokens(tokens);

// Fetch tokens
const tokens = await adapter.fetchTokens();

// Sync tokens
const synced = await adapter.syncTokens(localTokens, {
  strategy: 'merge',
});
```

### InVision DSM

```typescript
import { InVisionDSMAdapter } from '@tokiforge/design-systems/invision-dsm';

const adapter = new InVisionDSMAdapter({
  apiToken: 'your-api-token',
  spaceId: 'your-space-id',
  designSystemId: 'your-ds-id',
});

// Push tokens
await adapter.pushTokens(tokens);

// Fetch tokens
const tokens = await adapter.fetchTokens();

// Sync tokens
const synced = await adapter.syncTokens(localTokens, {
  strategy: 'merge',
});
```

## Custom CMS Adapter

Create your own CMS adapter:

```typescript
import { BaseCMSAdapter } from '@tokiforge/cms';
import type { DesignTokens } from '@tokiforge/core';

class MyCMSAdapter extends BaseCMSAdapter {
  async fetchTokens(): Promise<DesignTokens> {
    // Your implementation
    const response = await fetch('https://api.example.com/tokens');
    return response.json();
  }

  async pushTokens(tokens: DesignTokens): Promise<void> {
    // Your implementation
    await fetch('https://api.example.com/tokens', {
      method: 'POST',
      body: JSON.stringify(tokens),
    });
  }
}
```

