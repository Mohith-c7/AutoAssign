import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        fetch: 'readonly',
        process: 'readonly'
      }
    }
  }
];
