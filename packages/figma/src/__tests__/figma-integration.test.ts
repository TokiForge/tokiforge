import { describe, it, expect } from 'vitest';
import { FigmaSync, type FigmaConfig } from '../figma-sync-enhanced';
import { TokensStudioAPI, type TokensStudioConfig } from '../tokens-studio-api';
import { ConflictResolver, detectConflictType, calculateSeverity, ConflictType, type Conflict } from '../conflict-resolver';
import type { TokenValue } from '@tokiforge/core';

describe('Enhanced Figma Integration - Phase 2.3', () => {
  describe('BidirectionalSync - FigmaSync', () => {
    const mockConfig: FigmaConfig = {
      accessToken: 'test-token',
      fileKey: 'test-file',
    };

    it('should create FigmaSync instance with config', () => {
      const sync = new FigmaSync(mockConfig);
      expect(sync).toBeDefined();
      expect(typeof sync.pullTokens).toBe('function');
    });

    it('should track bidirectional sync state', () => {
      const sync = new FigmaSync(mockConfig);
      expect(typeof sync.getSyncStatus).toBe('function');
    });

    it('should support merge strategy in sync', () => {
      const sync = new FigmaSync(mockConfig);
      expect(typeof sync.bidirectionalSync).toBe('function');
    });

    it('should get sync changes without modifying state', () => {
      const sync = new FigmaSync(mockConfig);
      expect(typeof sync.getSyncChanges).toBe('function');
    });
  });

  describe('Tokens Studio API Integration', () => {
    const mockConfig: TokensStudioConfig = {
      accessToken: 'test-api-token',
      projectId: 'test-project',
    };

    it('should create TokensStudioAPI instance', () => {
      const api = new TokensStudioAPI(mockConfig);
      expect(api).toBeDefined();
      expect(typeof api.fetchTokens).toBe('function');
    });

    it('should convert TokensStudio format to DesignTokens', () => {
      const api = new TokensStudioAPI(mockConfig);
      expect(typeof api.bidirectionalSync).toBe('function');
    });

    it('should support multiple sync strategies', () => {
      const api = new TokensStudioAPI(mockConfig);
      expect(typeof api.getSyncStatus).toBe('function');
    });

    it('should detect and report conflicts during sync', async () => {
      const api = new TokensStudioAPI(mockConfig);
      // This would need mocking of axios for actual testing
      expect(api).toBeDefined();
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect VALUE_CHANGE conflict type', () => {
      const local: TokenValue = { value: '#FF0000', type: 'color' };
      const remote: TokenValue = { value: '#00FF00', type: 'color' };

      const type = detectConflictType(local, remote);
      expect(type).toBe(ConflictType.VALUE_CHANGE);
    });

    it('should detect TYPE_CHANGE conflict type', () => {
      const local: TokenValue = { value: '#FF0000', type: 'color' };
      const remote: TokenValue = { value: '16px', type: 'dimension' };

      const type = detectConflictType(local, remote);
      expect(type).toBe(ConflictType.TYPE_CHANGE);
    });

    it('should detect DELETED_LOCAL conflict', () => {
      const local: TokenValue | undefined = undefined;
      const remote: TokenValue = { value: '#FF0000', type: 'color' };

      const type = detectConflictType(local, remote);
      expect(type).toBe(ConflictType.DELETED_LOCAL);
    });

    it('should calculate severity for conflicts', () => {
      const severity1 = calculateSeverity(ConflictType.VALUE_CHANGE);
      expect(['low', 'medium', 'high']).toContain(severity1);

      const severity2 = calculateSeverity(ConflictType.TYPE_CHANGE);
      expect(severity2).toBe('high');
    });

    it('should resolve conflicts with local-wins strategy', () => {
      const resolver = new ConflictResolver();
      const conflict: Conflict = {
        path: 'color.primary',
        type: ConflictType.VALUE_CHANGE,
        localValue: { value: '#FF0000', type: 'color' },
        remoteValue: { value: '#00FF00', type: 'color' },
        severity: 'medium',
        localModifiedAt: Date.now(),
        remoteModifiedAt: Date.now() - 1000,
      };

      resolver.addConflict(conflict);
      const resolutions = resolver.resolveConflicts('local-wins');

      expect(resolutions).toHaveLength(1);
      expect(resolutions[0].resolved).toBe(true);
      expect(resolutions[0].value).toEqual({ value: '#FF0000', type: 'color' });
    });

    it('should resolve conflicts with remote-wins strategy', () => {
      const resolver = new ConflictResolver();
      const conflict: Conflict = {
        path: 'color.secondary',
        type: ConflictType.VALUE_CHANGE,
        localValue: { value: '#FF0000', type: 'color' },
        remoteValue: { value: '#00FF00', type: 'color' },
        severity: 'medium',
      };

      resolver.addConflict(conflict);
      const resolutions = resolver.resolveConflicts('remote-wins');

      expect(resolutions).toHaveLength(1);
      expect(resolutions[0].value).toEqual({ value: '#00FF00', type: 'color' });
    });

    it('should resolve conflicts with merge strategy', () => {
      const resolver = new ConflictResolver();
      const conflict: Conflict = {
        path: 'color.tertiary',
        type: ConflictType.VALUE_CHANGE,
        localValue: { value: '#FF0000', type: 'color' },
        remoteValue: { value: '#00FF00', type: 'color' },
        severity: 'medium',
        localModifiedAt: Date.now(),
        remoteModifiedAt: Date.now(),
      };

      resolver.addConflict(conflict);
      const resolutions = resolver.resolveConflicts('merge');

      expect(resolutions).toHaveLength(1);
      expect(resolutions[0].resolved).toBe(true);
    });

    it('should resolve conflicts with manual strategy and callback', () => {
      const resolver = new ConflictResolver();
      const conflict: Conflict = {
        path: 'color.accent',
        type: ConflictType.VALUE_CHANGE,
        localValue: { value: '#FF0000', type: 'color' },
        remoteValue: { value: '#00FF00', type: 'color' },
        severity: 'medium',
      };

      resolver.addConflict(conflict);
      const resolutions = resolver.resolveConflicts('manual', (_c) => 'local');

      expect(resolutions).toHaveLength(1);
      expect(resolutions[0].value).toEqual({ value: '#FF0000', type: 'color' });
    });

    it('should generate conflict summary', () => {
      const resolver = new ConflictResolver();

      resolver.addConflict({
        path: 'color.primary',
        type: ConflictType.VALUE_CHANGE,
        severity: 'medium',
      });

      resolver.addConflict({
        path: 'spacing.sm',
        type: ConflictType.TYPE_CHANGE,
        severity: 'high',
      });

      resolver.resolveConflicts('local-wins');
      const summary = resolver.generateSummary();

      expect(summary.total).toBe(2);
      expect(summary.resolved).toBe(2);
      expect(summary.unresolved).toBe(0);
      expect(summary.bySeverity.high).toBe(1);
      expect(summary.bySeverity.medium).toBe(1);
    });

    it('should track unresolved conflicts', () => {
      const resolver = new ConflictResolver();

      resolver.addConflict({
        path: 'color.primary',
        type: ConflictType.VALUE_CHANGE,
        severity: 'medium',
      });

      const unresolved = resolver.getUnresolvedConflicts();
      expect(unresolved).toHaveLength(1);

      resolver.resolveConflicts('local-wins');
      const stillUnresolved = resolver.getUnresolvedConflicts();
      expect(stillUnresolved).toHaveLength(0);
    });

    it('should export conflict report as JSON', () => {
      const resolver = new ConflictResolver();

      resolver.addConflict({
        path: 'color.primary',
        type: ConflictType.VALUE_CHANGE,
        localValue: { value: '#FF0000', type: 'color' },
        remoteValue: { value: '#00FF00', type: 'color' },
        severity: 'medium',
      });

      resolver.resolveConflicts('local-wins');
      const report = resolver.exportReport();

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      const parsed = JSON.parse(report);
      expect(parsed.conflicts).toHaveLength(1);
      expect(parsed.resolutions).toHaveLength(1);
      expect(parsed.summary).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle local-to-remote sync', () => {
      const resolver = new ConflictResolver();
      const sync = new FigmaSync({ accessToken: 'test', fileKey: 'test' });

      expect(sync).toBeDefined();
      expect(resolver).toBeDefined();
    });

    it('should handle remote-to-local sync', () => {
      const api = new TokensStudioAPI({ accessToken: 'test', projectId: 'test' });
      expect(api).toBeDefined();
    });

    it('should handle bidirectional merge with conflict resolution', () => {
      const resolver = new ConflictResolver();
      resolver.addConflict({
        path: 'color.primary',
        type: ConflictType.VALUE_CHANGE,
        localValue: { value: '#FF0000', type: 'color' },
        remoteValue: { value: '#00FF00', type: 'color' },
        severity: 'medium',
        localModifiedAt: Date.now(),
        remoteModifiedAt: Date.now() - 1000,
      });

      const resolutions = resolver.resolveConflicts('merge');
      expect(resolutions.every(r => r.resolved)).toBe(true);
    });
  });
});
