import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        URL: 'readonly',
        atob: 'readonly',
        chrome: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        TextEncoder: 'readonly',
        window: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
