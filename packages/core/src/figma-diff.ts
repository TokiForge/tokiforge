import type { DesignTokens, DiffResult, DiffOptions } from './types';
import fs from 'node:fs';

type TokenNode = Record<string, unknown>;

export class FigmaDiff {
  static compare(figmaTokens: DesignTokens, codeTokens: DesignTokens, options: DiffOptions = {}): DiffResult {
    const tolerance = options.tolerance ?? 0;
    const ignorePaths = options.ignorePaths ?? [];

    const getAllPaths = (tokens: DesignTokens, prefix = ''): Set<string> => {
      const paths = new Set<string>();
      
      const traverse = (obj: unknown, path: string): void => {
        if (ignorePaths.some(ignored => path.startsWith(ignored))) {
          return;
        }

        if (typeof obj !== 'object' || obj === null) {
          return;
        }

        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            traverse(obj[i], `${path}[${i}]`);
          }
          return;
        }

        const node = obj as TokenNode;
        if ('value' in node) {
          paths.add(path);
        } else {
          for (const key of Object.keys(node)) {
            const newPath = path ? `${path}.${key}` : key;
            traverse(node[key], newPath);
          }
        }
      };

      traverse(tokens, prefix);
      return paths;
    };

    const getValue = (tokens: DesignTokens, path: string): unknown => {
      const parts = path.split('.');
      let current: unknown = tokens;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as TokenNode)) {
          current = (current as TokenNode)[part];
        } else {
          return undefined;
        }
      }
      
      const node = current as TokenNode | null;
      return node?.value ?? current;
    };

    const figmaPaths = getAllPaths(figmaTokens);
    const codePaths = getAllPaths(codeTokens);

    const added: string[] = [];
    const removed: string[] = [];
    const changed: Array<{ path: string; oldValue: unknown; newValue: unknown }> = [];
    const matches: string[] = [];

    // Find added paths
    for (const path of figmaPaths) {
      if (!codePaths.has(path)) {
        added.push(path);
      }
    }

    // Find removed paths
    for (const path of codePaths) {
      if (!figmaPaths.has(path)) {
        removed.push(path);
      }
    }

    // Find changed and matching paths
    for (const path of figmaPaths) {
      if (codePaths.has(path)) {
        const figmaValue = getValue(figmaTokens, path);
        const codeValue = getValue(codeTokens, path);
        
        if (this.valuesMatch(figmaValue, codeValue, tolerance)) {
          matches.push(path);
        } else {
          changed.push({
            path,
            oldValue: codeValue,
            newValue: figmaValue,
          });
        }
      }
    }

    return {
      added,
      removed,
      changed,
      matches,
    };
  }

  static generateReport(diff: DiffResult): string {
    const lines: string[] = [];
    
    lines.push(
      'Figma Token Diff Report',
      '='.repeat(50),
      ''
    );

    if (diff.added.length > 0) {
      lines.push(`Added (${diff.added.length}):`);
      for (const path of diff.added) {
        lines.push(`  + ${path}`);
      }
      lines.push('');
    }

    if (diff.removed.length > 0) {
      lines.push(`Removed (${diff.removed.length}):`);
      for (const path of diff.removed) {
        lines.push(`  - ${path}`);
      }
      lines.push('');
    }

    if (diff.changed.length > 0) {
      lines.push(`Changed (${diff.changed.length}):`);
      for (const change of diff.changed) {
        lines.push(
          `  ~ ${change.path}`,
          `    Old: ${JSON.stringify(change.oldValue)}`,
          `    New: ${JSON.stringify(change.newValue)}`
        );
      }
      lines.push('');
    }

    if (diff.matches.length > 0) {
      lines.push(
        `Matches (${diff.matches.length}):`,
        '  All matching tokens are in sync.',
        ''
      );
    }

    return lines.join('\n');
  }

  static hasMismatches(diff: DiffResult): boolean {
    return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
  }

  /**
   * Produce a new token tree by applying a Figma ↔ code sync strategy.
   *
   * - `merge` (default): code base + Figma additions/changes; code-only tokens kept
   * - `figma-wins`: same as merge but Figma overwrites conflicts
   * - `code-wins`: keep code values on conflicts; still add Figma-only tokens
   * - `figma-only`: replace with Figma tree
   */
  static sync(
    codeTokens: DesignTokens,
    figmaTokens: DesignTokens,
    options: DiffOptions & { strategy?: 'merge' | 'figma-wins' | 'code-wins' | 'figma-only' } = {}
  ): DesignTokens {
    const strategy = options.strategy ?? 'merge';
    if (strategy === 'figma-only') {
      return structuredCloneSafe(figmaTokens);
    }

    const result = structuredCloneSafe(codeTokens);
    const diff = this.compare(figmaTokens, codeTokens, options);

    for (const path of diff.added) {
      const value = getTokenNode(figmaTokens, path);
      if (value !== undefined) setTokenNode(result, path, value);
    }

    if (strategy !== 'code-wins') {
      for (const change of diff.changed) {
        const value = getTokenNode(figmaTokens, change.path);
        if (value !== undefined) setTokenNode(result, change.path, value);
      }
    }

    return result;
  }

  static valuesMatch(value1: unknown, value2: unknown, tolerance = 0): boolean {
    if (value1 === value2) {
      return true;
    }

    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return Math.abs(value1 - value2) <= tolerance;
    }

    if (typeof value1 === 'string' && typeof value2 === 'string') {
      // Try to extract numbers from strings (e.g., "10px" -> 10)
      const num1 = Number.parseFloat(value1);
      const num2 = Number.parseFloat(value2);
      if (!Number.isNaN(num1) && !Number.isNaN(num2)) {
        return Math.abs(num1 - num2) <= tolerance;
      }
      return value1 === value2;
    }

    return false;
  }

  static exportJSON(diff: DiffResult, outputPath: string): void {
    fs.writeFileSync(outputPath, JSON.stringify(diff, null, 2));
  }
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // fall through
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function getTokenNode(tokens: DesignTokens, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = tokens;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as TokenNode)) {
      current = (current as TokenNode)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function setTokenNode(tokens: DesignTokens, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: TokenNode = tokens as TokenNode;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as TokenNode;
  }
  current[parts[parts.length - 1]] = value;
}
