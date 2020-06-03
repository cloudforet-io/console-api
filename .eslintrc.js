module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        "plugin:@typescript-eslint/eslint-recommended",
        "prettier/@typescript-eslint",
    ],
    parserOptions: {
        parser: 'typescript-eslint',
        plugins: ['babel'],
        ecmaVersion: 2018,
        sourceType: 'module',
        project: "tsconfig.json",

    },
    plugins: [
        'html',
        'standard',
        "@typescript-eslint"
    ],
    env: {
        browser: true,
        node: true
    },
    globals: {
    },
    rules: {
        "indent": ["error", 4, {
            "ObjectExpression": 1,
            "flatTernaryExpressions": true,
            "ignoreComments": true,
            "ArrayExpression": 1
        }],
        'comma-dangle': ['error', {
            'arrays': 'never',
            'objects': 'never',
            'imports': 'never',
            'exports': 'never',
            'functions': 'never'
        }],
        "no-irregular-whitespace": ["error", {"skipComments": true}],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        'no-empty': 'error',
        'no-duplicate-imports': 'error',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        "semi": ["error", "always"],
        'vue/max-attributes-per-line': ['off', {
            'singleline': 1,
            'multiline': {
                'max': 1,
                'allowFirstLine': false
            }
        }],
    }
}
