/** @type {import('@tokiforge/core').Plugin} */
export const sketchPalettePlugin = {
  name: 'sketch-palette-json',
  exporter(tokens) {
    const colors = [];
    const walk = (obj, path) => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
      if ('value' in obj && typeof obj.type === 'string') {
        if (obj.type === 'color' && typeof obj.value === 'string') {
          colors.push({ name: path || 'color', hex: obj.value });
        }
        return;
      }
      for (const key of Object.keys(obj)) {
        walk(obj[key], path ? `${path}/${key}` : key);
      }
    };
    walk(tokens, '');
    return JSON.stringify(
      { compatibleVersion: '2.0', pluginVersion: 'tokiforge-example', colors },
      null,
      2
    );
  },
};
