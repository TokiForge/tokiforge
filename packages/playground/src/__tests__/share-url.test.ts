import { describe, it, expect } from 'vitest';
import { buildShareUrl, readTokensFromUrl } from '../share-url';
import type { DesignTokens } from '@tokiforge/core';

const tokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color', description: 'Ünïcode déscription ✨' },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
  },
};

describe('share-url', () => {
  it('round-trips tokens through a share URL', () => {
    const url = buildShareUrl(tokens);
    const search = new URL(url).search;

    expect(readTokensFromUrl(search)).toEqual(tokens);
  });

  it('survives unicode in descriptions (plain btoa would throw)', () => {
    expect(() => buildShareUrl(tokens)).not.toThrow();
  });

  it('reads legacy plain-btoa links', () => {
    const asciiTokens: DesignTokens = { color: { primary: { value: '#111111', type: 'color' } } };
    const legacy = `?tokens=${encodeURIComponent(btoa(JSON.stringify(asciiTokens)))}`;

    expect(readTokensFromUrl(legacy)).toEqual(asciiTokens);
  });

  it('returns null when the param is absent or malformed', () => {
    expect(readTokensFromUrl('')).toBeNull();
    expect(readTokensFromUrl('?tokens=%%%garbage')).toBeNull();
  });
});
