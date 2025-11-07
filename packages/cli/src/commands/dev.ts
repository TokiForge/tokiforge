import * as fs from 'fs';
import * as path from 'path';
import { createServer } from 'http';
import { TokenParser } from '@tokiforge/core';
import chokidar from 'chokidar';

const PORT = 3000;

export async function devCommand(projectPath: string = process.cwd()): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const inputPath = path.resolve(projectPath, config.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`Token file not found: ${inputPath}`);
    process.exit(1);
  }

  const generateHTML = (tokens: any) => {
    const themes = config.themes || [{ name: 'default', tokens }];
    const themeOptions = themes.map((t: any) => `<option value="${t.name}">${t.name}</option>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TokiForge Theme Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2rem;
      background: var(--hf-color-background-default, #fff);
      color: var(--hf-color-text-primary, #000);
      transition: background 0.3s, color 0.3s;
    }
    .controls {
      margin-bottom: 2rem;
      padding: 1rem;
      background: var(--hf-color-background-muted, #f5f5f5);
      border-radius: var(--hf-radius-md, 8px);
    }
    select {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border: 2px solid var(--hf-color-primary, #7C3AED);
      border-radius: var(--hf-radius-sm, 4px);
      background: var(--hf-color-background-default, #fff);
      color: var(--hf-color-text-primary, #000);
    }
    .preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .card {
      padding: 1.5rem;
      border-radius: var(--hf-radius-lg, 12px);
      background: var(--hf-color-background-default, #fff);
      border: 1px solid var(--hf-color-primary, #7C3AED);
    }
    .color-swatch {
      width: 100%;
      height: 100px;
      border-radius: var(--hf-radius-md, 8px);
      margin-bottom: 0.5rem;
    }
    .token-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .token-value {
      font-family: monospace;
      font-size: 0.875rem;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="controls">
    <label for="theme-select">Theme: </label>
    <select id="theme-select">${themeOptions}</select>
  </div>
  <div class="preview" id="preview"></div>
  <script>
    const tokens = ${JSON.stringify(tokens, null, 2)};
    const themes = ${JSON.stringify(themes, null, 2)};
    
    function renderPreview(themeName) {
      const theme = themes.find(t => t.name === themeName) || themes[0];
      const root = document.documentElement;
      const preview = document.getElementById('preview');
      
      // Apply CSS variables
      function applyTokens(obj, prefix = '') {
        for (const key in obj) {
          const value = obj[key];
          if (value && typeof value === 'object' && value.value !== undefined) {
            const cssVar = '--hf-' + (prefix ? prefix + '-' : '') + key.toLowerCase();
            root.style.setProperty(cssVar, value.value);
          } else if (value && typeof value === 'object') {
            applyTokens(value, prefix ? prefix + '-' + key : key);
          }
        }
      }
      
      applyTokens(theme.tokens);
      
      function renderColors(obj, prefix = '') {
        let html = '';
        for (const key in obj) {
          const value = obj[key];
          if (value && typeof value === 'object' && value.value !== undefined && value.type === 'color') {
            const fullKey = prefix ? prefix + '.' + key : key;
            html += \`
              <div class="card">
                <div class="color-swatch" style="background: \${value.value}"></div>
                <div class="token-name">\${fullKey}</div>
                <div class="token-value">\${value.value}</div>
              </div>
            \`;
          } else if (value && typeof value === 'object') {
            html += renderColors(value, prefix ? prefix + '.' + key : key);
          }
        }
        return html;
      }
      
      preview.innerHTML = renderColors(theme.tokens);
    }
    
    document.getElementById('theme-select').addEventListener('change', (e) => {
      renderPreview(e.target.value);
    });
    
    renderPreview('${themes[0]?.name || 'default'}');
  </script>
</body>
</html>`;
  };

  const server = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(generateHTML(TokenParser.parse(inputPath)));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(PORT, () => {
    console.log(`\nTokiForge Dev Server running at http://localhost:${PORT}`);
    console.log('Watching for token changes...\n');
  });

  // Watch for changes
  const watcher = chokidar.watch(inputPath, { persistent: true });
  watcher.on('change', () => {
    console.log('Token file changed, reloading...');
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    watcher.close();
    server.close();
    process.exit(0);
  });
}

