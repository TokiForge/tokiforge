import { describe, it, expect } from 'vitest';
import { FigmaDiff } from '../figma-diff';
import { CICDValidator } from '../cicd-validator';
import { IDESupport } from '../ide-support';
import type { DesignTokens } from '../types';

const codeTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    text: { value: '#111111', type: 'color' },
    background: { value: '#FFFFFF', type: 'color' },
  },
};

const figmaTokens: DesignTokens = {
  color: {
    primary: { value: '#6D28D9', type: 'color' },
    text: { value: '#111111', type: 'color' },
    background: { value: '#FFFFFF', type: 'color' },
    accent: { value: '#06B6D4', type: 'color' },
  },
};

describe('FigmaDiff', () => {
  it('reports added, changed, and matching paths', () => {
    const diff = FigmaDiff.compare(figmaTokens, codeTokens);
    expect(diff.added).toContain('color.accent');
    expect(diff.changed.some((c) => c.path === 'color.primary')).toBe(true);
    expect(diff.matches).toContain('color.text');
    expect(FigmaDiff.hasMismatches(diff)).toBe(true);
  });

  it('syncs with merge strategy keeping code-only tokens and applying Figma changes', () => {
    const withExtra: DesignTokens = {
      color: {
        ...codeTokens.color as Record<string, unknown>,
        legacy: { value: '#000000', type: 'color' },
      },
    } as DesignTokens;

    const synced = FigmaDiff.sync(withExtra, figmaTokens, { strategy: 'merge' }) as Record<
      string,
      Record<string, { value: string }>
    >;
    expect(synced.color.primary.value).toBe('#6D28D9');
    expect(synced.color.accent.value).toBe('#06B6D4');
    expect(synced.color.legacy.value).toBe('#000000');
  });

  it('code-wins keeps local conflict values while still adding Figma-only tokens', () => {
    const synced = FigmaDiff.sync(codeTokens, figmaTokens, { strategy: 'code-wins' }) as Record<
      string,
      Record<string, { value: string }>
    >;
    expect(synced.color.primary.value).toBe('#7C3AED');
    expect(synced.color.accent.value).toBe('#06B6D4');
  });
});

describe('CICDValidator', () => {
  it('passes a well-formed token set', () => {
    const result = CICDValidator.validate(codeTokens);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('flags null token values', () => {
    const bad: DesignTokens = {
      color: { primary: { value: null as unknown as string, type: 'color' } },
    };
    const result = CICDValidator.validate(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('warns on text/background contrast failures when accessibility is enabled', () => {
    const tokens: DesignTokens = {
      color: {
        text: { value: '#cccccc', type: 'color' },
        background: { value: '#ffffff', type: 'color' },
      },
    };
    const result = CICDValidator.validate(tokens, { checkAccessibility: true });
    expect(result.warnings.some((w) => w.includes('fail WCAG'))).toBe(true);
  });

  it('reports deprecated tokens', () => {
    const tokens: DesignTokens = {
      color: {
        primary: { value: '#000', type: 'color', deprecated: true },
      },
    };
    const result = CICDValidator.validate(tokens, { checkDeprecated: true, strict: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Deprecated'))).toBe(true);
  });
});

describe('IDESupport', () => {
  it('provides hover, completion, and definition for token paths', () => {
    const ide = new IDESupport();
    ide.loadTokens(codeTokens);

    expect(ide.getHoverInfo('color.primary')).toEqual({
      path: 'color.primary',
      value: '#7C3AED',
      type: 'color',
      description: undefined,
    });

    const completions = ide.getCompletions('color.');
    expect(completions.map((c) => c.label)).toEqual(
      expect.arrayContaining(['color.primary', 'color.text', 'color.background'])
    );

    expect(ide.getDefinition('color.text')?.value).toBe('#111111');
    expect(ide.getHoverInfo('missing.path')).toBeNull();
  });
});
