import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function findDeployableFunctions(apiDirectory) {
  const results = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.startsWith('_')) results.push(absolute);
    }
  }
  await walk(apiDirectory);
  return results.sort();
}

export async function validateFunctionBudget(projectRoot, limit = 11) {
  const apiDirectory = path.join(projectRoot, 'api');
  const files = await findDeployableFunctions(apiDirectory);
  const missingHandlers = [];
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    if (!/export\s+(?:default|\{\s*default\s*\})/.test(source)) missingHandlers.push(path.relative(projectRoot, file));
  }
  if (missingHandlers.length) throw new Error(`Exposed API files without default handlers:\n${missingHandlers.join('\n')}`);
  if (files.length > limit) throw new Error(`Vercel Function budget exceeded: ${files.length}/${limit}`);
  return { count: files.length, limit, files: files.map((file) => path.relative(projectRoot, file).replaceAll('\\', '/')) };
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  try {
    const result = await validateFunctionBudget(process.cwd());
    console.log(`Deployable Vercel Functions: ${result.count}/${result.limit}`);
    for (const file of result.files) console.log(file);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
