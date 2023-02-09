process.env.ESLINT_TSCONFIG = 'tsconfig.json';

module.exports = {
    extends: '@antfu',
    rules: {
        'indent': 'off',
        '@typescript-eslint/indent': ['error', 4],
        'semi': 'off',
        '@typescript-eslint/semi': ['error', 'always'],

        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
    },
};
