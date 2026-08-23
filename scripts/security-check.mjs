import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const git = spawnSync('git', ['ls-files','-co','--exclude-standard'], { cwd: projectRoot, encoding: 'utf8' });
if (git.status !== 0) throw new Error('Unable to enumerate repository files for secret scanning.');
const files = [...new Set(git.stdout.split(/\r?\n/).filter(Boolean))]
  .filter((file) => !file.startsWith('dist/') && !file.startsWith('.data/') && !file.includes('node_modules/') && !/\.(?:png|jpg|jpeg|gif|webp|mp3|wav|woff2?|ttf|ico)$/i.test(file));
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:ghp|github_pat|xox[baprs]|sk_live|sk-proj)-[A-Za-z0-9_-]{16,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /postgres(?:ql)?:\/\/[^\s/@:]+:[^\s/@]+@/i
];
const findings = [];
for (const file of files) {
  const absolute = path.join(projectRoot, file);
  let source;
  try { source = await fs.readFile(absolute, 'utf8'); } catch { continue; }
  if (patterns.some((pattern) => pattern.test(source))) findings.push(file);
}
if (findings.length) {
  console.error(`Potential secret material detected in ${findings.length} file(s):\n${findings.join('\n')}`);
  process.exitCode = 1;
}

const config = JSON.parse(await fs.readFile(path.join(projectRoot,'vercel.json'),'utf8'));
const headers = config.routes?.find((route) => route.headers)?.headers || {};
for (const name of ['Content-Security-Policy','Strict-Transport-Security','X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy']) {
  if (!headers[name]) { console.error(`Missing security header: ${name}`); process.exitCode = 1; }
}
for (const directive of ["default-src 'self'","frame-ancestors 'none'","object-src 'none'","base-uri 'self'"]) {
  if (!headers['Content-Security-Policy']?.includes(directive)) { console.error(`Missing CSP directive: ${directive}`); process.exitCode = 1; }
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const audit = spawnSync(npmCommand, ['audit','--omit=dev','--audit-level=high','--json'], { cwd: projectRoot, encoding: 'utf8' });
let auditReport = {};
try { auditReport = JSON.parse(audit.stdout || '{}'); } catch { console.error('Unable to parse npm audit output.'); process.exitCode = 1; }
const productionVulnerabilities = auditReport.metadata?.vulnerabilities || {};
if (Number(productionVulnerabilities.high || 0) + Number(productionVulnerabilities.critical || 0) > 0) {
  console.error(`Production dependency audit failed: ${productionVulnerabilities.high || 0} high, ${productionVulnerabilities.critical || 0} critical.`);
  process.exitCode = 1;
}
if (!process.exitCode) console.log(`Security checks passed: ${files.length} text files scanned; production dependencies have no high/critical advisories; required headers present.`);
