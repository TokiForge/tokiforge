import type { DesignTokens } from './types';

interface RegistryEntry {
  path: string;
  value: unknown;
  team?: string;
  version?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

interface RegistryConfig {
  defaultTeam?: string;
  defaultVersion?: string;
}

export class TokenRegistry {
  private entries: Map<string, RegistryEntry> = new Map();
  private config: RegistryConfig;

  constructor(config?: RegistryConfig) {
    this.config = config || {};
  }

  register(entry: RegistryEntry): void {
    if (!entry.path) {
      throw new Error('Registry entry must have a path');
    }
    this.entries.set(entry.path, {
      ...entry,
      team: entry.team || this.config.defaultTeam,
      version: entry.version || this.config.defaultVersion,
    });
  }

  get(path: string, team?: string): RegistryEntry | undefined {
    const entry = this.entries.get(path);
    if (!entry) {
      return undefined;
    }
    if (team && entry.team !== team) {
      return undefined;
    }
    return entry;
  }

  getAll(team?: string): RegistryEntry[] {
    const entries = Array.from(this.entries.values());
    if (team) {
      return entries.filter(entry => entry.team === team);
    }
    return entries;
  }

  getByVersion(version: string): RegistryEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.version === version);
  }

  getByTag(tag: string): RegistryEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.tags?.includes(tag));
  }

  importFromTokens(tokens: DesignTokens, team?: string, version?: string): void {
    this.flattenAndRegister(tokens, '', team || this.config.defaultTeam, version || this.config.defaultVersion);
  }

  exportTokens(team?: string, version?: string): DesignTokens {
    const entries = team ? this.getAll(team) : this.getAll();
    const filtered = version ? entries.filter(e => e.version === version) : entries;

    const tokens: DesignTokens = {};
    for (const entry of filtered) {
      this.setNestedValue(tokens, entry.path, entry.value as DesignTokens);
    }

    return tokens;
  }

  merge(registry: TokenRegistry, strategy: 'override' | 'merge' | 'skip' = 'override'): void {
    const remoteEntries = registry.getAll();
    for (const remoteEntry of remoteEntries) {
      const existing = this.entries.get(remoteEntry.path);
      if (!existing) {
        this.entries.set(remoteEntry.path, remoteEntry);
      } else if (strategy === 'override') {
        this.entries.set(remoteEntry.path, remoteEntry);
      } else if (strategy === 'merge') {
        this.entries.set(remoteEntry.path, { ...existing, ...remoteEntry });
      }
    }
  }

  conflictCheck(registry: TokenRegistry): Array<{ path: string; local: RegistryEntry; remote: RegistryEntry }> {
    const conflicts: Array<{ path: string; local: RegistryEntry; remote: RegistryEntry }> = [];

    for (const [path, localEntry] of this.entries.entries()) {
      const remoteEntry = registry.get(path);
      if (remoteEntry && JSON.stringify(localEntry.value) !== JSON.stringify(remoteEntry.value)) {
        conflicts.push({ path, local: localEntry, remote: remoteEntry });
      }
    }

    return conflicts;
  }

  getVersionHistory(path: string, team?: string): RegistryEntry[] {
    const allEntries = team ? this.getAll(team) : this.getAll();
    return allEntries.filter(entry => entry.path === path).sort((a, b) => {
      const aVersion = a.version || '0.0.0';
      const bVersion = b.version || '0.0.0';
      return aVersion.localeCompare(bVersion);
    });
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

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      entries: Array.from(this.entries.entries()),
    }, null, 2);
  }

  static deserialize(data: string): TokenRegistry {
    const parsed = JSON.parse(data) as { config?: RegistryConfig; entries?: Array<[string, RegistryEntry]> };
    const registry = new TokenRegistry(parsed.config);

    if (parsed.entries) {
      for (const [path, entry] of parsed.entries) {
        registry.entries.set(path, entry);
      }
    }

    return registry;
  }

  private flattenAndRegister(tokens: DesignTokens, prefix: string, team?: string, version?: string): void {
    for (const [key, value] of Object.entries(tokens)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          this.register({
            path,
            value,
            team,
            version,
          });
        } else {
          this.flattenAndRegister(value as DesignTokens, path, team, version);
        }
      }
    }
  }

  private setNestedValue(obj: DesignTokens, path: string, value: unknown): void {
    const parts = path.split('.');
    let current: DesignTokens = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as DesignTokens;
    }

    current[parts[parts.length - 1]] = value as DesignTokens;
  }
}

