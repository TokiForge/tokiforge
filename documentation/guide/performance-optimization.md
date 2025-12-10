---
title: Performance Optimization | TokiForge
description: Learn how to optimize TokiForge performance with caching, lazy loading, and compression. Reduce bundle size and improve load times.
---

# Performance Optimization

TokiForge provides built-in performance features including caching, lazy loading, and compression to optimize your theme runtime.

## Caching

Enable caching to improve performance by storing tokens in memory, localStorage, IndexedDB, or Service Worker cache.

### Basic Usage

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const theme = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  performance: {
    cache: {
      strategy: 'localStorage',
      ttl: 3600, // 1 hour
      maxSize: 10 * 1024 * 1024, // 10MB
    },
  },
});
```

### Cache Strategies

- **memory**: Fastest, RAM-based, lost on page reload
- **localStorage**: Persistent, synchronous, ~5MB limit
- **indexedDB**: Large capacity, async, for massive token sets
- **serviceWorker**: Offline support and stale-while-revalidate

### Multi-Tier Caching

```typescript
import { CacheManager, MemoryCache, BrowserCache } from '@tokiforge/core';

const manager = new CacheManager([
  new MemoryCache({ ttl: 300 }), // 5 min in memory
  new BrowserCache({ ttl: 86400 }), // 1 day in storage
]);

const tokens = await manager.get('tokens-v1');
```

## Lazy Loading

Load token chunks on-demand to reduce initial bundle size.

### Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
  ],
  performance: {
    loading: {
      source: '/tokens',
      timeout: 5000,
      retries: 2,
    },
  },
});
```

### Lazy Load Chunks

```typescript
// Load a single chunk
await theme.loadChunk('color');

// Load multiple chunks
await theme.loadChunk(['typography', 'spacing']);

// Check if chunk is loaded
if (theme.isChunkLoaded('color')) {
  // Chunk already loaded
}

// Preload chunks in background
theme.preloadChunks(['typography', 'spacing']);
```

### CDN Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
  ],
  performance: {
    loading: {
      source: {
        provider: 'jsdelivr',
        package: '@mycompany/design-tokens',
        version: '1.0.0',
        basePath: 'dist/tokens',
      },
    },
  },
});
```

## Compression

Compress tokens to reduce storage size, especially useful for localStorage.

### Gzip Compression

```typescript
import { GzipCompressor } from '@tokiforge/core';

const compressed = await GzipCompressor.compress(tokens);
console.log(`Compressed: ${compressed.compressedSize} bytes`);
console.log(`Ratio: ${compressed.compressionRatio.toFixed(2)}%`);

const decompressed = await GzipCompressor.decompress(compressed.data);
```

### Base64 Encoding

```typescript
const base64 = await GzipCompressor.compressToBase64(tokens);
localStorage.setItem('tokens', base64);

const restored = await GzipCompressor.decompressFromBase64(base64);
```

## Combined Configuration

```typescript
const theme = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  performance: {
    cache: {
      strategy: 'localStorage',
      ttl: 3600,
    },
    loading: {
      source: '/tokens',
      lazy: true,
    },
  },
});
```

## Best Practices

1. **Use MemoryCache** for frequently accessed tokens during a session
2. **Use BrowserCache/IndexedDB** to speed up subsequent visits
3. **Use Compression** when storing in localStorage to stay within limits
4. **Lazy Load** non-critical token chunks to reduce initial load time
5. **Preload** chunks that will be needed soon

