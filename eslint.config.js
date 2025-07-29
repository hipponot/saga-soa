import { config as baseConfig } from './packages/eslint-config/base.js';

/**
 * Root ESLint configuration for the saga-soa project.
 * Extends the base config and adds project-specific rules.
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Code quality
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-console': 'off', // Allow console in examples
      'no-unused-vars': 'warn',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'packages/eslint-config/**',
    ],
  },
]; 