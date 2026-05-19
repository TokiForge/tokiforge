import type { DesignTokens, RegistryEntry, RegistryConfig, TokenValue } from './types';

type TokenNode = Record<string, unknown>;

export class TokenRegistry {
  private entries: RegistryEntry[] = [];
  private config: RegistryConfig;

  constructor(config: RegistryConfig = {}) {
    this.config = config;
  }

  importFromTokens(tokens: DesignTokens, team?: string, version?: string): void {
    const processTokens = (obj: unknown, path = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          processTokens(obj[i], `${path}[${i}]`);
        }
        return;
      }

      const node = obj as TokenNode;
      if ('value' in node) {
        const entry: RegistryEntry = {
          path: path || 'root',
          value: node as unknown as TokenValue,
          team: team || this.config.teams?.[0],
          version: version || this.config.defaultVersion || '1.0.0',
        };
        this.entries.push(entry);
      } else {
        for (const key of Object.keys(node)) {
          const newPath = path ? `${path}.${key}` : key;
          processTokens(node[key], newPath);
        }
      }
    };

    processTokens(tokens);
  }

  getAll(team?: string): DesignTokens {
    const filtered = team
      ? this.entries.filter((entry) => entry.team === team)
      : this.entries;

    const tokens: DesignTokens = {};
    
    for (const entry of filtered) {
      this.setNestedValue(tokens, entry.path, entry.value);
    }

    return tokens;
  }

  exportTokens(team?: string, version?: string): DesignTokens {
    const filtered = this.entries.filter((entry) => {
      if (team && entry.team !== team) {
        return false;
      }
      if (version && entry.version !== version) {
        return false;
      }
      return true;
    });

    const tokens: DesignTokens = {};
    
    for (const entry of filtered) {
      this.setNestedValue(tokens, entry.path, entry.value);
    }

    return tokens;
  }

  private setNestedValue(obj: DesignTokens, path: string, value: TokenValue): void {
    const parts = path.split('.');
    let current = obj as TokenNode;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as TokenNode;
    }

    current[parts[parts.length - 1]] = value;
  }
}
