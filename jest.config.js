module.exports = {
  collectCoverageFrom: [
    'src/**.*.js',
    '!src/index.cjs.js',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  rootDir: __dirname,
  setupFilesAfterEnv: ['./test/setup.js'],
  testMatch: ['<rootDir>/test/**/*.spec.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
  },
};
