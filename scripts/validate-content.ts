import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateAll } from '../src/content/validate';

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

const contentFiles = findJsonFiles('content-src').filter((file) =>
  /content-src[\\/]week-[^\\/]+[\\/].+\.json$/.test(file),
);

const inputs = contentFiles.map((file) => JSON.parse(readFileSync(file, 'utf8')));
const { days, errors } = validateAll(inputs);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${days.length} day(s)`);
}
