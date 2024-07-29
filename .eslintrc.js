module.exports = {
    env: {
        browser: false,
        node: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': ['error', { printWidth: 120 }],
        'no-console': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
};