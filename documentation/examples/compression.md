---
title: Compression & Minification Examples | TokiForge
description: Examples demonstrating token compression and minification features. Learn how to compress tokens with Gzip and Brotli, and minify token files for optimal performance.
---

# Compression & Minification Examples

Examples demonstrating token compression and minification features.

## Basic Compression

### Compress Tokens with Gzip

```typescript
import { GzipCompressor } from '@tokiforge/core';

const tokens = {
  color: {
    primary: { value: '#3b82f6', type: 'color' },
    secondary: { value: '#8b5cf6', type: 'color' },
  },
  spacing: {
    sm: { value: '0.5rem', type: 'dimension' },
    md: { value: '1rem', type: 'dimension' },
  },
};

// Compress tokens
const compressed = await GzipCompressor.compress(tokens);

console.log('Original size:', compressed.originalSize, 'bytes');
console.log('Compressed size:', compressed.compressedSize, 'bytes');
console.log('Compression ratio:', compressed.compressionRatio.toFixed(2) + '%');

// Decompress tokens
const decompressed = await TokenCompressor.decompress(compressed);
console.log('Decompressed:', decompressed);
```

**Output:**
```
Original size: 245 bytes
Compressed size: 68 bytes
Compression ratio: 72.24%
```

---

## Base64 Encoding

### Store Compressed Tokens as Base64

```typescript
import { GzipCompressor } from '@tokiforge/core';

// Compress and encode to base64
const base64 = await GzipCompressor.compressToBase64(tokens);
console.log('Base64:', base64);

// Store in localStorage or send over network
localStorage.setItem('tokens', base64);

// Later: decompress from base64
const restored = await GzipCompressor.decompressFromBase64(base64);
```

---

## JSON Minification

### Minify Token JSON

```typescript
import { TokenMinifier } from '@tokiforge/core';

const result = TokenMinifier.minifyJSON(tokens);

console.log('Original size:', result.originalSize, 'bytes');
console.log('Minified size:', result.minifiedSize, 'bytes');
console.log('Savings:', result.savingsPercent.toFixed(2) + '%');
console.log('Minified JSON:', result.output);
```

**Output:**
```
Original size: 245 bytes
Minified size: 152 bytes
Savings: 37.96%
Minified JSON: {"color":{"primary":{"value":"#3b82f6","type":"color"},...}}
```

---

## CSS Minification

### Minify CSS Output

```typescript
import { TokenExporter, TokenMinifier } from '@tokiforge/core';

// Export to CSS
const css = TokenExporter.exportCSS(tokens, {
  selector: ':root',
  prefix: 'app',
});

// Minify CSS
const minified = TokenMinifier.minifyCSS(css);

console.log('Original CSS size:', minified.originalSize, 'bytes');
console.log('Minified CSS size:', minified.minifiedSize, 'bytes');
console.log('Savings:', minified.savingsPercent.toFixed(2) + '%');
```

---

## Tree-Shaking

### Remove Unused Tokens

```typescript
import { TokenMinifier } from '@tokiforge/core';

const allTokens = {
  color: {
    primary: { value: '#3b82f6' },
    secondary: { value: '#8b5cf6' },
    tertiary: { value: '#ec4899' },
    quaternary: { value: '#f59e0b' },
  },
  spacing: {
    xs: { value: '0.25rem' },
    sm: { value: '0.5rem' },
    md: { value: '1rem' },
    lg: { value: '1.5rem' },
    xl: { value: '2rem' },
  },
};

// Only keep tokens actually used in your app
const usedTokens = [
  'color.primary',
  'color.secondary',
  'spacing.md',
];

const optimized = TokenMinifier.treeShake(allTokens, usedTokens);

console.log('Original tokens:', Object.keys(allTokens.color).length + Object.keys(allTokens.spacing).length);
console.log('Optimized tokens:', Object.keys(optimized.color).length + Object.keys(optimized.spacing).length);
```

**Output:**
```
Original tokens: 9
Optimized tokens: 3
```

---

## CSS Variable Name Shortening

### Shorten CSS Variable Names

```typescript
import { TokenMinifier } from '@tokiforge/core';

const css = `
:root {
  --app-color-primary: #3b82f6;
  --app-color-secondary: #8b5cf6;
  --app-spacing-md: 1rem;
}
.button {
  background: var(--app-color-primary);
  padding: var(--app-spacing-md);
}
`;

const shortened = TokenMinifier.shortenCSSNames(css, 'app');

console.log('Shortened CSS:', shortened.output);
console.log('Savings:', shortened.savingsPercent.toFixed(2) + '%');
```

**Output:**
```
Shortened CSS:
:root {
  --app-a: #3b82f6;
  --app-b: #8b5cf6;
  --app-c: 1rem;
}
.button {
  background: var(--app-a);
  padding: var(--app-c);
}
Savings: 18.52%
```

