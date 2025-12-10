# @tokiforge/design-systems

Design system tools integration for TokiForge (Zeroheight, InVision DSM).

## Installation

```bash
npm install @tokiforge/design-systems @tokiforge/core
```

## Zeroheight Integration

```typescript
import { ZeroheightAdapter } from '@tokiforge/design-systems/zeroheight';

const adapter = new ZeroheightAdapter({
  apiToken: 'your-api-token',
  spaceId: 'your-space-id',
  designSystemId: 'your-ds-id', // Optional
});

// Push tokens
await adapter.pushTokens(tokens);

// Fetch tokens
const tokens = await adapter.fetchTokens();

// Sync tokens (merge strategy)
const synced = await adapter.syncTokens(localTokens, {
  strategy: 'merge', // 'local' | 'remote' | 'merge'
});
```

## InVision DSM Integration

```typescript
import { InVisionDSMAdapter } from '@tokiforge/design-systems/invision-dsm';

const adapter = new InVisionDSMAdapter({
  apiToken: 'your-api-token',
  spaceId: 'your-space-id',
  designSystemId: 'your-ds-id', // Optional
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

## License

AGPL-3.0

