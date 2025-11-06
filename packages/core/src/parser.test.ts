import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TokenParser } from './parser';
import type { DesignTokens } from './types';

describe('TokenParser', () => {
  let tempDir: string;
  let tokensFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tokiforge-test-'));
    tokensFile = path.join(tempDir, 'tokens.json');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('parse', () => {
    it('should parse valid JSON tokens', () => {
      const tokens: DesignTokens = {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
        },
      };

      fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
      const result = TokenParser.parse(tokensFile);

      expect(result).toEqual(tokens);
    });

    it('should parse YAML tokens', () => {
      const yamlFile = path.join(tempDir, 'tokens.yaml');
      const yamlContent = `
color:
  primary:
    value: "#7C3AED"
    type: color
`;

      fs.writeFileSync(yamlFile, yamlContent);
      const result = TokenParser.parse(yamlFile);

      expect(result.color.primary.value).toBe('#7C3AED');
    });

    it('should expand references', () => {
      const tokens: DesignTokens = {
        color: {
          base: { value: '#7C3AED', type: 'color' },
          primary: { value: '{color.base}', type: 'color' },
        },
      };

      fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
      const result = TokenParser.parse(tokensFile, { expandReferences: true });

      expect(result.color.primary.value).toBe('#7C3AED');
    });

    it('should skip validation when disabled', () => {
      const invalidTokens = {
        color: {
          primary: { invalid: 'value' },
        },
      };

      fs.writeFileSync(tokensFile, JSON.stringify(invalidTokens, null, 2));
      
      expect(() => {
        TokenParser.parse(tokensFile, { validate: false });
      }).not.toThrow();
    });

    it('should validate tokens by default', () => {
      const invalidTokens = {
        color: {
          primary: { value: null }, // Invalid value type
        },
      };

      fs.writeFileSync(tokensFile, JSON.stringify(invalidTokens, null, 2));
      
      expect(() => {
        TokenParser.parse(tokensFile);
      }).toThrow();
    });
  });

  describe('validate', () => {
    it('should validate correct token structure', () => {
      const tokens: DesignTokens = {
        color: {
          primary: { value: '#7C3AED', type: 'color' },
        },
      };

      expect(() => {
        TokenParser.validate(tokens);
      }).not.toThrow();
    });

    it('should throw for invalid token value', () => {
      const invalidTokens = {
        color: {
          primary: { value: null },
        },
      };

      expect(() => {
        TokenParser.validate(invalidTokens as any);
      }).toThrow();
    });
  });

  describe('expandReferences', () => {
    it('should expand simple references', () => {
      const tokens: DesignTokens = {
        color: {
          base: { value: '#7C3AED', type: 'color' },
          primary: { value: '{color.base}', type: 'color' },
        },
      };

      const result = TokenParser.expandReferences(tokens);
      expect(result.color.primary.value).toBe('#7C3AED');
    });

    it('should expand nested references', () => {
      const tokens: DesignTokens = {
        color: {
          base: { value: '#7C3AED', type: 'color' },
          primary: { value: '{color.base}', type: 'color' },
          main: { value: '{color.primary}', type: 'color' },
        },
      };

      const result = TokenParser.expandReferences(tokens);
      expect(result.color.main.value).toBe('#7C3AED');
    });

    it('should throw for invalid reference', () => {
      const tokens: DesignTokens = {
        color: {
          primary: { value: '{color.invalid}', type: 'color' },
        },
      };

      expect(() => {
        TokenParser.expandReferences(tokens);
      }).toThrow();
    });
  });
});

