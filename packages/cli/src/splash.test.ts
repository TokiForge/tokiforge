import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { showSplash, showCompactSplash } from './splash';

function getPackageVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

describe('Splash Screen', () => {
  it('should display splash screen', () => {
    const version = getPackageVersion();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    showSplash();
    
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.flat().join('\n');
    expect(calls).toContain('TokiForge');
    expect(calls).toContain(version);
    
    consoleSpy.mockRestore();
  });

  it('should display compact splash', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    showCompactSplash();
    
    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('TokiForge');
    
    consoleSpy.mockRestore();
  });
});

