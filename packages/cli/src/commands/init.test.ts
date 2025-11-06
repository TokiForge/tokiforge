import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { initCommand } from './init';

describe('initCommand', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tokiforge-init-test-'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should create tokens.json and config.json', async () => {
    await initCommand(tempDir);

    const tokensPath = path.join(tempDir, 'tokens.json');
    const configPath = path.join(tempDir, 'tokiforge.config.json');

    expect(fs.existsSync(tokensPath)).toBe(true);
    expect(fs.existsSync(configPath)).toBe(true);

    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    expect(tokens.color).toBeDefined();
    expect(config.input).toBe('./tokens.json');
    expect(config.output).toBeDefined();
  });

  it('should not overwrite existing files', async () => {
    const tokensPath = path.join(tempDir, 'tokens.json');
    const existingTokens = { color: { custom: { value: '#FF0000', type: 'color' } } };
    fs.writeFileSync(tokensPath, JSON.stringify(existingTokens, null, 2));

    await initCommand(tempDir);

    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    expect(tokens.color.custom).toBeDefined();
    expect(tokens.color.primary).toBeUndefined();
  });
});

