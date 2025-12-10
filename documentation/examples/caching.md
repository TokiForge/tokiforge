---
title: Token Caching Strategies | TokiForge
description: Learn about TokiForge's multi-tier caching system. Memory, localStorage, IndexedDB, and Service Worker cache strategies for optimal performance.
---

# Token Caching Strategies

TokiForge provides a robust multi-tier caching system to optimize token performance. Caching is now integrated into ThemeRuntime for seamless performance optimization.

## Overview

The caching system supports multiple storage backends with a unified API:

- **MemoryCache** (L1): Fastest, RAM-based, supports LRU eviction.
- **BrowserCache** (L2): Durable, uses `localStorage`, persists across reloads.
- **IndexedDBCache** (L2): Async, large capacity, for massive token sets.
- **ServiceWorkerCache** (L3): For offline support and stale-while-revalidate.

## Quick Start

### Basic Usage

```typescript
import { MemoryCache } from '@tokiforge/core';

// Create a cache with 1 hour TTL
const cache = new MemoryCache({
  strategy: 'memory',
  ttl: 3600, // seconds
  maxSize: 10 * 1024 * 1024, // 10MB
});

// Cache tokens
await cache.set('my-theme', tokens);

// Retrieve tokens
const cached = await cache.get('my-theme');
if (cached) {
  console.log('Cache hit:', cached);
}
```

## Multi-Tier Caching

Use `CacheManager` to combine multiple caches for optimal performance and persistence.

```typescript
import { 
  CacheManager, 
  MemoryCache, 
  BrowserCache 
} from '@tokiforge/core';

// Setup L1 (Memory) + L2 (LocalStorage)
const manager = new CacheManager([
  new MemoryCache({ ttl: 300 }), // 5 min in memory
  new BrowserCache({ ttl: 86400 }), // 1 day in storage
]);

// Reads from Memory -> LocalStorage -> Network
// Writes to Memory + LocalStorage
const tokens = await manager.get('tokens-v1');
```

## Advanced Features

### Compressed Caching

Store tokens in compressed format to save space (especially for localStorage).

```typescript
import { BrowserCache, GzipCompressor } from '@tokiforge/core';

const cache = new BrowserCache({ strategy: 'localStorage' });

// Compress before caching
const compressed = await GzipCompressor.compress(largeTokenSet);
await cache.set('tokens-compressed', compressed);

// Retrieve and decompress
const cached = await cache.get('tokens-compressed');
if (cached) {
    // Note: If using localStorage, convert data back to Uint8Array if needed
    // The library handles this automatically for you in many cases
    const tokens = await GzipCompressor.decompress(cached);
}
```

### Stale-While-Revalidate

Return stale data immediately while updating in the background.

```typescript
import { ServiceWorkerCache } from '@tokiforge/core';

const swCache = new ServiceWorkerCache({ 
  strategy: 'serviceWorker',
  namespace: 'my-app'
});

// Returns cached data quickly, then fetches fresh data
const tokens = await swCache.getWithRevalidate(
  'theme-v1',
  async () => {
    const response = await fetch('/api/tokens');
    return response.json();
  }
);
```

### Batch Operations (IndexedDB)

Efficiently read/write multiple entries.

```typescript
import { IndexedDBCache } from '@tokiforge/core';

const dbCache = new IndexedDBCache({ strategy: 'indexedDB' });

// Bulk write
const entries = new Map();
entries.set('theme-light', lightTokens);
entries.set('theme-dark', darkTokens);
await dbCache.setMany(entries);

// Bulk read
const results = await dbCache.getMany(['theme-light', 'theme-dark']);
```

## Configuration

### CacheConfig Interface

```typescript
interface CacheConfig {
  strategy: 'memory' | 'localStorage' | 'indexedDB' | 'serviceWorker';
  ttl?: number;      // Seconds (default: 3600)
  maxSize?: number;  // Bytes (Storage quota)
  namespace?: string;// Key prefix (default: 'tokiforge')
}
```

## Best Practices

1. **Use MemoryCache** for frequently accessed tokens during a session.
2. **Use BrowserCache/IndexedDB** to speed up subsequent visits (avoid network requests).
3. **Use Compression** when storing in `localStorage` to stay within the 5MB limit.
4. **Use ServiceWorkerCache** if you have a PWA and need offline capability.
5. **Set Namespaces** if hosting multiple apps on the same domain.
