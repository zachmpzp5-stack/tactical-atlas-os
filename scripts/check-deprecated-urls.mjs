import fs from 'node:fs/promises';
import path from 'node:path';

const roots = ['api', 'server'];
const patterns = [
  { name: 'url.parse()', expression: /\burl\s*\.\s*parse\s*\(/ },
  { name: 'parseUrl()', expression: /\bparseUrl\s*\(/ },
  {
    name: 'parse import from node:url',
    expression: /import\s*\{[^}]*\bparse(?:\s+as\s+\w+)?\b[^}]*\}\s*from\s*['"](?:node:)?url['"]/,
  },
  {
    name: 'require("url").parse()',
    expression: /require\s*\(\s*['"](?:node:)?url['"]\s*\)\s*\.\s*parse\s*\(/,
  },
];

async function sourceFiles(directory) {
  const results = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await sourceFiles(target)));
    else if (entry.isFile() && /\.(?:c?js|mjs)$/.test(entry.name)) results.push(target);
  }
  return results;
}

const findings = [];
for (const root of roots) {
  for (const file of await sourceFiles(path.resolve(root))) {
    const source = await fs.readFile(file, 'utf8');
    for (const pattern of patterns) {
      if (pattern.expression.test(source)) {
        findings.push(`${path.relative(process.cwd(), file)}: ${pattern.name}`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error(`Deprecated URL parser usage detected:\n${findings.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Deprecated URL parser check passed for API and server request paths.');
}
