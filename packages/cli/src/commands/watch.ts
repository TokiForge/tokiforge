import fs from 'fs';
import path from 'path';

export async function watchCommand(input = 'tokens.json', output = 'tokens.generated', debounce = 300) {
  try {
    if (!fs.existsSync(input)) {
      throw new Error(`Tokens file not found: ${input}`);
    }

    console.log(`👀 Watching ${input} for changes...`);
    console.log(`💾 Output directory: ${output}`);

    // eslint-disable-next-line no-undef
    let timeout: NodeJS.Timeout;
    let lastContent = fs.readFileSync(input, 'utf-8');

    const handleChange = async () => {
      try {
        const newContent = fs.readFileSync(input, 'utf-8');

        if (newContent === lastContent) {
          return;
        }

        lastContent = newContent;
        const tokens = JSON.parse(newContent);

        // Create output directory if it doesn't exist
        if (!fs.existsSync(output)) {
          fs.mkdirSync(output, { recursive: true });
        }

        // Generate various export formats
        await generateFormats(tokens, output);

        console.log(`✅ [${new Date().toLocaleTimeString()}] Tokens updated`);
      } catch (error) {
        console.error(`❌ Error processing tokens:`, error);
      }
    };

    const watcher = fs.watch(input, () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleChange, debounce);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watch...');
      watcher.close();
      process.exit(0);
    });

    // Initial generation
    await handleChange();
  } catch (error) {
    console.error(`❌ Error starting watch:`, error);
    process.exit(1);
  }
}

async function generateFormats(tokens: any, outputDir: string) {
  // Generate TypeScript
  const ts = generateTypeScript(tokens);
  fs.writeFileSync(path.join(outputDir, 'tokens.ts'), ts);

  // Generate JSON
  fs.writeFileSync(
    path.join(outputDir, 'tokens.json'),
    JSON.stringify(tokens, null, 2)
  );

  // Generate CSS
  const css = generateCSS(tokens);
  fs.writeFileSync(path.join(outputDir, 'tokens.css'), css);

  // Generate SCSS
  const scss = generateSCSS(tokens);
  fs.writeFileSync(path.join(outputDir, 'tokens.scss'), scss);
}

function generateTypeScript(tokens: any): string {
  return `// Auto-generated on ${new Date().toISOString()}

export const tokens = ${JSON.stringify(tokens, null, 2)};

export type Tokens = typeof tokens;
`;
}

function generateCSS(tokens: any): string {
  const lines: string[] = [':root {'];

  const flatten = (obj: any, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}-${key}` : key;

      if (value && typeof value === 'object' && !('value' in value)) {
        flatten(value, fullKey);
      } else if (value && typeof value === 'object' && 'value' in value) {
        lines.push(`  --${fullKey}: ${value.value};`);
      }
    }
  };

  flatten(tokens);
  lines.push('}');

  return lines.join('\n');
}

function generateSCSS(tokens: any): string {
  const lines: string[] = [];

  const flatten = (obj: any, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      const scssVar = fullKey.replace(/-/g, '_').toLowerCase();

      if (value && typeof value === 'object' && !('value' in value)) {
        flatten(value, fullKey);
      } else if (value && typeof value === 'object' && 'value' in value) {
        lines.push(`$${scssVar}: ${value.value};`);
      }
    }
  };

  flatten(tokens);
  return lines.join('\n');
}