---

## Combined Optimization

### Maximum Size Reduction

```typescript
import { GzipCompressor, TokenMinifier } from '@tokiforge/core';

// 1. Tree-shake unused tokens
const usedPaths = ['color.primary', 'spacing.md'];
const optimized = TokenMinifier.treeShake(tokens, usedPaths);

// 2. Minify JSON
const minified = TokenMinifier.minifyJSON(optimized);

// 3. Compress with Gzip
const compressed = await GzipCompressor.compress(
  JSON.parse(minified.output)
);

console.log('Original size:', tokens);
console.log('After tree-shaking:', optimized);
console.log('After minification:', minified.minifiedSize, 'bytes');
console.log('After compression:', compressed.compressedSize, 'bytes');
console.log('Total reduction:', 
  ((1 - compressed.compressedSize / minified.originalSize) * 100).toFixed(2) + '%'
);
```

---

## Production Build Script

### Optimize Tokens for Production

```typescript
// scripts/optimize-tokens.ts
import { writeFileSync } from 'fs';
import { GzipCompressor, TokenMinifier } from '@tokiforge/core';
import tokens from '../tokens.json';

async function optimizeTokens() {
  // 1. Tree-shake (if you track usage)
  const usedTokens = [
    // List of actually used tokens
    'color.primary',
    'color.secondary',
    'spacing.md',
  ];
  
  const optimized = TokenMinifier.treeShake(tokens, usedTokens);
  
  // 2. Minify
  const minified = TokenMinifier.minifyJSON(optimized);
  
  // 3. Compress
  const compressed = await GzipCompressor.compress(
    JSON.parse(minified.output)
  );
  
  // 4. Encode to base64 for embedding
  const base64 = await GzipCompressor.compressToBase64(
    JSON.parse(minified.output)
  );
  
  // Save outputs
  writeFileSync('dist/tokens.min.json', minified.output);
  writeFileSync('dist/tokens.gz', compressed.data);
  writeFileSync('dist/tokens.base64.txt', base64);
  
  // Print stats
  const stats = TokenCompressor.getStats(tokens, compressed);
  console.log('Optimization complete!');
  console.log(`Original: ${stats.originalSizeKB} KB`);
  console.log(`Compressed: ${stats.compressedSizeKB} KB`);
  console.log(`Savings: ${stats.savings}`);
}

optimizeTokens();
```

---

## CDN Deployment

### Serve Compressed Tokens from CDN

```typescript
// server/deploy-tokens.ts
import { GzipCompressor } from '@tokiforge/core';
import tokens from '../tokens.json';

async function deployToCDN() {
  // Compress tokens
  const compressed = await GzipCompressor.compress(tokens);
  
  // Upload to CDN (example with AWS S3)
  await uploadToS3({
    bucket: 'my-tokens',
    key: 'tokens/v1.0.0.gz',
    body: compressed.data,
    contentType: 'application/gzip',
    contentEncoding: 'gzip',
  });
  
  console.log('Tokens deployed to CDN!');
  console.log('URL: https://cdn.example.com/tokens/v1.0.0.gz');
}
```

---

## Runtime Loading

### Load Compressed Tokens at Runtime

```typescript
import { GzipCompressor } from '@tokiforge/core';

async function loadTokens() {
  // Fetch compressed tokens from CDN
  const response = await fetch('https://cdn.example.com/tokens/v1.0.0.gz');
  const arrayBuffer = await response.arrayBuffer();
  const compressed = new Uint8Array(arrayBuffer);
  
  // Decompress
  const tokens = await GzipCompressor.autoDecompress(compressed);
  
  return tokens;
}

// Use in your app
const tokens = await loadTokens();
```

---

## Performance Comparison

### Before vs After Optimization

```typescript
import { GzipCompressor, TokenMinifier } from '@tokiforge/core';

async function comparePerformance() {
  const largeTokens = generateLargeTokenSet(1000); // 1000 tokens
  
  // Before optimization
  const originalSize = JSON.stringify(largeTokens).length;
  
  // After minification
  const minified = TokenMinifier.minifyJSON(largeTokens);
  
  // After compression
  const compressed = await GzipCompressor.compress(largeTokens);
  
  console.log('Performance Comparison:');
  console.log('Original:', (originalSize / 1024).toFixed(2), 'KB');
  console.log('Minified:', (minified.minifiedSize / 1024).toFixed(2), 'KB',
    `(${minified.savingsPercent.toFixed(2)}% smaller)`);
  console.log('Compressed:', (compressed.compressedSize / 1024).toFixed(2), 'KB',
    `(${compressed.compressionRatio.toFixed(2)}% smaller)`);
}
```

**Typical Results:**
```
Performance Comparison:
Original: 50.00 KB
Minified: 31.25 KB (37.50% smaller)
Compressed: 12.50 KB (75.00% smaller)
```
