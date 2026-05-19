import fs from 'node:fs';

export interface MigrateOptions {
  from: string; // 'style-dictionary' | 'figma-tokens' | 'theo'
  to?: string;
  backup?: boolean;
}

export async function migrateCommand(input = 'tokens.json', options: MigrateOptions = { from: 'style-dictionary' }) {
  try {
    if (!fs.existsSync(input)) {
      throw new Error(`Tokens file not found: ${input}`);
    }

    const content = fs.readFileSync(input, 'utf-8');
    const tokens = JSON.parse(content);

    // Backup original file
    if (options.backup !== false) {
      const backupPath = `${input}.backup.${Date.now()}`;
      fs.copyFileSync(input, backupPath);
      console.log(`📦 Backup created: ${backupPath}`);
    }

    let migratedTokens = tokens;

    switch (options.from) {
      case 'style-dictionary':
        migratedTokens = migrateFromStyleDictionary(tokens);
        break;
      case 'figma-tokens':
        migratedTokens = migrateFromFigmaTokens(tokens);
        break;
      case 'theo':
        migratedTokens = migrateFromTheo(tokens);
        break;
      default:
        throw new Error(`Unknown source format: ${options.from}`);
    }

    // Write migrated tokens
    const output = options.to || input;
    fs.writeFileSync(output, JSON.stringify(migratedTokens, null, 2));

    console.log(`✅ Successfully migrated from ${options.from}`);
    console.log(`💾 Saved to: ${output}`);
    
    // Show migration summary
    showMigrationSummary(tokens, migratedTokens);
  } catch (error) {
    console.error(`❌ Migration error:`, error);
    process.exit(1);
  }
}

function migrateFromStyleDictionary(tokens: any): any {
  const tokiforgeTokens: any = {};

  const traverse = (obj: any, parent: any = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !('value' in value)) {
        if (!parent[key]) {
          parent[key] = {};
        }
        traverse(value, parent[key]);
      } else if (value !== null && typeof value === 'object' && ('value' in value || 'type' in value)) {
        // Convert Style Dictionary token to TokiForge format
        parent[key] = convertStyleDictionaryToken(value as any);
      }
    }
  };

  traverse(tokens, tokiforgeTokens);
  return tokiforgeTokens;
}

function migrateFromFigmaTokens(tokens: any): any {
  // Figma Tokens typically have a different structure
  // Convert sets and groups to TokiForge format
  const tokiforgeTokens: any = {};

  for (const [setName, setTokens] of Object.entries(tokens)) {
    if (typeof setTokens === 'object') {
      tokiforgeTokens[setName] = convertFigmaTokens(setTokens as any);
    }
  }

  return tokiforgeTokens;
}

function migrateFromTheo(tokens: any): any {
  // Theo uses a different structure
  const tokiforgeTokens: any = {};

  if (tokens.global) {
    for (const [category, categoryTokens] of Object.entries(tokens.global)) {
      tokiforgeTokens[category] = convertTheoTokens(categoryTokens as any);
    }
  }

  return tokiforgeTokens;
}

function convertStyleDictionaryToken(token: any): any {
  const result: any = {};

  if (token.value !== undefined) {
    result.value = token.value;
  }

  if (token.type) {
    result.type = normalizeTokenType(token.type);
  }

  if (token.description) {
    result.description = token.description;
  }

  if (token.deprecated) {
    result.deprecated = token.deprecated;
  }

  // Preserve any additional metadata
  for (const [key, value] of Object.entries(token)) {
    if (!['value', 'type', 'description', 'deprecated'].includes(key)) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : token.value;
}

function convertFigmaTokens(tokens: any): any {
  const result: any = {};

  for (const [name, value] of Object.entries(tokens)) {
    if (typeof value === 'object' && value !== null && 'value' in value) {
      result[name] = {
        value: (value as any).value,
        type: normalizeTokenType((value as any).type),
      };
    }
  }

  return result;
}

function convertTheoTokens(tokens: any): any {
  const result: any = {};

  for (const [name, value] of Object.entries(tokens)) {
    if (typeof value === 'object' && value !== null) {
      result[name] = {
        value: (value as any).value,
        type: normalizeTokenType((value as any).type),
      };
    }
  }

  return result;
}

function normalizeTokenType(type: string): string {
  const typeMap: Record<string, string> = {
    // Style Dictionary types
    color: 'color',
    sizing: 'sizing',
    spacing: 'spacing',
    typography: 'typography',
    shadow: 'shadow',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    fontSize: 'fontSize',
    lineHeight: 'lineHeight',
    letterSpacing: 'letterSpacing',
    
    // Figma Tokens types
    colors: 'color',
    dimensions: 'sizing',
    textCase: 'textCase',
    textDecoration: 'textDecoration',
    
    // Theo types
    size: 'sizing',
    font: 'fontFamily',
    weight: 'fontWeight',
  };

  return typeMap[type] || type;
}

function showMigrationSummary(original: any, migrated: any) {
  const originalCount = countTokens(original);
  const migratedCount = countTokens(migrated);

  console.log('\n📊 Migration Summary:');
  console.log(`  Original tokens: ${originalCount}`);
  console.log(`  Migrated tokens: ${migratedCount}`);

  if (originalCount !== migratedCount) {
    console.log(`  ⚠️  Token count changed (${originalCount} → ${migratedCount})`);
  }
}

function countTokens(obj: any): number {
  let count = 0;

  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !('value' in value)) {
      count += countTokens(value);
    } else {
      count++;
    }
  }

  return count;
}
