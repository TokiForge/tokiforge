# @tokiforge/design-tools

Design tool integrations for TokiForge (Sketch, Adobe XD).

## Installation

```bash
npm install @tokiforge/design-tools @tokiforge/core
```

## Sketch Integration

```typescript
import { SketchAdapter } from '@tokiforge/design-tools/sketch';

const adapter = new SketchAdapter({
  pluginContext: sketchPluginContext, // From Sketch plugin
});

// Export tokens to Sketch
await adapter.exportToSketch(tokens);

// Import tokens from Sketch
const tokens = await adapter.importFromSketch();
```

## Adobe XD Integration

```typescript
import { AdobeXDAdapter } from '@tokiforge/design-tools/adobe-xd';

const adapter = new AdobeXDAdapter({
  pluginContext: xdPluginContext, // From XD plugin
});

// Export tokens to Adobe XD
await adapter.exportToXD(tokens);

// Import tokens from Adobe XD
const tokens = await adapter.importFromXD();
```

## Note

These integrations require plugin contexts from their respective design tools. They must be used within Sketch or Adobe XD plugins.

## License

AGPL-3.0

