import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['api','server','scripts','test'];
const files = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (entry.isFile() && /\.(?:js|mjs)$/.test(entry.name)) files.push(target);
  }
}
for (const root of roots) await walk(path.resolve(root));
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log(`Syntax check passed: ${files.length} JavaScript files.`);
