// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
    moduleNameMapper: {
        'pointsdk/(.*)': '<rootDir>/src/$1',
        '\\.(css|less|scss|sss|styl)$': '<rootDir>/node_modules/jest-css-modules',
    },
    roots: ['<rootDir>/src'],
    testPathIgnorePatterns: ['/node_modules/', 'stories.tsx'],
    transform: {
        '\\.tsx?$': 'ts-jest',
        '\\.(png|jpg|jpeg|svg)$': '<rootDir>/tests/transformers/image.js',
    },
    setupFiles: [
        'jest-webextension-mock'
    ]
};
