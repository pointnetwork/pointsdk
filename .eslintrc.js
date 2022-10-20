module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
        'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
        'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended' // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    ignorePatterns: ['.eslintrc.js'],
    env: {
        es6: true,
        browser: true
    },
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        // project: 'tsconfig.json',
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        },
        project: './tsconfig.json'
    },
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    settings: {
        react: {
            version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
        }
    },
    rules: {
        // 'react/prop-types': 0, // no requiring of prop types
        'react/display-name': 0, // allow anonymous components
        strict: [2, 'safe'],
        'no-debugger': 'error',
        'brace-style': ['error', '1tbs', {allowSingleLine: true}],
        'keyword-spacing': ['error'],
        'comma-spacing': 'error',
        'object-curly-spacing': ['error', 'never'],
        'object-curly-newline': ['error', {multiline: true}],
        'array-bracket-spacing': ['error', 'never'],
        'spaced-comment': [2, 'always'],
        'vars-on-top': 0, // Disable: all 'var' declarations must be at the top of the function scope
        'no-undef': 0,
        'no-undefined': 0,
        'comma-dangle': ['error', 'never'],
        quotes: ['error', 'single', {allowTemplateLiterals: true}],
        semi: ['error', 'always'],
        'guard-for-in': 0, // allow iterating with for..in without checking for Object.hasOwnProperty
        'no-eval': 2,
        'no-with': 2,
        'valid-typeof': 2,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
        'no-continue': 1,
        'no-unreachable': 'error',
        'no-unused-expressions': 'error',
        'no-duplicate-imports': 'error',
        'no-magic-numbers': 0,
        'no-inner-declarations': 0,
        'no-constant-condition': 0,
        'no-empty-function': 0,
        'arrow-body-style': ['error', 'as-needed'],
        'max-len': [
            'warn',
            {
                code: 100,
                ignoreStrings: true,
                ignoreRegExpLiterals: true,
                ignoreTemplateLiterals: true,
                tabWidth: 4,
                ignoreComments: true
            }
        ],
        'react/prefer-es6-class': 1,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-use-before-define': 0,
        '@typescript-eslint/prefer-regexp-exec': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/restrict-plus-operands': 0,
        '@typescript-eslint/no-extra-semi': 0,
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/ban-ts-comment': 0,
        semi: ['error', 'always'],
        'linebreak-style': ['error', 'unix'],
        curly: ['error', 'multi-line'],
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
                MemberExpression: 1,
                ArrayExpression: 1,
                ObjectExpression: 1,
                VariableDeclarator: 1,
                CallExpression: {arguments: 1},
                offsetTernaryExpressions: true
            }
        ],
        'space-in-parens': ['error', 'never'],
        eqeqeq: ['error', 'always', {null: 'ignore'}],
        'prefer-const': ['error', {destructuring: 'all', ignoreReadBeforeAssign: false}],
        'no-multiple-empty-lines': ['warn', {max: 1, maxEOF: 0}]
    }
};
