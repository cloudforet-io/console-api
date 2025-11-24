module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:import/recommended',
        'plugin:import/typescript'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018
    },
    plugins: [
        '@typescript-eslint',
        'eslint-plugin-node',
        'standard',
        'import'
    ],
    env: {
        browser: true,
        es6: true,
        node: true
    },
    globals: {
    },
    settings: {
        'import/resolver': {
            typescript: {}
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts']
        }
    },
    rules: {
        indent: ['error', 4, {
            ObjectExpression: 1,
            flatTernaryExpressions: true,
            ignoreComments: true,
            ArrayExpression: 1
        }],
        quotes: ['error', 'single'],
        'comma-dangle': ['error', {
            arrays: 'never',
            objects: 'never',
            imports: 'never',
            exports: 'never',
            functions: 'never'
        }],
        'no-irregular-whitespace': ['error', { skipComments: true }],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'max-len': ['error', { code: 200 }],
        'no-empty': 'error',
        'no-duplicate-imports': 'error',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'quote-props': ['error', 'as-needed'],
        'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
        // typescript rules
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
                overrides: {
                    accessors: 'no-public',
                    methods: 'no-public',
                    properties: 'no-public',
                    parameterProperties: 'explicit'
                }
            }
        ],
        '@typescript-eslint/no-object-literal-type-assertion': ['off'],
        // '@typescript-eslint/no-parameter-properties' rule has been removed in newer versions
        '@typescript-eslint/camelcase': ['off'], // use eslint camelcase rule
        '@typescript-eslint/no-empty-function': ['off'], // use eslint no-empty-function rule
        '@typescript-eslint/no-use-before-define': ['off'], // use eslint no-use-before-define rule
        '@typescript-eslint/ban-ts-ignore': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],

        // eslint-plugin-import rules
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'index'],
                pathGroups: [
                    {
                        pattern: '@vue/test-utils',
                        group: 'builtin',
                        position: 'before'
                    },
                    {
                        pattern: '@vue/composition-api',
                        group: 'builtin'
                    },
                    {
                        pattern: '@spaceone/design-system/**',
                        group: 'external'
                    },
                    {
                        pattern: '@spaceone/console-core-lib/**',
                        group: 'external'
                    },
                    {
                        pattern: '@/router/**',
                        group: 'internal',
                        position: 'after'
                    },
                    {
                        pattern: '@/store/**',
                        group: 'internal',
                        position: 'after'
                    },
                    {
                        pattern: '@/translations/**',
                        group: 'internal',
                        position: 'after'
                    },
                    {
                        pattern: '@/lib/**',
                        group: 'internal',
                        position: 'after'
                    },
                    {
                        pattern: '@/common/**',
                        group: 'internal',
                        position: 'after'
                    },
                    {
                        pattern: '@/styles/**',
                        group: 'internal',
                        position: 'after'
                    },
                    {
                        pattern: '@/services/**',
                        group: 'internal',
                        position: 'after'
                    }
                ],
                pathGroupsExcludedImportTypes: ['@vue/composition-api', '@vue/test-utils'],
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true
                },
                'newlines-between': 'always'
            }
        ],
        'import/namespace': [0, { allowComputed: true }]
    },
    ignorePatterns: ['**/node_modules/**', 'dist/**']
};
