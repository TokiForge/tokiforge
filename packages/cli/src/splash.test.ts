import { describe, it, expect, vi } from 'vitest';
import { showSplash, showCompactSplash } from './splash';

describe('Splash Screen', () => {
  it('should display splash screen', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    showSplash();
    
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.flat().join('\n');
    expect(calls).toContain('TokiForge');
    expect(calls).toContain('0.1.0');
    
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

