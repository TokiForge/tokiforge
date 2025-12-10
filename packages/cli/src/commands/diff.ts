import * as fs from 'fs';
import * as path from 'path';
import { diffTokens } from './lint';

export async function diffCommand(
  oldPath?: string,
  newPath?: string,
  projectPath: string = process.cwd()
): Promise<void> {
  const configPath = path.join(projectPath, 'tokiforge.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('tokiforge.config.json not found. Run "tokiforge init" first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const oldTokenPath = oldPath || path.resolve(projectPath, config.input);
  const newTokenPath = newPath || path.resolve(projectPath, config.input);

  if (!fs.existsSync(oldTokenPath)) {
    console.error(`Old token file not found: ${oldTokenPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(newTokenPath)) {
    console.error(`New token file not found: ${newTokenPath}`);
    process.exit(1);
  }

  console.log('Comparing tokens...\n');
  console.log(`Old: ${oldTokenPath}`);
  console.log(`New: ${newTokenPath}\n`);

  try {
    const diff = diffTokens(oldTokenPath, newTokenPath);

    if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
      console.log('No changes detected\n');
      return;
    }

    if (diff.added.length > 0) {
      console.log(`Added (${diff.added.length}):`);
      diff.added.forEach(path => console.log(`   + ${path}`));
      console.log('');
    }

    if (diff.removed.length > 0) {
      console.log(`Removed (${diff.removed.length}):`);
      diff.removed.forEach(path => console.log(`   - ${path}`));
      console.log('');
    }

    if (diff.changed.length > 0) {
      console.log(`Changed (${diff.changed.length}):`);
      diff.changed.forEach(({ path, old: oldValue, new: newValue }) => {
        console.log(`   ~ ${path}`);
        console.log(`     - ${oldValue}`);
        console.log(`     + ${newValue}`);
      });
      console.log('');
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Diff failed:', message);
    process.exit(1);
  }
}

