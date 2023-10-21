/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  prettierPath: null,
  testEnvironmentOptions: {
    customExportConditions: ["development"],
  },
  testMatch: ["**/*.test.{ts,tsx}"],
};
