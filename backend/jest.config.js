module.exports = {
  rootDir: '../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^uuid$': 'uuid',
  },
  transformIgnorePatterns: ['node_modules/(?!uuid)'],
  testMatch: ['<rootDir>/backend/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/backend/tests/setupEnv.ts'],
  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest',
  },
};
