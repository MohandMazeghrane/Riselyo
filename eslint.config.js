// @ts-check
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const WEB_SRC = 'apps/web/src';
const TEST_FILES = ['**/*.test.ts', '**/*.test.tsx', '**/test/**'];

const ONLY_RELATIVE_IMPORTS = {
  regex: '^(?![.]{1,2}/)',
  message: 'Cette couche ne dépend d’aucune bibliothèque externe (CLAUDE.md, section 4).',
};

const FORBIDDEN_IMPURE_GLOBALS = [
  { name: 'fetch', message: 'Pas de réseau ici : passer par un port.' },
  { name: 'localStorage', message: 'Pas de stockage ici : passer par un repository.' },
  { name: 'indexedDB', message: 'Pas de stockage ici : passer par un repository.' },
];

const FORBIDDEN_DATE_SYNTAX = [
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: 'Lire l’heure via le port Clock.',
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: 'Lire l’heure via le port Clock.',
  },
];

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Interdit (CLAUDE.md, section 11).' },
        { property: 'outerHTML', message: 'Interdit (CLAUDE.md, section 11).' },
      ],
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: [`${WEB_SRC}/**/*.{ts,tsx}`],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['apps/web/src/**/*'],
      'import/resolver': { node: { extensions: ['.ts', '.tsx', '.js'] } },
      'boundaries/elements': [
        { type: 'domain', pattern: `${WEB_SRC}/domain` },
        { type: 'application', pattern: `${WEB_SRC}/application` },
        { type: 'infrastructure', pattern: `${WEB_SRC}/infrastructure` },
        { type: 'presentation', pattern: `${WEB_SRC}/presentation` },
      ],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            'Règle de dépendance : {{ from.element.types.[0] }} ne peut pas importer {{ to.element.types.[0] }} (CLAUDE.md, section 4).',
          policies: [
            {
              from: { element: { type: 'domain' } },
              allow: { to: { element: { type: 'domain' } } },
            },
            {
              from: { element: { type: 'application' } },
              allow: { to: { element: { types: ['domain', 'application'] } } },
            },
            {
              from: { element: { type: 'infrastructure' } },
              allow: { to: { element: { types: ['domain', 'application', 'infrastructure'] } } },
            },
            {
              from: { element: { type: 'presentation' } },
              allow: { to: { element: { types: ['domain', 'application', 'presentation'] } } },
            },
            {
              from: { file: { path: '**/presentation/app/container.ts' } },
              allow: { to: { element: { type: 'infrastructure' } } },
            },
          ],
        },
      ],
    },
  },
  {
    files: [`${WEB_SRC}/domain/**/*.ts`, `${WEB_SRC}/application/**/*.ts`],
    ignores: TEST_FILES,
    rules: {
      'no-restricted-imports': ['error', { patterns: [ONLY_RELATIVE_IMPORTS] }],
      'no-restricted-globals': ['error', ...FORBIDDEN_IMPURE_GLOBALS],
      'no-restricted-syntax': ['error', ...FORBIDDEN_DATE_SYNTAX],
    },
  },
  {
    files: TEST_FILES,
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  prettier,
);
