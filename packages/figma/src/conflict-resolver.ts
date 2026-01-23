import type { TokenValue } from '@tokiforge/core';

/**
 * Conflict resolution strategies
 */
export type ConflictStrategy = 'local-wins' | 'remote-wins' | 'merge' | 'manual';

/**
 * Conflict type enumeration
 */
export enum ConflictType {
  VALUE_CHANGE = 'value-change',
  TYPE_CHANGE = 'type-change',
  METADATA_CHANGE = 'metadata-change',
  DELETED_LOCAL = 'deleted-local',
  DELETED_REMOTE = 'deleted-remote',
  BOTH_ADDED = 'both-added',
}

/**
 * Conflict information
 */
export interface Conflict {
  path: string;
  type: ConflictType;
  localValue?: TokenValue;
  remoteValue?: TokenValue;
  localModifiedAt?: number;
  remoteModifiedAt?: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Conflict resolution result
 */
export interface ConflictResolution {
  path: string;
  resolved: boolean;
  strategy: ConflictStrategy;
  value?: TokenValue;
  reason?: string;
}

/**
 * Conflict resolution engine
 */
export class ConflictResolver {
  private conflicts: Conflict[] = [];
  private resolutions: Map<string, ConflictResolution> = new Map();

  /**
   * Add conflict to resolver
   */
  addConflict(conflict: Conflict): void {
    // Check if already exists
    const existing = this.conflicts.findIndex(c => c.path === conflict.path);
    if (existing >= 0) {
      this.conflicts[existing] = conflict;
    } else {
      this.conflicts.push(conflict);
    }
  }

  /**
   * Resolve conflicts with specified strategy
   */
  resolveConflicts(
    strategy: ConflictStrategy,
    callback?: (conflict: Conflict) => TokenValue | 'local' | 'remote'
  ): ConflictResolution[] {
    const results: ConflictResolution[] = [];

    for (const conflict of this.conflicts) {
      const resolution = this.resolveConflict(conflict, strategy, callback);
      results.push(resolution);
      this.resolutions.set(conflict.path, resolution);
    }

    return results;
  }

  /**
   * Resolve single conflict
   */
  private resolveConflict(
    conflict: Conflict,
    strategy: ConflictStrategy,
    callback?: (conflict: Conflict) => TokenValue | 'local' | 'remote'
  ): ConflictResolution {
    let value: TokenValue | undefined;
    let reason: string = '';

    switch (strategy) {
      case 'local-wins':
        value = conflict.localValue;
        reason = 'Local value selected (local-wins strategy)';
        break;

      case 'remote-wins':
        value = conflict.remoteValue;
        reason = 'Remote value selected (remote-wins strategy)';
        break;

      case 'manual':
        if (callback) {
          const result = callback(conflict);
          if (result === 'local') {
            value = conflict.localValue;
            reason = 'Manual resolution: local selected';
          } else if (result === 'remote') {
            value = conflict.remoteValue;
            reason = 'Manual resolution: remote selected';
          } else {
            value = result;
            reason = 'Manual resolution: custom value provided';
          }
        } else {
          // Fallback to remote-wins if no callback
          value = conflict.remoteValue;
          reason = 'Manual strategy selected but no callback provided, defaulting to remote';
        }
        break;

      case 'merge':
        const merged = this.mergeConflict(conflict);
        value = merged.value;
        reason = merged.reason;
        break;

      default:
        value = conflict.remoteValue;
        reason = 'Unknown strategy, defaulting to remote-wins';
    }

    return {
      path: conflict.path,
      resolved: value !== undefined,
      strategy,
      value,
      reason,
    };
  }

  /**
   * Merge conflicting values intelligently
   */
  private mergeConflict(conflict: Conflict): { value: TokenValue | undefined; reason: string } {
    const { type, localValue, remoteValue, localModifiedAt, remoteModifiedAt } = conflict;

    switch (type) {
      case ConflictType.VALUE_CHANGE:
        // Use more recent value
        if (localModifiedAt && remoteModifiedAt) {
          if (localModifiedAt > remoteModifiedAt) {
            return {
              value: localValue,
              reason: 'Merged: local value is more recent',
            };
          } else {
            return {
              value: remoteValue,
              reason: 'Merged: remote value is more recent',
            };
          }
        }
        // If no timestamps, prefer remote
        return {
          value: remoteValue,
          reason: 'Merged: defaulting to remote value',
        };

      case ConflictType.TYPE_CHANGE:
        // Type conflicts are dangerous, prefer local (code of record)
        return {
          value: localValue,
          reason: 'Merged: local type preferred (local is code of record)',
        };

      case ConflictType.METADATA_CHANGE:
        // Merge metadata while keeping value
        if (localValue && remoteValue && typeof localValue === 'object' && typeof remoteValue === 'object') {
          return {
            value: {
              ...localValue,
              ...remoteValue,
              value: (localValue as any).value || (remoteValue as any).value,
            },
            reason: 'Merged: combined metadata',
          };
        }
        return {
          value: localValue,
          reason: 'Merged: could not merge metadata, using local',
        };

      case ConflictType.DELETED_LOCAL:
        // Local deleted, remote has value
        return {
          value: remoteValue,
          reason: 'Merged: token deleted locally, keeping remote version',
        };

      case ConflictType.DELETED_REMOTE:
        // Remote deleted, local has value
        return {
          value: localValue,
          reason: 'Merged: token deleted remotely, keeping local version',
        };

      case ConflictType.BOTH_ADDED:
        // Both added new tokens with same path
        if (remoteModifiedAt && localModifiedAt) {
          if (remoteModifiedAt > localModifiedAt) {
            return {
              value: remoteValue,
              reason: 'Merged: remote token is more recent',
            };
          } else {
            return {
              value: localValue,
              reason: 'Merged: local token is more recent',
            };
          }
        }
        return {
          value: remoteValue,
          reason: 'Merged: remote takes precedence',
        };

      default:
        return {
          value: remoteValue,
          reason: 'Merged: using remote as default',
        };
    }
  }

