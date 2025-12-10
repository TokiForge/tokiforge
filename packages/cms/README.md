# @tokiforge/cms

Headless CMS integration for TokiForge design tokens.

## Installation

```bash
npm install @tokiforge/cms @tokiforge/core
```

## Supported CMS

- Contentful
- Strapi
- Sanity

## Usage

### Contentful

```typescript
import { ContentfulAdapter } from '@tokiforge/cms';

const adapter = new ContentfulAdapter({
  spaceId: 'your-space-id',
  accessToken: 'your-access-token',
  contentTypeId: 'designTokens', // Optional
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
  apiToken: 'your-api-token', // Optional
  contentType: 'design-token', // Optional
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
  token: 'your-token', // Optional
});

// Fetch tokens
const tokens = await adapter.fetchTokens();
```

## Custom CMS Adapter

```typescript
import { BaseCMSAdapter } from '@tokiforge/cms';
import type { DesignTokens } from '@tokiforge/core';

class MyCMSAdapter extends BaseCMSAdapter {
  async fetchTokens(): Promise<DesignTokens> {
    // Your implementation
  }

  async pushTokens(tokens: DesignTokens): Promise<void> {
    // Your implementation
  }
}
```

## License

AGPL-3.0

