import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['coverage', 'node_modules']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'tests/**/*.js', 'prisma/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },
    rules: {
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
];
