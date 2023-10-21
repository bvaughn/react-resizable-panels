/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  prettierPath: null,
  testEnvironmentOptions: {
    customExportConditions: ["development"],
  },
  testMatch: ["**/*.test.{ts,tsx}"],
};
