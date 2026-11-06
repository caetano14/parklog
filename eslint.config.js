// ESLint com a configuração oficial do Expo (inclui as regras de React e de hooks).
// Correr:  npm run lint
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', 'server/*', '.expo/*', 'node_modules/*', 'verificar.js', 'diagnostico-crash.js'],
  },
  {
    files: ['__tests__/**'],
    languageOptions: { globals: { describe: 'readonly', test: 'readonly', it: 'readonly', expect: 'readonly', jest: 'readonly' } },
  },
]);
