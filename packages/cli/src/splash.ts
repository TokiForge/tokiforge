import chalk from 'chalk';

export function showSplash(): void {
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
${primary.bold('║')}          ${chalk.white.bold('🌈 The Modern Design Token & Theme Engine')}              ${primary.bold('║')}
${primary.bold('║')}          ${chalk.gray('Forge your colors. Shape your UI.')}                            ${primary.bold('║')}
${primary.bold('║')}                                                           ${primary.bold('║')}
${primary.bold('╚═══════════════════════════════════════════════════════════╝')}
`;

  console.log(splash);
  console.log(chalk.gray(`   Version: ${chalk.white.bold('0.1.0')} | ${accent.underline('https://github.com/TokiForge/tokiforge')}\n`));
}

export function showCompactSplash(): void {
  console.log(chalk.hex('#7C3AED').bold('🌈 TokiForge') + chalk.gray(' v0.1.0') + ' - ' + chalk.gray('Modern Design Token & Theme Engine\n'));
}

