import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

export function showSplash(): void {
  const version = getVersion();
  const primary = chalk.hex('#7C3AED');
  const accent = chalk.hex('#06B6D4');
  
  const splash = `
${primary.bold('╔═══════════════════════════════════════════════════════════╗')}
${primary.bold('║')}                                                           ${primary.bold('║')}
${primary.bold('║')}     ${primary.bold('████████╗')} ${accent.bold('██╗  ██╗')} ${primary.bold('██╗')} ${accent.bold('██╗')} ${primary.bold('███████╗')} ${accent.bold(' ██████╗ ')} ${primary.bold('██████╗ ')} ${accent.bold(' ██████╗ ')} ${primary.bold('██╗   ██╗')}     ${primary.bold('║')}
${primary.bold('║')}     ${primary('╚══██╔══╝')} ${accent('██║  ██║')} ${primary('██║')} ${accent('██║')} ${primary('██╔════╝')} ${accent('██╔═══██╗')} ${primary('██╔══██╗')} ${accent('██╔══██╗')} ${primary('██║   ██║')}     ${primary.bold('║')}
${primary.bold('║')}        ${primary('██║')}   ${accent('███████║')} ${primary('██║')} ${accent('██║')} ${primary('█████╗')}   ${accent('██║   ██║')} ${primary('██████╔╝')} ${accent('██████╔╝')} ${primary('██║   ██║')}     ${primary.bold('║')}
${primary.bold('║')}        ${primary('██║')}   ${accent('██╔══██║')} ${primary('██║')} ${accent('██║')} ${primary('██╔══╝')}   ${accent('██║   ██║')} ${primary('██╔══██╗')} ${accent('██╔══██╗')} ${primary('██║   ██║')}     ${primary.bold('║')}
${primary.bold('║')}        ${primary('██║')}   ${accent('██║  ██║')} ${primary('██║')} ${accent('██║')} ${primary('██║')}       ${accent('╚██████╔╝')} ${primary('██║  ██║')} ${accent('██║  ██║')} ${primary('╚██████╔╝')}     ${primary.bold('║')}
${primary.bold('║')}        ${primary('╚═╝')}   ${accent('╚═╝  ╚═╝')} ${primary('╚═╝')} ${accent('╚═╝')} ${primary('╚═╝')}        ${accent(' ╚═════╝ ')} ${primary('╚═╝  ╚═╝')} ${accent('╚═╝  ╚═╝')} ${primary(' ╚═════╝ ')}     ${primary.bold('║')}
${primary.bold('║')}                                                           ${primary.bold('║')}
${primary.bold('║')}          ${chalk.white.bold('The Modern Design Token & Theme Engine')}              ${primary.bold('║')}
${primary.bold('║')}          ${chalk.gray('Forge your colors. Shape your UI.')}                            ${primary.bold('║')}
${primary.bold('║')}                                                           ${primary.bold('║')}
${primary.bold('╚═══════════════════════════════════════════════════════════╝')}
`;

  console.log(splash);
  console.log(chalk.gray(`   Version: ${chalk.white.bold(version)} | ${accent.underline('https://github.com/TokiForge/tokiforge')}\n`));
}

export function showCompactSplash(): void {
  const version = getVersion();
  console.log(chalk.hex('#7C3AED').bold('TokiForge') + chalk.gray(` v${version}`) + ' - ' + chalk.gray('Modern Design Token & Theme Engine\n'));
}

