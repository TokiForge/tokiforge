import type { DesignTokens, TokenValue } from './types';

export interface RegistryEntry {
  id: string;
  path: string;
  token: TokenValue;
  version: string;
  team?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface RegistryConfig {
  teams?: string[];
  version?: string;
  baseUrl?: string;
}

export class TokenRegistry {
  private entries: Map<string, RegistryEntry> = new Map();
  private config: RegistryConfig;

  constructor(config: RegistryConfig = {}) {
    this.config = config;
  }

  register(entry: RegistryEntry): void {
    const key = this.getKey(entry.path, entry.team);
    this.entries.set(key, entry);
  }

  get(path: string, team?: string): RegistryEntry | undefined {
    const key = this.getKey(path, team);
    return this.entries.get(key);
  }

  getAll(team?: string): RegistryEntry[] {
    if (team) {
      return Array.from(this.entries.values()).filter((entry) => entry.team === team);
    }
    return Array.from(this.entries.values());
  }

  getByVersion(version: string): RegistryEntry[] {
    return Array.from(this.entries.values()).filter((entry) => entry.version === version);
  }

  getByTag(tag: string): RegistryEntry[] {
    return Array.from(this.entries.values()).filter(
      (entry) => entry.tags && entry.tags.includes(tag)
    );
  }

  importFromTokens(tokens: DesignTokens, team?: string, version?: string): void {
    const traverse = (obj: DesignTokens, path: string = ''): void => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if ('value' in value || '$value' in value || '$alias' in value) {
            const token = value as TokenValue;
            const entry: RegistryEntry = {
              id: this.generateId(currentPath, team),
              path: currentPath,
              token,
              version: version || token.version?.version || this.config.version || '1.0.0',
              team,
              tags: this.extractTags(token),
              metadata: {
                type: token.type,
                description: token.description,
                deprecated: token.deprecated,
              },
            };
            this.register(entry);
          } else {
            traverse(value as DesignTokens, currentPath);
          }
        }
      }
    };

    traverse(tokens);
  }

  exportTokens(team?: string, version?: string): DesignTokens {
    const tokens: DesignTokens = {};
    const entries = team
      ? this.getAll(team)
      : version
        ? this.getByVersion(version)
        : this.getAll();

    for (const entry of entries) {
      if (version && entry.version !== version) {
        continue;
      }
      this.setNestedValue(tokens, entry.path, entry.token);
    }

    return tokens;
  }

  merge(registry: TokenRegistry, strategy: 'override' | 'merge' | 'skip' = 'merge'): void {
    for (const entry of registry.getAll()) {
      const existing = this.get(entry.path, entry.team);
      if (existing) {
        if (strategy === 'override') {
          this.register(entry);
        } else if (strategy === 'merge') {
          const merged: RegistryEntry = {
            ...existing,
            token: { ...existing.token, ...entry.token },
            tags: [...(existing.tags || []), ...(entry.tags || [])],
            metadata: { ...existing.metadata, ...entry.metadata },
          };
          this.register(merged);
        }
      } else {
        this.register(entry);
      }
    }
  }

  conflictCheck(registry: TokenRegistry): Array<{ path: string; team1?: string; team2?: string }> {
    const conflicts: Array<{ path: string; team1?: string; team2?: string }> = [];
    const paths = new Set<string>();

    for (const entry of this.getAll()) {
      paths.add(entry.path);
    }

    for (const entry of registry.getAll()) {
      if (paths.has(entry.path)) {
        const existing = this.get(entry.path);
        if (existing && this.tokensDiffer(existing.token, entry.token)) {
          conflicts.push({
            path: entry.path,
            team1: existing.team,
            team2: entry.team,
          });
        }
      }
    }

    return conflicts;
  }

  getVersionHistory(path: string, team?: string): RegistryEntry[] {
    const allVersions = Array.from(this.entries.values()).filter(
      (entry) => entry.path === path && (team === undefined || entry.team === team)
    );
    return allVersions.sort((a, b) => this.compareVersions(a.version, b.version));
  }

  listTeams(): string[] {
    const teams = new Set<string>();
    for (const entry of this.entries.values()) {
      if (entry.team) {
        teams.add(entry.team);
      }
    }
    return Array.from(teams);
  }

  private getKey(path: string, team?: string): string {
    return team ? `${team}:${path}` : path;
  }

  private generateId(path: string, team?: string): string {
    const prefix = team ? `${team}-` : '';
    return `${prefix}${path.replace(/\./g, '-')}`;
  }

  private extractTags(token: TokenValue): string[] {
    const tags: string[] = [];
    if (token.type) tags.push(token.type);
    if (token.component) tags.push(`component:${token.component}`);
    if (token.scope) tags.push(`scope:${token.scope}`);
    if (token.deprecated) tags.push('deprecated');
    if (token.semantic?.category) tags.push(`category:${token.semantic.category}`);
    return tags;
  }

  private setNestedValue(obj: DesignTokens, path: string, value: TokenValue): void {
    const parts = path.split('.');
    let current: any = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  private tokensDiffer(token1: TokenValue, token2: TokenValue): boolean {
    const value1 = token1.value ?? token1.$value;
    const value2 = token2.value ?? token2.$value;
    return JSON.stringify(value1) !== JSON.stringify(value2);
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      entries: Array.from(this.entries.values()),
    }, null, 2);
  }

  static deserialize(data: string): TokenRegistry {
    const parsed = JSON.parse(data);
    const registry = new TokenRegistry(parsed.config);
    for (const entry of parsed.entries) {
      registry.register(entry);
    }
    return registry;
  }
}

