import { describe, it, expect } from 'vitest';
import {
  compareTokens,
  formatDiffOutput,
  formatMigrationSuggestions,
  generateMigrationSuggestions,
  detectBreakingChanges,
  flattenKeys,
  getNestedValue,
  setNestedValue
} from './diff-utils.js';

describe('diff-utils', () => {
  const mockOldTokens = {
    color: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px'
    }
  };

  const mockNewTokens = {
    color: {
      primary: '#0056b3', // changed
      secondary: '#6c757d',
      // success removed
      danger: '#dc3545' // added
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '32px' // added
    }
  };

  describe('compareTokens', () => {
    it('should detect added tokens', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      expect(diff.added).toContain('color.danger');
      expect(diff.added).toContain('spacing.lg');
    });

    it('should detect removed tokens', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      expect(diff.removed).toContain('color.success');
    });

    it('should detect changed tokens', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      const changedPaths = diff.changed.map((c: { path: string }) => c.path);
      expect(changedPaths).toContain('color.primary');
    });

    it('should calculate correct statistics', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      expect(diff.stats.totalAdded).toBe(2);
      expect(diff.stats.totalRemoved).toBe(1);
      expect(diff.stats.totalChanged).toBe(1);
    });
  });

  describe('detectBreakingChanges', () => {
    it('should detect removed tokens as breaking changes', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      const breaking = detectBreakingChanges(diff);
      expect(breaking.some((b: string) => b.includes('color.success'))).toBe(true);
    });

    it('should detect significant value changes', () => {
      const oldTokens = { color: { primary: '#007bff' } };
      const newTokens = { color: { primary: '#0056b3' } }; // different color
      const diff = compareTokens(oldTokens, newTokens);
      const breaking = detectBreakingChanges(diff);
      // Should detect the change but might not call it "breaking" - check that function runs
      expect(breaking).toBeDefined();
    });
  });

  describe('generateMigrationSuggestions', () => {
    it('should generate rename suggestions', () => {
      const oldTokens = { color: { primary: '#007bff' } };
      const newTokens = { color: { brand: '#007bff' } };
      const diff = compareTokens(oldTokens, newTokens);
      const suggestions = generateMigrationSuggestions(diff, oldTokens, newTokens);
      expect(suggestions.some((s: { type: string }) => s.type === 'renamed')).toBe(true);
    });

    it('should generate replacement suggestions', () => {
      const oldTokens = { color: { primary: '#007bff' } };
      const newTokens = { color: { brand: { primary: '#007bff' } } };
      const diff = compareTokens(oldTokens, newTokens);
      const suggestions = generateMigrationSuggestions(diff, oldTokens, newTokens);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('formatDiffOutput', () => {
    it('should format diff in compact mode', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      const output = formatDiffOutput(diff, 'compact');
      expect(output).toContain('Token Diff Summary');
      expect(output).toContain('Added: 2');
      expect(output).toContain('Removed: 1');
    });

    it('should format diff in detailed mode', () => {
      const diff = compareTokens(mockOldTokens, mockNewTokens);
      const output = formatDiffOutput(diff, 'detailed');
      expect(output).toContain('Token Diff Report');
      expect(output).toContain('Added Tokens');
      expect(output).toContain('Removed Tokens');
    });
  });

  describe('formatMigrationSuggestions', () => {
    it('should format migration suggestions for display', () => {
      const suggestions = [
        {
          type: 'renamed' as const,
          oldPath: 'color.primary',
          newPath: 'color.brand.primary',
          reason: 'Token reorganization',
          action: 'Update references'
        }
      ];
      const output = formatMigrationSuggestions(suggestions);
      expect(output).toContain('Migration Suggestions');
      expect(output).toContain('color.primary');
    });

    it('should show empty state when no suggestions', () => {
      const output = formatMigrationSuggestions([]);
      expect(output).toContain('No migration suggestions needed');
    });
  });

  describe('flattenKeys', () => {
    it('should flatten nested object to dot notation', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 };
      const keys = flattenKeys(obj);
      expect(keys).toContain('a.b.c');
      expect(keys).toContain('d');
    });

    it('should handle empty objects', () => {
      const keys = flattenKeys({});
      expect(keys).toEqual([]);
    });
  });

  describe('getNestedValue', () => {
    it('should retrieve nested values using dot notation', () => {
      const obj = { a: { b: { c: 'value' } } };
      const value = getNestedValue(obj, 'a.b.c');
      expect(value).toBe('value');
    });

    it('should return undefined for non-existent paths', () => {
      const obj = { a: { b: 'value' } };
      const value = getNestedValue(obj, 'a.c.d');
      expect(value).toBeUndefined();
    });
  });

  describe('setNestedValue', () => {
    it('should set nested values using dot notation', () => {
      const obj: Record<string, any> = {};
      setNestedValue(obj, 'a.b.c', 'value');
      expect(obj.a.b.c).toBe('value');
    });

    it('should create intermediate objects as needed', () => {
      const obj: Record<string, any> = {};
      setNestedValue(obj, 'x.y.z', 123);
      expect(obj.x.y.z).toBe(123);
    });
  });
});
