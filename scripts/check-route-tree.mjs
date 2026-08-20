import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const file = 'src/router/routeTree.gen.ts';

if (!existsSync(file)) {
  console.error(`${file} was not generated`);
  process.exit(1);
}

const tracked = execSync(`git ls-files -- ${file}`, { encoding: 'utf8' }).trim();
if (!tracked) {
  console.error(`${file} must be tracked in git so CI can detect generator drift`);
  process.exit(1);
}

execSync(`git diff --exit-code -- ${file}`, { stdio: 'inherit' });
