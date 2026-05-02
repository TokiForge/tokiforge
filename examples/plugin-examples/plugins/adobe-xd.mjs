/** @type {import('@tokiforge/core').Plugin} */
export const adobeXdCssPlugin = {
  name: 'adobe-xd-root-css',
  exporter(tokens) {
    const lines = [':root {'];
    const walk = (obj, path) => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
      if ('value' in obj) {
        const cssName = path.replace(/\./g, '-');
        lines.push(`  --xd-${cssName}: ${formatValue(obj)};`);
        return;
      }
      for (const key of Object.keys(obj)) {
        walk(obj[key], path ? `${path}.${key}` : key);
      }
    };
    walk(tokens, '');
    lines.push('}');
    return lines.join('\n');
  },
};

function formatValue(tv) {
  if (typeof tv.value === 'string' || typeof tv.value === 'number') return String(tv.value);
  return JSON.stringify(tv.value);
}
