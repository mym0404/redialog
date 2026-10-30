const reactNative = require('@react-native/eslint-config/flat');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: ['**/node_modules/**', 'lib/**', 'example/dist/**', '**/.expo/**'],
  },
  ...reactNative.filter((config) => !config.plugins?.['ft-flow']),
  prettier,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
    },
  },
];
