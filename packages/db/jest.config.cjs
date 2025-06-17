module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@saga-soa/config$': '<rootDir>/../config/src/index.ts',
    '^@saga-soa/config/(.*)$': '<rootDir>/../config/src/$1.ts',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@saga-soa/config)',
  ],
  testMatch: [
    '<rootDir>/src/**/*.test.ts'
  ],
}; 