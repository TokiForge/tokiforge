import fs from 'fs';
import path from 'path';

export async function generateTypesCommand(input = 'tokens.json', output = 'tokens.d.ts') {
  try {
    // Read tokens file
    if (!fs.existsSync(input)) {
      throw new Error(`Tokens file not found: ${input}`);
    }

    const content = fs.readFileSync(input, 'utf-8');
    const tokens = JSON.parse(content);

    // Get token paths for autocomplete
    const paths = getAllTokenPaths(tokens);

    // Generate TypeScript file
    const tsContent = `// This file is auto-generated. Do not edit directly.
// Generated from: ${input}

export const tokens = ${JSON.stringify(tokens, null, 2)};

${generateTypeDeclarations(tokens)}

${generateTokenPaths(paths)}

export type TokenPath = ${paths.map((p) => `'${p}'`).join(' | ')};

export function resolveToken(path: TokenPath): any {
  const parts = path.split('.');
  let current = tokens;
  
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current?.value ?? current;
}
`;

    // Write output file
    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(output, tsContent);
    console.log(`✅ Generated TypeScript declarations: ${output}`);
  } catch (error) {
    console.error(`❌ Error generating types:`, error);
    process.exit(1);
  }
}

function getAllTokenPaths(obj: any, prefix = ''): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !('value' in value)) {
      paths.push(...getAllTokenPaths(value, fullKey));
    } else {
      paths.push(fullKey);
    }
  }

  return paths;
}

function generateTypeDeclarations(tokens: any): string {
  const traverse = (obj: any, depth = 0): string[] => {
    const lines: string[] = [];
    const indent = '  '.repeat(depth);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !('value' in value)) {
        const interfaceName = toPascalCase(key);
        lines.push(`${indent}export interface ${interfaceName} {`);
        lines.push(...traverse(value, depth + 1));
        lines.push(`${indent}}`);
        lines.push('');
      } else if (value !== null && typeof value === 'object' && 'type' in value) {
        const type = inferType(value);
        lines.push(`${indent}${key}: ${type};`);
      }
    }

    return lines;
  };

  return traverse(tokens).join('\n');
}

function generateTokenPaths(paths: string[]): string {
  const groups: Record<string, string[]> = {};

  for (const path of paths) {
    const category = path.split('.')[0];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(path);
  }

  let content = 'export const tokenPaths = {\n';

  for (const [category, categoryPaths] of Object.entries(groups)) {
    content += `  ${category}: [\n`;
    for (const path of categoryPaths) {
      content += `    '${path}',\n`;
    }
    content += `  ],\n`;
  }

  content += '};';
  return content;
}

function inferType(value: any): string {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'any[]';
  if (typeof value === 'object' && value !== null) {
    if ('value' in value && value.value !== null) {
      const val = value.value;
      if (typeof val === 'number') return 'number | string';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'object') return 'Record<string, any>';
    }
  }
  return 'any';
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
