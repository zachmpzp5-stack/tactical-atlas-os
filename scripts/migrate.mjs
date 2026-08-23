import { ensureMigrations } from '../server/data/migrations/index.js';

try {
  const result = await ensureMigrations();
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'READY') process.exitCode = 1;
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
}
