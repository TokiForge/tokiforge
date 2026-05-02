import { pluginManager } from '@tokiforge/core';
import { framerTokensPlugin } from './plugins/framer.mjs';
import { sketchPalettePlugin } from './plugins/sketch.mjs';
import { adobeXdCssPlugin } from './plugins/adobe-xd.mjs';

function main() {
  pluginManager.register(framerTokensPlugin);
  pluginManager.register(sketchPalettePlugin);
  pluginManager.register(adobeXdCssPlugin);

  const sample = {
    color: {
      brand: { value: '#7C3AED', type: 'color' },
      ink: { value: '#111827', type: 'color' },
    },
    spacing: {
      md: { value: 16, type: 'spacing' },
    },
  };

  console.log('=== framer-style-ts ===\n');
  console.log(pluginManager.export(sample, 'framer-style-ts'));
  console.log('\n=== sketch-palette-json ===\n');
  console.log(pluginManager.export(sample, 'sketch-palette-json'));
  console.log('\n=== adobe-xd-root-css ===\n');
  console.log(pluginManager.export(sample, 'adobe-xd-root-css'));
}

main();
