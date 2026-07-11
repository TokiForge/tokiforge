import type { DesignTokens } from '@tokiforge/core';

const PARAM = 'tokens';

/** UTF-8-safe base64 (plain btoa throws on non-Latin1 token descriptions). */
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decodeBase64(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Build a shareable playground URL carrying the current tokens. */
export function buildShareUrl(tokens: DesignTokens): string {
  const encoded = encodeBase64(JSON.stringify(tokens));
  return `${window.location.origin}${window.location.pathname}?${PARAM}=${encodeURIComponent(encoded)}`;
}

/**
 * Read tokens from a share URL (?tokens=...). Returns null when the param is
 * absent or malformed. Also accepts legacy links produced with plain btoa.
 */
export function readTokensFromUrl(search: string = window.location.search): DesignTokens | null {
  const param = new URLSearchParams(search).get(PARAM);
  if (!param) return null;

  try {
    return JSON.parse(decodeBase64(param)) as DesignTokens;
  } catch {
    try {
      // Legacy links: plain btoa(JSON)
      return JSON.parse(atob(param)) as DesignTokens;
    } catch {
      console.warn('TokiForge: ignoring malformed ?tokens= share parameter');
      return null;
    }
  }
}
