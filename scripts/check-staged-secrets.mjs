// Pre-commit guard: scans only the files staged for this commit with secretlint.
import { execFileSync, spawnSync } from 'node:child_process';

const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  {
    encoding: 'utf8',
  },
)
  .split('\0')
  .filter((file) => file.length > 0);

if (staged.length === 0) {
  process.exit(0);
}

const scan = spawnSync('npx', ['--no-install', 'secretlint', '--maskSecrets', ...staged], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (scan.status !== 0) {
  console.error('\nCommit bloqué : un secret semble présent dans les fichiers ci-dessus.');
  console.error('Retire-le, puis place-le dans .dev.vars ou dans « wrangler secret put ».');
}
process.exit(scan.status ?? 1);
