# @tokiforge/figma

Figma integration for TokiForge design tokens. Sync tokens between Figma and your codebase.

## Installation

```bash
npm install @tokiforge/figma @tokiforge/core
```

## Setup

1. Get your Figma Personal Access Token:
   - Go to Figma Settings → Account → Personal Access Tokens
   - Create a new token

2. Get your Figma File Key:
   - Open your Figma file
   - The file key is in the URL: `https://www.figma.com/file/{FILE_KEY}/...`

## Usage

### Pull tokens from Figma

```typescript
import { pullFromFigma } from '@tokiforge/figma';

const tokens = await pullFromFigma({
  accessToken: 'your-figma-token',
  fileKey: 'your-file-key',
});

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
```

### Push tokens to Figma

```typescript
import { pushToFigma } from '@tokiforge/figma';

await pushToFigma('./tokens.json', {
  accessToken: 'your-figma-token',
  fileKey: 'your-file-key',
});
```

## CLI Usage

```bash
# Pull from Figma
tokiforge figma:pull --token YOUR_TOKEN --file-key FILE_KEY

# Push to Figma
tokiforge figma:push --token YOUR_TOKEN --file-key FILE_KEY
```

## Note

Figma API has limitations for creating styles. For full bidirectional sync, use the Figma plugin (coming soon).

