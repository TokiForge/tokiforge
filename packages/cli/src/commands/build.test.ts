import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { buildCommand } from './build';

describe('buildCommand', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tokiforge-build-test-'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`Process exit: ${code}`);
    });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should build tokens when config exists', async () => {
    // Create config
    const configPath = path.join(tempDir, 'tokiforge.config.json');
    const tokensPath = path.join(tempDir, 'tokens.json');
    const tokens = {
      color: {
        primary: { value: '#7C3AED', type: 'color' },
      },
    };

    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    fs.writeFileSync(configPath, JSON.stringify({
      input: './tokens.json',
      output: {
        css: './dist/tokens.css',
        js: './dist/tokens.js',
      },
    }, null, 2));

    await buildCommand(tempDir);

    const cssPath = path.join(tempDir, 'dist/tokens.css');
    const jsPath = path.join(tempDir, 'dist/tokens.js');

    expect(fs.existsSync(cssPath)).toBe(true);
    expect(fs.existsSync(jsPath)).toBe(true);

    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain(':root {');
    expect(css).toContain('--hf-color-primary');
  });

  it('should throw error when config not found', async () => {
    await expect(buildCommand(tempDir)).rejects.toThrow();
  });

  it('should throw error when tokens file not found', async () => {
    const configPath = path.join(tempDir, 'tokiforge.config.json');
    fs.writeFileSync(configPath, JSON.stringify({
      input: './nonexistent.json',
      output: { css: './dist/tokens.css' },
    }, null, 2));

    await expect(buildCommand(tempDir)).rejects.toThrow();
  });
});

