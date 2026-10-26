import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = 'dist';
const pageDirs = [
  ['lessons', 'lessons'],
  ['reference', 'reference'],
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const [source, target] of pageDirs) {
  await cp(source, join(outDir, target), { recursive: true });
}

await mkdir(join(outDir, 'assets'), { recursive: true });
for (const file of ['course.css', 'quiz.js']) {
  await cp(join('assets', file), join(outDir, 'assets', file));
}

console.log('Prepared dist/ with lessons, reference, and course assets.');
