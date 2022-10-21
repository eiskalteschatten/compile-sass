module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node-single-context',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  coverageDirectory: './test-coverage'
};