  /**
   * Get all conflicts
   */
  getConflicts(): Conflict[] {
    return this.conflicts;
  }

  /**
   * Get resolution for specific path
   */
  getResolution(path: string): ConflictResolution | undefined {
    return this.resolutions.get(path);
  }

  /**
   * Get all resolutions
   */
  getAllResolutions(): ConflictResolution[] {
    return Array.from(this.resolutions.values());
  }

  /**
   * Get unresolved conflicts
   */
  getUnresolvedConflicts(): Conflict[] {
    return this.conflicts.filter(c => !this.resolutions.has(c.path));
  }

  /**
   * Generate conflict summary
   */
  generateSummary(): {
    total: number;
    resolved: number;
    unresolved: number;
    byType: Record<ConflictType, number>;
    bySeverity: Record<'low' | 'medium' | 'high', number>;
  } {
    const summary = {
      total: this.conflicts.length,
      resolved: this.resolutions.size,
      unresolved: 0,
      byType: {} as Record<ConflictType, number>,
      bySeverity: { low: 0, medium: 0, high: 0 },
    };

    summary.unresolved = summary.total - summary.resolved;

    for (const conflict of this.conflicts) {
      summary.byType[conflict.type] = (summary.byType[conflict.type] || 0) + 1;
      summary.bySeverity[conflict.severity]++;
    }

    return summary;
  }

  /**
   * Export conflicts as JSON report
   */
  exportReport(): string {
    return JSON.stringify(
      {
        conflicts: this.conflicts,
        resolutions: Array.from(this.resolutions.entries()).map(([, resolution]) => resolution),
        summary: this.generateSummary(),
      },
      null,
      2
    );
  }

  /**
   * Clear all conflicts and resolutions
   */
  clear(): void {
    this.conflicts = [];
    this.resolutions.clear();
  }
}

/**
 * Detect conflict type between two values
 */
export function detectConflictType(
  localValue: TokenValue | undefined,
  remoteValue: TokenValue | undefined
): ConflictType {
  // Both deleted
  if (!localValue && !remoteValue) {
    return ConflictType.VALUE_CHANGE;
  }

  // Local deleted
  if (!localValue && remoteValue) {
    return ConflictType.DELETED_LOCAL;
  }

  // Remote deleted
  if (localValue && !remoteValue) {
    return ConflictType.DELETED_REMOTE;
  }

  // Both exist, check what changed
  if (localValue && remoteValue && typeof localValue === 'object' && typeof remoteValue === 'object') {
    const localVal = (localValue as any).value || (localValue as any).$value;
    const remoteVal = (remoteValue as any).value || (remoteValue as any).$value;
    const localType = (localValue as any).type;
    const remoteType = (remoteValue as any).type;

    // Type changed
    if (localType !== remoteType) {
      return ConflictType.TYPE_CHANGE;
    }

    // Value changed
    if (localVal !== remoteVal) {
      return ConflictType.VALUE_CHANGE;
    }

    // Only metadata changed
    return ConflictType.METADATA_CHANGE;
  }

  return ConflictType.VALUE_CHANGE;
}

/**
 * Calculate conflict severity
 */
export function calculateSeverity(conflictType: ConflictType): 'low' | 'medium' | 'high' {
  const severityMap: Record<ConflictType, 'low' | 'medium' | 'high'> = {
    [ConflictType.METADATA_CHANGE]: 'low',
    [ConflictType.VALUE_CHANGE]: 'medium',
    [ConflictType.TYPE_CHANGE]: 'high',
    [ConflictType.DELETED_LOCAL]: 'medium',
    [ConflictType.DELETED_REMOTE]: 'medium',
    [ConflictType.BOTH_ADDED]: 'low',
  };

  return severityMap[conflictType] || 'medium';
}
