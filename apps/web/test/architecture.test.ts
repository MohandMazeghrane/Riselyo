import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SRC = 'apps/web/src';

const eslint = new ESLint({
  cwd: REPO_ROOT,
  overrideConfig: [tseslint.configs.disableTypeChecked],
});

async function ruleViolations(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: `${REPO_ROOT}${filePath}` });
  return (result?.messages ?? []).map((message) => message.ruleId ?? 'parse-error');
}

const IMPORT_CLOCK = "import { SystemClock } from '../../infrastructure/clock/systemClock';\n";
const IMPORT_USE_CASE =
  "import { createGetCurrentDay } from '../../application/day/getCurrentDay';\n";
const IMPORT_DOMAIN = "import { dayKeyOf } from '../../domain/shared/dayKey';\n";

describe('architecture boundaries (CLAUDE.md, section 4)', () => {
  it.each([
    ['domain → infrastructure', `${SRC}/domain/shared/probe.ts`, IMPORT_CLOCK],
    ['domain → application', `${SRC}/domain/shared/probe.ts`, IMPORT_USE_CASE],
    ['application → infrastructure', `${SRC}/application/day/probe.ts`, IMPORT_CLOCK],
    ['presentation → infrastructure', `${SRC}/presentation/screens/probe.ts`, IMPORT_CLOCK],
  ])('forbids %s', async (_label, file, code) => {
    expect(await ruleViolations(file, `${code}export {};\n`)).toContain('boundaries/dependencies');
  });

  it.each([
    ['application → domain', `${SRC}/application/day/probe.ts`, IMPORT_DOMAIN],
    ['infrastructure → domain', `${SRC}/infrastructure/clock/probe.ts`, IMPORT_DOMAIN],
    ['presentation → application', `${SRC}/presentation/screens/probe.ts`, IMPORT_USE_CASE],
    ['container → infrastructure', `${SRC}/presentation/app/container.ts`, IMPORT_CLOCK],
  ])('allows %s', async (_label, file, code) => {
    expect(await ruleViolations(file, `${code}export {};\n`)).not.toContain(
      'boundaries/dependencies',
    );
  });

  it('forbids external libraries in the domain', async () => {
    const code = "import { z } from 'zod';\nexport const schema = z;\n";

    expect(await ruleViolations(`${SRC}/domain/shared/probe.ts`, code)).toContain(
      'no-restricted-imports',
    );
  });

  it('forbids reading the time without the Clock port in the domain', async () => {
    const code = 'export const now = (): number => Date.now();\n';

    expect(await ruleViolations(`${SRC}/domain/shared/probe.ts`, code)).toContain(
      'no-restricted-syntax',
    );
  });

  it('forbids network calls in the application layer', async () => {
    const code = "export const load = (): Promise<Response> => fetch('/x');\n";

    expect(await ruleViolations(`${SRC}/application/day/probe.ts`, code)).toContain(
      'no-restricted-globals',
    );
  });
});
